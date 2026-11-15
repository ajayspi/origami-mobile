import React, { useState } from 'react';
import { FlightStage } from './FlightStage';
import { FlightHUD } from './FlightHUD';
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

  const selectedKitId = useGameStore(s => s.selectedKitId);
  const activeLevelId = useGameStore(s => s.activeLevelId);

  const handleNextGameLevel = () => {
    const currentIdx = GAME_LEVELS.findIndex(l => l.id === activeLevelId);
    if (currentIdx !== -1 && currentIdx < GAME_LEVELS.length - 1) {
      const nextLvl = GAME_LEVELS[currentIdx + 1];
      useGameStore.getState().selectLevel(nextLvl.id);
      useGameStore.getState().resetRun();
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
      {/* 3D Paper Flight Stage */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <FlightStage />

        {/* In-Flight HUD & Slingshot Launcher Prompt */}
        <FlightHUD
          onOpenKitSelector={() => setIsKitSelectorOpen(true)}
          onOpenHangar={() => setIsHangarOpen(true)}
          onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
        />

        {/* Touchdown Scorecard & Debrief */}
        <TouchdownModal
          onFlyAgain={() => useGameStore.getState().resetRun()}
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
    </div>
  );
};
