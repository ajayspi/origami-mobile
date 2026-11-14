import * as THREE from 'three';
import { GameLevel, TimeOfDay } from '../types/game';
import { ObstacleBounds } from './flightPhysics';

export interface WeatherLightingConfig {
  timeOfDay: TimeOfDay;
  skyColor: string;
  fogColor: string;
  sunColor: string;
  sunIntensity: number;
  fogNear: number;
  fogFar: number;
}

export interface ObstacleEntity extends ObstacleBounds {
  id: string;
  meshGroup: THREE.Group;
  initialRotation?: number;
  rotationSpeed?: number;
  collected?: boolean;
}

export interface CanyonSegment {
  index: number;
  zStart: number;
  zEnd: number;
  mesh: THREE.Mesh;
}

export interface CanyonTrackData {
  trackGroup: THREE.Group;
  segments: CanyonSegment[];
  obstacles: ObstacleEntity[];
  level: GameLevel;
}

export function getWeatherLighting(distance: number): WeatherLightingConfig {
  if (distance < 1000) {
    return {
      timeOfDay: 'morning',
      skyColor: '#a5c9eb',
      fogColor: '#e0ecf8',
      sunColor: '#fff8e7',
      sunIntensity: 1.2,
      fogNear: 20,
      fogFar: 120
    };
  } else if (distance < 2000) {
    return {
      timeOfDay: 'sunset',
      skyColor: '#e28a52',
      fogColor: '#f3c68f',
      sunColor: '#ffaa44',
      sunIntensity: 1.4,
      fogNear: 15,
      fogFar: 100
    };
  } else {
    return {
      timeOfDay: 'night',
      skyColor: '#0f1423',
      fogColor: '#1a1e36',
      sunColor: '#b8c5e6',
      sunIntensity: 0.55,
      fogNear: 10,
      fogFar: 80
    };
  }
}

export function generateCanyonTrack(level: GameLevel): CanyonTrackData {
  const trackGroup = new THREE.Group();
  const segments: CanyonSegment[] = [];
  const obstacles: ObstacleEntity[] = [];

  const segmentLength = 100;
  const numSegments = Math.max(10, Math.ceil(level.goalDistance / segmentLength) + 2);
  const canyonWidth = 28;
  const wallHeight = 22;

  // Shared materials
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0xe2ded4,
    roughness: 0.9,
    metalness: 0.05,
    flatShading: true
  });

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xc8bfa8,
    roughness: 0.95,
    metalness: 0.0,
    flatShading: true
  });

  const windmillMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c,
    roughness: 0.7,
    flatShading: true
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.3,
    metalness: 0.8
  });

  const thermalMat = new THREE.MeshBasicMaterial({
    color: 0xfcd34d,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide
  });

  const geyserMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide
  });

  for (let i = 0; i < numSegments; i++) {
    const zStart = -i * segmentLength;
    const zEnd = -(i + 1) * segmentLength;
    const zMid = (zStart + zEnd) / 2;

    const segmentGroup = new THREE.Group();

    // Canyon Floor
    const floorGeo = new THREE.PlaneGeometry(canyonWidth, segmentLength, 4, 8);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMesh = new THREE.Mesh(floorGeo, groundMat);
    floorMesh.position.set(0, 0, zMid);
    floorMesh.receiveShadow = true;
    segmentGroup.add(floorMesh);

    // Left Canyon Wall
    const leftWallGeo = new THREE.PlaneGeometry(segmentLength, wallHeight, 8, 4);
    leftWallGeo.rotateY(Math.PI / 2);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-canyonWidth / 2, wallHeight / 2, zMid);
    segmentGroup.add(leftWall);

    // Right Canyon Wall
    const rightWallGeo = new THREE.PlaneGeometry(segmentLength, wallHeight, 8, 4);
    rightWallGeo.rotateY(-Math.PI / 2);
    const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
    rightWall.position.set(canyonWidth / 2, wallHeight / 2, zMid);
    segmentGroup.add(rightWall);

    trackGroup.add(segmentGroup);
    segments.push({
      index: i,
      zStart,
      zEnd,
      mesh: floorMesh
    });

    // Add Obstacles based on allowedObstacles
    const zDist = Math.abs(zMid);

    // Thermal updrafts every ~180m
    if (level.allowedObstacles.includes('thermal') && i % 2 === 1) {
      const thermalGroup = new THREE.Group();
      const cylGeo = new THREE.CylinderGeometry(4.5, 4.0, 25, 16, 1, true);
      const cylMesh = new THREE.Mesh(cylGeo, thermalMat);
      cylMesh.position.set(0, 12.5, 0);
      thermalGroup.add(cylMesh);
      thermalGroup.position.set((Math.sin(i) * 6), 0, zMid);

      trackGroup.add(thermalGroup);
      obstacles.push({
        id: `thermal-${i}`,
        type: 'thermal',
        center: thermalGroup.position.clone(),
        radius: 4.5,
        height: 25,
        meshGroup: thermalGroup
      });
    }

    // Floating Stars along flight path
    const starCount = 3;
    for (let s = 0; s < starCount; s++) {
      const starGroup = new THREE.Group();
      const starGeo = new THREE.OctahedronGeometry(0.7, 0);
      const starMesh = new THREE.Mesh(starGeo, goldMat);
      starGroup.add(starMesh);

      const starX = Math.sin(i * 3 + s) * 8;
      const starY = 4.0 + Math.cos(i + s) * 2.5;
      const starZ = zStart - (s + 1) * (segmentLength / (starCount + 1));
      starGroup.position.set(starX, starY, starZ);

      trackGroup.add(starGroup);
      obstacles.push({
        id: `star-${i}-${s}`,
        type: 'star',
        center: starGroup.position.clone(),
        radius: 1.2,
        meshGroup: starGroup,
        collected: false
      });
    }

    // Windmills (Every ~250m)
    if (level.allowedObstacles.includes('windmill') && zDist >= 200 && i % 3 === 0) {
      const windmillGroup = new THREE.Group();
      // Mast
      const mastGeo = new THREE.CylinderGeometry(0.8, 1.2, 14, 8);
      const mast = new THREE.Mesh(mastGeo, wallMat);
      mast.position.set(0, 7, 0);
      windmillGroup.add(mast);

      // Blades Group
      const bladesGroup = new THREE.Group();
      bladesGroup.position.set(0, 13, 0);

      const bladeGeo = new THREE.BoxGeometry(1.2, 10, 0.15);
      const b1 = new THREE.Mesh(bladeGeo, windmillMat);
      const b2 = new THREE.Mesh(bladeGeo, windmillMat);
      b2.rotation.z = Math.PI / 2;
      bladesGroup.add(b1, b2);

      windmillGroup.add(bladesGroup);
      const posX = i % 2 === 0 ? 5 : -5;
      windmillGroup.position.set(posX, 0, zMid);

      trackGroup.add(windmillGroup);
      obstacles.push({
        id: `windmill-${i}`,
        type: 'solid',
        center: new THREE.Vector3(posX, 13, zMid),
        radius: 5.2,
        normal: new THREE.Vector3(0, 0, 1),
        meshGroup: bladesGroup,
        rotationSpeed: 1.2
      });
    }

    // Steam Geysers
    if (level.allowedObstacles.includes('geyser') && zDist >= 300 && i % 4 === 1) {
      const geyserGroup = new THREE.Group();
      const steamGeo = new THREE.ConeGeometry(3.5, 18, 16);
      const steamMesh = new THREE.Mesh(steamGeo, geyserMat);
      steamMesh.position.set(0, 9, 0);
      geyserGroup.add(steamMesh);
      geyserGroup.position.set((Math.cos(i) * 5), 0, zMid - 20);

      trackGroup.add(geyserGroup);
      obstacles.push({
        id: `geyser-${i}`,
        type: 'geyser',
        center: geyserGroup.position.clone(),
        radius: 3.5,
        height: 18,
        meshGroup: geyserGroup
      });
    }

    // Arches with swinging lanterns
    if (level.allowedObstacles.includes('lantern') && zDist >= 400 && i % 5 === 2) {
      const archGroup = new THREE.Group();
      const archGeo = new THREE.TorusGeometry(8, 0.9, 8, 16, Math.PI);
      const archMesh = new THREE.Mesh(archGeo, wallMat);
      archMesh.position.set(0, 0, 0);
      archGroup.add(archMesh);

      // Hanging lantern
      const lanternGroup = new THREE.Group();
      lanternGroup.position.set(0, 7.5, 0);
      const lanternGeo = new THREE.SphereGeometry(1.1, 8, 8);
      const lanternMesh = new THREE.Mesh(lanternGeo, windmillMat);
      lanternMesh.position.set(0, -3.5, 0);
      lanternGroup.add(lanternMesh);

      archGroup.add(lanternGroup);
      archGroup.position.set(0, 0, zMid);

      trackGroup.add(archGroup);
      obstacles.push({
        id: `lantern-${i}`,
        type: 'solid',
        center: new THREE.Vector3(0, 4.0, zMid),
        radius: 1.5,
        normal: new THREE.Vector3(0, 0, 1),
        meshGroup: lanternGroup,
        rotationSpeed: 2.0
      });
    }
  }

  return {
    trackGroup,
    segments,
    obstacles,
    level
  };
}

export function updateDynamicObstacles(track: CanyonTrackData, time: number): void {
  for (const obs of track.obstacles) {
    if (obs.type === 'solid' && obs.rotationSpeed) {
      if (obs.id.startsWith('windmill')) {
        obs.meshGroup.rotation.z = time * obs.rotationSpeed;
      } else if (obs.id.startsWith('lantern')) {
        obs.meshGroup.rotation.z = Math.sin(time * obs.rotationSpeed) * 0.4;
      }
    } else if (obs.type === 'star' && !obs.collected) {
      obs.meshGroup.rotation.y = time * 2.5;
      obs.meshGroup.rotation.x = Math.sin(time * 3) * 0.2;
    } else if (obs.type === 'geyser') {
      const pulse = 0.8 + Math.sin(time * 4) * 0.25;
      obs.meshGroup.scale.set(pulse, 1.0 + Math.sin(time * 5) * 0.3, pulse);
    }
  }
}
