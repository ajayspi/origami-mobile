import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/useGameStore';
import { GAME_LEVELS } from '../data/gameLevels';

describe('useGameStore', () => {
  beforeEach(() => {
    useGameStore.getState().resetRun();
  });

  it('initializes with Level 1 active, aerospace-02 kit, and idle flightState', () => {
    const state = useGameStore.getState();
    expect(state.flightState).toBe('idle');
    expect(state.selectedKitId).toBe('aerospace-02');
    expect(state.activeLevelId).toBe('level-1');
    expect(state.distance).toBe(0);
    expect(state.starsCollected).toBe(0);
  });

  it('transitions flight state through launch and touchdown unlocking next level', () => {
    const store = useGameStore.getState();
    store.setFlightState('aiming');
    expect(useGameStore.getState().flightState).toBe('aiming');
    store.setFlightState('flying');
    expect(useGameStore.getState().flightState).toBe('flying');
    store.updateTelemetry(650, 12, 18.5);
    expect(useGameStore.getState().distance).toBe(650);
    store.touchdown();
    expect(useGameStore.getState().flightState).toBe('landed');
    // Level 1 goal is 500m; reaching 650m unlocks Level 2
    expect(useGameStore.getState().unlockedLevels).toContain('level-2');
  });

  it('deducts stars on upgrade purchase', () => {
    useGameStore.setState({ totalStars: 50, upgrades: { lift: 1, drag: 1, impulse: 1, thermalMagnet: 1 } });
    const success = useGameStore.getState().spendStarsOnUpgrade('lift', 20);
    expect(success).toBe(true);
    expect(useGameStore.getState().totalStars).toBe(30);
    expect(useGameStore.getState().upgrades.lift).toBe(2);
  });

  it('triggers and tracks active aerobatic stunt', () => {
    const store = useGameStore.getState();
    store.triggerStunt('roll');
    expect(useGameStore.getState().activeStunt).toBe('roll');
  });
});
