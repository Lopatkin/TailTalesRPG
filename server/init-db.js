const mongoose = require('mongoose');
const Location = require('./models/Location');
const Item = require('./models/Item');
require('dotenv').config();
console.log("MONGODB_URI:", process.env.MONGODB_URI);

// Подключение к MongoDB
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ Переменная окружения MONGODB_URI не задана. Укажите строку подключения в .env');
  process.exit(1);
}
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

// Создание предметов
const createItems = async () => {
  console.log('Создание предметов...');
  
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

  const createdItems = [];
  for (const itemData of items) {
    const existingItem = await Item.findOne({ name: itemData.name });
    if (!existingItem) {
      const item = new Item(itemData);
      await item.save();
      createdItems.push(item);
      console.log(`✅ Создан предмет: ${item.name}`);
    } else {
      createdItems.push(existingItem);
      console.log(`ℹ️ Предмет уже существует: ${existingItem.name}`);
    }
  }
  
  return createdItems;
};

// Создание локаций
const createLocations = async (items) => {
  console.log('\nСоздание локаций...');
  
  const stick = items.find(item => item.name === 'Палка');
  const berries = items.find(item => item.name === 'Ягоды');
  const mushrooms = items.find(item => item.name === 'Грибы');
  const stone = items.find(item => item.name === 'Камень');

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
      console.log(`✅ Создана локация: ${location.name}`);
    } else {
      createdLocations.push(existingLocation);
      console.log(`ℹ️ Локация уже существует: ${existingLocation.name}`);
    }
  }

  // Устанавливаем связи между локациями
  console.log('\nУстановка связей между локациями...');
  
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

  console.log('✅ Связи между локациями установлены');
  
  return createdLocations;
};

// Основная функция
const initDatabase = async () => {
  try {
    console.log('🚀 Инициализация базы данных TailTales RPG...\n');
    
    await createItems();
    const locations = await createLocations();
    
    console.log('\n🎉 База данных успешно инициализирована!');
    console.log(`📦 Создано предметов: ${await Item.countDocuments()}`);
    console.log(`🗺️ Создано локаций: ${await Location.countDocuments()}`);
    
    console.log('\n📍 Доступные локации:');
    locations.forEach(location => {
      console.log(`  - ${location.name} (${location.type})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error);
    process.exit(1);
  }
};

// Запуск инициализации
db.once('open', () => {
  console.log('📡 Подключение к MongoDB установлено');
  initDatabase();
});

db.on('error', (error) => {
  console.error('❌ Ошибка подключения к MongoDB:', error);
  process.exit(1);
});


