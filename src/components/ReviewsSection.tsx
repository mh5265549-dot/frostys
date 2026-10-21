import React, { useState } from 'react';
import { Review, Complaint } from '../types';
import { SlideFillButton } from './SlideFillButton';

interface ReviewsSectionProps {
  reviews: Review[];
  complaints?: Complaint[];
  onOpenFeedbackModal: () => void;
  onOpenComplaintModal: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  complaints = [],
  onOpenFeedbackModal,
  onOpenComplaintModal,
}) => {
  const [filterRating, setFilterRating] = useState<number | null>(null);

  if (!reviews || reviews.length === 0) {
    return null;
  }

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <section id="reviews" className="py-16 sm:py-20 bg-[#FAFAF9] text-stone-900 relative overflow-hidden border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">
              <i className="fa-solid fa-star text-amber-500"></i>
              <span>Customer Love & Feedback</span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-4xl text-stone-900 tracking-tight">
              Real Reviews from Lahore Foodies
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-xl">
              Authentic verified customer testimonials and feedback from late-night dessert lovers and grill fans across Green City & Paragon.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <SlideFillButton
              onClick={onOpenFeedbackModal}
              fill="#2563eb"
              textColor="#ffffff"
              hoverFill="#1d4ed8"
              hoverTextColor="#ffffff"
              direction="up"
              rounded={12}
              padding="12px 20px"
              className="text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <i className="fa-solid fa-pen-nib"></i>
              <span>Leave a Review</span>
            </SlideFillButton>

            <button
              onClick={onOpenComplaintModal}
              className="px-4 py-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <i className="fa-solid fa-circle-exclamation text-amber-600"></i>
              <span>Resolution Desk</span>
            </button>
          </div>
        </div>

        {/* Rating Overview Card */}
        <div className="mb-10 p-6 rounded-3xl bg-white border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex flex-col items-center justify-center font-heading font-black shadow-md shadow-amber-500/20">
              <span className="text-2xl leading-none">{averageRating}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5">Rating</span>
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-400 text-base">
                {[1, 2, 3, 4, 5].map((i) => (
                  <i key={i} className="fa-solid fa-star"></i>
                ))}
              </div>
              <p className="text-xs text-stone-500 mt-1 font-semibold">
                Based on {reviews.length} community verified reviews & orders
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterRating(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterRating === null
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All ({reviews.length})
            </button>
            {[5, 4, 3].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              return (
                <button
                  key={star}
                  onClick={() => setFilterRating(star)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    filterRating === star
                      ? 'bg-amber-500 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <span>{star}</span>
                  <i className="fa-solid fa-star text-[10px]"></i>
                  <span className="text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <i
                        key={idx}
                        className={`fa-solid fa-star ${idx < rev.rating ? 'text-amber-400' : 'text-stone-200'}`}
                      ></i>
                    ))}
                  </div>
                  {rev.tag && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {rev.tag}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-black text-xs text-stone-900">{rev.name}</h4>
                  {rev.favItem && (
                    <span className="text-[10px] text-[#1A4B8E] font-bold block">
                      ❤️ Favorite: {rev.favItem}
                    </span>
                  )}
                </div>
                {rev.date && (
                  <span className="text-[10px] text-stone-400 font-semibold">{rev.date}</span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
