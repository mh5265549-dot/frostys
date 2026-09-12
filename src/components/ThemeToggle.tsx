import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'icon' | 'badge' | 'full';
  className?: string;
  onToggleCallback?: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  className = '',
  onToggleCallback,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  const handleToggle = () => {
    toggleTheme();
    if (onToggleCallback) {
      onToggleCallback();
    }
  };

  if (variant === 'badge') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        id="btn-theme-toggle-badge"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm ${
          isDark
            ? 'bg-stone-800/90 hover:bg-stone-700 text-amber-300 border-stone-700/80'
            : 'bg-amber-100/90 hover:bg-amber-200 text-amber-950 border-amber-300/80'
        } ${className}`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Late-Night Dark Mode'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Late-Night Dark Mode'}
      >
        <span className="relative flex items-center justify-center w-4 h-4">
          {isDark ? (
            <i className="fa-solid fa-sun text-amber-400 text-xs animate-spin-slow"></i>
          ) : (
            <i className="fa-solid fa-moon text-indigo-900 text-xs"></i>
          )}
        </span>
        <span>{isDark ? 'Night Theme' : 'Light Theme'}</span>
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        id="btn-theme-toggle-full"
        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
          isDark
            ? 'bg-[#221614] hover:bg-[#2C1E1B] text-amber-200 border-[#3D2522]'
            : 'bg-stone-100 hover:bg-stone-200 text-[#2D1B18] border-stone-200'
        } ${className}`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Late-Night Dark Mode'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Late-Night Dark Mode'}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs ${
              isDark
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-stone-200 text-stone-700 border border-stone-300'
            }`}
          >
            <i className={`fa-solid ${isDark ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-700'}`}></i>
          </div>
          <div className="text-left">
            <span className="block font-heading font-bold text-xs">
              {isDark ? 'Late-Night Mode Active' : 'Daylight Mode Active'}
            </span>
            <span className="block text-[10px] opacity-75 font-medium">
              {isDark ? 'Click for Day View' : 'Click for 2 AM Night View'}
            </span>
          </div>
        </div>

        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
            isDark
              ? 'bg-amber-400 text-stone-950'
              : 'bg-[#2D1B18] text-amber-200'
          }`}
        >
          {isDark ? 'Dark' : 'Light'}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      id="btn-theme-toggle"
      className={`relative p-2.5 rounded-xl border transition-all duration-200 text-xs font-bold flex items-center justify-center shadow-sm group focus:outline-none focus:ring-2 focus:ring-[#FF4B72] ${
        isDark
          ? 'bg-[#2D1B18] hover:bg-[#3D2522] text-amber-300 border-[#5A3833] hover:border-amber-400/50'
          : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300 hover:border-stone-400'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode (Daytime View)' : 'Switch to Late-Night Dark Mode (Dim Lighting)'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Late-Night Dark Mode'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
        {isDark ? (
          <i className="fa-solid fa-sun text-amber-400 text-sm animate-fade-in" />
        ) : (
          <i className="fa-solid fa-moon text-[#2D1B18] text-sm animate-fade-in" />
        )}
      </div>
      <span className="sr-only">Toggle theme (currently {theme})</span>
    </button>
  );
};
