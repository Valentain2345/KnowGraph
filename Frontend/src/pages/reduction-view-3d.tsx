import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useLocation } from "react-router-dom";

/* -------------------------------------------------------------------------- */
/* Types */
/* -------------------------------------------------------------------------- */
interface EmbeddingPoint {
  id: string;
  label: string;   // <-- URI
  x: number;
  y: number;
  z: number;
}

interface VisualsParamsOut {
  jobId: string;
  method: 'umap' | 'tsne' | 'pca';
}

/* -------------------------------------------------------------------------- */
/* Component */
/* -------------------------------------------------------------------------- */
const Visualization3d: React.FC = () => {
  const location = useLocation();
  const { jobId, method } = location.state as VisualsParamsOut;
  const mountRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const visualizerUrl = import.meta.env.VITE_VISUALIZER_URL

  useEffect(() => {
    if (!mountRef.current) return;

    let isMounted = true;
    let renderer: THREE.WebGLRenderer | null = null;
    let frameId: number | null = null;
    const pollTimeouts: number[] = [];
    const container = mountRef.current;

    /* -------------------------- Tooltip helpers -------------------------- */
    const hideTooltip = () => {
      if (tooltipRef.current) tooltipRef.current.style.display = 'none';
    };
    const showTooltip = (label: string, clientX: number, clientY: number) => {
      if (!tooltipRef.current) return;
      tooltipRef.current.textContent = label;
      tooltipRef.current.style.left = `${clientX + 12}px`;
      tooltipRef.current.style.top = `${clientY + 12}px`;
      tooltipRef.current.style.display = 'block';
    };

    /* -------------------------- Poll status until ready ------------------ */

  const waitForJob = async (): Promise<boolean> => {
    const statusUrl = `${visualizerUrl}/status/${jobId}?method=${method}&dim=3d`;
    let attempts = 0;
    const maxAttempts = 30;
    const baseDelay = 1000;

    while (attempts < maxAttempts) {
      if (!isMounted) return false;
      try {
        const resp = await fetch(statusUrl);
        if (resp.status === 404) {
          // continue polling
        } else if (resp.ok) {
          const data = await resp.json();
          if (data.status === 'ready') {
            return true;
          }
        }
      } catch (err) {
        console.warn('[Viz3D] Status poll error:', err);
      }

      attempts++;
      const delay = Math.min(baseDelay * Math.pow(1.5, attempts), 10000);
      await new Promise(resolve => {
        const id = window.setTimeout(resolve, delay); // ✅ use window.setTimeout
        pollTimeouts.push(id);
      });
    }
    return false;
  };

    /* -------------------------- Fetch data and build scene -------------- */
    const initScene = async () => {
      console.debug('[Viz3D] Fetch →', endpoint);
      try {
        const resp = await fetch(endpoint);
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(`HTTP ${resp.status}: ${txt}`);
        }
        const payload = await resp.json();
        const data: EmbeddingPoint[] = payload.data;
        if (!isMounted) return;

        /* ----- Remove previous canvas ----- */
        if (renderer?.domElement?.parentNode === container) {
          container.removeChild(renderer.domElement);
        }

        /* ----- Three.js setup ----- */
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8fafc);

        const camera = new THREE.PerspectiveCamera(
          75,
          container.clientWidth / container.clientHeight,
          0.1,
          1000
        );
        camera.position.set(2, 2, 5);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0xf8fafc, 1);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const extent = (arr: EmbeddingPoint[], k: 'x' | 'y' | 'z'): [number, number] => {
          let min = Infinity, max = -Infinity;
          arr.forEach(p => {
            const v = p[k];
            if (v < min) min = v;
            if (v > max) max = v;
          });
          return [min, max];
        };
        const norm = (v: number, [min, max]: [number, number]) =>
          max === min ? 0 : ((v - min) / (max - min)) * 2 - 1;

        const [xMin, xMax] = extent(data, 'x');
        const [yMin, yMax] = extent(data, 'y');
        const [zMin, zMax] = extent(data, 'z');

        const to01 = (v: number) => (v + 1) * 0.5;

        const getGradientColor = (nx: number, ny: number, nz: number) => {
          return new THREE.Color(to01(nx), to01(ny), to01(nz));
        };

        data.forEach(pt => {
          const nx = norm(pt.x, [xMin, xMax]);
          const ny = norm(pt.y, [yMin, yMax]);
          const nz = norm(pt.z, [zMin, zMax]);

          const color = getGradientColor(nx, ny, nz);

          const material = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.4,
            metalness: 0.1,
            emissive: color,
            emissiveIntensity: 0.1,
          });

          const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.02, 32, 32), material);
          sphere.position.set(nx, ny, nz);
          sphere.userData = { label: pt.label };
          scene.add(sphere);
        });

        /* ----- Lights ----- */
        scene.add(new THREE.AmbientLight(0xffffff, 0.7));

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, -5, -5);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
        rimLight.position.set(0, 0, 5);
        scene.add(rimLight);

        /* ----- Mouse hover handling ----- */
        const onMouseMove = (e: MouseEvent) => {
          if (!renderer) return;
          const rect = renderer.domElement.getBoundingClientRect();
          mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(scene.children, false);

          if (intersects.length > 0) {
            const obj = intersects[0].object as THREE.Mesh;
            const label = (obj.userData as any).label as string | undefined;
            if (label) {
              showTooltip(label, e.clientX, e.clientY);
            } else {
              hideTooltip();
            }
          } else {
            hideTooltip();
          }
        };

        const onMouseLeave = () => hideTooltip();

        renderer.domElement.addEventListener('mousemove', onMouseMove);
        renderer.domElement.addEventListener('mouseleave', onMouseLeave);

        /* ----- Animation loop ----- */
        const animate = () => {
          if (!isMounted) return;
          frameId = requestAnimationFrame(animate);
          controls.update();
          renderer!.render(scene, camera);
        };
        animate();

        /* ----- Resize handling ----- */
        const onResize = () => {
          if (!renderer || !camera || !container) return;
          camera.aspect = container.clientWidth / container.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth, container.clientHeight);
        };
        const resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(container);
        window.addEventListener('resize', onResize);

        setLoading(false);
        setError(null);

        // Return cleanup function for this scene
        return () => {
          resizeObserver.disconnect();
          window.removeEventListener('resize', onResize);
          renderer?.domElement.removeEventListener('mousemove', onMouseMove);
          renderer?.domElement.removeEventListener('mouseleave', onMouseLeave);
          if (renderer?.domElement?.parentNode === container) {
            container.removeChild(renderer.domElement);
          }
          renderer?.dispose();
          scene.clear();
          hideTooltip();
        };
      } catch (err: any) {
        console.error('[Viz3D] Error:', err);
        if (isMounted) {
          setError(err.message ?? 'Unknown error');
          setLoading(false);
        }
      }
    };

    /* -------------------------- Main flow ------------------------------- */
    const endpoint = `${visualizerUrl}/embeddings/${jobId}/${method}/3d`;
    let sceneCleanup: (() => void) | undefined;

    const run = async () => {
      setLoading(true);
      setError(null);
      hideTooltip();

      const ready = await waitForJob();
      if (!ready) {
        if (isMounted) {
          setError('Job processing timed out. Please try again.');
          setLoading(false);
        }
        return;
      }

      // Job is ready – now fetch data and build the scene
      sceneCleanup = await initScene();
    };

    run();

    /* -------------------------- Cleanup everything ---------------------- */
    return () => {
    console.debug('[Viz3D] Unmount');
    isMounted = false;
    pollTimeouts.forEach(id => clearTimeout(id));
    if (frameId) cancelAnimationFrame(frameId);
    if (sceneCleanup) sceneCleanup();
    };
  }, [jobId, method, visualizerUrl]);

  /* ---------------------------------------------------------------------- */
  /* Render */
  /* ---------------------------------------------------------------------- */
  return (
    <div
      ref={mountRef}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      }}
    >
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          background: '#ffffff',
          color: '#1e293b',
          padding: '6px 12px',
          borderRadius: 6,
          fontSize: 12,
          pointerEvents: 'none',
          display: 'none',
          zIndex: 100,
          maxWidth: 300,
          wordBreak: 'break-all',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      />

      {loading && (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      color: '#1e293b',
      fontSize: '1.2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}
  >
    <div
      style={{
        width: '48px',
        height: '48px',
        border: '4px solid #e2e8f0',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px',
      }}
    />
    <div>Computing embeddings…</div>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)}

      {error && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            background: '#fef2f2',
            color: '#dc2626',
            padding: '10px 16px',
            borderRadius: 6,
            zIndex: 10,
            border: '1px solid #fecaca',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default Visualization3d;
