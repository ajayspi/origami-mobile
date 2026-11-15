import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { GAME_LEVELS } from '../data/gameLevels';
import { TRINITY_KITS } from '../types/game';
import { Wrench, MapPin, Sparkles, Wind, Flame, ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';

interface FlightHUDProps {
  onOpenKitSelector: () => void;
  onOpenHangar: () => void;
  onOpenLevelSelect: () => void;
}

// Lightweight Isolated Telemetry Component (Prevents Re-rendering Static Controls at 60 FPS)
const FlightTelemetry: React.FC<{ goalDistance: number }> = React.memo(({ goalDistance }) => {
  const distance = useGameStore(s => s.distance);
  const altitude = useGameStore(s => s.altitude);
  const speed = useGameStore(s => s.speed);
  const progressPercent = Math.min(100, Math.round((distance / goalDistance) * 100));

  return (
    <>
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
          TARGET: {goalDistance}m
        </div>
      </div>
    </>
  );
});

export const FlightHUD: React.FC<FlightHUDProps> = ({
  onOpenKitSelector,
  onOpenHangar,
  onOpenLevelSelect
}) => {
  const flightState = useGameStore(s => s.flightState);
  const activeLevelId = useGameStore(s => s.activeLevelId);
  const selectedKitId = useGameStore(s => s.selectedKitId);
  const thermalsCaught = useGameStore(s => s.thermalsCaught);
  const starsCollected = useGameStore(s => s.starsCollected);
  const totalStars = useGameStore(s => s.totalStars);
  const activeStunt = useGameStore(s => s.activeStunt);
  const boostCharges = useGameStore(s => s.boostCharges);
  const isBoosting = useGameStore(s => s.isBoosting);
  const steerInput = useGameStore(s => s.steerInput);
  const setSteerInput = useGameStore(s => s.setSteerInput);
  const activateBoost = useGameStore(s => s.activateBoost);
  const gyroEnabled = useGameStore(s => s.gyroEnabled);
  const setGyroEnabled = useGameStore(s => s.setGyroEnabled);

  const handleToggleGyro = async () => {
    if (!gyroEnabled) {
      if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
        try {
          const perm = await (DeviceOrientationEvent as any).requestPermission();
          if (perm === 'granted') {
            setGyroEnabled(true);
          }
        } catch {
          // iOS user cancelled or denied
        }
      } else {
        setGyroEnabled(true);
      }
    } else {
      setGyroEnabled(false);
    }
  };

  const activeLevel = GAME_LEVELS.find(l => l.id === activeLevelId) || GAME_LEVELS[0];
  const activeTrinity = TRINITY_KITS[selectedKitId] || { icon: '✈️', name: 'Falcon Dart' };

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
          title="Change Creature"
        >
          <span style={{ fontSize: 18 }}>{activeTrinity.icon}</span>
          <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeTrinity.name}
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

      {/* Flight Progress Track Ribbon & Telemetry Gauges */}
      {flightState === 'flying' && <FlightTelemetry goalDistance={activeLevel.goalDistance} />}

      {/* Thruster Booster Active Banner */}
      {flightState === 'flying' && isBoosting && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top) + 128px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #ef4444, #f97316)',
            border: '2px solid #fef08a',
            color: '#ffffff',
            padding: '8px 22px',
            borderRadius: 24,
            fontSize: 14,
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 0 25px rgba(249, 115, 22, 0.75)',
            letterSpacing: 0.5,
            animation: 'pulse 0.4s infinite alternate'
          }}
        >
          <Flame size={18} fill="#fef08a" />
          🚀 ROCKET THRUSTERS IGNITED! (+SPEED)
        </div>
      )}

      {/* Aerobatic Stunt Banner */}
      {flightState === 'flying' && activeStunt && !isBoosting && (
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

      {/* Gyroscope Active Indicator Banner */}
      {flightState === 'flying' && gyroEnabled && !isBoosting && !activeStunt && (
        <div
          style={{
            position: 'absolute',
            top: thermalsCaught > 0 ? 'calc(env(safe-area-inset-top) + 200px)' : 'calc(env(safe-area-inset-top) + 165px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #15803d, #166534)',
            border: '2px solid #86efac',
            color: '#ffffff',
            padding: '4px 14px',
            borderRadius: 16,
            fontSize: 11,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 12px rgba(22, 101, 52, 0.4)',
            whiteSpace: 'nowrap'
          }}
        >
          <Smartphone size={13} color="#86efac" /> TILT PHONE TO STEER
        </div>
      )}

      {/* Thermal Updraft Banner */}
      {flightState === 'flying' && thermalsCaught > 0 && !activeStunt && !isBoosting && (
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

      {/* IN-FLIGHT TACTILE CONTROLS (STEER LEFT / RIGHT & THRUSTER BOOSTERS) */}
      {flightState === 'flying' && (
        <>
          {/* Left/Right Steering Buttons (Bottom Left) */}
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(env(safe-area-inset-bottom) + 20px)',
              left: 14,
              display: 'flex',
              gap: 8,
              pointerEvents: 'auto'
            }}
          >
            <button
              onPointerDown={() => setSteerInput(-1)}
              onPointerUp={() => setSteerInput(0)}
              onPointerLeave={() => setSteerInput(0)}
              style={{
                width: 58,
                height: 58,
                borderRadius: 20,
                border: steerInput < 0 ? '3px solid #fef08a' : '3px solid #38bdf8',
                background: steerInput < 0
                  ? 'linear-gradient(135deg, #0284c7, #075985)'
                  : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: steerInput < 0 ? '0 1px 0 #075985' : '0 4px 0 #075985, 0 6px 16px rgba(14,165,233,0.4)',
                transform: steerInput < 0 ? 'translateY(3px)' : 'none',
                userSelect: 'none'
              }}
            >
              <ChevronLeft size={26} />
              <span style={{ fontSize: 9, fontWeight: 900 }}>LEFT</span>
            </button>

            <button
              onPointerDown={() => setSteerInput(1)}
              onPointerUp={() => setSteerInput(0)}
              onPointerLeave={() => setSteerInput(0)}
              style={{
                width: 58,
                height: 58,
                borderRadius: 20,
                border: steerInput > 0 ? '3px solid #fef08a' : '3px solid #38bdf8',
                background: steerInput > 0
                  ? 'linear-gradient(135deg, #0284c7, #075985)'
                  : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: steerInput > 0 ? '0 1px 0 #075985' : '0 4px 0 #075985, 0 6px 16px rgba(14,165,233,0.4)',
                transform: steerInput > 0 ? 'translateY(3px)' : 'none',
                userSelect: 'none'
              }}
            >
              <ChevronRight size={26} />
              <span style={{ fontSize: 9, fontWeight: 900 }}>RIGHT</span>
            </button>

            {/* Mobile Gyroscope Tilt Toggle Button */}
            <button
              onClick={handleToggleGyro}
              style={{
                width: 58,
                height: 58,
                borderRadius: 20,
                border: gyroEnabled ? '3px solid #4ade80' : '3px solid #64748b',
                background: gyroEnabled
                  ? 'linear-gradient(135deg, #15803d, #166534)'
                  : 'linear-gradient(135deg, #334155, #1e293b)',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: gyroEnabled
                  ? '0 4px 0 #14532d, 0 6px 16px rgba(74,222,128,0.4)'
                  : '0 4px 0 #0f172a, 0 4px 10px rgba(0,0,0,0.3)',
                transform: gyroEnabled ? 'translateY(1px)' : 'none',
                userSelect: 'none'
              }}
              title="Toggle mobile device tilt steering"
            >
              <Smartphone size={22} color={gyroEnabled ? '#4ade80' : '#94a3b8'} />
              <span style={{ fontSize: 9, fontWeight: 900, color: gyroEnabled ? '#4ade80' : '#94a3b8' }}>
                {gyroEnabled ? 'TILT ON' : 'TILT'}
              </span>
            </button>
          </div>

          {/* Thruster Booster Button (Bottom Right) */}
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(env(safe-area-inset-bottom) + 20px)',
              right: 14,
              pointerEvents: 'auto'
            }}
          >
            <button
              onClick={() => activateBoost()}
              disabled={boostCharges <= 0 || isBoosting}
              style={{
                minWidth: 100,
                height: 58,
                padding: '0 16px',
                borderRadius: 20,
                border: isBoosting ? '3px solid #fef08a' : boostCharges > 0 ? '3px solid #fbbf24' : '3px solid #94a3b8',
                background: isBoosting
                  ? 'linear-gradient(135deg, #dc2626, #ea580c)'
                  : boostCharges > 0
                  ? 'linear-gradient(135deg, #f97316, #ea580c)'
                  : 'linear-gradient(135deg, #64748b, #475569)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: boostCharges > 0 && !isBoosting ? 'pointer' : 'not-allowed',
                boxShadow: boostCharges > 0
                  ? '0 4px 0 #9a3412, 0 8px 20px rgba(249,115,22,0.5)'
                  : 'none',
                transform: isBoosting ? 'translateY(3px)' : 'none',
                opacity: boostCharges > 0 || isBoosting ? 1 : 0.65,
                userSelect: 'none'
              }}
            >
              <Flame size={24} fill="#fef08a" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 0.5 }}>BOOST</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#fef08a' }}>
                  {isBoosting ? 'FIRING!' : `${boostCharges} CHARGES`}
                </div>
              </div>
            </button>
          </div>

          {/* Bottom Center Control Hints */}
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(env(safe-area-inset-bottom) + 26px)',
              left: 140,
              right: 140,
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: 10,
              fontWeight: 800,
              textShadow: '0 2px 6px rgba(0,0,0,0.8)'
            }}
          >
            A/D or ◀ ▶ Steer • Space for Boost
          </div>
        </>
      )}

      {/* Idle / Cliff-Aim State Launch Callout & Quick Dock */}
      {(flightState === 'idle' || flightState === 'cliff-aim') && (
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
              🦅 Change...
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
            🏔️ 30m Cliff Edge: Drag Backward to Dive & Soar!
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
