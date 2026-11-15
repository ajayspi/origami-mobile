import { create } from 'zustand';
import { GameState, FlightState, PaperStock, AircraftUpgrades } from '../types/game';
import { GAME_LEVELS } from '../data/gameLevels';

const STORAGE_KEY_STARS = 'origami_game_stars';
const STORAGE_KEY_UPGRADES = 'origami_game_upgrades';
const STORAGE_KEY_UNLOCKED = 'origami_game_unlocked_levels';
const STORAGE_KEY_SCORES = 'origami_game_high_scores';

function getStoredStars(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEY_STARS);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function getStoredUpgrades(): AircraftUpgrades {
  try {
    const val = localStorage.getItem(STORAGE_KEY_UPGRADES);
    return val ? JSON.parse(val) : { lift: 1, drag: 1, impulse: 1, thermalMagnet: 1 };
  } catch {
    return { lift: 1, drag: 1, impulse: 1, thermalMagnet: 1 };
  }
}

function getStoredUnlockedLevels(): string[] {
  try {
    const val = localStorage.getItem(STORAGE_KEY_UNLOCKED);
    return val ? JSON.parse(val) : ['level-1'];
  } catch {
    return ['level-1'];
  }
}

function getStoredHighScores(): Record<string, number> {
  try {
    const val = localStorage.getItem(STORAGE_KEY_SCORES);
    return val ? JSON.parse(val) : {};
  } catch {
    return {};
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  flightState: 'idle',
  selectedKitId: 'aerospace-02',
  activeLevelId: 'level-1',
  distance: 0,
  altitude: 0,
  speed: 0,
  thermalsCaught: 0,
  starsCollected: 0,
  totalStars: getStoredStars(),
  highScores: getStoredHighScores(),
  unlockedLevels: getStoredUnlockedLevels(),
  upgrades: getStoredUpgrades(),
  activePaperStock: 'washi',
  activeStunt: null,
  steerInput: 0,
  boostCharges: 3,
  isBoosting: false,

  setFlightState: (flightState: FlightState) => set({ flightState }),

  selectKit: (selectedKitId: string) => set({ selectedKitId }),

  setSteerInput: (steerInput: number) => set({ steerInput }),

  activateBoost: () => {
    const { boostCharges, isBoosting, flightState } = get();
    if (flightState !== 'flying' || boostCharges <= 0 || isBoosting) {
      return false;
    }
    set({
      boostCharges: boostCharges - 1,
      isBoosting: true
    });
    setTimeout(() => {
      set({ isBoosting: false });
    }, 1200);
    return true;
  },

  selectLevel: (activeLevelId: string) => {
    const { unlockedLevels } = get();
    if (unlockedLevels.includes(activeLevelId)) {
      set({ activeLevelId });
    }
  },

  updateTelemetry: (distance: number, altitude: number, speed: number) => {
    set({
      distance: Math.max(get().distance, Math.round(distance)),
      altitude: Math.max(0, altitude),
      speed: Math.max(0, speed)
    });
  },

  collectStar: () => {
    const nextCollected = get().starsCollected + 1;
    const nextTotal = get().totalStars + 1;
    try {
      localStorage.setItem(STORAGE_KEY_STARS, String(nextTotal));
    } catch {}
    set({ starsCollected: nextCollected, totalStars: nextTotal });
  },

  triggerThermal: () => {
    set(state => ({ thermalsCaught: state.thermalsCaught + 1 }));
  },

  triggerStunt: (type: 'roll' | 'loop') => {
    set({ activeStunt: type });
    // Reset after stunt window
    setTimeout(() => {
      if (get().activeStunt === type) {
        set({ activeStunt: null });
      }
    }, type === 'roll' ? 700 : 1100);
  },

  touchdown: () => {
    const { activeLevelId, distance, highScores, unlockedLevels } = get();
    const currentBest = highScores[activeLevelId] || 0;
    const nextHighScores = {
      ...highScores,
      [activeLevelId]: Math.max(currentBest, distance)
    };

    const currentLevel = GAME_LEVELS.find(l => l.id === activeLevelId);
    let nextUnlocked = [...unlockedLevels];

    if (currentLevel && distance >= currentLevel.goalDistance) {
      const nextLevelIndex = GAME_LEVELS.findIndex(l => l.id === activeLevelId) + 1;
      if (nextLevelIndex < GAME_LEVELS.length) {
        const nextLevel = GAME_LEVELS[nextLevelIndex];
        if (!nextUnlocked.includes(nextLevel.id)) {
          nextUnlocked.push(nextLevel.id);
        }
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(nextHighScores));
      localStorage.setItem(STORAGE_KEY_UNLOCKED, JSON.stringify(nextUnlocked));
    } catch {}

    set({
      flightState: 'landed',
      highScores: nextHighScores,
      unlockedLevels: nextUnlocked
    });
  },

  spendStarsOnUpgrade: (upgradeKey: keyof AircraftUpgrades, cost: number) => {
    const { totalStars, upgrades } = get();
    if (totalStars < cost || upgrades[upgradeKey] >= 5) {
      return false;
    }

    const nextTotal = totalStars - cost;
    const nextUpgrades = {
      ...upgrades,
      [upgradeKey]: upgrades[upgradeKey] + 1
    };

    try {
      localStorage.setItem(STORAGE_KEY_STARS, String(nextTotal));
      localStorage.setItem(STORAGE_KEY_UPGRADES, JSON.stringify(nextUpgrades));
    } catch {}

    set({
      totalStars: nextTotal,
      upgrades: nextUpgrades
    });
    return true;
  },

  setPaperStock: (activePaperStock: PaperStock) => set({ activePaperStock }),

  resetRun: () => {
    set({
      flightState: 'idle',
      distance: 0,
      altitude: 0,
      speed: 0,
      thermalsCaught: 0,
      starsCollected: 0,
      steerInput: 0,
      boostCharges: 3,
      isBoosting: false
    });
  }
}));
