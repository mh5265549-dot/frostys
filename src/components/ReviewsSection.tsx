import React, { useState } from 'react';
import { Review, Complaint } from '../types';

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
  const [activeTab, setActiveTab] = useState<'reviews' | 'complaints'>('reviews');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');

  const filteredReviews = reviews.filter((r) => {
    if (starFilter === 'all') return true;
    return r.rating === starFilter;
  });

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : '5.0';

  return (
    <section id="reviews" className="py-16 sm:py-20 bg-[#FAFAF9] text-stone-900 relative overflow-hidden border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <i className="fa-solid fa-comments text-red-600"></i>
            <span>Customer Voice & Reviews</span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-stone-900 tracking-tight">
            Reviews & Customer Help Center
          </h2>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Real feedback and verified ratings for Frosty's at 8B Commercial, Green City Lahore.
          </p>

          {/* Action CTAs: Rating & Leave Review / File Complaint */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <div className="bg-white border border-stone-200 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-2xs">
              <div className="flex items-center gap-1 text-amber-400 text-base">
                <i className="fa-solid fa-star"></i>
                <span className="font-extrabold text-stone-900 text-sm ml-1">{avgRating}</span>
                <span className="text-stone-400 text-xs font-medium">/ 5</span>
              </div>
              <span className="text-xs text-stone-500 border-l border-stone-200 pl-3 font-semibold">
                {totalReviews} Verified {totalReviews === 1 ? 'Review' : 'Reviews'}
              </span>
            </div>

            <button
              onClick={onOpenFeedbackModal}
              className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <i className="fa-solid fa-pen-to-square"></i>
              <span>Leave Feedback</span>
            </button>

            <button
              onClick={onOpenComplaintModal}
              className="px-4 py-2 rounded-2xl bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold shadow-xs border border-stone-200 transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <i className="fa-solid fa-triangle-exclamation text-amber-500"></i>
              <span>File a Ticket</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs (Reviews vs Complaint Tracker) */}
        <div className="flex justify-center mb-8">
          <div className="bg-stone-100 p-1 rounded-2xl border border-stone-200 inline-flex items-center gap-1">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <i className="fa-solid fa-star text-amber-400"></i>
              <span>Reviews ({reviews.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('complaints')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'complaints'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <i className="fa-solid fa-shield-heart text-rose-500"></i>
              <span>Resolution Tickets ({complaints.length})</span>
            </button>
          </div>
        </div>

        {/* REVIEWS TAB CONTENT */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Filter Chips */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap text-xs">
              <span className="text-stone-500 text-[11px] font-semibold mr-1">Rating:</span>
              {(['all', 5, 4, 3, 2, 1] as const).map((star) => (
                <button
                  key={star}
                  onClick={() => setStarFilter(star)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    starFilter === star
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
                  }`}
                >
                  {star === 'all' ? (
                    'All'
                  ) : (
                    <span className="flex items-center gap-1">
                      <span>{star}</span>
                      <i className="fa-solid fa-star text-amber-400 text-[10px]"></i>
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Reviews Cards Grid */}
            {filteredReviews.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-stone-200 max-w-md mx-auto space-y-2">
                <i className="fa-solid fa-comment-slash text-stone-300 text-3xl"></i>
                <p className="text-xs text-stone-500">No reviews found matching this filter.</p>
                <button
                  onClick={() => setStarFilter('all')}
                  className="text-xs text-red-600 font-bold underline cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-400 text-xs">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`fa-solid fa-star ${
                                i < rev.rating ? 'text-amber-400' : 'text-stone-200'
                              }`}
                            ></i>
                          ))}
                        </div>
                        <span className="text-[10px] bg-blue-50 border border-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {rev.tag || 'Verified'}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-heading font-bold text-xs sm:text-sm text-stone-900">
                          {rev.name}
                        </h4>
                        {rev.favItem && (
                          <span className="text-[10px] text-red-600 font-semibold block">
                            Favorite: {rev.favItem}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 font-medium">
                        {rev.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COMPLAINTS & RESOLUTIONS TAB CONTENT */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 max-w-xl mx-auto text-center space-y-3 shadow-xs">
              <h3 className="font-heading font-bold text-base text-stone-900 flex items-center justify-center gap-2">
                <i className="fa-solid fa-shield-heart text-rose-500"></i>
                <span>Our 100% Satisfaction Guarantee</span>
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                If anything went wrong with your order, we promise to fix it promptly. All logged tickets are addressed directly by management.
              </p>
              <button
                onClick={onOpenComplaintModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <i className="fa-solid fa-plus"></i>
                <span>File a Ticket</span>
              </button>
            </div>

            {complaints.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-stone-200 max-w-md mx-auto space-y-2">
                <i className="fa-solid fa-circle-check text-blue-600 text-3xl"></i>
                <p className="text-sm font-bold text-stone-800">No active complaints</p>
                <p className="text-xs text-stone-500">All orders are running smoothly!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {complaints.map((cmp) => (
                  <div
                    key={cmp.id}
                    className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-md">
                          #{cmp.ticketNumber}
                        </span>
                        <span className="text-xs text-stone-600 font-semibold">
                          {cmp.category}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                          cmp.status === 'Resolved'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : cmp.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <i
                          className={`fa-solid text-[9px] ${
                            cmp.status === 'Resolved'
                              ? 'fa-circle-check'
                              : cmp.status === 'In Progress'
                              ? 'fa-spinner fa-spin'
                              : 'fa-clock'
                          }`}
                        ></i>
                        <span>{cmp.status}</span>
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed">
                      "{cmp.description}"
                    </p>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                      <span>Customer: <strong className="text-stone-800">{cmp.customerName}</strong></span>
                      <span className="text-[10px]">{cmp.timestamp}</span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
