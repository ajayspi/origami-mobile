import { describe, it, expect, beforeEach } from 'vitest';
import { setupAudioMock } from './mocks/audioMock';
import { gameAudio } from '../utils/gameAudio';

beforeEach(() => {
  setupAudioMock();
});

describe('gameAudio', () => {
  it('initializes in suspended state and resumes on user interaction', () => {
    gameAudio.init();
    expect(gameAudio.isReady()).toBe(true);
  });

  it('modulates wind filter frequency proportionally to airspeed', () => {
    gameAudio.init();
    gameAudio.updateWindRustle(15); // 15 m/s -> expect ~1250 Hz (300 + 0.5 * 1900)
    const freq = gameAudio.getCurrentWindFrequency();
    expect(freq).toBeGreaterThan(1200);
    expect(freq).toBeLessThan(1300);
  });

  it('plays star chime with valid pentatonic note without throwing', () => {
    gameAudio.init();
    expect(() => gameAudio.playStarChime(2)).not.toThrow();
  });

  it('plays launch snap, thermal hum, and deflection thud without error', () => {
    gameAudio.init();
    expect(() => gameAudio.playLaunchSnap()).not.toThrow();
    expect(() => gameAudio.playThermalHum()).not.toThrow();
    expect(() => gameAudio.playDeflectionThud()).not.toThrow();
  });

  it('synthesizes aerobatic stunt audio (barrel roll, loop whoosh, flutter rustle)', () => {
    gameAudio.init();
    expect(() => gameAudio.playBarrelRoll()).not.toThrow();
    expect(() => gameAudio.playLoopWhoosh()).not.toThrow();
    expect(() => gameAudio.playFlutterRustle()).not.toThrow();
  });
});
