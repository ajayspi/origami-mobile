import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { TRINITY_KITS } from '../types/game';
import { synthesizeKitGeometry } from '../utils/mobileGeometry';
import { Wind, Zap, Compass, ChevronRight } from 'lucide-react';

interface CharacterSelectStageProps {
  selectedKitId: string;
  onSelectCreature: (kitId: string) => void;
  onDeployToCliff: () => void;
}

export const CharacterSelectStage: React.FC<CharacterSelectStageProps> = ({
  selectedKitId,
  onSelectCreature,
  onDeployToCliff
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const creatures = Object.values(TRINITY_KITS);
  const currentCreature = TRINITY_KITS[selectedKitId] || creatures[0];

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 280;
    const height = mount.clientHeight || 200;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 3.8);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    mount.appendChild(renderer.domElement);

    const ambLight = new THREE.AmbientLight(0xfff8ee, 1.2);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.6);
    dirLight.position.set(5, 10, 6);
    scene.add(dirLight);

    // Rotating Washi Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.2, 6);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
      flatShading: true
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(0, -0.6, 0);
    scene.add(pedestal);

    // Creature 3D Model
    const modelGroup = new THREE.Group();
    const geo = synthesizeKitGeometry(selectedKitId, 1.0);

    let paperColor = 0xef4444; // Crane vermilion
    if (selectedKitId === 'chinese-03') paperColor = 0xf59e0b; // Dragon gold
    else if (selectedKitId === 'raptor-01') paperColor = 0xd97706; // Falcon amber

    const mat = new THREE.MeshStandardMaterial({
      color: paperColor,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geo, mat);

    if (selectedKitId === 'japanese-01' || selectedKitId === 'chinese-03') {
      mesh.rotation.y = Math.PI;
    }

    modelGroup.add(mesh);
    modelGroup.position.set(0, 0.1, 0);
    scene.add(modelGroup);

    let animId: number;
    let angle = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      angle += 0.015;
      modelGroup.rotation.y = angle;
      pedestal.rotation.y = angle * 0.4;
      modelGroup.position.y = 0.1 + Math.sin(angle * 2.0) * 0.05;
      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      geo.dispose();
      mat.dispose();
      pedestalGeo.dispose();
      pedestalMat.dispose();
      renderer.dispose();
      while (mount.firstChild) {
        mount.removeChild(mount.firstChild);
      }
    };
  }, [selectedKitId]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        background: 'radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)',
        color: '#ffffff',
        overflowY: 'auto',
        userSelect: 'none'
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#f59e0b',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '4px'
          }}
        >
          3-CREATURE FLYING TRIAD
        </div>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 900,
            margin: 0,
            background: 'linear-gradient(135deg, #ffffff 40%, #fef08a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          SELECT YOUR AIRCRAFT
        </h2>
      </div>

      {/* 3D Pedestal Canvas */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      />

      {/* Creature Cards Row */}
      <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '360px', margin: '0 auto' }}>
        {creatures.map(kit => {
          const isSelected = kit.kitId === selectedKitId;
          return (
            <button
              key={kit.kitId}
              onClick={() => onSelectCreature(kit.kitId)}
              style={{
                flex: 1,
                padding: '10px 4px',
                background: isSelected ? 'rgba(220, 38, 38, 0.25)' : 'rgba(30, 41, 59, 0.5)',
                border: isSelected ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                color: '#ffffff',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{kit.icon}</div>
              <div style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1.2 }}>{kit.name}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Stats & Lore Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          margin: '12px auto 0 auto',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '14px 16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '15px', fontWeight: 800 }}>{currentCreature.name}</span>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#f59e0b',
              borderRadius: '999px',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}
          >
            {currentCreature.archetype}
          </span>
        </div>

        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 12px 0', lineHeight: 1.4 }}>
          {currentCreature.description}
        </p>

        {/* Aerodynamic Stat Meters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Glide */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#cbd5e1', marginBottom: '2px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Wind size={11} color="#38bdf8" /> 🪶 Floaty Glide
              </span>
              <span>{Math.round(currentCreature.liftMultiplier * 70)}%</span>
            </div>
            <div style={{ height: '5px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, currentCreature.liftMultiplier * 70)}%`,
                  background: 'linear-gradient(90deg, #38bdf8, #0284c7)',
                  borderRadius: '999px'
                }}
              />
            </div>
          </div>

          {/* Speed */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#cbd5e1', marginBottom: '2px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={11} color="#f59e0b" /> 🔥 Rocket Speed
              </span>
              <span>{Math.round(currentCreature.speedMultiplier * 75)}%</span>
            </div>
            <div style={{ height: '5px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, currentCreature.speedMultiplier * 75)}%`,
                  background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                  borderRadius: '999px'
                }}
              />
            </div>
          </div>

          {/* Agility */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#cbd5e1', marginBottom: '2px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Compass size={11} color="#ec4899" /> ⚡ Quick Turns (Agility)
              </span>
              <span>{Math.round(currentCreature.turnAgility * 72)}%</span>
            </div>
            <div style={{ height: '5px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, currentCreature.turnAgility * 72)}%`,
                  background: 'linear-gradient(90deg, #ec4899, #be185d)',
                  borderRadius: '999px'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Deploy Action Button */}
      <div style={{ width: '100%', maxWidth: '360px', margin: '14px auto 0 auto' }}>
        <button
          onClick={onDeployToCliff}
          style={{
            width: '100%',
            height: '52px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: '2px solid #34d399',
            borderRadius: '16px',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
          }}
        >
          <span>🏔️</span>
          <span>DEPLOY TO CLIFF</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
