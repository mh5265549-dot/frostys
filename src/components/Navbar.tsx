import React, { useState, useEffect } from 'react';
import { STORE_INFO } from '../data/menuData';
import { getStoreStatus } from '../utils/hours';
import { ShopMode } from '../types';
import { FrostyLogo } from './FrostyLogo';
import { SlideFillButton } from './SlideFillButton';
import { useBrandLogo } from '../utils/logoStorage';
import { LogoUploadModal } from './LogoUploadModal';

interface NavbarProps {
  cartCount: number;
  onOpenOrderModal: () => void;
  onOpenCallModal: () => void;
  onOpenInventoryModal: () => void;
  onOpenOrderHistoryModal: () => void;
  onOpenAdminModal?: () => void;
  lowStockCount?: number;
  ordersCount?: number;
  activeShop?: ShopMode;
  onSwitchShop?: (shop: ShopMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenOrderModal,
  onOpenCallModal,
  onOpenInventoryModal,
  onOpenOrderHistoryModal,
  onOpenAdminModal,
  lowStockCount = 0,
  ordersCount = 0,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [status, setStatus] = useState(getStoreStatus());
  const { logoUrl } = useBrandLogo();

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
          
          {/* Brand Logo with Frosty's Real Restaurant Emblem */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="#hero"
              className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none cursor-pointer shrink-0"
              id="navbar-logo"
              title="Frosty's Ice Cream Parlour & Grill - Green City, Lahore"
            >
              <div className="relative shrink-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105 p-0.5 bg-gradient-to-tr from-[#1A4B8E] via-[#70B9F7] to-[#1A4B8E] shadow-[#1A4B8E]/20 border border-white">
                  <img
                    src={logoUrl}
                    alt="Frosty's Ice Cream Parlour & Grill"
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowLogoModal(true);
                  }}
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1A4B8E] hover:bg-[#153e77] text-white text-[9px] flex items-center justify-center shadow-md border border-white transition-transform hover:scale-110"
                  title="Upload / Change Logo Image"
                  aria-label="Upload custom logo"
                >
                  <i className="fa-solid fa-camera"></i>
                </button>
              </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-lg sm:text-2xl tracking-tight text-stone-900 group-hover:text-[#1A4B8E] transition-colors">
                  Frosty's
                </span>
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    status.isOpen ? 'bg-[#70B9F7] animate-pulse' : 'bg-amber-400'
                  }`}
                  title={status.isOpen ? 'Open Now (5 PM - 2 AM)' : 'Opens at 5 PM'}
                ></span>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1A4B8E] block -mt-0.5 sm:-mt-1">
                Ice Cream Parlour & Grill • Green City
              </span>
            </div>
          </a>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-stone-600" id="desktop-nav">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-[#1A4B8E] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Actions: Cart & Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
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
              href={`tel:${STORE_INFO.phone}`}
              className="hidden md:flex p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-xs font-bold items-center gap-1.5 border border-stone-200"
              title="Call Store Hotline"
            >
              <i className="fa-solid fa-phone text-xs text-red-600"></i>
              <span className="hidden lg:inline">{STORE_INFO.phone}</span>
            </a>

            {/* Cart Trigger */}
            <SlideFillButton
              onClick={onOpenOrderModal}
              id="btn-order-now-nav"
              fill="#1A4B8E"
              textColor="#ffffff"
              hoverFill="#0f172a"
              hoverTextColor="#ffffff"
              direction="up"
              rounded={12}
              padding="8px 16px"
              className="text-xs sm:text-sm shadow-xs"
            >
              <i className="fa-solid fa-cart-shopping text-xs sm:text-sm"></i>
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-white text-[#1A4B8E] font-extrabold text-[11px] px-1.5 py-0.2 rounded-full min-w-5 text-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </SlideFillButton>

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
              <i className="fa-solid fa-location-dot text-red-600"></i>
              8B Commercial, Green City, Lahore
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                status.isOpen ? 'text-blue-700 bg-blue-50' : 'text-amber-700 bg-amber-50'
              }`}
            >
              {status.isOpen ? 'Open Now (5 PM - 2 AM)' : 'Opens 5:00 PM'}
            </span>
          </div>

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl bg-stone-50 hover:bg-blue-50 text-stone-800 hover:text-blue-700 text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <i className="fa-solid fa-chevron-right text-[10px] text-red-500"></i>
                <span>{link.name}</span>
              </a>
            ))}
          </div>

          {/* Quick Call & Hotline */}
          <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
            <a
              href={`tel:${STORE_INFO.phone}`}
              className="flex-1 py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold flex items-center justify-center gap-2 border border-red-200"
            >
              <i className="fa-solid fa-phone text-red-600"></i>
              <span>Hotline: {STORE_INFO.phone}</span>
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

      {/* Interactive Logo Upload & Customizer Dialog */}
      <LogoUploadModal
        isOpen={showLogoModal}
        onClose={() => setShowLogoModal(false)}
      />
    </header>
  );
};
