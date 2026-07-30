import React from 'react';
import { STORE_INFO } from '../data/menuData';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white text-[#2D1B18] rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-stone-200 relative animate-scaleUp text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF4B72] to-[#FF85A1] text-white flex items-center justify-center text-2xl mx-auto shadow-lg">
          <i className="fa-solid fa-phone"></i>
        </div>

        <div className="space-y-2">
          <h3 className="font-heading font-black text-2xl text-[#2D1B18]">
            Contact Frosty's
          </h3>
          <p className="text-xs text-stone-600">
            8B Commercial, Green City, Lahore, Pakistan
          </p>
          <div className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full">
            <i className="fa-solid fa-clock mr-1"></i>
            Open Today: 4:00 PM – 2:00 AM
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {/* Phone Call Link */}
          <a
            href={`tel:${STORE_INFO.phone}`}
            className="w-full py-4 rounded-2xl bg-[#2D1B18] hover:bg-[#FF4B72] text-white font-bold text-base transition-colors shadow-lg flex items-center justify-center gap-3"
          >
            <i className="fa-solid fa-phone-flip text-[#FF4B72] group-hover:text-white"></i>
            <span>Call {STORE_INFO.phone}</span>
          </a>

          {/* WhatsApp Direct */}
          <a
            href={`https://wa.me/${STORE_INFO.whatsapp}?text=Hi%20Frosty's!%20I'd%20like%20to%20place%20an%20order.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-3"
          >
            <i className="fa-brands fa-whatsapp text-lg"></i>
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        <p className="text-[11px] text-stone-400">
          Our team is ready to take your late-night dessert orders & table reservations!
        </p>

      </div>
    </div>
  );
};
