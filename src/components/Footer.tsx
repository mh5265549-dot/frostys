import React from 'react';
import { STORE_INFO } from '../data/menuData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1F110E] text-white pt-16 pb-8 border-t border-[#3D2522]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#3D2522]">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF4B72] to-[#FF85A1] flex items-center justify-center text-white shadow-md">
                <i className="fa-solid fa-ice-cream text-xl"></i>
              </div>
              <span className="font-heading font-black text-2xl tracking-tight text-white">
                Frosty's
              </span>
            </div>

            <p className="text-sm text-amber-100/70 max-w-sm font-normal leading-relaxed">
              Lahore’s favorite late-night dessert parlour serving signature sundaes, thick shakes, warm Belgian waffles, and artisanal scoops until 2:00 AM daily.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[#2D1B18] border border-[#3D2522] text-amber-200/80 hover:text-[#FF4B72] hover:border-[#FF4B72] flex items-center justify-center transition-all"
                aria-label="Frosty's Instagram"
              >
                <i className="fa-brands fa-instagram text-lg"></i>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[#2D1B18] border border-[#3D2522] text-amber-200/80 hover:text-[#FF4B72] hover:border-[#FF4B72] flex items-center justify-center transition-all"
                aria-label="Frosty's Facebook"
              >
                <i className="fa-brands fa-facebook-f text-lg"></i>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[#2D1B18] border border-[#3D2522] text-amber-200/80 hover:text-[#FF4B72] hover:border-[#FF4B72] flex items-center justify-center transition-all"
                aria-label="Frosty's TikTok"
              >
                <i className="fa-brands fa-tiktok text-lg"></i>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading font-bold text-sm text-amber-50 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-amber-100/80">
              <li>
                <a href="#menu" className="hover:text-[#FF85A1] transition-colors">
                  Signature Sundaes & Menu
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#FF85A1] transition-colors">
                  About Frosty's Parlor
                </a>
              </li>
              <li>
                <a href="#hours" className="hover:text-[#FF85A1] transition-colors">
                  Operating Hours (4 PM - 2 AM)
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-[#FF85A1] transition-colors">
                  Location & Directions
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-[#FF85A1] transition-colors">
                  Customer Reviews
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Hours */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-heading font-bold text-sm text-amber-50 uppercase tracking-wider">
              Store Details
            </h4>

            <div className="space-y-2 text-xs text-amber-100/80">
              <p className="flex items-start gap-2">
                <i className="fa-solid fa-location-dot text-[#FF4B72] mt-0.5"></i>
                <span>{STORE_INFO.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <i className="fa-solid fa-clock text-[#38D39F]"></i>
                <span>{STORE_INFO.operatingHours}</span>
              </p>
              <p className="flex items-center gap-2">
                <i className="fa-solid fa-phone text-amber-300"></i>
                <span>{STORE_INFO.phone}</span>
              </p>
            </div>

            <div className="pt-2">
              <span className="inline-block px-3 py-1 rounded-lg bg-[#3D2522] text-[#38D39F] text-[11px] font-bold">
                <i className="fa-solid fa-moon mr-1"></i>
                Late-Night Dessert Spot in Lahore
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-amber-200/50">
          <p>
            © {new Date().getFullYear()} Frosty's Ice Cream & Dessert Parlor. All rights reserved.
          </p>
          <p className="text-center sm:text-right">
            Disclaimer: All desserts prepared fresh daily at 8B Commercial, Green City, Lahore, Pakistan.
          </p>
        </div>

      </div>
    </footer>
  );
};

