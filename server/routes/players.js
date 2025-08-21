const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// Получение профиля игрока
router.get('/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate('currentLocation')
      .populate('inventory.item');
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json({ success: true, player });
  } catch (error) {
    console.error('Get player error:', error);
    res.status(500).json({ error: 'Failed to get player' });
  }
});

// Обновление профиля игрока
router.put('/:id', async (req, res) => {
  try {
    const { firstName, lastName, avatar } = req.body;
    
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    if (firstName) player.firstName = firstName;
    if (lastName) player.lastName = lastName;
    if (avatar) player.avatar = avatar;
    
    await player.save();
    
    res.json({ success: true, player });
  } catch (error) {
    console.error('Update player error:', error);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

// Получение инвентаря игрока
router.get('/:id/inventory', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate('inventory.item');
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json({ success: true, inventory: player.inventory });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Failed to get inventory' });
  }
});

// Использование предмета
router.post('/:id/use-item', async (req, res) => {
  try {
    const { itemId } = req.body;
    
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    const inventoryItem = player.inventory.find(
      inv => inv.item.toString() === itemId
    );
    
    if (!inventoryItem) {
      return res.status(400).json({ error: 'Item not in inventory' });
    }
    
    // Уменьшаем количество предметов
    if (inventoryItem.quantity > 1) {
      inventoryItem.quantity--;
    } else {
      player.inventory = player.inventory.filter(
        inv => inv.item.toString() !== itemId
      );
    }
    
    await player.save();
    
    res.json({ 
      success: true, 
      message: 'Item used successfully',
      remainingQuantity: inventoryItem.quantity > 1 ? inventoryItem.quantity - 1 : 0
    });
  } catch (error) {
    console.error('Use item error:', error);
    res.status(500).json({ error: 'Failed to use item' });
  }
});

module.exports = router;

