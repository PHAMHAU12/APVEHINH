import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ExternalLink,
  CheckCircle2,
  Cpu,
  Sparkles,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  AI_MODELS,
  getStoredApiKey,
  setStoredApiKey,
  getStoredModel,
  setStoredModel,
} from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  isInitialRequired?: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  isInitialRequired = false,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setSelectedModel(getStoredModel());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(apiKey.trim());
    setStoredModel(selectedModel);
    setSavedSuccess(true);
    setTimeout(() => {
      onSaved?.();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Thiết Lập Gemini API Key & Model AI
              </h2>
              <p className="text-xs text-slate-400">
                HỖ TRỢ VẼ HÌNH _ PHẠM HẬU • SGK Toán Kết Nối Tri Thức
              </p>
            </div>
          </div>

          {!isInitialRequired && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          {/* Important instructions */}
          <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-blue-200 text-xs">
                Thầy/Cô chưa có API Key của Google?
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                API Key hoàn toàn <strong>miễn phí 100%</strong> từ Google AI Studio. Thầy/Cô chỉ cần đăng nhập tài khoản Google và bấm "Create API key".
              </p>
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold underline text-xs mt-1"
              >
                <span>Nhấn vào đây để lấy Gemini API Key miễn phí</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Model Selection Cards */}
          <div>
            <label className="block font-bold text-slate-200 mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Chọn Mô hình AI xử lý chính:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {AI_MODELS.map((model) => (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    selectedModel === model.id
                      ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500 text-white'
                      : 'bg-slate-800/60 border-slate-700/70 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[11px] text-white">
                        {model.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {model.desc}
                    </p>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-700/80 text-blue-300 font-mono">
                      {model.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <label className="block font-bold text-slate-200 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-400" />
                Dán Gemini API Key của Thầy/Cô:
              </span>
              {apiKey && (
                <span className="text-[11px] text-emerald-400 font-normal flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Key hợp lệ
                </span>
              )}
            </label>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Khóa API được lưu an toàn trong trình duyệt (LocalStorage) của Thầy/Cô và không gửi đi đâu khác.
            </p>
          </div>

          {/* Automatic Fallback Note */}
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Cơ chế tự động dự phòng:</strong> Khi một model bị giới hạn quota (lỗi 429), hệ thống tự động đổi sang model tiếp theo để không ngắt quãng bài giảng.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          {isInitialRequired ? (
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Dùng thử chế độ Offline (Không cần key)
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Đóng
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Đã lưu thành công!</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Lưu Cấu Hình & Bắt Đầu Vẽ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
