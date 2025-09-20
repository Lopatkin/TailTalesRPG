const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['forest', 'village', 'swamp', 'cave', 'house'],
    required: true
  },
  coordinates: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  connectedLocations: [{
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    },
    direction: {
      type: String,
      enum: ['north', 'south', 'east', 'west'],
      required: true
    }
  }],
  availableActions: [{
    name: String,
    description: String,
    experienceReward: Number,
    itemReward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    },
    requiredLevel: {
      type: Number,
      default: 1
    }
  }],
  backgroundImage: String,
  isUnlocked: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    default: null
  }
});

module.exports = mongoose.model('Location', locationSchema);

