import React from 'react';
import { STORE_INFO, heroDessertImg, grilledChickenBurgerImg } from '../data/menuData';
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
    'Banana Split Deluxe',
    'Super Cup',
    'Cold Coffee',
    'Oreo Shake',
    'Vanilla Scoop',
  ];

  const grillChips = [
    'Grilled Chicken Burger',
    'Grilled Chicken Sandwich',
    'Grilled Chicken Wrap',
    'Fries Supreme',
    'Grilled Chicken Fries Supreme',
    'Regular Fries',
  ];

  const activeChips = isGrill ? grillChips : iceCreamChips;

  return (
    <section
      id="hero"
      className={`relative pt-24 pb-12 sm:pt-28 sm:pb-16 transition-colors duration-300 ${
        isGrill
          ? 'bg-gradient-to-b from-[#FFF7ED] via-[#FFFDF9] to-[#FAFAF9]'
          : 'bg-gradient-to-b from-[#FFF5F8] via-[#FFFAF8] to-[#FAFAF9]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Shop Switch Banner Notification */}
        <div className="mb-6 max-w-2xl mx-auto lg:mx-0 p-2 sm:p-2.5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 pl-2 text-xs text-stone-700">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isGrill ? 'bg-orange-500 animate-pulse' : 'bg-[#FF4B72] animate-pulse'
              }`}
            ></span>
            <span>
              Now Browsing:{' '}
              <strong className="text-stone-900 font-extrabold">
                {isGrill ? "Frosty's Grill (Fresh Fast Food)" : "Frosty's (Fresh Ice Cream & Desserts)"}
              </strong>
            </span>
          </div>

          <button
            onClick={() => onSwitchShop(isGrill ? 'ice-cream' : 'grill')}
            id="hero-banner-switch-shop"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 shadow-xs ${
              isGrill
                ? 'bg-pink-50 hover:bg-pink-100 text-[#FF4B72] border border-pink-200'
                : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200'
            }`}
          >
            {isGrill ? (
              <>
                <i className="fa-solid fa-ice-cream text-[11px]"></i>
                <span>Switch to Ice Cream</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-fire text-[11px]"></i>
                <span>Switch to Grill Shop</span>
              </>
            )}
            <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column Text Content */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 shadow-2xs text-xs font-bold text-stone-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <i className="fa-solid fa-clock text-emerald-600"></i>
              <span>Open Late Night • 4:00 PM to 2:00 AM Daily</span>
            </div>

            {/* Headline */}
            <div>
              <span
                className={`block text-xs font-extrabold uppercase tracking-widest mb-1.5 ${
                  isGrill ? 'text-orange-600' : 'text-[#FF4B72]'
                }`}
              >
                {isGrill ? "Frosty's Grill • Grilled Fresh. Made Right." : "Frosty's Ice Cream • 8B Commercial, Green City"}
              </span>
              <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.12] text-stone-900">
                {isGrill ? (
                  <>
                    Grilled Fresh. <br className="hidden sm:inline" />
                    <span className="text-orange-600">
                      Made Right.
                    </span>{' '}
                    Delivered Fast!
                  </>
                ) : (
                  <>
                    Fresh Scoops, Sundaes & <br className="hidden sm:inline" />
                    <span className="text-[#FF4B72]">
                      Pure Cream Treats
                    </span>{' '}
                    Delivered Fresh!
                  </>
                )}
              </h1>
            </div>

            {/* Subheadline */}
            <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {isGrill ? (
                <>
                  Flame-grilled chicken burgers, tender sandwiches, juicy wraps, and loaded fries supreme at{' '}
                  <strong className="text-stone-900 font-bold">8B Commercial, Green City, Lahore</strong>. Order online for delivery or takeaway!
                </>
              ) : (
                <>
                  Freshly rolled waffle cones, pure cream fresh scoops, Banana Splits, thick shakes, and chilled soda chillers at{' '}
                  <strong className="text-stone-900 font-bold">8B Commercial, Green City, Lahore</strong>. Pure dairy delight in every bite!
                </>
              )}
            </p>

            {/* Search Bar */}
            <div className="pt-1 max-w-xl mx-auto lg:mx-0">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  placeholder={
                    isGrill
                      ? 'Search Grilled Chicken Burger, Sandwich, Wrap, Fries Supreme...'
                      : 'Search Waffle Cones, Banana Split, Fresh Scoops, Shakes...'
                  }
                  className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-white border-2 border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 shadow-xs text-xs sm:text-sm font-semibold transition-all"
                />
                <i
                  className={`fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-base ${
                    isGrill ? 'text-orange-500' : 'text-[#FF4B72]'
                  }`}
                ></i>
                <a
                  href="#menu"
                  className={`absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                    isGrill
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-95'
                      : 'bg-gradient-to-r from-[#FF4B72] to-[#FF85A1] hover:opacity-95'
                  }`}
                >
                  <span>Explore</span>
                  <i className="fa-solid fa-arrow-down text-[10px]"></i>
                </a>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 pt-2.5 text-xs">
                <span className="text-stone-500 text-[11px] font-semibold mr-1">Popular:</span>
                {activeChips.slice(0, 6).map((item) => (
                  <button
                    key={item}
                    onClick={() => handleQuickChipClick(item)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs transition-all text-[11px] font-medium cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                href="#menu"
                id="hero-btn-view-menu"
                className={`w-full sm:w-auto px-6 py-3.5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-sm transition-all text-center flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95 ${
                  isGrill
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                    : 'bg-[#FF4B72] hover:bg-[#E63956]'
                }`}
              >
                {isGrill ? (
                  <i className="fa-solid fa-fire text-sm"></i>
                ) : (
                  <i className="fa-solid fa-ice-cream text-sm"></i>
                )}
                <span>{isGrill ? "View Grill Menu" : "View Ice Cream Menu"}</span>
              </a>

              <a
                href={`tel:${isGrill ? '03254826051' : STORE_INFO.phone}`}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs sm:text-sm border border-stone-200 transition-all text-center flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <i className="fa-solid fa-phone text-stone-500"></i>
                <span>{isGrill ? 'Grill Hotline: 0325 4826051' : 'Call Store'}</span>
              </a>
            </div>

          </div>

          {/* Right Column Imagery Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="bg-white p-3 sm:p-4 rounded-3xl border border-stone-200/90 shadow-md">
                <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-stone-100">
                  <img
                    src={isGrill ? grilledChickenBurgerImg : heroDessertImg}
                    alt={isGrill ? "Frosty's Grilled Chicken Burger" : "Frosty's Fresh Ice Cream & Sundaes"}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-extrabold text-stone-900 shadow-xs flex items-center gap-1.5 border border-stone-100">
                    <i className="fa-solid fa-star text-amber-400 text-xs"></i>
                    <span>4.9 / 5 Rated in Green City</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-stone-100 shadow-xs flex items-center justify-between">
                    <div>
                      <h4 className="font-heading font-extrabold text-sm text-stone-900">
                        {isGrill ? 'Flame-Grilled Burgers' : 'Handmade Ice Creams'}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        {isGrill ? 'From Rs. 250 • We Deliver in Green City' : 'Fresh Cones, Cups & Splits'}
                      </p>
                    </div>
                    <a
                      href="#menu"
                      className={`px-3 py-1.5 rounded-lg text-white font-bold text-xs ${
                        isGrill ? 'bg-orange-600 hover:bg-orange-700' : 'bg-[#FF4B72] hover:bg-[#E63956]'
                      }`}
                    >
                      Order
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
