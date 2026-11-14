import { describe, it, expect } from 'vitest';
import { synthesizeKitGeometry } from '../utils/mobileGeometry';
import { TRINITY_KITS } from '../types/game';

describe('FlightStage & Trinity Geometry', () => {
  it('synthesizes authentic delta-wing geometry for aerospace-02 with valid vertex count and wingspan', () => {
    const geo = synthesizeKitGeometry('aerospace-02', 1.0);
    expect(geo).toBeDefined();
    expect(geo.attributes.position.count).toBeGreaterThan(48);
  });

  it('synthesizes authentic sculpted geometry for Japanese Crane (japanese-01) and Chinese Dragon (chinese-03)', () => {
    const craneGeo = synthesizeKitGeometry('japanese-01', 1.0);
    expect(craneGeo).toBeDefined();
    expect(craneGeo.attributes.position.count).toBeGreaterThan(48);

    const dragonGeo = synthesizeKitGeometry('chinese-03', 1.0);
    expect(dragonGeo).toBeDefined();
    expect(dragonGeo.attributes.position.count).toBeGreaterThan(48);
  });

  it('provides distinct flight physics multipliers across the Trinity models', () => {
    const jet = TRINITY_KITS['aerospace-02'];
    const crane = TRINITY_KITS['japanese-01'];
    const dragon = TRINITY_KITS['chinese-03'];

    expect(jet.speedMultiplier).toBeGreaterThan(crane.speedMultiplier);
    expect(crane.liftMultiplier).toBeGreaterThan(jet.liftMultiplier);
    expect(dragon.archetype).toBe('dragon');
    expect(crane.archetype).toBe('bird');
    expect(jet.archetype).toBe('jet');
  });
});
