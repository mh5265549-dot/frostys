import React from 'react';

interface FloatingFeedbackButtonProps {
  onClick: () => void;
  feedbackCount: number;
}

export const FloatingFeedbackButton: React.FC<FloatingFeedbackButtonProps> = ({
  onClick,
  feedbackCount,
}) => {
  return (
    <aside aria-label="Feedback and Reviews" className="fixed bottom-36 sm:bottom-22 left-4 z-40">
      <button
        onClick={onClick}
        type="button"
        className="bg-white text-stone-900 hover:bg-stone-50 border border-stone-200 hover:border-pink-300 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 group cursor-pointer"
        title="Leave Feedback & Review"
      >
        <div className="relative flex items-center justify-center">
          <i className="fa-solid fa-comment-dots text-[#FF4B72] text-base group-hover:rotate-12 transition-transform"></i>
          {feedbackCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-amber-400 text-stone-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-2xs">
              {feedbackCount}
            </span>
          )}
        </div>
        <span className="text-xs font-bold text-stone-800 tracking-wide hidden xs:inline">
          Feedback
        </span>
        <span className="text-amber-500 text-xs hidden sm:inline">
          ★
        </span>
      </button>
    </aside>
  );
};
