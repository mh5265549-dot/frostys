import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShopMode } from '../types';

interface ShopTransitionOverlayProps {
  targetShop: ShopMode | null;
  onComplete: () => void;
}

export const ShopTransitionOverlay: React.FC<ShopTransitionOverlayProps> = ({
  targetShop,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!targetShop) return;

    // Reset progress
    setProgress(15);
    const t1 = setTimeout(() => setProgress(55), 180);
    const t2 = setTimeout(() => setProgress(90), 380);
    const t3 = setTimeout(() => setProgress(100), 550);
    const t4 = setTimeout(() => {
      onComplete();
    }, 720);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [targetShop, onComplete]);

  if (!targetShop) return null;

  const isGrill = targetShop === 'grill';

  return (
    <AnimatePresence>
      <motion.div
        key={targetShop}
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden pointer-events-auto select-none"
      >
        {/* Dynamic Background Atmosphere */}
        {isGrill ? (
          <div className="absolute inset-0 bg-[#120806] bg-radial from-[#3A140B] via-[#1E0B07] to-[#0D0403]">
            {/* Fiery radial glowing spots */}
            <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-orange-600/25 rounded-full blur-[110px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-600/20 rounded-full blur-[120px]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#0E0B16] bg-radial from-[#2A1226] via-[#160D1E] to-[#0A0710]">
            {/* Frosty glowing spots */}
            <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#FF4B72]/20 rounded-full blur-[110px] animate-pulse"></div>
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#38D39F]/20 rounded-full blur-[120px]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]"></div>
          </div>
        )}

        {/* Ambient Floating Particle Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: `${(i * 19) % 95}vw`,
                y: isGrill ? '105vh' : '-5vh',
                opacity: 0,
                scale: 0.6 + ((i % 4) * 0.2),
              }}
              animate={{
                y: isGrill ? '-10vh' : '105vh',
                opacity: [0, 0.85, 0.4, 0],
                x: `${((i * 19) % 95) + ((i % 2 === 0 ? 1 : -1) * 3)}vw`,
              }}
              transition={{
                duration: 1.2 + (i % 5) * 0.2,
                repeat: Infinity,
                delay: (i * 0.05) % 0.4,
                ease: 'easeInOut',
              }}
              className={`absolute text-base ${
                isGrill ? 'text-amber-400' : 'text-pink-300'
              }`}
            >
              {isGrill
                ? i % 3 === 0
                  ? '🔥'
                  : i % 3 === 1
                  ? '✨'
                  : '♨️'
                : i % 3 === 0
                ? '❄️'
                : i % 3 === 1
                ? '🍦'
                : '✨'}
            </motion.div>
          ))}
        </div>

        {/* Central Content Box */}
        <div className="relative z-20 max-w-md w-full mx-auto px-6 text-center">
          
          {/* Main Animated Icon Emblem */}
          <motion.div
            initial={{ scale: 0.3, rotate: -25, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 220 }}
            className="mx-auto mb-6 relative w-24 h-24 sm:w-28 sm:h-28"
          >
            {/* Outer Glowing Ring */}
            <div
              className={`absolute inset-0 rounded-3xl blur-xl opacity-80 animate-pulse ${
                isGrill
                  ? 'bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600'
                  : 'bg-gradient-to-tr from-[#FF4B72] via-pink-400 to-[#38D39F]'
              }`}
            ></div>

            {/* Emblem Card */}
            <div
              className={`relative w-full h-full rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-2xl border-2 ${
                isGrill
                  ? 'bg-[#220D08] border-orange-500/70 text-amber-400 shadow-orange-950/80'
                  : 'bg-[#1E1122] border-[#FF4B72]/70 text-white shadow-pink-950/80'
              }`}
            >
              {isGrill ? (
                <i className="fa-solid fa-fire-flame-curved animate-bounce"></i>
              ) : (
                <i className="fa-solid fa-ice-cream animate-bounce"></i>
              )}
            </div>
          </motion.div>

          {/* Subtitle Pill */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mb-3"
          >
            <span
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-lg ${
                isGrill
                  ? 'bg-orange-950/90 text-orange-300 border-orange-600/60'
                  : 'bg-pink-950/90 text-pink-300 border-[#FF4B72]/60'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full animate-ping ${
                  isGrill ? 'bg-orange-400' : 'bg-[#38D39F]'
                }`}
              ></span>
              {isGrill ? "Switching to Frosty's Grill" : "Switching to Frosty's Ice Cream"}
            </span>
          </motion.div>

          {/* Big Headline */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight leading-tight mb-2"
          >
            {isGrill ? (
              <>
                Sizzling Charcoal & <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 bg-clip-text text-transparent">
                  Fresh Fast Food
                </span>
              </>
            ) : (
              <>
                Handcrafted Scoops & <br />
                <span className="bg-gradient-to-r from-[#FF85A1] via-pink-400 to-[#38D39F] bg-clip-text text-transparent">
                  Signature Sundaes
                </span>
              </>
            )}
          </motion.h2>

          {/* Tagline Detail */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-xs sm:text-sm text-stone-300 font-medium max-w-sm mx-auto mb-6 leading-relaxed"
          >
            {isGrill
              ? 'Loading juicy flame-grilled burgers, sandwiches, wraps & loaded fries supreme...'
              : 'Loading fresh waffle cones, banana splits, super cups, thick shakes & fruit chillers...'}
          </motion.p>

          {/* Animated Progress Bar */}
          <div className="w-full bg-stone-900/80 rounded-full h-2.5 p-0.5 border border-stone-800 shadow-inner overflow-hidden mb-4">
            <motion.div
              initial={{ width: '10%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`h-full rounded-full transition-all duration-300 ${
                isGrill
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 shadow-[0_0_12px_rgba(249,115,22,0.8)]'
                  : 'bg-gradient-to-r from-[#FF4B72] via-pink-400 to-[#38D39F] shadow-[0_0_12px_rgba(255,75,114,0.8)]'
              }`}
            />
          </div>

          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
            {progress < 100 ? 'Switching Shop...' : 'Ready! Welcome!'}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
