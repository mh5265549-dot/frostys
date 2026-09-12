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
    <div className="fixed bottom-24 sm:bottom-6 left-4 z-40 animate-slideUp">
      <button
        onClick={() => onSwitchShop(targetShop)}
        id="btn-floating-shop-switch"
        title={
          isGrill
            ? "Switch to Frosty's Ice Cream & Desserts"
            : "Switch to Frosty's Grill (Burgers & BBQ)"
        }
        className={`group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 ${
          isGrill
            ? 'bg-[#1C101F] text-white border-[#FF4B72]/60 hover:border-[#FF4B72] shadow-pink-950/60'
            : 'bg-[#1E0D08] text-white border-orange-500/60 hover:border-orange-500 shadow-orange-950/60'
        }`}
      >
        {/* Glow Effect */}
        <span
          className={`absolute -inset-1 rounded-2xl opacity-40 blur-md group-hover:opacity-75 transition-opacity ${
            isGrill ? 'bg-gradient-to-r from-[#FF4B72] to-[#38D39F]' : 'bg-gradient-to-r from-amber-500 to-rose-600'
          }`}
        ></span>

        {/* Icon Emblem */}
        <span
          className={`relative w-8 h-8 rounded-xl flex items-center justify-center text-lg font-bold shadow-md shrink-0 ${
            isGrill
              ? 'bg-gradient-to-tr from-[#FF4B72] to-[#FF85A1] text-white'
              : 'bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 text-white'
          }`}
        >
          {isGrill ? (
            <i className="fa-solid fa-ice-cream animate-bounce"></i>
          ) : (
            <i className="fa-solid fa-fire-flame-curved animate-pulse"></i>
          )}
        </span>

        {/* Label and Hint */}
        <div className="relative text-left leading-tight pr-1">
          <span className="text-[10px] uppercase font-extrabold tracking-wider block opacity-80">
            {isGrill ? 'Craving Dessert?' : 'Hungry for Fast Food?'}
          </span>
          <span className="font-heading font-black text-xs sm:text-sm text-white flex items-center gap-1.5">
            {isGrill ? "Go to Frosty's 🍦" : "Go to Frosty's Grill 🔥"}
            <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
          </span>
        </div>
      </button>
    </div>
  );
};
