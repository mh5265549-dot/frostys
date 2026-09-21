import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShopMode } from '../types';
import { FrostyLogo } from './FrostyLogo';

interface ShopTransitionOverlayProps {
  targetShop: ShopMode | null;
  onComplete: () => void;
}

export const ShopTransitionOverlay: React.FC<ShopTransitionOverlayProps> = ({
  targetShop,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [logoStage, setLogoStage] = useState<'initial' | 'transforming' | 'transformed'>('initial');

  useEffect(() => {
    if (!targetShop) return;

    // Reset progress and stages
    setProgress(15);
    setLogoStage('initial');

    const t1 = setTimeout(() => {
      setProgress(45);
      setLogoStage('transforming');
    }, 240);

    const t2 = setTimeout(() => {
      setProgress(85);
      setLogoStage('transformed');
    }, 460);

    const t3 = setTimeout(() => {
      setProgress(100);
    }, 680);

    const t4 = setTimeout(() => {
      onComplete();
    }, 880);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [targetShop, onComplete]);

  if (!targetShop) return null;

  const isAll = targetShop === 'all';
  const isGrill = targetShop === 'grill';
  const currentLogoVariant =
    isAll
      ? logoStage === 'transformed'
        ? 'fire'
        : 'ice'
      : logoStage === 'initial'
      ? isGrill ? 'ice' : 'fire'
      : isGrill ? 'fire' : 'ice';

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
        {isAll ? (
          <div className="absolute inset-0 bg-[#0F0A14] bg-radial from-[#2C1322] via-[#1A0E1A] to-[#0A0710]">
            {/* Dual Fire and Ice glowing spots */}
            <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-orange-600/25 rounded-full blur-[110px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-[#38BDF8]/25 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]"></div>
          </div>
        ) : isGrill ? (
          <div className="absolute inset-0 bg-[#120806] bg-radial from-[#3A140B] via-[#1E0B07] to-[#0D0403]">
            {/* Fiery radial glowing spots */}
            <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-orange-600/25 rounded-full blur-[110px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-600/20 rounded-full blur-[120px]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#0E0B16] bg-radial from-[#2A1226] via-[#160D1E] to-[#0A0710]">
            {/* Frosty glowing spots */}
            <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#38BDF8]/20 rounded-full blur-[110px] animate-pulse"></div>
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#FF4B72]/20 rounded-full blur-[120px]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]"></div>
          </div>
        )}

        {/* Ambient Floating Particle Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 22 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: `${(i * 17) % 95}vw`,
                y: isGrill ? '105vh' : '-5vh',
                opacity: 0,
                scale: 0.6 + ((i % 4) * 0.25),
              }}
              animate={{
                y: isGrill ? '-10vh' : '105vh',
                opacity: [0, 0.9, 0.4, 0],
                x: `${((i * 17) % 95) + ((i % 2 === 0 ? 1 : -1) * 4)}vw`,
              }}
              transition={{
                duration: 1.1 + (i % 5) * 0.2,
                repeat: Infinity,
                delay: (i * 0.04) % 0.4,
                ease: 'easeInOut',
              }}
              className={`absolute text-lg ${
                isAll
                  ? i % 2 === 0 ? 'text-amber-400' : 'text-sky-300'
                  : isGrill ? 'text-amber-400' : 'text-sky-300'
              }`}
            >
              {isAll
                ? i % 4 === 0
                  ? '🔥'
                  : i % 4 === 1
                  ? '❄️'
                  : i % 4 === 2
                  ? '🍔'
                  : '🍦'
                : isGrill
                ? i % 3 === 0
                  ? '🔥'
                  : i % 3 === 1
                  ? '✨'
                  : '♨️'
                : i % 3 === 0
                ? '❄️'
                : i % 3 === 1
                ? '⛄'
                : '✨'}
            </motion.div>
          ))}
        </div>

        {/* Central Content Box */}
        <div className="relative z-20 max-w-md w-full mx-auto px-6 text-center">
          
          {/* Main Animated Snowman Logo Transition Emblem */}
          <div className="mx-auto mb-6 relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
            {/* Outer Glowing Pulsing Ring */}
            <motion.div
              animate={{
                scale: logoStage === 'transforming' ? [1, 1.25, 1.1] : 1,
                opacity: [0.6, 0.9, 0.7],
              }}
              transition={{ duration: 0.4 }}
              className={`absolute inset-0 rounded-3xl blur-xl ${
                isAll
                  ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-[#38BDF8]'
                  : currentLogoVariant === 'fire'
                  ? 'bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600'
                  : 'bg-gradient-to-tr from-[#38BDF8] via-sky-400 to-[#FF4B72]'
              }`}
            />

            {/* Emblem Card Containing the Snowman Logo */}
            <motion.div
              key={`${currentLogoVariant}-${logoStage}`}
              initial={{
                scale: logoStage === 'initial' ? 0.8 : 0.6,
                rotate: logoStage === 'transforming' ? -15 : 0,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                rotate: 0,
                opacity: 1,
              }}
              transition={{ type: 'spring', damping: 14, stiffness: 220 }}
              className={`relative w-full h-full rounded-3xl flex items-center justify-center p-3 shadow-2xl border-2 backdrop-blur-md transition-colors duration-300 ${
                isAll
                  ? 'bg-[#180F1E]/90 border-amber-400/60 shadow-purple-950/80'
                  : currentLogoVariant === 'fire'
                  ? 'bg-[#220D08]/90 border-orange-500/70 shadow-orange-950/80'
                  : 'bg-[#0F172A]/90 border-sky-400/70 shadow-sky-950/80'
              }`}
            >
              {isAll ? (
                <div className="flex items-center justify-center gap-1">
                  <FrostyLogo
                    variant="fire"
                    size="custom"
                    className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-[0_0_12px_rgba(249,115,22,0.6)]"
                  />
                  <FrostyLogo
                    variant="ice"
                    size="custom"
                    className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]"
                  />
                </div>
              ) : (
                <FrostyLogo
                  variant={currentLogoVariant}
                  size="custom"
                  className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                />
              )}

              {/* Dynamic Tag Overlay on Logo during morph */}
              <div className="absolute -bottom-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase shadow-md flex items-center gap-1 border">
                {isAll ? (
                  <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-sky-500 text-white border-amber-300">
                    🔥 + 🍦 Merged Stores
                  </span>
                ) : currentLogoVariant === 'fire' ? (
                  <span className="bg-gradient-to-r from-orange-600 to-amber-500 text-white border-orange-400">
                    🔥 Fire Edition
                  </span>
                ) : (
                  <span className="bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-300">
                    ⛄ White Snowman
                  </span>
                )}
              </div>
            </motion.div>
          </div>

          {/* Subtitle Pill / Status Indicator */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mb-3"
          >
            <span
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-lg transition-colors ${
                isAll
                  ? 'bg-amber-950/90 text-amber-300 border-amber-500/60'
                  : isGrill
                  ? 'bg-orange-950/90 text-orange-300 border-orange-600/60'
                  : 'bg-sky-950/90 text-sky-300 border-sky-500/60'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full animate-ping ${
                  isAll ? 'bg-amber-400' : isGrill ? 'bg-orange-400' : 'bg-sky-400'
                }`}
              ></span>
              {isAll
                ? "Merging Both Menus: Frosty's + Frosty's Grill..."
                : isGrill
                ? logoStage === 'transformed'
                  ? "Ignited: Snowman Fire Edition 🔥"
                  : "Igniting Snowman to Fire Edition..."
                : logoStage === 'transformed'
                  ? "Cooled: White Snowman Edition ⛄"
                  : "Cooling Snowman to Winter Edition..."}
            </span>
          </motion.div>

          {/* Big Headline */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight leading-tight mb-2"
          >
            {isAll ? (
              <>
                Frosty's + Frosty's Grill <br />
                <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-sky-400 bg-clip-text text-transparent">
                  Complete Merged Menu
                </span>
              </>
            ) : isGrill ? (
              <>
                Sizzling Charcoal & <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 bg-clip-text text-transparent">
                  Fresh Fast Food
                </span>
              </>
            ) : (
              <>
                Handcrafted Scoops & <br />
                <span className="bg-gradient-to-r from-[#FF85A1] via-sky-300 to-[#38BDF8] bg-clip-text text-transparent">
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
            {isAll
              ? 'Loading burgers, sandwiches, fries & BBQ alongside waffle cones, sundaes & thick shakes...'
              : isGrill
              ? 'Loading juicy flame-grilled burgers, sandwiches, wraps, tacos & Karak Chai...'
              : 'Loading fresh waffle cones, banana splits, super cups, thick shakes & fruit chillers...'}
          </motion.p>

          {/* Animated Progress Bar */}
          <div className="w-full bg-stone-900/80 rounded-full h-2.5 p-0.5 border border-stone-800 shadow-inner overflow-hidden mb-4">
            <motion.div
              initial={{ width: '10%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`h-full rounded-full transition-all duration-300 ${
                isAll
                  ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-sky-400 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                  : isGrill
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 shadow-[0_0_12px_rgba(249,115,22,0.8)]'
                  : 'bg-gradient-to-r from-sky-400 via-blue-500 to-[#FF4B72] shadow-[0_0_12px_rgba(56,189,248,0.8)]'
              }`}
            />
          </div>

          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
            {progress < 100 ? 'Switching Shop Edition...' : 'Ready! Welcome!'}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
