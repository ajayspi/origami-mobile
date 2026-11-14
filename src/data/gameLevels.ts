import { GameLevel } from '../types/game';

export const GAME_LEVELS: GameLevel[] = [
  {
    id: 'level-1',
    levelNumber: 1,
    name: 'Morning Breeze Valley',
    theme: 'Sunny canyon with soft morning mist and tutorial rings',
    goalDistance: 500,
    timeOfDay: 'morning',
    windSpeed: 2.0,
    obstacleDensity: 'low',
    allowedObstacles: ['thermal', 'arch'],
    unlockedByDefault: true
  },
  {
    id: 'level-2',
    levelNumber: 2,
    name: 'Windmill Gorge',
    theme: 'Towering cliffs with rotating paper windmills and swinging lanterns',
    goalDistance: 1000,
    timeOfDay: 'morning',
    windSpeed: 3.5,
    obstacleDensity: 'medium',
    allowedObstacles: ['windmill', 'lantern', 'thermal', 'arch'],
    unlockedByDefault: false
  },
  {
    id: 'level-3',
    levelNumber: 3,
    name: 'Lotus Falls & Steam Geysers',
    theme: 'Verdant river valley with explosive vertical steam geysers',
    goalDistance: 1500,
    timeOfDay: 'sunset',
    windSpeed: 4.2,
    obstacleDensity: 'medium',
    allowedObstacles: ['geyser', 'lantern', 'thermal', 'arch'],
    unlockedByDefault: false
  },
  {
    id: 'level-4',
    levelNumber: 4,
    name: 'Sunset Mesa & Storm Winds',
    theme: 'Golden sunset mesa with intense wind shear and narrow canyon slots',
    goalDistance: 2000,
    timeOfDay: 'sunset',
    windSpeed: 5.8,
    obstacleDensity: 'high',
    allowedObstacles: ['windmill', 'geyser', 'thermal', 'arch'],
    unlockedByDefault: false
  },
  {
    id: 'level-5',
    levelNumber: 5,
    name: 'Moonlit Shrine & Starlit Peaks',
    theme: 'Midnight indigo sky with glowing paper fireflies and pagoda roofs',
    goalDistance: 2500,
    timeOfDay: 'night',
    windSpeed: 6.5,
    obstacleDensity: 'high',
    allowedObstacles: ['windmill', 'lantern', 'geyser', 'thermal', 'arch'],
    unlockedByDefault: false
  },
  {
    id: 'level-endless',
    levelNumber: 6,
    name: 'The Infinite Horizon',
    theme: 'Endless procedurally generated canyon with dynamic weather transitions',
    goalDistance: 999999,
    timeOfDay: 'morning',
    windSpeed: 4.0,
    obstacleDensity: 'medium',
    allowedObstacles: ['windmill', 'lantern', 'geyser', 'thermal', 'arch'],
    unlockedByDefault: false
  }
];
