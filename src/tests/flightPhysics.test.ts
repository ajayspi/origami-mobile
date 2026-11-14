import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { computeAerodynamicStep, checkGlancingDeflection, FlightPhysicsState, ObstacleBounds } from '../utils/flightPhysics';

describe('flightPhysics', () => {
  it('computes positive lift during forward glide at moderate angle of attack', () => {
    const state: FlightPhysicsState = {
      position: new THREE.Vector3(0, 10, 0),
      velocity: new THREE.Vector3(0, 0, -15), // 15 m/s forward
      rotation: new THREE.Euler(0.12, 0, 0),   // ~7 deg pitch up
      pitch: 0.12,
      roll: 0,
      yaw: 0,
      isStalled: false,
      altitude: 10
    };
    const next = computeAerodynamicStep(state, { pitchInput: 0, rollInput: 0 }, 0.016, 1.0, 1.0);
    expect(next.velocity.y).toBeGreaterThan(-1.0); // Lift opposes gravity
    expect(next.isStalled).toBe(false);
  });

  it('triggers stall drop when pitch exceeds 18 degrees', () => {
    const state: FlightPhysicsState = {
      position: new THREE.Vector3(0, 10, 0),
      velocity: new THREE.Vector3(0, 0, -10),
      rotation: new THREE.Euler(0.35, 0, 0), // 20 deg pitch up (>18 deg ~ 0.314 rad)
      pitch: 0.35,
      roll: 0,
      yaw: 0,
      isStalled: false,
      altitude: 10
    };
    const next = computeAerodynamicStep(state, { pitchInput: 0, rollInput: 0 }, 0.016, 1.0, 1.0);
    expect(next.isStalled).toBe(true);
    expect(next.pitch).toBeLessThan(state.pitch); // Nose drops due to restoring torque
  });

  it('performs glancing deflection retaining forward momentum', () => {
    const vel = new THREE.Vector3(2.0, 0, -12.0); // Glancing canyon wall
    const normal = new THREE.Vector3(-1.0, 0, 0); // Wall facing plane
    const obstacles: ObstacleBounds[] = [{
      type: 'solid',
      center: new THREE.Vector3(1.5, 5, -20),
      radius: 2.0,
      normal
    }];
    const result = checkGlancingDeflection(new THREE.Vector3(0.5, 5, -20), vel, obstacles);
    expect(result.hasCollided).toBe(true);
    expect(result.deflectedVelocity.x).toBeLessThan(0); // Bounced away from wall
    expect(result.deflectedVelocity.z).toBeCloseTo(-10.56, 0.5); // Preserved forward speed
  });
});
