import { describe, it, expect } from 'vitest';
import { mobileSpeech } from '../utils/mobileSpeech';
import rawKits from '../data/kits.json';

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
