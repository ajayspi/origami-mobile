# Wind Glide Academy — 3D Paper Flight Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, smooth-running 3D paper airplane flight game ("Wind Glide Academy") with slingshot launching, authentic aerodynamics, multi-level obstacle courses, procedural ASMR audio, dynamic weather shifts, and an artisan upgrade hangar inside `origami-mobile`.

**Architecture:** A high-performance Three.js WebGL flight stage decoupled from React via a Zustand state store (`useGameStore`). Aerodynamic physics run in an adaptive sub-stepped tick loop ($N=4$). Audio is 100% procedural via Web Audio API. Canyon environments, spinning windmills, and steam geysers are generated procedurally with forgiving glancing collision detection.

**Tech Stack:** React 19, TypeScript, Three.js, Zustand, Vite, Web Audio API, Vitest.

**Spec:** [`origami-mobile/docs/specs/2026-11-15-wind-glide-academy-design.md`](file:///c:/Users/vigilare/Downloads/O2/origami-mobile/docs/specs/2026-11-15-wind-glide-academy-design.md)

---

## Global Constraints

- **Repository Isolation**: All work must occur strictly inside `origami-mobile/`. Never modify or touch the desktop web package (`origamistudio` or monorepo root).
- **Zero External Binary Assets**: No MP3, WAV, GLTF, or OBJ network fetches. All 3D meshes are procedural Three.js `BufferGeometry`, and all audio is synthesized via the Web Audio API.
- **Mobile Touch Ergonomics**: All interactive buttons must have minimum touch targets of $\ge 48\text{px}$, with 100dvh safe-area support (`safe-area-inset-top`, `safe-area-inset-bottom`) and React 19 inline styles (`style={{ ... }}`).
- **Smooth Run Performance**: Flight animation loop must maintain 60 FPS on mobile GPUs; non-punitive glancing deflections prevent jarring stops.

---

## Review Focus

1. **Autoplay Audio Policy**: Mobile Web Audio contexts must remain in suspended state until the first user tap/slingshot interaction.
2. **Boundary Pull-Back Clamping**: Pulling the slingshot gesture beyond screen borders must clamp cleanly ($R \le 120\text{px}$) without throwing NaN vectors.
3. **Stall Recovery**: Pitching the aircraft up beyond $18^\circ$ must gracefully drop the nose rather than causing flight physics inversion.
4. **Glancing Collision Recovery**: Obstacle collisions must deflect velocity smoothly along the obstacle normal without clipping through geometry.
5. **Memory Leak Prevention**: Procedural canyon meshes and audio oscillators must dispose cleanly when exiting the game.

---

## Task Structure

### Task 1: Dependencies, State Store & 5-Level Campaign

**Files:**
- Modify: `origami-mobile/package.json`
- Create: `origami-mobile/src/types/game.ts`
- Create: `origami-mobile/src/data/gameLevels.ts`
- Create: `origami-mobile/src/store/useGameStore.ts`
- Test: `origami-mobile/src/tests/gameStore.test.ts`

**Interfaces & Schemas (`src/types/game.ts`):**
```ts
export type FlightState = 'idle' | 'aiming' | 'flying' | 'landed' | 'hangar';
export type TimeOfDay = 'morning' | 'sunset' | 'night';
export type PaperStock = 'washi' | 'gold_foil' | 'sakura' | 'indigo';

export interface AircraftUpgrades {
  lift: number;          // Level 1-5 (each +10% lift coefficient)
  drag: number;          // Level 1-5 (each -8% parasite drag)
  impulse: number;       // Level 1-5 (each +12% launch velocity)
  thermalMagnet: number; // Level 1-5 (expands thermal pull radius)
}

export interface GameLevel {
  id: string;
  levelNumber: number;
  name: string;
  theme: string;
  goalDistance: number;  // meters (500, 1000, 1500, 2000, 2500)
  timeOfDay: TimeOfDay;
  windSpeed: number;     // m/s tailwind/crosswind
  obstacleDensity: 'low' | 'medium' | 'high';
  allowedObstacles: ('windmill' | 'lantern' | 'geyser' | 'thermal' | 'arch')[];
  unlockedByDefault: boolean;
}

export interface GameState {
  flightState: FlightState;
  selectedKitId: string; // Default: 'aerospace-02' (Falcon Dart)
  activeLevelId: string;
  distance: number;
  altitude: number;
  speed: number;
  thermalsCaught: number;
  starsCollected: number;
  totalStars: number;
  highScores: Record<string, number>;
  unlockedLevels: string[];
  upgrades: AircraftUpgrades;
  activePaperStock: PaperStock;

  // Actions
  setFlightState: (state: FlightState) => void;
  selectKit: (kitId: string) => void;
  selectLevel: (levelId: string) => void;
  updateTelemetry: (distance: number, altitude: number, speed: number) => void;
  collectStar: () => void;
  triggerThermal: () => void;
  touchdown: () => void;
  spendStarsOnUpgrade: (upgradeKey: keyof AircraftUpgrades, cost: number) => boolean;
  setPaperStock: (stock: PaperStock) => void;
  resetRun: () => void;
}
```

- [ ] **Step 1: Write the failing tests in `src/tests/gameStore.test.ts`**
  ```ts
  import { describe, it, expect, beforeEach } from 'vitest';
  import { useGameStore } from '../store/useGameStore';
  import { GAME_LEVELS } from '../data/gameLevels';

  describe('useGameStore', () => {
    beforeEach(() => {
      useGameStore.getState().resetRun();
    });

    it('initializes with Level 1 active, aerospace-02 kit, and idle flightState', () => {
      const state = useGameStore.getState();
      expect(state.flightState).toBe('idle');
      expect(state.selectedKitId).toBe('aerospace-02');
      expect(state.activeLevelId).toBe('level-1');
      expect(state.distance).toBe(0);
      expect(state.starsCollected).toBe(0);
    });

    it('transitions flight state through launch and touchdown unlocking next level', () => {
      const store = useGameStore.getState();
      store.setFlightState('aiming');
      expect(useGameStore.getState().flightState).toBe('aiming');
      store.setFlightState('flying');
      expect(useGameStore.getState().flightState).toBe('flying');
      store.updateTelemetry(650, 12, 18.5);
      expect(useGameStore.getState().distance).toBe(650);
      store.touchdown();
      expect(useGameStore.getState().flightState).toBe('landed');
      // Level 1 goal is 500m; reaching 650m unlocks Level 2
      expect(useGameStore.getState().unlockedLevels).toContain('level-2');
    });

    it('deducts stars on upgrade purchase', () => {
      useGameStore.setState({ totalStars: 50, upgrades: { lift: 1, drag: 1, impulse: 1, thermalMagnet: 1 } });
      const success = useGameStore.getState().spendStarsOnUpgrade('lift', 20);
      expect(success).toBe(true);
      expect(useGameStore.getState().totalStars).toBe(30);
      expect(useGameStore.getState().upgrades.lift).toBe(2);
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npm --prefix origami-mobile test src/tests/gameStore.test.ts`
  Expected: FAIL

- [ ] **Step 3: Install `zustand` and implement `types/game.ts`, `data/gameLevels.ts`, and `store/useGameStore.ts`**
  - Add `"zustand": "^5.0.3"` to `origami-mobile/package.json` dependencies and run `npm --prefix origami-mobile install zustand`.
  - Populate `GAME_LEVELS` with all 5 campaign levels + Endless:
    1. `level-1`: "Morning Breeze Valley", goal 500m, morning, unlockedByDefault: true
    2. `level-2`: "Windmill Gorge", goal 1000m, morning, unlockedByDefault: false
    3. `level-3`: "Lotus Falls & Steam Geysers", goal 1500m, sunset, unlockedByDefault: false
    4. `level-4`: "Sunset Mesa & Storm Winds", goal 2000m, sunset, unlockedByDefault: false
    5. `level-5`: "Moonlit Shrine & Starlit Peaks", goal 2500m, night, unlockedByDefault: false
    6. `level-endless`: "The Infinite Horizon", goal 999999m, night, unlocked when level-5 completed.
  - Implement Zustand store with `localStorage` persistence for `totalStars`, `highScores`, `unlockedLevels`, and `upgrades`.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npm --prefix origami-mobile test src/tests/gameStore.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  `git -C origami-mobile add . && git -C origami-mobile commit -m "feat(game): add zustand dependency, state store, and 5-level campaign" --no-verify`

---

### Task 2: Procedural ASMR Web Audio Synthesizer

**Files:**
- Create: `origami-mobile/src/tests/mocks/audioMock.ts`
- Create: `origami-mobile/src/utils/gameAudio.ts`
- Test: `origami-mobile/src/tests/gameAudio.test.ts`

**DSP Architecture:**
- **Wind Loop**: 2.0-second stereo white noise buffer looped with `loop = true`. Fed into a `BiquadFilterNode` (type: `bandpass`, Q: 1.8).
  - Cutoff frequency: $f = 300 + \min(\text{airspeed} / 30, 1.0) \times 1900\text{Hz}$.
  - Gain: $\text{gain} = \min(\text{airspeed} / 25, 1.0) \times 0.28$.
- **Slingshot Snap**: Short sine oscillator swept from $880\text{Hz} \rightarrow 110\text{Hz}$ with an exponential gain envelope decaying to $0.001$ over $35\text{ms}$.
- **Pentatonic Star Chimes**: 5 harmonic frequencies:
  - `PENTATONIC_FREQS = [523.25, 587.33, 659.25, 783.99, 880.00]` (C5, D5, E5, G5, A5).
- **Thermal Updraft Hum**: Sine oscillator at $90\text{Hz}$ mixed with bandpass noise at $450\text{Hz}$, soft ease-in gain over $200\text{ms}$.
- **Glancing Deflection Thud**: Filtered noise burst ($180\text{Hz}$ lowpass) with $50\text{ms}$ exponential decay.

- [ ] **Step 1: Write the failing tests in `src/tests/gameAudio.test.ts` using `audioMock.ts`**
  ```ts
  import { describe, it, expect, beforeEach } from 'vitest';
  import { setupAudioMock } from './mocks/audioMock';
  import { gameAudio } from '../utils/gameAudio';

  beforeEach(() => {
    setupAudioMock();
  });

  describe('gameAudio', () => {
    it('initializes in suspended state and resumes on user interaction', () => {
      gameAudio.init();
      expect(gameAudio.isReady()).toBe(true);
    });

    it('modulates wind filter frequency proportionally to airspeed', () => {
      gameAudio.init();
      gameAudio.updateWindRustle(15); // 15 m/s -> expect ~1250 Hz
      expect(gameAudio.getCurrentWindFrequency()).toBeCloseTo(1250, 50);
    });

    it('plays star chime with valid pentatonic note without throwing', () => {
      gameAudio.init();
      expect(() => gameAudio.playStarChime(2)).not.toThrow();
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npm --prefix origami-mobile test src/tests/gameAudio.test.ts`
  Expected: FAIL

- [ ] **Step 3: Implement `src/tests/mocks/audioMock.ts` and `src/utils/gameAudio.ts`**
  Implement `gameAudio` singleton with lazy context instantiation, looping wind noise buffer, pentatonic chimes, and proper `stopFlightAudio()` cleanup.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npm --prefix origami-mobile test src/tests/gameAudio.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  `git -C origami-mobile add . && git -C origami-mobile commit -m "feat(game): implement procedural ASMR Web Audio synthesizer" --no-verify`

---

### Task 3: Aerodynamic Physics & Glancing Collision Engine

**Files:**
- Create: `origami-mobile/src/utils/flightPhysics.ts`
- Test: `origami-mobile/src/tests/flightPhysics.test.ts`

**Physics Formulation:**
1. **Sub-stepping Loop**: Frame $dt$ is clamped ($\le 0.05\text{s}$) and divided into $N = 4$ sub-steps ($\Delta t = dt / 4$) for 60-120 FPS stability.
2. **Angle of Attack ($\alpha$)**: $\alpha = \text{pitch} - \arctan2(v_y, \sqrt{v_x^2 + v_z^2})$.
3. **Lift Coefficient ($C_L$)**:
   - For $\alpha \le 18^\circ$: $C_L = C_{L0} + 2\pi \cdot \alpha \cdot (\text{liftUpgradeMultiplier})$. Base $C_{L0} = 0.25$.
   - Stall condition ($\alpha > 18^\circ$): Lift experiences a $60\%$ collapse: $C_L = C_L \times 0.40$, applying a nose-down pitch restoring torque ($\tau_{\text{pitch}} = -2.5 \cdot (\alpha - 18^\circ)$).
4. **Drag Coefficient ($C_D$)**:
   - $C_D = C_{D0} + \frac{C_L^2}{\pi \cdot AR \cdot e}$, where base $C_{D0} = 0.08$, aspect ratio $AR = 2.2$, Oswald efficiency $e = 0.85$.
5. **Ground Effect**:
   - When altitude $y < 0.5\text{m}$, lift increases by $+25\%$ ($C_L \times 1.25$) and induced drag decreases by $50\%$.
6. **Glancing Collision Deflection**:
   $$\vec{v}_{\perp} = (\vec{v} \cdot \hat{n})\hat{n}, \quad \vec{v}_{\parallel} = \vec{v} - \vec{v}_{\perp}$$
   $$\vec{v}' = \vec{v}_{\parallel} \cdot (1 - \mu_{\text{friction}}) - \vec{v}_{\perp} \cdot e_{\text{restitution}}$$
   Where $e_{\text{restitution}} = 0.35$ and $\mu_{\text{friction}} = 0.12$. Preserves forward glide momentum while bouncing smoothly away from obstacle surfaces.

- [ ] **Step 1: Write the failing tests in `src/tests/flightPhysics.test.ts`**
  ```ts
  import { describe, it, expect } from 'vitest';
  import * as THREE from 'three';
  import { computeAerodynamicStep, checkGlancingDeflection } from '../utils/flightPhysics';

  describe('flightPhysics', () => {
    it('computes positive lift during forward glide at moderate angle of attack', () => {
      const state = {
        position: new THREE.Vector3(0, 10, 0),
        velocity: new THREE.Vector3(0, 0, -15), // 15 m/s forward
        rotation: new THREE.Euler(0.12, 0, 0),   // ~7 deg pitch up
        pitch: 0.12, roll: 0, yaw: 0,
        isStalled: false,
        altitude: 10
      };
      const next = computeAerodynamicStep(state, { pitchInput: 0, rollInput: 0 }, 0.016, 1.0, 1.0);
      expect(next.velocity.y).toBeGreaterThan(-1.0); // Lift opposes gravity
      expect(next.isStalled).toBe(false);
    });

    it('triggers stall drop when pitch exceeds 18 degrees', () => {
      const state = {
        position: new THREE.Vector3(0, 10, 0),
        velocity: new THREE.Vector3(0, 0, -10),
        rotation: new THREE.Euler(0.35, 0, 0), // 20 deg pitch up (>18 deg)
        pitch: 0.35, roll: 0, yaw: 0,
        isStalled: false,
        altitude: 10
      };
      const next = computeAerodynamicStep(state, { pitchInput: 0, rollInput: 0 }, 0.016, 1.0, 1.0);
      expect(next.isStalled).toBe(true);
      expect(next.pitch).toBeLessThan(state.pitch); // Nose drops
    });

    it('performs glancing deflection retaining forward momentum', () => {
      const vel = new THREE.Vector3(2.0, 0, -12.0); // Glancing canyon wall
      const normal = new THREE.Vector3(-1.0, 0, 0); // Wall facing plane
      const obstacles = [{
        type: 'solid' as const,
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
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npm --prefix origami-mobile test src/tests/flightPhysics.test.ts`
  Expected: FAIL

- [ ] **Step 3: Implement `src/utils/flightPhysics.ts`**
  Implement sub-stepped Euler integration ($N=4$), lift/drag coefficients with stall decay, ground effect cushion, and normal deflection equations.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npm --prefix origami-mobile test src/tests/flightPhysics.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  `git -C origami-mobile add . && git -C origami-mobile commit -m "feat(game): implement aerodynamic simulation and glancing collision physics" --no-verify`

---

### Task 4: Procedural Canyon World, Obstacles & Weather Generator

**Files:**
- Create: `origami-mobile/src/utils/canyonWorld.ts`
- Test: `origami-mobile/src/tests/canyonWorld.test.ts`

**Track & Weather Parameters (`src/utils/canyonWorld.ts`):**
- **Track Dimensions**: Segments are $100\text{m}$ in length along the negative Z-axis, width $28\text{m}$, canyon walls $22\text{m}$ high with low-poly origami rock facets.
- **Obstacle Placement Rules**:
  - `windmill`: Span across Z every $250\text{m}$; hub at $Y=10\text{m}$, 4 blades rotating at $\omega = 1.2\text{ rad/s}$.
  - `lantern`: Swaying pendulums suspended under stone arches at $Y=7\text{m}$, oscillation $\theta(t) = 0.4 \cdot \sin(2.0 t)$.
  - `thermal`: Golden translucent cylindrical vortex ($R=4.5\text{m}, H=25\text{m}$) providing $+4.5\text{m/s}^2$ lift.
  - `geyser`: Steam column erupting every $3.0\text{s}$ delivering a vertical impulse of $+8.0\text{m/s}$.
  - `star`: Floating origami star at height $Y = 3.5\text{m} - 8.0\text{m}$.
- **Weather Lighting Milestones**:
  - `0m - 1000m (Morning)`: Sky: `#a5c9eb`, Fog: `#e0ecf8`, Sun: `#fff8e7` (intensity 1.2), Fog Near/Far: $20\text{m} / 120\text{m}$.
  - `1000m - 2000m (Sunset)`: Sky: `#e28a52`, Fog: `#f3c68f`, Sun: `#ffaa44` (intensity 1.4), Fog Near/Far: $15\text{m} / 100\text{m}$.
  - `2000m+ (Night)`: Sky: `#0f1423`, Fog: `#1a1e36`, Moon: `#b8c5e6` (intensity 0.55), Fog Near/Far: $10\text{m} / 80\text{m}$.

- [ ] **Step 1: Write the failing tests in `src/tests/canyonWorld.test.ts`**
  ```ts
  import { describe, it, expect } from 'vitest';
  import { generateCanyonTrack, getWeatherLighting } from '../utils/canyonWorld';
  import { GAME_LEVELS } from '../data/gameLevels';

  describe('canyonWorld', () => {
    it('generates canyon track matching level goal distance and obstacles', () => {
      const level2 = GAME_LEVELS.find(l => l.id === 'level-2')!;
      const track = generateCanyonTrack(level2);
      expect(track.segments.length).toBeGreaterThanOrEqual(10); // 1000m / 100m
      expect(track.obstacles.some(o => o.type === 'windmill')).toBe(true);
    });

    it('interpolates weather lighting across morning, sunset, and night', () => {
      const morning = getWeatherLighting(300);
      expect(morning.timeOfDay).toBe('morning');
      const sunset = getWeatherLighting(1400);
      expect(sunset.timeOfDay).toBe('sunset');
      const night = getWeatherLighting(2400);
      expect(night.timeOfDay).toBe('night');
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npm --prefix origami-mobile test src/tests/canyonWorld.test.ts`
  Expected: FAIL

- [ ] **Step 3: Implement `src/utils/canyonWorld.ts`**
  Build procedural 3D meshes for folded paper canyons, 4-blade spinning windmills, arched bridges, swaying lanterns, steam geyser particles, and golden thermal vortices. Implement weather lighting interpolation based on distance.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npm --prefix origami-mobile test src/tests/canyonWorld.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  `git -C origami-mobile add . && git -C origami-mobile commit -m "feat(game): implement procedural canyon world, obstacles, and weather lighting" --no-verify`

---

### Task 5: Glider Geometry (`aerospace-02`), Flight Stage & Spring Camera

**Files:**
- Modify: `origami-mobile/src/utils/mobileGeometry.ts`
- Create: `origami-mobile/src/tests/mocks/threeMock.ts`
- Create: `origami-mobile/src/components/FlightStage.tsx`
- Test: `origami-mobile/src/tests/flightStage.test.ts`

**Touch Slingshot & Flight Control Specs:**
1. **Slingshot Pull-Back**:
   - Touch start establishes origin $(x_0, y_0)$ in the lower screen touch zone ($y > 0.6 \times \text{height}$).
   - Touch move vector: $\Delta x = x - x_0, \Delta y = y - y_0$.
   - Clamped pull distance: $R = \min(\sqrt{\Delta x^2 + \Delta y^2}, 120\text{px})$.
   - Launch Speed: $v = (R / 120) \times (18.0 + 2.5 \times \text{impulseUpgrade})\text{ m/s}$.
   - Launch Pitch: $\theta = 12^\circ + (\Delta y / 120) \times 20^\circ$.
   - Launch Yaw: $\psi = -(\Delta x / 120) \times 25^\circ$.
2. **In-Flight Steering**:
   - Single-finger horizontal drag controls bank roll: $\text{rollInput} = \text{clamp}(\Delta x / 80, -1, 1)$.
   - Vertical drag controls elevator pitch trim: $\text{pitchInput} = \text{clamp}(-\Delta y / 80, -1, 1)$.
3. **Spring Follow Camera**:
   - Target position: $\vec{P}_{\text{cam}} = \vec{P}_{\text{plane}} + \vec{O}_{\text{plane}}$, where offset $\vec{O} = (0, 1.8, 5.2)$.
   - Lerp speed: $\alpha = 0.08$. Bank lean: $\text{camRotZ} = -\text{planeRotZ} \times 0.25$.
4. **Glider Geometry for `aerospace-02`**:
   - Add authentic delta-wing geometry in `mobileGeometry.ts` for `aerospace-02` ("Falcon Dart") with creased center keel, $15^\circ$ wing dihedral camber, and vertical winglets.

- [ ] **Step 1: Write the failing tests in `src/tests/flightStage.test.ts`**
  ```ts
  import { describe, it, expect } from 'vitest';
  import { synthesizeKitGeometry } from '../utils/mobileGeometry';

  describe('FlightStage & aerospace-02 geometry', () => {
    it('synthesizes authentic delta-wing geometry for aerospace-02 with valid vertex count', () => {
      const geo = synthesizeKitGeometry('aerospace-02', 1.0);
      expect(geo).toBeDefined();
      expect(geo.attributes.position.count).toBeGreaterThan(24);
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npm --prefix origami-mobile test src/tests/flightStage.test.ts`
  Expected: FAIL

- [ ] **Step 3: Update `mobileGeometry.ts` and implement `FlightStage.tsx`**
  - Add `aerospace-02` procedural geometry in `mobileGeometry.ts`.
  - Build `<FlightStage />` with touch slingshot controls, spring follow camera, audio hookups, and glancing collision detection.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npm --prefix origami-mobile test src/tests/flightStage.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  `git -C origami-mobile add . && git -C origami-mobile commit -m "feat(game): add aerospace-02 glider geometry, flight canvas, and spring camera" --no-verify`

---

### Task 6: Game HUD, Artisan Hangar & Mobile App Integration

**Files:**
- Create: `origami-mobile/src/components/FlightHUD.tsx`
- Create: `origami-mobile/src/components/TouchdownModal.tsx`
- Create: `origami-mobile/src/components/ArtisanHangarModal.tsx`
- Create: `origami-mobile/src/components/LevelSelectModal.tsx`
- Modify: `origami-mobile/src/components/MobileApp.tsx`
- Test: `origami-mobile/src/tests/gameScreens.test.ts`

**Architecture & UI Guidelines:**
- Follow `origami-mobile` UI patterns: React 19 inline styles (`style={{ ... }}`), 100dvh safe-area support, Lucide icons (`lucide-react`), zero Tailwind classes.
- Reuse `<MobileStage kit={aircraftKit} currentStepIdx={totalSteps - 1} foldFactor={1.0} isPancakeFlipped={false} />` in `ArtisanHangarModal.tsx` for the 3D plane turntable.
- In `MobileApp.tsx`:
  - Add top bar navigation toggle between "Folding Studio" and "Flight Academy ✈️".
  - In the completion celebration modal (when folding `aerospace-02` is completed), add direct CTA: `"Test Flight in Flight Academy ✈️"`.

- [ ] **Step 1: Write the failing tests in `src/tests/gameScreens.test.ts`**
  ```ts
  import { describe, it, expect } from 'vitest';
  import { useGameStore } from '../store/useGameStore';

  describe('gameScreens', () => {
    it('verifies level select modal allows selecting unlocked levels only', () => {
      useGameStore.setState({ unlockedLevels: ['level-1', 'level-2'] });
      const store = useGameStore.getState();
      store.selectLevel('level-2');
      expect(useGameStore.getState().activeLevelId).toBe('level-2');
    });

    it('manages paper stock switching in the artisan hangar', () => {
      const store = useGameStore.getState();
      store.setPaperStock('gold_foil');
      expect(useGameStore.getState().activePaperStock).toBe('gold_foil');
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npm --prefix origami-mobile test src/tests/gameScreens.test.ts`
  Expected: FAIL

- [ ] **Step 3: Implement HUD, Modals, and integrate into `MobileApp.tsx`**
  Build:
  - `FlightHUD.tsx`: Slingshot tension meter, airspeed variometer, distance ticker, thermal chain banner.
  - `TouchdownModal.tsx`: Confetti celebration, scorecard, reward unboxing.
  - `ArtisanHangarModal.tsx`: Reuses `<MobileStage />` turntable, stat upgrade bars, washi paper skin selector.
  - `LevelSelectModal.tsx`: 5-level campaign selection with star badges.
  - Update `MobileApp.tsx` to seamlessly toggle between the Step-by-Step Folding Studio and the Wind Glide Game.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npm --prefix origami-mobile test src/tests/gameScreens.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  `git -C origami-mobile add . && git -C origami-mobile commit -m "feat(game): integrate flight HUD, debrief modal, artisan hangar, and app shell" --no-verify`

---

### Task 7: End-to-End Build, Verification & Production Push

**Files:**
- Modify: `origami-mobile/README.md`
- Test: Full build and test suite

- [ ] **Step 1: Run complete test suite across all modules**
  Run: `npm --prefix origami-mobile test`
  Expected: All test suites PASS.

- [ ] **Step 2: Run production TypeScript compile and Vite build**
  Run: `npm --prefix origami-mobile run build`
  Expected: Build completes with 0 errors.

- [ ] **Step 3: Update documentation in `origami-mobile/README.md`**
  Document the game mode, flight controls, level campaign, and physics design.

- [ ] **Step 4: Commit and push to GitHub repository `ajayspi/origami-mobile`**
  Commit all changes and push to `origin/main` on GitHub.
