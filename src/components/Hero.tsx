import React from 'react';
import { STORE_INFO, heroDessertImg, smashBurgerImg } from '../data/menuData';
import { ShopMode } from '../types';

interface HeroProps {
  onOpenOrderModal: () => void;
  onOpenCallModal: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onQuickSearch?: (term: string) => void;
  activeShop: ShopMode;
  onSwitchShop: (shop: ShopMode) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenOrderModal,
  onOpenCallModal,
  searchQuery = '',
  onSearchChange,
  onQuickSearch,
  activeShop,
  onSwitchShop,
}) => {
  const isGrill = activeShop === 'grill';

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  const handleQuickChipClick = (term: string) => {
    if (onQuickSearch) {
      onQuickSearch(term);
    } else if (onSearchChange) {
      onSearchChange(term);
    }
    const menuElement = document.getElementById('menu');
    if (menuElement) {
      menuElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const iceCreamChips = [
    'Waffle Cone',
    'Banana Split',
    'Super Cup',
    'Oreo Shake',
    'Pistachio Kulfa',
    'Cold Coffee',
    'Blue Berry Soda',
  ];

  const grillChips = [
    'Charcoal Burger',
    'Tikka Burger',
    'Club Sandwich',
    'Zinger Wrap',
    'Fries Supreme',
    'BBQ Tikka',
  ];

  const activeChips = isGrill ? grillChips : iceCreamChips;

  return (
    <section
      id="hero"
      className="relative pt-24 pb-12 lg:pt-32 lg:pb-20 bg-[#2D1B18] dark:bg-[#160E0D] text-white overflow-hidden transition-colors duration-200"
    >
      {/* Soft Background Accents */}
      {isGrill ? (
        <>
          <div className="absolute top-1/4 left-10 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        </>
      ) : (
        <>
          <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#FF4B72]/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#38D39F]/10 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Interactive Shop Mode Indicator & Fast Switch Banner */}
        <div className="mb-6 p-2 sm:p-2.5 rounded-2xl bg-[#1D110F]/90 backdrop-blur-md border border-[#482823] flex flex-wrap items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2.5 pl-2">
            <span
              className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] text-white font-black animate-ping ${
                isGrill ? 'bg-orange-500' : 'bg-[#38D39F]'
              }`}
            ></span>
            <span className="text-xs text-amber-200/80 font-medium">
              Currently Shopping at:{' '}
              <strong className="text-white font-extrabold">
                {isGrill ? "Frosty's Grill (Burgers & BBQ)" : "Frosty's (Ice Cream & Desserts)"}
              </strong>
            </span>
          </div>

          <button
            onClick={() => onSwitchShop(isGrill ? 'ice-cream' : 'grill')}
            id="hero-banner-switch-shop"
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 flex items-center gap-2 shadow-md cursor-pointer hover:scale-105 active:scale-95 ${
              isGrill
                ? 'bg-gradient-to-r from-[#FF4B72] to-[#FF85A1] text-white shadow-pink-950/60'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white shadow-orange-950/80'
            }`}
          >
            {isGrill ? (
              <>
                <i className="fa-solid fa-ice-cream"></i>
                <span>Switch to Frosty's (Ice Cream Shop)</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </>
            ) : (
              <>
                <i className="fa-solid fa-fire text-amber-300"></i>
                <span>Switch to Frosty's Grill (Burgers & BBQ)</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3D2522] border border-[#5A3833] text-xs sm:text-sm font-semibold text-[#FF85A1] shadow-inner">
              <span className="w-2 h-2 rounded-full bg-[#38D39F] animate-ping"></span>
              <i className="fa-solid fa-moon text-[#38D39F]"></i>
              <span>Open Late Night • 4:00 PM to 2:00 AM Daily</span>
            </div>

            {/* Prominent Store Header & Headline */}
            <div>
              <span
                className={`block font-heading text-xs font-extrabold uppercase tracking-widest mb-1 ${
                  isGrill ? 'text-amber-400' : 'text-[#FF85A1]'
                }`}
              >
                {isGrill ? "Welcome to Frosty's Grill & Fast Food" : "Welcome to Frosty's Ice Cream Parlor"}
              </span>
              <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.15] text-amber-50">
                {isGrill ? (
                  <>
                    Charcoal Burgers, BBQ & <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 bg-clip-text text-transparent">
                      Sizzling Fast Food
                    </span>{' '}
                    Delivered Hot!
                  </>
                ) : (
                  <>
                    Artisanal Scoops, Sundaes & <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-[#FF4B72] via-[#FF85A1] to-[#38D39F] bg-clip-text text-transparent">
                      Ice Cream Treats
                    </span>{' '}
                    Delivered Fresh!
                  </>
                )}
              </h1>
            </div>

            {/* Subheadline Tagline */}
            <p className="text-sm sm:text-base text-amber-100/90 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {isGrill ? (
                <>
                  Juicy charcoal smash burgers, crispy chicken tikka boti, grilled club sandwiches, zinger wraps, and loaded fries supreme at{' '}
                  <strong className="text-white font-semibold underline decoration-orange-500 decoration-2 underline-offset-4">
                    8B Commercial, Green City, Lahore
                  </strong>
                  . Sizzling and ready for late-night delivery until 2:00 AM!
                </>
              ) : (
                <>
                  Lahore’s favorite ice cream parlor at{' '}
                  <strong className="text-white font-semibold underline decoration-[#FF4B72] decoration-2 underline-offset-4">
                    8B Commercial, Green City, Lahore
                  </strong>
                  . Serving freshly rolled waffle cones, 10 artisanal scoops, Banana Splits, thick shakes, cold coffees, and 20 soda chiller flavors until 2:00 AM!
                </>
              )}
            </p>

            {/* Mobile-First Quick Search Bar at the Top */}
            <div className="pt-2 max-w-xl mx-auto lg:mx-0">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  placeholder={
                    isGrill
                      ? 'Search Charcoal Burgers, Tikka, Sandwiches, Wraps, Fries Supreme...'
                      : 'Search Ice Cream Cones, Sundaes, Shakes, Kulfi, Cold Coffee...'
                  }
                  className="w-full pl-12 pr-28 py-4 rounded-2xl bg-white/95 backdrop-blur-md text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-[#FF4B72]/40 shadow-2xl text-sm font-semibold"
                />
                <i
                  className={`fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-lg ${
                    isGrill ? 'text-orange-500' : 'text-[#FF4B72]'
                  }`}
                ></i>
                <a
                  href="#menu"
                  className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                    isGrill ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#FF4B72] hover:bg-[#E63956]'
                  }`}
                >
                  <span>Search</span>
                  <i className="fa-solid fa-arrow-down text-[10px]"></i>
                </a>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 pt-3 text-[11px]">
                <span className="text-amber-200/70 font-semibold mr-1">Quick Search:</span>
                {activeChips.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleQuickChipClick(item)}
                    className="px-2.5 py-1 rounded-lg bg-[#3D2522] hover:bg-[#FF4B72] text-amber-100 border border-[#52332E] transition-all font-medium cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                href="#menu"
                id="hero-btn-view-menu"
                className={`w-full sm:w-auto px-7 py-3.5 rounded-xl text-white font-bold text-sm shadow-xl transition-all duration-200 text-center flex items-center justify-center gap-2.5 ${
                  isGrill
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-orange-950/60'
                    : 'bg-gradient-to-r from-[#FF4B72] to-[#E63956] hover:from-[#E63956] hover:to-[#C92A43] shadow-[#FF4B72]/20'
                }`}
              >
                {isGrill ? (
                  <i className="fa-solid fa-fire-flame-curved"></i>
                ) : (
                  <i className="fa-solid fa-ice-cream"></i>
                )}
                <span>{isGrill ? "Explore Grill Menu" : "Explore Ice Cream Menu"}</span>
              </a>

              {/* Explicit Shop Switcher Button in Hero CTA */}
              <button
                onClick={() => onSwitchShop(isGrill ? 'ice-cream' : 'grill')}
                id="hero-btn-switch-shop-cta"
                className={`w-full sm:w-auto px-6 py-3.5 rounded-xl border font-bold text-sm transition-all duration-200 text-center flex items-center justify-center gap-2 cursor-pointer ${
                  isGrill
                    ? 'bg-[#2E1813] hover:bg-[#3D201A] text-pink-300 border-[#FF4B72]/60 hover:border-[#FF4B72]'
                    : 'bg-[#2E1813] hover:bg-[#3D201A] text-amber-300 border-orange-500/60 hover:border-orange-500'
                }`}
              >
                {isGrill ? (
                  <>
                    <i className="fa-solid fa-ice-cream text-[#FF4B72]"></i>
                    <span>Go to Frosty's Ice Cream</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-fire text-amber-400"></i>
                    <span>Go to Frosty's Grill</span>
                  </>
                )}
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>

              <button
                onClick={onOpenCallModal}
                id="hero-btn-call"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-transparent hover:bg-[#3D2522]/50 text-amber-200/90 font-semibold text-xs transition-all duration-200 text-center flex items-center justify-center gap-2 border border-dashed border-[#5A3833]"
              >
                <i className="fa-solid fa-phone text-[#38D39F]"></i>
                <span>{STORE_INFO.phone}</span>
              </button>
            </div>

          </div>

          {/* Right Column Banner Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              <div
                className={`absolute -inset-1.5 rounded-3xl opacity-70 blur-md ${
                  isGrill
                    ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600'
                    : 'bg-gradient-to-tr from-[#FF4B72] via-[#FF85A1] to-[#38D39F]'
                }`}
              ></div>
              
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#5A3833] bg-[#221311] shadow-2xl group">
                <img
                  src={isGrill ? smashBurgerImg : heroDessertImg}
                  alt={isGrill ? "Frosty's Grill Burgers & BBQ" : "Frosty's Ice Cream & Gourmet Desserts"}
                  referrerPolicy="no-referrer"
                  className="w-full h-[320px] sm:h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#2D1B18] via-transparent to-transparent opacity-70"></div>

                <div className="absolute top-4 right-4 bg-[#2D1B18]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#52332E] text-xs font-bold text-amber-100 flex items-center gap-1.5 shadow-lg">
                  <i className="fa-solid fa-truck-ramp-box text-[#38D39F]"></i>
                  <span>Green City Local Express</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-[#2D1B18]/90 backdrop-blur-md p-3.5 rounded-xl border border-[#52332E] shadow-xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mb-0.5">
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <span className="text-white ml-1">(4.9/5 Local Rating)</span>
                    </div>
                    <p className="text-xs text-amber-100/90 font-medium">
                      {isGrill
                        ? '"Crispy tikka & smash burgers are legendary in Green City!"'
                        : '"Fast delivery in Green City & best dessert menu!"'}
                    </p>
                  </div>
                  <button
                    onClick={onOpenOrderModal}
                    className={`shrink-0 p-2.5 rounded-lg text-white text-xs font-bold transition-colors ${
                      isGrill ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#FF4B72] hover:bg-[#E63956]'
                    }`}
                    title="Order Now"
                  >
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
