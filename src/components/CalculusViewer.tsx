import React, { useState, useEffect, useRef } from 'react';
import { VisualData, ParameterSlider } from '../types/mathed';
import {
  Activity,
  Sliders,
  TrendingUp,
  Download,
  RefreshCw,
  Check,
} from 'lucide-react';

interface CalculusViewerProps {
  visualData: VisualData;
  parameterSlider?: ParameterSlider;
  initialM?: number;
}

export const CalculusViewer: React.FC<CalculusViewerProps> = ({
  visualData,
  parameterSlider,
  initialM = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paramM, setParamM] = useState<number>(initialM);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showAsymptotes, setShowAsymptotes] = useState<boolean>(true);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const minM = parameterSlider?.range ? parameterSlider.range[0] : -4;
  const maxM = parameterSlider?.range ? parameterSlider.range[1] : 4;

  const functionType = visualData.functionType || (
    visualData.modelKind === 'fractional' ? 'rational_1_1' :
    visualData.modelKind === 'fractional_2_1' ? 'rational_2_1' :
    visualData.modelKind === 'parabola' ? 'parabola' :
    visualData.modelKind === 'poly4' ? 'poly4' : 'poly3'
  );

  // Evaluate mathematical function based on type and parameters
  const evaluateF = (x: number): number => {
    const p = visualData.functionParams;

    if (functionType === 'rational_1_1') {
      const a = p?.a ?? 2;
      const b = p?.b ?? -1;
      const c = p?.c ?? 1;
      const d = p?.d ?? 1;
      const denom = c * x + d;
      if (Math.abs(denom) < 0.0001) return NaN;
      return (a * x + b) / denom;
    }

    if (functionType === 'rational_2_1') {
      const a = p?.a ?? 1;
      const b = p?.b ?? -1;
      const c = p?.c ?? 1;
      const d = p?.d ?? 1;
      const e = p?.e ?? -1;
      const denom = d * x + e;
      if (Math.abs(denom) < 0.0001) return NaN;
      return (a * x * x + b * x + c) / denom;
    }

    if (functionType === 'parabola') {
      const a = p?.a ?? -1;
      const b = p?.b ?? 2;
      const c = p?.c ?? 0;
      return a * x * x + b * x + c;
    }

    if (functionType === 'poly4') {
      const a = p?.a ?? 1;
      const b = p?.b ?? -2;
      const c = p?.c ?? 0;
      return a * Math.pow(x, 4) + b * Math.pow(x, 2) + c;
    }

    // Default: cubic function y = ax^3 + bx^2 + cx + d
    const a = p?.a ?? 1;
    const b = p?.b ?? 0;
    const c = p?.c ?? -3;
    const d = p?.d ?? 0;
    return a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
  };

  // Roots count analysis for parameter line
  const rootsCount = (() => {
    if (functionType === 'rational_1_1') {
      return {
        count: 1,
        status: 'Cắt tại 1 điểm duy nhất với mọi m ≠ 2',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      };
    }

    // Cubic roots calculation
    const targetY = -paramM;
    if (Math.abs(targetY - 2) < 0.05 || Math.abs(targetY - (-2)) < 0.05) {
      return {
        count: 2,
        status: '2 nghiệm phân biệt (có 1 nghiệm kép tại cực trị)',
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
      };
    }
    if (targetY > -2 && targetY < 2) {
      return {
        count: 3,
        status: '3 nghiệm phân biệt thực (cắt tại 3 điểm phân biệt)',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      };
    }
    return {
      count: 1,
      status: '1 nghiệm duy nhất',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
    };
  })();

  // PNG Screenshot download for teachers' test sheets & presentations
  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `DoThiHamSo_PhamHau_${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Viewport bounds
    let xMin = -4.5;
    let xMax = 4.5;
    let yMin = -4.5;
    let yMax = 4.5;

    if (functionType === 'rational_1_1') {
      xMin = -5.0;
      xMax = 4.0;
      yMin = -4.0;
      yMax = 6.0;
    }

    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Grid lines (Lưới tọa độ chuẩn SGK)
    if (showGrid) {
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;

      for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
        if (x === 0) continue;
        const cx = toCanvasX(x);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px STIX Two Text, serif';
        ctx.fillText(x.toString(), cx - 4, toCanvasY(0) + 14);
      }

      for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
        if (y === 0) continue;
        const cy = toCanvasY(y);
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(width, cy);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px STIX Two Text, serif';
        ctx.fillText(y.toString(), toCanvasX(0) + 6, cy + 3);
      }
    }

    // Axes Ox and Oy
    const cx0 = toCanvasX(0);
    const cy0 = toCanvasY(0);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.6;

    // Ox axis
    ctx.beginPath();
    ctx.moveTo(0, cy0);
    ctx.lineTo(width - 5, cy0);
    ctx.stroke();

    // Ox arrow
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(width, cy0);
    ctx.lineTo(width - 9, cy0 - 4.5);
    ctx.lineTo(width - 9, cy0 + 4.5);
    ctx.fill();

    // Oy axis
    ctx.beginPath();
    ctx.moveTo(cx0, height);
    ctx.lineTo(cx0, 5);
    ctx.stroke();

    // Oy arrow
    ctx.beginPath();
    ctx.moveTo(cx0, 0);
    ctx.lineTo(cx0 - 4.5, 9);
    ctx.lineTo(cx0 + 4.5, 9);
    ctx.fill();

    // Standard Math Axis Labels
    ctx.font = 'italic bold 14px STIX Two Text, serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('x', width - 16, cy0 - 8);
    ctx.fillText('y', cx0 + 8, 16);
    ctx.fillText('O', cx0 - 14, cy0 + 14);

    // Render Shaded Integral Region if applicable
    if (visualData.type === 'integral_region' || visualData.integralRegion) {
      const a = visualData.integralRegion?.from ?? 0;
      const b = visualData.integralRegion?.to ?? 2;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
      ctx.beginPath();
      ctx.moveTo(toCanvasX(a), toCanvasY(0));
      for (let x = a; x <= b; x += 0.03) {
        ctx.lineTo(toCanvasX(x), toCanvasY(evaluateF(x)));
      }
      ctx.lineTo(toCanvasX(b), toCanvasY(0));
      ctx.closePath();
      ctx.fill();

      // Shading stripes (gạch sọc diện tích tích phân chuẩn SGK)
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.4)';
      ctx.lineWidth = 1;
      for (let x = a; x <= b; x += 0.15) {
        const cx = toCanvasX(x);
        const cy = toCanvasY(evaluateF(x));
        ctx.beginPath();
        ctx.moveTo(cx, toCanvasY(0));
        ctx.lineTo(cx, cy);
        ctx.stroke();
      }
    }

    // Render Asymptotes (Đường tiệm cận nét đứt chuẩn SGK KNTT)
    if (showAsymptotes) {
      // Vertical asymptotes
      const vert = visualData.asymptotes?.vertical ?? (functionType === 'rational_1_1' ? [-1] : []);
      vert.forEach((vx) => {
        const cx = toCanvasX(vx);
        ctx.strokeStyle = '#ea580c'; // Orange-600
        ctx.lineWidth = 1.6;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#ea580c';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`x = ${vx}`, cx + 5, 25);
      });

      // Horizontal asymptotes
      const horiz = visualData.asymptotes?.horizontal ?? (functionType === 'rational_1_1' ? [2] : []);
      horiz.forEach((hy) => {
        const cy = toCanvasY(hy);
        ctx.strokeStyle = '#9333ea'; // Purple-600
        ctx.lineWidth = 1.6;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(width, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#9333ea';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`y = ${hy}`, 15, cy - 6);
      });

      // Slant asymptote (Tiệm cận xiên SGK KNTT)
      if (visualData.asymptotes?.slant) {
        const { a, b, expr } = visualData.asymptotes.slant;
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(toCanvasX(xMin), toCanvasY(a * xMin + b));
        ctx.lineTo(toCanvasX(xMax), toCanvasY(a * xMax + b));
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(expr || `y = ${a}x + ${b}`, width - 110, toCanvasY(a * (xMax - 1) + b) - 8);
      }
    }

    // Render Function Curves (Smooth curve rendering with asymptote break handling)
    ctx.strokeStyle = '#2563eb'; // Blue-600
    ctx.lineWidth = 2.6;

    const step = 0.02;
    let isDrawing = false;

    ctx.beginPath();
    for (let x = xMin; x <= xMax; x += step) {
      const y = evaluateF(x);

      // Check if point is valid and within bounds
      if (isNaN(y) || Math.abs(y) > 25) {
        isDrawing = false;
        continue;
      }

      const cx = toCanvasX(x);
      const cy = toCanvasY(y);

      if (!isDrawing) {
        ctx.moveTo(cx, cy);
        isDrawing = true;
      } else {
        // Detect sudden vertical jumps across vertical asymptote
        const prevY = evaluateF(x - step);
        if (Math.abs(y - prevY) > 8) {
          ctx.moveTo(cx, cy);
        } else {
          ctx.lineTo(cx, cy);
        }
      }
    }
    ctx.stroke();

    // Critical Points & Extrema
    const pointsToMark = visualData.criticalPoints || (
      functionType === 'poly3'
        ? [
            { x: -1, y: 2, type: 'CĐ (-1; 2)' },
            { x: 1, y: -2, type: 'CT (1; -2)' },
          ]
        : functionType === 'rational_1_1'
        ? [
            { x: 0, y: -1, type: '(0; -1)' },
            { x: 0.5, y: 0, type: '(1/2; 0)' },
          ]
        : []
    );

    pointsToMark.forEach((pt) => {
      const px = toCanvasX(pt.x);
      const py = toCanvasY(pt.y);

      // Dashed projection lines to axes
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, cy0);
      ctx.lineTo(px, py);
      ctx.lineTo(cx0, py);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point circle
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Point label
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 11px sans-serif';
      const offset = pt.y >= 0 ? -10 : 16;
      ctx.fillText(pt.type || `(${pt.x}; ${pt.y})`, px - 20, py + offset);
    });

    // Symmetry Center (Tâm đối xứng) if present
    if (visualData.symmetryCenter) {
      const { x: sx, y: sy } = visualData.symmetryCenter;
      const spx = toCanvasX(sx);
      const spy = toCanvasY(sy);

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(spx, spy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`I(${sx}; ${sy})`, spx + 6, spy - 6);
    }

    // Horizontal Parameter Line: y = -m (hoặc y = paramM)
    const targetY = -paramM;
    const lineY = toCanvasY(targetY);

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(0, lineY);
    ctx.lineTo(width, lineY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`Đường thẳng y = ${targetY.toFixed(2)} (tức -m)`, 12, lineY - 6);

    // Watermark
    ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.font = '10px sans-serif';
    ctx.fillText('HỖ TRỢ VẼ HÌNH _ PHẠM HẬU', width - 165, height - 10);
  }, [paramM, showGrid, showAsymptotes, visualData, functionType]);

  const bbtData = visualData.bbt;

  return (
    <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 shadow-inner overflow-hidden font-sans">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
            Đồ Thị Hàm Số SGK Kết Nối Tri Thức
          </span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Khảo sát biến thiên & Tương giao tham số m
          </span>
        </div>

        {/* Real-time Roots Badge & Download Button */}
        <div className="flex items-center gap-2">
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${rootsCount.badge}`}>
            {rootsCount.status}
          </div>

          <button
            onClick={handleDownloadImage}
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
            title="Tải ảnh đồ thị PNG độ phân giải cao"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã lưu!</span>
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

      {/* Main Canvas & Coordinate Grid */}
      <div className="relative w-full flex justify-center bg-white p-2">
        <canvas
          ref={canvasRef}
          width={600}
          height={360}
          className="rounded-xl border border-slate-200 max-w-full h-auto shadow-xs"
        />
      </div>

      {/* Dynamic Parameter Slider Control */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-600" />
            Thanh trượt tương giao tham số <strong className="font-mono text-amber-700 text-sm">m = {paramM.toFixed(2)}</strong>
            <span className="text-slate-500 hidden sm:inline"> (dịch chuyển đường $y = -m$)</span>
          </span>
          <button
            onClick={() => setParamM(0)}
            className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 underline"
          >
            <RefreshCw className="w-3 h-3" /> Đặt lại m = 0
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">{minM}</span>
          <input
            type="range"
            min={minM}
            max={maxM}
            step="0.1"
            value={paramM}
            onChange={(e) => setParamM(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <span className="text-xs font-mono text-slate-400">{maxM}</span>
        </div>
      </div>

      {/* Synchronized Bảng Biến Thiên (BBT) chuẩn SGK KNTT */}
      <div className="p-3.5 bg-white border-t border-slate-200">
        <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          Bảng Biến Thiên (BBT) Chuẩn SGK Kết Nối Tri Thức:
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 text-xs shadow-xs">
          <table className="w-full text-center border-collapse">
            <tbody>
              {/* Row x */}
              <tr className="border-b border-slate-200 bg-slate-50 font-serif">
                <td className="w-16 py-2 px-3 font-bold border-r border-slate-200 text-slate-600 italic">x</td>
                {bbtData?.x?.map((val, idx) => (
                  <td key={idx} className="py-2 px-3 font-semibold text-slate-800">
                    {val === '-\\infty' ? '$-\\infty$' : val === '+\\infty' ? '$+\\infty$' : val}
                  </td>
                )) || (
                  <>
                    <td className="py-2 px-3 text-slate-500">$-\\infty$</td>
                    <td className="py-2 px-3 font-bold text-slate-800">-1</td>
                    <td className="py-2 px-3 font-bold text-slate-800">1</td>
                    <td className="py-2 px-3 text-slate-500">$+\\infty$</td>
                  </>
                )}
              </tr>

              {/* Row y' */}
              <tr className="border-b border-slate-200 font-serif">
                <td className="py-2 px-3 font-bold border-r border-slate-200 text-slate-600 italic">y'</td>
                {bbtData?.yPrime?.map((val, idx) => (
                  <td key={idx} className={`py-2 px-3 font-bold ${val === '+' ? 'text-blue-600' : val === '-' ? 'text-red-600' : 'text-slate-800'}`}>
                    {val}
                  </td>
                )) || (
                  <>
                    <td className="py-2 px-3 font-bold text-blue-600">+</td>
                    <td className="py-2 px-3 font-bold text-slate-800">0</td>
                    <td className="py-2 px-3 font-bold text-red-600">-</td>
                    <td className="py-2 px-3 font-bold text-slate-800">0</td>
                    <td className="py-2 px-3 font-bold text-blue-600">+</td>
                  </>
                )}
              </tr>

              {/* Row y */}
              <tr className="bg-slate-50/50 font-serif">
                <td className="py-4 px-3 font-bold border-r border-slate-200 text-slate-600 italic align-middle">y</td>
                {bbtData?.y?.map((val, idx) => (
                  <td key={idx} className="py-4 px-3 font-bold text-slate-800 align-middle">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800">
                      {val === '-\\infty' ? '$-\\infty$' : val === '+\\infty' ? '$+\\infty$' : val}
                    </span>
                  </td>
                )) || (
                  <>
                    <td className="py-4 px-3 text-slate-400 align-bottom">$-\\infty$</td>
                    <td className="py-4 px-3 font-bold text-red-600 align-top">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-red-50 border border-red-200">
                        2 {paramM !== 0 ? (paramM > 0 ? `+ ${paramM.toFixed(1)}` : `- ${Math.abs(paramM).toFixed(1)}`) : ''}
                      </span>
                    </td>
                    <td className="py-4 px-3 font-bold text-blue-600 align-bottom">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">
                        -2 {paramM !== 0 ? (paramM > 0 ? `+ ${paramM.toFixed(1)}` : `- ${Math.abs(paramM).toFixed(1)}`) : ''}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-slate-400 align-top">$+\\infty$</td>
                  </>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CalculusViewer;
