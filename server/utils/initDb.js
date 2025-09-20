const mongoose = require('mongoose');
const Item = require('./models/Item');
require('dotenv').config();
console.log("MONGODB_URI:", process.env.MONGODB_URI);

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

const createItems = async () => {
  console.log('Создание предметов...');
  
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

<<<<<<< HEAD
const initDatabase = async () => {
  try {
    console.log('🚀 Инициализация базы данных TailTales RPG...\n');
    
    await createItems();
    
    console.log('\n🎉 База данных успешно инициализирована!');
    console.log(`📦 Создано предметов: ${await Item.countDocuments()}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error);
    process.exit(1);
  }
=======
const createLocations = async (items) => {
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
        { name: 'Найти палку', description: 'Поискать подходящую палку среди упавших веток', experienceReward: 5, itemReward: stick?._id, requiredLevel: 1 },
        { name: 'Найти ягоды', description: 'Собрать спелые лесные ягоды', experienceReward: 3, itemReward: berries?._id, requiredLevel: 1 },
        { name: 'Найти грибы', description: 'Поискать съедобные грибы под деревьями', experienceReward: 4, itemReward: mushrooms?._id, requiredLevel: 1 }
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
        { name: 'Найти камень', description: 'Поискать подходящие камни в пещере', experienceReward: 6, itemReward: stone?._id, requiredLevel: 1 }
      ],
      backgroundImage: '/images/cave.jpg'
    },
    {
      name: 'Дом',
      description: 'Уютный дом игрока. Здесь можно отдохнуть и поговорить с самим собой.',
      type: 'house',
      coordinates: { x: 2, y: 0 }, // Справа от Деревни
      availableActions: [],
      backgroundImage: '/images/house.jpg'
    }
  ];

  const createdLocations = [];
  for (const locationData of locations) {
    const existingLocation = await Location.findOne({ name: locationData.name });
    if (!existingLocation) {
      const location = new Location(locationData);
      await location.save();
      createdLocations.push(location);
    } else {
      createdLocations.push(existingLocation);
    }
  }

  const forest = createdLocations.find(l => l.name === 'Лес');
  const village = createdLocations.find(l => l.name === 'Деревня');
  const swamp = createdLocations.find(l => l.name === 'Болото');
  const cave = createdLocations.find(l => l.name === 'Пещера');
  const house = createdLocations.find(l => l.name === 'Дом');

  if (forest && village && swamp && cave) {
    forest.connectedLocations = [
      { location: village._id, direction: 'east' },
      { location: swamp._id, direction: 'south' }
    ];
    village.connectedLocations = [
      { location: forest._id, direction: 'west' },
      { location: cave._id, direction: 'west' }
    ];
    swamp.connectedLocations = [ { location: forest._id, direction: 'north' } ];
    cave.connectedLocations = [ { location: village._id, direction: 'east' } ];

    await forest.save();
    await village.save();
    await swamp.save();
    await cave.save();
  }

  // Добавляем связь между Деревней и Домом
  if (village && house) {
    village.connectedLocations.push({ location: house._id, direction: 'east' });
    house.connectedLocations = [{ location: village._id, direction: 'west' }];
    
    await village.save();
    await house.save();
  }

  return createdLocations;
>>>>>>> 828c01af92d200df38108a7d47f905449aab6959
};

db.once('open', () => {
  console.log('📡 Подключение к MongoDB установлено');
  initDatabase();
});

db.on('error', (error) => {
  console.error('❌ Ошибка подключения к MongoDB:', error);
  process.exit(1);
});