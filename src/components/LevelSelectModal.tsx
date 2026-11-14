import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { GAME_LEVELS } from '../data/gameLevels';
import { X, Lock, CheckCircle, Trophy, Play } from 'lucide-react';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({ isOpen, onClose }) => {
  const activeLevelId = useGameStore(s => s.activeLevelId);
  const unlockedLevels = useGameStore(s => s.unlockedLevels);
  const highScores = useGameStore(s => s.highScores);
  const selectLevel = useGameStore(s => s.selectLevel);
  const resetRun = useGameStore(s => s.resetRun);

  if (!isOpen) return null;

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
        padding: 16
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          maxHeight: '85vh',
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
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', margin: 0 }}>Campaign Flight Missions</h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Select a flight canyon to conquer</p>
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

        {/* Level List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {GAME_LEVELS.map(lvl => {
            const isUnlocked = unlockedLevels.includes(lvl.id);
            const isCurrent = activeLevelId === lvl.id;
            const best = highScores[lvl.id] || 0;
            const cleared = best >= lvl.goalDistance;

            return (
              <div
                key={lvl.id}
                onClick={() => {
                  if (isUnlocked) {
                    selectLevel(lvl.id);
                    resetRun();
                    onClose();
                  }
                }}
                style={{
                  padding: 14,
                  borderRadius: 20,
                  backgroundColor: isCurrent ? '#f0f9ff' : '#ffffff',
                  border: isCurrent ? '2px solid #0ea5e9' : '1px solid rgba(0,0,0,0.06)',
                  opacity: isUnlocked ? 1.0 : 0.6,
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ flex: 1, paddingRight: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        color: isUnlocked ? '#0284c7' : '#94a3b8',
                        backgroundColor: isUnlocked ? '#e0f2fe' : '#f1f5f9',
                        padding: '2px 8px',
                        borderRadius: 10
                      }}
                    >
                      LEVEL {lvl.levelNumber}
                    </span>
                    {lvl.biome && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: lvl.biome === 'sakura_valley' ? '#be185d' : lvl.biome === 'alpine_glacier' ? '#0369a1' : lvl.biome === 'bamboo_forest' ? '#15803d' : '#b45309',
                          backgroundColor: lvl.biome === 'sakura_valley' ? '#fce7f3' : lvl.biome === 'alpine_glacier' ? '#e0f2fe' : lvl.biome === 'bamboo_forest' ? '#dcfce7' : '#fef3c7',
                          padding: '2px 6px',
                          borderRadius: 8
                        }}
                      >
                        {lvl.biome === 'sakura_valley' ? '🌸 Sakura' : lvl.biome === 'alpine_glacier' ? '❄️ Glacier' : lvl.biome === 'bamboo_forest' ? '🎋 Bamboo' : '🏜️ Canyon'}
                      </span>
                    )}
                    {cleared && <CheckCircle size={14} color="#10b981" />}
                  </div>

                  <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>{lvl.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Goal: {lvl.goalDistance}m</div>
                  {best > 0 && (
                    <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, marginTop: 2 }}>
                      Best: {best}m
                    </div>
                  )}
                </div>

                <div>
                  {!isUnlocked ? (
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: '#f1f5f9',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Lock size={18} />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: isCurrent ? '#0ea5e9' : '#e0f2fe',
                        color: isCurrent ? '#ffffff' : '#0369a1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Play size={18} fill={isCurrent ? '#ffffff' : '#0369a1'} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
