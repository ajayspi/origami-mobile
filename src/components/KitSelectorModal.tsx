import React from 'react';
import { X } from 'lucide-react';
import type { OrigamiKit } from '../types/origami';

interface KitSelectorModalProps {
  isOpen: boolean;
  kits: OrigamiKit[];
  activeKitId: string;
  onSelectKit: (kit: OrigamiKit) => void;
  onClose: () => void;
}

export const KitSelectorModal: React.FC<KitSelectorModalProps> = ({
  isOpen,
  kits,
  activeKitId,
  onSelectKit,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(28, 25, 23, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end'
      }}
    >
      <div
        style={{
          width: '100%',
          maxHeight: '85vh',
          backgroundColor: '#faf8f5',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1c1917' }}>Choose a Kit to Fold</h3>
            <span style={{ fontSize: 12, color: '#78716c' }}>{kits.length} models with step-by-step 3D folding</span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#f5f5f4',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Kit List */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 24 }}>
          {kits.map((k) => {
            const isSelected = k.id === activeKitId;
            return (
              <button
                key={k.id}
                onClick={() => {
                  onSelectKit(k);
                  onClose();
                }}
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: 18,
                  border: isSelected ? '2px solid #0ea5e9' : '1px solid rgba(0, 0, 0, 0.08)',
                  backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1c1917', marginBottom: 2 }}>
                    {k.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#78716c', fontFamily: 'monospace' }}>
                    {k.steps?.length || 14} steps • {k.difficulty} • {k.time}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 10,
                    backgroundColor: isSelected ? '#0ea5e9' : '#f5f5f4',
                    color: isSelected ? '#ffffff' : '#78716c'
                  }}
                >
                  {k.category.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
