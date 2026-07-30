import React from 'react';
import { STORE_INFO, heroDessertImg } from '../data/menuData';

interface HeroProps {
  onOpenOrderModal: () => void;
  onOpenCallModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenOrderModal, onOpenCallModal }) => {
  return (
    <section
      id="hero"
      className="relative pt-28 pb-16 lg:pt-36 lg:pb-28 bg-[#2D1B18] text-white overflow-hidden"
    >
      {/* Soft Background Accents */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#FF4B72]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#38D39F]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3D2522] border border-[#5A3833] text-xs sm:text-sm font-semibold text-[#FF85A1] shadow-inner">
              <span className="w-2 h-2 rounded-full bg-[#FF4B72] animate-ping"></span>
              <i className="fa-solid fa-moon text-[#38D39F]"></i>
              <span>Open Late Night • 4:00 PM to 2:00 AM Daily</span>
            </div>

            {/* Catchy Main Headline */}
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-amber-50">
              Satisfy Your Late-Night <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#FF4B72] via-[#FF85A1] to-[#38D39F] bg-clip-text text-transparent">
                Sweet Tooth
              </span>{' '}
              at Frosty's!
            </h1>

            {/* Subheadline mentioning Green City, Lahore */}
            <p className="text-base sm:text-lg text-amber-100/90 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Lahore’s favorite late-night dessert haven at{' '}
              <strong className="text-white font-semibold underline decoration-[#FF4B72] decoration-2 underline-offset-4">
                8B Commercial, Green City
              </strong>
              . Serving signature sundaes, thick shakes, warm Nutella waffles, and freshly churned artisanal scoops until 2:00 AM every single night.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 text-xs font-semibold text-amber-200/90">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3D2522]/80 border border-[#52332E]">
                <i className="fa-solid fa-check text-[#38D39F]"></i> Fresh Belgian Waffles
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3D2522]/80 border border-[#52332E]">
                <i className="fa-solid fa-check text-[#38D39F]"></i> 100% Pure Milk Shakes
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3D2522]/80 border border-[#52332E]">
                <i className="fa-solid fa-check text-[#38D39F]"></i> Dine-In & Takeaway
              </span>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              {/* Primary Action: View Menu */}
              <a
                href="#menu"
                id="hero-btn-view-menu"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#FF4B72] to-[#E63956] hover:from-[#E63956] hover:to-[#C92A43] text-white font-bold text-base shadow-xl shadow-[#FF4B72]/20 hover:shadow-2xl transition-all duration-200 text-center flex items-center justify-center gap-3 hover:-translate-y-0.5"
              >
                <i className="fa-solid fa-book-open"></i>
                <span>View Menu</span>
              </a>

              {/* Get Directions */}
              <a
                href={STORE_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="hero-btn-directions"
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#3D2522] hover:bg-[#4D302C] text-amber-100 hover:text-white border border-[#5A3833] font-bold text-base transition-all duration-200 text-center flex items-center justify-center gap-2.5 hover:-translate-y-0.5"
              >
                <i className="fa-solid fa-location-dot text-[#FF4B72]"></i>
                <span>Get Directions</span>
              </a>

              {/* Call Store */}
              <button
                onClick={onOpenCallModal}
                id="hero-btn-call"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-transparent hover:bg-[#3D2522]/50 text-amber-200/90 font-semibold text-sm transition-all duration-200 text-center flex items-center justify-center gap-2 border border-dashed border-[#5A3833]"
              >
                <i className="fa-solid fa-phone text-[#38D39F]"></i>
                <span>{STORE_INFO.phone}</span>
              </button>
            </div>

            {/* Quick Location Note */}
            <div className="pt-2 text-xs text-amber-200/70 flex items-center justify-center lg:justify-start gap-2">
              <i className="fa-solid fa-clock text-[#FF4B72]"></i>
              <span>4:00 PM – 2:00 AM (Monday – Sunday)</span>
            </div>

          </div>

          {/* Right Column Visual Banner */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer Decorative Ring */}
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-[#FF4B72] via-[#FF85A1] to-[#38D39F] opacity-70 blur-md"></div>
              
              {/* Main Image Container */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#5A3833] bg-[#221311] shadow-2xl group">
                <img
                  src={heroDessertImg}
                  alt="Frosty's Gourmet Desserts - Oreo Sundaes, Nutella Shakes, Belgian Waffles"
                  referrerPolicy="no-referrer"
                  className="w-full h-[380px] sm:h-[440px] object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D1B18] via-transparent to-transparent opacity-60"></div>

                {/* Floating Top Badge */}
                <div className="absolute top-4 right-4 bg-[#2D1B18]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#52332E] text-xs font-bold text-amber-100 flex items-center gap-1.5 shadow-lg">
                  <i className="fa-solid fa-fire text-[#FF4B72]"></i>
                  <span>Green City's #1 Dessert Spot</span>
                </div>

                {/* Floating Bottom Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#2D1B18]/90 backdrop-blur-md p-4 rounded-xl border border-[#52332E] shadow-xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mb-0.5">
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <span className="text-white ml-1">(4.9/5 from 1,200+ Foodies)</span>
                    </div>
                    <p className="text-xs text-amber-100/90 font-medium">
                      "Best Lotus Sundae & Nutella Waffle in Lahore!"
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
