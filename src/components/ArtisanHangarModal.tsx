import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { PaperStock, AircraftUpgrades, TRINITY_KITS } from '../types/game';
import { MobileStage } from './MobileStage';
import ALL_KITS_DATA from '../data/kits.json';
import type { OrigamiKit } from '../types/origami';
import { X, Sparkles, ArrowUpCircle } from 'lucide-react';

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

  const UPGRADE_CONFIGS: { key: keyof AircraftUpgrades; label: string; desc: string; cost: number }[] = [
    { key: 'lift', label: 'Wing Camber Lift', desc: 'Flattens descent glide slope', cost: 20 * upgrades.lift },
    { key: 'drag', label: 'Aerodynamic Polish', desc: 'Reduces parasite drag', cost: 25 * upgrades.drag },
    { key: 'impulse', label: 'Launcher Tension', desc: 'Boosts max slingshot velocity', cost: 30 * upgrades.impulse },
    { key: 'thermalMagnet', label: 'Thermal Sensor', desc: 'Expands thermal updraft pull', cost: 25 * upgrades.thermalMagnet }
  ];

  const PAPER_STOCKS: { id: PaperStock; name: string; color: string }[] = [
    { id: 'washi', name: 'Mulberry Washi', color: '#d97706' },
    { id: 'gold_foil', name: 'Imperial Gold Foil', color: '#f59e0b' },
    { id: 'sakura', name: 'Sakura Chiyogami', color: '#f43f5e' },
    { id: 'indigo', name: 'Indigo Shibori', color: '#3b82f6' }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
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
          maxWidth: 420,
          maxHeight: '90vh',
          backgroundColor: '#faf8f5',
          borderRadius: 28,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.4)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', margin: 0 }}>Artisan Tuning Workshop</h3>
            <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 800, marginTop: 2 }}>
              ⭐ {totalStars} Available Stars
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              border: 'none',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Flight Trinity Model Selector */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#334155', marginBottom: 8 }}>Choose Aircraft Archetype</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {Object.values(TRINITY_KITS).map(m => {
                const isSelected = selectedKitId === m.kitId;
                return (
                  <button
                    key={m.kitId}
                    onClick={() => selectKit(m.kitId)}
                    style={{
                      padding: '10px 6px',
                      borderRadius: 16,
                      border: isSelected ? '2px solid #0ea5e9' : '1px solid rgba(0,0,0,0.08)',
                      backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 4px 12px rgba(14, 165, 233, 0.2)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{m.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: isSelected ? '#0369a1' : '#1e293b', textAlign: 'center' }}>
                      {m.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3D Turntable Preview (Reusing MobileStage) */}
          <div
            style={{
              height: 180,
              width: '100%',
              backgroundColor: '#f1f5f9',
              borderRadius: 20,
              overflow: 'hidden',
              position: 'relative'
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
                fontSize: 12,
                fontWeight: 800,
                color: '#475569',
                backgroundColor: 'rgba(255,255,255,0.85)',
                padding: '2px 8px',
                borderRadius: 8
              }}
            >
              {activeStats.icon} {currentKit.title}
            </div>
          </div>

          {/* Archetype Flight Specs */}
          <div
            style={{
              padding: 12,
              borderRadius: 16,
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
              "{activeStats.description}"
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '6px 4px', borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>SPEED</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0284c7' }}>{Math.round(activeStats.speedMultiplier * 100)}%</div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '6px 4px', borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>GLIDE / LIFT</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#16a34a' }}>+{Math.round((activeStats.liftMultiplier - 1) * 100)}%</div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '6px 4px', borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>AGILITY</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#d97706' }}>{Math.round(activeStats.turnAgility * 100)}%</div>
              </div>
            </div>
          </div>

          {/* Paper Stock Swatches */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#334155', marginBottom: 8 }}>Paper Stock Texture</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {PAPER_STOCKS.map(st => {
                const isSelected = activePaperStock === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => setPaperStock(st.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 16,
                      border: isSelected ? '2px solid #0ea5e9' : '1px solid rgba(0,0,0,0.08)',
                      backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: st.color,
                        display: 'inline-block',
                        flexShrink: 0
                      }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{st.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aerodynamic Upgrades List */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#334155', marginBottom: 8 }}>Aerodynamic Tuning</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {UPGRADE_CONFIGS.map(cfg => {
                const currentLevel = upgrades[cfg.key];
                const isMax = currentLevel >= 5;
                const canAfford = totalStars >= cfg.cost && !isMax;

                return (
                  <div
                    key={cfg.key}
                    style={{
                      padding: 12,
                      borderRadius: 18,
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>
                        {cfg.label} <span style={{ fontSize: 11, color: '#0ea5e9', fontWeight: 700 }}>Lv. {currentLevel}/5</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{cfg.desc}</div>
                    </div>

                    <button
                      disabled={!canAfford}
                      onClick={() => spendStarsOnUpgrade(cfg.key, cfg.cost)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 20,
                        border: 'none',
                        backgroundColor: isMax ? '#f1f5f9' : canAfford ? '#0ea5e9' : '#e2e8f0',
                        color: isMax ? '#94a3b8' : canAfford ? '#ffffff' : '#94a3b8',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {isMax ? 'MAX' : `${cfg.cost} ⭐`}
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
