import React from 'react';
import { STORE_INFO } from '../data/menuData';

interface FooterProps {
  onOpenAdminModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminModal }) => {
  return (
    <footer className="bg-white text-stone-700 pt-12 sm:pt-16 pb-8 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-stone-100">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF4B72] to-[#FF85A1] flex items-center justify-center text-white shadow-xs">
                <i className="fa-solid fa-ice-cream text-lg"></i>
              </div>
              <div>
                <span className="font-heading font-black text-xl tracking-tight text-stone-900 block">
                  Frosty's & Grill
                </span>
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  8B Commercial, Green City, Lahore
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed max-w-sm">
              Your favorite destination for fresh ice cream cones, sundaes, cold coffees, thick shakes, plus flame-grilled chicken burgers and loaded fries supreme. Open until 2:00 AM!
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 hover:text-[#FF4B72] hover:bg-pink-50 hover:border-pink-200 flex items-center justify-center transition-all"
                aria-label="Frosty's Instagram"
              >
                <i className="fa-brands fa-instagram text-sm"></i>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 hover:text-[#FF4B72] hover:bg-pink-50 hover:border-pink-200 flex items-center justify-center transition-all"
                aria-label="Frosty's Facebook"
              >
                <i className="fa-brands fa-facebook-f text-sm"></i>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 hover:text-[#FF4B72] hover:bg-pink-50 hover:border-pink-200 flex items-center justify-center transition-all"
                aria-label="Frosty's TikTok"
              >
                <i className="fa-brands fa-tiktok text-sm"></i>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-stone-900">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs text-stone-600 font-medium">
              <li>
                <a href="#menu" className="hover:text-[#FF4B72] transition-colors">
                  Browse Full Menu
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#FF4B72] transition-colors">
                  About Frosty's Restaurant
                </a>
              </li>
              <li>
                <a href="#hours" className="hover:text-[#FF4B72] transition-colors">
                  Operating Hours (4 PM - 2 AM)
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-[#FF4B72] transition-colors">
                  Location & Map Directions
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-[#FF4B72] transition-colors">
                  Verified Reviews & Ratings
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Hours */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-stone-900">
              Store Details
            </h4>

            <div className="space-y-2 text-xs text-stone-600">
              <p className="flex items-start gap-2">
                <i className="fa-solid fa-location-dot text-[#FF4B72] mt-0.5"></i>
                <span>{STORE_INFO.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <i className="fa-solid fa-clock text-emerald-600"></i>
                <span>{STORE_INFO.operatingHours}</span>
              </p>
              <p className="flex items-center gap-2">
                <i className="fa-solid fa-phone text-stone-700"></i>
                <span>Frosty's: {STORE_INFO.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <i className="fa-solid fa-fire text-orange-600"></i>
                <span>Grill Hotline: 0325 4826051</span>
              </p>
            </div>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                <i className="fa-solid fa-moon text-xs"></i>
                <span>Late-Night Food & Desserts Daily</span>
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <p className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} Frosty's & Grill. All rights reserved.</span>
            {onOpenAdminModal && (
              <button
                onClick={onOpenAdminModal}
                className="text-stone-500 hover:text-stone-800 font-bold underline flex items-center gap-1 transition-colors cursor-pointer"
                title="Owner Admin Panel Login"
              >
                <i className="fa-solid fa-lock text-[10px]"></i>
                <span>Owner Portal</span>
              </button>
            )}
          </p>
          <p className="text-center sm:text-right">
            8B Commercial, Green City, Lahore, Pakistan
          </p>
        </div>

      </div>
    </footer>
  );
};
