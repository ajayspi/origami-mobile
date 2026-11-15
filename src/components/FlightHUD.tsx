import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { GAME_LEVELS } from '../data/gameLevels';
import { TRINITY_KITS } from '../types/game';
import { Wrench, MapPin, Sparkles, Wind, Gauge, Compass } from 'lucide-react';

interface FlightHUDProps {
  onOpenKitSelector: () => void;
  onOpenHangar: () => void;
  onOpenLevelSelect: () => void;
}

export const FlightHUD: React.FC<FlightHUDProps> = ({
  onOpenKitSelector,
  onOpenHangar,
  onOpenLevelSelect
}) => {
  const flightState = useGameStore(s => s.flightState);
  const activeLevelId = useGameStore(s => s.activeLevelId);
  const selectedKitId = useGameStore(s => s.selectedKitId);
  const distance = useGameStore(s => s.distance);
  const altitude = useGameStore(s => s.altitude);
  const speed = useGameStore(s => s.speed);
  const thermalsCaught = useGameStore(s => s.thermalsCaught);
  const starsCollected = useGameStore(s => s.starsCollected);
  const totalStars = useGameStore(s => s.totalStars);
  const activeStunt = useGameStore(s => s.activeStunt);

  const activeLevel = GAME_LEVELS.find(l => l.id === activeLevelId) || GAME_LEVELS[0];
  const activeTrinity = TRINITY_KITS[selectedKitId] || { icon: '✈️', name: 'Falcon Dart' };
  const progressPercent = Math.min(100, Math.round((distance / activeLevel.goalDistance) * 100));

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
      {/* Top Papercraft Game Header Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '12px 14px',
          paddingTop: 'calc(env(safe-area-inset-top) + 8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.4) 75%, transparent 100%)',
          pointerEvents: 'auto'
        }}
      >
        {/* Kit Selector Badge */}
        <button
          onClick={onOpenKitSelector}
          style={{
            background: 'linear-gradient(135deg, #ffffff, #fef9c3)',
            border: '2px solid #b45309',
            borderRadius: 18,
            padding: '6px 12px',
            fontSize: 13,
            fontWeight: 900,
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 3px 0 #b45309, 0 6px 12px rgba(0,0,0,0.25)',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: 18 }}>{activeTrinity.icon}</span>
          <span style={{ maxWidth: 105, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeTrinity.name.split(' ')[0]}
          </span>
        </button>

        {/* Level / Expedition Badge */}
        <button
          onClick={onOpenLevelSelect}
          style={{
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            border: '2px solid #38bdf8',
            borderRadius: 18,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 900,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 3px 0 #075985, 0 6px 12px rgba(0,0,0,0.25)'
          }}
        >
          <MapPin size={14} /> Mission {activeLevel.levelNumber}
        </button>

        {/* Workshop & Wind Stars Badge */}
        <button
          onClick={onOpenHangar}
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            border: '2px solid #fef08a',
            borderRadius: 18,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 900,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 3px 0 #b45309, 0 6px 12px rgba(0,0,0,0.3)'
          }}
        >
          <Wrench size={14} /> ⭐ {totalStars}
        </button>
      </div>

      {/* Flight Progress Track Ribbon */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top) + 54px)',
          left: 20,
          right: 20,
          height: 10,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          border: '2px solid #b45309',
          borderRadius: 6,
          overflow: 'hidden',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #f59e0b, #10b981)',
            transition: 'width 0.2s linear',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)'
          }}
        />
      </div>

      {/* IN-FLIGHT ARCADIC GAUGES */}
      {flightState === 'flying' && (
        <>
          {/* Left Altimeter Gauge */}
          <div
            style={{
              position: 'absolute',
              left: 14,
              top: 'calc(env(safe-area-inset-top) + 80px)',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '2px solid #f59e0b',
              borderRadius: 16,
              padding: '8px 10px',
              color: '#ffffff',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 900, color: '#fef08a', textTransform: 'uppercase' }}>ALT</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#38bdf8' }}>{Math.round(altitude)}<span style={{ fontSize: 11 }}>m</span></div>
          </div>

          {/* Right Airspeed Gauge */}
          <div
            style={{
              position: 'absolute',
              right: 14,
              top: 'calc(env(safe-area-inset-top) + 80px)',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '2px solid #f59e0b',
              borderRadius: 16,
              padding: '8px 10px',
              color: '#ffffff',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 900, color: '#fef08a', textTransform: 'uppercase' }}>SPEED</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#4ade80' }}>{Math.round(speed * 3.6)}<span style={{ fontSize: 10 }}>km/h</span></div>
          </div>

          {/* Center Distance & Goal Banner */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(env(safe-area-inset-top) + 72px)',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              textShadow: '0 3px 8px rgba(0,0,0,0.8)'
            }}
          >
            <div style={{ fontSize: 36, fontWeight: 900, color: '#fef08a', letterSpacing: 0.5 }}>
              {distance}m
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#ffffff', opacity: 0.9 }}>
              TARGET: {activeLevel.goalDistance}m
            </div>
          </div>
        </>
      )}

      {/* Aerobatic Stunt Banner */}
      {flightState === 'flying' && activeStunt && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top) + 130px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: activeStunt === 'roll'
              ? 'linear-gradient(135deg, #0284c7, #0369a1)'
              : 'linear-gradient(135deg, #ec4899, #be185d)',
            border: '2px solid #ffffff',
            color: '#ffffff',
            padding: '8px 20px',
            borderRadius: 24,
            fontSize: 14,
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            letterSpacing: 0.5
          }}
        >
          <Sparkles size={16} />
          {activeStunt === 'roll' ? '🌪️ 360° BARREL ROLL! (INVULNERABLE)' : '🚀 LOOP-THE-LOOP! (+ALTITUDE)'}
        </div>
      )}

      {/* Thermal Updraft Banner */}
      {flightState === 'flying' && thermalsCaught > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top) + 165px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            border: '2px solid #fef08a',
            color: '#ffffff',
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 6px 18px rgba(245, 158, 11, 0.4)'
          }}
        >
          <Wind size={15} /> THERMAL CHAIN x{thermalsCaught} (+{starsCollected} ⭐)
        </div>
      )}

      {/* Idle State Launch Callout & Quick Dock */}
      {flightState === 'idle' && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(env(safe-area-inset-bottom) + 20px)',
            left: 16,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            pointerEvents: 'auto'
          }}
        >
          {/* Quick Model Selector Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(15, 23, 42, 0.82)',
              border: '3px solid #b45309',
              backdropFilter: 'blur(12px)',
              padding: '6px 10px',
              borderRadius: 24,
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}
          >
            {Object.values(TRINITY_KITS).map(m => {
              const isSelected = selectedKitId === m.kitId;
              return (
                <button
                  key={m.kitId}
                  onClick={() => useGameStore.getState().selectKit(m.kitId)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 18,
                    border: isSelected ? '2px solid #fef08a' : 'none',
                    background: isSelected ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'transparent',
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    boxShadow: isSelected ? '0 3px 0 #0369a1, 0 4px 10px rgba(14,165,233,0.4)' : 'none'
                  }}
                >
                  <span style={{ fontSize: 16 }}>{m.icon}</span>
                  <span>{m.name.split(' ')[0]}</span>
                </button>
              );
            })}

            <button
              onClick={onOpenKitSelector}
              style={{
                padding: '8px 12px',
                borderRadius: 18,
                border: '1px solid rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                fontSize: 11,
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              54 Kits...
            </button>
          </div>

          {/* Chunky Drag to Start Callout */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: '3px solid #fef08a',
              color: '#ffffff',
              padding: '14px 28px',
              borderRadius: 24,
              fontSize: 15,
              fontWeight: 900,
              boxShadow: '0 5px 0 #b45309, 0 10px 25px rgba(245, 158, 11, 0.45)',
              textAlign: 'center',
              letterSpacing: 0.5,
              textTransform: 'uppercase'
            }}
          >
            🎯 Drag Backward to Aim & Release to Soar!
          </div>
        </div>
      )}

      {/* Slingshot Aiming Charging Indicator */}
      {flightState === 'aiming' && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(env(safe-area-inset-bottom) + 32px)',
            left: 20,
            right: 20,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: '3px solid #a7f3d0',
            color: '#ffffff',
            padding: '14px 20px',
            borderRadius: 24,
            fontSize: 15,
            fontWeight: 900,
            boxShadow: '0 5px 0 #047857, 0 10px 25px rgba(16, 185, 129, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}
        >
          🚀 Release to Launch Glider!
        </div>
      )}
    </div>
  );
};
