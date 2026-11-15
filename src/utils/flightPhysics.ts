import * as THREE from 'three';

export interface FlightPhysicsState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  pitch: number;
  roll: number;
  yaw: number;
  isStalled: boolean;
  altitude: number;
}

export interface FlightControls {
  pitchInput: number; // -1 to +1
  rollInput: number;  // -1 to +1
}

export interface ObstacleBounds {
  type: 'solid' | 'thermal' | 'geyser' | 'star' | 'ring' | 'whirlpool' | 'speed_gate' | 'loop_ring' | 'surprise_orb';
  center: THREE.Vector3;
  radius: number;
  height?: number;
  normal?: THREE.Vector3;
  collected?: boolean;
}

export interface DeflectionResult {
  hasCollided: boolean;
  deflectedVelocity: THREE.Vector3;
  obstacleType?: string;
  speedLossRatio: number;
}

const GRAVITY = 9.81;
const AIR_DENSITY = 1.225;
const WING_AREA = 0.08; // 0.08 m^2 typical origami plane
const STALL_ANGLE = 0.314; // ~18 degrees in radians
const BASE_CL0 = 0.25;
const BASE_CD0 = 0.08;
const ASPECT_RATIO = 2.2;
const OSWALD_EFFICIENCY = 0.85;

// Object pooling to eliminate GC allocations during 60 FPS flight
const _tempForward = new THREE.Vector3();
const _tempLift = new THREE.Vector3();
const _tempDrag = new THREE.Vector3();
const _tempAccel = new THREE.Vector3();

export function computeAerodynamicStep(
  state: FlightPhysicsState,
  controls: FlightControls,
  dt: number,
  liftUpgradeMultiplier = 1.0,
  dragUpgradeMultiplier = 1.0
): FlightPhysicsState {
  const clampedDt = Math.min(0.05, Math.max(0.001, dt));
  const subSteps = 4;
  const subDt = clampedDt / subSteps;

  const nextPos = state.position.clone();
  const nextVel = state.velocity.clone();
  let pitch = state.pitch;
  let roll = state.roll;
  let yaw = state.yaw;
  let isStalled = state.isStalled;

  for (let step = 0; step < subSteps; step++) {
    // Apply user flight control inputs to angles
    pitch += controls.pitchInput * 1.5 * subDt;
    roll += controls.rollInput * 2.8 * subDt;
    roll *= Math.pow(0.92, subDt * 60); // Roll auto-centering damping

    const speedSq = nextVel.lengthSq();
    const speed = Math.sqrt(speedSq);

    if (speed < 0.1) {
      nextVel.y -= GRAVITY * subDt;
      nextPos.addScaledVector(nextVel, subDt);
      continue;
    }

    // Direction vectors
    _tempForward.copy(nextVel).normalize();

    // Flight path angle gamma
    const horizontalSpeed = Math.sqrt(nextVel.x * nextVel.x + nextVel.z * nextVel.z);
    const gamma = Math.atan2(nextVel.y, Math.max(0.001, horizontalSpeed));

    // Angle of Attack (alpha)
    const alpha = pitch - gamma;

    let cL = BASE_CL0 + 2 * Math.PI * alpha * liftUpgradeMultiplier;
    isStalled = alpha > STALL_ANGLE;

    if (isStalled) {
      cL *= 0.40; // 60% lift collapse
      // Restoring nose-down pitch torque
      pitch += -2.5 * (alpha - STALL_ANGLE) * subDt;
    }

    // Induced & parasite drag
    let inducedDrag = (cL * cL) / (Math.PI * ASPECT_RATIO * OSWALD_EFFICIENCY);
    let cD = (BASE_CD0 + inducedDrag) * dragUpgradeMultiplier;

    // Ground effect cushion when altitude < 0.5m
    const altitude = Math.max(0, nextPos.y);
    if (altitude < 0.5) {
      cL *= 1.25; // +25% lift
      cD -= inducedDrag * 0.5; // -50% induced drag
    }

    // Dynamic pressure Q = 0.5 * rho * v^2
    const dynamicPressure = 0.5 * AIR_DENSITY * speedSq * WING_AREA;
    const liftMagnitude = cL * dynamicPressure;
    const dragMagnitude = cD * dynamicPressure;

    // Lift vector acts perpendicular to forward direction in the vertical plane
    _tempLift.set(0, 1, 0).cross(_tempForward).cross(_tempForward).negate().normalize();
    _tempLift.multiplyScalar(liftMagnitude);

    // Drag vector opposes velocity direction
    _tempDrag.copy(_tempForward).multiplyScalar(-dragMagnitude);

    // Net acceleration: Lift + Drag + Gravity
    _tempAccel.copy(_tempLift).add(_tempDrag);
    _tempAccel.y -= GRAVITY; // Gravity

    // Bank turn coordinate coupling (banking causes yaw turn)
    nextVel.x += Math.sin(roll) * 4.2 * subDt;
    yaw -= Math.sin(roll) * 1.8 * subDt;

    // Integrate velocity & position
    nextVel.addScaledVector(_tempAccel, subDt);
    nextPos.addScaledVector(nextVel, subDt);
  }

  const nextAltitude = Math.max(0, nextPos.y);

  return {
    position: nextPos,
    velocity: nextVel,
    rotation: new THREE.Euler(pitch, yaw, roll, 'YXZ'),
    pitch,
    roll,
    yaw,
    isStalled,
    altitude: nextAltitude
  };
}

export function checkGlancingDeflection(
  position: THREE.Vector3,
  velocity: THREE.Vector3,
  obstacles: ObstacleBounds[]
): DeflectionResult {
  for (const obs of obstacles) {
    if (obs.collected) continue;
    const dist = position.distanceTo(obs.center);
    if (dist <= obs.radius) {
      if (obs.type === 'solid') {
        const normal = obs.normal
          ? obs.normal.clone().normalize()
          : position.clone().sub(obs.center).normalize();

        const vDotN = velocity.dot(normal);
        // Only deflect if heading toward the surface
        if (vDotN < 0) {
          const vPerp = normal.clone().multiplyScalar(vDotN);
          const vParallel = velocity.clone().sub(vPerp);

          const friction = 0.12;
          const restitution = 0.35;

          const deflectedVelocity = vParallel
            .multiplyScalar(1 - friction)
            .sub(vPerp.multiplyScalar(restitution));

          const speedLoss = 1 - deflectedVelocity.length() / Math.max(0.001, velocity.length());

          return {
            hasCollided: true,
            deflectedVelocity,
            obstacleType: 'solid',
            speedLossRatio: Math.max(0, speedLoss)
          };
        }
      } else {
        return {
          hasCollided: true,
          deflectedVelocity: velocity.clone(),
          obstacleType: obs.type,
          speedLossRatio: 0
        };
      }
    }
  }

  return {
    hasCollided: false,
    deflectedVelocity: velocity.clone(),
    speedLossRatio: 0
  };
}
