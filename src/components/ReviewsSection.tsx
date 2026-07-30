import React from 'react';
import { REVIEWS } from '../data/menuData';

export const ReviewsSection: React.FC = () => {
  return (
    <section id="reviews" className="py-20 bg-[#2D1B18] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF4B72]/15 border border-[#FF4B72]/30 text-[#FF85A1] text-xs font-bold uppercase tracking-wider">
            <i className="fa-solid fa-star text-amber-400"></i>
            <span>Loved by Lahore Foodies</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-amber-50 tracking-tight">
            What Late-Night Owls Say
          </h2>
          <p className="text-base text-amber-100/80 leading-relaxed font-normal">
            Real reviews from our awesome customers visiting Frosty's at 8B Commercial, Green City.
          </p>
        </div>

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-3xl bg-[#3D2522]/80 border border-[#52332E] shadow-xl flex flex-col justify-between space-y-4 hover:border-[#FF4B72]/50 transition-all duration-300"
            >
              <div className="space-y-3">
                {/* Stars */}
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  {[...Array(rev.rating)].map((_, i) => (
                    <i key={i} className="fa-solid fa-star"></i>
                  ))}
                  <span className="ml-2 text-xs text-amber-200/70 font-semibold">{rev.tag}</span>
                </div>

                {/* Comment */}
                <p className="text-sm text-amber-100/90 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-[#52332E] flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-sm text-white">{rev.name}</h4>
                  <span className="text-[11px] text-[#FF85A1] font-semibold block">
                    Favorite: {rev.favItem}
                  </span>
                </div>
                <span className="text-[10px] text-amber-200/50">{rev.date}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
