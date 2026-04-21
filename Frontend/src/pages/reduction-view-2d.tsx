import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useLocation } from "react-router-dom";

interface EmbeddingPoint {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface VisualsParamsOut {
  jobId:string
   method: 'umap' | 'tsne' | 'pca';
}

const Visualization2d: React.FC = () => {
  const location = useLocation();
  const { jobId, method } = location.state as VisualsParamsOut;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const selectionPathRef = useRef<SVGPathElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EmbeddingPoint[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [isRectSelect, setIsRectSelect] = useState(false);
  const rectCurrentRef = useRef<[number, number] | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<HTMLCanvasElement, unknown> | null>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const rectStartRef = useRef<[number, number] | null>(null);

  const rectPath = (x: number, y: number, w: number, h: number) => {
    return `M${x},${y} l${w},0 l0,${h} l${-w},0z`;
  };

 useEffect(() => {
  let isMounted = true;
  const visualizerUrl = import.meta.env.VITE_VISUALIZER_URL

  const fetchData = async () => {
    try {
      const resp = await fetch(`${visualizerUrl}/embeddings/${jobId}/${method}/2d`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const payload = await resp.json();
      if (isMounted) {
        setData(payload.data);
        setLoading(false);
      }
    } catch (e: any) {
      if (isMounted) {
        setError(e.message ?? 'Unknown error');
        setLoading(false);

      }
    }
  };

  const checkStatus = async (): Promise<boolean> => {
    try {
      const resp = await fetch(
        `${visualizerUrl}/status/${jobId}?method=${method}&dim=2d`
      );
      if (!resp.ok) {
        if (resp.status === 404) return false;
        throw new Error(`Status check failed: ${resp.status}`);
      }
      const data = await resp.json();
      return data.status === 'ready';
    } catch (e) {
      console.error('Status poll error:', e);
      return false;
    }
  };

  const poll = async () => {
    let attempts = 0;
    const maxAttempts = 30;
    const baseDelay = 1000;

    while (attempts < maxAttempts) {
      const ready = await checkStatus();
      if (ready) {
        if (isMounted) {

          fetchData();
        }
        return;
      }
      attempts++;
      const delay = Math.min(baseDelay * Math.pow(1.5, attempts), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    if (isMounted) {

      setError('Job processing timed out. Please try again.');
      setLoading(false);
    }
  };

  setLoading(true);
  poll();

  return () => {
    isMounted = false;
  };
}, [jobId, method]);
  const getExtent = (points: EmbeddingPoint[], key: 'x' | 'y'): [number, number] => {
    let min = Infinity, max = -Infinity;
    points.forEach(p => {
      const v = p[key];
      if (v < min) min = v;
      if (v > max) max = v;
    });
    return [min, max];
  };

  const normalize = (v: number, [min, max]: [number, number]) =>
    max === min ? 0.5 : (v - min) / (max - min);

  const getGradientColor = (nx: number, ny: number): string => {
    const r = Math.round(nx * 255);
    const g = Math.round(ny * 255);
    const b = Math.round((1 - nx) * 255 * 0.7 + ny * 255 * 0.3);
    return `rgb(${r},${g},${b})`;
  };
const render = useCallback(() => {
  if (!data.length || !canvasRef.current || !containerRef.current) return;
  const canvas = canvasRef.current;
  const container = containerRef.current;
  const ctx = canvas.getContext('2d')!;
  const width = container.clientWidth;
  const height = container.clientHeight;
  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const [xMin, xMax] = getExtent(data, 'x');
  const [yMin, yMax] = getExtent(data, 'y');
  const t = transformRef.current;
  const xScale = t.rescaleX(d3.scaleLinear().domain([xMin, xMax]).range([60, width - 60]));
  const yScale = t.rescaleY(d3.scaleLinear().domain([yMax, yMin]).range([60, height - 60]));

  // Clear with light background
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  // Grid lines - lighter color
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  const xTicks = xScale.ticks(6);
  const yTicks = yScale.ticks(6);
  ctx.beginPath();
  xTicks.forEach((t: any) => { const px = xScale(t); ctx.moveTo(px, 60); ctx.lineTo(px, height - 60); });
  yTicks.forEach((t: any) => { const py = yScale(t); ctx.moveTo(60, py); ctx.lineTo(width - 60, py); });
  ctx.stroke();

  // Axis labels - dark text
  ctx.fillStyle = '#334155';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  xTicks.forEach((t: any) => ctx.fillText(t.toFixed(3), xScale(t), height - 40));
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  yTicks.forEach((t: any) => ctx.fillText(t.toFixed(3), 50, yScale(t)));
  ctx.textAlign = 'center';
  ctx.fillStyle = '#475569';
  ctx.fillText('X', width / 2, height - 10);
  ctx.save();
  ctx.translate(15, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Y', 0, 0);
  ctx.restore();

  const baseSize = 6;
  const selectedSize = 12;
  data.forEach((point, i) => {
    const px = xScale(point.x);
    const py = yScale(point.y);
    const nx = normalize(point.x, [xMin, xMax]);
    const ny = normalize(point.y, [yMin, yMax]);
    const isSelected = selectedIndices.includes(i);
    const size = isSelected ? selectedSize : baseSize;
    const color = getGradientColor(nx, ny);

    if (isSelected) {
      ctx.beginPath();
      ctx.arc(px, py, size + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; // Light blue selection glow
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Border - dark for contrast
    ctx.strokeStyle = isSelected ? '#1d4ed8' : 'rgba(30, 41, 59, 0.3)';
    ctx.lineWidth = isSelected ? 2 : 0.5;
    ctx.stroke();
  });

  (canvas as any).__scales__ = { xScale, yScale };
  (canvas as any).__data__ = data;
}, [data, selectedIndices]);


  useEffect(() => {
    render();
  }, [selectedIndices, render]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !data.length) return;
    const canvas = canvasRef.current;
    const zoom = d3.zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.1, 20])
      .on('zoom', (event:any) => {
        transformRef.current = event.transform;
        render();
      });
    d3.select(canvas).call(zoom);
    zoomRef.current = zoom as any;
    render();
    return () => { d3.select(canvas).on('.zoom', null); };
  }, [data, render]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0)
      .style('pointer-events', 'none');

    const path = svg.append('path')
      .attr('class', 'selection')
      .attr('fill', 'none')
      .attr('stroke', '#4ade80')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,4')
      .attr('visibility', 'hidden');

    svgRef.current = svg.node() as any;
    selectionPathRef.current = path.node() as any;

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      svg.attr('width', w).attr('height', h);
    };
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      svg.remove();
    };
  }, []);

const startSelection = useCallback((start: [number, number]) => {
  rectStartRef.current = start;
  rectCurrentRef.current = start;
  const path = selectionPathRef.current;
  if (path) {
    d3.select(path)
      .attr('d', rectPath(start[0], start[1], 0, 0))
      .attr('visibility', 'visible');
  }
  setIsRectSelect(true);
}, []); // No dependencies because it only uses refs and a pure helper

const moveSelection = useCallback((start: [number, number], moved: [number, number]) => {
  rectCurrentRef.current = moved;
  const path = selectionPathRef.current;
  if (path) {
    d3.select(path).attr(
      'd',
      rectPath(start[0], start[1], moved[0] - start[0], moved[1] - start[1])
    );
  }
}, []); // Only uses refs and rectPath

const endSelection = useCallback(() => {
  const path = selectionPathRef.current;
  if (path) d3.select(path).attr('visibility', 'hidden');
  setIsRectSelect(false);

  if (!rectStartRef.current || !rectCurrentRef.current) {
    rectStartRef.current = null;
    rectCurrentRef.current = null;
    return;
  }

  const start = rectStartRef.current;
  const end = rectCurrentRef.current;

  const x1 = Math.min(start[0], end[0]);
  const y1 = Math.min(start[1], end[1]);
  const x2 = Math.max(start[0], end[0]);
  const y2 = Math.max(start[0], end[0]);

  const canvas = canvasRef.current!;
  const scales = (canvas as any).__scales__;
  const dataPoints = (canvas as any).__data__;
  if (!scales || !dataPoints) {
    rectStartRef.current = null;
    rectCurrentRef.current = null;
    return;
  }

  const selected: number[] = [];
  dataPoints.forEach((p: EmbeddingPoint, i: number) => {
    const px = scales.xScale(p.x);
    const py = scales.yScale(p.y);
    if (px >= x1 && px <= x2 && py >= y1 && py <= y2) selected.push(i);
  });

  setSelectedIndices(prev => {
    const set = new Set(prev);
    selected.forEach(i => set.add(i));
    return Array.from(set);
  });

  rectStartRef.current = null;
  rectCurrentRef.current = null;
}, []); // Dependencies: setSelectedIndices is stable, canvasRef is stable, __scales__/__data__ are updated via render

 useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const mousedown = (e: MouseEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();

    const start: [number, number] = [e.offsetX, e.offsetY];
    startSelection(start);

    const subject = d3.select(window);
    subject
      .on('mousemove.selection', (moveEvent: any) => {
        const rect = canvas.getBoundingClientRect();
        const moved: [number, number] = [
          moveEvent.clientX - rect.left,
          moveEvent.clientY - rect.top
        ];
        moveSelection(start, moved);
      })
      .on('mouseup.selection', () => {
        endSelection();
        subject.on('mousemove.selection', null).on('mouseup.selection', null);
      });
  };

  canvas.addEventListener('mousedown', mousedown);
  return () => canvas.removeEventListener('mousedown', mousedown);
}, [data, startSelection, moveSelection, endSelection]);


useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const touchstart = (e: TouchEvent) => {
    if (e.touches.length !== 2) return;
    e.preventDefault();

    const touch = e.changedTouches[0];
    const id = touch.identifier;
    const rect = canvas.getBoundingClientRect();
    const start: [number, number] = [
      touch.clientX - rect.left,
      touch.clientY - rect.top,
    ];

    startSelection(start);

    const subject = d3.select(canvas);
    subject
      .on(`touchmove.${id}`, (moveEvent: TouchEvent) => {
        const t = Array.from(moveEvent.changedTouches).find(touch => touch.identifier === id);
        if (t) {
          const moved: [number, number] = [t.clientX - rect.left, t.clientY - rect.top];
          moveSelection(start, moved);
        }
      })
      .on(`touchend.${id}`, () => {
        endSelection();
        subject.on(`touchmove.${id}`, null).on(`touchend.${id}`, null);
      });
  };

  canvas.addEventListener('touchstart', touchstart, { passive: false });
  return () => canvas.removeEventListener('touchstart', touchstart);
}, [data, startSelection, moveSelection, endSelection]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isRectSelect) return;
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scales = (canvas as any).__scales__;
    const data = (canvas as any).__data__;
    if (!scales || !data) return;
    const xVal = scales.xScale.invert(x);
    const yVal = scales.yScale.invert(y);
    let closest = { index: -1, dist: Infinity };
    data.forEach((p: EmbeddingPoint, i: number) => {
      const dx = p.x - xVal;
      const dy = p.y - yVal;
      const dist = dx * dx + dy * dy;
      if (!closest || dist < closest.dist) closest = { index: i, dist };
    });
    if (closest.dist < 0.01) {
      const point = data[closest.index];
      setHoveredLabel(point.label);
      setHoverPosition({ x: e.clientX - rect.left + 12, y: e.clientY - rect.top + 12 });
    } else {
      setHoveredLabel(null);
      setHoverPosition(null);
    }
  }, [isRectSelect]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (isRectSelect || e.ctrlKey || e.metaKey) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scales = (canvas as any).__scales__;
    const data = (canvas as any).__data__;
    if (!scales || !data) return;
    const xVal = scales.xScale.invert(x);
    const yVal = scales.yScale.invert(y);
    let closestIndex: number | null = null;
    let minDist = Infinity;
    data.forEach((p: EmbeddingPoint, i: number) => {
      const dist = Math.hypot(p.x - xVal, p.y - yVal);
      if (dist < minDist) { minDist = dist; closestIndex = i; }
    });
    if (closestIndex !== null && minDist < 0.1) {
      setSelectedIndices(prev => prev.includes(closestIndex!)
        ? prev.filter(i => i !== closestIndex)
        : [...prev, closestIndex!]);
    } else {
      setSelectedIndices([]);
    }
  }, [isRectSelect]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mouseleave', () => {
      setHoveredLabel(null);
      setHoverPosition(null);
    });
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mouseleave', () => {});
    };
  }, [handleMouseMove, handleClick]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedIndices([]); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handleResize = () => render();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  const selectedPoints = selectedIndices.map(i => data[i]).filter(Boolean);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      {data.length > 0 && (
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            cursor: isRectSelect ? 'crosshair' : 'grab',
          }}
        />
      )}

      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          color: '#aaa',
          fontSize: 12,
          zIndex: 10,
          background: 'rgba(0,0,0,0.5)',
          padding: '4px 8px',
          borderRadius: 4,
        }}
      >
        Pan: Drag • Zoom: Scroll • Rect: Ctrl + Drag
      </div>

      {hoveredLabel && hoverPosition && (
        <div
          style={{
            position: 'absolute',
            left: hoverPosition.x,
            top: hoverPosition.y,
            background: 'rgba(0,0,0,0.85)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 12,
            pointerEvents: 'none',
            zIndex: 100,
            maxWidth: 300,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {hoveredLabel}
        </div>
      )}

      {selectedPoints.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(0,0,0,0.9)',
            color: '#fff',
            padding: '12px',
            borderRadius: 6,
            maxWidth: 320,
            maxHeight: '80vh',
            overflowY: 'auto',
            zIndex: 50,
            fontSize: 13,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ marginBottom: 8, fontWeight: 'bold', color: '#4ade80' }}>
            Selected ({selectedPoints.length})
            <span
              style={{ float: 'right', cursor: 'pointer', fontWeight: 'normal' }}
              onClick={() => setSelectedIndices([])}
            >
              Clear
            </span>
          </div>
          {selectedPoints.map((pt, idx) => (
            <div
              key={pt.id}
              style={{
                marginBottom: 10,
                paddingBottom: 8,
                borderBottom:
                  idx < selectedPoints.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              }}
            >
              <div><strong>ID:</strong> {pt.id}</div>
              <div><strong>Label:</strong> <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{pt.label}</span></div>
              <div><strong>X:</strong> {pt.x.toFixed(6)}</div>
              <div><strong>Y:</strong> {pt.y.toFixed(6)}</div>
            </div>
          ))}
          <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
            Press <kbd>Esc</kbd> to deselect
          </div>
        </div>
      )}

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

export default Visualization2d;
