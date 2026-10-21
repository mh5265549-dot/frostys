import React from 'react';
import { useBrandLogo, DEFAULT_LOGO_URL } from '../utils/logoStorage';

export const FROSTY_REAL_LOGO_URL = DEFAULT_LOGO_URL;

export interface FrostyLogoProps {
  variant?: 'ice' | 'fire' | 'real' | string;
  size?: 'sm' | 'md' | 'lg' | 'custom';
  className?: string;
  animate?: boolean;
  onClick?: () => void;
}

export const FrostyLogo: React.FC<FrostyLogoProps> = ({
  variant = 'real',
  size = 'md',
  className = '',
  animate = true,
  onClick,
}) => {
  const { logoUrl } = useBrandLogo();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    custom: '',
  };

  const chosenSize = sizeClasses[size as keyof typeof sizeClasses] || '';

  if (variant === 'real' || !variant) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 ${chosenSize} ${className} ${
          onClick ? 'cursor-pointer' : ''
        }`}
        onClick={onClick}
      >
        <img
          src={logoUrl || DEFAULT_LOGO_URL}
          alt="Frosty's Logo"
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    );
  }

  const isFire = variant === 'fire';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 ${chosenSize} ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full ${animate ? 'transition-transform duration-300 hover:scale-105' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="whiteSnowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </linearGradient>
          <linearGradient id="fireSnowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* Outer Circular Ring */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill={isFire ? '#7c2d12' : '#1e3a8a'}
          stroke={isFire ? '#f97316' : '#60a5fa'}
          strokeWidth="3"
        />
        <circle
          cx="50"
          cy="50"
          r="44"
          fill={isFire ? '#9a3412' : '#1d4ed8'}
        />

        {/* Snowman Body */}
        <circle cx="50" cy="68" r="22" fill={isFire ? "url(#fireSnowGrad)" : "url(#whiteSnowGrad)"} />
        <circle cx="50" cy="42" r="16" fill={isFire ? "url(#fireSnowGrad)" : "url(#whiteSnowGrad)"} />

        {/* Snowman Eyes */}
        <circle cx="44" cy="40" r="2.5" fill="#1e293b" />
        <circle cx="56" cy="40" r="2.5" fill="#1e293b" />

        {/* Carrot Nose */}
        <polygon points="50,43 50,47 62,45" fill="#f97316" />

        {/* Beanie Hat */}
        <path
          d="M36 34 C36 22 64 22 64 34 Z"
          fill={isFire ? '#ea580c' : '#2563eb'}
        />
        <rect x="34" y="32" width="32" height="5" rx="2" fill={isFire ? '#fed7aa' : '#bae6fd'} />
        <circle cx="50" cy="20" r="4.5" fill="#ffffff" />

        {/* Scarf */}
        <path
          d="M40 49 Q50 54 60 49 Q50 57 40 49 Z"
          fill={isFire ? '#dc2626' : '#0284c7'}
        />
        <rect x="42" y="52" width="6" height="14" rx="2" fill={isFire ? '#dc2626' : '#0284c7'} />

        {/* Buttons / Flame Sparkle */}
        <circle cx="50" cy="62" r="2" fill={isFire ? '#ffedd5' : '#1e293b'} />
        <circle cx="50" cy="70" r="2" fill={isFire ? '#ffedd5' : '#1e293b'} />
        <circle cx="50" cy="78" r="2" fill={isFire ? '#ffedd5' : '#1e293b'} />
      </svg>
    </div>
  );
};
export default FrostyLogo;
