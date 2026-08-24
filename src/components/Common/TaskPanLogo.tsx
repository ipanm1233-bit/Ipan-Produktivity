import React from 'react';

interface TaskPanLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
}

export const TaskPanLogo: React.FC<TaskPanLogoProps> = ({
  className = '',
  size = 'md',
  showBadge = false,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const currentSizeClass = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${currentSizeClass} ${className}`}>
      {/* 3D Clay Gradient Squircle Logo */}
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Main 3D Orange Clay Gradient */}
          <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="35%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>

          {/* Inner Light Card Gradient */}
          <linearGradient id="logoInnerCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FDEEE3" />
          </linearGradient>

          {/* Green Checkmark Badge Gradient */}
          <linearGradient id="logoGreenCheck" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Golden Coin Gradient */}
          <linearGradient id="logoGoldCoin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Filter for realistic clay shadow */}
          <filter id="logoShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#7C2D12" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Outer 3D Squircle Base */}
        <rect
          x="6"
          y="6"
          width="108"
          height="108"
          rx="30"
          fill="url(#logoBgGrad)"
          filter="url(#logoShadow)"
        />

        {/* Subtle Top Specular 3D Reflection */}
        <path
          d="M 16 34 C 16 20, 24 16, 60 16 C 96 16, 104 20, 104 34 C 104 42, 85 30, 60 30 C 35 30, 16 42, 16 34 Z"
          fill="#FFFFFF"
          opacity="0.32"
        />

        {/* Center Clay White Tablet */}
        <rect
          x="24"
          y="24"
          width="72"
          height="72"
          rx="18"
          fill="url(#logoInnerCardGrad)"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="1.5"
        />

        {/* Checklist lines on tablet */}
        <rect x="34" y="38" width="30" height="4" rx="2" fill="#E2D4C8" />
        <rect x="34" y="48" width="40" height="4" rx="2" fill="#E2D4C8" />
        <rect x="34" y="58" width="22" height="4" rx="2" fill="#E2D4C8" />

        {/* Productivity 3D Green Check Circle */}
        <circle cx="44" cy="74" r="14" fill="url(#logoGreenCheck)" />
        <path
          d="M 38 74 L 42 78 L 50 69"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Finance 3D Gold Coin with Rp Emblem */}
        <circle cx="76" cy="74" r="14" fill="url(#logoGoldCoin)" />
        <circle cx="76" cy="74" r="11" fill="none" stroke="#FEF3C7" strokeWidth="1.5" />
        <text
          x="76"
          y="78"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="10"
          fill="#78350F"
          textAnchor="middle"
        >
          Rp
        </text>

        {/* Playful Sparkle */}
        <circle cx="86" cy="36" r="3" fill="#FB923C" />
      </svg>

      {showBadge && (
        <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[8px] font-black px-1 py-0.2 rounded-md shadow-xs border border-white uppercase">
          Pro
        </span>
      )}
    </div>
  );
};
