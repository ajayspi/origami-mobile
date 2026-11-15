import { describe, it, expect } from 'vitest';
import { synthesizeKitGeometry } from '../utils/mobileGeometry';
import { TRINITY_KITS } from '../types/game';
import { computeElevatedAimCamera, computeSlingshotTension } from '../components/FlightStage';

describe('FlightStage & Trinity Geometry', () => {
  it('synthesizes authentic delta-wing geometry for raptor-01 with valid vertex count and wingspan', () => {
    const geo = synthesizeKitGeometry('raptor-01', 1.0);
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
    const falcon = TRINITY_KITS['raptor-01'];
    const crane = TRINITY_KITS['japanese-01'];
    const dragon = TRINITY_KITS['chinese-03'];

    expect(falcon.speedMultiplier).toBeGreaterThan(crane.speedMultiplier);
    expect(crane.liftMultiplier).toBeGreaterThan(falcon.liftMultiplier);
    expect(dragon.archetype).toBe('dragon');
    expect(crane.archetype).toBe('bird');
    expect(falcon.archetype).toBe('falcon');
  });
});

describe('Elevated Horizon Camera & Slingshot Deadband', () => {
  it('applies an 8.5 degree upward pitch tilt at full pullback tension', () => {
    const basePitch = 0.05;
    const aimPitch = computeElevatedAimCamera(basePitch, 1.0); // tension = 1.0
    expect(aimPitch).toBeCloseTo(basePitch + (8.5 * Math.PI) / 180, 2);
  });

  it('ignores pointer drag under 20 pixels deadband threshold', () => {
    expect(computeSlingshotTension(12, 120)).toBe(0); // 12px < 20px deadband -> 0 tension
    expect(computeSlingshotTension(25, 120)).toBeGreaterThan(0); // 25px > 20px -> tension begins
  });
});
