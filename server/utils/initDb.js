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
};

db.once('open', () => {
  console.log('📡 Подключение к MongoDB установлено');
  initDatabase();
});

db.on('error', (error) => {
  console.error('❌ Ошибка подключения к MongoDB:', error);
  process.exit(1);
});