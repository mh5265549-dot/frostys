import React from 'react';
import { ShopMode } from '../types';

interface FloatingShopSwitcherProps {
  activeShop: ShopMode;
  onSwitchShop: (target: ShopMode) => void;
}

export const FloatingShopSwitcher: React.FC<FloatingShopSwitcherProps> = ({
  activeShop,
  onSwitchShop,
}) => {
  const isGrill = activeShop === 'grill';
  const targetShop: ShopMode = isGrill ? 'ice-cream' : 'grill';

  return (
    <aside aria-label="Quick Shop Switcher" className="fixed bottom-24 sm:bottom-6 left-4 z-40 animate-slideUp">
      <button
        onClick={() => onSwitchShop(targetShop)}
        id="btn-floating-shop-switch"
        type="button"
        title={
          isGrill
            ? "Switch to Frosty's Ice Cream & Desserts"
            : "Switch to Frosty's Grill (Burgers & BBQ)"
        }
        className={`group relative flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 border cursor-pointer ${
          isGrill
            ? 'bg-white text-stone-900 border-pink-200 hover:border-pink-400'
            : 'bg-white text-stone-900 border-orange-200 hover:border-orange-400'
        }`}
      >
        {/* Icon Emblem */}
        <span
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold shadow-xs shrink-0 ${
            isGrill
              ? 'bg-gradient-to-tr from-[#FF4B72] to-[#FF85A1] text-white'
              : 'bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 text-white'
          }`}
        >
          {isGrill ? (
            <i className="fa-solid fa-ice-cream"></i>
          ) : (
            <i className="fa-solid fa-fire-flame-curved"></i>
          )}
        </span>

        {/* Label and Hint */}
        <div className="text-left leading-tight pr-1">
          <span className="text-[10px] uppercase font-extrabold tracking-wider block text-stone-400">
            {isGrill ? 'Craving Ice Cream?' : 'Craving Charcoal Grill?'}
          </span>
          <span className="font-heading font-black text-xs sm:text-sm text-stone-900 flex items-center gap-1.5">
            {isGrill ? (
              <span className="text-[#FF4B72]">Go to Frosty's 🍦</span>
            ) : (
              <span className="text-orange-600">Go to Grill 🔥</span>
            )}
            <i className="fa-solid fa-arrow-right text-[10px] text-stone-400 group-hover:translate-x-0.5 transition-transform"></i>
          </span>
        </div>
      </button>
    </aside>
  );
};
