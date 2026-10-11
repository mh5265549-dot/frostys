import React from 'react';
import { STORE_INFO, outdoorRestaurantImg } from '../data/menuData';
import { ShopMode } from '../types';
import { SlideFillButton } from './SlideFillButton';
import { FluidText } from './FluidText';

interface HeroProps {
  onOpenOrderModal: () => void;
  onOpenCallModal: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onQuickSearch?: (term: string) => void;
  activeShop?: ShopMode;
  onSwitchShop?: (shop: ShopMode) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenOrderModal,
}) => {
  return (
    <section
      id="hero"
      className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 bg-gradient-to-b from-[#F0F7FF] via-[#F8FAFC] to-[#FFFFFF] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-blue-100">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 shadow-2xs text-xs font-bold text-blue-900">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            <i className="fa-solid fa-clock text-red-600"></i>
            <span>Open Daily • 5:00 PM to 2:00 AM</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-stone-600">
            <i className="fa-solid fa-location-dot text-red-600"></i>
            <span>8B Commercial Area, Green City, Lahore</span>
          </div>
        </div>

        {/* Featured Storefront Picture at the Top */}
        <div className="relative rounded-3xl overflow-hidden border border-blue-200/80 shadow-md bg-stone-900 group mb-8">
          <img
            src={outdoorRestaurantImg}
            alt="Frosty's Outdoor Restaurant & Ice Cream Parlor in Green City Lahore"
            referrerPolicy="no-referrer"
            className="w-full h-72 sm:h-96 lg:h-[420px] object-cover group-hover:scale-102 transition-transform duration-700"
          />
          {/* Subtle Gradient Overlays for High Contrast Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none"></div>

          {/* Top Corner Badges */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between gap-2 pointer-events-auto">
            <div className="bg-stone-900/85 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-extrabold text-white border border-white/20 shadow-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span>Frosty's Outdoor Restaurant & Counter</span>
            </div>
            <div className="bg-stone-900/85 backdrop-blur-md px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-extrabold text-amber-300 border border-white/20 shadow-md flex items-center gap-1.5">
              <i className="fa-solid fa-star text-amber-400"></i>
              <span>4.9 / 5.0 (180+ Reviews)</span>
            </div>
          </div>

          {/* Bottom Content Bar Overlay */}
          <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-4 pointer-events-auto">
            <div className="text-white max-w-xl">
              <span className="inline-block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-blue-200 bg-blue-950/70 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-blue-500/30 mb-1.5">
                8B Commercial, Green City Lahore
              </span>
              <div className="h-9 sm:h-11 w-full max-w-xl mb-1">
                <FluidText
                  text="Late-Night Ice Cream & Grill Spot"
                  color="#FFFFFF"
                  align="left"
                  headingLevel={2}
                  font={{
                    fontFamily: "Outfit, 'Plus Jakarta Sans', sans-serif",
                    fontWeight: 900,
                    fontSize: "26px",
                    textAlign: "left",
                  }}
                  paletteColors={["#f87171", "#60a5fa", "#f472b6", "#fbbf24", "#38bdf8"]}
                  className="w-full h-full"
                />
              </div>
              <p className="text-xs sm:text-sm text-stone-200 mt-1 drop-shadow-sm leading-relaxed hidden sm:block">
                Outdoor open-air dining under the night sky, pure dairy ice cream scoops, freshly rolled waffle cones, charcoal BBQ & platters, flame-grilled burgers & loaded fries.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <SlideFillButton
                href="#menu"
                fill="#dc2626"
                textColor="#ffffff"
                hoverFill="#1e293b"
                hoverTextColor="#ffffff"
                direction="up"
                rounded={12}
                padding="10px 20px"
                className="flex-1 sm:flex-initial text-xs sm:text-sm shadow-md"
              >
                <i className="fa-solid fa-utensils"></i>
                <span>Explore Menu</span>
              </SlideFillButton>
              <SlideFillButton
                onClick={onOpenOrderModal}
                fill="#ffffff"
                textColor="#1c1917"
                hoverFill="#dc2626"
                hoverTextColor="#ffffff"
                direction="up"
                rounded={12}
                padding="10px 16px"
                className="flex-1 sm:flex-initial text-xs sm:text-sm shadow-md"
              >
                <i className="fa-brands fa-whatsapp text-red-600 text-sm"></i>
                <span>WhatsApp Order</span>
              </SlideFillButton>
            </div>
          </div>
        </div>

        {/* Content & Action Area */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div>
            <span className="inline-block text-xs font-extrabold uppercase tracking-widest mb-1.5 text-red-700 bg-white border border-red-200 px-3 py-1 rounded-full shadow-2xs">
              Fresh Handcrafted Menu
            </span>
            <div className="h-11 sm:h-14 md:h-16 w-full max-w-2xl mx-auto my-2">
              <FluidText
                text="SATISFY MIDNIGHT CRAVINGS"
                color="#1C1917"
                align="center"
                headingLevel={1}
                font={{
                  fontFamily: "Outfit, 'Plus Jakarta Sans', sans-serif",
                  fontWeight: 900,
                  fontSize: "36px",
                  textAlign: "center",
                }}
                paletteColors={["#dc2626", "#2563eb", "#ec4899", "#f59e0b", "#06b6d4"]}
                className="w-full h-full"
              />
            </div>
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-red-600 mb-1">
              Pure Dairy Ice Cream Scoops & Flame-Grilled Treats
            </p>
            <p className="text-sm sm:text-base text-stone-600 mt-2 leading-relaxed max-w-2xl mx-auto">
              Welcome to Frosty's & Grill in Green City, Lahore. Indulge in artisanal fresh scoops, freshly rolled waffle cones, decadent sundaes, authentic charcoal Chicken Tikka, tender Malai Boti, sizzling BBQ Platters, flame-grilled burgers, and loaded fries — served fresh until 2:00 AM.
            </p>
          </div>

          {/* Direct Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <SlideFillButton
              href="#menu"
              id="hero-btn-view-menu"
              fill="#dc2626"
              textColor="#ffffff"
              hoverFill="#0f172a"
              hoverTextColor="#ffffff"
              direction="up"
              rounded={14}
              padding="14px 24px"
              className="text-xs sm:text-sm shadow-md"
            >
              <i className="fa-solid fa-fire-burner"></i>
              <span>Browse Full Menu (35+ Items)</span>
            </SlideFillButton>
            <SlideFillButton
              onClick={onOpenOrderModal}
              fill="#ffffff"
              textColor="#1e3a8a"
              hoverFill="#dc2626"
              hoverTextColor="#ffffff"
              borderColor="#bfdbfe"
              direction="up"
              rounded={14}
              padding="14px 20px"
              className="text-xs sm:text-sm shadow-2xs"
            >
              <i className="fa-brands fa-whatsapp text-red-600 text-sm"></i>
              <span>Order on WhatsApp</span>
            </SlideFillButton>
            <SlideFillButton
              href={`tel:${STORE_INFO.phone}`}
              fill="#ffffff"
              textColor="#1c1917"
              hoverFill="#1e293b"
              hoverTextColor="#ffffff"
              borderColor="#e7e5e4"
              direction="up"
              rounded={14}
              padding="14px 20px"
              className="text-xs sm:text-sm shadow-2xs"
            >
              <i className="fa-solid fa-phone text-red-600"></i>
              <span>Hotline: {STORE_INFO.phone}</span>
            </SlideFillButton>
          </div>
        </div>

        {/* 4-Pill Feature Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-6 border-t border-stone-200/80">
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
              <i className="fa-solid fa-ice-cream"></i>
            </div>
            <div>
              <h4 className="font-heading font-bold text-xs text-stone-900">100% Pure Dairy</h4>
              <p className="text-[10px] text-stone-500">Pure cream scoops & sundaes</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold shrink-0">
              <i className="fa-solid fa-fire-burner"></i>
            </div>
            <div>
              <h4 className="font-heading font-bold text-xs text-stone-900">Flame-Grilled</h4>
              <p className="text-[10px] text-stone-500">Burgers, wraps & fries supreme</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
              <i className="fa-solid fa-moon"></i>
            </div>
            <div>
              <h4 className="font-heading font-bold text-xs text-stone-900">Open Till 2 AM</h4>
              <p className="text-[10px] text-stone-500">Daily late-night service</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold shrink-0">
              <i className="fa-solid fa-chair"></i>
            </div>
            <div>
              <h4 className="font-heading font-bold text-xs text-stone-900">Outdoor Seating</h4>
              <p className="text-[10px] text-stone-500">8B Commercial Green City</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
