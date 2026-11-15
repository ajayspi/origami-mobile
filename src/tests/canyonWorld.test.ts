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
    expect(morning.skyColor).toBe('#7dd3fc');

    const sunset = getWeatherLighting(1400);
    expect(sunset.timeOfDay).toBe('sunset');
    expect(sunset.skyColor).toBe('#ea580c');

    const night = getWeatherLighting(2400);
    expect(night.timeOfDay).toBe('night');
    expect(night.skyColor).toBe('#0f172a');

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

describe('30-Meter Cliff Precipice Generator', () => {
  it('generates cliff launchpad anchored at elevation y = 30m', () => {
    const track = generateCanyonTrack(GAME_LEVELS[0]);
    expect(track.cliffElevation).toBe(30.0);
    // Launchpad mesh must be positioned at y=30
    expect(track.launchpadMesh.position.y).toBeCloseTo(30.0, 1);
  });

  it('places a thermal updraft buffer directly in front of the cliff ledge', () => {
    const track = generateCanyonTrack(GAME_LEVELS[0]);
    const cliffUpdraft = track.obstacles.find(o => o.type === 'thermal' && o.center.z > -25 && o.center.z < -10);
    expect(cliffUpdraft).toBeDefined();
    expect(cliffUpdraft?.center.y).toBeGreaterThanOrEqual(25.0);
  });

  it('keeps total canyon vertex count under 4,500 vertices', () => {
    const track = generateCanyonTrack(GAME_LEVELS[0]);
    let totalVerts = 0;
    track.trackGroup.traverse(child => {
      if ((child as any).isMesh && (child as any).geometry) {
        totalVerts += (child as any).geometry.getAttribute('position').count;
      }
    });
    expect(totalVerts).toBeLessThan(4500);
  });
});
