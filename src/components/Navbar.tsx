import React, { useState, useEffect } from 'react';
import { STORE_INFO } from '../data/menuData';
import { getStoreStatus } from '../utils/hours';
import { ThemeToggle } from './ThemeToggle';
import { ShopMode } from '../types';

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
          ? 'bg-[#2D1B18]/95 backdrop-blur-md shadow-lg border-b border-[#3D2522] py-3'
          : 'bg-[#2D1B18] py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo with Active Shop Branding */}
          <a
            href="#hero"
            className="flex items-center gap-3 group focus:outline-none cursor-pointer"
            id="navbar-logo"
            title={isGrill ? "Frosty's Grill - Green City, Lahore" : "Frosty's Ice Cream - Green City, Lahore"}
          >
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-all duration-300 ${
                  isGrill
                    ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 shadow-orange-950/60'
                    : 'bg-gradient-to-tr from-[#FF4B72] to-[#FF85A1]'
                }`}
              >
                {isGrill ? (
                  <i className="fa-solid fa-fire-flame-curved text-xl"></i>
                ) : (
                  <i className="fa-solid fa-ice-cream text-xl"></i>
                )}
              </div>
            </div>
            <div>
              <span className="font-heading font-black text-xl sm:text-2xl tracking-tight text-white flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                {isGrill ? "Frosty's Grill" : "Frosty's"}
                <span
                  className={`inline-block w-2 h-2 rounded-full animate-pulse ${
                    isGrill ? 'bg-amber-400' : 'bg-[#38D39F]'
                  }`}
                ></span>
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-widest block -mt-1 transition-colors ${
                  isGrill ? 'text-amber-300' : 'text-[#FF85A1]'
                }`}
              >
                {isGrill ? 'Charcoal BBQ & Fast Food' : 'Ice Cream & Desserts'}
              </span>
            </div>
          </a>

          {/* Desktop Shop Switcher Control */}
          <div className="hidden md:flex items-center p-1 rounded-2xl bg-[#190E0C] border border-[#422622] shadow-inner">
            <button
              onClick={() => onSwitchShop('ice-cream')}
              id="nav-switch-icecream"
              title="Shop Frosty's Handcrafted Ice Cream & Shakes"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                !isGrill
                  ? 'bg-gradient-to-r from-[#FF4B72] to-[#FF85A1] text-white shadow-md shadow-pink-950/60 scale-[1.02]'
                  : 'text-amber-200/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <i className="fa-solid fa-ice-cream text-xs"></i>
              <span>Frosty's (Ice Cream)</span>
              {!isGrill && (
                <span className="text-[9px] bg-white/25 text-white font-black px-1.5 py-0.2 rounded-full uppercase">
                  Active
                </span>
              )}
            </button>

            <button
              onClick={() => onSwitchShop('grill')}
              id="nav-switch-grill"
              title="Shop Frosty's Charcoal Burgers, Sandwiches & BBQ"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                isGrill
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white shadow-md shadow-orange-950/80 scale-[1.02]'
                  : 'text-amber-200/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <i className="fa-solid fa-fire-flame-curved text-xs text-amber-300"></i>
              <span>Frosty's Grill</span>
              {isGrill && (
                <span className="text-[9px] bg-white/25 text-white font-black px-1.5 py-0.2 rounded-full uppercase">
                  Active
                </span>
              )}
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6" id="desktop-nav">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-amber-100/90 hover:text-[#FF85A1] font-medium text-sm transition-colors tracking-wide hover:underline decoration-2 underline-offset-8"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Area */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Live Open Badge */}
            <div
              className={`hidden lg:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                status.isOpen
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              }`}
              title={status.nextChangeText}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  status.isOpen ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                }`}
              ></span>
              <span>{status.statusText}</span>
            </div>

            {/* Admin / Owner Portal Button */}
            {onOpenAdminModal && (
              <button
                onClick={onOpenAdminModal}
                id="btn-admin-nav"
                className="p-2.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-600/50 hover:to-amber-500/40 text-amber-200 hover:text-amber-100 transition-all duration-200 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                title="Owner Admin Portal (PIN Protected)"
              >
                <i className="fa-solid fa-lock text-amber-400"></i>
                <span className="hidden xl:inline">Owner Portal</span>
              </button>
            )}

            {/* Helper AI Assistant Button */}
            {onOpenHelperModal && (
              <button
                onClick={onOpenHelperModal}
                id="btn-helper-nav"
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#FF4B72]/20 to-[#FF85A1]/20 hover:from-[#FF4B72]/40 hover:to-[#FF85A1]/30 text-white transition-all duration-200 border border-[#FF4B72]/50 text-xs font-bold flex items-center gap-1.5 shadow-sm group"
                title="Bilingual Helper AI (شاپ اسسٹنٹ)"
              >
                <i className="fa-solid fa-headset text-[#FF85A1] group-hover:scale-110 transition-transform"></i>
                <span className="hidden xl:inline">AI Helper</span>
              </button>
            )}

            {/* Theme Switcher Toggle */}
            <ThemeToggle variant="icon" />

            {/* Quick Call Button */}
            <button
              onClick={onOpenCallModal}
              id="btn-call-store"
              className="p-2.5 rounded-xl bg-[#3D2522] hover:bg-[#4D302C] text-amber-100 hover:text-white transition-all duration-200 border border-[#52332E] text-xs font-semibold flex items-center gap-2"
              title="Call Store directly"
            >
              <i className="fa-solid fa-phone text-[#FF4B72]"></i>
              <span className="hidden xl:inline">Call Us</span>
            </button>

            {/* Order Now Button */}
            <button
              onClick={onOpenOrderModal}
              id="btn-order-now-nav"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4B72] to-[#E63956] hover:from-[#E63956] hover:to-[#C92A43] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
            >
              <i className="fa-solid fa-bag-shopping"></i>
              <span>Order Now</span>
              {cartCount > 0 && (
                <span className="ml-1 bg-white text-[#E63956] font-extrabold text-xs px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex sm:hidden items-center gap-1.5">
            {/* Mobile Shop Switcher Pill */}
            <button
              onClick={() => onSwitchShop(isGrill ? 'ice-cream' : 'grill')}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 border shadow-sm ${
                isGrill
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-orange-400'
                  : 'bg-gradient-to-r from-[#FF4B72] to-[#FF85A1] text-white border-pink-400'
              }`}
              title={isGrill ? "Switch to Frosty's Ice Cream" : "Switch to Frosty's Grill"}
            >
              {isGrill ? (
                <>
                  <i className="fa-solid fa-fire text-[11px]"></i>
                  <span className="text-[10px] font-black">Grill</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-ice-cream text-[11px]"></i>
                  <span className="text-[10px] font-black">Ice Cream</span>
                </>
              )}
            </button>

            {/* Quick Mobile Theme Switcher */}
            <ThemeToggle variant="icon" className="!p-2 !rounded-lg" />

            <button
              onClick={onOpenOrderModal}
              className="p-2 rounded-lg bg-[#FF4B72] text-white font-bold text-xs flex items-center gap-1.5"
            >
              <i className="fa-solid fa-bag-shopping"></i>
              {cartCount > 0 && (
                <span className="bg-white text-[#FF4B72] text-[10px] font-black px-1.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="btn-mobile-menu-toggle"
              className="p-2 rounded-lg text-amber-100 hover:bg-[#3D2522] focus:outline-none"
              aria-label="Toggle menu"
            >
              <i
                className={`fa-solid ${
                  mobileMenuOpen ? 'fa-xmark' : 'fa-bars'
                } text-xl`}
              ></i>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#2D1B18] border-b border-[#3D2522] px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#3D2522] text-xs">
            <span className="text-amber-200/80">8B Commercial, Green City</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                status.isOpen ? 'text-emerald-400 bg-emerald-950' : 'text-amber-400 bg-amber-950'
              }`}
            >
              {status.isOpen ? 'Open Now (4 PM - 2 AM)' : 'Opens at 4:00 PM'}
            </span>
          </div>

          {/* Dedicated Mobile Shop Switcher Card */}
          <div className="p-2.5 rounded-2xl bg-[#1D110F] border border-[#452723] space-y-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-amber-200/70 block px-1">
              Select Shop Mode:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSwitchShop('ice-cream');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border ${
                  !isGrill
                    ? 'bg-gradient-to-r from-[#FF4B72] to-[#FF85A1] text-white border-pink-400 shadow-md'
                    : 'bg-[#2A1815] text-stone-300 border-[#3D2522] hover:bg-[#38201C]'
                }`}
              >
                <i className="fa-solid fa-ice-cream"></i>
                <span>Frosty's</span>
                {!isGrill && <span className="text-[9px] bg-white/20 px-1 rounded">Active</span>}
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSwitchShop('grill');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border ${
                  isGrill
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-orange-400 shadow-md'
                    : 'bg-[#2A1815] text-stone-300 border-[#3D2522] hover:bg-[#38201C]'
                }`}
              >
                <i className="fa-solid fa-fire text-amber-300"></i>
                <span>Frosty's Grill</span>
                {isGrill && <span className="text-[9px] bg-white/20 px-1 rounded">Active</span>}
              </button>
            </div>
          </div>

          {/* Theme switcher option inside drawer */}
          <div className="pt-1">
            <ThemeToggle variant="full" onToggleCallback={() => setMobileMenuOpen(false)} />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-[#3D2522]/50 text-amber-100 text-sm font-medium hover:bg-[#3D2522]"
              >
                {link.name}
              </a>
            ))}
          </div>

          {onOpenHelperModal && (
            <div className="pt-2 border-t border-[#3D2522]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenHelperModal();
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4B72]/25 to-[#FF85A1]/25 text-white text-xs font-bold hover:from-[#FF4B72]/40 hover:to-[#FF85A1]/40 flex items-center justify-center gap-2 border border-[#FF4B72]/50 shadow-sm"
              >
                <i className="fa-solid fa-headset text-[#FF85A1]"></i>
                <span>Ask AI Helper (شاپ اسسٹنٹ)</span>
              </button>
            </div>
          )}

          {onOpenAdminModal && (
            <div className="pt-2 border-t border-[#3D2522]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminModal();
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-amber-950/40 text-amber-200 text-xs font-bold hover:bg-amber-950/60 flex items-center justify-center gap-2 border border-amber-800/40"
              >
                <i className="fa-solid fa-lock text-amber-400"></i>
                <span>Owner Admin Portal</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCallModal();
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#3D2522] text-white font-semibold text-xs text-center border border-[#52332E] flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-phone text-[#FF4B72]"></i>
              Call Store
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenOrderModal();
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#FF4B72] text-white font-bold text-xs text-center shadow-md flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-bag-shopping"></i>
              Order Pickup
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
