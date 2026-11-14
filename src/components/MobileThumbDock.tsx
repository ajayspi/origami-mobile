import React from 'react';
import { ChevronLeft, ChevronRight, Play, RotateCcw, Trophy } from 'lucide-react';

interface MobileThumbDockProps {
  currentStepIdx: number;
  totalSteps: number;
  foldFactor: number;
  isPlaying: boolean;
  isPancakeFlipped: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onTogglePancakeFlip: () => void;
  onSeek: (value: number) => void;
}

export const MobileThumbDock: React.FC<MobileThumbDockProps> = ({
  currentStepIdx,
  totalSteps,
  foldFactor,
  isPlaying,
  isPancakeFlipped,
  onPrev,
  onNext,
  onTogglePlay,
  onTogglePancakeFlip,
  onSeek
}) => {
  const isFinalStep = currentStepIdx === totalSteps - 1;

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#ffffff',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)',
        padding: '12px 16px',
        paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 20
      }}
    >
      {/* Fold Progress Scrubber Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
        <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: '#78716c', minWidth: 64 }}>
          Fold {Math.round(foldFactor * 100)}%
        </span>
        <input
          type="range"
          min="0"
          max="100"
          value={Math.round(foldFactor * 100)}
          onChange={(e) => onSeek(parseInt(e.target.value, 10) / 100)}
          style={{
            flex: 1,
            height: 6,
            accentColor: '#0ea5e9',
            cursor: 'pointer'
          }}
        />
      </div>

      {/* Primary Action Buttons (48px+ Touch Targets) */}
      <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 48px 1.4fr', gap: 8, alignItems: 'center' }}>
        {/* 1. Prev Step Button */}
        <button
          onClick={onPrev}
          disabled={currentStepIdx === 0}
          title="Previous Step"
          style={{
            height: 48,
            borderRadius: 14,
            border: '1px solid rgba(0, 0, 0, 0.1)',
            backgroundColor: currentStepIdx === 0 ? '#f5f5f4' : '#f5f5f4',
            color: currentStepIdx === 0 ? '#d6d3d1' : '#44403c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentStepIdx === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          <ChevronLeft size={22} />
        </button>

        {/* 2. Play / Replay Animation */}
        <button
          onClick={onTogglePlay}
          style={{
            height: 48,
            borderRadius: 14,
            border: '1px solid rgba(14, 165, 233, 0.3)',
            backgroundColor: '#f0f9ff',
            color: '#0284c7',
            fontWeight: 800,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer'
          }}
        >
          {isPlaying ? (
            <span>⏸ Pause</span>
          ) : foldFactor >= 0.98 ? (
            <>
              <RotateCcw size={16} />
              <span>Replay</span>
            </>
          ) : (
            <>
              <Play size={16} fill="currentColor" />
              <span>Watch Fold</span>
            </>
          )}
        </button>

        {/* 3. Flip 180° Pancake Button */}
        <button
          onClick={onTogglePancakeFlip}
          title="Flip paper 180 degrees like a pancake"
          style={{
            height: 48,
            borderRadius: 14,
            border: isPancakeFlipped ? '2px solid #f59e0b' : '1px solid rgba(0, 0, 0, 0.1)',
            backgroundColor: isPancakeFlipped ? '#fef3c7' : '#f5f5f4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            cursor: 'pointer'
          }}
        >
          🥞
        </button>

        {/* 4. Next Step / Complete Button */}
        <button
          onClick={onNext}
          style={{
            height: 48,
            borderRadius: 14,
            border: 'none',
            background: isFinalStep
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            boxShadow: isFinalStep
              ? '0 4px 14px rgba(16, 185, 129, 0.35)'
              : '0 4px 14px rgba(14, 165, 233, 0.35)',
            cursor: 'pointer'
          }}
        >
          <span>{isFinalStep ? 'Finish!' : 'Next'}</span>
          {isFinalStep ? <Trophy size={18} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </div>
  );
};
