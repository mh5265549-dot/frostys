import React, { useState } from 'react';
import { motion } from 'motion/react';

interface FloatingHelperButtonProps {
  onClick: () => void;
}

export const FloatingHelperButton: React.FC<FloatingHelperButtonProps> = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <aside aria-label="Quick AI assistance" className="fixed bottom-20 sm:bottom-6 left-4 z-30 flex items-center">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        id="btn-floating-helper-ai"
        className="relative px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full bg-white text-stone-800 shadow-md hover:shadow-lg border border-stone-200/90 flex items-center gap-2 transition-all cursor-pointer group"
        title="Ask Bilingual Helper AI (شاپ اسسٹنٹ)"
        aria-label="Open AI Assistant"
      >
        <div className="w-6 h-6 rounded-full bg-pink-100 text-[#FF4B72] flex items-center justify-center text-xs">
          <i className="fa-solid fa-wand-magic-sparkles"></i>
        </div>
        <span className="text-xs font-bold text-stone-800">
          AI Helper <span className="hidden sm:inline text-[10px] text-[#FF4B72] font-semibold">(اردو / Eng)</span>
        </span>
      </motion.button>
    </aside>
  );
};
