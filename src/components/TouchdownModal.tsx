import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { GAME_LEVELS } from '../data/gameLevels';
import { Trophy, RotateCcw, Wrench, ArrowRight } from 'lucide-react';

interface TouchdownModalProps {
  onFlyAgain: () => void;
  onOpenHangar: () => void;
  onNextLevel: () => void;
}

export const TouchdownModal: React.FC<TouchdownModalProps> = ({
  onFlyAgain,
  onOpenHangar,
  onNextLevel
}) => {
  const flightState = useGameStore(s => s.flightState);
  const activeLevelId = useGameStore(s => s.activeLevelId);
  const distance = useGameStore(s => s.distance);
  const thermalsCaught = useGameStore(s => s.thermalsCaught);
  const starsCollected = useGameStore(s => s.starsCollected);

  if (flightState !== 'landed') return null;

  const activeLevel = GAME_LEVELS.find(l => l.id === activeLevelId) || GAME_LEVELS[0];
  const goalMet = distance >= activeLevel.goalDistance;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 24
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 340,
          backgroundColor: '#faf8f5',
          borderRadius: 28,
          padding: 24,
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.4)'
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: goalMet ? '#fef08a' : '#e2e8f0',
            color: goalMet ? '#b45309' : '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 32
          }}
        >
          {goalMet ? '🏆' : '🛬'}
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1e293b', margin: '0 0 6px' }}>
          {goalMet ? 'Level Cleared!' : 'Soft Landing!'}
        </h2>

        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>
          {goalMet
            ? `Congratulations! You reached ${distance}m in ${activeLevel.name}.`
            : `You glided ${distance}m. Keep practicing to reach the ${activeLevel.goalDistance}m goal!`}
        </p>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 24
          }}
        >
          <div style={{ backgroundColor: '#f1f5f9', padding: '12px 8px', borderRadius: 16 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>DISTANCE</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#0ea5e9' }}>{distance}m</div>
          </div>
          <div style={{ backgroundColor: '#f1f5f9', padding: '12px 8px', borderRadius: 16 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>STARS WON</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#f59e0b' }}>+{starsCollected} ⭐</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {goalMet && (
            <button
              onClick={onNextLevel}
              style={{
                width: '100%',
                height: 48,
                backgroundColor: '#0ea5e9',
                color: '#ffffff',
                border: 'none',
                borderRadius: 24,
                fontSize: 15,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)'
              }}
            >
              Next Level <ArrowRight size={18} />
            </button>
          )}

          <button
            onClick={onFlyAgain}
            style={{
              width: '100%',
              height: 48,
              backgroundColor: '#1e293b',
              color: '#ffffff',
              border: 'none',
              borderRadius: 24,
              fontSize: 15,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={18} /> Fly Again
          </button>

          <button
            onClick={onOpenHangar}
            style={{
              width: '100%',
              height: 44,
              backgroundColor: 'transparent',
              color: '#0284c7',
              border: '1px solid #bae6fd',
              borderRadius: 22,
              fontSize: 14,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer'
            }}
          >
            <Wrench size={16} /> Tuning Workshop
          </button>
        </div>
      </div>
    </div>
  );
};
