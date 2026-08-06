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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#2D1B18] text-white w-full max-w-lg rounded-3xl border border-[#52332E] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-[#3D2522] border-b border-[#52332E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF4B72]/20 border border-[#FF4B72]/40 flex items-center justify-center text-[#FF4B72] text-xl font-bold">
              <i className="fa-solid fa-star"></i>
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-amber-50">
                Share Your Feedback
              </h3>
              <p className="text-xs text-amber-200/70">
                Help us make Frosty's even better!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {isSuccess ? (
            <div className="py-10 text-center space-y-3 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-3xl mx-auto">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h4 className="font-heading font-bold text-xl text-emerald-300">
                Thank You for Your Feedback!
              </h4>
              <p className="text-xs text-amber-100/80 max-w-xs mx-auto">
                Your review has been saved and is now published in our customer reviews section.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Star Rating Input */}
              <div className="space-y-2 bg-[#3D2522]/50 p-4 rounded-2xl border border-[#52332E] text-center">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-200/90 block">
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
                      className="p-1 focus:outline-none transition-transform hover:scale-125"
                    >
                      <i
                        className={`fa-solid fa-star text-2xl transition-colors ${
                          (hoverRating !== null ? star <= hoverRating : star <= rating)
                            ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-stone-600'
                        }`}
                      ></i>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] font-semibold text-amber-300/90">
                  {rating === 5 && '🌟 Excellent / Loved it!'}
                  {rating === 4 && '😊 Very Good!'}
                  {rating === 3 && '😐 Average'}
                  {rating === 2 && '🙁 Could be better'}
                  {rating === 1 && '😞 Disappointed'}
                </p>
              </div>

              {/* Customer Name Field (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-100 uppercase tracking-wider flex items-center justify-between">
                  <span>Your Name</span>
                  <span className="text-[10px] text-amber-200/50 normal-case">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ali Raza (Defaults to Anonymous Foodie)"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1A100E] border border-[#52332E] text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#FF4B72]"
                />
              </div>

              {/* Favorite Item Field (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-100 uppercase tracking-wider flex items-center justify-between">
                  <span>Favorite Item / Dish</span>
                  <span className="text-[10px] text-amber-200/50 normal-case">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={favItem}
                  onChange={(e) => setFavItem(e.target.value)}
                  placeholder="e.g. Chocolate Cone, Banana Split, Cold Coffee"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1A100E] border border-[#52332E] text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#FF4B72]"
                />
              </div>

              {/* Text Comment Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-100 uppercase tracking-wider">
                  Your Comments & Review <span className="text-[#FF4B72]">*</span>
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you loved, how the taste was, or any suggestions..."
                  className="w-full px-4 py-3 rounded-xl bg-[#1A100E] border border-[#52332E] text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#FF4B72]"
                />
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation text-red-400 text-sm shrink-0"></i>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-100 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4B72] to-[#FF85A1] hover:brightness-110 text-white text-xs font-extrabold shadow-lg shadow-[#FF4B72]/30 transition-all flex items-center gap-2"
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
