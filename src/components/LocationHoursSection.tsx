import React, { useState, useEffect } from 'react';
import { STORE_INFO } from '../data/menuData';
import { getStoreStatus } from '../utils/hours';

interface LocationHoursSectionProps {
  onOpenCallModal: () => void;
}

export const LocationHoursSection: React.FC<LocationHoursSectionProps> = ({
  onOpenCallModal,
}) => {
  const [status, setStatus] = useState(getStoreStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setStatus(getStoreStatus());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="location" className="py-16 sm:py-20 bg-white text-stone-900 relative border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <i className="fa-solid fa-map-pin"></i>
            <span>Visit Us In Person</span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-stone-900 tracking-tight">
            Location & Operating Hours
          </h2>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Conveniently situated in 8B Commercial Green City, Lahore with ample parking, cozy indoor seating, and prompt takeaway.
          </p>
        </div>

        {/* Info Grid & Map Embed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Address & Hours Cards */}
          <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
            
            {/* Live Open Widget */}
            <div
              className={`p-5 sm:p-6 rounded-3xl border shadow-2xs transition-all ${
                status.isOpen
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
                  Store Hours Status
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1.5 ${
                    status.isOpen
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  {status.isOpen ? 'OPEN NOW' : 'CLOSED NOW'}
                </span>
              </div>

              <h3 className="font-heading font-black text-xl text-stone-900">
                {status.statusText}
              </h3>

              <p className="text-xs text-stone-600 mt-1 font-medium">
                {status.nextChangeText}
              </p>
            </div>

            {/* Address Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#FF4B72] flex items-center justify-center text-base font-bold">
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <h3 className="font-heading font-bold text-lg text-stone-900">
                Storefront Address
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                <strong>8B Commercial</strong>, Green City, Lahore, Punjab, Pakistan
              </p>
              <p className="text-xs text-stone-500">
                Landmark: Near Main Green City Commercial Market Roundabout
              </p>
              <a
                href={STORE_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF4B72] hover:underline pt-1"
              >
                <span>Open in Google Maps</span>
                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>
            </div>

            {/* Hours Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-2.5" id="hours">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-base font-bold">
                <i className="fa-solid fa-clock"></i>
              </div>
              <h3 className="font-heading font-bold text-lg text-stone-900">
                Operating Schedule
              </h3>
              
              <div className="space-y-1.5 text-xs pt-1">
                <div className="flex items-center justify-between py-1 border-b border-stone-200 font-medium">
                  <span className="text-stone-700">Monday – Sunday</span>
                  <span className="font-bold text-[#FF4B72]">4:00 PM – 2:00 AM</span>
                </div>
                <div className="flex items-center justify-between py-1 text-xs text-stone-500 font-medium">
                  <span>Midnight Service</span>
                  <span className="text-emerald-700 font-bold">7 Days a Week</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2.5">
                <button
                  onClick={onOpenCallModal}
                  className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <i className="fa-solid fa-phone text-xs"></i>
                  <span>Call Store</span>
                </button>

                <a
                  href={`https://wa.me/${STORE_INFO.whatsapp}?text=Hi!%20Are%20you%20open%20now%20for%20order%20pickup?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-xs hover:bg-[#20ba5a] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <i className="fa-brands fa-whatsapp text-sm"></i>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Embedded Google Map */}
          <div className="lg:col-span-7">
            <div className="h-full min-h-[380px] lg:min-h-[500px] rounded-3xl overflow-hidden border border-stone-200 shadow-xs relative bg-stone-100 flex flex-col justify-between">
              
              {/* Map Header Bar */}
              <div className="p-3.5 bg-stone-900 text-white flex items-center justify-between gap-3 z-10">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <i className="fa-solid fa-map-pin text-[#FF4B72]"></i>
                  <span>8B Commercial, Green City, Lahore</span>
                </div>
                <a
                  href={STORE_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-[#FF4B72] hover:bg-[#E63956] text-white text-xs font-bold transition-colors shrink-0"
                >
                  Directions
                </a>
              </div>

              {/* Iframe Map */}
              <iframe
                title="Frosty's Dessert Parlor Map Location Green City Lahore"
                src={STORE_INFO.mapEmbedIframeSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full min-h-[340px] object-cover flex-1"
              ></iframe>

              {/* Map Footer Bar */}
              <div className="p-3 bg-white border-t border-stone-200 text-xs text-stone-600 flex flex-wrap items-center justify-between gap-2 z-10">
                <span className="font-semibold text-stone-700">
                  <i className="fa-solid fa-square-parking text-stone-400 mr-1"></i>
                  Parking Available at Commercial Market
                </span>
                <span className="text-[#FF4B72] font-bold">
                  Open till 2:00 AM
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
