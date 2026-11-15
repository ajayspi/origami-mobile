import React from 'react';
import { Trophy, Star, Sparkles, Wind } from 'lucide-react';

interface FlightSplashScreenProps {
  onStartLaunch: () => void;
  bestDistance?: number;
  totalStars?: number;
}

export const FlightSplashScreen: React.FC<FlightSplashScreenProps> = ({
  onStartLaunch,
  bestDistance = 0,
  totalStars = 0
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '36px 20px',
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)',
        color: '#ffffff',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* Decorative Washi Sun Disc & Mist Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(220, 38, 38, 0.05) 70%, transparent 100%)',
          pointerEvents: 'none'
        }}
      />

      {/* Floating Animated CSS Washi Petals */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${(i * 13) % 90}%`,
              left: `${(i * 17) % 85}%`,
              width: `${12 + (i % 3) * 6}px`,
              height: `${16 + (i % 3) * 8}px`,
              background: i % 2 === 0 ? 'rgba(244, 114, 182, 0.45)' : 'rgba(254, 240, 138, 0.4)',
              borderRadius: '60% 0 60% 0',
              transform: `rotate(${i * 45}deg)`,
              filter: 'blur(0.5px)'
            }}
          />
        ))}
      </div>

      {/* Top Header & Brand Ribbon */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginTop: '16px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            background: 'rgba(220, 38, 38, 0.2)',
            border: '1px solid rgba(220, 38, 38, 0.5)',
            borderRadius: '999px',
            color: '#f87171',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '14px'
          }}
        >
          <Wind size={13} /> 30M CANYON PRECIPICE ARCADE
        </div>

        <h1
          style={{
            fontSize: '36px',
            fontWeight: 900,
            letterSpacing: '0.04em',
            lineHeight: 1.1,
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #ffffff 30%, #fef08a 70%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 8px rgba(245, 158, 11, 0.3))'
          }}
        >
          ORIGAMI FLIGHT
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: '#94a3b8',
            margin: 0,
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}
        >
          Gravity Dive • Thermal Soaring • Masterwork Trinity
        </p>
      </div>

      {/* Center 3D Preview Stage Badge / Record Pod */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '320px',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          backdropFilter: 'blur(12px)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#fbbf24', marginBottom: '4px' }}>
              <Trophy size={16} />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>BEST FLIGHT</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff' }}>
              {`${bestDistance}m`}
            </div>
          </div>

          <div style={{ width: '1px', height: '40px', background: 'rgba(255, 255, 255, 0.15)' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#f59e0b', marginBottom: '4px' }}>
              <Star size={16} fill="#f59e0b" />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>LUCKY STARS</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff' }}>
              {totalStars}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '16px',
            padding: '10px 12px',
            background: 'rgba(220, 38, 38, 0.12)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            color: '#fca5a5'
          }}
        >
          <Sparkles size={14} style={{ flexShrink: 0, color: '#f87171' }} />
          <span>Launch from a 30m cliff precipice over a vast papercraft canyon valley.</span>
        </div>
      </div>

      {/* Bottom Launch Button */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '320px' }}>
        <button
          onClick={onStartLaunch}
          style={{
            width: '100%',
            height: '56px',
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            border: '2px solid #f87171',
            borderRadius: '16px',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 800,
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
            transition: 'transform 0.12s ease, filter 0.12s ease'
          }}
        >
          <span>🚀</span>
          <span>LAUNCH INTO CANYON</span>
        </button>
      </div>
    </div>
  );
};
