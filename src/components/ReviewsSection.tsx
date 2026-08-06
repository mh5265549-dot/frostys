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
    <section id="reviews" className="py-20 bg-[#2D1B18] text-white relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF4B72]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF4B72]/15 border border-[#FF4B72]/30 text-[#FF85A1] text-xs font-bold uppercase tracking-wider">
            <i className="fa-solid fa-comments text-amber-400"></i>
            <span>Customer Voice & Transparency</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-amber-50 tracking-tight">
            Reviews & Customer Help Center
          </h2>
          <p className="text-base text-amber-100/80 leading-relaxed font-normal">
            Real feedback and active complaint resolutions for Frosty's at 8B Commercial, Green City Lahore.
          </p>

          {/* Action CTAs: Leave Review / File Complaint */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <div className="bg-[#3D2522] border border-[#52332E] px-4 py-2 rounded-2xl flex items-center gap-3 shadow-inner">
              <div className="flex items-center gap-1 text-amber-400 text-lg">
                <i className="fa-solid fa-star"></i>
                <span className="font-extrabold text-amber-50 text-base ml-1">{avgRating}</span>
                <span className="text-amber-200/50 text-xs font-medium">/ 5</span>
              </div>
              <span className="text-xs text-amber-200/70 border-l border-[#52332E] pl-3 font-semibold">
                {totalReviews} Verified {totalReviews === 1 ? 'Review' : 'Reviews'}
              </span>
            </div>

            <button
              onClick={onOpenFeedbackModal}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF4B72] to-[#FF85A1] hover:brightness-110 text-white text-xs font-extrabold shadow-lg shadow-[#FF4B72]/30 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <i className="fa-solid fa-pen-to-square"></i>
              <span>Leave Feedback</span>
            </button>

            <button
              onClick={onOpenComplaintModal}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 hover:brightness-110 text-white text-xs font-extrabold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 border border-red-500/30"
            >
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>File a Complaint</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs (Reviews vs Complaint Tracker) */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#3D2522] p-1.5 rounded-2xl border border-[#52332E] inline-flex items-center gap-1">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'reviews'
                  ? 'bg-[#FF4B72] text-white shadow-md'
                  : 'text-amber-200/70 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-star"></i>
              <span>Customer Reviews ({reviews.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('complaints')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'complaints'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-amber-200/70 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-shield-heart"></i>
              <span>Complaints & Resolutions ({complaints.length})</span>
            </button>
          </div>
        </div>

        {/* REVIEWS TAB CONTENT */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Filter Chips */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-amber-200/60 mr-1">Filter by Rating:</span>
              {(['all', 5, 4, 3, 2, 1] as const).map((star) => (
                <button
                  key={star}
                  onClick={() => setStarFilter(star)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    starFilter === star
                      ? 'bg-[#FF4B72] text-white shadow-md'
                      : 'bg-[#3D2522] text-amber-200/70 hover:bg-[#52332E] border border-[#52332E]'
                  }`}
                >
                  {star === 'all' ? (
                    'All Reviews'
                  ) : (
                    <>
                      <span>{star}</span>
                      <i className="fa-solid fa-star text-amber-400 text-[10px]"></i>
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Reviews Cards Grid */}
            {filteredReviews.length === 0 ? (
              <div className="p-12 text-center bg-[#3D2522]/50 rounded-3xl border border-[#52332E] max-w-md mx-auto space-y-3">
                <i className="fa-solid fa-comment-slash text-stone-500 text-3xl"></i>
                <p className="text-xs text-amber-200/70">No reviews found matching this filter.</p>
                <button
                  onClick={() => setStarFilter('all')}
                  className="text-xs text-[#FF85A1] font-bold underline"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-6 rounded-3xl bg-[#3D2522]/80 border border-[#52332E] shadow-xl flex flex-col justify-between space-y-4 hover:border-[#FF4B72]/50 transition-all duration-300 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-400 text-sm">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`fa-solid fa-star ${
                                i < rev.rating ? 'text-amber-400' : 'text-stone-600'
                              }`}
                            ></i>
                          ))}
                        </div>
                        <span className="text-[10px] bg-[#FF4B72]/20 border border-[#FF4B72]/30 text-[#FF85A1] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                          {rev.tag || 'Verified'}
                        </span>
                      </div>

                      <p className="text-sm text-amber-100/90 leading-relaxed italic pt-1">
                        "{rev.comment}"
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#52332E] flex items-center justify-between">
                      <div>
                        <h4 className="font-heading font-bold text-sm text-amber-50 group-hover:text-white transition-colors">
                          {rev.name}
                        </h4>
                        {rev.favItem && (
                          <span className="text-[11px] text-[#FF85A1] font-semibold block">
                            Favorite: {rev.favItem}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-amber-200/50 font-medium">
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
            <div className="bg-[#3D2522]/80 p-6 rounded-3xl border border-[#52332E] max-w-2xl mx-auto text-center space-y-3">
              <h3 className="font-heading font-bold text-lg text-amber-50 flex items-center justify-center gap-2">
                <i className="fa-solid fa-handshake-angle text-red-400"></i>
                <span>Our 100% Satisfaction Guarantee</span>
              </h3>
              <p className="text-xs text-amber-100/80 leading-relaxed">
                If something went wrong with your order, we promise to fix it promptly. All complaints logged below are assigned a tracking ticket and addressed directly by management.
              </p>
              <button
                onClick={onOpenComplaintModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold shadow-md transition-all"
              >
                <i className="fa-solid fa-plus"></i>
                <span>File a New Complaint Ticket</span>
              </button>
            </div>

            {complaints.length === 0 ? (
              <div className="p-12 text-center bg-[#3D2522]/50 rounded-3xl border border-[#52332E] max-w-md mx-auto space-y-2">
                <i className="fa-solid fa-circle-check text-emerald-400 text-3xl"></i>
                <p className="text-sm font-bold text-amber-100">No active complaints</p>
                <p className="text-xs text-amber-200/60">Everything is running smoothly!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {complaints.map((cmp) => (
                  <div
                    key={cmp.id}
                    className="p-6 rounded-3xl bg-[#3D2522]/90 border border-[#52332E] shadow-xl space-y-4 relative overflow-hidden"
                  >
                    {/* Header bar */}
                    <div className="flex items-center justify-between border-b border-[#52332E] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-extrabold text-amber-300 bg-[#2D1B18] px-2.5 py-1 rounded-lg border border-[#52332E]">
                          #{cmp.ticketNumber}
                        </span>
                        <span className="text-xs text-amber-200/70 font-semibold">
                          {cmp.category}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                          cmp.status === 'Resolved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : cmp.status === 'In Progress'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-red-500/20 text-red-300 border border-red-500/40'
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

                    {/* Description */}
                    <p className="text-xs text-amber-100/90 leading-relaxed">
                      "{cmp.description}"
                    </p>

                    {/* Store Resolution Notes if available */}
                    {cmp.resolutionNotes && (
                      <div className="p-3.5 rounded-2xl bg-[#2D1B18] border border-emerald-900/60 text-xs space-y-1">
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400 block flex items-center gap-1">
                          <i className="fa-solid fa-comment-medical"></i>
                          <span>Manager Resolution Note:</span>
                        </span>
                        <p className="text-amber-100/90 italic font-medium">
                          {cmp.resolutionNotes}
                        </p>
                      </div>
                    )}

                    {/* Footer Customer Info & Date */}
                    <div className="pt-3 border-t border-[#52332E] flex items-center justify-between text-xs text-amber-200/60">
                      <span>Customer: <strong className="text-amber-100">{cmp.customerName}</strong></span>
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
