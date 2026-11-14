import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { synthesizeKitStepGeometry } from '../utils/mobileGeometry';
import type { OrigamiKit } from '../types/origami';

interface MobileStageProps {
  kit: OrigamiKit;
  currentStepIdx: number;
  totalSteps: number;
  foldFactor: number;
  isPancakeFlipped: boolean;
  onTogglePancakeFlip?: () => void;
}

export const MobileStage: React.FC<MobileStageProps> = ({
  kit,
  currentStepIdx,
  totalSteps,
  foldFactor,
  isPancakeFlipped
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    paperMesh?: THREE.Group;
    plinthGroup?: THREE.Group;
    contactShadowMesh?: THREE.Mesh;
    isMouseDown: boolean;
    prevMouseX: number;
    prevMouseY: number;
    rotX: number;
    rotY: number;
    targetRotX: number;
    targetRotY: number;
    flipAngle: number;
    targetFlipAngle: number;
    cameraDist: number;
    animFrameId?: number;
  } | null>(null);

  // Sync pancake flip angle
  useEffect(() => {
    if (threeRef.current) {
      threeRef.current.targetFlipAngle = isPancakeFlipped ? Math.PI : 0;
    }
  }, [isPancakeFlipped]);

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth || 360;
    const h = container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf8f5);

    const camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 100);
    camera.position.set(0, 1.2, 4.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfffaf0, 0.55);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbf0, 1.35);
    keyLight.position.set(4, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 0.45);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    // Exhibition Plinth (Pedestal)
    const plinthGroup = new THREE.Group();
    plinthGroup.position.set(0, -0.92, 0);

    const baseCylGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.08, 48);
    const baseCylMat = new THREE.MeshStandardMaterial({
      color: 0xe7e4dc,
      roughness: 0.5,
      metalness: 0.4
    });
    const plinthMesh = new THREE.Mesh(baseCylGeo, baseCylMat);
    plinthMesh.receiveShadow = true;
    plinthGroup.add(plinthMesh);

    const haloGeo = new THREE.RingGeometry(1.62, 1.68, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = -Math.PI / 2;
    haloMesh.position.y = 0.045;
    plinthGroup.add(haloMesh);
    scene.add(plinthGroup);

    // Contact Shadow Receiver
    const contactCanvas = document.createElement('canvas');
    contactCanvas.width = 128;
    contactCanvas.height = 128;
    const ctx = contactCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
      grad.addColorStop(0, 'rgba(10, 8, 20, 0.35)');
      grad.addColorStop(0.5, 'rgba(15, 12, 28, 0.12)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const contactTexture = new THREE.CanvasTexture(contactCanvas);
    const contactGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const contactMat = new THREE.MeshBasicMaterial({
      map: contactTexture,
      transparent: true,
      depthWrite: false
    });
    const contactShadowMesh = new THREE.Mesh(contactGeo, contactMat);
    contactShadowMesh.rotation.x = -Math.PI / 2;
    contactShadowMesh.position.y = -0.01;
    scene.add(contactShadowMesh);

    const state = {
      scene,
      camera,
      renderer,
      paperMesh: undefined as THREE.Group | undefined,
      plinthGroup,
      contactShadowMesh,
      isMouseDown: false,
      prevMouseX: 0,
      prevMouseY: 0,
      rotX: 0.25,
      rotY: -0.4,
      targetRotX: 0.25,
      targetRotY: -0.4,
      flipAngle: 0,
      targetFlipAngle: 0,
      cameraDist: 3.8,
      animFrameId: undefined as number | undefined
    };
    threeRef.current = state;

    // Mobile Touch & Orbit Controls
    const activeTouches = new Map<number, { x: number; y: number }>();
    let initialPinchDist = 0;
    let initialDist = state.cameraDist;

    const onPointerDown = (e: PointerEvent) => {
      activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (activeTouches.size === 1) {
        state.isMouseDown = true;
        state.prevMouseX = e.clientX;
        state.prevMouseY = e.clientY;
        try { container.setPointerCapture(e.pointerId); } catch {}
      } else if (activeTouches.size === 2) {
        const pts = Array.from(activeTouches.values());
        initialPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        initialDist = state.cameraDist;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!activeTouches.has(e.pointerId)) return;
      activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activeTouches.size === 1 && state.isMouseDown) {
        const dx = e.clientX - state.prevMouseX;
        const dy = e.clientY - state.prevMouseY;
        state.targetRotY += dx * 0.008;
        state.targetRotX = Math.max(-0.6, Math.min(1.4, state.targetRotX + dy * 0.008));
        state.prevMouseX = e.clientX;
        state.prevMouseY = e.clientY;
      } else if (activeTouches.size === 2) {
        const pts = Array.from(activeTouches.values());
        const currentPinch = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (initialPinchDist > 0) {
          const factor = initialPinchDist / currentPinch;
          state.cameraDist = Math.max(2.4, Math.min(6.5, initialDist * factor));
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      activeTouches.delete(e.pointerId);
      if (activeTouches.size === 0) {
        state.isMouseDown = false;
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);

    // ResizeObserver
    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (nw === 0 || nh === 0) return;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh, false);
    };

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(onResize);
    });
    resizeObserver.observe(container);

    // Animation Render Loop
    const animate = () => {
      state.animFrameId = requestAnimationFrame(animate);

      state.flipAngle += (state.targetFlipAngle - state.flipAngle) * 0.08;
      state.rotX += (state.targetRotX - state.rotX) * 0.1;
      state.rotY += (state.targetRotY - state.rotY) * 0.1;

      if (state.paperMesh) {
        state.paperMesh.rotation.x = state.rotX + state.flipAngle;
        state.paperMesh.rotation.y = state.rotY;

        const flipHop = Math.sin(Math.min(Math.PI, Math.max(0, state.flipAngle))) * 0.22;
        const bob = flipHop + Math.sin(Date.now() * 0.002) * 0.025;
        state.paperMesh.position.y = 0.22 + bob;
      }

      camera.position.x = Math.sin(state.rotY * 0.2) * 0.4;
      camera.position.z = state.cameraDist;
      camera.lookAt(0, 0.1, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (state.animFrameId) cancelAnimationFrame(state.animFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  // Update 3D Geometry when kit, step, or foldFactor change
  useEffect(() => {
    const state = threeRef.current;
    if (!state || !kit) return;

    if (state.paperMesh) {
      state.scene.remove(state.paperMesh);
      state.paperMesh.traverse((child: any) => {
        if (child.geometry) child.geometry.dispose();
      });
    }

    const effectiveFold = Math.max(0.01, Math.min(1.0, foldFactor));
    const paperSpec = kit.paper?.[0];
    const frontHex = paperSpec?.frontColorHex || kit.accent || '#0ea5e9';
    const frontColor = parseInt(frontHex.replace('#', '0x'));
    const backColor = 0xfbf7ee; // Warm mulberry unbleached washi fiber

    const geo = synthesizeKitStepGeometry(
      kit.id,
      currentStepIdx,
      totalSteps,
      effectiveFold
    );

    const mat = new THREE.MeshStandardMaterial({
      color: frontColor,
      roughness: 0.88,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const group = new THREE.Group();
    group.add(mesh);

    // Subtle crease pattern line overlay
    const wireGeo = new THREE.WireframeGeometry(geo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.22
    });
    const wireLine = new THREE.LineSegments(wireGeo, wireMat);
    group.add(wireLine);

    state.paperMesh = group;
    state.scene.add(state.paperMesh);
  }, [kit, currentStepIdx, foldFactor, totalSteps]);

  const currentStep = kit.steps[currentStepIdx] || kit.steps[0];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Three.js Canvas Container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%', touchAction: 'none' }} />

      {/* Step Fold Type Badge (Bottom-Left) */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          zIndex: 10,
          pointerEvents: 'none',
          padding: '4px 10px',
          borderRadius: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          fontFamily: 'monospace',
          fontWeight: 700,
          color: '#44403c'
        }}
      >
        <span style={{ color: '#0ea5e9' }}>⚡</span>
        <span>{currentStep?.foldType || 'Valley Fold'}</span>
      </div>

      {/* Gesture Hint Pill (Bottom-Right) */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          zIndex: 10,
          pointerEvents: 'none',
          padding: '4px 10px',
          borderRadius: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: 'rgba(255, 255, 255, 0.92)',
          fontSize: 10,
          fontFamily: 'monospace',
          display: 'flex',
          alignItems: 'center',
          gap: 5
        }}
      >
        <span>🖐️</span>
        <span>Drag to orbit</span>
      </div>

      {/* Pancake Flipped Toast */}
      {isPancakeFlipped && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 15,
            padding: '6px 14px',
            borderRadius: 20,
            backgroundColor: 'rgba(245, 158, 11, 0.9)',
            color: '#1c1917',
            fontWeight: 800,
            fontSize: 11,
            fontFamily: 'monospace',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span>🥞</span>
          <span>Paper Flipped 180° (White side up)</span>
        </div>
      )}
    </div>
  );
};
