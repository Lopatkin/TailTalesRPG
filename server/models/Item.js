const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['resource', 'weapon', 'armor', 'consumable', 'quest'],
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  stackable: {
    type: Boolean,
    default: true
  },
  maxStack: {
    type: Number,
    default: 99
  },
  icon: String,
  value: {
    type: Number,
    default: 0
  },
  effects: [{
    stat: String,
    value: Number,
    duration: Number
  }]
});

module.exports = mongoose.model('Item', itemSchema);

