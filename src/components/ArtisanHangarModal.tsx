import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { PaperStock, AircraftUpgrades, TRINITY_KITS } from '../types/game';
import { MobileStage } from './MobileStage';
import ALL_KITS_DATA from '../data/kits.json';
import type { OrigamiKit } from '../types/origami';
import { X, Sparkles, ArrowUpCircle, Shield, Wind, Gauge } from 'lucide-react';

interface ArtisanHangarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const kitRecord = ALL_KITS_DATA as unknown as Record<string, OrigamiKit>;

export const ArtisanHangarModal: React.FC<ArtisanHangarModalProps> = ({ isOpen, onClose }) => {
  const selectedKitId = useGameStore(s => s.selectedKitId);
  const selectKit = useGameStore(s => s.selectKit);
  const upgrades = useGameStore(s => s.upgrades);
  const totalStars = useGameStore(s => s.totalStars);
  const activePaperStock = useGameStore(s => s.activePaperStock);
  const spendStarsOnUpgrade = useGameStore(s => s.spendStarsOnUpgrade);
  const setPaperStock = useGameStore(s => s.setPaperStock);

  if (!isOpen) return null;

  const currentKit = kitRecord[selectedKitId] || kitRecord['aerospace-02'] || Object.values(kitRecord)[0];
  const lastStepIdx = Math.max(0, currentKit.steps.length - 1);
  const activeStats = TRINITY_KITS[selectedKitId] || TRINITY_KITS['aerospace-02'];

  const UPGRADE_CONFIGS: { key: keyof AircraftUpgrades; label: string; desc: string; icon: string; cost: number }[] = [
    { key: 'lift', label: 'Wing Camber Lift', desc: 'Flattens descent glide slope', icon: '🪶', cost: 20 * upgrades.lift },
    { key: 'drag', label: 'Aerodynamic Polish', desc: 'Reduces parasite air drag', icon: '✨', cost: 25 * upgrades.drag },
    { key: 'impulse', label: 'Slingshot Tension', desc: 'Boosts launch throw velocity', icon: '⚡', cost: 30 * upgrades.impulse },
    { key: 'thermalMagnet', label: 'Thermal Sensor', desc: 'Widens updraft magnetic pull', icon: '🌪️', cost: 25 * upgrades.thermalMagnet }
  ];

  const PAPER_STOCKS: { id: PaperStock; name: string; color: string; desc: string }[] = [
    { id: 'washi', name: 'Mulberry Washi', color: '#d97706', desc: 'Authentic fiber texture' },
    { id: 'gold_foil', name: 'Imperial Gold Foil', color: '#f59e0b', desc: 'Shimmering metallic sheen' },
    { id: 'sakura', name: 'Sakura Chiyogami', color: '#f43f5e', desc: 'Blossom patterned washi' },
    { id: 'indigo', name: 'Indigo Shibori', color: '#3b82f6', desc: 'Deep tie-dyed mineral wash' }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 16
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          maxHeight: '92vh',
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
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #b45309, #78350f)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #f59e0b',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🛠️</span>
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
                Artisan Tuning Workshop
              </h2>
              <div style={{ fontSize: 11, color: '#fef08a', fontWeight: 800 }}>
                ⭐ {totalStars} WIND STARS AVAILABLE
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              border: '2px solid rgba(255,255,255,0.4)',
              backgroundColor: 'rgba(255,255,255,0.2)',
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

        {/* Scrollable Workshop Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 3D Aircraft Showcase Stage */}
          <div
            style={{
              height: 170,
              background: 'radial-gradient(circle, #fef9c3 0%, #fed7aa 100%)',
              borderRadius: 20,
              border: '2px solid #f59e0b',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <MobileStage
              kit={currentKit}
              currentStepIdx={lastStepIdx}
              totalSteps={currentKit.steps.length}
              foldFactor={1.0}
              isPancakeFlipped={false}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: 12,
                right: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '4px 10px',
                borderRadius: 12,
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 900, color: '#1c1917' }}>
                {activeStats.icon} {activeStats.name}
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#b45309' }}>
                Drag 3D to Inspect
              </span>
            </div>
          </div>

          {/* Trinity Quick Switcher */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, color: '#78350f', textTransform: 'uppercase', marginBottom: 8 }}>
              Active Glider Archetype
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {Object.values(TRINITY_KITS).map(m => {
                const isSelected = selectedKitId === m.kitId;
                return (
                  <button
                    key={m.kitId}
                    onClick={() => selectKit(m.kitId)}
                    style={{
                      padding: '10px 6px',
                      borderRadius: 16,
                      border: isSelected ? '3px solid #f59e0b' : '2px solid #e5e7eb',
                      background: isSelected ? 'linear-gradient(135deg, #ffffff, #fef9c3)' : 'rgba(255, 255, 255, 0.8)',
                      boxShadow: isSelected ? '0 4px 12px rgba(245, 158, 11, 0.3), 0 3px 0 #d97706' : '0 2px 4px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{m.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 900, color: '#1c1917', textAlign: 'center' }}>
                      {m.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paper Stock Swatches */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, color: '#78350f', textTransform: 'uppercase', marginBottom: 8 }}>
              Craft Washi Stock
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {PAPER_STOCKS.map(stock => {
                const isSelected = activePaperStock === stock.id;
                return (
                  <button
                    key={stock.id}
                    onClick={() => setPaperStock(stock.id)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 14,
                      border: isSelected ? `2px solid ${stock.color}` : '2px solid #e5e7eb',
                      background: isSelected ? 'linear-gradient(135deg, #ffffff, #fef9c3)' : '#ffffff',
                      boxShadow: isSelected ? `0 4px 12px ${stock.color}40, 0 3px 0 ${stock.color}` : '0 2px 4px rgba(0,0,0,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: 11, background: stock.color, border: '2px solid #ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 900, color: '#1c1917' }}>{stock.name}</div>
                      <div style={{ fontSize: 9, color: '#78716c' }}>{stock.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aeronautical Upgrades */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, color: '#78350f', textTransform: 'uppercase', marginBottom: 8 }}>
              Flight Physics Upgrades
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {UPGRADE_CONFIGS.map(cfg => {
                const currentLevel = upgrades[cfg.key];
                const canAfford = totalStars >= cfg.cost;

                return (
                  <div
                    key={cfg.key}
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 18,
                      border: '2px solid #e5e7eb',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 3px 8px rgba(0,0,0,0.05), 0 2px 0 #d1d5db'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{cfg.icon}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 900, color: '#1c1917' }}>{cfg.label}</span>
                          <span style={{ fontSize: 10, background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: 8, fontWeight: 900 }}>
                            Lv.{currentLevel}
                          </span>
                        </div>
                        <div style={{ fontSize: 10, color: '#78716c', marginTop: 2 }}>{cfg.desc}</div>
                        {/* Level Pips */}
                        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                          {[1, 2, 3, 4, 5].map(pip => (
                            <div
                              key={pip}
                              style={{
                                width: 14,
                                height: 5,
                                borderRadius: 3,
                                background: pip <= currentLevel ? '#f59e0b' : '#e5e7eb'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={!canAfford}
                      onClick={() => spendStarsOnUpgrade(cfg.key, cfg.cost)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 14,
                        border: 'none',
                        background: canAfford ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#cbd5e1',
                        color: canAfford ? '#ffffff' : '#64748b',
                        fontSize: 12,
                        fontWeight: 900,
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        boxShadow: canAfford ? '0 3px 0 #b45309' : 'none'
                      }}
                    >
                      <Sparkles size={13} />
                      {cfg.cost} ⭐
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
