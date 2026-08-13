import React, { useState } from 'react';
import { STORE_INFO } from '../data/menuData';

interface FrostysFlameViewPageProps {
  onBackToDesserts: () => void;
  triggerToast?: (msg: string) => void;
}

export const FrostysFlameViewPage: React.FC<FrostysFlameViewPageProps> = ({
  onBackToDesserts,
  triggerToast,
}) => {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [userName, setUserName] = useState('');

  const handleNotifyWhatsApp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const nameStr = userName.trim() ? `My name is ${userName}. ` : '';
    const text = encodeURIComponent(
      `Hi Frosty's Green City! 🔥 ${nameStr}Please notify me on WhatsApp (${whatsappNumber || 'my number'}) as soon as your Burgers, Tacos & BBQ launch!`
    );
    window.open(`https://wa.me/${STORE_INFO.whatsapp}?text=${text}`, '_blank');
    if (triggerToast) {
      triggerToast('🔥 Opening WhatsApp to register for Frosty\'s Grill launch alerts!');
    }
    setWhatsappNumber('');
    setUserName('');
  };

  const upcomingItems = [
    {
      id: 'burger-smash',
      name: 'Gourmet Double Beef Smash Burger',
      category: 'Burgers',
      description: 'Hand-smashed double beef patties with crispy lace edges, double melted cheddar cheese, caramelized onions, and house secret sauce on a toasted brioche bun.',
      icon: 'fa-solid fa-burger',
      tagline: 'Fresh Griddle Smash • 100% Pure Beef',
      badge: 'SIGNATURE ITEM',
    },
    {
      id: 'bbq-tikka',
      name: 'Smoky Charcoal Chicken Tikka Boti',
      category: 'Charcoal BBQ',
      description: 'Marinated tender chicken chunks grilled over live coals, infused with traditional aromatic Lahori spices. Served with fresh mint raita, sliced onions & hot tandoori naan.',
      icon: 'fa-solid fa-drumstick-bite',
      tagline: 'Live Charcoal Flame • Authentic Spice',
      badge: 'CHEF\'S SPECIAL',
    },
    {
      id: 'tacos-zinger',
      name: 'Crispy Zinger Chicken Tacos (3 Pcs)',
      category: 'Tacos',
      description: 'Triple-dusted crispy fried zinger tenders stuffed in warm soft flour tortillas with shredded purple slaw, pickled jalapeños, and smoky chipotle mayo.',
      icon: 'fa-solid fa-cloud-meatball',
      tagline: 'Extra Crunchy • Mexican-Pak Fusion',
      badge: 'HOT & SPICY',
    },
    {
      id: 'sandwich-club',
      name: 'Royal Triple-Decker Club Sandwich',
      category: 'Sandwiches',
      description: 'Classic toasted three-layer sandwich packed with pulled roast chicken, fried egg, crisp lettuce, juicy tomato slices, cheese, and served with crinkle cut fries.',
      icon: 'fa-solid fa-[#FF4B72]',
      tagline: 'Loaded Triple Layer • Crinkle Fries',
      badge: 'POPULAR FAV',
    },
  ];

  return (
    <div className="min-h-screen bg-[#120D0D] text-stone-100 font-sans antialiased selection:bg-amber-500 selection:text-zinc-950 flex flex-col relative overflow-x-hidden">
      
      {/* Background Ambient Flame & Charcoal Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-950/30 via-[#180E10] to-black pointer-events-none"></div>
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none animate-flame-pulse"></div>
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-flame-pulse"></div>

      {/* Floating Sparks / Embers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute bottom-10 left-1/5 w-2.5 h-2.5 rounded-full bg-amber-400 blur-[1px] animate-ember-1"></div>
        <div className="absolute bottom-20 left-2/5 w-3.5 h-3.5 rounded-full bg-orange-500 blur-[1px] animate-ember-2"></div>
        <div className="absolute bottom-16 left-3/4 w-2 h-2 rounded-full bg-red-500 blur-[1px] animate-ember-3"></div>
      </div>

      {/* Standalone Frosty's Flame Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-amber-500/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Flame Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 border border-amber-400/50">
              <i className="fa-solid fa-fire-flame-curved text-xl text-amber-100 animate-pulse"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 tracking-tight">
                  Frosty's Grill
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40 uppercase">
                  TEASER
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block -mt-0.5">
                Burgers • Tacos • BBQ • Green City Lahore
              </span>
            </div>
          </div>

          {/* Return to Ice Cream Button */}
          <button
            onClick={onBackToDesserts}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border-2 border-amber-500/40 text-amber-200 font-extrabold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 shadow-lg hover:border-amber-400 hover:scale-105 active:scale-95 cursor-pointer"
            title="Return to Frosty's Ice Cream Parlor"
          >
            <i className="fa-solid fa-arrow-left text-amber-400"></i>
            <span>Back to Ice Cream Shop</span>
            <span className="text-base">🍦</span>
          </button>

        </div>
      </header>

      {/* Main Teaser Content */}
      <main className="flex-1 relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-12">

        {/* Industrial Steel Metal Board "COMING SOON" */}
        <div className="relative">
          {/* Outer Heat Glow */}
          <div className="absolute -inset-3 bg-gradient-to-r from-orange-600/30 via-red-600/40 to-amber-500/30 rounded-[2.5rem] blur-2xl opacity-90 animate-flame-pulse pointer-events-none"></div>

          {/* Heavy Steel Board Frame */}
          <div className="relative bg-gradient-to-b from-zinc-800 via-zinc-900 to-black text-white rounded-3xl p-6 sm:p-10 lg:p-12 border-4 border-zinc-600/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_50px_rgba(245,158,11,0.2)] overflow-hidden">
            
            {/* Corner Industrial Rivets */}
            <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-gradient-to-br from-zinc-400 via-zinc-600 to-zinc-800 border-2 border-zinc-900 shadow-inner flex items-center justify-center">
              <div className="w-2.5 h-0.5 bg-zinc-950 rotate-45"></div>
            </div>
            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-br from-zinc-400 via-zinc-600 to-zinc-800 border-2 border-zinc-900 shadow-inner flex items-center justify-center">
              <div className="w-2.5 h-0.5 bg-zinc-950 -rotate-45"></div>
            </div>
            <div className="absolute bottom-4 left-4 w-6 h-6 rounded-full bg-gradient-to-br from-zinc-400 via-zinc-600 to-zinc-800 border-2 border-zinc-900 shadow-inner flex items-center justify-center">
              <div className="w-2.5 h-0.5 bg-zinc-950 -rotate-45"></div>
            </div>
            <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-gradient-to-br from-zinc-400 via-zinc-600 to-zinc-800 border-2 border-zinc-900 shadow-inner flex items-center justify-center">
              <div className="w-2.5 h-0.5 bg-zinc-950 rotate-45"></div>
            </div>

            {/* Caution Hazard Stripe Bar */}
            <div className="mb-8 rounded-xl overflow-hidden border-2 border-amber-500/70 shadow-lg">
              <div className="h-3.5 bg-[repeating-linear-gradient(135deg,#f59e0b,#f59e0b_15px,#18181b_15px,#18181b_30px)]"></div>
              <div className="bg-zinc-950/95 py-2 px-4 text-center flex items-center justify-center gap-3 text-amber-400 text-xs sm:text-sm font-black uppercase tracking-widest">
                <i className="fa-solid fa-triangle-exclamation text-amber-500 animate-bounce"></i>
                <span>RESTRICTED KITCHEN AREA • FROSTY'S GRILL TEASER</span>
                <i className="fa-solid fa-triangle-exclamation text-amber-500 animate-bounce"></i>
              </div>
              <div className="h-3.5 bg-[repeating-linear-gradient(135deg,#f59e0b,#f59e0b_15px,#18181b_15px,#18181b_30px)]"></div>
            </div>

            {/* Metal Plate Header Text */}
            <div className="text-center space-y-6">
              
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-red-950/90 via-amber-950/90 to-red-950/90 border-2 border-amber-500/60 text-amber-300 text-xs font-black uppercase tracking-widest shadow-xl">
                <i className="fa-solid fa-fire-flame-curved text-amber-400 text-base animate-pulse"></i>
                <span>NEW SAVORY KITCHEN DIVISION</span>
                <i className="fa-solid fa-fire-flame-curved text-amber-400 text-base animate-pulse"></i>
              </div>

              {/* Central Steel Metal Board Display */}
              <div className="relative max-w-3xl mx-auto bg-gradient-to-b from-zinc-800 via-zinc-900 to-black p-8 sm:p-12 rounded-2xl border-4 border-zinc-600/90 shadow-[inset_0_4px_16px_rgba(0,0,0,0.95),0_15px_35px_rgba(245,158,11,0.25)]">
                
                {/* Board Inner Rivets */}
                <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-zinc-500 border border-zinc-900"></div>
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-zinc-500 border border-zinc-900"></div>
                <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-zinc-500 border border-zinc-900"></div>
                <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-zinc-500 border border-zinc-900"></div>

                <div className="space-y-4">
                  <span className="text-amber-400 font-extrabold text-xs sm:text-sm uppercase tracking-[0.3em] block">
                    GOURMET BURGERS • TACOS • CHARCOAL BBQ
                  </span>

                  {/* MASSIVE BOLD METALLIC "COMING SOON" */}
                  <h1 className="font-heading font-black text-5xl sm:text-7xl lg:text-8xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-400 to-orange-500 drop-shadow-[0_6px_18px_rgba(245,158,11,0.7)] uppercase">
                    COMING SOON
                  </h1>

                  <div className="h-1.5 w-40 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto rounded-full my-3"></div>

                  <p className="text-amber-100 font-black text-base sm:text-xl max-w-xl mx-auto leading-relaxed">
                    Firing Up The Charcoal Grills in 1–2 Weeks in Green City, Lahore!
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl mx-auto leading-relaxed font-medium">
                We are building Lahore's most flavorful savory kitchen! Gourmet beef smash burgers, sizzling charcoal tikka boti, spicy zinger tacos, and club sandwiches are coming soon. No ordering is available yet during this teaser preview phase.
              </p>

            </div>

          </div>
        </div>

        {/* Teaser Showcase Items Grid (Zero Ice Cream Presence) */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-500/30 pb-4">
            <div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-amber-300 flex items-center gap-2.5">
                <i className="fa-solid fa-utensils text-amber-500"></i>
                <span>Upcoming Savory Menu Preview</span>
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                A sneak peek at the mouthwatering lineup launching at Frosty's Grill.
              </p>
            </div>
            <span className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <i className="fa-solid fa-lock text-amber-400"></i>
              <span>Ordering Locked • Teaser Only</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingItems.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900/90 rounded-3xl p-6 border-2 border-zinc-700/80 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/60 transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {item.badge}
                    </span>
                    <span className="text-xs text-stone-400 font-bold flex items-center gap-1">
                      <i className="fa-solid fa-clock text-amber-500"></i> Launching Soon
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 text-2xl shadow-inner group-hover:scale-110 transition-transform">
                      <i className={item.icon}></i>
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-xl text-amber-100 group-hover:text-amber-300 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-amber-400 font-bold mt-0.5">
                        {item.tagline}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed font-medium pt-1">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-extrabold uppercase tracking-wider">
                    Category: <span className="text-amber-300">{item.category}</span>
                  </span>
                  <button
                    disabled
                    className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-xs cursor-not-allowed flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-lock text-xs"></i>
                    <span>Preview Only</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Registration Form Card */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-green-600 to-emerald-400 text-white flex items-center justify-center text-2xl mx-auto shadow-lg shadow-green-600/30">
              <i className="fa-brands fa-whatsapp"></i>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-amber-200">
                Be The First To Taste Frosty's Grill!
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto leading-relaxed">
                Register for WhatsApp launch alerts to get an exclusive opening day discount when our kitchen fires up live in Green City, Lahore.
              </p>
            </div>

            <form onSubmit={handleNotifyWhatsApp} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-white placeholder-stone-400 text-xs sm:text-sm focus:outline-none focus:border-amber-400 sm:w-1/3"
              />
              <input
                type="tel"
                placeholder="WhatsApp Number"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-white placeholder-stone-400 text-xs sm:text-sm focus:outline-none focus:border-amber-400 sm:w-2/3"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-zinc-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:shadow-orange-500/40 transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Notify Me</span>
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </form>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={onBackToDesserts}
                className="px-6 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-stone-200 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-ice-cream text-[#FF4B72]"></i>
                <span>Return to Frosty's Ice Cream Shop</span>
              </button>
            </div>

          </div>
        </div>

      </main>

      {/* Dedicated Savory Kitchen Footer (Zero Ice Cream Presence) */}
      <footer className="relative z-10 bg-zinc-950 border-t border-amber-500/30 text-stone-400 py-10 px-4 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-heading font-black text-lg text-amber-300">
                Frosty's Grill
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                Savory Kitchen Division
              </span>
            </div>
            <p className="text-xs text-stone-400 max-w-md">
              Street #4, Main Commercial Market, Green City, Lahore, Punjab, Pakistan.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
            <a
              href={`https://wa.me/${STORE_INFO.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-amber-300 flex items-center gap-2 transition-colors"
            >
              <i className="fa-brands fa-whatsapp text-sm text-green-400"></i>
              <span>WhatsApp: +{STORE_INFO.whatsapp}</span>
            </a>
            <button
              onClick={onBackToDesserts}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-ice-cream text-[#FF4B72]"></i>
              <span>Ice Cream Store</span>
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-zinc-900 text-center text-[11px] text-stone-400">
          © {new Date().getFullYear()} Frosty's Grill • Savory Kitchen Expansion • Green City, Lahore. All Rights Reserved.
        </div>
      </footer>

    </div>
  );
};
