import React from 'react';
import { STORE_INFO } from '../data/menuData';

interface FrostysFlameMetalBoardProps {
  onBackToDesserts?: () => void;
  triggerToast?: (msg: string) => void;
}

export const FrostysFlameMetalBoard: React.FC<FrostysFlameMetalBoardProps> = ({
  onBackToDesserts,
  triggerToast,
}) => {
  const handleNotifyWhatsApp = () => {
    const text = encodeURIComponent(
      `Hi Frosty's Green City! 🔥 I'm excited about Frosty's Flame! Please notify me on WhatsApp as soon as your Burgers, Tacos & BBQ launch!`
    );
    window.open(`https://wa.me/${STORE_INFO.whatsapp}?text=${text}`, '_blank');
    if (triggerToast) {
      triggerToast('🔥 Opening WhatsApp to register for Frosty\'s Flame launch alerts!');
    }
  };

  const upcomingTeasers = [
    {
      title: 'Gourmet Double Smash Burgers',
      icon: 'fa-solid fa-burger',
      tagline: 'Smashed Double Beef Patties • Melted Cheddar • Caramelized Onions • Brioche Bun',
      color: 'from-amber-500/20 to-orange-600/20 border-amber-500/40',
    },
    {
      title: 'Smoky Charcoal Chicken BBQ Tikka',
      icon: 'fa-solid fa-drumstick-bite',
      tagline: 'Traditional Charcoal Tikka Boti • Fresh Mint Raita • Hot Naan & Onions',
      color: 'from-red-600/20 to-amber-600/20 border-red-500/40',
    },
    {
      title: 'Spicy Zinger Chicken Tacos',
      icon: 'fa-solid fa-cloud-meatball',
      tagline: 'Crispy Zinger Tenders • Purple Slaw • Jalapeños • Chipotle Mayo',
      color: 'from-orange-500/20 to-yellow-600/20 border-orange-500/40',
    },
    {
      title: 'Royal Triple-Decker Club Sandwich',
      icon: 'fa-solid fa-bread-slice',
      tagline: 'Toasted Triple Deck • Seasoned Chicken • Fried Egg • Crinkle Cut Fries',
      color: 'from-yellow-600/20 to-amber-700/20 border-yellow-500/40',
    },
  ];

  return (
    <div className="relative my-8 max-w-5xl mx-auto px-2 sm:px-4">
      {/* Ambient Flame Glow Background */}
      <div className="absolute -inset-4 bg-gradient-to-r from-orange-600/30 via-red-600/40 to-amber-500/30 rounded-[2.5rem] blur-2xl opacity-80 animate-flame-pulse pointer-events-none"></div>

      {/* Industrial Steel Metal Board Container */}
      <div className="relative bg-gradient-to-b from-zinc-800 via-zinc-900 to-black text-white rounded-3xl p-6 sm:p-10 lg:p-12 border-4 border-zinc-600/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.25)] overflow-hidden">
        
        {/* Steel Plate Texture Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-700/30 via-zinc-900/90 to-black pointer-events-none"></div>

        {/* Floating Sparks / Embers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-4 left-1/4 w-2 h-2 rounded-full bg-amber-400 blur-[1px] animate-ember-1"></div>
          <div className="absolute bottom-10 left-2/4 w-3 h-3 rounded-full bg-orange-500 blur-[1px] animate-ember-2"></div>
          <div className="absolute bottom-6 left-3/4 w-2.5 h-2.5 rounded-full bg-red-500 blur-[1px] animate-ember-3"></div>
        </div>

        {/* 4 Corner Metallic Industrial Rivets / Bolts */}
        <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-gradient-to-br from-zinc-400 via-zinc-600 to-zinc-800 border-2 border-zinc-900 shadow-inner flex items-center justify-center">
          <div className="w-2.5 h-0.5 bg-zinc-900 rotate-45"></div>
        </div>
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-br from-zinc-400 via-zinc-600 to-zinc-800 border-2 border-zinc-900 shadow-inner flex items-center justify-center">
          <div className="w-2.5 h-0.5 bg-zinc-900 -rotate-45"></div>
        </div>
        <div className="absolute bottom-4 left-4 w-6 h-6 rounded-full bg-gradient-to-br from-zinc-400 via-zinc-600 to-zinc-800 border-2 border-zinc-900 shadow-inner flex items-center justify-center">
          <div className="w-2.5 h-0.5 bg-zinc-900 -rotate-45"></div>
        </div>
        <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-gradient-to-br from-zinc-400 via-zinc-600 to-zinc-800 border-2 border-zinc-900 shadow-inner flex items-center justify-center">
          <div className="w-2.5 h-0.5 bg-zinc-900 rotate-45"></div>
        </div>

        {/* Caution / Hazard Stripe Top Bar */}
        <div className="mb-8 rounded-xl overflow-hidden border-2 border-amber-500/60 shadow-lg">
          <div className="h-3 bg-[repeating-linear-gradient(135deg,#f59e0b,#f59e0b_15px,#18181b_15px,#18181b_30px)]"></div>
          <div className="bg-zinc-950/90 py-2 px-4 text-center flex items-center justify-center gap-3 text-amber-400 text-xs font-black uppercase tracking-widest">
            <i className="fa-solid fa-triangle-exclamation text-amber-500 animate-bounce"></i>
            <span>RESTRICTED KITCHEN AREA • FROSTY'S FLAME TEASER</span>
            <i className="fa-solid fa-triangle-exclamation text-amber-500 animate-bounce"></i>
          </div>
          <div className="h-3 bg-[repeating-linear-gradient(135deg,#f59e0b,#f59e0b_15px,#18181b_15px,#18181b_30px)]"></div>
        </div>

        {/* Central Metal Plate Header */}
        <div className="relative z-10 text-center space-y-6">
          
          {/* Brand & Flame Icon */}
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gradient-to-r from-red-950/80 via-amber-950/90 to-red-950/80 border-2 border-amber-500/60 text-amber-300 text-xs font-black uppercase tracking-widest shadow-xl">
            <i className="fa-solid fa-fire-flame-curved text-amber-400 text-lg animate-pulse"></i>
            <span>FROSTY'S FLAME • GREEN CITY LAHORE</span>
            <i className="fa-solid fa-fire-flame-curved text-amber-400 text-lg animate-pulse"></i>
          </div>

          {/* Steel Plate Main "COMING SOON" Sign */}
          <div className="relative my-6 max-w-2xl mx-auto bg-gradient-to-b from-zinc-800 via-zinc-900 to-black p-8 sm:p-12 rounded-2xl border-4 border-zinc-600/90 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9),0_10px_30px_rgba(245,158,11,0.3)]">
            
            {/* Plate Inner Rivets */}
            <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-zinc-500 border border-zinc-800"></div>
            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-zinc-500 border border-zinc-800"></div>
            <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-zinc-500 border border-zinc-800"></div>
            <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-zinc-500 border border-zinc-800"></div>

            <div className="space-y-3">
              <span className="text-amber-400/90 text-xs font-black uppercase tracking-[0.3em] block">
                SAVORY KITCHEN EXPANSION
              </span>

              {/* MASSIVE BOLD METALLIC "COMING SOON" TEXT */}
              <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 drop-shadow-[0_4px_12px_rgba(245,158,11,0.6)] uppercase">
                COMING SOON
              </h1>

              <div className="h-1 w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto rounded-full my-2"></div>

              <p className="text-stone-300 font-bold text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Firing Up The Grills in 1–2 Weeks!
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Frosty's is bringing hot, smoky savory kitchen delights to Green City, Lahore alongside our signature ice creams! No menu ordering is available yet during this teaser preview phase.
          </p>

          {/* Upcoming Teaser Category Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-3xl mx-auto pt-4">
            {upcomingTeasers.map((t) => (
              <div
                key={t.title}
                className={`p-4 rounded-2xl bg-gradient-to-r ${t.color} border backdrop-blur-md transition-all hover:scale-[1.02] shadow-md flex items-start gap-3.5`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 text-lg shadow-inner">
                  <i className={t.icon}></i>
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-200">{t.title}</h4>
                  <p className="text-[11px] text-stone-300 font-medium leading-snug mt-0.5">
                    {t.tagline}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleNotifyWhatsApp}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-stone-950 font-black text-sm uppercase tracking-wider shadow-2xl hover:shadow-orange-500/50 transition-all duration-200 flex items-center justify-center gap-3 hover:-translate-y-0.5"
            >
              <i className="fa-brands fa-whatsapp text-lg"></i>
              <span>Get Launch Alert on WhatsApp</span>
            </button>

            {onBackToDesserts && (
              <button
                onClick={onBackToDesserts}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-stone-200 font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-ice-cream text-[#FF4B72]"></i>
                <span>Back to Dessert Menu</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
