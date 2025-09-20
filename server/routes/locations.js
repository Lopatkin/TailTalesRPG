const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const Player = require('../models/Player');

// Получение всех локаций
router.get('/', async (req, res) => {
  try {
    const { playerId } = req.query;
    let locations = await Location.find({ type: { $ne: 'house' } }).select('-__v');
    
    // Если указан playerId, добавляем его персональный дом
    if (playerId) {
      const player = await Player.findById(playerId).populate('houseLocation');
      if (player && player.houseLocation) {
        locations.push(player.houseLocation);
      }
    }
    
    res.json({ success: true, locations });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Failed to get locations' });
  }
});

// Получение конкретной локации
router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('connectedLocations.location')
      .populate('availableActions.itemReward');
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json({ success: true, location });
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ error: 'Failed to get location' });
  }
});

// Перемещение игрока в новую локацию
router.post('/:id/move', async (req, res) => {
  try {
    const { playerId } = req.body;
    const locationId = req.params.id;
    
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    // Проверяем, связана ли новая локация с текущей
    const currentLocation = await Location.findById(player.currentLocation);
    if (currentLocation) {
      // Исключение для персонального дома - игрок всегда может попасть в свой дом
      const isOwnHouse = location.type === 'house' && location.owner && location.owner.toString() === playerId;
      const isConnected = currentLocation.connectedLocations.some(
        conn => conn.location.toString() === locationId
      );
      
      if (!isConnected && !isOwnHouse) {
        return res.status(400).json({ error: 'Location not accessible from current position' });
      }
    }
    
    player.currentLocation = locationId;
    await player.save();
    
    res.json({ 
      success: true, 
      message: `Moved to ${location.name}`,
      newLocation: location
    });
  } catch (error) {
    console.error('Move error:', error);
    res.status(500).json({ error: 'Failed to move player' });
  }
});

// Выполнение действия в локации
router.post('/:id/action', async (req, res) => {
  try {
    const { playerId, actionName } = req.body;
    const locationId = req.params.id;
    
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    // Проверяем, находится ли игрок в этой локации
    if (player.currentLocation.toString() !== locationId) {
      return res.status(400).json({ error: 'Player not in this location' });
    }
    
    // Ищем действие
    const action = location.availableActions.find(a => a.name === actionName);
    if (!action) {
      return res.status(400).json({ error: 'Action not available' });
    }
    
    // Проверяем уровень игрока
    if (player.level < action.requiredLevel) {
      return res.status(400).json({ error: 'Level too low for this action' });
    }
    
    // Выполняем действие
    if (action.experienceReward) {
      await player.addExperience(action.experienceReward);
    }
    
    if (action.itemReward) {
      await player.addItem(action.itemReward);
    }
    
    res.json({
      success: true,
      message: `Action "${actionName}" completed successfully`,
      experienceGained: action.experienceReward || 0,
      itemGained: action.itemReward ? true : false,
      newLevel: player.level,
      newExperience: player.experience
    });
  } catch (error) {
    console.error('Action error:', error);
    res.status(500).json({ error: 'Failed to perform action' });
  }
});

module.exports = router;

