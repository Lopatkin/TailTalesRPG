const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  playerName: {
    type: String,
    required: true
  },
  playerAvatar: String,
  text: {
    type: String,
    required: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Индексы для ускорения выборок и пагинации по локации и игроку
messageSchema.index({ location: 1, createdAt: -1 });
messageSchema.index({ player: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);


