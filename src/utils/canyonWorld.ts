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
  cloudsGroup?: THREE.Group;
  cliffElevation: number;
  launchpadMesh: THREE.Mesh;
  landingTarget: {
    center: THREE.Vector3;
    radius: number;
    meshGroup: THREE.Group;
  };
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
        sunIntensity: 1.35,
        fogNear: 35,
        fogFar: 180
      };
    } else if (currentBiome === 'alpine_glacier') {
      return {
        timeOfDay: 'morning',
        skyColor: '#bae6fd',
        fogColor: '#e0f2fe',
        sunColor: '#f0fdfa',
        sunIntensity: 1.45,
        fogNear: 30,
        fogFar: 190
      };
    } else if (currentBiome === 'bamboo_forest') {
      return {
        timeOfDay: 'morning',
        skyColor: '#d1fae5',
        fogColor: '#ecfdf5',
        sunColor: '#fef9c3',
        sunIntensity: 1.3,
        fogNear: 30,
        fogFar: 170
      };
    }

    // Default Canyon Morning (Crisp Sky & Warm Golden Rays)
    return {
      timeOfDay: 'morning',
      skyColor: '#7dd3fc',
      fogColor: '#e0f2fe',
      sunColor: '#fef08a',
      sunIntensity: 1.35,
      fogNear: 30,
      fogFar: 175
    };
  } else if (distance < 2000) {
    if (currentBiome === 'sakura_valley') {
      return {
        timeOfDay: 'sunset',
        skyColor: '#f472b6',
        fogColor: '#fbcfe8',
        sunColor: '#fb7185',
        sunIntensity: 1.45,
        fogNear: 25,
        fogFar: 160
      };
    } else if (currentBiome === 'alpine_glacier') {
      return {
        timeOfDay: 'sunset',
        skyColor: '#93c5fa',
        fogColor: '#c7d2fe',
        sunColor: '#818cf8',
        sunIntensity: 1.35,
        fogNear: 25,
        fogFar: 150
      };
    } else if (currentBiome === 'bamboo_forest') {
      return {
        timeOfDay: 'sunset',
        skyColor: '#a7f3d0',
        fogColor: '#fed7aa',
        sunColor: '#f59e0b',
        sunIntensity: 1.4,
        fogNear: 25,
        fogFar: 155
      };
    }

    // Default Canyon Sunset (Rich Tangerine & Amber Horizon)
    return {
      timeOfDay: 'sunset',
      skyColor: '#ea580c',
      fogColor: '#fed7aa',
      sunColor: '#fbbf24',
      sunIntensity: 1.5,
      fogNear: 20,
      fogFar: 150
    };
  } else {
    if (currentBiome === 'sakura_valley') {
      return {
        timeOfDay: 'night',
        skyColor: '#1e112a',
        fogColor: '#2e1065',
        sunColor: '#f43f5e',
        sunIntensity: 0.75,
        fogNear: 20,
        fogFar: 130
      };
    } else if (currentBiome === 'alpine_glacier') {
      return {
        timeOfDay: 'night',
        skyColor: '#0b132b',
        fogColor: '#1c2541',
        sunColor: '#60a5fa',
        sunIntensity: 0.7,
        fogNear: 20,
        fogFar: 135
      };
    } else if (currentBiome === 'bamboo_forest') {
      return {
        timeOfDay: 'night',
        skyColor: '#062e22',
        fogColor: '#0f3d2e',
        sunColor: '#34d399',
        sunIntensity: 0.65,
        fogNear: 20,
        fogFar: 125
      };
    }

    // Default Canyon Night (Deep Starry Indigo with Moonlight)
    return {
      timeOfDay: 'night',
      skyColor: '#0f172a',
      fogColor: '#1e293b',
      sunColor: '#38bdf8',
      sunIntensity: 0.65,
      fogNear: 18,
      fogFar: 120
    };
  }
}

// Sinuous natural canyon center path: creates an organic curving valley
export function getCanyonCenter(z: number): number {
  return Math.sin(z * 0.018) * 7.5 + Math.sin(z * 0.006) * 4.0;
}

export function generateCanyonTrack(level: GameLevel): CanyonTrackData {
  const trackGroup = new THREE.Group();
  const segments: CanyonSegment[] = [];
  const obstacles: ObstacleEntity[] = [];

  const biome: BiomeType = level.biome || 'canyon';
  const segmentLength = 100;
  const numSegments = Math.max(10, Math.ceil(level.goalDistance / segmentLength) + 2);

  // ---------------------------------------------------------------------------
  // 1. STYLIZED PAPERCRAFT COLOR PALETTES
  // ---------------------------------------------------------------------------
  let groundBaseHex = 0xe2ded4;
  let riverRibbonHex = 0x38bdf8;
  let wallLowerHex = 0xd6cbb4;
  let wallUpperHex = 0xb8aa8d;
  let mountainBackHex = 0x8a7b62;
  let treeFoliageHex = 0x166534;
  let propPrimaryHex = 0xb91c1c;

  if (biome === 'sakura_valley') {
    groundBaseHex = 0xdcfce7;      // Spring moss
    riverRibbonHex = 0xf472b6;     // Reflective sakura stream
    wallLowerHex = 0xf8fafc;       // Pale paper cliff
    wallUpperHex = 0xf1f5f9;       // Rice paper plateau
    mountainBackHex = 0x94a3b8;    // Soft mist peaks
    treeFoliageHex = 0xf472b6;     // Cherry blossom pink
    propPrimaryHex = 0xdc2626;     // Vermilion Red Torii
  } else if (biome === 'alpine_glacier') {
    groundBaseHex = 0xf0fdfa;      // Snow crust
    riverRibbonHex = 0x0284c7;     // Deep glacial ice melt
    wallLowerHex = 0xbae6fd;       // Crystalline glacier
    wallUpperHex = 0x7dd3fc;       // Azure ice shelf
    mountainBackHex = 0x3b82f6;    // Towering alpine horn
    treeFoliageHex = 0x0f766e;     // Frost pine
    propPrimaryHex = 0x38bdf8;     // Crystal cyan
  } else if (biome === 'bamboo_forest') {
    groundBaseHex = 0x86efac;      // Forest moss
    riverRibbonHex = 0x0ea5e9;     // Winding brook
    wallLowerHex = 0x4ade80;       // Dense moss cliff
    wallUpperHex = 0x16a34a;       // High canopy ridge
    mountainBackHex = 0x14532d;    // Deep mountain green
    treeFoliageHex = 0x15803d;     // Emerald bamboo foliage
    propPrimaryHex = 0x22c55e;     // Vibrant bamboo stalk
  }

  // Materials with authentic matte paper finish & flat-shading creases
  const groundMat = new THREE.MeshStandardMaterial({
    color: groundBaseHex,
    roughness: 0.88,
    metalness: 0.02,
    flatShading: true
  });

  const riverMat = new THREE.MeshStandardMaterial({
    color: riverRibbonHex,
    roughness: 0.25,
    metalness: 0.45,
    flatShading: true
  });

  const wallLowerMat = new THREE.MeshStandardMaterial({
    color: wallLowerHex,
    roughness: 0.92,
    metalness: biome === 'alpine_glacier' ? 0.2 : 0.0,
    flatShading: true
  });

  const wallUpperMat = new THREE.MeshStandardMaterial({
    color: wallUpperHex,
    roughness: 0.95,
    metalness: biome === 'alpine_glacier' ? 0.2 : 0.0,
    flatShading: true
  });

  const mountainMat = new THREE.MeshStandardMaterial({
    color: mountainBackHex,
    roughness: 0.98,
    metalness: 0.0,
    flatShading: true
  });

  const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9, flatShading: true });
  const treeFoliageMat = new THREE.MeshStandardMaterial({ color: treeFoliageHex, roughness: 0.85, flatShading: true });
  const propMat = new THREE.MeshStandardMaterial({ color: propPrimaryHex, roughness: 0.65, flatShading: true });
  const goldStarMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.85, flatShading: true });

  const thermalRingMat = new THREE.MeshBasicMaterial({
    color: biome === 'alpine_glacier' ? 0x67e8f9 : 0xfcd34d,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide
  });

  const geyserMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide
  });

  // ---------------------------------------------------------------------------
  // 2. PROCEDURAL 30-METER CLIFF PRECIPICE & CANYON CORRIDOR
  // ---------------------------------------------------------------------------
  const cliffElevation = 30.0;
  const halfValleyWidth = 14;

  // 2.0 Elevated Launchpad on Cliff Edge
  const launchpadGeo = new THREE.BoxGeometry(10, 1.5, 14);
  const launchpadMat = new THREE.MeshStandardMaterial({
    color: 0xf5efe6,
    roughness: 0.85,
    flatShading: true
  });
  const launchpadMesh = new THREE.Mesh(launchpadGeo, launchpadMat);
  launchpadMesh.position.set(0, cliffElevation, 5);
  launchpadMesh.receiveShadow = true;
  trackGroup.add(launchpadMesh);

  // Terraced cliff wall descending from y=30 to y=0 behind the launch edge
  const cliffWallGeo = new THREE.BoxGeometry(24, 30, 8);
  const cliffWallMat = new THREE.MeshStandardMaterial({
    color: wallLowerHex,
    roughness: 0.95,
    flatShading: true
  });
  const cliffWall = new THREE.Mesh(cliffWallGeo, cliffWallMat);
  cliffWall.position.set(0, 15.0, 9);
  cliffWall.receiveShadow = true;
  trackGroup.add(cliffWall);

  // Updraft buffer directly in front of the cliff ledge (catching steep downward glides)
  const cliffUpdraftGroup = new THREE.Group();
  const cliffTorusGeo = new THREE.RingGeometry(4.8, 6.2, 8);
  cliffTorusGeo.rotateX(Math.PI / 2);
  const cliffRingMesh = new THREE.Mesh(cliffTorusGeo, thermalRingMat);
  cliffUpdraftGroup.add(cliffRingMesh);
  cliffUpdraftGroup.position.set(0, 28.0, -15.0);
  trackGroup.add(cliffUpdraftGroup);

  obstacles.push({
    id: 'cliff-thermal-buffer',
    type: 'thermal',
    center: cliffUpdraftGroup.position.clone(),
    radius: 8.0,
    height: 20.0,
    meshGroup: cliffUpdraftGroup
  });

  // Cliff Ledge Whirlpool Catapult (Supercharged forward acceleration right off the precipice)
  const cliffWhirlpoolGroup = new THREE.Group();
  const wpRingGeo = new THREE.RingGeometry(2.8, 4.4, 6);
  wpRingGeo.rotateX(Math.PI / 3);
  const wpRing1 = new THREE.Mesh(wpRingGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
  const wpRing2 = new THREE.Mesh(wpRingGeo, new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
  wpRing2.scale.set(0.68, 0.68, 0.68);
  wpRing2.position.set(0, 0, -0.6);
  cliffWhirlpoolGroup.add(wpRing1, wpRing2);
  cliffWhirlpoolGroup.position.set(0, 31.0, -35.0);
  trackGroup.add(cliffWhirlpoolGroup);

  obstacles.push({
    id: 'cliff-whirlpool-catapult',
    type: 'whirlpool',
    center: cliffWhirlpoolGroup.position.clone(),
    radius: 6.0,
    meshGroup: cliffWhirlpoolGroup
  });

  // Launch Sky Highway Accelerator Gate (Right in front of cliff edge at cruising altitude)
  const launchGateGroup = new THREE.Group();
  const lGateGeo = new THREE.RingGeometry(3.6, 4.6, 6);
  const lGateMesh = new THREE.Mesh(lGateGeo, new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    roughness: 0.3,
    side: THREE.DoubleSide,
    flatShading: true
  }));
  launchGateGroup.add(lGateMesh);
  launchGateGroup.position.set(0, 34.0, -55.0);
  trackGroup.add(launchGateGroup);
  obstacles.push({
    id: 'cliff-launch-speedgate',
    type: 'speed_gate',
    center: launchGateGroup.position.clone(),
    radius: 4.8,
    meshGroup: launchGateGroup,
    collected: false
  });

  // Launch Arc Golden Star Chain (3 Stars ascending across natural slingshot trajectory)
  for (let s = 0; s < 3; s++) {
    const starGroup = new THREE.Group();
    const starMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.9, 0), goldStarMat);
    const starHalo = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.15, 6), new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
    starGroup.add(starMesh, starHalo);
    const archY = 32.0 + Math.sin((s / 2) * Math.PI) * 7.0; // Arcs from y=32.0 up to y=39.0
    const archZ = -25 - s * 20;
    starGroup.position.set(Math.sin(s * 1.2) * 2.5, archY, archZ);
    trackGroup.add(starGroup);
    obstacles.push({
      id: `launch-star-${s}`,
      type: 'star',
      center: starGroup.position.clone(),
      radius: 2.2,
      meshGroup: starGroup,
      collected: false
    });
  }

  for (let i = 0; i < numSegments; i++) {
    const zStart = -i * segmentLength;
    const zEnd = -(i + 1) * segmentLength;
    const zMid = (zStart + zEnd) / 2;
    const centerX = getCanyonCenter(zMid);

    const segmentGroup = new THREE.Group();

    // 2.1 Faceted Valley Floor
    const floorGeo = new THREE.PlaneGeometry(halfValleyWidth * 2 + 8, segmentLength, 2, 2);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMesh = new THREE.Mesh(floorGeo, groundMat);
    floorMesh.position.set(centerX, 0, zMid);
    floorMesh.receiveShadow = true;
    segmentGroup.add(floorMesh);

    // 2.2 Sinuous Paper River Ribbon winding down the center
    const riverGeo = new THREE.PlaneGeometry(5.5, segmentLength, 1, 2);
    riverGeo.rotateX(-Math.PI / 2);
    const riverMesh = new THREE.Mesh(riverGeo, riverMat);
    riverMesh.position.set(centerX + Math.sin(zMid * 0.03) * 2.0, 0.03, zMid);
    riverMesh.receiveShadow = true;
    segmentGroup.add(riverMesh);

    // 2.3 Stepped Terraced Paper Cliffs (Left & Right)
    // Shelf 1 (Low shelf y = 7m), Shelf 2 (Mid shelf y = 15m), Shelf 3 (High plateau y = 24m)
    // Left Lower Terraced Wall
    const leftLowerGeo = new THREE.BoxGeometry(8, 8, segmentLength);
    const leftLower = new THREE.Mesh(leftLowerGeo, wallLowerMat);
    leftLower.position.set(centerX - halfValleyWidth - 4, 3.5, zMid);
    leftLower.receiveShadow = true;
    leftLower.castShadow = true;
    segmentGroup.add(leftLower);

    // Right Lower Terraced Wall
    const rightLowerGeo = new THREE.BoxGeometry(8, 8, segmentLength);
    const rightLower = new THREE.Mesh(rightLowerGeo, wallLowerMat);
    rightLower.position.set(centerX + halfValleyWidth + 4, 3.5, zMid);
    rightLower.receiveShadow = true;
    rightLower.castShadow = true;
    segmentGroup.add(rightLower);

    // Left Upper Stepped Plateau
    const leftUpperGeo = new THREE.BoxGeometry(14, 16, segmentLength);
    const leftUpper = new THREE.Mesh(leftUpperGeo, wallUpperMat);
    leftUpper.position.set(centerX - halfValleyWidth - 14, 11, zMid);
    leftUpper.receiveShadow = true;
    leftUpper.castShadow = true;
    segmentGroup.add(leftUpper);

    // Right Upper Stepped Plateau
    const rightUpperGeo = new THREE.BoxGeometry(14, 16, segmentLength);
    const rightUpper = new THREE.Mesh(rightUpperGeo, wallUpperMat);
    rightUpper.position.set(centerX + halfValleyWidth + 14, 11, zMid);
    rightUpper.receiveShadow = true;
    rightUpper.castShadow = true;
    segmentGroup.add(rightUpper);

    // 2.4 Majestic Distant Origami Mountain Silhouettes
    const leftMtnGeo = new THREE.ConeGeometry(24, 34, 4);
    leftMtnGeo.rotateY(Math.PI / 4);
    const leftMtn = new THREE.Mesh(leftMtnGeo, mountainMat);
    leftMtn.position.set(centerX - halfValleyWidth - 32, 16, zMid);
    segmentGroup.add(leftMtn);

    const rightMtnGeo = new THREE.ConeGeometry(22, 30, 4);
    rightMtnGeo.rotateY(Math.PI / 4);
    const rightMtn = new THREE.Mesh(rightMtnGeo, mountainMat);
    rightMtn.position.set(centerX + halfValleyWidth + 30, 14, zMid + 20);
    segmentGroup.add(rightMtn);

    // 2.5 Origami Conifer / Cherry Blossom Trees clustered on shelves
    const treeCount = 1;
    for (let t = 0; t < treeCount; t++) {
      const isLeft = t % 2 === 0;
      const treeGroup = new THREE.Group();
      const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.4, 4);
      const trunk = new THREE.Mesh(trunkGeo, treeTrunkMat);
      trunk.position.set(0, 0.7, 0);
      treeGroup.add(trunk);

      // 2 Stacked Conical Folded Foliage Tiers
      const tier1 = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.6, 4), treeFoliageMat);
      tier1.position.set(0, 1.8, 0);
      const tier2 = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.3, 4), treeFoliageMat);
      tier2.position.set(0, 2.7, 0);
      treeGroup.add(tier1, tier2);

      const treeX = centerX + (isLeft ? -halfValleyWidth - 1.5 : halfValleyWidth + 1.5);
      const treeZ = zStart - (t + 1) * (segmentLength / (treeCount + 1));
      treeGroup.position.set(treeX, 7.0, treeZ);
      treeGroup.rotation.y = t * 1.2;
      segmentGroup.add(treeGroup);
    }

    trackGroup.add(segmentGroup);
    segments.push({
      index: i,
      zStart,
      zEnd,
      mesh: floorMesh
    });

    // -------------------------------------------------------------------------
    // 3. INTERACTIVE OBSTACLES & THERMAL SPIRAL RINGS
    // -------------------------------------------------------------------------
    const zDist = Math.abs(zMid);

    // 3.1 Spiraling Golden Paper Thermal Vortex (Spanning Full Vertical Corridor)
    if (level.allowedObstacles.includes('thermal') && i % 2 === 1) {
      const thermalGroup = new THREE.Group();
      const ringCount = 3;
      for (let r = 0; r < ringCount; r++) {
        const torusGeo = new THREE.RingGeometry(3.2 - r * 0.4, 4.2 - r * 0.4, 6);
        torusGeo.rotateX(Math.PI / 2);
        const ringMesh = new THREE.Mesh(torusGeo, thermalRingMat);
        ringMesh.position.set(0, 8 + r * 11.0, 0); // Spanning y=8, 19, 30
        thermalGroup.add(ringMesh);
      }
      thermalGroup.position.set(centerX + Math.sin(i) * 5, 0, zMid);

      trackGroup.add(thermalGroup);
      obstacles.push({
        id: `thermal-${i}`,
        type: 'thermal',
        center: new THREE.Vector3(centerX + Math.sin(i) * 5, 20.0, zMid),
        radius: 6.0,
        height: 38,
        meshGroup: thermalGroup
      });
    }

    // 3.2 Sparkling Golden Lucky Stars (Stratified Across Sky Altitudes)
    const starCount = 2;
    for (let s = 0; s < starCount; s++) {
      const starGroup = new THREE.Group();
      const starGeo = new THREE.OctahedronGeometry(0.9, 0);
      const starMesh = new THREE.Mesh(starGeo, goldStarMat);
      starGroup.add(starMesh);

      // Star core glow ring
      const haloGeo = new THREE.RingGeometry(0.85, 1.15, 6);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      starGroup.add(halo);

      const starX = centerX + Math.sin(i * 3 + s) * 7.5;
      // Sky altitude strata: s=0 in High Sky (25-39m), s=1 in Mid Glide (14-26m)
      const starY = s === 0
        ? (32.0 + Math.sin(i * 1.7) * 7.0)
        : (20.0 + Math.cos(i * 1.5) * 6.0);

      const starZ = zStart - (s + 1) * (segmentLength / (starCount + 1));
      starGroup.position.set(starX, starY, starZ);

      trackGroup.add(starGroup);
      obstacles.push({
        id: `star-${i}-${s}`,
        type: 'star',
        center: starGroup.position.clone(),
        radius: 2.2,
        meshGroup: starGroup,
        collected: false
      });
    }

    // 3.3 Authentic Papercraft Windmills
    if (level.allowedObstacles.includes('windmill') && zDist >= 200 && i % 3 === 0) {
      const windmillGroup = new THREE.Group();
      // Wooden lattice timber tower
      const towerGeo = new THREE.CylinderGeometry(1.0, 1.8, 15, 6);
      const tower = new THREE.Mesh(towerGeo, wallLowerMat);
      tower.position.set(0, 7.5, 0);
      windmillGroup.add(tower);

      // 4-Blade Folded Paper Rotor
      const bladesGroup = new THREE.Group();
      bladesGroup.position.set(0, 14.5, 0.4);

      const bladeGeo = new THREE.BoxGeometry(1.4, 11, 0.18);
      const b1 = new THREE.Mesh(bladeGeo, propMat);
      const b2 = new THREE.Mesh(bladeGeo, propMat);
      b2.rotation.z = Math.PI / 2;

      // Center wooden hub cap
      const hubGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 8);
      hubGeo.rotateX(Math.PI / 2);
      const hub = new THREE.Mesh(hubGeo, treeTrunkMat);

      bladesGroup.add(b1, b2, hub);
      windmillGroup.add(bladesGroup);

      const posX = centerX + (i % 2 === 0 ? 5.5 : -5.5);
      windmillGroup.position.set(posX, 0, zMid);

      trackGroup.add(windmillGroup);
      obstacles.push({
        id: `windmill-${i}`,
        type: 'solid',
        center: new THREE.Vector3(posX, 14.5, zMid),
        radius: 5.4,
        normal: new THREE.Vector3(0, 0, 1),
        meshGroup: bladesGroup,
        rotationSpeed: 1.2
      });
    }

    // 3.4 Vermilion Torii Gate Arches (Sakura Valley Biome)
    if (level.allowedObstacles.includes('torii') && zDist >= 150 && i % 3 === 1) {
      const toriiGroup = new THREE.Group();
      const pillarGeo = new THREE.CylinderGeometry(0.6, 0.7, 13, 8);
      const leftPillar = new THREE.Mesh(pillarGeo, propMat);
      leftPillar.position.set(-7, 6.5, 0);
      const rightPillar = new THREE.Mesh(pillarGeo, propMat);
      rightPillar.position.set(7, 6.5, 0);

      // Sweeping Curved Top Crossbeam
      const beamGeo = new THREE.BoxGeometry(17, 1.1, 1.4);
      const beam = new THREE.Mesh(beamGeo, propMat);
      beam.position.set(0, 12.8, 0);

      const lintelGeo = new THREE.BoxGeometry(15, 0.7, 1.0);
      const lintel = new THREE.Mesh(lintelGeo, propMat);
      lintel.position.set(0, 11.2, 0);

      toriiGroup.add(leftPillar, rightPillar, beam, lintel);
      toriiGroup.position.set(centerX, 0, zMid);

      trackGroup.add(toriiGroup);
      obstacles.push({
        id: `torii-${i}`,
        type: 'solid',
        center: new THREE.Vector3(centerX, 12.8, zMid),
        radius: 2.5,
        normal: new THREE.Vector3(0, 0, 1),
        meshGroup: toriiGroup
      });
    }

    // 3.5 Crystalline Icicle Spires (Alpine Glacier Biome)
    if (level.allowedObstacles.includes('icicle') && zDist >= 200 && i % 4 === 2) {
      const icicleGroup = new THREE.Group();
      const icicleMat = new THREE.MeshStandardMaterial({
        color: 0xbae6fd,
        roughness: 0.15,
        metalness: 0.45,
        flatShading: true
      });

      // Hanging Stalactite
      const topGeo = new THREE.ConeGeometry(1.8, 10, 6);
      topGeo.rotateX(Math.PI);
      const topSpire = new THREE.Mesh(topGeo, icicleMat);
      topSpire.position.set(i % 2 === 0 ? 4.5 : -4.5, 17, 0);

      // Rising Stalagmite
      const botGeo = new THREE.ConeGeometry(2.0, 9, 6);
      const botSpire = new THREE.Mesh(botGeo, icicleMat);
      botSpire.position.set(i % 2 === 0 ? -4.5 : 4.5, 4.5, 0);

      icicleGroup.add(topSpire, botSpire);
      icicleGroup.position.set(centerX, 0, zMid);

      trackGroup.add(icicleGroup);
      obstacles.push({
        id: `icicle-${i}`,
        type: 'solid',
        center: new THREE.Vector3(centerX + (i % 2 === 0 ? -4.5 : 4.5), 4.5, zMid),
        radius: 2.4,
        normal: new THREE.Vector3(0, 0, 1),
        meshGroup: icicleGroup
      });
    }

    // 3.6 Bamboo Slalom Stalks (Bamboo Forest Biome)
    if (level.allowedObstacles.includes('bamboo') && zDist >= 150 && i % 3 === 2) {
      const bambooGroup = new THREE.Group();
      const bambooGeo = new THREE.CylinderGeometry(0.45, 0.55, 19, 6);
      const b1 = new THREE.Mesh(bambooGeo, propMat);
      b1.position.set(-5, 9.5, -6);
      const b2 = new THREE.Mesh(bambooGeo, propMat);
      b2.position.set(5, 9.5, 6);
      const b3 = new THREE.Mesh(bambooGeo, propMat);
      b3.position.set(0, 9.5, 0);

      bambooGroup.add(b1, b2, b3);
      bambooGroup.position.set(centerX, 0, zMid);

      trackGroup.add(bambooGroup);
      obstacles.push({
        id: `bamboo-${i}`,
        type: 'solid',
        center: new THREE.Vector3(centerX, 9.5, zMid),
        radius: 2.2,
        normal: new THREE.Vector3(0, 0, 1),
        meshGroup: bambooGroup
      });
    }

    // 3.7 Volcanic Steam Geysers
    if (level.allowedObstacles.includes('geyser') && zDist >= 300 && i % 4 === 1) {
      const geyserGroup = new THREE.Group();
      const steamGeo = new THREE.ConeGeometry(3.6, 18, 12);
      const steamMesh = new THREE.Mesh(steamGeo, geyserMat);
      steamMesh.position.set(0, 9, 0);
      geyserGroup.add(steamMesh);
      geyserGroup.position.set(centerX + Math.cos(i) * 5, 0, zMid - 20);

      trackGroup.add(geyserGroup);
      obstacles.push({
        id: `geyser-${i}`,
        type: 'geyser',
        center: geyserGroup.position.clone(),
        radius: 3.6,
        height: 18,
        meshGroup: geyserGroup
      });
    }

    // 3.8 Torii Arches with Swinging Lanterns
    if (level.allowedObstacles.includes('lantern') && zDist >= 400 && i % 5 === 2) {
      const archGroup = new THREE.Group();
      const archGeo = new THREE.TorusGeometry(8.5, 0.95, 6, 18, Math.PI);
      const archMesh = new THREE.Mesh(archGeo, wallLowerMat);
      archMesh.position.set(0, 0, 0);
      archGroup.add(archMesh);

      // Hanging lantern
      const lanternGroup = new THREE.Group();
      lanternGroup.position.set(0, 8.0, 0);
      const lanternGeo = new THREE.SphereGeometry(1.2, 8, 8);
      const lanternMesh = new THREE.Mesh(lanternGeo, propMat);
      lanternMesh.position.set(0, -3.5, 0);
      lanternGroup.add(lanternMesh);

      archGroup.add(lanternGroup);
      archGroup.position.set(centerX, 0, zMid);

      trackGroup.add(archGroup);
      obstacles.push({
        id: `lantern-${i}`,
        type: 'solid',
        center: new THREE.Vector3(centerX, 4.5, zMid),
        radius: 1.6,
        normal: new THREE.Vector3(0, 0, 1),
        meshGroup: lanternGroup,
        rotationSpeed: 2.0
      });
    }

    // 3.9 In-Air Powers, Whirlpools, Speed Loops & Surprises
    if (i > 0) {
      // (a) Supersonic Torii Accelerator Speed Gate (Elevated at Soaring Cruise Altitudes)
      if (i % 2 === 0) {
        const gateGroup = new THREE.Group();
        const archGeo = new THREE.RingGeometry(3.6, 4.6, 6);
        const gateMesh = new THREE.Mesh(archGeo, new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xd97706,
          roughness: 0.3,
          side: THREE.DoubleSide,
          flatShading: true
        }));
        gateGroup.add(gateMesh);

        // Chevron arrow inside gate
        const arrowGeo = new THREE.ConeGeometry(0.75, 1.8, 4);
        arrowGeo.rotateX(-Math.PI / 2);
        const arrowMesh = new THREE.Mesh(arrowGeo, new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.9 }));
        arrowMesh.position.set(0, 0, 0);
        gateGroup.add(arrowMesh);

        const gateZ = zStart - 30;
        const gateY = 29.0 + Math.sin(i * 1.3) * 6.0; // Cruise altitude 23m-35m
        const gateCenter = new THREE.Vector3(centerX, gateY, gateZ);
        gateGroup.position.copy(gateCenter);
        trackGroup.add(gateGroup);

        obstacles.push({
          id: `speedgate-${i}`,
          type: 'speed_gate',
          center: gateCenter,
          radius: 4.8,
          meshGroup: gateGroup,
          collected: false
        });
      }

      // (b) Golden Air Whirlpool Catapult (Elevated at Sky Altitudes)
      if (i % 3 === 2) {
        const wpGroup = new THREE.Group();
        const wpGeo = new THREE.RingGeometry(3.0, 4.8, 6);
        wpGeo.rotateX(Math.PI / 3);
        const wp1 = new THREE.Mesh(wpGeo, new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
        const wp2 = new THREE.Mesh(wpGeo, new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.75, side: THREE.DoubleSide }));
        wp2.scale.set(0.68, 0.68, 0.68);
        wpGroup.add(wp1, wp2);

        const wpZ = zStart - 55;
        const wpX = centerX + (i % 2 === 0 ? 3.0 : -3.0);
        const wpY = 27.0 + Math.cos(i * 1.5) * 6.0; // Sky altitude 21m-33m
        const wpCenter = new THREE.Vector3(wpX, wpY, wpZ);
        wpGroup.position.copy(wpCenter);
        trackGroup.add(wpGroup);

        obstacles.push({
          id: `whirlpool-${i}`,
          type: 'whirlpool',
          center: wpCenter,
          radius: 5.5,
          meshGroup: wpGroup
        });
      }

      // (c) Acrobatic Stunt Loop Ring (Elevated in Sky Clouds)
      if (i % 3 === 1) {
        const loopGroup = new THREE.Group();
        const hoopGeo = new THREE.RingGeometry(3.6, 4.8, 8);
        const hoopMesh = new THREE.Mesh(hoopGeo, new THREE.MeshStandardMaterial({
          color: 0xec4899,
          emissive: 0xbe185d,
          roughness: 0.4,
          side: THREE.DoubleSide,
          flatShading: true
        }));
        loopGroup.add(hoopMesh);

        // Crane emblem perched on top
        const emblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.85, 0), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        emblem.position.set(0, 4.8, 0);
        loopGroup.add(emblem);

        const loopZ = zStart - 70;
        const loopY = 30.0 + Math.sin(i * 1.7) * 5.5; // Sky altitude 24.5m-35.5m
        const loopCenter = new THREE.Vector3(centerX, loopY, loopZ);
        loopGroup.position.copy(loopCenter);
        trackGroup.add(loopGroup);

        obstacles.push({
          id: `loopring-${i}`,
          type: 'loop_ring',
          center: loopCenter,
          radius: 4.8,
          meshGroup: loopGroup,
          collected: false
        });
      }

      // (d) Mystery Surprise Origami Box (Elevated across Flight Path)
      if (i % 2 === 1) {
        const boxGroup = new THREE.Group();
        const giftBoxGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
        const giftBoxMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.6, flatShading: true });
        const giftMesh = new THREE.Mesh(giftBoxGeo, giftBoxMat);

        const ribGeo = new THREE.BoxGeometry(1.65, 0.3, 1.65);
        const ribMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        const ribMesh = new THREE.Mesh(ribGeo, ribMat);

        const bowMesh = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.6, 5), ribMat);
        bowMesh.position.set(0, 0.95, 0);
        boxGroup.add(giftMesh, ribMesh, bowMesh);

        const boxZ = zStart - 85;
        const boxX = centerX + Math.sin(i * 2.2) * 4.0;
        const boxY = 28.0 + Math.cos(i * 1.5) * 6.5; // Cruise altitude 21.5m-34.5m
        const boxCenter = new THREE.Vector3(boxX, boxY, boxZ);
        boxGroup.position.copy(boxCenter);
        trackGroup.add(boxGroup);

        obstacles.push({
          id: `surprise-${i}`,
          type: 'surprise_orb',
          center: boxCenter,
          radius: 3.2,
          meshGroup: boxGroup,
          collected: false
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 4. FLOATING LOW-POLY PAPER CLOUDS & HORIZON SUN
  // ---------------------------------------------------------------------------
  const cloudsGroup = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.95,
    metalness: 0.0,
    transparent: true,
    opacity: 0.88,
    flatShading: true
  });

  const cloudCount = 3;
  for (let c = 0; c < cloudCount; c++) {
    const cloudCluster = new THREE.Group();
    // Low-poly folded origami paper cloud puffs
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.2, 2.5), cloudMat);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.9, 2.0), cloudMat);
    p2.position.set(2.2, 0.3, 0);

    cloudCluster.add(p1, p2);
    const zCloud = -c * (Math.min(level.goalDistance, 1800) / cloudCount) - 30;
    cloudCluster.position.set(
      getCanyonCenter(zCloud) + (Math.random() - 0.5) * 45,
      28 + Math.random() * 8,
      zCloud
    );
    cloudsGroup.add(cloudCluster);
  }
  trackGroup.add(cloudsGroup);

  // ---------------------------------------------------------------------------
  // 5. AMBIENT DRIFTING PARTICLES (Sakura Petals / Snow Flurry)
  // ---------------------------------------------------------------------------
  let ambientParticles: THREE.Group | undefined;
  ambientParticles = new THREE.Group();
  const particleCount = 20;
  let particleColor = 0xf472b6;
  if (biome === 'alpine_glacier') particleColor = 0xe0f2fe;
  else if (biome === 'bamboo_forest') particleColor = 0xa7f3d0;
  else if (biome === 'canyon') particleColor = 0xfef08a;

  const particleMat = new THREE.MeshBasicMaterial({
    color: particleColor,
    transparent: true,
    opacity: 0.78,
    side: THREE.DoubleSide
  });
  const particleGeo = new THREE.PlaneGeometry(0.38, 0.38);

  for (let p = 0; p < particleCount; p++) {
    const pMesh = new THREE.Mesh(particleGeo, particleMat);
    pMesh.position.set(
      (Math.random() - 0.5) * 35,
      Math.random() * 22,
      -Math.random() * Math.min(600, level.goalDistance)
    );
    pMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    ambientParticles.add(pMesh);
  }
  trackGroup.add(ambientParticles);

  // ---------------------------------------------------------------------------
  // 6. LANDING TARGET BULLSEYE PLATFORM & HIGH SKY BEACON
  // ---------------------------------------------------------------------------
  const targetZ = -level.goalDistance;
  const targetCenterX = getCanyonCenter(targetZ);
  const targetCenter = new THREE.Vector3(targetCenterX, 0.4, targetZ);
  const landingGroup = new THREE.Group();
  landingGroup.position.copy(targetCenter);

  // Concentric Circular Origami Rings
  const ringMatWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, flatShading: true });
  const ringMatGreen = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.8, flatShading: true });
  const ringMatGold = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.6, flatShading: true });
  const ringMatRed = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5, flatShading: true });

  // Outer Ring (r=16m) - White (Low-poly folded paper hexagon)
  const r4 = new THREE.Mesh(new THREE.CylinderGeometry(16, 16.5, 0.4, 6), ringMatWhite);
  r4.position.set(0, 0.2, 0);
  r4.receiveShadow = true;

  // Bronze Ring (r=11m) - Emerald Green
  const r3 = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 0.45, 6), ringMatGreen);
  r3.position.set(0, 0.23, 0);

  // Silver Ring (r=6.5m) - Golden Amber
  const r2 = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 6.5, 0.5, 6), ringMatGold);
  r2.position.set(0, 0.26, 0);

  // Bullseye Ruby Center (r=2.8m) - Crimson Red
  const r1 = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.55, 6), ringMatRed);
  r1.position.set(0, 0.29, 0);

  // Center Golden Origami Star
  const starCenter = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, 0), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
  starCenter.position.set(0, 0.9, 0);

  // Towering Origami Beacon Beam of Light (Rising 90m into high sky)
  const beaconGeo = new THREE.CylinderGeometry(0.8, 2.5, 90, 4);
  const beaconMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
  beaconMesh.position.set(0, 45, 0);

  // Beacon Crown Golden Diamond
  const crownStar = new THREE.Mesh(new THREE.OctahedronGeometry(2.5, 0), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
  crownStar.position.set(0, 90, 0);

  landingGroup.add(r4, r3, r2, r1, starCenter, beaconMesh, crownStar);
  trackGroup.add(landingGroup);

  const landingTarget = {
    center: targetCenter,
    radius: 16.0,
    meshGroup: landingGroup
  };

  return {
    trackGroup,
    segments,
    obstacles,
    level,
    ambientParticles,
    cloudsGroup,
    cliffElevation,
    launchpadMesh,
    landingTarget
  };
}

export function updateDynamicObstacles(track: CanyonTrackData, time: number): void {
  for (const obs of track.obstacles) {
    if (obs.type === 'solid' && obs.rotationSpeed) {
      if (obs.id.startsWith('windmill')) {
        obs.meshGroup.rotation.z = time * obs.rotationSpeed;
      } else if (obs.id.startsWith('lantern')) {
        obs.meshGroup.rotation.z = Math.sin(time * obs.rotationSpeed) * 0.45;
      }
    } else if (obs.type === 'star' && !obs.collected) {
      obs.meshGroup.rotation.y = time * 2.8;
      obs.meshGroup.rotation.x = Math.sin(time * 3) * 0.25;
    } else if (obs.type === 'geyser') {
      const pulse = 0.8 + Math.sin(time * 4) * 0.25;
      obs.meshGroup.scale.set(pulse, 1.0 + Math.sin(time * 5) * 0.3, pulse);
    } else if (obs.type === 'thermal') {
      // Rotate spiraling thermal rings
      obs.meshGroup.rotation.y = time * 0.8;
    } else if (obs.type === 'whirlpool') {
      obs.meshGroup.rotation.z = time * 2.5;
      const pulse = 1.0 + Math.sin(time * 3.5) * 0.1;
      obs.meshGroup.scale.set(pulse, pulse, pulse);
    } else if (obs.type === 'speed_gate' && !obs.collected) {
      obs.meshGroup.rotation.z = Math.sin(time * 2.2) * 0.08;
    } else if (obs.type === 'loop_ring' && !obs.collected) {
      obs.meshGroup.position.y = obs.center.y + Math.sin(time * 2.0) * 0.45;
    } else if (obs.type === 'surprise_orb' && !obs.collected) {
      obs.meshGroup.rotation.y = time * 2.2;
      obs.meshGroup.position.y = obs.center.y + Math.sin(time * 2.8) * 0.4;
    }
  }

  // Landing Target beacon crown rotation
  if (track.landingTarget && track.landingTarget.meshGroup) {
    const children = track.landingTarget.meshGroup.children;
    if (children[6]) children[6].rotation.y = time * 1.5;
    if (children[4]) children[4].rotation.y = time * 2.0;
  }

  // Drifting ambient petals & particles
  if (track.ambientParticles) {
    const children = track.ambientParticles.children;
    for (let p = 0; p < children.length; p++) {
      const pt = children[p];
      pt.position.y -= 0.045;
      pt.position.x += Math.sin(time * 1.5 + p) * 0.025;
      pt.rotation.z += 0.035;
      if (pt.position.y < 0.2) {
        pt.position.y = 22;
      }
    }
  }

  // Floating paper clouds drifting slowly forward
  if (track.cloudsGroup) {
    const clouds = track.cloudsGroup.children;
    for (let c = 0; c < clouds.length; c++) {
      const cloud = clouds[c];
      cloud.position.x += Math.sin(time * 0.2 + c) * 0.015;
    }
  }
}
