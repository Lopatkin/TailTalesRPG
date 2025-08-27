const express = require('express');
const router = express.Router();

const Message = require('../models/Message');

// Получить последние сообщения по локации
router.get('/location/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const messages = await Message
      .find({ location: locationId })
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

module.exports = router;


