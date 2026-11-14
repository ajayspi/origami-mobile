# Wind Glide Academy — 3D Paper Flight Game Specification

**Status**: Proposed (Awaiting Approval)  
**Date**: 2026-11-15  
**Target Platform**: `origami-mobile` (Standalone Mobile Companion App)  
**Notion Doc**: [Wind Glide Academy — 3D Paper Flight Game Specification](https://app.notion.com/p/418816247586817dafeed90903feb347?pvs=204)

---

## 1. Intent & The "Why"
Origami is an intimate tactile craft. When children and pre-readers fold aerodynamic models like airplanes and gliders, their immediate real-world instinct is: *"I want to throw this and see how far it flies!"*

**Wind Glide Academy** satisfies this natural impulse digitally. It bridges physical desk paper folding with an unhurried, beautiful 3D mobile flight experience where children launch their folded models, ride rising air currents (thermals), and discover genuine aerodynamic principles (lift, drag, gravity, stalls).

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- **Tactile Slingshot Launch**: An intuitive, one-handed touch gesture pulling back the plane to build tension, releasing with a crisp elastic snap.
- **Multi-Level Progression & Varied Obstacles**: 5 distinct, handcrafted progression levels with escalating environmental obstacles (spinning windmills, swinging lanterns, steam geysers, storm clouds) leading into an Endless Sandbox Mode.
- **Buttery "Smooth Run" Physics**: 60 FPS sub-stepped Euler aerodynamics with fluid cinematic lerp camera tracking, forgiving glancing collisions, and paper bounce recovery.
- **Dynamic Weather Shifts**: Seamless transitions as the plane travels further down the canyon:
  - `0m – 1,000m`: **Morning Breeze** (Crisp dawn lighting, pastel paper clouds, morning sun rays).
  - `1,000m – 2,000m`: **Golden Sunset** (Rich amber glow, long dramatic shadows, canyon silhouettes).
  - `2,000m+`: **Starry Night** (Deep midnight indigo sky, glowing origami stars, bioluminescent paper fireflies).
- **Procedural ASMR Audio (Web Audio API)**: Zero external audio file dependencies. Real-time synthesized audio:
  - *Elastic Snap*: High-frequency snap with rapid exponential decay on release.
  - *Paper Wind Rustle*: Bandpass-filtered pink/white noise modulated dynamically by airspeed.
  - *Star Chimes*: Pure pentatonic bell harmonic sines upon star collection.
  - *Thermal Updraft*: Warm sub-bass swell and resonant airy whoosh.
  - *Obstacle Glancing Deflection*: Crisp paper thud on gentle obstacle taps.
- **Endless Progression & Artisan Hangar**: Collect origami stars to upgrade Lift, Impulse, and Aerodynamics, and unlock authentic washi paper finishes.

---

## 3. Multi-Level Campaign & Dynamic Obstacles

### 3.1 The 5-Level Flight Campaign
1. **Level 1: "Morning Breeze Valley"** (Goal: 500m)
   - *Theme*: Crisp dawn, wide open canyon, gentle tailwinds.
   - *Obstacles*: Floating tutorial rings, wide arches, introductory thermal updrafts.
   - *Target*: Grassy meadow landing zone.
2. **Level 2: "Windmill Gorge"** (Goal: 1,000m)
   - *Theme*: Midday sun over high rock mesas.
   - *Obstacles*: Giant rotating 4-blade paper windmills with gaps to thread, swinging paper lanterns under stone arches, gentle crosswinds.
3. **Level 3: "Lotus Falls & Steam Geysers"** (Goal: 1,500m)
   - *Theme*: Verdant river valley with paper waterfalls and bamboo groves.
   - *Obstacles*: Periodic steam geysers that launch the plane skyward, low wooden arched bridges to glide under, migratory flocks of paper cranes.
4. **Level 4: "Sunset Mesa & Storm Winds"** (Goal: 2,000m)
   - *Theme*: Radiant golden sunset with dramatic cliff shadows.
   - *Obstacles*: Dark origami turbulence clouds with wind shear, narrow rock slot canyons, fluctuating thermal vortices.
5. **Level 5: "Moonlit Shrine & Starlit Peaks"** (Goal: 2,500m)
   - *Theme*: Deep midnight indigo sky with a paper crescent moon and bioluminescent fireflies.
   - *Obstacles*: Multi-tiered pagoda roofs, swinging temple chimes, tight starlit hoops.
   - *Ultimate Landing*: Precision touchdown on the Sacred Floating Shrine.
6. **Endless Mode: "The Infinite Horizon"** (Unlocked after Level 5)
   - Procedurally generated infinite canyon blending all obstacles, dynamic weather shifts, and endless personal best distance chasing.

### 3.2 Dynamic Obstacle Mechanics & "Smooth Run" Forgiveness
- **Spinning Windmill Blades**: Rotating paper blades require timing your glide through open quadrants.
- **Swinging Pendulum Lanterns**: Paper lanterns that sway with real harmonic oscillation under arches.
- **Steam Geysers**: High-pressure vertical vents that act as super-thermals, rocketing the aircraft upward.
- **Glancing Deflections (Non-Punitive Collision)**: Clipping a tree branch, lantern, or cliff edge does NOT result in an instant crash. Instead, the paper plane glances off with a satisfying paper crinkle and slight wobble, allowing the player to counter-steer and maintain their run!

---

## 4. The 4 Core Screens

```
+-------------------------------------------------------------------+
| 1. RUNWAY LAUNCHPAD        | 2. MID-AIR THERMAL DRIFT             |
| Pull-back slingshot        | 3D chase camera                      |
| Power meter (0-100%)       | Thermal vortex surfing               |
| Tailwind windsock          | Speed, altimeter & star counter      |
| "PERFECT RELEASE!"         | Dynamic Weather: Dawn/Sunset/Night   |
+-------------------------------------------------------------------+
| 3. TOUCHDOWN DEBRIEF       | 4. ARTISAN HANGAR & TUNING           |
| Gentle meadow slide-stop   | Rotating 3D plane on turntable       |
| Distance (NEW RECORD!)     | Upgradable stats (Lift, Drag, Power) |
| Thermals caught & stars    | Washi paper stock swatch selector    |
| Unfolding mystery chest    | "Test Flight" button                 |
+-------------------------------------------------------------------+
```

---

## 4. Technical Architecture

### 4.1 State Management (Zustand `useGameStore.ts`)
Decouples the 60 FPS Three.js physics animation loop from React's DOM rendering cycle:
- `flightState`: `'idle' | 'aiming' | 'flying' | 'landed' | 'hangar'`
- `distance`: number (meters)
- `altitude`: number (meters)
- `speed`: number (m/s)
- `thermalsCaught`: number
- `starsCollected`: number
- `timeOfDay`: `'morning' | 'sunset' | 'night'`
- `upgrades`: `{ lift: number, drag: number, impulse: number, thermalMagnet: number }`
- `activePaperStock`: `'washi' | 'gold_foil' | 'sakura' | 'indigo'`

### 4.2 Three.js Aerodynamic Simulation Loop
- **Physics Equations**:
  $$\text{Lift} = 0.5 \cdot \rho \cdot v^2 \cdot S \cdot C_L(\alpha)$$
  $$\text{Drag} = 0.5 \cdot \rho \cdot v^2 \cdot S \cdot C_D(\alpha)$$
- **Stall Behavior**: If pitch angle exceeds $18^\circ$, lift drops by $60\%$, inducing a natural nose-down recovery.
- **Ground Effect**: When altitude $< 0.5\text{m}$, induced drag is halved and lift receives an extra $25\%$ cushion, rewarding low-altitude glides.

### 4.3 Procedural Web Audio Engine (`src/utils/gameAudio.ts`)
- **AudioContext**: Lazy initialized on first user touch to comply with mobile autoplay policies.
- **Wind Whoosh**: BufferSource with white noise into a BiquadFilter (bandpass, frequency scaled by velocity between $300\text{Hz}$ and $2200\text{Hz}$).
- **Elastic Snap**: Impulse oscillator ($880\text{Hz} \rightarrow 110\text{Hz}$) with an exponential gain envelope ($35\text{ms}$).
- **Star Chime**: Polyphonic sine oscillators tuned to Pentatonic C major: $\{523.25, 587.33, 659.25, 783.99, 880.00\}\text{Hz}$.
- **Firefly Ambient (Night)**: Soft ambient paper cricket pulses and high harmonic shimmer.

---

## 5. Mobile Ergonomics & Accessibility
- Portrait-first design with 100dvh safe-area bounds (`safe-area-inset-top`, `safe-area-inset-bottom`).
- Minimum touch targets $\ge 48\text{px}$.
- Gyroscope tilt support with an on-screen toggle for children who prefer touch gestures.
- High-contrast visual cues for pre-readers: visual icon badges and color-coded meters instead of dense text.

---

## 6. Verification & Test Plan
1. **Physics Determinism**: Unit test aerodynamic calculations (lift, drag, stall transition) across various angles of attack.
2. **Audio Polyphony**: Verify Web Audio context recovers cleanly on mobile lock/unlock and audio resumes without click artifacts.
3. **Weather Gradient Transitions**: Verify smooth Three.js background color and fog color interpolation across distance milestones ($0\text{m} \rightarrow 1000\text{m} \rightarrow 2000\text{m}$).
4. **Build & Bundle**: Ensure `tsc -b` and `vite build` complete with 0 errors and bundle size remains under control.
