import React from 'react';
import { motion } from 'motion/react';

interface FloatingHelperButtonProps {
  onClick: () => void;
}

export const FloatingHelperButton: React.FC<FloatingHelperButtonProps> = ({ onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      id="btn-floating-helper-ai"
      className="fixed bottom-20 sm:bottom-6 left-4 z-40 bg-gradient-to-r from-[#2D1B18] via-[#3A1F26] to-[#2D1B18] text-white hover:from-[#3D2522] hover:to-[#4D202C] border-2 border-[#FF4B72] px-4 py-3 rounded-full shadow-2xl transition-all duration-200 flex items-center gap-3 group"
      title="Ask Helper AI / شاپ اسسٹنٹ (Bilingual Guide for Easy Ordering)"
    >
      <div className="relative flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF4B72] to-[#FF85A1] flex items-center justify-center text-white text-sm shadow-md group-hover:rotate-12 transition-transform">
          <i className="fa-solid fa-headset"></i>
        </div>
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#2D1B18] animate-ping" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#2D1B18]" />
      </div>

      <div className="flex flex-col text-left">
        <span className="text-xs font-black text-white tracking-wide flex items-center gap-1.5">
          Ask Helper AI
          <span className="text-[9px] bg-[#FF4B72] text-white px-1.5 py-0.2 rounded-full font-bold">
            24/7
          </span>
        </span>
        <span className="text-[10px] text-amber-300 font-semibold leading-tight">
          شاپ اسسٹنٹ (اردو / Eng)
        </span>
      </div>
    </motion.button>
  );
};
