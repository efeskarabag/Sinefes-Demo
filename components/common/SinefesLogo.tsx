'use client';

import React from 'react';
import Image from 'next/image';

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
      {/* Sinefes S-Filmstrip Loop Emblem (Centered, Standalone) */}
      <div
        style={{ width: size, height: size }}
        className="relative flex-shrink-0 overflow-hidden rounded-xl border border-zinc-800 bg-[#0c0d12] shadow-sm transition-transform duration-300 hover:scale-105"
      >
        <Image
          src="/sinefes-logo.png"
          alt="Sinefes"
          fill
          priority
          sizes={`${size}px`}
          className="object-cover"
        />
      </div>

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
