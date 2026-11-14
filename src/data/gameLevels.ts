import { GameLevel } from '../types/game';

export const GAME_LEVELS: GameLevel[] = [
  {
    id: 'level-1',
    levelNumber: 1,
    name: 'Morning Breeze Valley',
    theme: 'Sunny canyon with soft morning mist and tutorial rings',
    goalDistance: 500,
    timeOfDay: 'morning',
    biome: 'canyon',
    windSpeed: 2.0,
    obstacleDensity: 'low',
    allowedObstacles: ['thermal', 'arch'],
    unlockedByDefault: true
  },
  {
    id: 'level-2',
    levelNumber: 2,
    name: 'Bamboo Whisper Forest',
    theme: 'Verdant bamboo grove with swaying wind chimes and natural slalom gates',
    goalDistance: 1000,
    timeOfDay: 'morning',
    biome: 'bamboo_forest',
    windSpeed: 3.5,
    obstacleDensity: 'medium',
    allowedObstacles: ['bamboo', 'windmill', 'lantern', 'thermal', 'arch'],
    unlockedByDefault: false
  },
  {
    id: 'level-3',
    levelNumber: 3,
    name: 'Sakura Blossom Falls',
    theme: 'Blush pink cherry blossom valley with vermilion Torii gates and steam geysers',
    goalDistance: 1500,
    timeOfDay: 'sunset',
    biome: 'sakura_valley',
    windSpeed: 4.2,
    obstacleDensity: 'medium',
    allowedObstacles: ['torii', 'geyser', 'lantern', 'thermal', 'arch'],
    unlockedByDefault: false
  },
  {
    id: 'level-4',
    levelNumber: 4,
    name: 'Alpine Glacial Crest',
    theme: 'Crystalline azure ice canyon with sharp icicle spires and arctic updrafts',
    goalDistance: 2000,
    timeOfDay: 'sunset',
    biome: 'alpine_glacier',
    windSpeed: 5.8,
    obstacleDensity: 'high',
    allowedObstacles: ['icicle', 'windmill', 'geyser', 'thermal', 'arch'],
    unlockedByDefault: false
  },
  {
    id: 'level-5',
    levelNumber: 5,
    name: 'Moonlit Pagoda Shrine',
    theme: 'Midnight indigo sky with glowing paper fireflies, Torii arches, and pagoda peaks',
    goalDistance: 2500,
    timeOfDay: 'night',
    biome: 'sakura_valley',
    windSpeed: 6.5,
    obstacleDensity: 'high',
    allowedObstacles: ['torii', 'windmill', 'lantern', 'geyser', 'thermal', 'arch'],
    unlockedByDefault: false
  },
  {
    id: 'level-endless',
    levelNumber: 6,
    name: 'The Infinite Horizon',
    theme: 'Endless procedurally generated canyon shifting across all four biomes and weathers',
    goalDistance: 999999,
    timeOfDay: 'morning',
    biome: 'canyon',
    windSpeed: 4.0,
    obstacleDensity: 'medium',
    allowedObstacles: ['torii', 'icicle', 'bamboo', 'windmill', 'lantern', 'geyser', 'thermal', 'arch'],
    unlockedByDefault: false
  }
];
