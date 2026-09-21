import React from 'react';
import { CartItem } from '../types';

interface FloatingCartBarProps {
  cart: CartItem[];
  onOpenOrderModal: () => void;
  activeShop?: string;
  onSwitchShop?: (shop: any) => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  cart,
  onOpenOrderModal,
}) => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  if (totalItems === 0) return null;

  return (
    <aside aria-label="Active order summary" className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-40 animate-slideUp">
      <div className="bg-white/98 text-stone-900 p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-200 max-w-lg mx-auto sm:w-[380px] flex flex-col gap-2 backdrop-blur-md">
        
        {/* Main Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Cart Info */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative cursor-pointer" onClick={onOpenOrderModal}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base shadow-xs text-white bg-blue-600">
                <i className="fa-solid fa-cart-shopping text-sm"></i>
              </div>
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            </div>

            <div className="cursor-pointer" onClick={onOpenOrderModal}>
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in Cart
              </span>
              <span className="font-heading font-black text-base sm:text-lg text-stone-900">
                Rs. {subtotal}
              </span>
            </div>
          </div>

          {/* Right: Review & Order Trigger */}
          <button
            onClick={onOpenOrderModal}
            id="btn-floating-cart-checkout"
            className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <i className="fa-brands fa-whatsapp text-base"></i>
            <span>Order</span>
            <i className="fa-solid fa-chevron-right text-[9px]"></i>
          </button>
        </div>

      </div>
    </aside>
  );
};
