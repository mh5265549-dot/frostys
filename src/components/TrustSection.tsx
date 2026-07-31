import React from 'react';
import { STORE_INFO } from '../data/menuData';

export const TrustSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-[#2D1B18] to-[#221311] text-amber-50 py-10 border-t border-b border-[#3D2522]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 1. Estimated Delivery Time */}
          <div className="bg-[#3D2522]/60 backdrop-blur-sm p-5 rounded-2xl border border-[#5A3833] flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF4B72]/20 border border-[#FF4B72]/30 text-[#FF4B72] flex items-center justify-center shrink-0 text-xl font-bold">
              <i className="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-sm text-white mb-1">
                Fast 30-Min Delivery
              </h4>
              <p className="text-xs text-amber-100/80 leading-relaxed">
                Prompt dispatch across Green City & nearby sectors. Open 4 PM – 2 AM daily!
              </p>
            </div>
          </div>

          {/* 2. Physical Location */}
          <div className="bg-[#3D2522]/60 backdrop-blur-sm p-5 rounded-2xl border border-[#5A3833] flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#38D39F]/20 border border-[#38D39F]/30 text-[#38D39F] flex items-center justify-center shrink-0 text-xl font-bold">
              <i className="fa-solid fa-location-dot"></i>
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-sm text-white mb-1">
                Physical Store
              </h4>
              <p className="text-xs text-amber-100/80 leading-relaxed">
                Visit us at <strong>{STORE_INFO.address}</strong>. Dine-in, takeaway & delivery.
              </p>
            </div>
          </div>

          {/* 3. Payment Methods */}
          <div className="bg-[#3D2522]/60 backdrop-blur-sm p-5 rounded-2xl border border-[#5A3833] flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 text-xl font-bold">
              <i className="fa-solid fa-wallet"></i>
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-sm text-white mb-1">
                Flexible Payment
              </h4>
              <p className="text-xs text-amber-100/80 leading-relaxed">
                Cash on Delivery (COD), JazzCash, EasyPaisa, & Bank Transfer accepted.
              </p>
            </div>
          </div>

          {/* 4. Direct WhatsApp Checkout */}
          <div className="bg-[#3D2522]/60 backdrop-blur-sm p-5 rounded-2xl border border-[#5A3833] flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] flex items-center justify-center shrink-0 text-xl font-bold">
              <i className="fa-brands fa-whatsapp"></i>
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-sm text-white mb-1">
                Direct WhatsApp Order
              </h4>
              <p className="text-xs text-amber-100/80 leading-relaxed">
                No app commission. Your cart dispatches straight to store owner chat!
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
