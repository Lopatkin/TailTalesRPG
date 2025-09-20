const mongoose = require('mongoose');
const Item = require('./models/Item');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

const createItems = async () => {
  const items = [
    {
      name: 'Палка',
      description: 'Обычная деревянная палка, может пригодиться для различных целей',
      type: 'resource',
      rarity: 'common',
      icon: '🦯',
      value: 1,
      _id: 'item_stick'
    },
    {
      name: 'Ягоды',
      description: 'Свежие лесные ягоды, восстанавливают немного здоровья',
      type: 'consumable',
      rarity: 'common',
      icon: '🫐',
      value: 5,
      _id: 'item_berries'
    },
    {
      name: 'Грибы',
      description: 'Съедобные лесные грибы, хороший источник питания',
      type: 'consumable',
      rarity: 'common',
      icon: '🍄',
      value: 8,
      _id: 'item_mushrooms'
    },
    {
      name: 'Камень',
      description: 'Твердый камень, может использоваться для крафта или строительства',
      type: 'resource',
      rarity: 'common',
      icon: '🪨',
      value: 3,
      _id: 'item_stone'
    }
  ];

  for (const itemData of items) {
    const existingItem = await Item.findOne({ name: itemData.name });
    if (!existingItem) {
      const item = new Item(itemData);
      await item.save();
      console.log(`Created item: ${item.name}`);
    }
  }
};

const seedDatabase = async () => {
  try {
    await createItems();
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

db.once('open', () => {
  console.log('Connected to MongoDB');
  seedDatabase();
});