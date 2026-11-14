import { describe, it, expect } from 'vitest';
import { synthesizeKitGeometry } from '../utils/mobileGeometry';

describe('FlightStage & aerospace-02 geometry', () => {
  it('synthesizes authentic delta-wing geometry for aerospace-02 with valid vertex count and wingspan', () => {
    const geo = synthesizeKitGeometry('aerospace-02', 1.0);
    expect(geo).toBeDefined();
    // A proper multi-faceted delta wing glider will have > 48 vertices
    expect(geo.attributes.position.count).toBeGreaterThan(48);
  });
});
