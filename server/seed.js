const mongoose = require('mongoose');
const Location = require('./models/Location');
const Item = require('./models/Item');
require('dotenv').config();

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tailtales_rpg', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

// Создание предметов
const createItems = async () => {
  const items = [
    {
      name: 'Палка',
      description: 'Обычная деревянная палка, может пригодиться для различных целей',
      type: 'resource',
      rarity: 'common',
      icon: '🦯',
      value: 1
    },
    {
      name: 'Ягоды',
      description: 'Свежие лесные ягоды, восстанавливают немного здоровья',
      type: 'consumable',
      rarity: 'common',
      icon: '🫐',
      value: 5
    },
    {
      name: 'Грибы',
      description: 'Съедобные лесные грибы, хороший источник питания',
      type: 'consumable',
      rarity: 'common',
      icon: '🍄',
      value: 8
    },
    {
      name: 'Камень',
      description: 'Твердый камень, может использоваться для крафта или строительства',
      type: 'resource',
      rarity: 'common',
      icon: '🪨',
      value: 3
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

// Создание локаций
const createLocations = async () => {
  // Получаем созданные предметы
  const stick = await Item.findOne({ name: 'Палка' });
  const berries = await Item.findOne({ name: 'Ягоды' });
  const mushrooms = await Item.findOne({ name: 'Грибы' });
  const stone = await Item.findOne({ name: 'Камень' });

  const locations = [
    {
      name: 'Лес',
      description: 'Темный и таинственный лес с высокими деревьями. Здесь можно найти различные ресурсы.',
      type: 'forest',
      coordinates: { x: 0, y: 0 },
      availableActions: [
        {
          name: 'Найти палку',
          description: 'Поискать подходящую палку среди упавших веток',
          experienceReward: 5,
          itemReward: stick._id,
          requiredLevel: 1
        },
        {
          name: 'Найти ягоды',
          description: 'Собрать спелые лесные ягоды',
          experienceReward: 3,
          itemReward: berries._id,
          requiredLevel: 1
        },
        {
          name: 'Найти грибы',
          description: 'Поискать съедобные грибы под деревьями',
          experienceReward: 4,
          itemReward: mushrooms._id,
          requiredLevel: 1
        }
      ],
      backgroundImage: '/images/forest.jpg'
    },
    {
      name: 'Деревня',
      description: 'Уютная деревня с дружелюбными жителями. Здесь можно отдохнуть и пополнить запасы.',
      type: 'village',
      coordinates: { x: 1, y: 0 },
      availableActions: [],
      backgroundImage: '/images/village.jpg'
    },
    {
      name: 'Болото',
      description: 'Мрачное болото с туманом. Здесь нужно быть осторожным, но можно найти редкие ресурсы.',
      type: 'swamp',
      coordinates: { x: 0, y: 1 },
      availableActions: [],
      backgroundImage: '/images/swamp.jpg'
    },
    {
      name: 'Пещера',
      description: 'Темная пещера в горах. Здесь можно найти ценные минералы и камни.',
      type: 'cave',
      coordinates: { x: -1, y: 0 },
      availableActions: [
        {
          name: 'Найти камень',
          description: 'Поискать подходящие камни в пещере',
          experienceReward: 6,
          itemReward: stone._id,
          requiredLevel: 1
        }
      ],
      backgroundImage: '/images/cave.jpg'
    }
  ];

  // Создаем локации
  const createdLocations = [];
  for (const locationData of locations) {
    const existingLocation = await Location.findOne({ name: locationData.name });
    if (!existingLocation) {
      const location = new Location(locationData);
      await location.save();
      createdLocations.push(location);
      console.log(`Created location: ${location.name}`);
    } else {
      createdLocations.push(existingLocation);
    }
  }

  // Устанавливаем связи между локациями
  const forest = createdLocations.find(l => l.name === 'Лес');
  const village = createdLocations.find(l => l.name === 'Деревня');
  const swamp = createdLocations.find(l => l.name === 'Болото');
  const cave = createdLocations.find(l => l.name === 'Пещера');

  // Лес связан с деревней (восток) и болотом (юг)
  forest.connectedLocations = [
    { location: village._id, direction: 'east' },
    { location: swamp._id, direction: 'south' }
  ];

  // Деревня связана с лесом (запад) и пещерой (запад)
  village.connectedLocations = [
    { location: forest._id, direction: 'west' },
    { location: cave._id, direction: 'west' }
  ];

  // Болото связано с лесом (север)
  swamp.connectedLocations = [
    { location: forest._id, direction: 'north' }
  ];

  // Пещера связана с деревней (восток)
  cave.connectedLocations = [
    { location: village._id, direction: 'east' }
  ];

  // Сохраняем обновленные локации
  await forest.save();
  await village.save();
  await swamp.save();
  await cave.save();

  console.log('Locations connected successfully');
};

// Основная функция
const seedDatabase = async () => {
  try {
    await createItems();
    await createLocations();
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Запуск заполнения
db.once('open', () => {
  console.log('Connected to MongoDB');
  seedDatabase();
});

