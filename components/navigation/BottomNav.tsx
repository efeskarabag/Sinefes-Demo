'use client';

import React from 'react';
import { Film, Tv, Plus } from 'lucide-react';

export type NavTab = 'movies' | 'tv';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSearch: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
}) => {
  return (
    <nav
      className="fixed bottom-5 inset-x-0 z-40 flex justify-center pointer-events-none px-4"
      role="navigation"
      aria-label="Ana Navigasyon"
    >
      {/* Premium Floating Island Dock */}
      <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-3 rounded-full border border-zinc-800/90 bg-zinc-950/85 p-1.5 sm:p-2 shadow-2xl shadow-black/90 backdrop-blur-2xl ring-1 ring-white/5">
        {/* 1. Filmler Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('movies')}
          className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-200 active:opacity-80 ${
            currentTab === 'movies'
              ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Film
            size={16}
            strokeWidth={1.75}
            className={currentTab === 'movies' ? 'text-amber-400' : 'text-zinc-400'}
          />
          <span>Filmler</span>
        </button>

        {/* 2. Hero Center Button: Film & Dizi Ekle (+) */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="group relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 text-zinc-950 shadow-lg shadow-amber-500/30 transition-all duration-200 hover:brightness-105 active:opacity-85 hover:shadow-amber-500/50"
          title="Film & Dizi Ekle"
          aria-label="Film ve Dizi Ekle"
        >
          <Plus
            size={22}
            strokeWidth={2.5}
            className="transition-transform group-hover:rotate-90 duration-300"
          />
        </button>

        {/* 3. Diziler Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('tv')}
          className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-200 active:opacity-80 ${
            currentTab === 'tv'
              ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Tv
            size={16}
            strokeWidth={1.75}
            className={currentTab === 'tv' ? 'text-amber-400' : 'text-zinc-400'}
          />
          <span>Diziler</span>
        </button>
      </div>
    </nav>
  );
};
