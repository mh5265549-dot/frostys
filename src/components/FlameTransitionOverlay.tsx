import React from 'react';

interface FlameTransitionOverlayProps {
  isActive: boolean;
}

export const FlameTransitionOverlay: React.FC<FlameTransitionOverlayProps> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden bg-gradient-to-br from-black/90 via-red-950/90 to-amber-950/90 backdrop-blur-lg animate-heat-wave">
      {/* Background Heat Wave Ring */}
      <div className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-r from-orange-600/40 via-red-600/50 to-amber-500/40 blur-3xl animate-ping"></div>

      {/* Floating Fiery Embers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-10 left-1/3 w-4 h-4 rounded-full bg-amber-400 blur-[1px] animate-ember-1"></div>
        <div className="absolute bottom-20 left-1/2 w-6 h-6 rounded-full bg-orange-500 blur-[1px] animate-ember-2"></div>
        <div className="absolute bottom-16 left-2/3 w-5 h-5 rounded-full bg-red-500 blur-[1px] animate-ember-3"></div>
      </div>

      {/* Center Cinematic Teaser Badge */}
      <div className="relative z-10 text-center space-y-4 px-6 py-8 rounded-3xl bg-zinc-950/80 border-2 border-amber-500/60 shadow-2xl max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-orange-500/50 animate-bounce">
          <i className="fa-solid fa-fire-flame-curved text-3xl text-amber-200"></i>
        </div>
        <h2 className="font-heading font-black text-2xl sm:text-3xl text-amber-300 uppercase tracking-widest">
          Frosty's Grill
        </h2>
        <p className="text-xs text-amber-100 font-bold uppercase tracking-wider animate-pulse">
          🔥 Switching to Savory Kitchen Teaser...
        </p>
      </div>
    </div>
  );
};
