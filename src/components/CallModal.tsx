import React from 'react';
import { STORE_INFO } from '../data/menuData';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white text-stone-900 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-stone-200 relative animate-scaleUp text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-base"></i>
        </button>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF4B72] to-[#FF85A1] text-white flex items-center justify-center text-2xl mx-auto shadow-xs">
          <i className="fa-solid fa-phone"></i>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-heading font-black text-xl text-stone-900">
            Contact Frosty's & Grill
          </h3>
          <p className="text-xs text-stone-500">
            8B Commercial, Green City, Lahore, Pakistan
          </p>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Open Today: 4:00 PM – 2:00 AM
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          {/* Grill Hotline */}
          <a
            href="tel:03254826051"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm transition-transform active:scale-98 shadow-xs flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-fire text-amber-100"></i>
            <span>Call Grill Hotline: 0325 4826051</span>
          </a>

          {/* Phone Call Link */}
          <a
            href={`tel:${STORE_INFO.phone}`}
            className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm transition-transform active:scale-98 shadow-xs flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-phone-flip text-[#FF4B72]"></i>
            <span>Call Parlour: {STORE_INFO.phone}</span>
          </a>

          {/* WhatsApp Direct */}
          <a
            href={`https://wa.me/${STORE_INFO.whatsapp}?text=Hi%20Frosty's!%20I'd%20like%20to%20place%20an%20order.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm transition-transform active:scale-98 shadow-xs flex items-center justify-center gap-2"
          >
            <i className="fa-brands fa-whatsapp text-base"></i>
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        <p className="text-[11px] text-stone-400">
          Our team is ready to prepare your hot grill meals & late-night desserts!
        </p>

      </div>
    </div>
  );
};
