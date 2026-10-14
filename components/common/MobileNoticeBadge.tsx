'use client';

import React, { useState, useEffect } from 'react';
import { X, Smartphone } from 'lucide-react';

export const MobileNoticeBadge: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const isHidden = sessionStorage.getItem('sinefes_demo_hide_badge');
        if (isHidden === 'true') {
          setIsVisible(false);
        }
      }
    } catch {}
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('sinefes_demo_hide_badge', 'true');
      }
    } catch {}
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cihaz Deneyimi Bilgisi"
      className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-2.5 rounded-2xl border border-amber-500/40 bg-zinc-950/95 py-2 pl-3.5 pr-2.5 text-xs font-medium text-zinc-200 backdrop-blur-2xl shadow-2xl shadow-black/90 ring-1 ring-white/10 select-none animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      {/* Canlı Yeşil/Sarı Nokta */}
      <div className="relative flex h-2 w-2 items-center justify-center flex-shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
      </div>

      <div className="flex items-center gap-1.5 text-zinc-200">
        <Smartphone size={14} strokeWidth={2} className="text-amber-400 flex-shrink-0" />
        <span className="font-semibold tracking-wide">
          Mobil (PWA) deneyimi için tasarlanmıştır
        </span>
      </div>

      {/* Kapatma Çarpı Butonu */}
      <button
        type="button"
        onClick={handleClose}
        className="ml-1 flex h-6 w-6 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors active:scale-95 cursor-pointer"
        title="Bildirimi Kapat"
        aria-label="Kapat"
      >
        <X size={14} strokeWidth={2} />
      </button>
    </aside>
  );
};
