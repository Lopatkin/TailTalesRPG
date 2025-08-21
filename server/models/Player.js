const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: String,
  avatar: String,
  level: {
    type: Number,
    default: 1
  },
  experience: {
    type: Number,
    default: 0
  },
  currentLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    default: null
  },
  inventory: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  stats: {
    strength: { type: Number, default: 10 },
    agility: { type: Number, default: 10 },
    intelligence: { type: Number, default: 10 },
    vitality: { type: Number, default: 10 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

// Метод для добавления опыта
playerSchema.methods.addExperience = function(exp) {
  this.experience += exp;
  
  // Проверка повышения уровня (каждые 100 опыта)
  const newLevel = Math.floor(this.experience / 100) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
    // Увеличиваем характеристики при повышении уровня
    this.stats.strength += 2;
    this.stats.agility += 2;
    this.stats.intelligence += 2;
    this.stats.vitality += 2;
  }
  
  return this.save();
};

// Метод для добавления предмета в инвентарь
playerSchema.methods.addItem = function(itemId, quantity = 1) {
  const existingItem = this.inventory.find(inv => inv.item.toString() === itemId.toString());
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.inventory.push({ item: itemId, quantity });
  }
  
  return this.save();
};

module.exports = mongoose.model('Player', playerSchema);

