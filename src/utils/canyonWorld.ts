import * as THREE from 'three';
import { GameLevel, TimeOfDay, BiomeType } from '../types/game';
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
  ambientParticles?: THREE.Group;
}

export function getWeatherLighting(distance: number, biome?: BiomeType): WeatherLightingConfig {
  const currentBiome = biome || 'canyon';

  if (distance < 1000) {
    if (currentBiome === 'sakura_valley') {
      return {
        timeOfDay: 'morning',
        skyColor: '#fbcfe8',
        fogColor: '#fdf2f8',
        sunColor: '#fff1f2',
        sunIntensity: 1.25,
        fogNear: 25,
        fogFar: 130
      };
    } else if (currentBiome === 'alpine_glacier') {
      return {
        timeOfDay: 'morning',
        skyColor: '#bae6fd',
        fogColor: '#e0f2fe',
        sunColor: '#f0fdfa',
        sunIntensity: 1.35,
        fogNear: 20,
        fogFar: 140
      };
    } else if (currentBiome === 'bamboo_forest') {
      return {
        timeOfDay: 'morning',
        skyColor: '#d1fae5',
        fogColor: '#ecfdf5',
        sunColor: '#fef9c3',
        sunIntensity: 1.2,
        fogNear: 20,
        fogFar: 120
      };
    }

    // Default Canyon Morning
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
    if (currentBiome === 'sakura_valley') {
      return {
        timeOfDay: 'sunset',
        skyColor: '#f472b6',
        fogColor: '#fbcfe8',
        sunColor: '#fb7185',
        sunIntensity: 1.4,
        fogNear: 15,
        fogFar: 110
      };
    } else if (currentBiome === 'alpine_glacier') {
      return {
        timeOfDay: 'sunset',
        skyColor: '#93c5fa',
        fogColor: '#c7d2fe',
        sunColor: '#818cf8',
        sunIntensity: 1.3,
        fogNear: 15,
        fogFar: 105
      };
    } else if (currentBiome === 'bamboo_forest') {
      return {
        timeOfDay: 'sunset',
        skyColor: '#a7f3d0',
        fogColor: '#fed7aa',
        sunColor: '#f59e0b',
        sunIntensity: 1.35,
        fogNear: 15,
        fogFar: 100
      };
    }

    // Default Canyon Sunset
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
    if (currentBiome === 'sakura_valley') {
      return {
        timeOfDay: 'night',
        skyColor: '#1e112a',
        fogColor: '#2e1065',
        sunColor: '#f43f5e',
        sunIntensity: 0.65,
        fogNear: 10,
        fogFar: 85
      };
    } else if (currentBiome === 'alpine_glacier') {
      return {
        timeOfDay: 'night',
        skyColor: '#0b132b',
        fogColor: '#1c2541',
        sunColor: '#60a5fa',
        sunIntensity: 0.6,
        fogNear: 10,
        fogFar: 90
      };
    } else if (currentBiome === 'bamboo_forest') {
      return {
        timeOfDay: 'night',
        skyColor: '#062e22',
        fogColor: '#0f3d2e',
        sunColor: '#34d399',
        sunIntensity: 0.55,
        fogNear: 10,
        fogFar: 80
      };
    }

    // Default Canyon Night
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

  const biome: BiomeType = level.biome || 'canyon';
  const segmentLength = 100;
  const numSegments = Math.max(10, Math.ceil(level.goalDistance / segmentLength) + 2);
  const canyonWidth = 28;
  const wallHeight = 22;

  // Biome Palettes
  let groundColor = 0xe2ded4;
  let wallColor = 0xc8bfa8;
  let propMatColor = 0xb91c1c;

  if (biome === 'sakura_valley') {
    groundColor = 0xdcfce7;
    wallColor = 0xf1f5f9;
    propMatColor = 0xdc2626; // Vermilion Red
  } else if (biome === 'alpine_glacier') {
    groundColor = 0xf0fdfa;
    wallColor = 0x93c5fd;
    propMatColor = 0x38bdf8; // Crystal Azure
  } else if (biome === 'bamboo_forest') {
    groundColor = 0x86efac;
    wallColor = 0x15803d;
    propMatColor = 0x22c55e; // Emerald Green
  }

  // Shared Materials
  const groundMat = new THREE.MeshStandardMaterial({
    color: groundColor,
    roughness: 0.9,
    metalness: 0.05,
    flatShading: true
  });

  const wallMat = new THREE.MeshStandardMaterial({
    color: wallColor,
    roughness: 0.95,
    metalness: biome === 'alpine_glacier' ? 0.25 : 0.0,
    flatShading: true
  });

  const propMat = new THREE.MeshStandardMaterial({
    color: propMatColor,
    roughness: 0.7,
    flatShading: true
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.3,
    metalness: 0.8
  });

  const thermalMat = new THREE.MeshBasicMaterial({
    color: biome === 'alpine_glacier' ? 0x67e8f9 : 0xfcd34d,
    transparent: true,
    opacity: 0.3,
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

    const zDist = Math.abs(zMid);

    // 1. Thermal updrafts every ~180m
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

    // 2. Floating Stars along flight path
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

    // 3. Windmills (Every ~250m)
    if (level.allowedObstacles.includes('windmill') && zDist >= 200 && i % 3 === 0) {
      const windmillGroup = new THREE.Group();
      const mastGeo = new THREE.CylinderGeometry(0.8, 1.2, 14, 8);
      const mast = new THREE.Mesh(mastGeo, wallMat);
      mast.position.set(0, 7, 0);
      windmillGroup.add(mast);

      const bladesGroup = new THREE.Group();
      bladesGroup.position.set(0, 13, 0);

      const bladeGeo = new THREE.BoxGeometry(1.2, 10, 0.15);
      const b1 = new THREE.Mesh(bladeGeo, propMat);
      const b2 = new THREE.Mesh(bladeGeo, propMat);
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

    // 4. Torii Gate Arches (Sakura Valley Biome)
    if (level.allowedObstacles.includes('torii') && zDist >= 150 && i % 3 === 1) {
      const toriiGroup = new THREE.Group();
      const pillarGeo = new THREE.CylinderGeometry(0.55, 0.65, 13, 12);
      const leftPillar = new THREE.Mesh(pillarGeo, propMat);
      leftPillar.position.set(-6.5, 6.5, 0);
      const rightPillar = new THREE.Mesh(pillarGeo, propMat);
      rightPillar.position.set(6.5, 6.5, 0);

      // Top crossbeam
      const beamGeo = new THREE.BoxGeometry(16, 0.9, 1.2);
      const beam = new THREE.Mesh(beamGeo, propMat);
      beam.position.set(0, 12.5, 0);

      toriiGroup.add(leftPillar, rightPillar, beam);
      toriiGroup.position.set(0, 0, zMid);

      trackGroup.add(toriiGroup);
      obstacles.push({
        id: `torii-${i}`,
        type: 'solid',
        center: new THREE.Vector3(0, 12.5, zMid),
        radius: 2.5,
        normal: new THREE.Vector3(0, 0, 1),
        meshGroup: toriiGroup
      });
    }

    // 5. Icicle Spire Columns (Alpine Glacier Biome)
    if (level.allowedObstacles.includes('icicle') && zDist >= 200 && i % 4 === 2) {
      const icicleGroup = new THREE.Group();
      const icicleMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.15, metalness: 0.35, flatShading: true });
      // Stalactite hanging down
      const topGeo = new THREE.ConeGeometry(1.6, 9, 8);
      topGeo.rotateX(Math.PI);
      const topSpire = new THREE.Mesh(topGeo, icicleMat);
      topSpire.position.set(i % 2 === 0 ? 4 : -4, 17, 0);

      // Stalagmite rising up
      const botGeo = new THREE.ConeGeometry(1.8, 8, 8);
      const botSpire = new THREE.Mesh(botGeo, icicleMat);
      botSpire.position.set(i % 2 === 0 ? -4 : 4, 4, 0);

      icicleGroup.add(topSpire, botSpire);
      icicleGroup.position.set(0, 0, zMid);

      trackGroup.add(icicleGroup);
      obstacles.push({
        id: `icicle-${i}`,
        type: 'solid',
        center: new THREE.Vector3(i % 2 === 0 ? -4 : 4, 4, zMid),
        radius: 2.2,
        normal: new THREE.Vector3(0, 0, 1),
        meshGroup: icicleGroup
      });
    }

    // 6. Bamboo Slalom Stalks (Bamboo Forest Biome)
    if (level.allowedObstacles.includes('bamboo') && zDist >= 150 && i % 3 === 2) {
      const bambooGroup = new THREE.Group();
      const bambooGeo = new THREE.CylinderGeometry(0.4, 0.5, 18, 8);
      const b1 = new THREE.Mesh(bambooGeo, propMat);
      b1.position.set(-4.5, 9, -5);
      const b2 = new THREE.Mesh(bambooGeo, propMat);
      b2.position.set(4.5, 9, 5);
      const b3 = new THREE.Mesh(bambooGeo, propMat);
      b3.position.set(0, 9, 0);

      bambooGroup.add(b1, b2, b3);
      bambooGroup.position.set(0, 0, zMid);

      trackGroup.add(bambooGroup);
      obstacles.push({
        id: `bamboo-${i}`,
        type: 'solid',
        center: new THREE.Vector3(0, 9, zMid),
        radius: 2.0,
        normal: new THREE.Vector3(0, 0, 1),
        meshGroup: bambooGroup
      });
    }

    // 7. Steam Geysers
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

    // 8. Lantern Arches
    if (level.allowedObstacles.includes('lantern') && zDist >= 400 && i % 5 === 2) {
      const archGroup = new THREE.Group();
      const archGeo = new THREE.TorusGeometry(8, 0.9, 8, 16, Math.PI);
      const archMesh = new THREE.Mesh(archGeo, wallMat);
      archMesh.position.set(0, 0, 0);
      archGroup.add(archMesh);

      const lanternGroup = new THREE.Group();
      lanternGroup.position.set(0, 7.5, 0);
      const lanternGeo = new THREE.SphereGeometry(1.1, 8, 8);
      const lanternMesh = new THREE.Mesh(lanternGeo, propMat);
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

  // Ambient Drifting Particles (Sakura petals or snow flurry)
  let ambientParticles: THREE.Group | undefined;
  if (biome === 'sakura_valley' || biome === 'alpine_glacier' || biome === 'bamboo_forest') {
    ambientParticles = new THREE.Group();
    const particleCount = 45;
    const particleMat = new THREE.MeshBasicMaterial({
      color: biome === 'sakura_valley' ? 0xf472b6 : (biome === 'alpine_glacier' ? 0xe0f2fe : 0xa7f3d0),
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    const particleGeo = new THREE.PlaneGeometry(0.35, 0.35);

    for (let p = 0; p < particleCount; p++) {
      const pMesh = new THREE.Mesh(particleGeo, particleMat);
      pMesh.position.set(
        (Math.random() - 0.5) * canyonWidth,
        Math.random() * wallHeight,
        -Math.random() * Math.min(600, level.goalDistance)
      );
      pMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      ambientParticles.add(pMesh);
    }
    trackGroup.add(ambientParticles);
  }

  return {
    trackGroup,
    segments,
    obstacles,
    level,
    ambientParticles
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

  // Animate ambient drifting particles (Sakura petals or snow flurry)
  if (track.ambientParticles) {
    const children = track.ambientParticles.children;
    for (let p = 0; p < children.length; p++) {
      const pt = children[p];
      pt.position.y -= 0.04;
      pt.position.x += Math.sin(time * 1.5 + p) * 0.02;
      pt.rotation.z += 0.03;
      if (pt.position.y < 0.2) {
        pt.position.y = 20;
      }
    }
  }
}
