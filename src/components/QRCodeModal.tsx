import React from 'react';
import { QrCode, Smartphone, X, ExternalLink, ShieldCheck, Box } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  topic: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  title,
  topic,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 flex flex-col items-center text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
          <Box className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Mã QR / AR Mô hình Thực Tế Ảo</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Học sinh và giáo viên quét mã để trải nghiệm tương tác không gian 3D trực tiếp trên bàn học qua công nghệ WebXR / AR.
        </p>

        {/* QR Code SVG Display */}
        <div className="p-4 bg-white rounded-xl border-2 border-dashed border-blue-200 shadow-inner flex flex-col items-center mb-4">
          <svg className="w-48 h-48" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="160" height="160" fill="#ffffff" rx="8" />
            {/* Finder pattern Top-Left */}
            <rect x="15" y="15" width="40" height="40" fill="#0f172a" rx="4" />
            <rect x="23" y="23" width="24" height="24" fill="#ffffff" rx="2" />
            <rect x="29" y="29" width="12" height="12" fill="#2563eb" rx="1" />

            {/* Finder pattern Top-Right */}
            <rect x="105" y="15" width="40" height="40" fill="#0f172a" rx="4" />
            <rect x="113" y="23" width="24" height="24" fill="#ffffff" rx="2" />
            <rect x="119" y="29" width="12" height="12" fill="#2563eb" rx="1" />

            {/* Finder pattern Bottom-Left */}
            <rect x="15" y="105" width="40" height="40" fill="#0f172a" rx="4" />
            <rect x="23" y="113" width="24" height="24" fill="#ffffff" rx="2" />
            <rect x="29" y="119" width="12" height="12" fill="#2563eb" rx="1" />

            {/* Simulated Data Matrix dots */}
            <rect x="65" y="20" width="8" height="8" fill="#0f172a" />
            <rect x="80" y="20" width="8" height="8" fill="#0f172a" />
            <rect x="65" y="35" width="8" height="8" fill="#2563eb" />
            <rect x="80" y="45" width="8" height="8" fill="#0f172a" />
            <rect x="70" y="60" width="8" height="8" fill="#0f172a" />
            <rect x="85" y="60" width="8" height="8" fill="#2563eb" />
            <rect x="100" y="70" width="8" height="8" fill="#0f172a" />
            <rect x="120" y="70" width="8" height="8" fill="#0f172a" />
            <rect x="135" y="85" width="8" height="8" fill="#2563eb" />
            <rect x="65" y="90" width="8" height="8" fill="#0f172a" />
            <rect x="80" y="105" width="8" height="8" fill="#2563eb" />
            <rect x="95" y="105" width="8" height="8" fill="#0f172a" />
            <rect x="115" y="120" width="8" height="8" fill="#0f172a" />
            <rect x="130" y="120" width="8" height="8" fill="#0f172a" />
            <rect x="70" y="135" width="8" height="8" fill="#2563eb" />
            <rect x="90" y="135" width="8" height="8" fill="#0f172a" />

            {/* Center Logo */}
            <circle cx="80" cy="80" r="14" fill="#2563eb" />
            <text x="80" y="85" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">AR</text>
          </svg>
          <span className="text-[11px] font-mono text-slate-400 mt-2">
            Mã định danh AR: mathed-xyz-{topic}
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left w-full text-xs text-slate-600 mb-4 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            Hướng dẫn cho học sinh:
          </div>
          <p>1. Mở camera điện thoại (iOS hoặc Android) và quét mã QR trên.</p>
          <p>2. Chạm &quot;Xem trong không gian thực&quot; để đặt mô hình 3D lên mặt bàn học.</p>
          <p>3. Di chuyển quanh bàn để quan sát thiết diện và các góc vuông 3 chiều sống động.</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition"
        >
          Đóng cửa sổ
        </button>
      </div>
    </div>
  );
};

export default QRCodeModal;
