const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// Получение всех предметов
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().select('-__v');
    res.json({ success: true, items });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Failed to get items' });
  }
});

// Получение конкретного предмета
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ success: true, item });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Failed to get item' });
  }
});

module.exports = router;



