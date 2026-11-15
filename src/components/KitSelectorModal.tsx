import React, { useState } from 'react';
import { X, Sparkles, Compass } from 'lucide-react';
import type { OrigamiKit } from '../types/origami';
import { TRINITY_KITS } from '../types/game';

interface KitSelectorModalProps {
  isOpen: boolean;
  kits: OrigamiKit[];
  activeKitId: string;
  onSelectKit: (kit: OrigamiKit) => void;
  onClose: () => void;
}

// Curated flight fleet categories
const FLIGHT_FLEET_IDS = [
  'aerospace-02', // Falcon Jet Dart
  'japanese-01',  // Sacred Peace Crane
  'chinese-03',   // Celestial Dragon
  'aerospace-01', // Classic Supersonic Dart
  'aerospace-03', // Stealth Glider
  'traditional-01', // Pure Crane
  'japanese-04',  // Kabuto Fighter
  'animals-01'    // Flapping Bird
];

export const KitSelectorModal: React.FC<KitSelectorModalProps> = ({
  isOpen,
  kits,
  activeKitId,
  onSelectKit,
  onClose
}) => {
  const [filter, setFilter] = useState<'fleet' | 'all'>('fleet');

  if (!isOpen) return null;

  const displayedKits = filter === 'fleet'
    ? kits.filter(k => FLIGHT_FLEET_IDS.includes(k.id) || TRINITY_KITS[k.id])
    : kits;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          maxHeight: '90vh',
          background: 'linear-gradient(165deg, #fffbeb 0%, #fef3c7 60%, #fed7aa 100%)',
          borderRadius: 28,
          border: '4px solid #b45309',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.9)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Ornate Paper Ribbon Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #b45309, #78350f)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            borderBottom: '2px solid #f59e0b'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🛩️</span>
            <div>
              <h2
                style={{
                  fontSize: 19,
                  fontWeight: 900,
                  color: '#ffffff',
                  margin: 0,
                  textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase'
                }}
              >
                Flight Academy Fleet
              </h2>
              <span style={{ fontSize: 11, color: '#fef08a', fontWeight: 700 }}>
                SELECT YOUR PAPER AIRCRAFT ARCHETYPE
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.4)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 900
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Filters */}
        <div
          style={{
            display: 'flex',
            padding: '12px 16px 6px',
            gap: 10,
            justifyContent: 'center'
          }}
        >
          <button
            onClick={() => setFilter('fleet')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 16,
              border: filter === 'fleet' ? '2px solid #b45309' : '1px solid rgba(180,83,9,0.2)',
              background: filter === 'fleet' ? '#b45309' : 'rgba(255,255,255,0.7)',
              color: filter === 'fleet' ? '#ffffff' : '#78350f',
              fontWeight: 900,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: filter === 'fleet' ? '0 3px 0 #78350f' : 'none'
            }}
          >
            <Sparkles size={14} /> Master Gliders (Trinity)
          </button>
          <button
            onClick={() => setFilter('all')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 16,
              border: filter === 'all' ? '2px solid #b45309' : '1px solid rgba(180,83,9,0.2)',
              background: filter === 'all' ? '#b45309' : 'rgba(255,255,255,0.7)',
              color: filter === 'all' ? '#ffffff' : '#78350f',
              fontWeight: 900,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: filter === 'all' ? '0 3px 0 #78350f' : 'none'
            }}
          >
            <Compass size={14} /> All 54 Models
          </button>
        </div>

        {/* Aircraft Card Grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          {displayedKits.map(k => {
            const isSelected = k.id === activeKitId;
            const trinityStat = TRINITY_KITS[k.id];

            return (
              <div
                key={k.id}
                onClick={() => {
                  onSelectKit(k);
                  onClose();
                }}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, #ffffff, #fef9c3)'
                    : 'rgba(255, 255, 255, 0.85)',
                  borderRadius: 20,
                  border: isSelected ? '3px solid #f59e0b' : '2px solid #e5e7eb',
                  padding: 14,
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: isSelected
                    ? '0 8px 20px rgba(245, 158, 11, 0.3), 0 4px 0 #d97706'
                    : '0 4px 10px rgba(0,0,0,0.06), 0 3px 0 #d1d5db',
                  transform: isSelected ? 'scale(1.02)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Active Tag */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 12,
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#ffffff',
                      fontSize: 10,
                      fontWeight: 900,
                      padding: '3px 8px',
                      borderRadius: 12,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                      letterSpacing: 0.5
                    }}
                  >
                    READY TO FLY
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: isSelected
                        ? 'linear-gradient(135deg, #fed7aa, #fef08a)'
                        : '#f3f4f6',
                      border: '2px solid #f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      flexShrink: 0
                    }}
                  >
                    {trinityStat?.icon || '✈️'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 900,
                          color: '#1c1917',
                          margin: 0
                        }}
                      >
                        {trinityStat?.name || k.title}
                      </h3>
                    </div>

                    <p
                      style={{
                        fontSize: 11,
                        color: '#78716c',
                        margin: '3px 0 6px',
                        lineHeight: 1.3
                      }}
                    >
                      {trinityStat?.description || k.description || 'Folded paper flight model'}
                    </p>

                    {/* Stat Bars */}
                    {trinityStat ? (
                      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 800, color: '#0369a1' }}>
                            <span>SPEED</span>
                            <span>{Math.round(trinityStat.speedMultiplier * 100)}%</span>
                          </div>
                          <div style={{ height: 5, background: '#e0f2fe', borderRadius: 3, overflow: 'hidden', marginTop: 2 }}>
                            <div style={{ height: '100%', width: `${trinityStat.speedMultiplier * 75}%`, background: '#0284c7' }} />
                          </div>
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 800, color: '#15803d' }}>
                            <span>GLIDE</span>
                            <span>{Math.round(trinityStat.liftMultiplier * 100)}%</span>
                          </div>
                          <div style={{ height: 5, background: '#dcfce7', borderRadius: 3, overflow: 'hidden', marginTop: 2 }}>
                            <div style={{ height: '100%', width: `${trinityStat.liftMultiplier * 75}%`, background: '#16a34a' }} />
                          </div>
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 800, color: '#b45309' }}>
                            <span>AGILITY</span>
                            <span>{Math.round(trinityStat.turnAgility * 100)}%</span>
                          </div>
                          <div style={{ height: 5, background: '#fef3c7', borderRadius: 3, overflow: 'hidden', marginTop: 2 }}>
                            <div style={{ height: '100%', width: `${trinityStat.turnAgility * 70}%`, background: '#d97706' }} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#0284c7' }}>
                        Speciality Kit • {k.difficulty || 'Intermediate'} Class
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
