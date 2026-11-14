import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX, Sparkles, FolderOpen, Heart } from 'lucide-react';
import { MobileStage } from './MobileStage';
import { MobileThumbDock } from './MobileThumbDock';
import { SanctuaryModal } from './SanctuaryModal';
import { KitSelectorModal } from './KitSelectorModal';
import { mobileSpeech } from '../utils/mobileSpeech';
import rawKitsData from '../data/kits.json';
import type { OrigamiKit } from '../types/origami';

const ALL_KITS: OrigamiKit[] = Object.values(rawKitsData) as unknown as OrigamiKit[];

export const MobileApp: React.FC = () => {
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
    setIsPancakeFlipped(false);

    if (!isVoiceEnabled || !currentStep) return;

    // Speak single concise instruction after a calm 400ms pause
    mobileSpeech.speak(currentStep.instruction);

    return () => {
      mobileSpeech.stop();
    };
  }, [currentStepIdx, isVoiceEnabled, currentStep?.instruction]);

  // Animation Loop for "Watch Fold" play action
  const animRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let start = performance.now();
    const duration = 2400; // Unhurried 2.4s fold duration

    const loop = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1.0, elapsed / duration);
      // Smooth cubic ease-in-out
      const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      setFoldFactor(eased);

      if (progress < 1.0) {
        animRef.current = requestAnimationFrame(loop);
      } else {
        setFoldFactor(1.0);
        setIsPlaying(false);
      }
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying]);

  const handlePrev = () => {
    mobileSpeech.stop();
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
      setFoldFactor(0.0);
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    mobileSpeech.stop();
    if (currentStepIdx < totalSteps - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
      setFoldFactor(0.0);
      setIsPlaying(false);
    } else {
      // Finished all steps! Celebrate!
      setShowCelebration(true);
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (foldFactor >= 0.98) {
        setFoldFactor(0.0);
      }
      setIsPlaying(true);
    }
  };

  const handleToggleVoice = () => {
    const next = mobileSpeech.toggle();
    if (next && currentStep) {
      mobileSpeech.speak(currentStep.instruction);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#faf8f5',
        overflow: 'hidden',
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
          onClick={() => setIsKitSelectorOpen(true)}
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
          <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeKit.title}
          </span>
        </button>

        {/* Step Progress Counter Pill */}
        <div
          style={{
            padding: '3px 10px',
            borderRadius: 14,
            backgroundColor: '#f5f5f4',
            fontSize: 11,
            fontFamily: 'monospace',
            fontWeight: 800,
            color: '#0284c7'
          }}
        >
          Step {currentStepIdx + 1} / {totalSteps}
        </div>

        {/* Action Controls: Voice Replay & Mindful Sanctuary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Voice Button */}
          <button
            onClick={handleToggleVoice}
            title={isVoiceEnabled ? 'Replay Voice Instruction' : 'Enable Voice'}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              border: 'none',
              backgroundColor: isVoiceEnabled ? '#e0f2fe' : '#f5f5f4',
              color: isVoiceEnabled ? '#0284c7' : '#a8a29e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            {isSpeaking && (
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  backgroundColor: '#38bdf8',
                  opacity: 0.4,
                  animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
                }}
              />
            )}
            {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Mindful Pause Button */}
          <button
            onClick={() => setIsSanctuaryOpen(true)}
            title="Take a breath"
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              border: 'none',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Heart size={16} />
          </button>
        </div>
      </header>

      {/* 2. 3D KINEMATICS STAGE (Dedicated, Unobstructed Viewport) */}
      <main style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <MobileStage
          kit={activeKit}
          currentStepIdx={currentStepIdx}
          totalSteps={totalSteps}
          foldFactor={foldFactor}
          isPancakeFlipped={isPancakeFlipped}
        />
      </main>

      {/* 3. ACTIVE STEP INSTRUCTION CARD (Clean & Uncluttered) */}
      <section
        style={{
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, color: '#1c1917', lineHeight: 1.3 }}>
          {currentStep?.title || 'Fold Guideline'}
        </div>
        <p style={{ fontSize: 12, color: '#57534e', lineHeight: 1.45, margin: 0 }}>
          {currentStep?.instruction || 'Place paper flat on the desk.'}
        </p>
        {currentStep?.tip && (
          <div style={{ fontSize: 11, color: '#0284c7', fontStyle: 'italic', marginTop: 2 }}>
            💡 {currentStep.tip}
          </div>
        )}
      </section>

      {/* 4. ERGONOMIC MOBILE THUMB DOCK */}
      <MobileThumbDock
        currentStepIdx={currentStepIdx}
        totalSteps={totalSteps}
        foldFactor={foldFactor}
        isPlaying={isPlaying}
        isPancakeFlipped={isPancakeFlipped}
        onPrev={handlePrev}
        onNext={handleNext}
        onTogglePlay={handleTogglePlay}
        onTogglePancakeFlip={() => setIsPancakeFlipped(!isPancakeFlipped)}
        onSeek={(val) => {
          setIsPlaying(false);
          setFoldFactor(val);
        }}
      />

      {/* Modals */}
      <SanctuaryModal
        isOpen={isSanctuaryOpen}
        onClose={() => setIsSanctuaryOpen(false)}
        onResetFold={() => {
          setIsPlaying(false);
          setFoldFactor(0.0);
        }}
      />

      <KitSelectorModal
        isOpen={isKitSelectorOpen}
        kits={ALL_KITS}
        activeKitId={activeKit.id}
        onSelectKit={(k) => setActiveKit(k)}
        onClose={() => setIsKitSelectorOpen(false)}
      />

      {/* Celebration Modal */}
      {showCelebration && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(28, 25, 23, 0.8)',
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
