import React, { useState, useEffect } from 'react';
import { STORE_INFO } from '../data/menuData';
import { getStoreStatus } from '../utils/hours';
import { ShopMode } from '../types';
import { FrostyLogo } from './FrostyLogo';

interface NavbarProps {
  cartCount: number;
  onOpenOrderModal: () => void;
  onOpenCallModal: () => void;
  onOpenInventoryModal: () => void;
  onOpenOrderHistoryModal: () => void;
  onOpenAdminModal?: () => void;
  onOpenHelperModal?: () => void;
  lowStockCount?: number;
  ordersCount?: number;
  activeShop: ShopMode;
  onSwitchShop: (shop: ShopMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenOrderModal,
  onOpenCallModal,
  onOpenInventoryModal,
  onOpenOrderHistoryModal,
  onOpenAdminModal,
  onOpenHelperModal,
  lowStockCount = 0,
  ordersCount = 0,
  activeShop,
  onSwitchShop,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [status, setStatus] = useState(getStoreStatus());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Refresh status every minute
    const interval = setInterval(() => {
      setStatus(getStoreStatus());
    }, 60000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { name: 'Menu', href: '#menu' },
    { name: 'About', href: '#about' },
    { name: 'Hours', href: '#hours' },
    { name: 'Location', href: '#location' },
    { name: 'Reviews', href: '#reviews' },
  ];

  const isGrill = activeShop === 'grill';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200/80 py-2.5 sm:py-3'
          : 'bg-white border-b border-stone-100 py-3 sm:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo with Dynamic Shop Theme */}
          <a
            href="#hero"
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none cursor-pointer shrink-0"
            id="navbar-logo"
            title={isGrill ? "Frosty's Grill - Snowman Fire Edition 🔥" : "Frosty's Ice Cream - White Snowman ⛄"}
          >
            <div className="relative shrink-0">
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-105 p-1 ${
                  isGrill
                    ? 'bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 shadow-orange-950/20'
                    : 'bg-gradient-to-tr from-[#0284C7] via-[#38BDF8] to-[#FF4B72] shadow-sky-950/20'
                }`}
              >
                <FrostyLogo
                  variant={isGrill ? 'fire' : 'ice'}
                  size="custom"
                  className="w-8 h-8 sm:w-9 sm:h-9"
                  animate={false}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-lg sm:text-2xl tracking-tight text-stone-900 group-hover:text-[#FF4B72] transition-colors">
                  {isGrill ? "Frosty's Grill" : "Frosty's"}
                </span>
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    status.isOpen ? 'bg-emerald-500' : 'bg-amber-400'
                  }`}
                  title={status.isOpen ? 'Open Now (4 PM - 2 AM)' : 'Opens at 4 PM'}
                ></span>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block -mt-0.5 sm:-mt-1">
                {isGrill ? 'Charcoal Fast Food & BBQ' : 'Ice Cream & Desserts'}
              </span>
            </div>
          </a>

          {/* Center: Sleek Segmented Shop Switcher (Desktop & Tablet) */}
          <div className="flex items-center p-1 rounded-full bg-stone-100 border border-stone-200/80 shadow-inner">
            <button
              onClick={() => onSwitchShop('ice-cream')}
              id="nav-switch-icecream"
              title="Shop Frosty's Handcrafted Ice Cream & Shakes (White Snowman Edition)"
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                !isGrill
                  ? 'bg-white text-[#FF4B72] shadow-sm font-black scale-[1.02]'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <FrostyLogo variant="ice" size="xs" className="w-4 h-4" animate={false} />
              <span className="hidden xs:inline">Frosty's</span>
              <span className="xs:hidden">Ice Cream</span>
              {!isGrill && (
                <span className="hidden sm:inline text-[9px] bg-sky-100 text-sky-700 font-black px-1.5 py-0.2 rounded-full uppercase">
                  Active
                </span>
              )}
            </button>

            <button
              onClick={() => onSwitchShop('grill')}
              id="nav-switch-grill"
              title="Shop Frosty's Charcoal Burgers, Sandwiches & BBQ (Fire Edition)"
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                isGrill
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm font-black scale-[1.02]'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <FrostyLogo variant="fire" size="xs" className="w-4 h-4" animate={false} />
              <span className="hidden xs:inline">Frosty's Grill</span>
              <span className="xs:hidden">Grill</span>
              {isGrill && (
                <span className="hidden sm:inline text-[9px] bg-white/20 text-white font-black px-1.5 py-0.2 rounded-full uppercase">
                  Active
                </span>
              )}
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-5 text-sm font-bold text-stone-600" id="desktop-nav">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-[#FF4B72] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Actions: AI Helper, Cart & Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Bilingual AI Assistant Button */}
            {onOpenHelperModal && (
              <button
                onClick={onOpenHelperModal}
                id="btn-helper-nav"
                className="px-2.5 sm:px-3 py-2 rounded-xl bg-pink-50 hover:bg-pink-100/80 text-[#FF4B72] border border-pink-200/70 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Bilingual Helper AI (شاپ اسسٹنٹ)"
              >
                <i className="fa-solid fa-wand-magic-sparkles text-sm"></i>
                <span className="hidden sm:inline">AI Helper</span>
              </button>
            )}

            {/* Admin Control Lock Button */}
            {onOpenAdminModal && (
              <button
                onClick={onOpenAdminModal}
                id="btn-admin-lock-nav"
                className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 border border-stone-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                title="Owner Admin Control (Password Protected)"
                aria-label="Admin Control Lock"
              >
                <i className="fa-solid fa-lock text-stone-700 text-xs sm:text-sm"></i>
                <span className="hidden xl:inline text-[11px] font-bold">Admin</span>
              </button>
            )}

            {/* Quick Call Button (Desktop) */}
            <a
              href={`tel:${isGrill ? '03254826051' : STORE_INFO.phone}`}
              className="hidden md:flex p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-xs font-bold items-center gap-1.5 border border-stone-200"
              title="Call Store Hotline"
            >
              <i className="fa-solid fa-phone text-xs text-stone-500"></i>
              <span className="hidden lg:inline">{isGrill ? '0325 4826051' : 'Call'}</span>
            </a>

            {/* Cart Trigger */}
            <button
              onClick={onOpenOrderModal}
              id="btn-order-now-nav"
              className="px-3 sm:px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <i className="fa-solid fa-cart-shopping text-xs sm:text-sm"></i>
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-[#FF4B72] text-white font-extrabold text-[11px] px-1.5 py-0.2 rounded-full min-w-5 text-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="btn-mobile-menu-toggle"
              className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 hover:text-stone-900 focus:outline-none cursor-pointer"
              aria-label="Toggle navigation drawer"
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
            </button>
          </div>

        </div>
      </div>

      {/* Clean, Bright Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="bg-white border-b border-stone-200 px-4 pt-3 pb-5 space-y-3 shadow-lg animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 text-xs">
            <span className="text-stone-500 flex items-center gap-1.5">
              <i className="fa-solid fa-location-dot text-[#FF4B72]"></i>
              8B Commercial, Green City, Lahore
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                status.isOpen ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
              }`}
            >
              {status.isOpen ? 'Open Now (4 PM - 2 AM)' : 'Opens 4:00 PM'}
            </span>
          </div>

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold flex items-center gap-2"
              >
                <i className="fa-solid fa-chevron-right text-[10px] text-stone-400"></i>
                <span>{link.name}</span>
              </a>
            ))}
          </div>

          {/* Quick Call & Hotline */}
          <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
            <a
              href="tel:03254826051"
              className="flex-1 py-2.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold flex items-center justify-center gap-2 border border-orange-200"
            >
              <i className="fa-solid fa-phone text-orange-600"></i>
              <span>Grill Hotline: 0325 4826051</span>
            </a>
          </div>

          {/* Admin Portal Button if configured */}
          {onOpenAdminModal && (
            <div className="pt-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminModal();
                }}
                className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-lock text-stone-500"></i>
                <span>Owner Portal (PIN Protected)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
