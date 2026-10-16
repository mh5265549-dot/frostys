import React, { useState, useRef } from 'react';
import { useBrandLogo, DEFAULT_LOGO_URL } from '../utils/logoStorage';

interface LogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoUploadModal: React.FC<LogoUploadModalProps> = ({ isOpen, onClose }) => {
  const { logoUrl, isCustom, setLogo, resetLogo } = useBrandLogo();
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    // Limit to reasonable size for base64 storage in localStorage (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size is too large (max 5MB). Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setLogo(result);
        setSuccessMsg('Logo updated successfully! Changes are applied across the entire site.');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file. Please try another one.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleUseOfficial = () => {
    resetLogo();
    setSuccessMsg('Set to official Frosty\'s Ice Cream & Grill emblem.');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logo-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1A4B8E] via-[#245CA6] to-[#10305C] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <i className="fa-solid fa-camera-rotate text-lg text-[#70B9F7]"></i>
            </div>
            <div>
              <h3 id="logo-modal-title" className="font-heading font-black text-lg tracking-tight">
                Update Brand Logo
              </h3>
              <p className="text-xs text-blue-100">
                Upload your exact restaurant logo or emblem
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close dialog"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Active Preview */}
          <div className="flex flex-col items-center justify-center p-4 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Current Active Logo
            </span>
            <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-lg border-2 border-[#1A4B8E] bg-white p-0.5">
              <img
                src={logoUrl}
                alt="Current Frosty's Logo"
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-xs font-medium text-stone-600 mt-2">
              {isCustom ? 'Custom Uploaded Logo' : "Frosty's Ice Cream Parlour & Grill Official Emblem"}
            </span>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation shrink-0"></i>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
              <i className="fa-solid fa-circle-check shrink-0"></i>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Drag & Drop Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-[#1A4B8E] bg-blue-50/50'
                : 'border-stone-300 hover:border-[#70B9F7] hover:bg-stone-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-[#1A4B8E] flex items-center justify-center mb-3">
              <i className="fa-solid fa-cloud-arrow-up text-xl"></i>
            </div>
            <p className="font-bold text-sm text-stone-800">
              Click to browse or drag & drop your logo
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Supports PNG, JPG, WebP, SVG (Square 1:1 works best)
            </p>
          </div>

          {/* Preset / Reset Controls */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={handleUseOfficial}
              className="flex-1 py-2 px-3 text-xs font-bold rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <i className="fa-solid fa-certificate text-[#1A4B8E]"></i>
              <span>Use Official Logo</span>
            </button>

            {isCustom && (
              <button
                type="button"
                onClick={resetLogo}
                className="py-2 px-3 text-xs font-bold rounded-xl text-[#1A4B8E] hover:bg-blue-50 transition-colors"
              >
                Reset Default
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
