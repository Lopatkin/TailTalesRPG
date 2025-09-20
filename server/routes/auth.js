const express = require('express');
const router = express.Router();

const Player = require('../models/Player');
const Location = require('../models/Location');

// POST /api/auth/telegram — аутентификация/регистрация через Telegram
router.post('/telegram', async (req, res) => {
  try {
    const { telegramId, username, firstName, lastName, avatar } = req.body || {};
    if (!telegramId || !username || !firstName) {
      return res.status(400).json({ message: 'Некорректные данные Telegram' });
    }

    let player = await Player.findOne({ telegramId });

    if (!player) {
      player = new Player({
        telegramId,
        username,
        firstName,
        lastName: lastName || '',
        avatar: avatar || '',
      });

      // Если есть стартовая локация — установим её
      const firstLocation = await Location.findOne({});
      if (firstLocation) {
        player.currentLocation = firstLocation._id;
      }

      // Создаем персональный дом для игрока
      const houseLocation = new Location({
        name: `Дом ${firstName}`,
        description: `Уютный дом игрока ${firstName}. Здесь можно отдохнуть и поговорить с самим собой.`,
        type: 'house',
        coordinates: { x: 2, y: 2 }, // Размещаем дом в отдельном месте на карте
        availableActions: [],
        backgroundImage: '/images/house.jpg',
        owner: player._id
      });
      await houseLocation.save();
      
      // Привязываем дом к игроку
      player.houseLocation = houseLocation._id;
      await player.save();
    } else {
      // Обновим базовые поля, если изменились
      player.username = username;
      player.firstName = firstName;
      if (lastName !== undefined) player.lastName = lastName;
      if (avatar !== undefined) player.avatar = avatar;
      await player.save();
    }

    return res.json({ player });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ message: 'Ошибка аутентификации' });
  }
});

// GET /api/auth/me?telegramId=... — получить данные игрока
router.get('/me', async (req, res) => {
  try {
    const { telegramId } = req.query;
    if (!telegramId) {
      return res.status(400).json({ message: 'telegramId обязателен' });
    }

    const player = await Player.findOne({ telegramId }).populate({
      path: 'currentLocation',
    }).populate({
      path: 'houseLocation',
    });

    if (!player) {
      return res.status(404).json({ message: 'Игрок не найден' });
    }

    return res.json({ player });
  } catch (error) {
    console.error('Fetch me error:', error);
    return res.status(500).json({ message: 'Ошибка получения данных игрока' });
  }
});

module.exports = router;


