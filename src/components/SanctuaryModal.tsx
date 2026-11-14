import React, { useEffect, useState } from 'react';
import { X, Sparkles, Wind } from 'lucide-react';

interface SanctuaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetFold: () => void;
}

export const SanctuaryModal: React.FC<SanctuaryModalProps> = ({
  isOpen,
  onClose,
  onResetFold
}) => {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    if (!isOpen) return;

    let timer: any;
    const cycle = () => {
      setPhase('in');
      timer = setTimeout(() => {
        setPhase('hold');
        timer = setTimeout(() => {
          setPhase('out');
          timer = setTimeout(cycle, 4000);
        }, 2000);
      }, 4000);
    };

    cycle();
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(28, 25, 23, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 340,
          backgroundColor: '#faf8f5',
          borderRadius: 24,
          padding: 24,
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            color: '#78716c',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#059669', marginBottom: 12 }}>
          <Wind size={20} />
          <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Mindful Origami Pause
          </span>
        </div>

        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1c1917', marginBottom: 8 }}>
          Take a Gentle Breath
        </h3>
        <p style={{ fontSize: 13, color: '#57534e', lineHeight: 1.5, marginBottom: 20 }}>
          Origami is peaceful. If a crease felt tricky, take a moment. Smooth your paper flat with your palm.
        </p>

        {/* Breathing Circle Animation */}
        <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <div
            style={{
              width: phase === 'in' ? 100 : phase === 'hold' ? 100 : 50,
              height: phase === 'in' ? 100 : phase === 'hold' ? 100 : 50,
              borderRadius: '50%',
              backgroundColor: '#a7f3d0',
              border: '4px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 4s ease-in-out',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)'
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 800, color: '#065f46' }}>
              {phase === 'in' ? 'Breathe In' : phase === 'hold' ? 'Hold Peace' : 'Breathe Out'}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            onResetFold();
            onClose();
          }}
          style={{
            width: '100%',
            height: 48,
            borderRadius: 14,
            border: 'none',
            backgroundColor: '#10b981',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          <Sparkles size={16} />
          <span>Smooth Paper & Try Step Again</span>
        </button>
      </div>
    </div>
  );
};
