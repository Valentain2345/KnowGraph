import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
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
interface Visualization3dProps {
  jobId: string;
  method: 'umap' | 'tsne' | 'pca';
}

/* -------------------------------------------------------------------------- */
/* Component */
/* -------------------------------------------------------------------------- */
const Visualization3d: React.FC = () => {
  const location = useLocation();
  const { jobId, method } = location.state as VisualsParamsOut;
  console.log('Job ID:', jobId);
  console.log('Method:', method);
  const mountRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const endpoint = `http://127.0.0.1:5000/embeddings/${jobId}/${method}/3d`;

  useEffect(() => {
    console.debug('[Viz3D] useEffect – jobId:', jobId, 'method:', method);
    if (!mountRef.current) return;

    let isMounted = true;
    let renderer: THREE.WebGLRenderer | null = null;
    let frameId: number | null = null;
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

    const fetchAndRender = async () => {
      console.debug('[Viz3D] Fetch →', endpoint);
      setLoading(true);
      setError(null);
      hideTooltip();

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
          console.debug('[Viz3D] Removed previous canvas');
        }

        /* ----- Three.js setup ----- */
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        const camera = new THREE.PerspectiveCamera(
          75,
          container.clientWidth / container.clientHeight,
          0.1,
          1000
        );
        camera.position.set(2, 2, 5);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        console.debug('[Viz3D] Canvas appended');

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        /* ----- Palette & normalisation ----- */
        const palette = [
          0xe41a1c, 0x377eb8, 0x4daf4a, 0x984ea3, 0xff7f00,
          0xffff33, 0xa65628, 0xf781bf, 0x999999, 0x66c2a5,
        ];
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
            roughness: 0.6,
            metalness: 0.3,
            emissive: color,
            emissiveIntensity: 0.3,
          });

          const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.02, 32, 32), material);
          sphere.position.set(nx, ny, nz);
          sphere.userData = { label: pt.label };
          scene.add(sphere);
        });

        /* ----- Lights ----- */
        scene.add(new THREE.AmbientLight(0x404040, 0.6));
        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(3, 3, 3);
        scene.add(light);

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

        /* ----- Cleanup ----- */
        const cleanup = () => {
          console.debug('[Viz3D] Cleanup');
          isMounted = false;
          if (frameId) cancelAnimationFrame(frameId);
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

        setLoading(false);
        return cleanup;
      } catch (e: any) {
        console.error('[Viz3D] Error:', e);
        if (isMounted) {
          setError(e.message ?? 'Unknown error');
          setLoading(false);
        }
      }
    };

    const cleanupPromise = fetchAndRender();

    return () => {
      console.debug('[Viz3D] Unmount');
      isMounted = false;
      cleanupPromise.then(c => c?.());
    };
  }, [jobId, method]);

  /* ---------------------------------------------------------------------- */
  /* Render */
  /* ---------------------------------------------------------------------- */
  return (
    <div
      ref={mountRef}
      style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          background: 'rgba(0,0,0,0.85)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 12,
          pointerEvents: 'none',
          display: 'none',
          zIndex: 100,
          maxWidth: 300,
          wordBreak: 'break-all',
        }}
      />

      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 4,
            zIndex: 10,
          }}
        >
          Loading…
        </div>
      )}
      {error && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            background: 'rgba(0,0,0,0.7)',
            color: '#ff6b6b',
            padding: '8px 12px',
            borderRadius: 4,
            zIndex: 10,
          }}
        >
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default Visualization3d;
