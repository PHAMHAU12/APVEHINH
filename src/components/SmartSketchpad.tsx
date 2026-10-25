import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Eraser, RotateCcw, Sparkles, Check, Square, Triangle } from 'lucide-react';

interface SmartSketchpadProps {
  onSketchRecognized: (description: string) => void;
  onClose?: () => void;
}

export const SmartSketchpad: React.FC<SmartSketchpadProps> = ({
  onSketchRecognized,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'line'>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid dots
    ctx.fillStyle = '#e2e8f0';
    for (let x = 15; x < canvas.width; x += 25) {
      for (let y = 15; y < canvas.height; y += 25) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
    saveState();
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setStrokeHistory((prev) => [...prev.slice(-15), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const undo = () => {
    if (strokeHistory.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...strokeHistory];
    newHistory.pop(); // remove current
    const previous = newHistory[newHistory.length - 1];
    ctx.putImageData(previous, 0, 0);
    setStrokeHistory(newHistory);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Subtle grid dots
    ctx.fillStyle = '#e2e8f0';
    for (let x = 15; x < canvas.width; x += 25) {
      for (let y = 15; y < canvas.height; y += 25) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
    saveState();
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCoordinates(e);
    startPosRef.current = pos;
    setIsDrawing(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getCoordinates(e);

    if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'pen') {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveState();
  };

  // Draw quick preset templates
  const loadPreset = (type: 'pyramid' | 'calculus' | 'prism') => {
    clearCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#0f172a';

    if (type === 'pyramid') {
      // S.ABCD pyramid sketch
      // Base
      ctx.beginPath();
      ctx.moveTo(70, 190);
      ctx.lineTo(240, 190);
      ctx.lineTo(340, 240);
      ctx.lineTo(170, 240);
      ctx.closePath();
      ctx.stroke();

      // Apex S
      const Sx = 200, Sy = 60;
      ctx.fillText('S', Sx - 4, Sy - 10);
      ctx.fillText('A', 55, 195);
      ctx.fillText('B', 245, 190);
      ctx.fillText('C', 350, 245);
      ctx.fillText('D', 160, 255);

      // Edges to S
      ctx.beginPath();
      ctx.moveTo(Sx, Sy); ctx.lineTo(70, 190);
      ctx.moveTo(Sx, Sy); ctx.lineTo(240, 190);
      ctx.moveTo(Sx, Sy); ctx.lineTo(340, 240);
      ctx.moveTo(Sx, Sy); ctx.lineTo(170, 240);
      ctx.stroke();

      // Plane MNP cut
      ctx.strokeStyle = '#0284c7';
      ctx.fillStyle = 'rgba(2, 132, 199, 0.2)';
      ctx.beginPath();
      ctx.moveTo(135, 125); // M on SA
      ctx.lineTo(220, 125); // N on SB
      ctx.lineTo(270, 150); // P on SC
      ctx.lineTo(185, 150); // Q on SD
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0284c7';
      ctx.fillText('M', 115, 125);
      ctx.fillText('N', 230, 125);
      ctx.fillText('P', 280, 155);
      saveState();
      onSketchRecognized('Hình chóp S.ABCD có mặt phẳng (MNP) cắt các cạnh bên SA, SB, SC tại M, N, P. Tìm thiết diện.');
    } else if (type === 'calculus') {
      // Coordinate axes
      ctx.beginPath();
      ctx.moveTo(40, 150); ctx.lineTo(360, 150); // Ox
      ctx.moveTo(200, 260); ctx.lineTo(200, 30); // Oy
      ctx.stroke();
      ctx.fillText('x', 365, 155);
      ctx.fillText('y', 205, 30);
      ctx.fillText('O', 188, 166);

      // Cubic curve
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(80, 240);
      ctx.bezierCurveTo(120, 30, 170, 40, 200, 150);
      ctx.bezierCurveTo(230, 260, 280, 270, 320, 50);
      ctx.stroke();

      // Line y = m
      ctx.strokeStyle = '#d97706';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(40, 110); ctx.lineTo(360, 110);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#d97706';
      ctx.fillText('y = m', 50, 100);
      saveState();
      onSketchRecognized('Đồ thị hàm số bậc 3 y = x^3 - 3x và đường thẳng y = m. Biện luận số giao điểm theo tham số m.');
    }
  };

  const handleRecognize = () => {
    onSketchRecognized('Phác thảo hình học không gian chóp S.ABCD và mặt phẳng cắt qua các điểm trung điểm cạnh bên.');
    if (onClose) onClose();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="font-bold text-slate-800 text-sm">Phác thảo Thông minh (Smart Sketchpad)</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Mẫu dựng nhanh:</span>
          <button
            onClick={() => loadPreset('pyramid')}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition font-medium"
          >
            Chóp S.ABCD
          </button>
          <button
            onClick={() => loadPreset('calculus')}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition font-medium"
          >
            Đồ thị bậc 3
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-white flex justify-center">
        <canvas
          ref={canvasRef}
          width={400}
          height={260}
          className="cursor-crosshair w-full max-w-[400px] h-[260px] touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTool('pen')}
            className={`p-1.5 rounded transition ${
              tool === 'pen' ? 'bg-purple-100 text-purple-700 font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Bút vẽ"
          >
            <PenTool className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-1.5 rounded transition ${
              tool === 'eraser' ? 'bg-purple-100 text-purple-700 font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Tẩy"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={undo}
            className="p-1.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
            title="Hoàn tác"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={clearCanvas}
            className="px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
          >
            Xóa bảng
          </button>
        </div>

        <button
          onClick={handleRecognize}
          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center gap-1 shadow-sm transition"
        >
          <Check className="w-3.5 h-3.5" />
          Chuyển sang MathEd Giải
        </button>
      </div>
    </div>
  );
};

export default SmartSketchpad;
