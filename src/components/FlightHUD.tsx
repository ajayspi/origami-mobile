import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { GAME_LEVELS } from '../data/gameLevels';
import { ChevronLeft, Wrench, MapPin, Sparkles, Wind } from 'lucide-react';

interface FlightHUDProps {
  onBackToStudio: () => void;
  onOpenHangar: () => void;
  onOpenLevelSelect: () => void;
}

export const FlightHUD: React.FC<FlightHUDProps> = ({
  onBackToStudio,
  onOpenHangar,
  onOpenLevelSelect
}) => {
  const flightState = useGameStore(s => s.flightState);
  const activeLevelId = useGameStore(s => s.activeLevelId);
  const distance = useGameStore(s => s.distance);
  const altitude = useGameStore(s => s.altitude);
  const speed = useGameStore(s => s.speed);
  const thermalsCaught = useGameStore(s => s.thermalsCaught);
  const starsCollected = useGameStore(s => s.starsCollected);
  const totalStars = useGameStore(s => s.totalStars);

  const activeLevel = GAME_LEVELS.find(l => l.id === activeLevelId) || GAME_LEVELS[0];
  const progressPercent = Math.min(100, Math.round((distance / activeLevel.goalDistance) * 100));

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
      {/* Top Header Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '12px 16px',
          paddingTop: 'calc(env(safe-area-inset-top) + 8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.75), transparent)',
          pointerEvents: 'auto'
        }}
      >
        <button
          onClick={onBackToStudio}
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            border: 'none',
            borderRadius: 20,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 800,
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={16} /> Studio
        </button>

        <button
          onClick={onOpenLevelSelect}
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            border: 'none',
            borderRadius: 20,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 800,
            color: '#0369a1',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <MapPin size={15} /> Level {activeLevel.levelNumber}
        </button>

        <button
          onClick={onOpenHangar}
          style={{
            background: 'rgba(245, 158, 11, 0.92)',
            border: 'none',
            borderRadius: 20,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 800,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)'
          }}
        >
          <Wrench size={15} /> ⭐ {totalStars}
        </button>
      </div>

      {/* Level Goal Progress Bar */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top) + 60px)',
          left: 20,
          right: 20,
          height: 6,
          backgroundColor: 'rgba(255, 255, 255, 0.35)',
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            backgroundColor: '#0ea5e9',
            transition: 'width 0.2s linear'
          }}
        />
      </div>

      {/* In-Flight Live Telemetry Display */}
      {flightState === 'flying' && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top) + 76px)',
            left: 20,
            right: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(0,0,0,0.6)'
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 700, textTransform: 'uppercase' }}>Altitude</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{Math.round(altitude)}m</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#fef08a' }}>{distance}m</div>
            <div style={{ fontSize: 11, opacity: 0.9, fontWeight: 700 }}>
              GOAL: {activeLevel.goalDistance}m
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 700, textTransform: 'uppercase' }}>Speed</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{Math.round(speed * 3.6)} <span style={{ fontSize: 12 }}>km/h</span></div>
          </div>
        </div>
      )}

      {/* Thermal & Star Multiplier Banner */}
      {flightState === 'flying' && thermalsCaught > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top) + 140px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(245, 158, 11, 0.9)',
            color: '#ffffff',
            padding: '4px 14px',
            borderRadius: 16,
            fontSize: 12,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
          }}
        >
          <Wind size={14} /> THERMAL CHAIN x{thermalsCaught} (+{starsCollected} ⭐)
        </div>
      )}

      {/* Bottom Control Hint / Launch Prompt */}
      {flightState === 'idle' && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(env(safe-area-inset-bottom) + 32px)',
            left: 20,
            right: 20,
            textAlign: 'center',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(10px)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 24,
            fontSize: 14,
            fontWeight: 700
          }}
        >
          👉 Drag backward on screen to build tension & launch!
        </div>
      )}

      {flightState === 'aiming' && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(env(safe-area-inset-bottom) + 32px)',
            left: 20,
            right: 20,
            textAlign: 'center',
            background: 'rgba(14, 165, 233, 0.85)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 24,
            fontSize: 15,
            fontWeight: 800,
            boxShadow: '0 6px 20px rgba(14, 165, 233, 0.5)'
          }}
        >
          🚀 Release finger to launch glider!
        </div>
      )}
    </div>
  );
};
