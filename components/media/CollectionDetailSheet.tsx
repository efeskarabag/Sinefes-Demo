'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import {
  X,
  Star,
  Clock,
  Crown,
  Play,
  CheckCircle2,
  Hourglass,
  Film,
  Plus,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { CollectionGroup, MediaItem } from '@/lib/types';
import { ABSURD_RATINGS } from '@/lib/constants';
import { RatingIcon, SeriesIcon } from '@/components/media/MediaIcons';
import { getNextToWatchInCollection } from '@/lib/collections';
import { useAuth } from '@/lib/authContext';

interface CollectionPart {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string | null;
  release_year: string;
  vote_average: number;
  overview: string;
}

interface CollectionDetailSheetProps {
  collection: CollectionGroup | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (item: MediaItem) => void;
  archiveItems: MediaItem[];
  onAddMultiple: (items: Array<Omit<MediaItem, 'id' | 'created_at'>>, seriesName: string) => Promise<void>;
  onAddSingle: (item: Omit<MediaItem, 'id' | 'created_at'>) => Promise<void>;
}

export const CollectionDetailSheet: React.FC<CollectionDetailSheetProps> = ({
  collection: propCollection,
  isOpen,
  onClose,
  onSelectMovie,
  archiveItems,
  onAddMultiple,
  onAddSingle,
}) => {
  const { isAuthenticated, openGate } = useAuth();
  const [activeCollection, setActiveCollection] = useState<CollectionGroup | null>(propCollection);

  useEffect(() => {
    if (propCollection) {
      setActiveCollection(propCollection);
    }
  }, [propCollection]);

  const collection = propCollection || activeCollection;
  const [fullParts, setFullParts] = useState<CollectionPart[]>([]);
  const [isLoadingParts, setIsLoadingParts] = useState<boolean>(false);
  const [isAddingAll, setIsAddingAll] = useState<boolean>(false);
  const [addingSingleId, setAddingSingleId] = useState<number | null>(null);

  // Thumb Swipe-to-Dismiss (Soldan sağa baş parmakla çekerek kapatma)
  const x = useMotionValue(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const isSwipingRight = useRef<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      x.set(0);
    }
  }, [isOpen, collection?.id, x]);

  // Body scroll lock ve Escape dinleyici
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Serinin TMDB'deki tüm filmlerini (parts) çek
  useEffect(() => {
    if (!isOpen || !collection) {
      setFullParts([]);
      return;
    }

    let isMounted = true;
    setIsLoadingParts(true);

    const queryParam = collection.id.startsWith('franchise-')
      ? `franchiseId=${encodeURIComponent(collection.id)}`
      : `id=${collection.tmdb_collection_id || ''}`;

    fetch(`/api/tmdb/collection?${queryParam}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!isMounted || !data) return;
        if (Array.isArray(data.parts)) {
          setFullParts(data.parts);
        }
      })
      .catch(err => console.warn('Failed to fetch full collection parts:', err))
      .finally(() => {
        if (isMounted) setIsLoadingParts(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, collection]);

  // Arşivdeki filmlerin eşleme haritası
  const archiveMap = useMemo(() => {
    const map = new Map<number, MediaItem>();
    (archiveItems || []).forEach(item => {
      map.set(item.tmdb_id, item);
    });
    return map;
  }, [archiveItems]);

  // Kronolojik tam liste: Arşivdekiler ve serideki eksikler
  const mergedList = useMemo(() => {
    if (!collection) return [];

    if (fullParts.length === 0) {
      return collection.items.map(movie => ({
        partId: movie.tmdb_id,
        title: movie.title,
        release_year: movie.release_year,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        imdb_rating: movie.imdb_rating,
        overview: movie.overview,
        duration: movie.duration,
        inArchive: true,
        archiveItem: movie,
      }));
    }

    return fullParts.map(part => {
      const archiveItem = archiveMap.get(part.id);
      return {
        partId: part.id,
        title: part.title,
        release_year: part.release_year,
        poster_path: part.poster_path,
        backdrop_path: part.backdrop_path,
        imdb_rating: archiveItem ? archiveItem.imdb_rating : part.vote_average,
        overview: archiveItem ? archiveItem.overview : part.overview,
        duration: archiveItem ? archiveItem.duration : null,
        inArchive: Boolean(archiveItem),
        archiveItem: archiveItem || null,
      };
    });
  }, [fullParts, collection, archiveMap]);

  // Arşivde olmayan eksik filmler
  const missingParts = useMemo(() => {
    return mergedList.filter(item => !item.inArchive);
  }, [mergedList]);

  // Arşivdeki mevcut filmler
  const inArchiveItems = useMemo(() => {
    return mergedList
      .filter(item => item.inArchive && item.archiveItem)
      .map(item => item.archiveItem as MediaItem);
  }, [mergedList]);

  const watchedCount = useMemo(() => {
    return inArchiveItems.filter(i => i.status === 'watched').length;
  }, [inArchiveItems]);

  const totalFranchiseCount = mergedList.length || collection?.total_count || 0;
  const isAllInArchive = missingParts.length === 0;
  const completionPercentage = totalFranchiseCount > 0
    ? Math.round((watchedCount / totalFranchiseCount) * 100)
    : 0;

  const nextToWatch = useMemo(() => {
    if (!collection) return null;
    return getNextToWatchInCollection(collection);
  }, [collection]);

  // Eksik tüm filmleri tek tıkla arşive ekle
  const handleBatchAddMissing = async () => {
    if (!isAuthenticated) {
      openGate();
      return;
    }
    if (missingParts.length === 0 || !collection) return;
    setIsAddingAll(true);
    try {
      const itemsToAdd = missingParts.map(m => ({
        tmdb_id: m.partId,
        title: m.title,
        media_type: 'movie' as const,
        poster_path: m.poster_path,
        backdrop_path: m.backdrop_path,
        release_year: m.release_year || '',
        imdb_rating: m.imdb_rating || 0,
        status: 'watchlist' as const,
        custom_rating: null,
        personal_note: null,
        overview: m.overview || null,
        genres: null,
        duration: null,
        total_seasons: null,
      }));
      await onAddMultiple(itemsToAdd, collection.name);
    } catch (err) {
      console.error('Failed to batch add collection items:', err);
    } finally {
      setIsAddingAll(false);
    }
  };

  // Serideki tekil bir eksik filmi arşive ekle
  const handleAddSingleMissing = async (m: typeof mergedList[0]) => {
    if (!isAuthenticated) {
      openGate();
      return;
    }
    setAddingSingleId(m.partId);
    try {
      await onAddSingle({
        tmdb_id: m.partId,
        title: m.title,
        media_type: 'movie' as const,
        poster_path: m.poster_path,
        backdrop_path: m.backdrop_path,
        release_year: m.release_year || '',
        imdb_rating: m.imdb_rating || 0,
        status: 'watchlist' as const,
        custom_rating: null,
        personal_note: null,
        overview: m.overview || null,
        genres: null,
        duration: null,
        total_seasons: null,
      });
    } catch (err) {
      console.error('Failed to add single item:', err);
    } finally {
      setAddingSingleId(null);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    isSwipingRight.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    if (isSwipingRight.current === null) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > 8 || absY > 8) {
        if (deltaX > 0 && deltaX > absY * 1.1) {
          isSwipingRight.current = true;
        } else {
          isSwipingRight.current = false;
        }
      }
    }

    if (isSwipingRight.current === true) {
      const clampedX = Math.max(0, deltaX);
      x.set(clampedX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    if (isSwipingRight.current === true) {
      const finalDeltaX = e.changedTouches[0].clientX - touchStartX.current;
      const elapsed = Math.max(1, Date.now() - touchStartTime.current);
      const velocity = finalDeltaX / elapsed;
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 375;
      const distanceThreshold = Math.min(100, screenWidth * 0.25);

      if (finalDeltaX > distanceThreshold || (finalDeltaX > 40 && velocity > 0.4)) {
        animate(x, screenWidth, {
          duration: 0.22,
          ease: [0.32, 0.72, 0, 1],
        }).then(() => {
          onClose();
          setTimeout(() => x.set(0), 100);
        });
      } else {
        animate(x, 0, {
          duration: 0.22,
          ease: [0.16, 1, 0.3, 1],
        });
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    isSwipingRight.current = null;
  };

  const backdropUrl = collection?.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${collection.backdrop_path}`
    : collection?.items[0]?.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${collection.items[0].backdrop_path}`
    : null;

  const isCompleted = completionPercentage === 100 && isAllInArchive;

  return (
    <AnimatePresence>
      {isOpen && collection && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Karartma Katmanı */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal / Bottom Sheet Gövdesi */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ x }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative z-10 w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-t-[28px] sm:rounded-3xl border border-zinc-800/90 bg-zinc-950 pb-8 text-zinc-100 shadow-2xl shadow-black/80 flex flex-col"
          >
            {/* Mobil Sürükleme Çizgisi */}
            <div className="sticky top-0 z-30 flex justify-center pt-2.5 pb-1 bg-zinc-950/70 backdrop-blur-md sm:hidden">
              <div className="h-1.5 w-12 rounded-full bg-zinc-700/80" />
            </div>

            {/* Kapat Butonu */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-30 rounded-full bg-zinc-900/80 p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition active:opacity-75 border border-zinc-800/80 backdrop-blur-md"
              aria-label="Kapat"
            >
            <X size={18} strokeWidth={2} />
          </button>

          {/* Banner / Kapak Bölümü */}
          <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-zinc-900 flex-shrink-0">
            {backdropUrl ? (
              <Image
                src={backdropUrl}
                alt={collection.name}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 672px"
                className="object-cover object-top opacity-35 filter brightness-90"
              />
            ) : null}

            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

            {/* Banner Bilgileri */}
            <div className="absolute inset-x-5 bottom-4 z-10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-md bg-amber-500/25 px-2 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-500/40">
                  <SeriesIcon size={12} />
                  <span>{totalFranchiseCount} Film</span>
                </span>

                {isCompleted ? (
                  <span className="flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/40">
                    <Crown size={12} strokeWidth={2} className="text-emerald-400" />
                    <span>Seri Tamamlandı</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-zinc-300">
                    {inArchiveItems.length}/{totalFranchiseCount} Arşivinde • {watchedCount} İzlendi
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
                {collection.name}
              </h2>

              {/* İlerleme Çubuğu */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                  <span>İzleme İlerlemesi</span>
                  <span className="font-mono text-amber-300 font-bold">
                    %{completionPercentage}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800/80 overflow-hidden border border-zinc-700/60">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300'
                    }`}
                    style={{ width: `${Math.max(4, completionPercentage)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Açıklama / Genel Bakış */}
          {collection.overview && (
            <div className="px-5 pt-3">
              <p className="text-xs leading-relaxed text-zinc-400 bg-zinc-900/30 p-3 rounded-xl border border-zinc-800/80">
                {collection.overview}
              </p>
            </div>
          )}

          {/* Eksik Filmleri Tamamlama Bannerı */}
          {missingParts.length > 0 && (
            <div className="px-5 pt-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-zinc-900/60 border border-amber-500/30 shadow-md shadow-amber-500/5">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Sparkles size={13} className="text-amber-400" />
                    <span>Seriyi Tamamla</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Bu seride henüz arşivinde olmayan <span className="text-amber-300 font-semibold">{missingParts.length} film</span> bulunuyor.
                  </p>
                </div>

                <button
                  onClick={handleBatchAddMissing}
                  disabled={isAddingAll}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:opacity-85 text-zinc-950 px-3.5 py-2 text-xs font-bold shadow-md shadow-amber-500/20 transition disabled:opacity-50 flex-shrink-0"
                >
                  {isAddingAll ? (
                    <>
                      <Loader2 size={13} className="animate-spin text-zinc-950" />
                      <span>Ekleniyor...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} strokeWidth={2.5} />
                      <span>Eksik {missingParts.length} Filmi Ekle</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Kronolojik Film Listesi */}
          <div className="px-5 pt-4 space-y-2">
            <div className="flex items-center justify-between pb-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Film size={13} strokeWidth={1.75} className="text-amber-400" />
                <span>Kronolojik İzleme Sırası</span>
              </h4>
              <span className="text-[11px] text-zinc-500">
                Vizyon Tarihine Göre
              </span>
            </div>

            {isLoadingParts && mergedList.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-zinc-500 gap-2 text-xs">
                <Loader2 size={16} className="animate-spin text-amber-400" />
                <span>Seri yapımları yükleniyor...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {mergedList.map((movie, index) => {
                  const isWatched = movie.inArchive && movie.archiveItem?.status === 'watched';
                  const isNext = movie.inArchive && nextToWatch?.id === movie.archiveItem?.id;
                  const absurdRating =
                    movie.inArchive && movie.archiveItem?.custom_rating
                      ? ABSURD_RATINGS[movie.archiveItem.custom_rating]
                      : null;

                  const posterThumb = movie.poster_path
                    ? `https://image.tmdb.org/t/p/w185${movie.poster_path}`
                    : null;

                  return (
                    <div
                      key={movie.partId}
                      onClick={() => {
                        if (movie.inArchive && movie.archiveItem) {
                          onClose();
                          onSelectMovie(movie.archiveItem);
                        }
                      }}
                      className={`group relative flex items-center gap-3 rounded-2xl border p-2.5 transition active:opacity-85 ${
                        movie.inArchive ? 'cursor-pointer' : 'cursor-default'
                      } ${
                        isNext
                          ? 'border-amber-500/60 bg-amber-500/10 shadow-md shadow-amber-500/10 hover:border-amber-400'
                          : isWatched
                          ? 'border-zinc-800/70 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700'
                          : movie.inArchive
                          ? 'border-zinc-850 bg-zinc-950/60 hover:bg-zinc-900/50 hover:border-zinc-800'
                          : 'border-dashed border-zinc-800/70 bg-zinc-950/30 opacity-75 hover:opacity-100 hover:border-zinc-700'
                      }`}
                    >
                      {/* Sıra Numarası (#1, #2...) */}
                      <div className="w-5 flex-shrink-0 text-center font-mono text-xs font-bold text-zinc-500 group-hover:text-amber-400 transition-colors">
                        #{index + 1}
                      </div>

                      {/* Film Afiş Küçük Resmi */}
                      <div className="relative h-16 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800">
                        {posterThumb ? (
                          <Image
                            src={posterThumb}
                            alt={movie.title}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-600">
                            <Film size={16} strokeWidth={1.5} />
                          </div>
                        )}
                      </div>

                      {/* Film Bilgileri */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-amber-400 font-semibold">
                            {movie.release_year}
                          </span>
                          {movie.duration && (
                            <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                              <Clock size={9} strokeWidth={1.5} />
                              {movie.duration}
                            </span>
                          )}
                          {movie.imdb_rating > 0 && (
                            <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                              <Star size={9} strokeWidth={1.5} className="fill-amber-400" />
                              {movie.imdb_rating.toFixed(1)}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-semibold text-zinc-100 truncate group-hover:text-amber-300 transition-colors">
                          {movie.title}
                        </h4>

                        {/* Arşivdeki filmin kişisel notu */}
                        {movie.archiveItem?.personal_note && (
                          <p className="text-[11px] text-zinc-400 italic truncate">
                            &quot;{movie.archiveItem.personal_note}&quot;
                          </p>
                        )}
                      </div>

                      {/* Sağ Taraf: Durum / Puan Rozeti / Sıradaki Rozeti / Ekle Butonu */}
                      <div className="flex-shrink-0 flex items-center gap-1.5">
                        {isNext && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-zinc-950 shadow-sm shadow-amber-500/30 animate-pulse">
                            <Play size={10} strokeWidth={2.5} className="fill-current" />
                            <span>Sıradaki</span>
                          </span>
                        )}

                        {movie.inArchive ? (
                          isWatched ? (
                            absurdRating ? (
                              <div
                                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold border ${absurdRating.badgeColor}`}
                                title={absurdRating.title}
                              >
                                <RatingIcon level={movie.archiveItem!.custom_rating!} size={12} strokeWidth={2} />
                                <span className="hidden sm:inline">{absurdRating.title}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 text-[11px] font-semibold">
                                <CheckCircle2 size={12} strokeWidth={2} />
                                <span className="hidden sm:inline">İzlendi</span>
                              </div>
                            )
                          ) : !isNext ? (
                            <div className="flex items-center gap-1 rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-1 text-[11px] font-medium">
                              <Hourglass size={11} strokeWidth={1.5} />
                              <span className="hidden sm:inline">İzlenecek</span>
                            </div>
                          ) : null
                        ) : (
                          /* Arşivde Olmayan Film: Tekil Ekle Butonu */
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleAddSingleMissing(movie);
                            }}
                            disabled={addingSingleId === movie.partId}
                            className="flex items-center gap-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 px-2.5 py-1 text-xs font-semibold transition active:opacity-85 disabled:opacity-50"
                          >
                            {addingSingleId === movie.partId ? (
                              <Loader2 size={12} className="animate-spin text-amber-300" />
                            ) : (
                              <Plus size={12} strokeWidth={2.5} />
                            )}
                            <span>Arşive Ekle</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
