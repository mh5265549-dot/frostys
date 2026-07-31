import React from 'react';
import { CartItem } from '../types';

interface FloatingCartBarProps {
  cart: CartItem[];
  onOpenOrderModal: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  cart,
  onOpenOrderModal,
}) => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 animate-slideUp">
      <div className="bg-[#2D1B18] text-white p-4 rounded-2xl shadow-2xl border-2 border-[#FF4B72]/40 max-w-lg mx-auto sm:w-96 flex items-center justify-between gap-4 backdrop-blur-lg">
        
        {/* Left: Cart Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-[#FF4B72] text-white flex items-center justify-center font-bold text-lg shadow-md">
              <i className="fa-solid fa-cart-shopping"></i>
            </div>
            <span className="absolute -top-1.5 -right-1.5 bg-[#38D39F] text-[#2D1B18] text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
              {totalItems}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-amber-200/80 font-semibold uppercase tracking-wider block">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in Cart
            </span>
            <span className="font-heading font-black text-lg text-white">
              Rs. {subtotal}
            </span>
          </div>
        </div>

        {/* Right: WhatsApp Checkout Trigger */}
        <button
          onClick={onOpenOrderModal}
          id="btn-floating-cart-checkout"
          className="py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 shrink-0 hover:scale-105 active:scale-95"
        >
          <i className="fa-brands fa-whatsapp text-lg"></i>
          <span>Checkout</span>
          <i className="fa-solid fa-chevron-right text-[10px]"></i>
        </button>

      </div>
    </div>
  );
};
