const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});


// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// MongoDB подключение
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Модели
const Player = require('./models/Player');
const Location = require('./models/Location');
const Item = require('./models/Item');
const Message = require('./models/Message');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/players', require('./routes/players'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/items', require('./routes/items'));
app.use('/api/messages', require('./routes/messages'));

// Одноразовая инициализация БД через HTTP (защита по токену)
app.post('/admin/init-db', async (req, res) => {
  try {
    const token = req.header('x-init-db-token') || (req.query && req.query.token);
    if (!process.env.INIT_DB_TOKEN || token !== process.env.INIT_DB_TOKEN) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { runInitDatabase } = require('./utils/initDb');
    const result = await runInitDatabase();
    return res.json({ ok: true, ...result });
  } catch (error) {
    console.error('Init DB via HTTP error:', error);
    return res.status(500).json({ ok: false, message: 'Init failed', error: String(error) });
  }
});

// Socket.io обработка
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  // Локальное хранилище участников по локациям
  if (!io.locationParticipants) {
    io.locationParticipants = new Map(); // key: locationId, value: Map(socketId -> {playerId,name,avatar})
  }
  // Лимитер сообщений: key playerId -> массив таймстемпов
  if (!io.messageRate) {
    io.messageRate = new Map();
  }

  // Простейшая очистка текста
  const sanitizeText = (text) => {
    if (typeof text !== 'string') return '';
    const noTags = text.replace(/<[^>]*>/g, '');
    const collapsed = noTags.replace(/\s+/g, ' ');
    return collapsed.trim().slice(0, 500);
  };

  // Присоединение к чату локации
  socket.on('join-location', async (data) => {
    const { locationId, playerId, playerName, playerAvatar } = data;
    socket.join(`location-${locationId}`);
    console.log(`Player ${playerId} joined location ${locationId}`);

    // Сохраняем участника
    const map = io.locationParticipants.get(locationId) || new Map();
    map.set(socket.id, { playerId, name: playerName || 'Игрок', avatar: playerAvatar || '' });
    io.locationParticipants.set(locationId, map);

    // Оповещаем комнату
    io.to(`location-${locationId}`).emit('participants-update', Array.from(map.values()));
  });

  // Отправка сообщения в чат
  socket.on('send-message', async (data) => {
    try {
      const { locationId, playerId, message, playerName, playerAvatar } = data;
      // Rate limit: не более 5 сообщений за 10 секунд
      const WINDOW_MS = 10 * 1000;
      const MAX_PER_WINDOW = 5;
      const now = Date.now();
      const key = playerId || socket.id;
      const arr = io.messageRate.get(key) || [];
      const recent = arr.filter(ts => now - ts < WINDOW_MS);
      if (recent.length >= MAX_PER_WINDOW) {
        socket.emit('rate-limit', { message: 'Слишком часто. Подождите немного.' });
        return;
      }
      recent.push(now);
      io.messageRate.set(key, recent);

      // Санитизация текста
      const clean = sanitizeText(message);
      if (!clean) return;
      // Сохраняем в БД
      const saved = await Message.create({
        location: locationId,
        player: playerId,
        playerName: playerName || 'Игрок',
        playerAvatar: playerAvatar || '',
        text: clean
      });

      // Рассылаем по комнате локации
      io.to(`location-${locationId}`).emit('new-message', {
        _id: saved._id,
        locationId,
        playerId,
        playerName: saved.playerName,
        playerAvatar: saved.playerAvatar,
        message: saved.text,
        timestamp: saved.createdAt
      });
    } catch (err) {
      console.error('send-message error:', err);
    }
  });

  // Перемещение игрока
  socket.on('player-move', async (data) => {
    const { playerId, newLocationId } = data;
    try {
      await Player.findByIdAndUpdate(playerId, { currentLocation: newLocationId });
      socket.leaveAll();
      socket.join(`location-${newLocationId}`);
      io.emit('player-location-updated', { playerId, newLocationId });
    } catch (error) {
      console.error('Error updating player location:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Удаляем из всех локаций, куда был добавлен
    for (const [locId, map] of io.locationParticipants.entries()) {
      if (map.delete(socket.id)) {
        io.to(`location-${locId}`).emit('participants-update', Array.from(map.values()));
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

