import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { VisualData } from '../types/mathed';
import {
  Compass,
  Download,
  RotateCcw,
  Sliders,
  Check,
  Maximize2,
  Camera,
  Layers,
} from 'lucide-react';

interface Geometry3DViewerProps {
  visualData: VisualData;
  cuttingOffset?: number; // 0 to 1 slider
  onOffsetChange?: (val: number) => void;
  auxiliaryHighlighted?: boolean;
}

export const Geometry3DViewer: React.FC<Geometry3DViewerProps> = ({
  visualData,
  cuttingOffset = 0.5,
  onOffsetChange,
  auxiliaryHighlighted = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [showLabels, setShowLabels] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [showDashed, setShowDashed] = useState(true);
  const [cameraView, setCameraView] = useState<'sgk' | 'top' | 'side' | 'iso'>('sgk');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Track projected 2D coordinates of 3D vertices for crisp HTML labels
  const [projectedLabels, setProjectedLabels] = useState<
    Array<{ name: string; x: number; y: number; color?: string }>
  >([]);

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const verticesGroupRef = useRef<THREE.Group | null>(null);

  // Mouse interaction state for orbital drag
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 8, theta: 0.85, phi: 1.15 });

  const modelKind = visualData.modelKind || 'pyramid_sabcd';

  // Base coordinates definition according to standard SGK KNTT
  const basePoints = useMemo(() => {
    if (visualData.vertices && visualData.vertices.length > 0) {
      return visualData.vertices;
    }

    if (modelKind === 'pyramid_sabc') {
      return [
        { name: 'S', coord: [0, 3.2, 0] as [number, number, number] },
        { name: 'A', coord: [-1.8, 0, -1.2] as [number, number, number] },
        { name: 'B', coord: [1.8, 0, -1.0] as [number, number, number] },
        { name: 'C', coord: [0.5, 0, 1.6] as [number, number, number] },
        { name: 'H', coord: [0, 0, 0] as [number, number, number], isAuxiliary: true },
      ];
    }

    if (modelKind === 'prism') {
      return [
        { name: 'A', coord: [-1.8, 0, -1.0] as [number, number, number] },
        { name: 'B', coord: [1.2, 0, -1.2] as [number, number, number] },
        { name: 'C', coord: [1.8, 0, 1.2] as [number, number, number] },
        { name: "A'", coord: [-1.8, 2.6, -1.0] as [number, number, number] },
        { name: "B'", coord: [1.2, 2.6, -1.2] as [number, number, number] },
        { name: "C'", coord: [1.8, 2.6, 1.2] as [number, number, number] },
      ];
    }

    if (modelKind === 'cube' || modelKind === 'box') {
      return [
        { name: 'A', coord: [-1.6, 0, -1.4] as [number, number, number] },
        { name: 'B', coord: [1.6, 0, -1.4] as [number, number, number] },
        { name: 'C', coord: [2.0, 0, 1.2] as [number, number, number] },
        { name: 'D', coord: [-1.2, 0, 1.2] as [number, number, number] },
        { name: "A'", coord: [-1.6, 2.6, -1.4] as [number, number, number] },
        { name: "B'", coord: [1.6, 2.6, -1.4] as [number, number, number] },
        { name: "C'", coord: [2.0, 2.6, 1.2] as [number, number, number] },
        { name: "D'", coord: [-1.2, 2.6, 1.2] as [number, number, number] },
      ];
    }

    // Default: pyramid_sabcd
    return [
      { name: 'S', coord: [0, 3.2, 0] as [number, number, number] },
      { name: 'A', coord: [-2.0, 0, -1.5] as [number, number, number] },
      { name: 'B', coord: [1.8, 0, -1.5] as [number, number, number] },
      { name: 'C', coord: [2.2, 0, 1.4] as [number, number, number] },
      { name: 'D', coord: [-1.6, 0, 1.4] as [number, number, number] },
      { name: 'H', coord: [0, 0, 0] as [number, number, number], isAuxiliary: true },
    ];
  }, [visualData, modelKind]);

  // Edges: Partition solid (nét liền) and dashed (nét đứt) strictly following SGK KNTT
  const edges = useMemo(() => {
    if (visualData.edges) {
      return visualData.edges;
    }

    if (modelKind === 'pyramid_sabc') {
      return {
        solid: [
          ['S', 'A'],
          ['S', 'B'],
          ['S', 'C'],
          ['A', 'B'],
          ['B', 'C'],
        ],
        dashed: [
          ['A', 'C'],
          ['S', 'H'],
          ['A', 'H'],
        ],
      };
    }

    if (modelKind === 'prism') {
      return {
        solid: [
          ['A', 'B'],
          ['B', 'C'],
          ["A'", "B'"],
          ["B'", "C'"],
          ["C'", "A'"],
          ['B', "B'"],
          ['C', "C'"],
          ['A', "A'"],
        ],
        dashed: [
          ['A', 'C'],
          ["A'", 'C'],
        ],
      };
    }

    if (modelKind === 'cube' || modelKind === 'box') {
      return {
        solid: [
          ['A', 'B'],
          ['B', 'C'],
          ["A'", "B'"],
          ["B'", "C'"],
          ["C'", "D'"],
          ["D'", "A'"],
          ['B', "B'"],
          ['C', "C'"],
          ['D', "D'"],
        ],
        dashed: [
          ['A', 'D'],
          ['C', 'D'],
          ['A', "A'"],
        ],
      };
    }

    // Default: pyramid_sabcd
    return {
      solid: [
        ['S', 'A'],
        ['S', 'B'],
        ['S', 'C'],
        ['A', 'B'],
        ['B', 'C'],
      ],
      dashed: [
        ['A', 'D'],
        ['C', 'D'],
        ['S', 'D'],
        ['S', 'H'],
        ['A', 'C'],
        ['B', 'D'],
      ],
    };
  }, [modelKind, visualData.edges]);

  const setCameraPreset = (preset: 'sgk' | 'top' | 'side' | 'iso') => {
    setCameraView(preset);
    if (!cameraRef.current) return;

    if (preset === 'sgk') {
      sphericalRef.current = { radius: 8, theta: 0.85, phi: 1.15 };
    } else if (preset === 'top') {
      sphericalRef.current = { radius: 8, theta: 0, phi: 0.05 };
    } else if (preset === 'side') {
      sphericalRef.current = { radius: 8, theta: Math.PI / 2, phi: Math.PI / 2 };
    } else if (preset === 'iso') {
      sphericalRef.current = { radius: 8.5, theta: Math.PI / 4, phi: Math.PI / 3.5 };
    }
    updateCameraTransform();
  };

  const updateCameraTransform = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const clampedPhi = Math.max(0.05, Math.min(Math.PI - 0.05, phi));
    sphericalRef.current.phi = clampedPhi;

    const x = radius * Math.sin(clampedPhi) * Math.sin(theta);
    const y = radius * Math.cos(clampedPhi);
    const z = radius * Math.sin(clampedPhi) * Math.cos(theta);

    cameraRef.current.position.set(x, y + 0.5, z);
    cameraRef.current.lookAt(0, 0.8, 0);
  };

  // High-Resolution PNG Download for teachers' lesson plans & test sheets
  const handleDownloadImage = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    // Render cleanly to canvas
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');

    const link = document.createElement('a');
    link.download = `HinhHocKhongGian_PhamHau_${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 550;
    const height = 420;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf8fafc); // Crisp white/slate SGK background

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraTransform();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        preserveDrawingBuffer: true, // Needed for PNG screenshot export
        alpha: true,
      });
    } catch (e) {
      console.warn('WebGL init failed:', e);
      return;
    }
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Oxyz Axes Helper (optional)
    if (showAxes) {
      const axesHelper = new THREE.AxesHelper(3.2);
      (axesHelper.material as THREE.Material).transparent = true;
      (axesHelper.material as THREE.Material).opacity = 0.45;
      scene.add(axesHelper);
    }

    // Base Grid plane
    const grid = new THREE.GridHelper(6, 12, 0xcbd5e1, 0xe2e8f0);
    grid.position.y = -0.01;
    scene.add(grid);

    // Polyhedron group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    verticesGroupRef.current = mainGroup;

    // Helper map of vertices
    const vMap = new Map<string, THREE.Vector3>();
    basePoints.forEach((p) => {
      vMap.set(p.name, new THREE.Vector3(p.coord[0], p.coord[1], p.coord[2]));
    });

    // Solid Edges (Nét liền chuẩn SGK)
    const solidMat = new THREE.LineBasicMaterial({
      color: 0x0f172a,
      linewidth: 2.2,
    });

    edges.solid.forEach(([p1, p2]) => {
      const v1 = vMap.get(p1);
      const v2 = vMap.get(p2);
      if (v1 && v2) {
        const geom = new THREE.BufferGeometry().setFromPoints([v1, v2]);
        const line = new THREE.Line(geom, solidMat);
        mainGroup.add(line);
      }
    });

    // Dashed Edges (Nét đứt khuất chuẩn SGK)
    if (showDashed) {
      const dashedMat = new THREE.LineDashedMaterial({
        color: auxiliaryHighlighted ? 0x2563eb : 0x64748b,
        dashSize: 0.12,
        gapSize: 0.08,
        linewidth: 1.8,
      });

      edges.dashed.forEach(([p1, p2]) => {
        const v1 = vMap.get(p1);
        const v2 = vMap.get(p2);
        if (v1 && v2) {
          const geom = new THREE.BufferGeometry().setFromPoints([v1, v2]);
          const line = new THREE.Line(geom, dashedMat);
          line.computeLineDistances();
          mainGroup.add(line);
        }
      });
    }

    // Vertex Spheres
    const vertexGeom = new THREE.SphereGeometry(0.045, 16, 16);
    const vertexMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
    const auxVertexMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.2 });

    basePoints.forEach((p) => {
      const isAux = p.isAuxiliary || p.name === 'H' || p.name === 'M' || p.name === 'N' || p.name === 'P';
      const sphere = new THREE.Mesh(vertexGeom, isAux ? auxVertexMat : vertexMat);
      sphere.position.set(p.coord[0], p.coord[1], p.coord[2]);
      mainGroup.add(sphere);
    });

    // Dynamic Cutting Plane (Thiết diện) for pyramids
    let cuttingPoints: THREE.Vector3[] = [];
    if (modelKind.startsWith('pyramid')) {
      const hRatio = cuttingOffset;
      const S = vMap.get('S') || new THREE.Vector3(0, 3.2, 0);
      const A = vMap.get('A') || new THREE.Vector3(-2.0, 0, -1.5);
      const B = vMap.get('B') || new THREE.Vector3(1.8, 0, -1.5);
      const C = vMap.get('C') || new THREE.Vector3(2.2, 0, 1.4);
      const D = vMap.get('D') || new THREE.Vector3(-1.6, 0, 1.4);

      const M = new THREE.Vector3().lerpVectors(A, S, hRatio);
      const N = new THREE.Vector3().lerpVectors(B, S, hRatio);
      const P = new THREE.Vector3().lerpVectors(C, S, hRatio);
      const Q = new THREE.Vector3().lerpVectors(D, S, hRatio);

      cuttingPoints = [M, N, P, Q];

      // Cutting polygon mesh
      const planeGeom = new THREE.BufferGeometry();
      const planeVertices = new Float32Array([
        M.x, M.y, M.z,
        N.x, N.y, N.z,
        P.x, P.y, P.z,

        M.x, M.y, M.z,
        P.x, P.y, P.z,
        Q.x, Q.y, Q.z,
      ]);
      planeGeom.setAttribute('position', new THREE.BufferAttribute(planeVertices, 3));
      planeGeom.computeVertexNormals();

      const planeMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4, // Cyan
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      });

      const planeMesh = new THREE.Mesh(planeGeom, planeMat);
      scene.add(planeMesh);

      // Plane perimeter outline
      const outlineGeom = new THREE.BufferGeometry().setFromPoints([M, N, P, Q, M]);
      const outlineMat = new THREE.LineBasicMaterial({ color: 0xd97706, linewidth: 2.8 });
      const outlineLine = new THREE.Line(outlineGeom, outlineMat);
      scene.add(outlineLine);
    }

    // Animation / Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);

      // Project 3D coordinates to 2D screen positions for crisp HTML labels
      if (containerRef.current && cameraRef.current) {
        const curWidth = containerRef.current.clientWidth;
        const curHeight = 420;

        const allPoints = [...basePoints];
        if (cuttingPoints.length >= 4) {
          allPoints.push(
            { name: 'M', coord: [cuttingPoints[0].x, cuttingPoints[0].y, cuttingPoints[0].z], color: 'text-amber-700' },
            { name: 'N', coord: [cuttingPoints[1].x, cuttingPoints[1].y, cuttingPoints[1].z], color: 'text-amber-700' },
            { name: 'P', coord: [cuttingPoints[2].x, cuttingPoints[2].y, cuttingPoints[2].z], color: 'text-amber-700' },
            { name: 'Q', coord: [cuttingPoints[3].x, cuttingPoints[3].y, cuttingPoints[3].z], color: 'text-amber-700' }
          );
        }

        const projected = allPoints.map((pt) => {
          const vec = new THREE.Vector3(pt.coord[0], pt.coord[1], pt.coord[2]);
          vec.project(cameraRef.current!);
          const screenX = ((vec.x + 1) * curWidth) / 2;
          const screenY = ((-vec.y + 1) * curHeight) / 2;
          return {
            name: pt.name,
            x: screenX,
            y: screenY,
            color: pt.color,
          };
        });

        setProjectedLabels(projected);
      }
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      cameraRef.current.aspect = newWidth / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [basePoints, edges, cuttingOffset, modelKind, auxiliaryHighlighted, showAxes, showDashed]);

  // Handle Mouse Orbital Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    sphericalRef.current.theta += deltaX * 0.008;
    sphericalRef.current.phi -= deltaY * 0.008;

    updateCameraTransform();
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    sphericalRef.current.radius = Math.max(3, Math.min(16, sphericalRef.current.radius + e.deltaY * 0.005));
    updateCameraTransform();
  };

  return (
    <div className="relative w-full rounded-2xl bg-slate-50 border border-slate-200 shadow-inner overflow-hidden select-none font-sans">
      {/* Top Header & Camera View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Compass className="w-3.5 h-3.5 text-emerald-700" />
            Hình Học Không Gian SGK Kết Nối Tri Thức
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Chuẩn Font & Nét Đứt / Nét Liền
          </span>
        </div>

        {/* Action Buttons: Camera angles & PNG Download */}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setCameraPreset('sgk')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                cameraView === 'sgk'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Góc nhìn phối cảnh chuẩn Sách Giáo Khoa"
            >
              SGK Chuẩn
            </button>
            <button
              onClick={() => setCameraPreset('top')}
              className={`px-2 py-1 rounded-md font-semibold transition ${
                cameraView === 'top'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Nhìn từ trên xuống đáy"
            >
              Mặt Đáy
            </button>
            <button
              onClick={() => setCameraPreset('side')}
              className={`px-2 py-1 rounded-md font-semibold transition ${
                cameraView === 'side'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Hình chiếu mặt bên"
            >
              Mặt Bên
            </button>
            <button
              onClick={() => setCameraPreset('iso')}
              className={`px-2 py-1 rounded-md font-semibold transition ${
                cameraView === 'iso'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Góc Isometric 3D"
            >
              Isometric
            </button>
          </div>

          <button
            onClick={handleDownloadImage}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 shadow-xs"
            title="Tải ảnh PNG sắc nét chèn vào Word/PowerPoint"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã lưu PNG!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Tải ảnh PNG</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[420px] cursor-grab active:cursor-grabbing bg-gradient-to-b from-slate-50 via-white to-slate-100"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* 2D Projected HTML Labels for Crisp Typography */}
        {showLabels &&
          projectedLabels.map((lbl, idx) => (
            <div
              key={`${lbl.name}-${idx}`}
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 select-none"
              style={{ left: `${lbl.x}px`, top: `${lbl.y - 12}px` }}
            >
              <span
                className={`font-serif italic font-black text-sm px-1.5 py-0.5 rounded ${
                  lbl.color || 'text-slate-900'
                } bg-white/85 shadow-sm border border-slate-200/80`}
              >
                {lbl.name}
              </span>
            </div>
          ))}

        {/* Watermark brand */}
        <div className="absolute top-2.5 right-3 pointer-events-none text-[11px] font-bold text-slate-400 bg-white/70 backdrop-blur px-2 py-0.5 rounded border border-slate-200/60 shadow-xs">
          HỖ TRỢ VẼ HÌNH _ PHẠM HẬU
        </div>

        {/* Navigation hint */}
        <div className="absolute bottom-2.5 left-3 pointer-events-none text-[11px] text-slate-500 bg-white/85 backdrop-blur px-2.5 py-1 rounded-md border border-slate-200/80 shadow-xs">
          Giữ chuột trái để xoay 360° • Lăn chuột để phóng to/thu nhỏ
        </div>
      </div>

      {/* Interactive Controls & Cutting Plane Slider */}
      <div className="p-3 bg-white border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Slider for cutting plane if pyramid */}
        {modelKind.startsWith('pyramid') ? (
          <div className="w-full md:w-auto flex-1 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-600 shrink-0" />
            <span className="font-semibold text-slate-700 shrink-0">
              Mặt phẳng thiết diện (h):
            </span>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={cuttingOffset}
              onChange={(e) => onOffsetChange?.(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
            <span className="text-cyan-700 font-mono font-bold w-12 text-right">
              {(cuttingOffset * 100).toFixed(0)}%
            </span>
          </div>
        ) : (
          <div className="text-xs text-slate-500">
            Mô hình hình học không gian chuẩn SGK Kết Nối Tri Thức
          </div>
        )}

        {/* Display Toggles */}
        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer hover:text-slate-900 font-medium">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="rounded text-blue-600 accent-blue-600"
            />
            <span>Nhãn đỉnh</span>
          </label>
          <span className="text-slate-300">|</span>
          <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer hover:text-slate-900 font-medium">
            <input
              type="checkbox"
              checked={showDashed}
              onChange={(e) => setShowDashed(e.target.checked)}
              className="rounded text-blue-600 accent-blue-600"
            />
            <span>Nét đứt SGK</span>
          </label>
          <span className="text-slate-300">|</span>
          <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer hover:text-slate-900 font-medium">
            <input
              type="checkbox"
              checked={showAxes}
              onChange={(e) => setShowAxes(e.target.checked)}
              className="rounded text-blue-600 accent-blue-600"
            />
            <span>Trục Oxyz</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Geometry3DViewer;
