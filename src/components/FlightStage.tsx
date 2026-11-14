import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';
import { GAME_LEVELS } from '../data/gameLevels';
import { synthesizeKitGeometry } from '../utils/mobileGeometry';
import { computeAerodynamicStep, checkGlancingDeflection, FlightPhysicsState } from '../utils/flightPhysics';
import { generateCanyonTrack, updateDynamicObstacles, getWeatherLighting, CanyonTrackData } from '../utils/canyonWorld';
import { gameAudio } from '../utils/gameAudio';
import confetti from 'canvas-confetti';

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
    scene.background = new THREE.Color(0xa5c9eb);
    scene.fog = new THREE.Fog(0xe0ecf8, 20, 120);

    const camera = new THREE.PerspectiveCamera(54, w / h, 0.1, 350);
    camera.position.set(0, 3.2, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xfff6ea, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8e7, 1.25);
    sunLight.position.set(15, 30, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // Generate Canyon Track
    const trackData: CanyonTrackData = generateCanyonTrack(activeLevel);
    scene.add(trackData.trackGroup);

    // Plane Model
    const planeGroup = new THREE.Group();
    const planeGeo = synthesizeKitGeometry(selectedKitId || 'aerospace-02', 1.0);

    let paperColorHex = 0xd97706; // Falcon Dart default amber
    if (activePaperStock === 'gold_foil') paperColorHex = 0xf59e0b;
    else if (activePaperStock === 'sakura') paperColorHex = 0xf43f5e;
    else if (activePaperStock === 'indigo') paperColorHex = 0x3b82f6;

    const planeMat = new THREE.MeshStandardMaterial({
      color: paperColorHex,
      roughness: 0.72,
      metalness: activePaperStock === 'gold_foil' ? 0.65 : 0.05,
      side: THREE.DoubleSide
    });

    const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    planeMesh.castShadow = true;
    planeGroup.add(planeMesh);

    // Subtle edge crease line overlay
    const wireGeo = new THREE.WireframeGeometry(planeGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.22 });
    planeGroup.add(new THREE.LineSegments(wireGeo, wireMat));

    planeGroup.position.set(0, 1.8, 0);
    scene.add(planeGroup);

    // Slingshot Runway Launchpad
    const runwayGroup = new THREE.Group();
    const padGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.2, 32);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.8 });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(0, 0.1, 0);
    pad.receiveShadow = true;
    runwayGroup.add(pad);

    // Slingshot Pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.5 });
    const pillarGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.8, 16);
    const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
    leftPillar.position.set(-1.1, 0.9, -0.4);
    const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
    rightPillar.position.set(1.1, 0.9, -0.4);
    runwayGroup.add(leftPillar, rightPillar);

    // Slingshot Elastic Line
    const cordGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.1, 1.6, -0.4),
      new THREE.Vector3(0, 1.8, 0),
      new THREE.Vector3(1.1, 1.6, -0.4)
    ]);
    const cordMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, linewidth: 3 });
    const cordLine = new THREE.Line(cordGeo, cordMat);
    runwayGroup.add(cordLine);
    slingshotCordRef.current = cordLine;

    scene.add(runwayGroup);

    // Flight State Tracking
    let physicsState: FlightPhysicsState = {
      position: new THREE.Vector3(0, 1.8, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
      pitch: 0,
      roll: 0,
      yaw: 0,
      isStalled: false,
      altitude: 1.8
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
      positions.setXYZ(1, planePos.x, planePos.y, planePos.z);
      positions.needsUpdate = true;
    };

    // Touch Event Handlers for Mobile Slingshot & Steering
    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const now = performance.now();
      const state = useGameStore.getState().flightState;

      // Double-Tap Detection during flight -> 360° Barrel Roll
      if (state === 'flying') {
        if (now - lastTapTime < 280 && !activeStunt) {
          triggerStunt('roll');
        }
      }

      lastTapTime = now;
      touchStartTime = now;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStart = { x: touch.clientX, y: touch.clientY, active: true };
      gameAudio.init();

      if (state === 'idle') {
        useGameStore.getState().setFlightState('aiming');
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchStart.active) return;
      const touch = e.touches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;

      const state = useGameStore.getState().flightState;

      if (state === 'aiming') {
        // Slingshot pull-back (drag down/backward)
        const dist = Math.min(120, Math.sqrt(dx * dx + dy * dy));
        pullBack = { dx, dy, distance: dist };

        const pullRatio = dist / 120;
        planeGroup.position.set(-dx * 0.012, 1.8 - dy * 0.005, dy * 0.022);
        planeGroup.rotation.x = 0.15 + (dy / 120) * 0.35;
        planeGroup.rotation.y = -(dx / 120) * 0.45;
        updateCordPoints(planeGroup.position);
      } else if (state === 'flying') {
        // In-flight banking & pitch steering
        controls.rollInput = Math.max(-1, Math.min(1, dx / 80));
        controls.pitchInput = Math.max(-1, Math.min(1, -dy / 80));
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.active) return;
      touchStart.active = false;

      const state = useGameStore.getState().flightState;

      if (state === 'aiming') {
        // Launch Aircraft!
        const pullRatio = Math.max(0.15, pullBack.distance / 120);
        const impulseMult = 1.0 + upgrades.impulse * 0.12;
        const launchSpeed = pullRatio * 18.5 * impulseMult;

        const launchPitch = 0.18 + (pullBack.dy / 120) * 0.25;
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

        useGameStore.getState().setFlightState('flying');
        gameAudio.playLaunchSnap();

        // Hide slingshot cord after release
        if (slingshotCordRef.current) {
          slingshotCordRef.current.visible = false;
        }
      } else if (state === 'flying') {
        // Swipe Up Detection during flight -> Loop-the-Loop!
        const touch = e.changedTouches ? e.changedTouches[0] : null;
        if (touch) {
          const dtTouch = performance.now() - touchStartTime;
          const dyTouch = touch.clientY - touchStartY;
          const dxTouch = touch.clientX - touchStartX;
          if (dtTouch < 280 && dyTouch < -40 && Math.abs(dxTouch) < 60 && !activeStunt) {
            triggerStunt('loop');
          }
        }

        controls.pitchInput = 0;
        controls.rollInput = 0;
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });

    // 60 FPS Render & Physics Loop
    let lastTime = performance.now();
    let animId: number;

    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const currentFlightState = useGameStore.getState().flightState;

      if (currentFlightState === 'flying') {
        const liftMult = 1.0 + upgrades.lift * 0.10;
        const dragMult = Math.max(0.6, 1.0 - upgrades.drag * 0.08);

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

        // High-Speed Dive Paper Wing Flutter Oscillation
        if (physicsState.pitch < -0.22 && currentSpeed > 14) {
          planeGroup.rotation.z += Math.sin(currentTime * 0.05) * 0.035;
          if (Math.random() < 0.15) {
            gameAudio.playFlutterRustle();
          }
        }

        // Telemetry Store Update
        useGameStore.getState().updateTelemetry(currentDist, currentAlt, currentSpeed);
        if (onTelemetryUpdate) onTelemetryUpdate(currentDist, currentAlt, currentSpeed);

        // Audio update
        gameAudio.updateWindRustle(currentSpeed);

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

        // Check Touchdown / Ground Landing
        if (physicsState.altitude <= 0.02 && (currentSpeed < 2.5 || physicsState.position.y <= 0)) {
          gameAudio.stopFlightAudio();
          useGameStore.getState().touchdown();
          confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
        }
      } else if (currentFlightState === 'idle') {
        // Idle camera slight breathing
        camera.position.set(0, 2.8 + Math.sin(currentTime * 0.001) * 0.08, 6.5);
        camera.lookAt(0, 1.4, 0);
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
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      gameAudio.stopFlightAudio();
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
