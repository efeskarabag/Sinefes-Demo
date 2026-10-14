'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Star, Film, Tv, Plus, Check, Loader2, Sparkles } from 'lucide-react';
import { MediaItem, TMDBMediaResult } from '@/lib/types';
import { useAuth } from '@/lib/authContext';

interface SearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<MediaItem, 'id' | 'created_at'>) => Promise<void>;
  existingTmdbIds: Set<number>;
}

export const SearchSheet: React.FC<SearchSheetProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingTmdbIds,
}) => {
  const { isAuthenticated, openGate } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBMediaResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setQuery('');
    setResults([]);
    onClose();
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      const focusTimer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(focusTimer);
      };
    }
  }, [isOpen]);

  // Debounced TMDB search
  useEffect(() => {
    if (!query.trim()) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleAdd = async (result: TMDBMediaResult) => {
    if (!isAuthenticated) {
      openGate();
      return;
    }

    setAddingId(result.id);

    const title = result.title || result.name || 'İsimsiz Yapım';
    const releaseDate = result.release_date || result.first_air_date || '';
    const releaseYear = releaseDate ? releaseDate.substring(0, 4) : '';
    const mediaType = result.media_type === 'tv' ? 'tv' : 'movie';
    const rating = Math.round((result.vote_average || 0) * 10) / 10;

    const genresString =
      result.genres && result.genres.length > 0
        ? result.genres.map(g => g.name).join(', ')
        : null;

    let duration =
      mediaType === 'movie' && result.runtime
        ? `${result.runtime} dk`
        : null;

    let totalSeasons =
      mediaType === 'tv'
        ? result.number_of_seasons || null
        : null;

    // TMDB Detay Servisinden Gerçek Sezon Sayısı ve Süreyi Çek
    try {
      const detailsRes = await fetch(`/api/tmdb/details?id=${result.id}&type=${mediaType}`);
      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        if (mediaType === 'tv' && detailsData.number_of_seasons) {
          totalSeasons = detailsData.number_of_seasons;
        } else if (mediaType === 'movie' && detailsData.runtime) {
          duration = `${detailsData.runtime} dk`;
        }
      }
    } catch (err) {
      console.warn('Details fetch failed in SearchSheet:', err);
    }

    if (mediaType === 'tv' && !totalSeasons) {
      totalSeasons = 1;
    }

    await onAdd({
      tmdb_id: result.id,
      title,
      media_type: mediaType,
      poster_path: result.poster_path,
      backdrop_path: result.backdrop_path,
      release_year: releaseYear,
      imdb_rating: rating,
      status: 'watchlist', // Varsayılan: İzlenecek
      custom_rating: null,
      personal_note: null,
      overview: result.overview || null,
      genres: genresString,
      duration,
      total_seasons: totalSeasons,
    });

    setAddedIds(prev => new Set(prev).add(result.id));
    setAddingId(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center cursor-pointer select-none"
        onClick={handleClose}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="relative flex h-[85vh] md:h-[75vh] w-full max-w-lg md:max-w-xl flex-col overscroll-contain rounded-t-3xl md:rounded-3xl border border-zinc-800 bg-zinc-950 pb-8 pt-3 text-zinc-100 shadow-2xl z-10 md:my-auto cursor-default select-text"
        >
          {/* Mobile Grab Handle */}
          <div
            onClick={handleClose}
            className="mx-auto h-1.5 w-12 rounded-full bg-zinc-800 mb-2 md:hidden cursor-pointer hover:bg-zinc-700 active:bg-zinc-600 transition"
            title="Kapat"
          />

          {/* Header & Search Input */}
          <div className="px-5 pb-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Search size={18} strokeWidth={1.5} className="text-amber-400" />
                Film & Dizi Ekle
              </h2>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Input Bar */}
            <div className="relative flex items-center">
              <Search
                size={18}
                strokeWidth={1.5}
                className="absolute left-3.5 text-zinc-400 pointer-events-none"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                placeholder="Örn: Dune, Severance, Breaking Bad..."
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 py-3 pl-11 pr-10 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              />
              {query && (
                <button
                  onClick={() => handleQueryChange('')}
                  className="absolute right-3 text-zinc-400 hover:text-zinc-200"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto px-5 pb-12 scrollbar-none">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Loader2 size={26} strokeWidth={1.5} className="animate-spin text-amber-400 mb-2" />
                <p className="text-xs">Aranıyor...</p>
              </div>
            ) : query.trim() && results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <p className="text-xs">Sonuç bulunamadı.</p>
              </div>
            ) : !query.trim() ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-600 text-center">
                <Sparkles size={30} strokeWidth={1.5} className="mb-2 opacity-40 text-amber-400" />
                <p className="text-xs max-w-xs">
                  Arşivinize eklemek istediğiniz film veya dizinin adını yukarı yazın.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-900 space-y-2">
                {results.map(res => {
                  const title = res.title || res.name || 'İsimsiz';
                  const releaseDate = res.release_date || res.first_air_date || '';
                  const year = releaseDate ? releaseDate.substring(0, 4) : '';
                  const isTv = res.media_type === 'tv';
                  const isAlreadyInArchive =
                    existingTmdbIds.has(res.id) || addedIds.has(res.id);
                  const isCurrentlyAdding = addingId === res.id;

                  const posterUrl = res.poster_path
                    ? res.poster_path.startsWith('http')
                      ? res.poster_path
                      : `https://image.tmdb.org/t/p/w200${res.poster_path}`
                    : null;

                  return (
                    <div
                      key={res.id}
                      className="flex items-center gap-3.5 py-2.5 transition-colors hover:bg-zinc-900/40 rounded-xl px-2"
                    >
                      {/* Thumbnail Poster */}
                      <div className="relative aspect-[2/3] w-14 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800">
                        {posterUrl ? (
                          <Image
                            src={posterUrl}
                            alt={title}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-600">
                            {isTv ? (
                              <Tv size={16} strokeWidth={1.5} />
                            ) : (
                              <Film size={16} strokeWidth={1.5} />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="flex items-center gap-0.5 rounded bg-zinc-900 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-400 border border-zinc-800">
                            {isTv ? 'Dizi' : 'Film'}
                          </span>
                          {year && (
                            <span className="text-[10px] text-zinc-500 font-medium">
                              {year}
                            </span>
                          )}
                          {res.vote_average > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400">
                              <Star size={10} strokeWidth={1.5} className="fill-amber-400" />
                              {(res.vote_average).toFixed(1)}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-semibold text-zinc-100 truncate">
                          {title}
                        </h4>

                        {res.overview && (
                          <p className="mt-0.5 text-[11px] text-zinc-400 line-clamp-1">
                            {res.overview}
                          </p>
                        )}
                      </div>

                      {/* Add Button */}
                      <button
                        type="button"
                        onClick={() => handleAdd(res)}
                        disabled={isAlreadyInArchive || isCurrentlyAdding}
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border transition active:scale-95 ${
                          isAlreadyInArchive
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 cursor-default'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400'
                        }`}
                        title={isAlreadyInArchive ? 'Arşivde Mevcut' : 'Arşive Ekle'}
                      >
                        {isCurrentlyAdding ? (
                          <Loader2 size={16} strokeWidth={1.5} className="animate-spin text-amber-400" />
                        ) : isAlreadyInArchive ? (
                          <Check size={16} strokeWidth={1.75} />
                        ) : (
                          <Plus size={16} strokeWidth={1.75} />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
