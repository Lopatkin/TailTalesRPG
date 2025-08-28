const express = require('express');
const router = express.Router();

const Message = require('../models/Message');

// Получить последние сообщения по локации
router.get('/location/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const before = req.query.before ? new Date(req.query.before) : null;

    const query = { location: locationId };
    if (before) {
      query.createdAt = { $lt: before };
    }

    const messages = await Message
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    // Возвращаем в прямом порядке (от старых к новым)
    res.json(messages.reverse());
  } catch (err) {
    console.error('GET /messages/location error', err);
    res.status(500).json({ message: 'Failed to load messages' });
  }
});

// Создать сообщение (fallback без сокета)
router.post('/', async (req, res) => {
  try {
    const { locationId, playerId, playerName, playerAvatar, text } = req.body;
    if (!locationId || !playerId || !text) {
      return res.status(400).json({ message: 'locationId, playerId и text обязательны' });
    }
    // Санитизация текста (простая)
    const clean = String(text)
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 500);
    if (!clean) return res.status(400).json({ message: 'Пустое сообщение' });
    const created = await Message.create({
      location: locationId,
      player: playerId,
      playerName: playerName || 'Игрок',
      playerAvatar: playerAvatar || '',
      text: clean
    });
    res.status(201).json({
      _id: created._id,
      locationId: created.location,
      playerId: created.player,
      playerName: created.playerName,
      playerAvatar: created.playerAvatar,
      message: created.text,
      timestamp: created.createdAt
    });
  } catch (err) {
    console.error('POST /messages error', err);
    res.status(500).json({ message: 'Failed to create message' });
  }
});

module.exports = router;


