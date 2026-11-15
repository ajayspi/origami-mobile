import { describe, it, expect } from 'vitest';
import { synthesizeKitGeometry } from '../utils/mobileGeometry';
import * as THREE from 'three';

describe('Peregrine Falcon Geometry Synthesis', () => {
  it('synthesizes valid BufferGeometry for raptor-01', () => {
    const geo = synthesizeKitGeometry('raptor-01', 1.0);
    expect(geo).toBeInstanceOf(THREE.BufferGeometry);
    const pos = geo.getAttribute('position');
    expect(pos).toBeDefined();
    // Falcon model has detailed swept delta wings, beak crimp, and tail notch (> 60 vertices)
    expect(pos.count).toBeGreaterThan(60);
    expect(geo.getAttribute('normal')).toBeDefined();
    expect(geo.userData.modelType).toBe('raptor-01');
  });
});
