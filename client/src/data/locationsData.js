const locationsData = [
  {
    _id: 'location_forest',
    name: 'Лес',
    description: 'Темный и таинственный лес с высокими деревьями. Здесь можно найти различные ресурсы.',
    type: 'forest',
    coordinates: { x: 0, y: 0 },
    availableActions: [
      {
        name: 'Найти палку',
        description: 'Поискать подходящую палку среди упавших веток',
        experienceReward: 5,
        itemReward: 'item_stick',
        requiredLevel: 1
      },
      {
        name: 'Найти ягоды',
        description: 'Собрать спелые лесные ягоды',
        experienceReward: 3,
        itemReward: 'item_berries',
        requiredLevel: 1
      },
      {
        name: 'Найти грибы',
        description: 'Поискать съедобные грибы под деревьями',
        experienceReward: 4,
        itemReward: 'item_mushrooms',
        requiredLevel: 1
      }
    ],
    backgroundImage: '/images/forest.jpg',
    connectedLocations: [
      { location: 'location_village', direction: 'east' },
      { location: 'location_swamp', direction: 'south' }
    ]
  },
  {
    _id: 'location_village',
    name: 'Деревня',
    description: 'Уютная деревня с дружелюбными жителями. Здесь можно отдохнуть и пополнить запасы.',
    type: 'village',
    coordinates: { x: 1, y: 0 },
    availableActions: [],
    backgroundImage: '/images/village.jpg',
    connectedLocations: [
      { location: 'location_forest', direction: 'west' },
      { location: 'location_cave', direction: 'west' }
    ]
  },
  {
    _id: 'location_swamp',
    name: 'Болото',
    description: 'Мрачное болото с туманом. Здесь нужно быть осторожным, но можно найти редкие ресурсы.',
    type: 'swamp',
    coordinates: { x: 0, y: 1 },
    availableActions: [],
    backgroundImage: '/images/swamp.jpg',
    connectedLocations: [
      { location: 'location_forest', direction: 'north' }
    ]
  },
  {
    _id: 'location_cave',
    name: 'Пещера',
    description: 'Темная пещера в горах. Здесь можно найти ценные минералы и камни.',
    type: 'cave',
    coordinates: { x: -1, y: 0 },
    availableActions: [
      {
        name: 'Найти камень',
        description: 'Поискать подходящие камни в пещере',
        experienceReward: 6,
        itemReward: 'item_stone',
        requiredLevel: 1
      }
    ],
    backgroundImage: '/images/cave.jpg',
    connectedLocations: [
      { location: 'location_village', direction: 'east' }
    ]
  }
];

export default locationsData;