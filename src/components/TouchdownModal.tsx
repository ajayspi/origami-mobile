import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { GAME_LEVELS } from '../data/gameLevels';
import { Trophy, RotateCcw, Wrench, ArrowRight, Sparkles, Wind, Clock } from 'lucide-react';

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
  const currentIdx = GAME_LEVELS.findIndex(l => l.id === activeLevelId);
  const hasNext = currentIdx >= 0 && currentIdx < GAME_LEVELS.length - 1;

  // Star Rating Calculation (1-3 stars)
  const starCount = distance >= activeLevel.goalDistance ? 3 : distance >= activeLevel.goalDistance * 0.6 ? 2 : 1;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 20
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: 'linear-gradient(165deg, #fffbeb 0%, #fef3c7 60%, #fed7aa 100%)',
          borderRadius: 32,
          border: '4px solid #b45309',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.9)',
          padding: '28px 24px 24px',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Top Trophy / Medal Seal */}
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: 38,
            background: 'linear-gradient(135deg, #fef08a, #f59e0b)',
            border: '4px solid #ffffff',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '-56px auto 14px',
            fontSize: 38
          }}
        >
          {goalMet ? '🏆' : '🌟'}
        </div>

        {/* 3-Star Rating */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          {[1, 2, 3].map(s => (
            <span
              key={s}
              style={{
                fontSize: 28,
                filter: 'drop-shadow(0 2px 6px rgba(245, 158, 11, 0.6))',
                opacity: s <= Math.max(1, starCount) ? 1 : 0.4,
                transform: s <= starCount ? 'scale(1.1)' : 'none'
              }}
            >
              ⭐
            </span>
          ))}
        </div>

        <h2
          style={{
            fontSize: 23,
            fontWeight: 900,
            color: '#1c1917',
            margin: '0 0 4px',
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}
        >
          {goalMet ? 'Mission Accomplished!' : 'Graceful Touchdown!'}
        </h2>

        <p style={{ fontSize: 13, color: '#78716c', margin: '0 0 20px', fontWeight: 600 }}>
          {goalMet
            ? `Outstanding! You cleared the ${activeLevel.name} gorge!`
            : `Splendid flight! You soared ${distance}m! Tip your glider's nose gently upward to float like a leaf! 🍃`}
        </p>

        {/* Scorecard Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginBottom: 20
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 18,
              border: '2px solid #e5e7eb',
              padding: '12px 10px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>
              DISTANCE FLOWN
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#0284c7', marginTop: 2 }}>
              {distance}m
            </div>
            <div style={{ fontSize: 9, color: '#64748b', fontWeight: 700 }}>
              GOAL: {activeLevel.goalDistance}m
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 18,
              border: '2px solid #e5e7eb',
              padding: '12px 10px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
              STARS COLLECTED
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#d97706', marginTop: 2 }}>
              +{starsCollected} ⭐
            </div>
            <div style={{ fontSize: 9, color: '#64748b', fontWeight: 700 }}>
              {thermalsCaught} Thermals Caught
            </div>
          </div>
        </div>

        {/* Action Pushable Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {goalMet && hasNext && (
            <button
              onClick={onNextLevel}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 18,
                border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 0 #047857, 0 8px 20px rgba(16, 185, 129, 0.35)',
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            >
              Next Expedition <ArrowRight size={18} />
            </button>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onFlyAgain}
              style={{
                flex: 1,
                padding: '13px',
                borderRadius: 18,
                border: 'none',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 4px 0 #b45309, 0 8px 18px rgba(245, 158, 11, 0.35)',
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            >
              <RotateCcw size={16} /> Fly Again
            </button>

            <button
              onClick={() => useGameStore.getState().goToCharacterSelect()}
              style={{
                flex: 1,
                padding: '13px',
                borderRadius: 18,
                border: '2px solid #b45309',
                background: '#ffffff',
                color: '#78350f',
                fontSize: 13,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 4px 0 #d97706',
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            >
              🦅 Change Creature
            </button>
          </div>

          <button
            onClick={onOpenHangar}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 14,
              border: '1px solid rgba(180, 83, 9, 0.4)',
              background: 'rgba(255, 255, 255, 0.7)',
              color: '#92400e',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <Wrench size={14} /> Workshop & Upgrades
          </button>
        </div>
      </div>
    </div>
  );
};
