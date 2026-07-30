import React, { useState, useEffect } from 'react';
import { STORE_INFO } from '../data/menuData';
import { getStoreStatus } from '../utils/hours';

interface NavbarProps {
  cartCount: number;
  onOpenOrderModal: () => void;
  onOpenCallModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenOrderModal,
  onOpenCallModal,
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
          
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-3 group focus:outline-none"
            id="navbar-logo"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF4B72] to-[#FF85A1] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-ice-cream text-xl"></i>
            </div>
            <div>
              <span className="font-heading font-black text-2xl tracking-tight text-white flex items-center gap-1.5">
                Frosty's
                <span className="inline-block w-2 h-2 rounded-full bg-[#38D39F] animate-pulse"></span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF85A1] block -mt-1">
                Green City • Lahore
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8" id="desktop-nav">
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
          <div className="hidden sm:flex items-center gap-3">
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4B72] to-[#E63956] hover:from-[#E63956] hover:to-[#C92A43] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
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
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenOrderModal}
              className="p-2 rounded-lg bg-[#FF4B72] text-white font-bold text-xs flex items-center gap-1.5"
            >
              <i className="fa-solid fa-bag-shopping"></i>
              <span>Order</span>
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

          <div className="flex items-center gap-2 pt-2">
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
