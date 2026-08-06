import React from 'react';

interface FrostTransitionOverlayProps {
  isActive: boolean;
}

export const FrostTransitionOverlay: React.FC<FrostTransitionOverlayProps> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-950/90 via-sky-950/95 to-slate-950/95 backdrop-blur-xl animate-frost-sweep">
      
      {/* Radial Ice Crystal Aura */}
      <div className="absolute w-[850px] h-[850px] rounded-full bg-gradient-to-r from-cyan-400/30 via-sky-300/40 to-pink-400/20 blur-3xl animate-pulse"></div>

      {/* Floating Snowflakes & Ice Sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 text-cyan-200 text-xl animate-float-snow-1">
          <i className="fa-solid fa-snowflake"></i>
        </div>
        <div className="absolute top-1/3 right-1/4 text-sky-100 text-2xl animate-float-snow-2">
          <i className="fa-solid fa-snowflake"></i>
        </div>
        <div className="absolute bottom-1/3 left-1/3 text-pink-200 text-lg animate-float-snow-1">
          <i className="fa-solid fa-sparkles"></i>
        </div>
        <div className="absolute bottom-1/4 right-1/3 text-cyan-100 text-2xl animate-float-snow-2">
          <i className="fa-solid fa-snowflake"></i>
        </div>
      </div>

      {/* Center Frosted Glass "Frosty's" Badge */}
      <div className="relative z-10 text-center space-y-4 px-8 py-10 rounded-3xl bg-slate-900/85 border-2 border-cyan-300/60 shadow-[0_0_60px_rgba(56,189,248,0.4)] max-w-md mx-auto backdrop-blur-2xl">
        
        {/* Ice Cream Icon Badge */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#FF4B72] via-pink-400 to-sky-300 flex items-center justify-center text-white mx-auto shadow-xl shadow-pink-500/30 border-2 border-white/60 animate-bounce">
          <i className="fa-solid fa-ice-cream text-4xl text-white drop-shadow-md"></i>
        </div>

        {/* PROMINENT "Frosty's" TEXT */}
        <div className="space-y-1">
          <span className="text-xs uppercase font-black tracking-[0.3em] text-cyan-300 block">
            ARTISANAL ICE CREAM PARLOR
          </span>
          <h2 className="font-heading font-black text-5xl sm:text-6xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-[#FF85A1] drop-shadow-[0_4px_16px_rgba(56,189,248,0.6)] animate-shimmer-glow">
            Frosty's
          </h2>
        </div>

        {/* Status Indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-900/60 border border-cyan-400/50 text-cyan-200 text-xs font-bold uppercase tracking-wider animate-pulse">
          <i className="fa-solid fa-snowflake text-sky-300"></i>
          <span>Returning To Dessert Shop...</span>
          <i className="fa-solid fa-ice-cream text-pink-300"></i>
        </div>

      </div>
    </div>
  );
};
