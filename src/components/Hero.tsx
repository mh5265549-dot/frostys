import React from 'react';
import { STORE_INFO, heroDessertImg } from '../data/menuData';

interface HeroProps {
  onOpenOrderModal: () => void;
  onOpenCallModal: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onQuickSearch?: (term: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenOrderModal,
  onOpenCallModal,
  searchQuery = '',
  onSearchChange,
  onQuickSearch,
}) => {
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

  return (
    <section
      id="hero"
      className="relative pt-24 pb-12 lg:pt-32 lg:pb-20 bg-[#2D1B18] text-white overflow-hidden"
    >
      {/* Soft Background Accents */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#FF4B72]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#38D39F]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
              <span className="block font-heading text-xs font-extrabold uppercase tracking-widest text-[#FF85A1] mb-1">
                Welcome to {STORE_INFO.name} Ice Cream & Desserts
              </span>
              <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.15] text-amber-50">
                Satisfy Your Late-Night <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#FF4B72] via-[#FF85A1] to-[#38D39F] bg-clip-text text-transparent">
                  Sweet Cravings
                </span>{' '}
                Delivered Fresh!
              </h1>
            </div>

            {/* Subheadline Tagline */}
            <p className="text-sm sm:text-base text-amber-100/90 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Lahore’s favorite dessert haven at{' '}
              <strong className="text-white font-semibold underline decoration-[#FF4B72] decoration-2 underline-offset-4">
                8B Commercial, Green City, Lahore
              </strong>
              . Serving signature sundaes, Banana Splits, ice cream milkshakes, cold coffees, creamy kulfi, and 20 soda chillers until 2:00 AM!
            </p>

            {/* Mobile-First Quick Search Bar at the Top */}
            <div className="pt-2 max-w-xl mx-auto lg:mx-0">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  placeholder="Search Ice Cream Cones, Banana Split, Kulfi, Cold Coffee, Soda Chillers..."
                  className="w-full pl-12 pr-28 py-4 rounded-2xl bg-white/95 backdrop-blur-md text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-[#FF4B72]/40 shadow-2xl text-sm font-semibold"
                />
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[#FF4B72] text-lg"></i>
                <a
                  href="#menu"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2.5 rounded-xl bg-[#FF4B72] hover:bg-[#E63956] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <span>Search</span>
                  <i className="fa-solid fa-arrow-down text-[10px]"></i>
                </a>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 pt-3 text-[11px]">
                <span className="text-amber-200/70 font-semibold mr-1">Quick Search:</span>
                {['Cone', 'Mango Cone', 'Vanilla Cone', 'Chocolate Cone', 'Banana Split', 'Cold Coffee', 'Kulfi', 'Soda Chiller', 'Deals'].map((item) => (
                  <button
                    key={item}
                    onClick={() => handleQuickChipClick(item)}
                    className="px-2.5 py-1 rounded-lg bg-[#3D2522] hover:bg-[#FF4B72] text-amber-100 border border-[#52332E] transition-all font-medium"
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
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#FF4B72] to-[#E63956] hover:from-[#E63956] hover:to-[#C92A43] text-white font-bold text-sm shadow-xl shadow-[#FF4B72]/20 hover:shadow-2xl transition-all duration-200 text-center flex items-center justify-center gap-2.5"
              >
                <i className="fa-solid fa-store"></i>
                <span>Explore Catalog</span>
              </a>

              <a
                href={STORE_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="hero-btn-directions"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#3D2522] hover:bg-[#4D302C] text-amber-100 border border-[#5A3833] font-bold text-sm transition-all duration-200 text-center flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-location-dot text-[#FF4B72]"></i>
                <span>Find Store</span>
              </a>

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
              
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-[#FF4B72] via-[#FF85A1] to-[#38D39F] opacity-70 blur-md"></div>
              
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#5A3833] bg-[#221311] shadow-2xl group">
                <img
                  src={heroDessertImg}
                  alt="Frosty's Supermarket Catalog & Gourmet Desserts"
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
                      "Fast delivery in Green City & best dessert menu!"
                    </p>
                  </div>
                  <button
                    onClick={onOpenOrderModal}
                    className="shrink-0 p-2.5 rounded-lg bg-[#FF4B72] hover:bg-[#E63956] text-white text-xs font-bold transition-colors"
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

