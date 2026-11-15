import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';
import { GAME_LEVELS } from '../data/gameLevels';
import { TRINITY_KITS } from '../types/game';
import { synthesizeKitGeometry } from '../utils/mobileGeometry';
import { computeAerodynamicStep, checkGlancingDeflection, FlightPhysicsState } from '../utils/flightPhysics';
import { generateCanyonTrack, updateDynamicObstacles, getWeatherLighting, CanyonTrackData } from '../utils/canyonWorld';
import { gameAudio } from '../utils/gameAudio';
import confetti from 'canvas-confetti';

export function computeElevatedAimCamera(basePitch: number, tension: number): number {
  return basePitch + ((8.5 * Math.PI) / 180) * Math.max(0, Math.min(1, tension));
}

export function computeSlingshotTension(dragPixels: number, maxPullback = 120): number {
  const deadband = 20;
  if (dragPixels < deadband) return 0;
  return Math.min(1.0, (dragPixels - deadband) / (maxPullback - deadband));
}

interface FlightStageProps {
  onTelemetryUpdate?: (dist: number, alt: number, spd: number) => void;
}

export const FlightStage: React.FC<FlightStageProps> = ({ onTelemetryUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const slingshotCordRef = useRef<THREE.Line | null>(null);

  // Store subscriptions (read directly without triggering React re-renders in the loop)
  const flightState = useGameStore(s => s.flightState);
  const activeLevelId = useGameStore(s => s.activeLevelId);
  const selectedKitId = useGameStore(s => s.selectedKitId);
  const upgrades = useGameStore(s => s.upgrades);
  const activePaperStock = useGameStore(s => s.activePaperStock);

  const activeLevel = GAME_LEVELS.find(l => l.id === activeLevelId) || GAME_LEVELS[0];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth || 360;
    const h = container.clientHeight || 640;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7dd3fc);
    scene.fog = new THREE.Fog(0xe0f2fe, 30, 175);

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 450);
    camera.position.set(0, 31.8, 4.5);
    camera.lookAt(0, 30.5, -20.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Warm Ambient & Hemisphere Lighting
    const hemiLight = new THREE.HemisphereLight(0xfff8ee, 0x8899aa, 0.85);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff8e7, 1.4);
    sunLight.position.set(25, 45, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 180;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    scene.add(sunLight);

    // Stylized Origami Sun Disc at Horizon
    const sunDiscGeo = new THREE.CircleGeometry(26, 24);
    const sunDiscMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92
    });
    const sunDisc = new THREE.Mesh(sunDiscGeo, sunDiscMat);
    sunDisc.position.set(20, 60, -320);
    scene.add(sunDisc);

    // Generate Canyon Track
    const trackData: CanyonTrackData = generateCanyonTrack(activeLevel);
    scene.add(trackData.trackGroup);

    // Plane Model & Flight Archetype (Authentic Matte Paper Material)
    const kitStat = TRINITY_KITS[selectedKitId] || TRINITY_KITS['aerospace-02'];
    const planeGroup = new THREE.Group();
    const planeGeo = synthesizeKitGeometry(selectedKitId || 'aerospace-02', 1.0);

    let paperColorHex = 0xd97706; // Falcon Dart default amber
    if (selectedKitId === 'japanese-01') paperColorHex = 0xef4444; // Orizuru Vermilion Red
    else if (selectedKitId === 'chinese-03') paperColorHex = 0xf59e0b; // Imperial Golden Dragon

    if (activePaperStock === 'gold_foil') paperColorHex = 0xf59e0b;
    else if (activePaperStock === 'sakura') paperColorHex = 0xf43f5e;
    else if (activePaperStock === 'indigo') paperColorHex = 0x3b82f6;

    const planeMat = new THREE.MeshStandardMaterial({
      color: paperColorHex,
      roughness: 0.82,
      metalness: activePaperStock === 'gold_foil' ? 0.75 : 0.04,
      flatShading: true,
      side: THREE.DoubleSide
    });

    const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    planeMesh.castShadow = true;

    // Align forward facing direction in -Z for Japanese Crane and Chinese Dragon
    if (selectedKitId === 'japanese-01' || selectedKitId === 'chinese-03') {
      planeMesh.rotation.y = Math.PI;
    }

    planeGroup.add(planeMesh);

    // 3D Origami Rocket Thruster Flame (Attached to Plane Exhaust)
    const thrusterFlameGroup = new THREE.Group();
    const outerFlameGeo = new THREE.ConeGeometry(0.32, 1.3, 5);
    outerFlameGeo.rotateX(Math.PI / 2); // points backward (+Z)
    const outerFlameMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide
    });
    const outerFlameMesh = new THREE.Mesh(outerFlameGeo, outerFlameMat);

    const innerFlameGeo = new THREE.ConeGeometry(0.18, 0.85, 5);
    innerFlameGeo.rotateX(Math.PI / 2);
    const innerFlameMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    });
    const innerFlameMesh = new THREE.Mesh(innerFlameGeo, innerFlameMat);

    thrusterFlameGroup.add(outerFlameMesh, innerFlameMesh);
    const rearZ = (selectedKitId === 'japanese-01' || selectedKitId === 'chinese-03') ? -0.85 : 0.85;
    thrusterFlameGroup.position.set(0, 0.08, rearZ);
    thrusterFlameGroup.scale.set(0, 0, 0);
    thrusterFlameGroup.visible = false;
    planeGroup.add(thrusterFlameGroup);
    planeGroup.position.set(0, 30.2, 0);
    scene.add(planeGroup);

    // Artisan Papercraft Runway Launchpad
    const runwayGroup = new THREE.Group();
    runwayGroup.position.set(0, 30.0, 0);
    const rampMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85, flatShading: true });
    const rampRailingMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.7, flatShading: true });

    // Main angled wooden runway deck
    const deckGeo = new THREE.BoxGeometry(4.0, 0.25, 6.5);
    const deck = new THREE.Mesh(deckGeo, rampMat);
    deck.position.set(0, 0.25, 1.4);
    deck.receiveShadow = true;
    runwayGroup.add(deck);

    // Red lacquered runway side trims
    const trimGeo = new THREE.BoxGeometry(0.22, 0.5, 6.5);
    const leftTrim = new THREE.Mesh(trimGeo, rampRailingMat);
    leftTrim.position.set(-2.0, 0.38, 1.4);
    const rightTrim = new THREE.Mesh(trimGeo, rampRailingMat);
    rightTrim.position.set(2.0, 0.38, 1.4);
    runwayGroup.add(leftTrim, rightTrim);

    // White Folded Paper Chevron Runway Guide Markings
    const chevronMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    for (let c = 0; c < 3; c++) {
      const arrowGeo = new THREE.PlaneGeometry(0.85, 0.28);
      arrowGeo.rotateX(-Math.PI / 2);
      const arrow = new THREE.Mesh(arrowGeo, chevronMat);
      arrow.position.set(0, 0.4, 0.2 + c * 1.5);
      runwayGroup.add(arrow);
    }

    // Slingshot Torii Stanchions with Gold Finials
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6, flatShading: true });
    const finialMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.8 });
    const pillarGeo = new THREE.CylinderGeometry(0.12, 0.16, 2.2, 8);

    const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
    leftPillar.position.set(-1.4, 1.1, -0.6);
    const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
    rightPillar.position.set(1.4, 1.1, -0.6);

    const finialGeo = new THREE.SphereGeometry(0.24, 8, 8);
    const leftFinial = new THREE.Mesh(finialGeo, finialMat);
    leftFinial.position.set(-1.4, 2.25, -0.6);
    const rightFinial = new THREE.Mesh(finialGeo, finialMat);
    rightFinial.position.set(1.4, 2.25, -0.6);

    runwayGroup.add(leftPillar, rightPillar, leftFinial, rightFinial);

    // Slingshot Elastic Line (Vibrant Glowing Cyan Cord)
    const cordGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.4, 1.8, -0.6),
      new THREE.Vector3(0, 0.2, 0),
      new THREE.Vector3(1.4, 1.8, -0.6)
    ]);
    const cordMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 4 });
    const cordLine = new THREE.Line(cordGeo, cordMat);
    runwayGroup.add(cordLine);
    slingshotCordRef.current = cordLine;

    scene.add(runwayGroup);

    // Wingtip Air Trails (Vortices / Speed Streamers)
    const TRAIL_LENGTH = 20;
    const leftTrailPositions = new Float32Array(TRAIL_LENGTH * 3);
    const rightTrailPositions = new Float32Array(TRAIL_LENGTH * 3);

    for (let p = 0; p < TRAIL_LENGTH; p++) {
      leftTrailPositions[p * 3] = -0.9;
      leftTrailPositions[p * 3 + 1] = 30.2;
      leftTrailPositions[p * 3 + 2] = 0;
      rightTrailPositions[p * 3] = 0.9;
      rightTrailPositions[p * 3 + 1] = 30.2;
      rightTrailPositions[p * 3 + 2] = 0;
    }

    const leftTrailGeo = new THREE.BufferGeometry();
    leftTrailGeo.setAttribute('position', new THREE.BufferAttribute(leftTrailPositions, 3));
    const rightTrailGeo = new THREE.BufferGeometry();
    rightTrailGeo.setAttribute('position', new THREE.BufferAttribute(rightTrailPositions, 3));

    const trailMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });

    const leftTrailLine = new THREE.Line(leftTrailGeo, trailMat);
    const rightTrailLine = new THREE.Line(rightTrailGeo, trailMat.clone());
    scene.add(leftTrailLine, rightTrailLine);

    // Flight State Tracking
    let physicsState: FlightPhysicsState = {
      position: new THREE.Vector3(0, 30.2, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
      pitch: 0,
      roll: 0,
      yaw: 0,
      isStalled: false,
      altitude: 30.2
    };

    let controls = { pitchInput: 0, rollInput: 0 };
    let touchStart = { x: 0, y: 0, active: false };
    let pullBack = { dx: 0, dy: 0, distance: 0 };

    // Aerobatic Stunt State
    let activeStunt: {
      type: 'roll' | 'loop';
      elapsed: number;
      duration: number;
      initialRoll: number;
      initialPitch: number;
    } | null = null;

    let lastTapTime = 0;
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;

    const triggerStunt = (type: 'roll' | 'loop') => {
      if (activeStunt !== null) return;
      if (type === 'roll') {
        activeStunt = {
          type: 'roll',
          elapsed: 0,
          duration: 0.65,
          initialRoll: physicsState.roll,
          initialPitch: physicsState.pitch
        };
        gameAudio.playBarrelRoll();
        useGameStore.getState().triggerStunt('roll');
      } else if (type === 'loop') {
        activeStunt = {
          type: 'loop',
          elapsed: 0,
          duration: 0.95,
          initialRoll: physicsState.roll,
          initialPitch: physicsState.pitch
        };
        gameAudio.playLoopWhoosh();
        useGameStore.getState().triggerStunt('loop');
      }
    };

    const updateCordPoints = (planePos: THREE.Vector3) => {
      if (!slingshotCordRef.current) return;
      const positions = slingshotCordRef.current.geometry.attributes.position as THREE.BufferAttribute;
      positions.setXYZ(1, planePos.x, planePos.y - 30.0, planePos.z);
      positions.needsUpdate = true;
    };

    // Unified Pointer Event Handlers (Mouse + Touch + Stylus)
    const onPointerDown = (e: PointerEvent) => {
      const now = performance.now();
      const state = useGameStore.getState().flightState;

      // Double-Tap / Double-Click Detection during flight -> 360° Barrel Roll
      if (state === 'flying') {
        if (now - lastTapTime < 280 && !activeStunt) {
          triggerStunt('roll');
        }
      }

      lastTapTime = now;
      touchStartTime = now;
      touchStartX = e.clientX;
      touchStartY = e.clientY;
      touchStart = { x: e.clientX, y: e.clientY, active: true };
      gameAudio.init();

      if (state === 'cliff-aim' || state === 'aiming' || state === 'idle') {
        if (state === 'idle') {
          useGameStore.getState().setFlightState('aiming');
        }
        try {
          container.setPointerCapture(e.pointerId);
        } catch {
          // pointer capture fallback
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!touchStart.active) return;
      const dx = e.clientX - touchStart.x;
      const dy = e.clientY - touchStart.y;

      const state = useGameStore.getState().flightState;

      if (state === 'cliff-aim' || state === 'aiming') {
        const dragDist = Math.sqrt(dx * dx + dy * dy);
        const tension = computeSlingshotTension(dragDist, 120);
        pullBack = { dx, dy, distance: dragDist };

        if (tension > 0) {
          const effectiveDy = Math.max(0, dy - 20);
          planeGroup.position.set(-dx * 0.012, 30.2 - effectiveDy * 0.005, effectiveDy * 0.022);
          planeGroup.rotation.x = 0.15 + (effectiveDy / 100) * 0.35;
          planeGroup.rotation.y = ((selectedKitId === 'japanese-01' || selectedKitId === 'chinese-03') ? Math.PI : 0) - (dx / 120) * 0.45;
          updateCordPoints(planeGroup.position);

          // Elevated Horizon Camera Framing (+8.5 deg upward pitch and FOV 60 -> 68)
          const aimPitch = computeElevatedAimCamera(0.05, tension);
          camera.position.set(-dx * 0.003, 31.8 + tension * 0.5, 4.5 + tension * 0.8);
          camera.rotation.x = aimPitch;
          camera.fov = 60 + 8.0 * tension;
          camera.updateProjectionMatrix();
        } else {
          planeGroup.position.set(0, 30.2, 0);
          updateCordPoints(planeGroup.position);
          camera.position.set(0, 31.8, 4.5);
          camera.fov = 60;
          camera.lookAt(0, 30.5, -20.0);
          camera.updateProjectionMatrix();
        }
      } else if (state === 'flying') {
        // In-flight banking & pitch steering
        controls.rollInput = Math.max(-1, Math.min(1, (dx / 80) * kitStat.turnAgility));
        controls.pitchInput = Math.max(-1, Math.min(1, -dy / 80));
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!touchStart.active) return;
      touchStart.active = false;
      try {
        if (container.hasPointerCapture(e.pointerId)) {
          container.releasePointerCapture(e.pointerId);
        }
      } catch {
        // pointer capture fallback
      }

      const state = useGameStore.getState().flightState;

      if (state === 'cliff-aim' || state === 'aiming') {
        const tension = computeSlingshotTension(pullBack.distance, 120);
        if (tension > 0.05) {
          const pullRatio = Math.max(0.2, tension);
          const impulseMult = 1.0 + upgrades.impulse * 0.12;
          const launchSpeed = pullRatio * 20.0 * impulseMult * kitStat.speedMultiplier;

          const launchPitch = 0.15 + (Math.max(0, pullBack.dy - 20) / 100) * 0.25;
          const launchYaw = -(pullBack.dx / 120) * 0.35;

          physicsState.position.copy(planeGroup.position);
          physicsState.velocity.set(
            -Math.sin(launchYaw) * launchSpeed * 0.5,
            Math.sin(launchPitch) * launchSpeed * 0.65,
            -Math.cos(launchPitch) * launchSpeed
          );
          physicsState.pitch = launchPitch;
          physicsState.yaw = launchYaw;
          physicsState.roll = 0;
          physicsState.altitude = physicsState.position.y;

          useGameStore.getState().setFlightState('flying');
          gameAudio.playLaunchSnap();

          if (slingshotCordRef.current) {
            slingshotCordRef.current.visible = false;
          }
        } else {
          // Cancel/Deadband snap back to cliff rest
          planeGroup.position.set(0, 30.2, 0);
          updateCordPoints(planeGroup.position);
          camera.position.set(0, 31.8, 4.5);
          camera.fov = 60;
          camera.lookAt(0, 30.5, -20.0);
          camera.updateProjectionMatrix();
        }
      } else if (state === 'flying') {
        // Swipe Up Detection during flight -> Loop-the-Loop!
        const dtTouch = performance.now() - touchStartTime;
        const dyTouch = e.clientY - touchStartY;
        const dxTouch = e.clientX - touchStartX;
        if (dtTouch < 280 && dyTouch < -40 && Math.abs(dxTouch) < 60 && !activeStunt) {
          triggerStunt('loop');
        }

        controls.pitchInput = 0;
        controls.rollInput = 0;
      }
    };

    // Keyboard support for desktop players (Arrow Keys / WASD, Space for Roll)
    const onKeyDown = (e: KeyboardEvent) => {
      const state = useGameStore.getState().flightState;
      if ((state === 'cliff-aim' || state === 'idle') && (e.key === ' ' || e.key === 'Enter')) {
        // Quick keyboard launch
        useGameStore.getState().setFlightState('aiming');
        pullBack = { dx: 0, dy: 90, distance: 90 };
        setTimeout(() => {
          if (useGameStore.getState().flightState === 'aiming') {
            onPointerUp({ clientX: 0, clientY: 0, pointerId: 0 } as any);
          }
        }, 150);
        return;
      }

      if (state === 'flying') {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          useGameStore.getState().setSteerInput(-1);
          controls.rollInput = -1;
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          useGameStore.getState().setSteerInput(1);
          controls.rollInput = 1;
        }
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') controls.pitchInput = 0.8;
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') controls.pitchInput = -0.8;
        if (e.key === ' ' || e.key === 'Shift') {
          useGameStore.getState().activateBoost();
        }
        if (e.key === 'r' && !activeStunt) triggerStunt('roll');
        if (e.key === 'l' && !activeStunt) triggerStunt('loop');
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'a' || e.key === 'd' || e.key === 'A' || e.key === 'D') {
        useGameStore.getState().setSteerInput(0);
        controls.rollInput = 0;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'w' || e.key === 's' || e.key === 'W' || e.key === 'S') {
        controls.pitchInput = 0;
      }
    };

    // DeviceOrientation (Gyroscope) Tilt Controls
    const gyroOrientation = { gamma: 0, beta: 0, active: false };

    const onDeviceOrientation = (e: DeviceOrientationEvent) => {
      const isGyroActive = useGameStore.getState().gyroEnabled;
      if (!isGyroActive || e.gamma === null || e.beta === null) return;
      gyroOrientation.active = true;
      gyroOrientation.gamma = e.gamma;
      gyroOrientation.beta = e.beta;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('deviceorientation', onDeviceOrientation);

    // 60 FPS Render & Physics Loop
    let lastTime = performance.now();
    let animId: number;
    let wasBoosting = false;

    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const currentFlightState = useGameStore.getState().flightState;

      if (currentFlightState === 'flying') {
        const liftMult = (1.0 + upgrades.lift * 0.10) * kitStat.liftMultiplier;
        const dragMult = Math.max(0.4, (1.0 - upgrades.drag * 0.08) * kitStat.dragMultiplier);

        // Active Steering Left/Right Response
        const storeSteer = useGameStore.getState().steerInput;
        controls.rollInput = Math.max(-1, Math.min(1, controls.rollInput + storeSteer * kitStat.turnAgility));

        if (storeSteer !== 0) {
          physicsState.roll += storeSteer * 2.8 * dt;
          physicsState.yaw -= storeSteer * 1.6 * dt;
          physicsState.velocity.x += Math.sin(physicsState.roll) * 8.0 * dt;
        }

        // Active Gyroscope Tilt Steering (Roll & Pitch)
        const isGyroActive = useGameStore.getState().gyroEnabled;
        if (isGyroActive && gyroOrientation.active) {
          // 3-degree deadband to suppress mobile handheld tremor jitter
          const cleanGamma = Math.abs(gyroOrientation.gamma) < 3.0 ? 0 : gyroOrientation.gamma;
          const cleanBetaOffset = Math.abs(gyroOrientation.beta - 45.0) < 3.0 ? 0 : (gyroOrientation.beta - 45.0);

          // gamma: left/right tilt [-30, 30] deg
          const rollTilt = Math.max(-1, Math.min(1, cleanGamma / 25));
          // beta: handheld neutral is ~45 deg, tilt forward -> pitch down, tilt back -> pitch up
          const pitchTilt = Math.max(-1, Math.min(1, cleanBetaOffset / 22));

          controls.rollInput = Math.max(-1, Math.min(1, controls.rollInput + rollTilt * kitStat.turnAgility));
          controls.pitchInput = Math.max(-1, Math.min(1, controls.pitchInput - pitchTilt * 0.8));

          physicsState.roll += rollTilt * 2.4 * dt;
          physicsState.yaw -= rollTilt * 1.4 * dt;
          physicsState.velocity.x += Math.sin(physicsState.roll) * 7.0 * dt;
        }

        // Active Rocket Thruster Booster Execution
        const isBoosting = useGameStore.getState().isBoosting;
        if (isBoosting) {
          if (!wasBoosting) {
            gameAudio.playRocketThruster();
            wasBoosting = true;
          }
          const forward = physicsState.velocity.clone().normalize();
          physicsState.velocity.addScaledVector(forward, 24.0 * dt);
          physicsState.pitch = Math.max(-0.08, physicsState.pitch + 0.15 * dt); // slight climb

          // Animate 3D Origami Rocket Flame
          const flicker = 1.0 + Math.sin(currentTime * 0.05) * 0.35;
          thrusterFlameGroup.scale.set(flicker, flicker, flicker * 1.4);
          thrusterFlameGroup.visible = true;
        } else {
          wasBoosting = false;
          thrusterFlameGroup.scale.multiplyScalar(0.8);
          if (thrusterFlameGroup.scale.x < 0.05) {
            thrusterFlameGroup.visible = false;
          }
        }

        // Step Aerodynamics
        physicsState = computeAerodynamicStep(physicsState, controls, dt, liftMult, dragMult);

        // Execute Active Aerobatic Stunt
        if (activeStunt) {
          activeStunt.elapsed += dt;
          const p = Math.min(1.0, activeStunt.elapsed / activeStunt.duration);

          if (activeStunt.type === 'roll') {
            physicsState.roll = activeStunt.initialRoll + p * Math.PI * 2;
          } else if (activeStunt.type === 'loop') {
            physicsState.pitch = activeStunt.initialPitch + Math.sin(p * Math.PI * 2) * Math.PI * 1.5;
            physicsState.altitude += Math.sin(p * Math.PI) * 6.5 * dt;
            physicsState.position.y = physicsState.altitude;
          }

          if (p >= 1.0) {
            activeStunt = null;
          }
        }

        // Check Obstacle Collisions
        const collision = checkGlancingDeflection(physicsState.position, physicsState.velocity, trackData.obstacles);

        if (collision.hasCollided) {
          if (collision.obstacleType === 'solid') {
            physicsState.velocity.copy(collision.deflectedVelocity);
            if (!activeStunt || activeStunt.type !== 'roll') {
              gameAudio.playDeflectionThud();
            }
          } else if (collision.obstacleType === 'thermal') {
            physicsState.velocity.y = Math.min(8.5, physicsState.velocity.y + 4.5);
            useGameStore.getState().triggerThermal();
            gameAudio.playThermalHum();
          } else if (collision.obstacleType === 'geyser') {
            physicsState.velocity.y = 8.0;
            gameAudio.playThermalHum();
          } else if (collision.obstacleType === 'star') {
            // Find and collect star
            const star = trackData.obstacles.find(o => o.type === 'star' && !o.collected && physicsState.position.distanceTo(o.center) < 2.0);
            if (star) {
              star.collected = true;
              star.meshGroup.visible = false;
              useGameStore.getState().collectStar();
              gameAudio.playStarChime(useGameStore.getState().starsCollected);
            }
          }
        }

        // Apply Position & Rotation to Three.js Plane Mesh
        planeGroup.position.copy(physicsState.position);
        planeGroup.rotation.copy(physicsState.rotation);

        const currentDist = Math.max(0, -physicsState.position.z);
        const currentSpeed = physicsState.velocity.length();
        const currentAlt = physicsState.altitude;

        // Archetype Kinematic Flight Animations
        if (selectedKitId === 'japanese-01') {
          // Sacred Peace Crane: Natural wing-flapping oscillation
          const flap = Math.sin(currentTime * 0.008) * 0.12;
          planeMesh.rotation.z = flap;
          planeMesh.position.y = Math.sin(currentTime * 0.008) * 0.04;
        } else if (selectedKitId === 'chinese-03') {
          // Celestial Dragon: Serpentine undulation and tail sway
          const sway = Math.sin(currentTime * 0.006) * 0.12;
          planeMesh.rotation.y = Math.PI + sway;
          planeMesh.rotation.z = Math.cos(currentTime * 0.006) * 0.06;
        } else {
          // Falcon Dart: High-Speed Dive Paper Wing Flutter Oscillation
          if (physicsState.pitch < -0.22 && currentSpeed > 14) {
            planeGroup.rotation.z += Math.sin(currentTime * 0.05) * 0.035;
            if (Math.random() < 0.15) {
              gameAudio.playFlutterRustle();
            }
          }
        }

        // Telemetry Store Update
        useGameStore.getState().updateTelemetry(currentDist, currentAlt, currentSpeed);
        if (onTelemetryUpdate) onTelemetryUpdate(currentDist, currentAlt, currentSpeed);

        // Audio update
        gameAudio.updateWindRustle(currentSpeed);

        // Update Wingtip Air Trails (Vortices)
        const leftTip = new THREE.Vector3(-0.9, 0.08, 0.1);
        const rightTip = new THREE.Vector3(0.9, 0.08, 0.1);
        leftTip.applyMatrix4(planeGroup.matrixWorld);
        rightTip.applyMatrix4(planeGroup.matrixWorld);

        for (let t = TRAIL_LENGTH - 1; t > 0; t--) {
          leftTrailPositions[t * 3] = leftTrailPositions[(t - 1) * 3];
          leftTrailPositions[t * 3 + 1] = leftTrailPositions[(t - 1) * 3 + 1];
          leftTrailPositions[t * 3 + 2] = leftTrailPositions[(t - 1) * 3 + 2];

          rightTrailPositions[t * 3] = rightTrailPositions[(t - 1) * 3];
          rightTrailPositions[t * 3 + 1] = rightTrailPositions[(t - 1) * 3 + 1];
          rightTrailPositions[t * 3 + 2] = rightTrailPositions[(t - 1) * 3 + 2];
        }

        leftTrailPositions[0] = leftTip.x;
        leftTrailPositions[1] = leftTip.y;
        leftTrailPositions[2] = leftTip.z;

        rightTrailPositions[0] = rightTip.x;
        rightTrailPositions[1] = rightTip.y;
        rightTrailPositions[2] = rightTip.z;

        (leftTrailGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        (rightTrailGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;

        // Trail Opacity scales with speed and aerobatic stunts
        const speedRatio = Math.max(0, Math.min(1.0, (currentSpeed - 12) / 8));
        const stuntRatio = activeStunt ? 0.9 : 0.0;
        const targetTrailOpacity = Math.max(speedRatio * 0.75, stuntRatio);
        leftTrailLine.material.opacity += (targetTrailOpacity - leftTrailLine.material.opacity) * 0.15;
        (rightTrailLine.material as THREE.LineBasicMaterial).opacity = leftTrailLine.material.opacity;

        // Dynamic Speed-Responsive Camera FOV (60° base -> up to 78° on steep dives and boosts)
        const boostFOV = isBoosting ? 12 : 0;
        const targetFOV = 60 + Math.min(16, Math.max(0, (currentSpeed - 10) * 1.15)) + boostFOV;
        camera.fov += (targetFOV - camera.fov) * 0.12;
        camera.updateProjectionMatrix();

        // Dynamic Weather Shifts with Biome Support
        const weather = getWeatherLighting(currentDist, activeLevel.biome);
        scene.background = new THREE.Color(weather.skyColor);
        if (scene.fog && 'near' in scene.fog) {
          (scene.fog as THREE.Fog).color = new THREE.Color(weather.fogColor);
          (scene.fog as THREE.Fog).near = weather.fogNear;
          (scene.fog as THREE.Fog).far = weather.fogFar;
        }
        sunLight.color = new THREE.Color(weather.sunColor);
        sunLight.intensity = weather.sunIntensity;

        // Spring Follow Camera
        const targetCamX = physicsState.position.x * 0.65;
        const targetCamY = physicsState.position.y + 1.8;
        const targetCamZ = physicsState.position.z + 5.5;

        camera.position.x += (targetCamX - camera.position.x) * 0.08;
        camera.position.y += (targetCamY - camera.position.y) * 0.08;
        camera.position.z += (targetCamZ - camera.position.z) * 0.08;
        camera.lookAt(physicsState.position.x, physicsState.position.y + 0.3, physicsState.position.z - 4.0);

        // Visceral Banking Roll Follow
        camera.rotation.z += physicsState.roll * 0.22;

        // Check Touchdown / Ground Landing
        if (physicsState.altitude <= 0.02 && (currentSpeed < 2.5 || physicsState.position.y <= 0)) {
          gameAudio.stopFlightAudio();
          useGameStore.getState().touchdown();
          confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
        }
      } else if (currentFlightState === 'cliff-aim' || currentFlightState === 'idle') {
        // Elevated cliff ledge resting camera & cord restoration
        if (!touchStart.active) {
          camera.fov += (60 - camera.fov) * 0.08;
          camera.updateProjectionMatrix();
          camera.position.set(0, 31.8 + Math.sin(currentTime * 0.001) * 0.05, 4.5);
          camera.lookAt(0, 30.5, -20.0);
          planeGroup.position.set(0, 30.2, 0);
          physicsState.position.set(0, 30.2, 0);
          physicsState.velocity.set(0, 0, 0);
          physicsState.altitude = 30.2;
          updateCordPoints(planeGroup.position);
          if (slingshotCordRef.current) {
            slingshotCordRef.current.visible = true;
          }
        }
        leftTrailLine.material.opacity = 0;
        (rightTrailLine.material as THREE.LineBasicMaterial).opacity = 0;
      }

      // Animate windmills, lanterns, stars
      updateDynamicObstacles(trackData, currentTime * 0.001);

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    const onResize = () => {
      const rw = container.clientWidth || 360;
      const rh = container.clientHeight || 640;
      camera.aspect = rw / rh;
      camera.updateProjectionMatrix();
      renderer.setSize(rw, rh, false);
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('deviceorientation', onDeviceOrientation);
      gameAudio.stopFlightAudio();
      leftTrailGeo.dispose();
      rightTrailGeo.dispose();
      trailMat.dispose();
      outerFlameGeo.dispose();
      innerFlameGeo.dispose();
      outerFlameMat.dispose();
      innerFlameMat.dispose();
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [activeLevelId, selectedKitId, activePaperStock]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
};
