export type FlightState = 'idle' | 'aiming' | 'flying' | 'landed' | 'hangar';
export type TimeOfDay = 'morning' | 'sunset' | 'night';
export type PaperStock = 'washi' | 'gold_foil' | 'sakura' | 'indigo';
export type BiomeType = 'canyon' | 'sakura_valley' | 'alpine_glacier' | 'bamboo_forest';
export type StuntType = 'roll' | 'loop' | null;

export interface KitFlightStats {
  kitId: string;
  name: string;
  archetype: 'jet' | 'bird' | 'dragon';
  icon: string;
  speedMultiplier: number;
  liftMultiplier: number;
  dragMultiplier: number;
  turnAgility: number;
  description: string;
}

export const TRINITY_KITS: Record<string, KitFlightStats> = {
  'aerospace-02': {
    kitId: 'aerospace-02',
    name: 'Falcon Dart',
    archetype: 'jet',
    icon: '✈️',
    speedMultiplier: 1.15,
    liftMultiplier: 0.95,
    dragMultiplier: 0.85,
    turnAgility: 1.25,
    description: 'Supersonic agility, razor-sharp rolls, and low parasite drag.'
  },
  'japanese-01': {
    kitId: 'japanese-01',
    name: 'Sacred Peace Crane',
    archetype: 'bird',
    icon: '🕊️',
    speedMultiplier: 0.88,
    liftMultiplier: 1.38,
    dragMultiplier: 0.75,
    turnAgility: 0.95,
    description: 'Majestic thermal soaring, wide diamond wingspan, and effortless lift.'
  },
  'chinese-03': {
    kitId: 'chinese-03',
    name: 'Celestial Dragon',
    archetype: 'dragon',
    icon: '🐉',
    speedMultiplier: 1.05,
    liftMultiplier: 1.10,
    dragMultiplier: 1.05,
    turnAgility: 1.10,
    description: 'Heavy dive momentum, serpentine tail undulation, and fiery wind defiance.'
  }
};

export interface AircraftUpgrades {
  lift: number;          // Level 1-5 (each +10% lift coefficient)
  drag: number;          // Level 1-5 (each -8% parasite drag)
  impulse: number;       // Level 1-5 (each +12% launch velocity)
  thermalMagnet: number; // Level 1-5 (expands thermal pull radius)
}

export interface GameLevel {
  id: string;
  levelNumber: number;
  name: string;
  theme: string;
  goalDistance: number;  // meters (500, 1000, 1500, 2000, 2500)
  timeOfDay: TimeOfDay;
  biome?: BiomeType;
  windSpeed: number;     // m/s tailwind/crosswind
  obstacleDensity: 'low' | 'medium' | 'high';
  allowedObstacles: ('windmill' | 'lantern' | 'geyser' | 'thermal' | 'arch' | 'torii' | 'icicle' | 'bamboo')[];
  unlockedByDefault: boolean;
}

export interface GameState {
  flightState: FlightState;
  selectedKitId: string; // Default: 'aerospace-02' (Falcon Dart)
  activeLevelId: string;
  distance: number;
  altitude: number;
  speed: number;
  thermalsCaught: number;
  starsCollected: number;
  totalStars: number;
  highScores: Record<string, number>;
  unlockedLevels: string[];
  upgrades: AircraftUpgrades;
  activePaperStock: PaperStock;
  activeStunt: StuntType;
  steerInput: number;
  boostCharges: number;
  isBoosting: boolean;
  gyroEnabled: boolean;

  // Actions
  setFlightState: (state: FlightState) => void;
  selectKit: (kitId: string) => void;
  selectLevel: (levelId: string) => void;
  setSteerInput: (val: number) => void;
  activateBoost: () => boolean;
  setGyroEnabled: (enabled: boolean) => void;
  toggleGyro: () => void;
  updateTelemetry: (distance: number, altitude: number, speed: number) => void;
  collectStar: () => void;
  triggerThermal: () => void;
  triggerStunt: (type: 'roll' | 'loop') => void;
  touchdown: () => void;
  spendStarsOnUpgrade: (upgradeKey: keyof AircraftUpgrades, cost: number) => boolean;
  setPaperStock: (stock: PaperStock) => void;
  resetRun: () => void;
}
