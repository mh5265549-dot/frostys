import React from 'react';

export type FrostyLogoVariant = 'ice' | 'fire' | 'green';

interface FrostyLogoProps {
  variant?: FrostyLogoVariant;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  className?: string;
  animate?: boolean;
  showBadgeBackground?: boolean;
}

const SIZE_MAP = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-24 h-24',
  '2xl': 'w-32 h-32',
  custom: '',
};

export const FrostyLogo: React.FC<FrostyLogoProps> = ({
  variant = 'green',
  size = 'md',
  className = '',
  animate = true,
  showBadgeBackground = false,
}) => {
  const isFire = variant === 'fire';
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;

  const badgeBgClasses = showBadgeBackground
    ? isFire
      ? 'bg-gradient-to-tr from-[#240B07] via-[#3A140B] to-[#170503] border-2 border-orange-500/60 shadow-lg shadow-orange-950/50 rounded-2xl p-1.5'
      : 'bg-gradient-to-tr from-red-600 via-blue-600 to-white border-2 border-white/80 shadow-lg shadow-blue-950/20 rounded-2xl p-1.5'
    : '';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${sizeClasses} ${badgeBgClasses} ${className}`}
      title="Frosty's ⛄"
    >
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full drop-shadow-sm select-none transition-transform duration-300 ${
          animate ? 'hover:scale-105' : ''
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* ============ FROSTY'S RED + BLUE + WHITE SNOWMAN GRADIENTS ============ */}
          <linearGradient id="whiteSnowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F8FAFC" />
            <stop offset="90%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>

          <linearGradient id="snowGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="iceHatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="60%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Frosty's Signature Red Scarf & Ribbon */}
          <linearGradient id="iceScarfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>

          <linearGradient id="iceCarrotGrad" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          {/* ============ FIRE SNOWMAN GRADIENTS ============ */}
          <linearGradient id="fireSnowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="25%" stopColor="#FDE047" />
            <stop offset="55%" stopColor="#FB923C" />
            <stop offset="85%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>

          <linearGradient id="flameBurstGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="35%" stopColor="#EA580C" />
            <stop offset="70%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FEF08A" />
          </linearGradient>

          <linearGradient id="fireHatGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#18181B" />
            <stop offset="70%" stopColor="#27272A" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </linearGradient>

          <linearGradient id="fireScarfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>

          {/* Glowing Filters */}
          <filter id="iceGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="fireGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComponentTransfer in="blur" result="glow">
              <feFuncA type="linear" slope="1.5" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ============================================================ */}
        {/* CASE 1: WHITE SNOWMAN (ICE CREAM EDITION)                    */}
        {/* ============================================================ */}
        {!isFire && (
          <g id="frosty-white-snowman">
            {/* Subtle icy aura behind snowman */}
            <circle cx="50" cy="55" r="40" fill="url(#snowGlow)" />

            {/* Sparkles / Snowflakes */}
            <g className={animate ? 'animate-pulse' : ''} opacity="0.85">
              <path
                d="M16 26L18 22L20 26L24 28L20 30L18 34L16 30L12 28Z"
                fill="#38BDF8"
                opacity="0.9"
              />
              <path
                d="M82 22L83.5 19L85 22L88 23.5L85 25L83.5 28L82 25L79 23.5Z"
                fill="#EF4444"
                opacity="0.9"
              />
              <circle cx="86" cy="62" r="1.5" fill="#38BDF8" opacity="0.85" />
              <circle cx="14" cy="68" r="1.5" fill="#60A5FA" opacity="0.85" />
            </g>

            {/* Snowman Twig Arms */}
            <g stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {/* Left Arm (relaxed branch) */}
              <path d="M30 65L17 58M21 60L16 64M23 59L22 53" />
              {/* Right Arm (friendly waving up) */}
              <path d="M70 65L83 55M79 58L85 59M77 60L82 66" />
            </g>

            {/* Bottom Snowball (Body) */}
            <circle
              cx="50"
              cy="72"
              r="22"
              fill="url(#whiteSnowGrad)"
              stroke="#BAE6FD"
              strokeWidth="1.6"
            />
            {/* Soft 3D crescent shadow on body */}
            <path
              d="M32 78C35 88 47 94 62 90C53 93 39 91 32 78Z"
              fill="#94A3B8"
              opacity="0.35"
            />

            {/* Coal Buttons on Tummy */}
            <circle cx="50" cy="63" r="2.2" fill="#0F172A" />
            <circle cx="50.8" cy="62.4" r="0.7" fill="#94A3B8" />

            <circle cx="50" cy="72" r="2.4" fill="#0F172A" />
            <circle cx="50.8" cy="71.4" r="0.7" fill="#94A3B8" />

            <circle cx="50" cy="81" r="2.2" fill="#0F172A" />
            <circle cx="50.8" cy="80.4" r="0.7" fill="#94A3B8" />

            {/* Head Snowball */}
            <circle
              cx="50"
              cy="41"
              r="16.5"
              fill="url(#whiteSnowGrad)"
              stroke="#BAE6FD"
              strokeWidth="1.6"
            />
            {/* Soft 3D shadow on head */}
            <path
              d="M36 47C39 54 48 57 59 55C51 57 41 55 36 47Z"
              fill="#94A3B8"
              opacity="0.3"
            />

            {/* Rosy Pink Cheeks */}
            <ellipse cx="40" cy="43" rx="2.5" ry="1.4" fill="#FDA4AF" opacity="0.7" />
            <ellipse cx="60" cy="43" rx="2.5" ry="1.4" fill="#FDA4AF" opacity="0.7" />

            {/* Sparkling Coal Eyes */}
            <circle cx="43.5" cy="38" r="2.2" fill="#0F172A" />
            <circle cx="44.2" cy="37.2" r="0.8" fill="#FFFFFF" />

            <circle cx="56.5" cy="38" r="2.2" fill="#0F172A" />
            <circle cx="57.2" cy="37.2" r="0.8" fill="#FFFFFF" />

            {/* Smiling Coal Mouth */}
            <circle cx="43" cy="46.5" r="1.1" fill="#1E293B" />
            <circle cx="46.5" cy="48.5" r="1.1" fill="#1E293B" />
            <circle cx="50" cy="49.2" r="1.2" fill="#1E293B" />
            <circle cx="53.5" cy="48.5" r="1.1" fill="#1E293B" />
            <circle cx="57" cy="46.5" r="1.1" fill="#1E293B" />

            {/* Cute Vibrant Carrot Nose */}
            <path
              d="M48.5 40.5L62 42.5C63 42.7 63 43.3 62 43.5L48.5 45C47.8 45 47.5 40.5 48.5 40.5Z"
              fill="url(#iceCarrotGrad)"
              stroke="#C2410C"
              strokeWidth="0.5"
            />
            {/* Carrot ridge texture marks */}
            <path d="M52 41.5L52.5 43.5M56 42.2L56.5 43.2" stroke="#EA580C" strokeWidth="0.6" strokeLinecap="round" />

            {/* Cozy Winter Scarf around Neck */}
            {/* Main scarf collar */}
            <path
              d="M34 52C34 50 42 49 50 49C58 49 66 50 66 52C66 56 58 58 50 58C42 58 34 56 34 52Z"
              fill="url(#iceScarfGrad)"
            />
            {/* Scarf tail waving down */}
            <path
              d="M41 54L38 72C38 73.5 43 74 45 72.5L48 55"
              fill="url(#iceScarfGrad)"
            />
            {/* Scarf fringe cuts */}
            <path d="M38.5 72L38.5 75M41 73L41 76M43.5 73L43.5 76M45 72.5L45 75.5" stroke="#FFE4E6" strokeWidth="1" strokeLinecap="round" />
            {/* White stripe on scarf */}
            <path d="M39 64L46.5 65.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />

            {/* Dapper Black Winter Top Hat */}
            {/* Brim */}
            <ellipse cx="50" cy="28" rx="17" ry="3.5" fill="url(#iceHatGrad)" stroke="#0F172A" strokeWidth="1" />
            {/* Hat Crown */}
            <path
              d="M38 12C38 10.5 40 10 50 10C60 10 62 10.5 62 12L60.5 27C60.5 27 55 28.5 50 28.5C45 28.5 39.5 27 39.5 27L38 12Z"
              fill="url(#iceHatGrad)"
            />
            {/* Hat Ribbon (Frosty's signature pink) */}
            <path
              d="M39.5 23.5C42 24.5 46 25 50 25C54 25 58 24.5 60.5 23.5L60.2 27C57 28 53 28.5 50 28.5C47 28.5 43 28 39.8 27L39.5 23.5Z"
              fill="url(#iceScarfGrad)"
            />
            {/* Golden Ribbon Buckle / Snowflake Pin */}
            <circle cx="50" cy="25.5" r="1.6" fill="#FBBF24" />
            <circle cx="50" cy="25.5" r="0.8" fill="#FDE68A" />
          </g>
        )}

        {/* ============================================================ */}
        {/* CASE 2: SNOWMAN FIRE EDITION (GRILL EDITION)                 */}
        {/* ============================================================ */}
        {isFire && (
          <g id="frosty-fire-snowman">
            {/* Background Sizzling Flame Aura */}
            <g opacity="0.9" className={animate ? 'animate-pulse' : ''}>
              {/* Outer heat glow */}
              <circle cx="50" cy="55" r="42" fill="#EA580C" opacity="0.18" filter="url(#fireGlowFilter)" />
              {/* Leaping background flames */}
              <path
                d="M20 75C16 60 22 45 28 40C26 48 30 52 32 46C36 38 45 30 40 20C48 26 52 35 48 42C52 38 58 35 60 28C64 36 68 45 64 52C68 48 74 44 78 50C82 56 84 66 80 75C70 90 30 90 20 75Z"
                fill="url(#flameBurstGrad)"
                opacity="0.35"
              />
            </g>

            {/* Floating Sparks & Embers */}
            <g className={animate ? 'animate-pulse' : ''}>
              {/* Embers */}
              <circle cx="16" cy="30" r="1.8" fill="#F59E0B" filter="url(#fireGlowFilter)" />
              <circle cx="84" cy="32" r="2.2" fill="#EF4444" filter="url(#fireGlowFilter)" />
              <circle cx="22" cy="18" r="1.4" fill="#FEF08A" />
              <circle cx="78" cy="16" r="1.6" fill="#FBBF24" />
              <circle cx="12" cy="56" r="1.2" fill="#F97316" />
              <circle cx="88" cy="58" r="1.4" fill="#FEF08A" />
            </g>

            {/* Flaming Charcoal Twig Arms */}
            <g stroke="#3F1D0B" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              {/* Left Arm with Flame Hand */}
              <path d="M30 65L16 56M20 59L15 63M22 58L20 52" />
              {/* Right Arm with Flame Hand */}
              <path d="M70 65L84 54M80 57L86 58M78 59L83 65" />
            </g>
            {/* Flames dancing on fingertips */}
            <path d="M14 55C12 51 14 47 16 45C17 48 18 51 16 55Z" fill="#F59E0B" />
            <path d="M84 53C86 49 88 45 86 43C85 46 83 49 84 53Z" fill="#F59E0B" />

            {/* Bottom Snowball (Fiery Molten Body) */}
            <circle
              cx="50"
              cy="72"
              r="22"
              fill="url(#fireSnowGrad)"
              stroke="#F59E0B"
              strokeWidth="1.8"
              filter="url(#fireGlowFilter)"
            />
            {/* Molten Lava Heat Core */}
            <ellipse cx="50" cy="74" rx="14" ry="12" fill="#FEF08A" opacity="0.35" filter="url(#fireGlowFilter)" />

            {/* Sizzling Red-Hot Coal Buttons (Embers) */}
            <g filter="url(#fireGlowFilter)">
              <circle cx="50" cy="63" r="2.6" fill="#B91C1C" stroke="#F59E0B" strokeWidth="0.8" />
              <circle cx="50" cy="63" r="1.2" fill="#FEF08A" />

              <circle cx="50" cy="72" r="2.8" fill="#B91C1C" stroke="#F59E0B" strokeWidth="0.8" />
              <circle cx="50" cy="72" r="1.3" fill="#FEF08A" />

              <circle cx="50" cy="81" r="2.6" fill="#B91C1C" stroke="#F59E0B" strokeWidth="0.8" />
              <circle cx="50" cy="81" r="1.2" fill="#FEF08A" />
            </g>

            {/* Head Snowball (Fiery Ember Head) */}
            <circle
              cx="50"
              cy="41"
              r="16.5"
              fill="url(#fireSnowGrad)"
              stroke="#F59E0B"
              strokeWidth="1.8"
              filter="url(#fireGlowFilter)"
            />
            {/* Head Heat Glow Core */}
            <ellipse cx="50" cy="42" rx="10" ry="9" fill="#FEF08A" opacity="0.4" />

            {/* Burning Ember Eyes (Intense Gold/Fire) */}
            <circle cx="43.5" cy="38" r="2.4" fill="#7F1D1D" />
            <circle cx="43.5" cy="38" r="1.6" fill="#F59E0B" />
            <circle cx="43.5" cy="38" r="0.8" fill="#FEF08A" />

            <circle cx="56.5" cy="38" r="2.4" fill="#7F1D1D" />
            <circle cx="56.5" cy="38" r="1.6" fill="#F59E0B" />
            <circle cx="56.5" cy="38" r="0.8" fill="#FEF08A" />

            {/* Fiery Grin with Charcoal Embers */}
            <circle cx="43" cy="46.5" r="1.2" fill="#450A0A" />
            <circle cx="46.5" cy="48.5" r="1.2" fill="#EA580C" />
            <circle cx="50" cy="49.2" r="1.4" fill="#FEF08A" />
            <circle cx="53.5" cy="48.5" r="1.2" fill="#EA580C" />
            <circle cx="57" cy="46.5" r="1.2" fill="#450A0A" />

            {/* Fiery Blazing Chili/Pepper Nose */}
            <path
              d="M48 40.5L64 42.5C65.5 42.7 65.5 43.3 64 43.5L48 45.5C47 45.5 46.5 40.5 48 40.5Z"
              fill="url(#flameBurstGrad)"
              stroke="#B91C1C"
              strokeWidth="0.6"
              filter="url(#fireGlowFilter)"
            />
            {/* Yellow flame tip on nose */}
            <circle cx="63.5" cy="43" r="1" fill="#FEF08A" />

            {/* Fiery Dancing Flame Scarf */}
            {/* Main flame wrap around neck */}
            <path
              d="M33 52C33 49.5 41 48.5 50 48.5C59 48.5 67 49.5 67 52C67 56 59 58.5 50 58.5C41 58.5 33 56 33 52Z"
              fill="url(#fireScarfGrad)"
              stroke="#EA580C"
              strokeWidth="0.8"
            />
            {/* Flying tongue-of-fire scarf tail */}
            <path
              d="M40 54C40 54 36 65 37 73C38 75 42 74 44 71C46 68 47 62 48 55"
              fill="url(#flameBurstGrad)"
            />
            {/* Flame tips on scarf end */}
            <path
              d="M37 73C36 76 38 78 40 76C42 74 43 72 44 71"
              fill="#FEF08A"
            />

            {/* Charcoal Hat with Roaring Flames Bursting Out */}
            {/* Leaping Flames from inside the top hat! */}
            <path
              d="M42 12C38 6 43 1 45 0C46 5 48 8 50 4C52 9 55 2 57 1C58 6 56 10 58 12Z"
              fill="url(#flameBurstGrad)"
              filter="url(#fireGlowFilter)"
            />

            {/* Hat Brim */}
            <ellipse cx="50" cy="28" rx="17" ry="3.5" fill="url(#fireHatGrad)" stroke="#EA580C" strokeWidth="0.8" />
            
            {/* Hat Crown (Charred Dark Metal / Charcoal) */}
            <path
              d="M38 12C38 10.5 40 10 50 10C60 10 62 10.5 62 12L60.5 27C60.5 27 55 28.5 50 28.5C45 28.5 39.5 27 39.5 27L38 12Z"
              fill="url(#fireHatGrad)"
            />

            {/* Glowing Magma Ember Band around Hat */}
            <path
              d="M39.5 23.5C42 24.5 46 25 50 25C54 25 58 24.5 60.5 23.5L60.2 27C57 28 53 28.5 50 28.5C47 28.5 43 28 39.8 27L39.5 23.5Z"
              fill="url(#fireScarfGrad)"
            />

            {/* Fiery Skull/Flame Medallion on Hat */}
            <circle cx="50" cy="25.5" r="1.8" fill="#FEF08A" filter="url(#fireGlowFilter)" />
            <circle cx="50" cy="25.5" r="0.9" fill="#B91C1C" />
          </g>
        )}
      </svg>
    </div>
  );
};
