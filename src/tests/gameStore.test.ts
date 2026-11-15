import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/useGameStore';
import { GAME_LEVELS } from '../data/gameLevels';
import { TRINITY_KITS } from '../types/game';

describe('GameStore Arcade Flow & 3-Creature Trinity', () => {
  beforeEach(() => {
    useGameStore.getState().resetRun();
  });

  it('starts in splash state by default', () => {
    expect(useGameStore.getState().flightState).toBe('splash');
  });

  it('transitions from splash -> select -> cliff-aim', () => {
    useGameStore.getState().goToCharacterSelect();
    expect(useGameStore.getState().flightState).toBe('select');

    useGameStore.getState().goToCliff();
    expect(useGameStore.getState().flightState).toBe('cliff-aim');
  });

  it('contains the curated 3-creature flying trinity', () => {
    const kitIds = Object.keys(TRINITY_KITS);
    expect(kitIds).toEqual(['japanese-01', 'chinese-03', 'raptor-01']);
    expect(TRINITY_KITS['raptor-01'].name).toBe('Peregrine Falcon');
    expect(TRINITY_KITS['raptor-01'].archetype).toBe('falcon');
    expect(TRINITY_KITS['raptor-01'].icon).toBe('🦅');
  });

  it('resets distance, speed and boost charges in instantCliffRespawn', () => {
    useGameStore.setState({ distance: 150, speed: 22, boostCharges: 0, flightState: 'landed' });
    useGameStore.getState().instantCliffRespawn();
    const state = useGameStore.getState();
    expect(state.flightState).toBe('cliff-aim');
    expect(state.distance).toBe(0);
    expect(state.speed).toBe(0);
    expect(state.boostCharges).toBe(3);
  });

  it('handles in-air power notifications, boost charges, and multi-star collection', () => {
    useGameStore.getState().addBoostCharges(2);
    expect(useGameStore.getState().boostCharges).toBe(5);

    useGameStore.getState().collectStars(25);
    expect(useGameStore.getState().starsCollected).toBe(25);

    useGameStore.getState().triggerPowerNotification('Air Whirlpool Catapult', '🌪️', '+SUPER SPEED BOOST');
    expect(useGameStore.getState().activePowerNotification?.name).toBe('Air Whirlpool Catapult');
    expect(useGameStore.getState().activePowerNotification?.icon).toBe('🌪️');
  });
});

describe('useGameStore legacy actions', () => {
  beforeEach(() => {
    useGameStore.getState().resetRun();
  });

  it('transitions flight state through launch and touchdown unlocking next level', () => {
    const store = useGameStore.getState();
    store.setFlightState('cliff-aim');
    expect(useGameStore.getState().flightState).toBe('cliff-aim');
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
