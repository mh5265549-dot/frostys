import React from 'react';
import { STORE_INFO, parlorVibeImg } from '../data/menuData';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-[#2D1B18] text-white relative overflow-hidden">
      
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF4B72]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#38D39F]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#3D2522] shadow-2xl group">
              <img
                src={parlorVibeImg}
                alt="Frosty's Parlor Interior & Cozy Late Night Vibe in Green City Lahore"
                referrerPolicy="no-referrer"
                className="w-full h-[360px] sm:h-[420px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2D1B18] via-transparent to-transparent opacity-80"></div>
              
              <div className="absolute bottom-6 left-6 right-6 bg-[#2D1B18]/90 backdrop-blur-md p-5 rounded-2xl border border-[#52332E] shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#FF4B72] text-white flex items-center justify-center font-bold text-xl shrink-0">
                    <i className="fa-solid fa-store"></i>
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-base text-amber-50">
                      Located in Commercial Green City
                    </h4>
                    <p className="text-xs text-amber-200/80">
                      8B Commercial Area, Green City, Lahore, Punjab, Pakistan
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-[#3D2522]/60 border border-[#52332E] text-center">
                <span className="font-heading font-black text-2xl text-[#FF4B72] block">
                  2:00 AM
                </span>
                <span className="text-[11px] text-amber-200/80 font-semibold uppercase tracking-wider">
                  Late Night Daily
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#3D2522]/60 border border-[#52332E] text-center">
                <span className="font-heading font-black text-2xl text-[#38D39F] block">
                  100%
                </span>
                <span className="text-[11px] text-amber-200/80 font-semibold uppercase tracking-wider">
                  Pure Cream
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#3D2522]/60 border border-[#52332E] text-center">
                <span className="font-heading font-black text-2xl text-amber-300 block">
                  4.9 ★
                </span>
                <span className="text-[11px] text-amber-200/80 font-semibold uppercase tracking-wider">
                  Foodie Rating
                </span>
              </div>
            </div>

          </div>

          {/* Right Column Content */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3D2522] border border-[#52332E] text-[#FF85A1] text-xs font-bold uppercase tracking-wider">
              <i className="fa-solid fa-heart"></i>
              <span>About Frosty's</span>
            </div>

            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-amber-50 leading-tight">
              Green City’s Ultimate <br />
              <span className="text-[#FF4B72]">Late-Night Dessert</span> Spot
            </h2>

            <p className="text-base text-amber-100/90 leading-relaxed font-normal">
              Founded with a passion for satisfying midnight cravings, <strong>Frosty's</strong> was born right in the heart of Green City Commercial, Lahore. When standard cafes close down, our kitchen heats up—baking fresh Belgian waffles, swirling creamy thick shakes, and crafting loaded sundaes until 2:00 AM.
            </p>

            <p className="text-sm text-amber-200/80 leading-relaxed">
              Whether you are hanging out with friends after a late dinner, celebrating a midnight birthday, or satisfying a late-night sweet tooth with family, Frosty's offers a cozy, hygienic, and vibrant atmosphere with prompt service and heavenly flavors.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF4B72]/20 border border-[#FF4B72]/30 text-[#FF4B72] flex items-center justify-center shrink-0 mt-0.5">
                  <i className="fa-solid fa-shield-halved text-sm"></i>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-amber-100">100% Quality & Hygiene</h4>
                  <p className="text-xs text-amber-200/70">
                    We use only original Nutella, authentic Lotus Biscoff, Belgian dark cocoa, and fresh pasteurized dairy.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#38D39F]/20 border border-[#38D39F]/30 text-[#38D39F] flex items-center justify-center shrink-0 mt-0.5">
                  <i className="fa-solid fa-moon text-sm"></i>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-amber-100">Late-Night Operating Hours</h4>
                  <p className="text-xs text-amber-200/70">
                    Open every day from 4:00 PM in the evening until 2:00 AM late night.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="fa-solid fa-utensils text-sm"></i>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-amber-100">Dine-In, Takeaway & Pickup</h4>
                  <p className="text-xs text-amber-200/70">
                    Relax inside our air-conditioned parlor or grab your dessert to-go in secure spill-proof packaging.
                  </p>
                </div>
              </div>
            </div>

            {/* Location CTA */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href={STORE_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-white text-[#2D1B18] font-bold text-sm hover:bg-amber-100 transition-colors shadow-md flex items-center gap-2"
              >
                <i className="fa-solid fa-map-location-dot text-[#FF4B72]"></i>
                <span>Find Us on Map</span>
              </a>
              <a
                href={`https://wa.me/${STORE_INFO.whatsapp}?text=Hi%20Frosty's!%20I'd%20like%20to%20know%20more%20about%20your%20desserts.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#20ba5a] transition-colors shadow-md flex items-center gap-2"
              >
                <i className="fa-brands fa-whatsapp text-lg"></i>
                <span>WhatsApp Us</span>
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
