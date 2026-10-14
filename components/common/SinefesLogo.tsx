'use client';

import React from 'react';

interface SinefesLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const SinefesLogo: React.FC<SinefesLogoProps> = ({
  size = 36,
  className = '',
  showText = false,
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Sinefes Custom Cinematic Filmstrip Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Dynamic Play Triangle Gradient: Golden Amber to Deep Sunset Orange */}
          <linearGradient
            id="sinefesTriangleGrad"
            x1="47"
            y1="11"
            x2="85"
            y2="46"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          {/* Filmstrip Gradient: Warm Champagne Gold */}
          <linearGradient
            id="sinefesFilmGrad"
            x1="15"
            y1="11"
            x2="63"
            y2="75"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="45%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Ambient Glow */}
          <radialGradient id="sinefesLogoGlow" cx="55%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Squircle Background */}
        <rect
          width="100"
          height="100"
          rx="24"
          fill="#0c0d12"
          stroke="#27272a"
          strokeWidth="2.5"
        />

        {/* Ambient Center Glow */}
        <rect width="100" height="100" rx="24" fill="url(#sinefesLogoGlow)" />

        {/* Logo Geometry */}
        <g transform="translate(-0.4, 6.85)">
          {/* Filmstrip with Perforations */}
          <path
            fill="url(#sinefesFilmGrad)"
            fillRule="evenodd"
            d="M15.7,11.5h25.7l21.8,39.6-12.8,23.7L15.7,11.5ZM20.1,15l3.2-2.2,1,1.9-3.2,2.2-1-1.9ZM54.4,47.7l3.2-2.2,1,1.9-3.2,2.2-1-1.9ZM50.2,39.9l3.1-2.2,1,1.9-3.2,2.2-1-1.9ZM46,32.1l3.1-2.2,1,2-3.2,2.2-1-2ZM41.7,24.3l3.2-2.2,1,2-3.2,2.2-1-2ZM37.5,16.5l3.2-2.2,1,1.9-3.2,2.2-1-1.9ZM45.5,61.8l3.2-2.2,1,2-3.1,2.2-1-2ZM41.3,54l3.2-2.2,1,2-3.1,2.2-1-2ZM37.1,46.2l3.2-2.2,1,1.9-3.2,2.2-1-1.9ZM32.8,38.4l3.2-2.2,1,1.9-3.2,2.2-1-1.9ZM28.6,30.6l3.2-2.2,1,2-3.2,2.2-1-2ZM24.4,22.8l3.2-2.2,1,2-3.2,2.2-1-2Z"
          />

          {/* Dynamic Play Wedge */}
          <polygon
            fill="url(#sinefesTriangleGrad)"
            points="47.6 11.5 85.1 11.5 66.3 45.8 47.6 11.5"
          />
        </g>
      </svg>

      {showText && (
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-extrabold tracking-wider text-zinc-100 font-sans">
              SİNEFES
            </h1>
            <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.2 text-[9px] font-bold text-amber-300 uppercase tracking-widest">
              DEMO
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 font-medium tracking-tight">
            Kişisel Film & Dizi Arşivi
          </p>
        </div>
      )}
    </div>
  );
};
