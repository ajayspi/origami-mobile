import { describe, it, expect } from 'vitest';
import { generateCanyonTrack, getWeatherLighting, updateDynamicObstacles } from '../utils/canyonWorld';
import { GAME_LEVELS } from '../data/gameLevels';

describe('canyonWorld', () => {
  it('generates canyon track matching level goal distance and obstacles', () => {
    const level2 = GAME_LEVELS.find(l => l.id === 'level-2')!;
    const track = generateCanyonTrack(level2);
    expect(track.segments.length).toBeGreaterThanOrEqual(10); // 1000m / 100m = 10 segments
    expect(track.obstacles.some(o => o.id.startsWith('windmill'))).toBe(true);
    expect(track.obstacles.some(o => o.type === 'thermal')).toBe(true);
    expect(track.obstacles.some(o => o.type === 'star')).toBe(true);
  });

  it('interpolates weather lighting across morning, sunset, and night', () => {
    const morning = getWeatherLighting(300);
    expect(morning.timeOfDay).toBe('morning');
    expect(morning.skyColor).toBe('#a5c9eb');

    const sunset = getWeatherLighting(1400);
    expect(sunset.timeOfDay).toBe('sunset');
    expect(sunset.skyColor).toBe('#e28a52');

    const night = getWeatherLighting(2400);
    expect(night.timeOfDay).toBe('night');
    expect(night.skyColor).toBe('#0f1423');
  });

  it('updates dynamic obstacles (windmill rotation, lantern oscillation, geyser eruptions)', () => {
    const level3 = GAME_LEVELS.find(l => l.id === 'level-3')!;
    const track = generateCanyonTrack(level3);
    expect(() => updateDynamicObstacles(track, 1.5)).not.toThrow();
  });
});
