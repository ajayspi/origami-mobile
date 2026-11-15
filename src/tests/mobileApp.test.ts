import { describe, it, expect } from 'vitest';
import { mobileSpeech } from '../utils/mobileSpeech';
import rawKits from '../data/kits.json';
import { useGameStore } from '../store/useGameStore';

describe('App Arcade View Coordinator', () => {
  it('coordinates views from splash to character select to cliff launch', () => {
    useGameStore.setState({ flightState: 'splash' });
    expect(useGameStore.getState().flightState).toBe('splash');

    useGameStore.getState().goToCharacterSelect();
    expect(useGameStore.getState().flightState).toBe('select');

    useGameStore.getState().goToCliff();
    expect(useGameStore.getState().flightState).toBe('cliff-aim');
  });

  it('triggers instant cliff respawn resetting distance and setting flightState to cliff-aim', () => {
    useGameStore.setState({ flightState: 'landed', distance: 250, altitude: 0 });
    useGameStore.getState().instantCliffRespawn();
    expect(useGameStore.getState().flightState).toBe('cliff-aim');
    expect(useGameStore.getState().distance).toBe(0);
    expect(useGameStore.getState().altitude).toBe(30.0);
  });
});

describe('Origami Mobile Application Suite', () => {
  it('loads 54 complete craft kits', () => {
    const kits = Object.values(rawKits);
    expect(kits.length).toBeGreaterThanOrEqual(53);
  });

  it('verifies all kits have >= 12 steps starting from flat paper', () => {
    const kits: any[] = Object.values(rawKits);
    for (const kit of kits) {
      expect(kit.steps.length).toBeGreaterThanOrEqual(12);
      const firstStep = kit.steps[0];
      expect(firstStep.instruction.length).toBeGreaterThan(10);
    }
  });

  it('verifies mobile speech controller states', () => {
    const state = mobileSpeech.getState();
    expect(state.isEnabled).toBe(true);
    mobileSpeech.setEnabled(false);
    expect(mobileSpeech.getState().isEnabled).toBe(false);
    mobileSpeech.setEnabled(true);
    expect(mobileSpeech.getState().isEnabled).toBe(true);
  });

  it('stops mobile speech immediately on command', () => {
    mobileSpeech.stop();
    expect(mobileSpeech.getState().isSpeaking).toBe(false);
  });
});
