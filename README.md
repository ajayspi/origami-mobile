# OrigamiStudio Mobile (origami-mobile)

> **Fresh, Mindful 3D Paper Folding Companion & Wind Glide Flight Academy for Children & Pre-Readers**  
> Standalone Mobile Application & Computational Kinematics Workbench

---

## 📱 Overview

OrigamiStudio Mobile is a dedicated, distraction-free mobile application engineered specifically for children, students, and makers folding real paper at a table, now featuring **Wind Glide Academy** — a 3D procedural paper airplane flight simulator.

### Dual Experience Modes
1. **Origami Studio**:
   * **70% Unobstructed 3D Kinematics Stage**: Dedicated WebGL canvas powered by Three.js with fluid 1-finger touch orbit and 2-finger pinch zoom.
   * **Unhurried Voice Cadence**: Calibrated at 0.88x speed (~105 wpm). Speaks only the single concise step instruction once, then waits in peaceful silence for the child to fold.
   * **Ergonomic Bottom Thumb Dock**: Anchored within natural thumb reach with generous $\ge 48\text{px}$ touch targets:
     - `[◀ Prev]`: Step backward smoothly.
     - `[▶ Watch Fold]`: Replay the 3D folding kinematic animation on demand.
     - `[🥞 Flip 180°]`: Turn the paper over like a pancake to inspect the underside.
     - `[Next Step ▶]`: Advance only when ready.
   * **Fold Scrubber Slider**: Drag to scrub the crease angle smoothly back and forth to inspect fold mechanics.
   * **Mindful Sanctuary Overlay**: If a child feels stuck or frustrated, a single tap on the heart icon opens a gentle breathing flower and lets them smooth their paper flat to try the step again without penalty.
   * **54 Master Kits**: Full offline access to all 54 kits with 12 to 16 atomic step precision, starting from the very first crease on flat paper.

2. **Wind Glide Academy (3D Paper Flight Game)**:
   * **Touch Slingshot Launching**: Pull back on screen with touch/drag to set launch speed ($8\text{--}24\,\text{m/s}$) and pitch angle ($\pm 25^\circ$), with visual trajectory bead arc.
   * **Authentic Aerodynamic Simulation**: Lift curve polar ($C_L = 2\pi\alpha$), stall recovery torque ($\alpha > 18^\circ$), wing ground effect cushion ($+25\%$ lift near ground), and non-punitive glancing wall reflections preserving forward momentum.
   * **5-Level Campaign & Endless Mode**:
     - *Level 1: Gentle Valley* (500m, Morning sky, wide canyon)
     - *Level 2: Whispering Pines* (800m, Sunset sky, swaying lanterns)
     - *Level 3: Steamy Gorge* (1,200m, Geysers with upward thermal updrafts)
     - *Level 4: Storm Peak* (1,500m, Gusting crosswinds & storm clouds)
     - *Level 5: Master Canyon* (2,000m, Night sky with paper fireflies & spinning windmills)
     - *Endless Thermal Drift*: Procedural continuous canyon with dynamic weather transitions (Morning $\rightarrow$ Sunset $\rightarrow$ Night).
   * **Tactile Procedural ASMR Sound**: 100% synthesized using Web Audio API (zero external audio files):
     - Slingshot rubber band release snap.
     - Dynamic rushing wind noise loop modulated by airspeed.
     - Pentatonic star collection chimes ($F_5, G_5, A_5, C_6, D_6$).
     - Thermal vortex upward whoosh.
     - Gentle obstacle deflection thud.
   * **Artisan Hangar**: Switch between completed origami models (e.g., *Falcon Dart* `aerospace-02`) with aerodynamic tuning specs (Glide Ratio, Dihedral Angle, Camber).

---

## 🚀 Quickstart

### Prerequisites
* [Node.js](https://nodejs.org/) v18+
* [pnpm](https://pnpm.io/) or npm

### Installation
```bash
git clone https://github.com/ajayspi/origami-mobile.git
cd origami-mobile
npm install
```

### Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your mobile browser or emulator.

### Production Build
```bash
npm run build
```

### Unit Tests
```bash
npm test
```

---

## 🛠️ Architecture

```
origami-mobile/
├── src/
│   ├── components/
│   │   ├── MobileApp.tsx            # Master mobile app shell with Studio vs Flight Mode switcher
│   │   ├── MobileStage.tsx          # 3D Three.js WebGL kinematics stage (Studio)
│   │   ├── MobileThumbDock.tsx      # Ergonomic 48px bottom thumb controls
│   │   ├── KitSelectorModal.tsx     # Visual catalog of all 54 kits
│   │   ├── SanctuaryModal.tsx       # Mindful breathing & pause overlay
│   │   ├── FlightStage.tsx          # 60 FPS 3D paper airplane flight canvas & physics loop
│   │   ├── FlightHUD.tsx            # Telemetry HUD (speed, distance, altitude, star tracker)
│   │   ├── TouchdownModal.tsx       # Flight debrief & scoring summary
│   │   ├── LevelSelectModal.tsx     # 5-level flight academy campaign selector
│   │   └── ArtisanHangarModal.tsx   # 3D glider hangar & aerodynamic tuning specs
│   ├── data/
│   │   ├── kits.json                # Complete 54-kit pedagogical database (12-16 steps)
│   │   └── gameLevels.ts            # Handcrafted course configurations & Endless mode
│   ├── store/
│   │   └── useGameStore.ts          # Zustand state store for game progression & telemetry
│   ├── types/
│   │   ├── origami.ts               # Folding step & kit interfaces
│   │   └── game.ts                  # Flight physics, obstacle, & level interfaces
│   ├── utils/
│   │   ├── canyonWorld.ts           # Procedural canyon track, obstacles, and lighting
│   │   ├── flightPhysics.ts         # Aerodynamic simulation (lift, drag, stall, ground effect)
│   │   ├── gameAudio.ts             # Web Audio procedural ASMR sound synthesizer
│   │   ├── mobileGeometry.ts        # Procedural 3D paper folding mesh & glider synthesis
│   │   └── mobileSpeech.ts          # Unhurried child-friendly speech synthesis
│   ├── main.tsx                     # React application entrypoint
│   └── tests/
│       ├── canyonWorld.test.ts      # Canyon generator & obstacle test suite
│       ├── flightPhysics.test.ts    # Aerodynamics & collision test suite
│       ├── flightStage.test.ts      # Flight stage rendering & glider geometry test suite
│       ├── gameAudio.test.ts        # Web Audio procedural synthesizer test suite
│       ├── gameScreens.test.ts      # Flight HUD & modal interfaces test suite
│       ├── gameStore.test.ts        # Zustand progression store test suite
│       └── mobileApp.test.ts        # Mobile studio application test suite
├── index.html                       # Mobile-optimized HTML viewport
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📄 License

MIT License — Copyright (c) 2026 Ajay Kiran & OrigamiStudio Contributors.
