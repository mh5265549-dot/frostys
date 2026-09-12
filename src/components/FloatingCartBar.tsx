import React from 'react';
import { CartItem, ShopMode } from '../types';

interface FloatingCartBarProps {
  cart: CartItem[];
  onOpenOrderModal: () => void;
  activeShop: ShopMode;
  onSwitchShop: (shop: ShopMode) => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  cart,
  onOpenOrderModal,
  activeShop,
  onSwitchShop,
}) => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  if (totalItems === 0) return null;

  const isGrill = activeShop === 'grill';
  const hasGrillItems = cart.some((c) => c.menuItem.category === 'fast-food-bbq');
  const hasIceCreamItems = cart.some((c) => c.menuItem.category !== 'fast-food-bbq');

  return (
    <aside aria-label="Active order summary" className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-40 animate-slideUp">
      <div className="bg-white/98 text-stone-900 p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 max-w-lg mx-auto sm:w-[400px] flex flex-col gap-2 backdrop-blur-md">
        
        {/* Main Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Cart Info */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative cursor-pointer" onClick={onOpenOrderModal}>
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base shadow-xs text-white ${
                  isGrill
                    ? 'bg-gradient-to-tr from-amber-500 to-orange-600'
                    : 'bg-gradient-to-tr from-[#FF4B72] to-[#FF85A1]'
                }`}
              >
                <i className="fa-solid fa-cart-shopping text-sm"></i>
              </div>
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            </div>

            <div className="cursor-pointer" onClick={onOpenOrderModal}>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in Cart
                </span>
                {hasGrillItems && hasIceCreamItems && (
                  <span className="text-[9px] bg-orange-100 text-orange-800 font-extrabold px-1.5 py-0.2 rounded-full">
                    Mixed
                  </span>
                )}
              </div>
              <span className="font-heading font-black text-base sm:text-lg text-stone-900">
                Rs. {subtotal}
              </span>
            </div>
          </div>

          {/* Right: Review & Order Trigger */}
          <button
            onClick={onOpenOrderModal}
            id="btn-floating-cart-checkout"
            className="py-2.5 px-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <i className="fa-brands fa-whatsapp text-base"></i>
            <span>Checkout</span>
            <i className="fa-solid fa-chevron-right text-[9px]"></i>
          </button>
        </div>

        {/* Cross-Shop Post-Purchase Suggestion Prompt */}
        <div className="pt-1.5 border-t border-stone-100 flex items-center justify-between text-xs">
          {isGrill ? (
            <button
              onClick={() => onSwitchShop('ice-cream')}
              className="text-[#FF4B72] hover:text-[#E63956] font-bold flex items-center gap-1 text-[11px] group cursor-pointer transition-colors"
            >
              <i className="fa-solid fa-ice-cream text-[#FF4B72]"></i>
              <span>Want dessert with burgers? <strong className="underline decoration-[#FF4B72]">Switch to Ice Cream</strong></span>
              <i className="fa-solid fa-arrow-right text-[8px] group-hover:translate-x-0.5 transition-transform"></i>
            </button>
          ) : (
            <button
              onClick={() => onSwitchShop('grill')}
              className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 text-[11px] group cursor-pointer transition-colors"
            >
              <i className="fa-solid fa-fire text-orange-500"></i>
              <span>Hungry for fast food too? <strong className="underline decoration-orange-500">Switch to Grill</strong></span>
              <i className="fa-solid fa-arrow-right text-[8px] group-hover:translate-x-0.5 transition-transform"></i>
            </button>
          )}
        </div>

      </div>
    </aside>
  );
};
