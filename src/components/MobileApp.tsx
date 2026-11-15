import React, { useState } from 'react';
import { FlightStage } from './FlightStage';
import { FlightHUD } from './FlightHUD';
import { FlightSplashScreen } from './FlightSplashScreen';
import { CharacterSelectStage } from './CharacterSelectStage';
import { TouchdownModal } from './TouchdownModal';
import { LevelSelectModal } from './LevelSelectModal';
import { ArtisanHangarModal } from './ArtisanHangarModal';
import { KitSelectorModal } from './KitSelectorModal';
import { useGameStore } from '../store/useGameStore';
import { GAME_LEVELS } from '../data/gameLevels';
import rawKitsData from '../data/kits.json';
import type { OrigamiKit } from '../types/origami';

const ALL_KITS: OrigamiKit[] = Object.values(rawKitsData) as unknown as OrigamiKit[];

export const MobileApp: React.FC = () => {
  const [isHangarOpen, setIsHangarOpen] = useState<boolean>(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(false);
  const [isKitSelectorOpen, setIsKitSelectorOpen] = useState<boolean>(false);

  const flightState = useGameStore(s => s.flightState);
  const selectedKitId = useGameStore(s => s.selectedKitId);
  const activeLevelId = useGameStore(s => s.activeLevelId);
  const highScores = useGameStore(s => s.highScores);
  const totalStars = useGameStore(s => s.totalStars);

  const bestDistance = Math.max(0, ...Object.values(highScores));

  const handleNextGameLevel = () => {
    const currentIdx = GAME_LEVELS.findIndex(l => l.id === activeLevelId);
    if (currentIdx !== -1 && currentIdx < GAME_LEVELS.length - 1) {
      const nextLvl = GAME_LEVELS[currentIdx + 1];
      useGameStore.getState().selectLevel(nextLvl.id);
      useGameStore.getState().instantCliffRespawn();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100dvh',
        backgroundColor: '#0f172a',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {/* 1. Arcade Splash Screen Stage */}
      {flightState === 'splash' && (
        <FlightSplashScreen
          onStartLaunch={() => useGameStore.getState().goToCharacterSelect()}
          bestDistance={bestDistance}
          totalStars={totalStars}
        />
      )}

      {/* 2. 3D Character Selection Stage */}
      {flightState === 'select' && (
        <CharacterSelectStage
          selectedKitId={selectedKitId}
          onSelectCreature={(id) => useGameStore.getState().selectKit(id)}
          onDeployToCliff={() => useGameStore.getState().goToCliff()}
        />
      )}

      {/* 3. 30m Cliff Precipice Flight Stage & HUD */}
      {(flightState === 'cliff-aim' || flightState === 'flying' || flightState === 'landed' || flightState === 'idle' || flightState === 'aiming') && (
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <FlightStage />

          {/* In-Flight HUD & Slingshot Launcher Prompt */}
          <FlightHUD
            onOpenKitSelector={() => useGameStore.getState().goToCharacterSelect()}
            onOpenHangar={() => setIsHangarOpen(true)}
            onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
          />

          {/* Touchdown Scorecard & Debrief with 350ms instant cliff respawn */}
          <TouchdownModal
            onFlyAgain={() => useGameStore.getState().instantCliffRespawn()}
            onOpenHangar={() => setIsHangarOpen(true)}
            onNextLevel={handleNextGameLevel}
          />

          {/* Modals */}
          <LevelSelectModal
            isOpen={isLevelSelectOpen}
            onClose={() => setIsLevelSelectOpen(false)}
          />

          <ArtisanHangarModal
            isOpen={isHangarOpen}
            onClose={() => setIsHangarOpen(false)}
          />

          <KitSelectorModal
            isOpen={isKitSelectorOpen}
            kits={ALL_KITS}
            activeKitId={selectedKitId}
            onSelectKit={(kit) => {
              useGameStore.getState().selectKit(kit.id);
              setIsKitSelectorOpen(false);
            }}
            onClose={() => setIsKitSelectorOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
