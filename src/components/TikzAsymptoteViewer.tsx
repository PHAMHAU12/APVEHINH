import React, { useState } from 'react';
import { Code2, Copy, Check, Download, Terminal, FileCode2 } from 'lucide-react';

interface TikzAsymptoteViewerProps {
  tikzCode: string;
  asymptoteCode: string;
}

export const TikzAsymptoteViewer: React.FC<TikzAsymptoteViewerProps> = ({
  tikzCode,
  asymptoteCode,
}) => {
  const [activeTab, setActiveTab] = useState<'tikz' | 'asymptote'>('tikz');
  const [copied, setCopied] = useState(false);

  const currentCode = activeTab === 'tikz' ? tikzCode : asymptoteCode;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  const handleDownload = () => {
    const filename = activeTab === 'tikz' ? 'HinhVe_PhamHau.tex' : 'HinhVe_PhamHau.asy';
    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-xl overflow-hidden font-mono text-xs">
      {/* Top Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-sans font-bold text-slate-200">Xuất Mã Đồ Họa Vector (LaTeX):</span>
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 font-sans">
            <button
              onClick={() => setActiveTab('tikz')}
              className={`px-3 py-1 rounded-md transition font-medium flex items-center gap-1.5 ${
                activeTab === 'tikz'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              Mã TikZ (Gói KNTT)
            </button>
            <button
              onClick={() => setActiveTab('asymptote')}
              className={`px-3 py-1 rounded-md transition font-medium flex items-center gap-1.5 ${
                activeTab === 'asymptote'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Mã Asymptote 3D
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 font-sans">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
            title="Sao chép toàn bộ mã vào clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Đã sao chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép mã</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 font-bold"
            title={`Tải xuống file .${activeTab === 'tikz' ? 'tex' : 'asy'}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải file .{activeTab === 'tikz' ? 'tex' : 'asy'}</span>
          </button>
        </div>
      </div>

      {/* Code Editor Preview Box */}
      <div className="relative p-4 max-h-72 overflow-y-auto bg-slate-950 font-mono text-[11px] leading-relaxed text-emerald-300 selection:bg-emerald-900 selection:text-white">
        <pre className="whitespace-pre-wrap">{currentCode}</pre>
      </div>

      <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-sans">
        <span>Gợi ý: Thầy/Cô có thể dán trực tiếp mã TikZ vào Overleaf hoặc Texmaker (pdflatex) để in ấn đề thi chất lượng cao.</span>
      </div>
    </div>
  );
};

export default TikzAsymptoteViewer;
