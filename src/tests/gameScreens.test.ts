import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { useGameStore } from '../store/useGameStore';
import { FlightSplashScreen } from '../components/FlightSplashScreen';

describe('FlightSplashScreen Arcade UI', () => {
  it('renders title ribbon, high score banner, and launch button', () => {
    const onStart = vi.fn();
    const html = renderToString(React.createElement(FlightSplashScreen, {
      onStartLaunch: onStart,
      bestDistance: 450,
      totalStars: 120
    }));

    expect(html).toContain('ORIGAMI FLIGHT');
    expect(html).toContain('450m');
    expect(html).toContain('LAUNCH INTO CANYON');
  });
});

describe('gameScreens', () => {
  it('verifies level select modal allows selecting unlocked levels only', () => {
    useGameStore.setState({ unlockedLevels: ['level-1', 'level-2'] });
    const store = useGameStore.getState();
    store.selectLevel('level-2');
    expect(useGameStore.getState().activeLevelId).toBe('level-2');

    // Attempting locked level does not change activeLevelId
    store.selectLevel('level-5');
    expect(useGameStore.getState().activeLevelId).toBe('level-2');
  });

  it('manages paper stock switching in the artisan hangar', () => {
    const store = useGameStore.getState();
    store.setPaperStock('gold_foil');
    expect(useGameStore.getState().activePaperStock).toBe('gold_foil');
    store.setPaperStock('sakura');
    expect(useGameStore.getState().activePaperStock).toBe('sakura');
  });

  it('handles upgrade purchases and unlocks', () => {
    useGameStore.setState({ totalStars: 100, upgrades: { lift: 1, drag: 1, impulse: 1, thermalMagnet: 1 } });
    const success = useGameStore.getState().spendStarsOnUpgrade('impulse', 25);
    expect(success).toBe(true);
    expect(useGameStore.getState().upgrades.impulse).toBe(2);
    expect(useGameStore.getState().totalStars).toBe(75);
  });

  it('selects kit archetype between jet dart, sacred crane, and celestial dragon', () => {
    const store = useGameStore.getState();
    store.selectKit('japanese-01');
    expect(useGameStore.getState().selectedKitId).toBe('japanese-01');

    store.selectKit('chinese-03');
    expect(useGameStore.getState().selectedKitId).toBe('chinese-03');

    store.selectKit('aerospace-02');
    expect(useGameStore.getState().selectedKitId).toBe('aerospace-02');
  });
});
