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

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/players', require('./routes/players'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/items', require('./routes/items'));

// Socket.io обработка
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Присоединение к чату локации
  socket.on('join-location', async (data) => {
    const { locationId, playerId } = data;
    socket.join(`location-${locationId}`);
    console.log(`Player ${playerId} joined location ${locationId}`);
  });

  // Отправка сообщения в чат
  socket.on('send-message', async (data) => {
    const { locationId, playerId, message, playerName } = data;
    io.to(`location-${locationId}`).emit('new-message', {
      playerId,
      playerName,
      message,
      timestamp: new Date()
    });
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
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

