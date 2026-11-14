import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX, Sparkles, FolderOpen, Heart, Plane } from 'lucide-react';
import { MobileStage } from './MobileStage';
import { MobileThumbDock } from './MobileThumbDock';
import { SanctuaryModal } from './SanctuaryModal';
import { KitSelectorModal } from './KitSelectorModal';
import { FlightStage } from './FlightStage';
import { FlightHUD } from './FlightHUD';
import { TouchdownModal } from './TouchdownModal';
import { LevelSelectModal } from './LevelSelectModal';
import { ArtisanHangarModal } from './ArtisanHangarModal';
import { mobileSpeech } from '../utils/mobileSpeech';
import { useGameStore } from '../store/useGameStore';
import { GAME_LEVELS } from '../data/gameLevels';
import rawKitsData from '../data/kits.json';
import type { OrigamiKit } from '../types/origami';

const ALL_KITS: OrigamiKit[] = Object.values(rawKitsData) as unknown as OrigamiKit[];

export const MobileApp: React.FC = () => {
  const [appMode, setAppMode] = useState<'studio' | 'game'>('studio');
  const [isHangarOpen, setIsHangarOpen] = useState<boolean>(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(false);

  const [activeKit, setActiveKit] = useState<OrigamiKit>(() => {
    return ALL_KITS.find(k => k.id === 'japanese-01') || ALL_KITS[0];
  });
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [foldFactor, setFoldFactor] = useState<number>(0.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPancakeFlipped, setIsPancakeFlipped] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isSanctuaryOpen, setIsSanctuaryOpen] = useState<boolean>(false);
  const [isKitSelectorOpen, setIsKitSelectorOpen] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const totalSteps = activeKit.steps?.length || 16;
  const currentStep = activeKit.steps?.[currentStepIdx] || activeKit.steps?.[0];

  // Subscribe to voice controller speaking state
  useEffect(() => {
    return mobileSpeech.subscribe((s) => {
      setIsSpeaking(s.isSpeaking);
      setIsVoiceEnabled(s.isEnabled);
    });
  }, []);

  // Reset step & fold progress when active kit changes
  useEffect(() => {
    mobileSpeech.stop();
    setCurrentStepIdx(0);
    setFoldFactor(0.0);
    setIsPlaying(false);
    setIsPancakeFlipped(false);
  }, [activeKit.id]);

  // Unhurried speech: speaks current step instruction ONCE when step changes
  useEffect(() => {
    mobileSpeech.stop();
    if (appMode === 'studio' && isVoiceEnabled && currentStep?.instruction) {
      const timer = setTimeout(() => {
        mobileSpeech.speak(currentStep.instruction);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [appMode, currentStepIdx, activeKit.id, isVoiceEnabled]);

  // Animation player for smooth fold replay
  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const stepStartTime = performance.now();
      const duration = 2800; // Unhurried 2.8s fold cycle

      const frame = (time: number) => {
        const elapsed = time - stepStartTime;
        const progress = Math.min(1.0, elapsed / duration);
        // Smooth cubic ease-in-out
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        setFoldFactor(eased);

        if (progress < 1.0) {
          animId = requestAnimationFrame(frame);
        } else {
          setIsPlaying(false);
        }
      };
      animId = requestAnimationFrame(frame);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const handleNextStep = () => {
    if (currentStepIdx < totalSteps - 1) {
      setCurrentStepIdx(prev => prev + 1);
      setFoldFactor(0.0);
      setIsPancakeFlipped(false);
    } else {
      // Model Complete! Trigger celebration!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setShowCelebration(true);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
      setFoldFactor(1.0);
      setIsPancakeFlipped(false);
    }
  };

  const handlePlayFold = () => {
    setFoldFactor(0.0);
    setIsPlaying(true);
  };

  const handlePancakeFlip = () => {
    setIsPancakeFlipped(prev => !prev);
  };

  const handleToggleVoice = () => {
    if (isSpeaking) {
      mobileSpeech.stop();
    } else {
      if (currentStep?.instruction) {
        mobileSpeech.speak(currentStep.instruction);
      }
    }
  };

  // Next level handler for game mode
  const handleNextGameLevel = () => {
    const activeLevelId = useGameStore.getState().activeLevelId;
    const currentIdx = GAME_LEVELS.findIndex(l => l.id === activeLevelId);
    if (currentIdx + 1 < GAME_LEVELS.length) {
      useGameStore.getState().selectLevel(GAME_LEVELS[currentIdx + 1].id);
    }
    useGameStore.getState().resetRun();
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
        backgroundColor: '#faf8f5',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* 1. TOP MINIMAL HEADER BAR */}
      <header
        style={{
          height: 48,
          padding: '0 16px',
          paddingTop: 'env(safe-area-inset-top)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(250, 248, 245, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          zIndex: 30,
          flexShrink: 0
        }}
      >
        {/* Kit Selector Button */}
        <button
          onClick={() => {
            if (appMode === 'game') {
              setAppMode('studio');
            } else {
              setIsKitSelectorOpen(true);
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 800,
            color: '#1c1917',
            cursor: 'pointer'
          }}
        >
          <FolderOpen size={16} color="#0ea5e9" />
          <span style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {appMode === 'game' ? '← Studio' : activeKit.title}
          </span>
        </button>

        {/* Mode Switcher Toggle: Folding Studio vs Flight Academy */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#f1f5f9', padding: '3px', borderRadius: 16 }}>
          <button
            onClick={() => {
              setAppMode('studio');
              mobileSpeech.stop();
            }}
            style={{
              padding: '4px 10px',
              borderRadius: 13,
              border: 'none',
              backgroundColor: appMode === 'studio' ? '#ffffff' : 'transparent',
              color: appMode === 'studio' ? '#0ea5e9' : '#64748b',
              fontWeight: 800,
              fontSize: 11,
              cursor: 'pointer',
              boxShadow: appMode === 'studio' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            Studio
          </button>
          <button
            onClick={() => {
              setAppMode('game');
              mobileSpeech.stop();
              useGameStore.getState().resetRun();
            }}
            style={{
              padding: '4px 10px',
              borderRadius: 13,
              border: 'none',
              backgroundColor: appMode === 'game' ? '#0ea5e9' : 'transparent',
              color: appMode === 'game' ? '#ffffff' : '#64748b',
              fontWeight: 800,
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: appMode === 'game' ? '0 2px 6px rgba(14,165,233,0.3)' : 'none'
            }}
          >
            <Plane size={12} /> Flight
          </button>
        </div>

        {/* Action Controls in Studio Mode */}
        {appMode === 'studio' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={handleToggleVoice}
              title={isVoiceEnabled ? 'Replay Voice Instruction' : 'Enable Voice'}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                border: 'none',
                backgroundColor: isSpeaking ? '#e0f2fe' : '#f5f5f4',
                color: isSpeaking ? '#0284c7' : '#78716c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              onClick={() => setIsSanctuaryOpen(true)}
              title="Smooth Paper & Breathe"
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                border: 'none',
                backgroundColor: '#fef2f2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Heart size={16} />
            </button>
          </div>
        ) : (
          <div style={{ width: 34 }} />
        )}
      </header>

      {/* 2. BODY CONTENT: STUDIO VS FLIGHT GAME */}
      {appMode === 'game' ? (
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <FlightStage />
          <FlightHUD
            onBackToStudio={() => setAppMode('studio')}
            onOpenHangar={() => setIsHangarOpen(true)}
            onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
          />
          <TouchdownModal
            onFlyAgain={() => useGameStore.getState().resetRun()}
            onOpenHangar={() => setIsHangarOpen(true)}
            onNextLevel={handleNextGameLevel}
          />
          <LevelSelectModal isOpen={isLevelSelectOpen} onClose={() => setIsLevelSelectOpen(false)} />
          <ArtisanHangarModal isOpen={isHangarOpen} onClose={() => setIsHangarOpen(false)} />
        </div>
      ) : (
        <>
          {/* 70% 3D KINEMATICS VIEWPORT */}
          <main style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
            <MobileStage
              kit={activeKit}
              currentStepIdx={currentStepIdx}
              totalSteps={totalSteps}
              foldFactor={foldFactor}
              isPancakeFlipped={isPancakeFlipped}
            />

            {/* Instruction Banner Floating at top of 3D Canvas */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                right: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(8px)',
                borderRadius: 16,
                padding: '10px 14px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                zIndex: 20
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    color: '#0284c7',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Step {currentStepIdx + 1}
                </span>
                <span style={{ fontSize: 10, color: '#a8a29e' }}>•</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#44403c' }}>
                  {currentStep.title || currentStep.foldType || 'Fold Paper'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.4, color: '#1c1917', fontWeight: 600 }}>
                {currentStep.instruction}
              </p>
            </div>
          </main>

          {/* 30% ERGONOMIC BOTTOM THUMB DOCK */}
          <MobileThumbDock
            currentStepIdx={currentStepIdx}
            totalSteps={totalSteps}
            foldFactor={foldFactor}
            isPlaying={isPlaying}
            isPancakeFlipped={isPancakeFlipped}
            onPrev={handlePrevStep}
            onNext={handleNextStep}
            onTogglePlay={handlePlayFold}
            onTogglePancakeFlip={handlePancakeFlip}
            onSeek={(val: number) => {
              setIsPlaying(false);
              setFoldFactor(val);
            }}
          />

          <SanctuaryModal
            isOpen={isSanctuaryOpen}
            onClose={() => setIsSanctuaryOpen(false)}
            onResetFold={() => setFoldFactor(0.0)}
          />
          <KitSelectorModal
            isOpen={isKitSelectorOpen}
            kits={ALL_KITS}
            activeKitId={activeKit.id}
            onSelectKit={(kit) => {
              setActiveKit(kit);
              setIsKitSelectorOpen(false);
            }}
            onClose={() => setIsKitSelectorOpen(false)}
          />
        </>
      )}

      {/* Completion Celebration Modal */}
      {showCelebration && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 320,
              backgroundColor: '#ffffff',
              borderRadius: 24,
              padding: 24,
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 8 }}>🏆</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1c1917', marginBottom: 8 }}>
              Masterwork Complete!
            </h2>
            <p style={{ fontSize: 14, color: '#57534e', lineHeight: 1.5, marginBottom: 20 }}>
              You folded the entire {activeKit.title}! Hold your paper model up with pride!
            </p>

            {activeKit.id.startsWith('aerospace') && (
              <button
                onClick={() => {
                  setShowCelebration(false);
                  useGameStore.getState().selectKit(activeKit.id);
                  setAppMode('game');
                }}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 14,
                  border: 'none',
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)'
                }}
              >
                <Plane size={18} /> Test Flight in Flight Academy!
              </button>
            )}

            <button
              onClick={() => {
                setShowCelebration(false);
                setCurrentStepIdx(0);
                setFoldFactor(0.0);
              }}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              Fold Another Model! ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
