import React, { useState } from 'react';
import { Review } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitFeedback: (newFeedback: Omit<Review, 'id' | 'date'>) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmitFeedback,
}) => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [favItem, setFavItem] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!comment.trim()) {
      setErrorMsg('Please write a brief comment or feedback before submitting!');
      return;
    }

    onSubmitFeedback({
      name: name.trim() || 'Anonymous Foodie',
      rating,
      comment: comment.trim(),
      favItem: favItem.trim() || 'Ice Cream Cone',
      tag: 'Verified Feedback',
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setName('');
      setRating(5);
      setComment('');
      setFavItem('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white text-stone-900 w-full max-w-lg rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 text-lg font-bold shadow-2xs">
              <i className="fa-solid fa-star"></i>
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-stone-900">
                Share Your Feedback
              </h3>
              <p className="text-xs text-stone-500">
                Help us make Frosty's & Grill even better!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {isSuccess ? (
            <div className="py-10 text-center space-y-3 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-3xl mx-auto shadow-2xs">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h4 className="font-heading font-black text-xl text-stone-900">
                Thank You for Your Feedback!
              </h4>
              <p className="text-xs text-stone-600 max-w-xs mx-auto">
                Your review has been saved and is now published in our customer reviews section.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Star Rating Input */}
              <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-center">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  How was your experience? <span className="text-[#FF4B72]">*</span>
                </label>
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                    >
                      <i
                        className={`fa-solid fa-star text-2xl transition-colors ${
                          (hoverRating !== null ? star <= hoverRating : star <= rating)
                            ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-stone-300'
                        }`}
                      ></i>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] font-bold text-stone-600">
                  {rating === 5 && '🌟 Excellent / Loved it!'}
                  {rating === 4 && '😊 Very Good!'}
                  {rating === 3 && '😐 Average'}
                  {rating === 2 && '🙁 Could be better'}
                  {rating === 1 && '😞 Disappointed'}
                </p>
              </div>

              {/* Customer Name Field (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Your Name</span>
                  <span className="text-[10px] text-stone-400 normal-case">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ali Raza (Defaults to Anonymous Foodie)"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B72]"
                />
              </div>

              {/* Favorite Item Field (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Favorite Item / Dish</span>
                  <span className="text-[10px] text-stone-400 normal-case">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={favItem}
                  onChange={(e) => setFavItem(e.target.value)}
                  placeholder="e.g. Chocolate Cone, Banana Split, Grilled Burger"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B72]"
                />
              </div>

              {/* Text Comment Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Your Comments & Review <span className="text-[#FF4B72]">*</span>
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you loved, how the taste was, or any suggestions..."
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B72]"
                />
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation text-rose-500 text-sm shrink-0"></i>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#FF4B72] hover:bg-[#E63956] text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>Submit Feedback</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
