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

    // Test biome-specific palettes
    const sakuraMorning = getWeatherLighting(300, 'sakura_valley');
    expect(sakuraMorning.skyColor).toBe('#fbcfe8');

    const glacierMorning = getWeatherLighting(300, 'alpine_glacier');
    expect(glacierMorning.skyColor).toBe('#bae6fd');

    const bambooMorning = getWeatherLighting(300, 'bamboo_forest');
    expect(bambooMorning.skyColor).toBe('#d1fae5');
  });

  it('generates biome-specific obstacles (Torii gates, icicle spires, bamboo clusters)', () => {
    const sakuraLevel = GAME_LEVELS.find(l => l.id === 'level-3')!;
    const sakuraTrack = generateCanyonTrack(sakuraLevel);
    expect(sakuraTrack.obstacles.some(o => o.id.startsWith('torii'))).toBe(true);
    expect(sakuraTrack.ambientParticles).toBeDefined();

    const glacierLevel = GAME_LEVELS.find(l => l.id === 'level-4')!;
    const glacierTrack = generateCanyonTrack(glacierLevel);
    expect(glacierTrack.obstacles.some(o => o.id.startsWith('icicle'))).toBe(true);

    const bambooLevel = GAME_LEVELS.find(l => l.id === 'level-2')!;
    const bambooTrack = generateCanyonTrack(bambooLevel);
    expect(bambooTrack.obstacles.some(o => o.id.startsWith('bamboo'))).toBe(true);
  });

  it('updates dynamic obstacles (windmill rotation, lantern oscillation, geyser eruptions)', () => {
    const level3 = GAME_LEVELS.find(l => l.id === 'level-3')!;
    const track = generateCanyonTrack(level3);
    expect(() => updateDynamicObstacles(track, 1.5)).not.toThrow();
  });
});
