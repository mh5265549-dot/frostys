import React, { useState } from 'react';
import { motion } from 'motion/react';

interface FloatingHelperButtonProps {
  onClick: () => void;
}

export const FloatingHelperButton: React.FC<FloatingHelperButtonProps> = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 z-40 flex items-center">
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        id="btn-floating-helper-ai"
        className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-[#2D1B18] via-[#FF4B72] to-[#FF85A1] text-white shadow-xl hover:shadow-2xl border-2 border-white/80 flex items-center justify-center transition-all duration-200 group focus:outline-none"
        title="Ask Helper AI (شاپ اسسٹنٹ)"
        aria-label="Open Helper AI"
      >
        <i className="fa-solid fa-headset text-lg text-white group-hover:rotate-12 transition-transform"></i>
        
        {/* Compact AI Badge */}
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[9px] border border-[#2D1B18] shadow">
          AI
        </span>
      </motion.button>

      {/* Subtle Tooltip Label on Desktop Hover */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 6 }}
          className="hidden sm:flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-xl bg-[#2D1B18]/95 border border-[#FF4B72]/50 text-white text-xs font-bold shadow-lg pointer-events-none whitespace-nowrap"
        >
          <span>Ask Helper AI</span>
          <span className="text-[10px] text-amber-300 font-normal">اردو / Eng</span>
        </motion.div>
      )}
    </div>
  );
};

