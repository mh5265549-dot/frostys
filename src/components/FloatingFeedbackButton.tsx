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
    <button
      onClick={onClick}
      className="fixed bottom-20 sm:bottom-6 left-4 z-40 bg-[#2D1B18] text-white hover:bg-[#3D2522] border-2 border-[#FF4B72] px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 group"
      title="Leave Feedback & Review"
    >
      <div className="relative flex items-center justify-center">
        <i className="fa-solid fa-comment-dots text-[#FF4B72] text-lg group-hover:rotate-12 transition-transform"></i>
        {feedbackCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-amber-400 text-[#2D1B18] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
            {feedbackCount}
          </span>
        )}
      </div>
      <span className="text-xs font-extrabold text-amber-50 tracking-wide hidden xs:inline">
        Feedback
      </span>
      <span className="text-amber-400 text-xs hidden sm:inline">
        ★
      </span>
    </button>
  );
};
