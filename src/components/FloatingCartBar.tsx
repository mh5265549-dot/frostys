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
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 animate-slideUp">
      <div className="bg-[#241310] text-white p-3.5 sm:p-4 rounded-3xl shadow-2xl border-2 border-[#FF4B72]/40 max-w-lg mx-auto sm:w-[420px] flex flex-col gap-2.5 backdrop-blur-xl">
        
        {/* Main Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Cart Info */}
          <div className="flex items-center gap-3">
            <div className="relative cursor-pointer" onClick={onOpenOrderModal}>
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg shadow-md ${
                  isGrill
                    ? 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white'
                    : 'bg-gradient-to-tr from-[#FF4B72] to-[#FF85A1] text-white'
                }`}
              >
                <i className="fa-solid fa-cart-shopping"></i>
              </div>
              <span className="absolute -top-1.5 -right-1.5 bg-[#38D39F] text-[#2D1B18] text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                {totalItems}
              </span>
            </div>

            <div className="cursor-pointer" onClick={onOpenOrderModal}>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-amber-200/80 font-bold uppercase tracking-wider block">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in Cart
                </span>
                {hasGrillItems && hasIceCreamItems && (
                  <span className="text-[9px] bg-white/20 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                    Mixed Order
                  </span>
                )}
              </div>
              <span className="font-heading font-black text-lg text-white">
                Rs. {subtotal}
              </span>
            </div>
          </div>

          {/* Right: WhatsApp Checkout Trigger */}
          <button
            onClick={onOpenOrderModal}
            id="btn-floating-cart-checkout"
            className="py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <i className="fa-brands fa-whatsapp text-lg"></i>
            <span>Review & Order</span>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        </div>

        {/* Cross-Shop Post-Purchase Suggestion Prompt */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
          {isGrill ? (
            <button
              onClick={() => onSwitchShop('ice-cream')}
              className="text-pink-300 hover:text-pink-200 font-bold flex items-center gap-1.5 text-[11px] group cursor-pointer transition-colors"
            >
              <i className="fa-solid fa-ice-cream text-pink-400 group-hover:scale-110 transition-transform"></i>
              <span>Want dessert after burgers? <span className="underline decoration-pink-400">Switch to Frosty's Ice Cream</span></span>
              <i className="fa-solid fa-arrow-right text-[9px] group-hover:translate-x-0.5 transition-transform"></i>
            </button>
          ) : (
            <button
              onClick={() => onSwitchShop('grill')}
              className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1.5 text-[11px] group cursor-pointer transition-colors"
            >
              <i className="fa-solid fa-fire text-amber-400 group-hover:scale-110 transition-transform"></i>
              <span>Hungry for fast food too? <span className="underline decoration-amber-400">Switch to Frosty's Grill</span></span>
              <i className="fa-solid fa-arrow-right text-[9px] group-hover:translate-x-0.5 transition-transform"></i>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
