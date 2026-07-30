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
    <section id="location" className="py-20 bg-[#FFFDF7] text-[#2D1B18] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#38D39F]/15 border border-[#38D39F]/30 text-[#00A38C] text-xs font-bold uppercase tracking-wider">
            <i className="fa-solid fa-map-pin"></i>
            <span>Visit Us In Person</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#2D1B18] tracking-tight">
            Location & Operating Hours
          </h2>
          <p className="text-base text-stone-600 leading-relaxed font-normal">
            Conveniently situated in 8B Commercial Green City, Lahore with ample parking and cozy late-night outdoor and indoor seating.
          </p>
        </div>

        {/* Info Grid & Map Embed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Address & Hours Cards */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            
            {/* Live Open Widget */}
            <div
              className={`p-6 rounded-3xl border shadow-sm transition-all ${
                status.isOpen
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-500">
                  Current Status
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                    status.isOpen
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  {status.isOpen ? 'OPEN NOW' : 'CLOSED NOW'}
                </span>
              </div>

              <h3 className="font-heading font-bold text-2xl text-[#2D1B18]">
                {status.statusText}
              </h3>

              <p className="text-xs text-stone-600 mt-1 font-medium">
                {status.nextChangeText}
              </p>
            </div>

            {/* Address Card */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF4B72]/10 text-[#FF4B72] flex items-center justify-center text-lg font-bold">
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <h3 className="font-heading font-bold text-xl text-[#2D1B18]">
                Store Address
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-medium">
                <strong>8B Commercial</strong>, Green City, Lahore, Punjab, Pakistan
              </p>
              <p className="text-xs text-stone-500">
                Landmark: Near Main Green City Commercial Market Roundabout
              </p>
              <a
                href={STORE_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#E63956] hover:underline pt-1"
              >
                <span>Open in Google Maps</span>
                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>
            </div>

            {/* Hours Card */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3" id="hours">
              <div className="w-10 h-10 rounded-xl bg-[#38D39F]/15 text-[#00A38C] flex items-center justify-center text-lg font-bold">
                <i className="fa-solid fa-clock"></i>
              </div>
              <h3 className="font-heading font-bold text-xl text-[#2D1B18]">
                Operating Hours
              </h3>
              
              <div className="space-y-2 text-sm pt-1">
                <div className="flex items-center justify-between py-1.5 border-b border-stone-100 font-medium">
                  <span className="text-stone-700">Monday – Sunday</span>
                  <span className="font-bold text-[#FF4B72]">4:00 PM – 2:00 AM</span>
                </div>
                <div className="flex items-center justify-between py-1.5 text-xs text-stone-500 font-medium">
                  <span>Midnight Late-Night Hours</span>
                  <span className="text-emerald-600 font-bold">7 Days a Week</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={onOpenCallModal}
                  className="flex-1 py-3 rounded-xl bg-[#2D1B18] text-white font-bold text-xs hover:bg-[#FF4B72] transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <i className="fa-solid fa-phone"></i>
                  <span>Call Store</span>
                </button>

                <a
                  href={`https://wa.me/${STORE_INFO.whatsapp}?text=Hi!%20Are%20you%20open%20now%20for%20order%20pickup?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl bg-[#25D366] text-white font-bold text-xs hover:bg-[#20ba5a] transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <i className="fa-brands fa-whatsapp text-sm"></i>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Embedded Google Map */}
          <div className="lg:col-span-7">
            <div className="h-full min-h-[400px] lg:min-h-[520px] rounded-3xl overflow-hidden border border-stone-200 shadow-md relative bg-stone-100 flex flex-col justify-between">
              
              {/* Map Header Overlay */}
              <div className="p-4 bg-[#2D1B18] text-white flex items-center justify-between gap-4 z-10">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <i className="fa-solid fa-map text-[#FF4B72]"></i>
                  <span>Map View: 8B Commercial, Green City, Lahore</span>
                </div>
                <a
                  href={STORE_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-[#FF4B72] text-white text-xs font-bold hover:bg-[#E63956] transition-colors shrink-0"
                >
                  Get Directions
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
                className="w-full h-full min-h-[380px] object-cover flex-1"
              ></iframe>

              {/* Map Footer Bar */}
              <div className="p-4 bg-white border-t border-stone-200 text-xs text-stone-600 flex flex-wrap items-center justify-between gap-2 z-10">
                <span className="font-semibold text-stone-800">
                  <i className="fa-solid fa-car text-stone-400 mr-1.5"></i>
                  Parking Available at Green City Commercial Area
                </span>
                <span className="text-[#E63956] font-bold">
                  Open till 2 AM
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
