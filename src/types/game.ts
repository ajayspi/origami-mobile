export type FlightState = 'idle' | 'aiming' | 'flying' | 'landed' | 'hangar';
export type TimeOfDay = 'morning' | 'sunset' | 'night';
export type PaperStock = 'washi' | 'gold_foil' | 'sakura' | 'indigo';

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
  windSpeed: number;     // m/s tailwind/crosswind
  obstacleDensity: 'low' | 'medium' | 'high';
  allowedObstacles: ('windmill' | 'lantern' | 'geyser' | 'thermal' | 'arch')[];
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

  // Actions
  setFlightState: (state: FlightState) => void;
  selectKit: (kitId: string) => void;
  selectLevel: (levelId: string) => void;
  updateTelemetry: (distance: number, altitude: number, speed: number) => void;
  collectStar: () => void;
  triggerThermal: () => void;
  touchdown: () => void;
  spendStarsOnUpgrade: (upgradeKey: keyof AircraftUpgrades, cost: number) => boolean;
  setPaperStock: (stock: PaperStock) => void;
  resetRun: () => void;
}
