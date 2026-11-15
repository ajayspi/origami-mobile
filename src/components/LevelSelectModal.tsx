import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { GAME_LEVELS } from '../data/gameLevels';
import { X, Lock, Trophy, Play, Compass, Wind } from 'lucide-react';

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
          maxWidth: 420,
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
        {/* Ornate Header */}
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
            <span style={{ fontSize: 24 }}>🗺️</span>
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
                Flight Expeditions
              </h2>
              <span style={{ fontSize: 11, color: '#fef08a', fontWeight: 700 }}>
                SELECT CANYON MISSION TO CONQUER
              </span>
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

        {/* Mission Cards List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 18px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
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
                  borderRadius: 20,
                  border: isCurrent
                    ? '3px solid #f59e0b'
                    : isUnlocked
                    ? '2px solid #e5e7eb'
                    : '2px dashed #cbd5e1',
                  background: isCurrent
                    ? 'linear-gradient(135deg, #ffffff, #fef9c3)'
                    : isUnlocked
                    ? 'rgba(255, 255, 255, 0.9)'
                    : 'rgba(241, 245, 249, 0.6)',
                  padding: 14,
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  opacity: isUnlocked ? 1 : 0.65,
                  boxShadow: isCurrent
                    ? '0 8px 20px rgba(245, 158, 11, 0.3), 0 4px 0 #d97706'
                    : isUnlocked
                    ? '0 4px 10px rgba(0,0,0,0.06), 0 3px 0 #d1d5db'
                    : 'none',
                  transform: isCurrent ? 'scale(1.02)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      background: isUnlocked
                        ? 'linear-gradient(135deg, #fed7aa, #fef08a)'
                        : '#cbd5e1',
                      border: '2px solid #f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      color: isUnlocked ? '#b45309' : '#64748b',
                      fontWeight: 900,
                      flexShrink: 0
                    }}
                  >
                    {isUnlocked ? lvl.levelNumber : <Lock size={20} />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 900,
                          color: '#1c1917',
                          margin: 0
                        }}
                      >
                        {lvl.name}
                      </h3>
                      {cleared && (
                        <span
                          style={{
                            background: '#dcfce7',
                            color: '#16a34a',
                            fontSize: 11,
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: 10,
                            border: '1px solid #86efac'
                          }}
                        >
                          ✓ CLEARED
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: '#0369a1', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Compass size={13} /> Goal: {lvl.goalDistance}m
                      </span>
                      <span style={{ fontSize: 11, color: '#d97706', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Trophy size={13} /> Best: {best}m
                      </span>
                    </div>

                    <div style={{ fontSize: 11, color: '#78716c', marginTop: 4, fontStyle: 'italic' }}>
                      {lvl.theme} • {lvl.timeOfDay.toUpperCase()}
                    </div>
                  </div>

                  {isUnlocked && (
                    <button
                      style={{
                        padding: '8px 14px',
                        borderRadius: 14,
                        border: 'none',
                        background: isCurrent ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#0284c7',
                        color: '#ffffff',
                        fontSize: 12,
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        boxShadow: isCurrent ? '0 3px 0 #b45309' : '0 3px 0 #0369a1'
                      }}
                    >
                      <Play size={13} fill="#ffffff" />
                      {isCurrent ? 'FLY' : 'GO'}
                    </button>
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
