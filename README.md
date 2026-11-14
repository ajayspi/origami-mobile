# OrigamiStudio Mobile (origami-mobile)

> **Fresh, Mindful 3D Paper Folding Companion for Children & Pre-Readers**  
> Standalone Mobile Application & Computational Kinematics Workbench

---

## 📱 Overview

OrigamiStudio Mobile is a dedicated, distraction-free mobile paper folding application engineered specifically for children, students, and makers folding real paper at a table.

Unlike traditional desktop web views that squeeze dense desktop menus onto phones, OrigamiStudio Mobile provides a **fresh, purpose-built mobile interface**:
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

---

## 🚀 Quickstart

### Prerequisites
* [Node.js](https://nodejs.org/) v18+
* [pnpm](https://pnpm.io/) or npm

### Installation
```bash
git clone https://github.com/ajayspi/origami-mobile.git
cd origami-mobile
pnpm install
```

### Development Server
```bash
pnpm dev
```
Open `http://localhost:3000` in your mobile browser or emulator.

### Production Build
```bash
pnpm build
```

### Unit Tests
```bash
pnpm test
```

---

## 🛠️ Architecture

```
origami-mobile/
├── src/
│   ├── components/
│   │   ├── MobileApp.tsx            # Master mobile app shell
│   │   ├── MobileStage.tsx          # 3D Three.js WebGL kinematics stage
│   │   ├── MobileThumbDock.tsx      # Ergonomic 48px bottom thumb controls
│   │   ├── KitSelectorModal.tsx     # Visual catalog of all 54 kits
│   │   └── SanctuaryModal.tsx       # Mindful breathing & pause overlay
│   ├── data/
│   │   └── kits.json                # Complete 54-kit pedagogical database (12-16 steps)
│   ├── types/
│   │   └── origami.ts               # TypeScript interfaces
│   ├── utils/
│   │   ├── mobileGeometry.ts        # Procedural 3D paper folding mesh synthesis
│   │   └── mobileSpeech.ts          # Unhurried child-friendly speech synthesis
│   ├── main.tsx                     # React application entrypoint
│   └── tests/
│       └── mobileApp.test.ts        # Vitest suite
├── index.html                       # Mobile-optimized HTML viewport
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📄 License

MIT License — Copyright (c) 2026 Ajay Kiran & OrigamiStudio Contributors.
