import React from 'react';
import { STORE_INFO, outdoorRestaurantImg } from '../data/menuData';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 sm:py-20 bg-white text-stone-900 relative overflow-hidden border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-3xl overflow-hidden border border-stone-200 shadow-sm group">
              <img
                src={outdoorRestaurantImg}
                alt="Frosty's Outdoor Restaurant & Open-Air Dining Vibe in Green City Lahore"
                referrerPolicy="no-referrer"
                className="w-full h-[320px] sm:h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-stone-200 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF4B72] text-white flex items-center justify-center font-bold text-lg shrink-0">
                    <i className="fa-solid fa-tree"></i>
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-stone-900">
                      Located in Commercial Green City
                    </h4>
                    <p className="text-xs text-stone-600">
                      8B Commercial Area, Green City, Lahore, Punjab, Pakistan
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <span className="font-heading font-black text-xl sm:text-2xl text-[#FF4B72] block">
                  2:00 AM
                </span>
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                  Late Night Daily
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <span className="font-heading font-black text-xl sm:text-2xl text-emerald-600 block">
                  100%
                </span>
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                  Pure Cream
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <span className="font-heading font-black text-xl sm:text-2xl text-amber-500 block">
                  4.9 ★
                </span>
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                  Foodie Rating
                </span>
              </div>
            </div>

          </div>

          {/* Right Column Content */}
          <div className="lg:col-span-6 space-y-5">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#FF4B72] text-xs font-bold uppercase tracking-wider">
              <i className="fa-solid fa-heart"></i>
              <span>About Frosty's & Grill</span>
            </div>

            <h2 className="font-heading font-black text-2xl sm:text-4xl lg:text-5xl text-stone-900 leading-tight">
              Green City’s Favorite <br />
              <span className="text-[#FF4B72]">Late-Night Outdoor Restaurant</span> & Grill
            </h2>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Founded with a passion for satisfying midnight cravings, <strong>Frosty's & Grill</strong> was born right in the heart of Green City Commercial, Lahore. When standard eateries close down, our outdoor restaurant and ice cream counter come alive—serving fresh pure cream ice cream scoops, freshly rolled waffle cones, Banana Splits, cold coffees, shakes, as well as juicy flame-grilled chicken burgers, crispy wraps, and loaded fries supreme until 2:00 AM under the evening sky.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-50 text-[#FF4B72] flex items-center justify-center shrink-0 mt-0.5 border border-pink-200">
                  <i className="fa-solid fa-shield-halved text-sm"></i>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">100% Quality & Fresh Preparation</h4>
                  <p className="text-xs text-stone-600">
                    We use 100% pure dairy cream for desserts, and freshly marinated chicken for all grill items.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                  <i className="fa-solid fa-clock text-sm"></i>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">Late-Night Operating Hours</h4>
                  <p className="text-xs text-stone-600">
                    Open every single day from 4:00 PM in the evening until 2:00 AM late night.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
                  <i className="fa-solid fa-chair text-sm"></i>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">Outdoor Dining, Takeaway & Fast Delivery</h4>
                  <p className="text-xs text-stone-600">
                    Enjoy pleasant open-air dining at our outdoor seating or order for prompt delivery across Green City in spill-proof packaging.
                  </p>
                </div>
              </div>
            </div>

            {/* Location CTA */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={STORE_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-2xs flex items-center gap-2"
              >
                <i className="fa-solid fa-map-location-dot text-amber-400"></i>
                <span>Find Us on Map</span>
              </a>
              <a
                href={`https://wa.me/${STORE_INFO.whatsapp}?text=Hi%20Frosty's!%20I'd%20like%20to%20place%20an%20order.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm transition-colors shadow-2xs flex items-center gap-2"
              >
                <i className="fa-brands fa-whatsapp text-base"></i>
                <span>Direct WhatsApp Chat</span>
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
