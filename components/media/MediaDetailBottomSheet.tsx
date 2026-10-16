'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import {
  X,
  Star,
  Film,
  Tv,
  Calendar,
  Trash2,
  Sparkles,
  Clock,
  Layers,
  ExternalLink,
  Search,
  Loader2,
  PlayCircle,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MediaItem, MediaStatus, CustomRating, WatchProvider } from '@/lib/types';
import { ABSURD_RATINGS, STATUS_CONFIG } from '@/lib/constants';
import { useAuth } from '@/lib/authContext';
import { StatusIcon, RatingIcon, SeriesIcon } from '@/components/media/MediaIcons';
import { getFranchiseForMovie, registerDynamicCollection } from '@/lib/collections';



interface SeriesPartItem {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string | null;
  release_year: string;
  vote_average: number;
  overview: string;
}

interface SeriesData {
  id: number;
  name: string;
  overview?: string | null;
  parts: SeriesPartItem[];
}

// TMDB In-Memory Caches — prevents duplicate network requests and eliminates layout shifts
interface DetailsCacheEntry {
  watch_providers: {
    flatrate: WatchProvider[];
    buy: WatchProvider[];
    rent: WatchProvider[];
    link: string | null;
  } | null;
  belongs_to_collection?: { id: number; name: string } | null;
  runtime?: number;
  number_of_seasons?: number;
}

const detailsCache = new Map<string, DetailsCacheEntry>();
const seriesCache = new Map<string, SeriesData>();

interface MediaDetailBottomSheetProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<MediaItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  archiveItems: MediaItem[];
  onAddMultiple: (items: Array<Omit<MediaItem, 'id' | 'created_at'>>, seriesName: string) => Promise<void>;
}

export const MediaDetailBottomSheet: React.FC<MediaDetailBottomSheetProps> = ({
  item: propItem,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  archiveItems,
  onAddMultiple,
}) => {
  const { isAuthenticated, openGate } = useAuth();
  const [activeItem, setActiveItem] = useState<MediaItem | null>(propItem);
  const [selectedStatus, setSelectedStatus] = useState<MediaStatus>(propItem?.status ?? 'watchlist');
  const [selectedRating, setSelectedRating] = useState<CustomRating | null>(propItem?.custom_rating ?? null);
  const [personalNote, setPersonalNote] = useState<string>(propItem?.personal_note ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [backdropError, setBackdropError] = useState(false);

  const item = propItem || activeItem;

  const onUpdateRef = useRef(onUpdate);
  const itemRef = useRef(item);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
    itemRef.current = item;
  });

  const loadedDetailsKeyRef = useRef<string | null>(null);
  const lastActiveItemId = useRef<string | null>(null);

  useEffect(() => {
    if (propItem) {
      const isNewItem = lastActiveItemId.current !== propItem.id;
      lastActiveItemId.current = propItem.id;

      setActiveItem(propItem);
      setSelectedStatus(propItem.status);
      setSelectedRating(propItem.custom_rating);

      if (isNewItem) {
        setPersonalNote(propItem.personal_note ?? '');
        setShowDeleteConfirm(false);
        setImgError(false);
        setBackdropError(false);
      }
    }
  }, [propItem]);

  // Watch Providers (Nerede İzlenir?) ve TMDB detayları
  const [watchProviders, setWatchProviders] = useState<{
    flatrate: WatchProvider[];
    buy: WatchProvider[];
    rent: WatchProvider[];
    link: string | null;
  } | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(true);

  // Seri / Franchise Bilgileri ve Toplu Ekleme
  const [seriesInfo, setSeriesInfo] = useState<SeriesData | null>(null);
  const [isAddingSeries, setIsAddingSeries] = useState<boolean>(false);

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
  }, [isOpen, item?.id, x]);

  // TMDB Detayları, Nerede İzlenir & Seri / Franchise Verisini Çekme (Tamponlanmış / Sıfır Zıplama)
  useEffect(() => {
    if (!isOpen || !item?.tmdb_id) {
      return;
    }

    const currentKey = `${item.media_type}-${item.tmdb_id}`;

    // Bu yapımın detayları halihazırda yüklendiyse kesinlikle yeniden yükleme veya zıplama yapma
    if (loadedDetailsKeyRef.current === currentKey) {
      return;
    }

    loadedDetailsKeyRef.current = currentKey;
    let isMounted = true;

    // 1. Önce hafızadaki önbelleğe (cache) bak
    if (detailsCache.has(currentKey)) {
      const cached = detailsCache.get(currentKey)!;
      setWatchProviders(cached.watch_providers);
      setIsLoadingDetails(false);

      // Franchise/Seri bilgisi cache'te varsa anında yerleştir
      const franchise = item.media_type === 'movie' ? getFranchiseForMovie(item) : null;
      if (franchise) {
        const fKey = `franchise-${franchise.id}`;
        if (seriesCache.has(fKey)) {
          setSeriesInfo(seriesCache.get(fKey)!);
        }
      } else if (cached.belongs_to_collection?.id) {
        const colKey = `collection-${cached.belongs_to_collection.id}`;
        if (seriesCache.has(colKey)) {
          setSeriesInfo(seriesCache.get(colKey)!);
        }
      }
      return;
    }

    // 2. Cache'te yoksa API'den çek
    setIsLoadingDetails(true);

    // Bilinen bir franchise ise seriyi de paralel çek
    const franchise = item.media_type === 'movie' ? getFranchiseForMovie(item) : null;
    if (franchise) {
      const fKey = `franchise-${franchise.id}`;
      if (seriesCache.has(fKey)) {
        setSeriesInfo(seriesCache.get(fKey)!);
      } else {
        fetch(`/api/tmdb/collection?franchiseId=${franchise.id}`)
          .then(res => (res.ok ? res.json() : null))
          .then(data => {
            if (!isMounted || !data) return;
            seriesCache.set(fKey, data);
            setSeriesInfo(data);
          })
          .catch(err => console.warn('Failed to fetch franchise info:', err));
      }
    }

    fetch(`/api/tmdb/details?id=${item.tmdb_id}&type=${item.media_type}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!isMounted || !data) return;

        detailsCache.set(currentKey, {
          watch_providers: data.watch_providers || null,
          belongs_to_collection: data.belongs_to_collection || null,
          runtime: data.runtime,
          number_of_seasons: data.number_of_seasons,
        });

        setWatchProviders(data.watch_providers || null);

        // TMDB Koleksiyonu kontrolü (eğer franchise yoksa veya serisi yüklenmediyse)
        if (data.belongs_to_collection?.id) {
          const colId = data.belongs_to_collection.id;
          const colKey = `collection-${colId}`;
          const colName = data.belongs_to_collection.name;

          if (seriesCache.has(colKey)) {
            const sData = seriesCache.get(colKey)!;
            setSeriesInfo(sData);
            registerDynamicCollection({
              id: colKey,
              tmdb_collection_id: colId,
              name: sData.name || colName,
              poster_path: sData.parts?.[0]?.poster_path || null,
              backdrop_path: sData.parts?.[0]?.backdrop_path || null,
              overview: sData.overview || undefined,
              movie_tmdb_ids: (sData.parts || []).map((p: SeriesPartItem) => p.id),
            });
          } else {
            fetch(`/api/tmdb/collection?id=${colId}`)
              .then(res => (res.ok ? res.json() : null))
              .then(sData => {
                if (!isMounted || !sData) return;
                seriesCache.set(colKey, sData);
                setSeriesInfo(sData);
                registerDynamicCollection({
                  id: colKey,
                  tmdb_collection_id: colId,
                  name: sData.name || colName,
                  poster_path: sData.parts?.[0]?.poster_path || null,
                  backdrop_path: sData.parts?.[0]?.backdrop_path || null,
                  overview: sData.overview || undefined,
                  movie_tmdb_ids: (sData.parts || []).map((p: SeriesPartItem) => p.id),
                });
              })
              .catch(err => console.warn('Failed to fetch collection info:', err));
          }
        }

        // Sezon / Süre otomatik arka plan düzeltmeleri
        const currentItem = itemRef.current;
        if (
          currentItem &&
          currentItem.media_type === 'tv' &&
          data.number_of_seasons &&
          data.number_of_seasons !== currentItem.total_seasons
        ) {
          onUpdateRef.current(currentItem.id, { total_seasons: data.number_of_seasons });
        }
        if (
          currentItem &&
          currentItem.media_type === 'movie' &&
          data.runtime &&
          !currentItem.duration
        ) {
          onUpdateRef.current(currentItem.id, { duration: `${data.runtime} dk` });
        }
      })
      .catch(err => console.warn('Failed to fetch media details in sheet:', err))
      .finally(() => {
        if (isMounted) setIsLoadingDetails(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, item]);

  // Arşivdeki mevcut filmler ile serideki eksikleri hesapla
  const archiveTmdbIds = useMemo(
    () => new Set((archiveItems || []).map(i => i.tmdb_id)),
    [archiveItems]
  );

  const { inArchiveParts, missingParts } = useMemo(() => {
    if (!seriesInfo?.parts) return { inArchiveParts: [], missingParts: [] };
    const inArchive = seriesInfo.parts.filter(p => archiveTmdbIds.has(p.id));
    const missing = seriesInfo.parts.filter(p => !archiveTmdbIds.has(p.id));
    return { inArchiveParts: inArchive, missingParts: missing };
  }, [seriesInfo, archiveTmdbIds]);

  const handleBatchAddSeries = async () => {
    if (!isAuthenticated) {
      openGate();
      return;
    }
    if (missingParts.length === 0) return;
    setIsAddingSeries(true);
    try {
      const colId = seriesInfo?.id;
      const colName = seriesInfo?.name || 'Seri';

      const itemsToAdd = missingParts.map(p => ({
        tmdb_id: p.id,
        title: p.title,
        media_type: 'movie' as const,
        poster_path: p.poster_path,
        backdrop_path: p.backdrop_path,
        release_year: p.release_year || '',
        imdb_rating: p.vote_average || 0,
        status: 'watchlist' as const,
        custom_rating: null,
        personal_note: null,
        overview: p.overview || null,
        genres: item?.genres || null,
        duration: null,
        total_seasons: null,
        tmdb_collection_id: colId || null,
        collection_name: colName,
      }));

      // Mevcut filmi de seri ile eşle
      if (item && colId && !item.tmdb_collection_id) {
        await onUpdate(item.id, {
          tmdb_collection_id: colId,
          collection_name: colName,
        });
      }

      // Dinamik koleksiyon kaydı oluştur
      if (seriesInfo) {
        registerDynamicCollection({
          id: `collection-${seriesInfo.id}`,
          tmdb_collection_id: seriesInfo.id,
          name: colName,
          poster_path: seriesInfo.parts[0]?.poster_path || item?.poster_path || null,
          backdrop_path: seriesInfo.parts[0]?.backdrop_path || item?.backdrop_path || null,
          overview: seriesInfo.overview || undefined,
          movie_tmdb_ids: seriesInfo.parts.map(p => p.id),
        });
      }

      await onAddMultiple(itemsToAdd, colName);
    } catch (err) {
      console.error('Failed to add series items:', err);
    } finally {
      setIsAddingSeries(false);
    }
  };

  // Arka plan kaymasını engelle (Body scroll lock) ve Escape ile kapatma
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

  // TMDB Image URL resolver
  const formatImageUrl = (path: string | null | undefined, size = 'w500') => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `https://image.tmdb.org/t/p/${size}${cleanPath}`;
  };

  const backdropUrl = !backdropError && item ? formatImageUrl(item.backdrop_path, 'w780') : null;
  const posterUrl = !imgError && item ? formatImageUrl(item.poster_path, 'w500') : null;

  // Filmlerde "Yeni Sezon Bekleniyor" durumuna gerek yok
  const availableStatuses: MediaStatus[] =
    item?.media_type === 'movie'
      ? ['watchlist', 'watched']
      : ['watchlist', 'watched', 'waiting_season'];

  const handleStatusChange = async (newStatus: MediaStatus) => {
    if (!isAuthenticated) {
      openGate();
      return;
    }
    if (!item) return;
    setSelectedStatus(newStatus);
    await onUpdate(item.id, { status: newStatus });
  };

  const handleRatingSelect = async (level: CustomRating) => {
    if (!isAuthenticated) {
      openGate();
      return;
    }
    if (!item) return;
    const nextRating = selectedRating === level ? null : level;
    setSelectedRating(nextRating);

    let nextStatus = selectedStatus;
    if (nextRating !== null && selectedStatus === 'watchlist') {
      nextStatus = 'watched';
      setSelectedStatus('watched');
    }

    if (nextRating === 5) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch {
        // confetti fallback
      }
    }

    await onUpdate(item.id, { custom_rating: nextRating, status: nextStatus });
  };

  const handleSaveNote = async () => {
    if (!isAuthenticated) {
      openGate();
      return;
    }
    if (!item) return;
    setIsSaving(true);
    await onUpdate(item.id, { personal_note: personalNote.trim() || null });
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!isAuthenticated) {
      openGate();
      return;
    }
    if (!item) return;
    setIsDeleting(true);
    await onDelete(item.id);
    setIsDeleting(false);
    onClose();
  };

  // Türkçe karakter uyumlu karakter sayısı hesabı
  const remainingChars = Math.max(0, 200 - Array.from(personalNote).length);

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }
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

    // İlk belirgin harekette kullanıcının niyeti tespit edilir (sağa çekme mi, dikey kaydırma mı)
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
      // Sadece sağa kaydırmaya izin ver
      const clampedX = Math.max(0, deltaX);
      x.set(clampedX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    if (isSwipingRight.current === true) {
      const finalDeltaX = e.changedTouches[0].clientX - touchStartX.current;
      const elapsed = Math.max(1, Date.now() - touchStartTime.current);
      const velocity = finalDeltaX / elapsed; // px/ms
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 375;
      const distanceThreshold = Math.min(100, screenWidth * 0.25);

      // Eşik mesafe (100px) veya hızlı baş parmak hareketi (flick)
      if (finalDeltaX > distanceThreshold || (finalDeltaX > 40 && velocity > 0.4)) {
        animate(x, screenWidth, {
          duration: 0.22,
          ease: [0.32, 0.72, 0, 1],
        }).then(() => {
          onClose();
          setTimeout(() => x.set(0), 100);
        });
      } else {
        // Yeterince çekilmediyse Apple easing ile yerine geri otursun
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

  return (
    <AnimatePresence>
      {isOpen && item && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center cursor-pointer select-none"
          onClick={onClose}
        >
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal / Bottom Sheet Window */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ x }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={e => e.stopPropagation()}
            className="relative max-h-[92vh] md:max-h-[88vh] w-full max-w-lg md:max-w-xl overflow-y-auto overscroll-contain rounded-t-3xl md:rounded-3xl border border-zinc-800/80 bg-zinc-950 pb-28 md:pb-8 pt-3 text-zinc-100 shadow-2xl scrollbar-none z-10 md:my-auto cursor-default select-text touch-pan-y"
          >
          {/* Mobile Grab Handle (Tıklanabilir Kapatma) */}
          <div
            onClick={onClose}
            className="mx-auto h-1.5 w-12 rounded-full bg-zinc-800 mb-2 md:hidden cursor-pointer hover:bg-zinc-700 active:bg-zinc-600 transition"
            title="Kapat"
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900/80 text-zinc-400 backdrop-blur-md hover:text-white transition-colors border border-zinc-800"
            aria-label="Kapat"
          >
            <X size={18} strokeWidth={1.5} />
          </button>

          {/* Backdrop Header Banner */}
          <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950">
            {backdropUrl ? (
              <Image
                src={backdropUrl}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 576px"
                className="object-cover opacity-50"
                onError={() => setBackdropError(true)}
              />
            ) : posterUrl ? (
              <Image
                src={posterUrl}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 576px"
                className="object-cover blur-sm opacity-30"
              />
            ) : null}

            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

            {/* Poster thumbnail & Title overlay */}
            <div className="absolute bottom-3 left-4 right-14 flex items-end gap-3.5">
              <div className="relative aspect-[2/3] w-20 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-700/80 shadow-xl bg-zinc-900">
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={item.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600">
                    {item.media_type === 'movie' ? (
                      <Film size={22} strokeWidth={1.5} />
                    ) : (
                      <Tv size={22} strokeWidth={1.5} />
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  <span className="flex items-center gap-1 rounded bg-zinc-900/90 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-300 border border-zinc-700/60 backdrop-blur-md">
                    {item.media_type === 'movie' ? (
                      <>
                        <Film size={11} strokeWidth={1.5} /> Film
                      </>
                    ) : (
                      <>
                        <Tv size={11} strokeWidth={1.5} /> Dizi
                      </>
                    )}
                  </span>
                  {item.release_year && (
                    <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                      <Calendar size={11} strokeWidth={1.5} />
                      {item.release_year}
                    </span>
                  )}
                  {item.duration && (
                    <span className="flex items-center gap-1 text-[11px] text-zinc-300">
                      <Clock size={11} strokeWidth={1.5} />
                      {item.duration}
                    </span>
                  )}
                  {item.total_seasons && (
                    <span className="flex items-center gap-1 text-[11px] text-zinc-300">
                      <Layers size={11} strokeWidth={1.5} />
                      {item.total_seasons} Sezon
                    </span>
                  )}
                  {item.imdb_rating > 0 && (
                    <span className="flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/30">
                      <Star size={11} strokeWidth={1.5} className="fill-amber-400" />
                      {item.imdb_rating.toFixed(1)}
                    </span>
                  )}
                </div>

                <h2 className="text-base sm:text-lg font-bold text-zinc-100 line-clamp-2 leading-tight">
                  {item.title}
                </h2>
                {item.genres && (
                  <p className="mt-1 text-[11px] font-medium text-amber-400/80 line-clamp-1">
                    {item.genres}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="px-5 pt-4 space-y-6">
            {/* Overview / Synopsis */}
            {item.overview && (
              <p className="text-xs leading-relaxed text-zinc-400 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/80">
                {item.overview}
              </p>
            )}

            {/* Seri / Franchise Bilgi ve Toplu Ekleme Kartı */}
            {seriesInfo && seriesInfo.parts.length > 1 && (
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-zinc-900/60 to-zinc-900/40 p-4 space-y-3 shadow-md shadow-amber-500/5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      <SeriesIcon size={14} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-zinc-100 truncate">
                        {seriesInfo.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        {inArchiveParts.length} / {seriesInfo.parts.length} Film Arşivinde
                      </p>
                    </div>
                  </div>

                  {missingParts.length === 0 ? (
                    <span className="flex-shrink-0 flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 size={12} strokeWidth={2.5} />
                      <span>Tüm Seri Arşivinde</span>
                    </span>
                  ) : null}
                </div>

                {/* İlerleme Çubuğu */}
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden border border-zinc-700/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        missingParts.length === 0
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-amber-500 to-amber-300'
                      }`}
                      style={{
                        width: `${Math.max(
                          6,
                          Math.round((inArchiveParts.length / seriesInfo.parts.length) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Aksiyon Butonu */}
                {missingParts.length > 0 && (
                  <button
                    onClick={handleBatchAddSeries}
                    disabled={isAddingSeries}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:opacity-85 text-zinc-950 py-2.5 px-3 text-xs font-bold transition shadow-md shadow-amber-500/20 disabled:opacity-50"
                  >
                    {isAddingSeries ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-zinc-950" />
                        <span>Seri Ekleniyor...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} strokeWidth={2.5} />
                        <span>Tüm Seriyi Listeme Ekle (Eksik {missingParts.length} Film)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Nerede İzlenir? (Platformlar & Google Arama) */}
            <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <PlayCircle size={14} strokeWidth={1.75} className="text-amber-400" />
                  Nerede İzlenir?
                </h4>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`${item.title} izle nerede izlenir`)}`}
                  target="_blank"
                  rel="noopener noreferrer external"
                  onClick={(e) => {
                    const url = `https://www.google.com/search?q=${encodeURIComponent(`${item.title} izle nerede izlenir`)}`;
                    if (typeof window !== 'undefined' && (window.navigator as unknown as { standalone?: boolean }).standalone) {
                      e.preventDefault();
                      window.open(url, '_blank');
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-750 bg-zinc-800/80 hover:bg-zinc-800 hover:border-amber-500/50 hover:text-amber-300 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 transition-colors shadow-sm active:opacity-85"
                  title={`${item.title} için Google'da ara`}
                >
                  <Search size={11} strokeWidth={2} className="text-amber-400" />
                  <span>Google</span>
                  <ExternalLink size={10} strokeWidth={1.5} className="text-zinc-500" />
                </a>
              </div>

              {/* Platform Listesi — Tamamen inaktif, sadece nerede olduğunu gösterir */}
              <div className="min-h-[38px] flex items-center">
                {isLoadingDetails && !watchProviders ? (
                  <div className="flex items-center gap-2 w-full py-1">
                    <div className="h-8 w-28 rounded-xl bg-zinc-850/80 animate-pulse border border-zinc-800/50" />
                    <div className="h-8 w-32 rounded-xl bg-zinc-850/60 animate-pulse border border-zinc-800/40" />
                  </div>
                ) : (
                  <div className="w-full">
                    {(() => {
                      const official = [
                        ...(watchProviders?.flatrate || []),
                        ...(watchProviders?.flatrate?.length ? [] : (watchProviders?.rent || []).slice(0, 2)),
                      ];
                      const unique = Array.from(
                        new Map(official.map(p => [p.provider_id, p])).values()
                      );

                      if (unique.length === 0) {
                        return (
                          <div className="flex items-center gap-2 text-xs text-zinc-400 py-1">
                            <Tv size={14} className="text-zinc-500 flex-shrink-0" />
                            <span>Türkiye&apos;de şu an dijital platformlarda bulunmuyor.</span>
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-wrap items-center gap-2">
                          {unique.map(p => (
                            <div
                              key={p.provider_id}
                              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/70 px-2.5 py-1.5 shadow-sm select-none cursor-default"
                            >
                              {p.logo_path ? (
                                <Image
                                  src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                                  alt={p.provider_name}
                                  width={20}
                                  height={20}
                                  className="rounded-md object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-850 text-zinc-400">
                                  <Tv size={12} strokeWidth={1.5} />
                                </div>
                              )}
                              <span className="text-xs font-medium text-zinc-200">
                                {p.provider_name}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Durum Yönetimi (Filmlerde sezon seçeneği gizlenir) */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Durum
              </h4>
              <div
                className={`grid gap-2 ${
                  availableStatuses.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'
                }`}
              >
                {availableStatuses.map(statusKey => {
                  const conf = STATUS_CONFIG[statusKey];
                  const isSelected = selectedStatus === statusKey;
                  return (
                    <button
                      key={statusKey}
                      type="button"
                      onClick={() => handleStatusChange(statusKey)}
                      className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-medium border transition-colors duration-150 text-center ${
                        isSelected
                          ? `${conf.badgeStyle} ${conf.borderStyle} ring-1 ring-amber-500/30`
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <StatusIcon
                        status={statusKey}
                        size={15}
                        strokeWidth={1.75}
                        className={isSelected ? 'text-current' : 'text-zinc-400'}
                      />
                      <span className="truncate">{conf.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Puanlama Sistemi (Sade Başlık ve Sabit Satır Yüksekliği) */}
            <div>
              <div className="flex items-center justify-between mb-2 min-h-[22px]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Sparkles size={13} strokeWidth={1.5} className="text-amber-400" />
                  Puanım
                </h4>
                {selectedRating ? (
                  <span className="text-xs font-bold text-amber-400">
                    {ABSURD_RATINGS[selectedRating].title}
                  </span>
                ) : (
                  <span className="text-xs text-zinc-600 font-normal">
                    Puanlanmadı
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                {([1, 2, 3, 4, 5] as CustomRating[]).map(level => {
                  const r = ABSURD_RATINGS[level];
                  const isSelected = selectedRating === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleRatingSelect(level)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium border transition-colors duration-150 ${
                        isSelected
                          ? `${r.bgColor} ${r.badgeColor} ${r.borderColor} ring-1 ring-amber-500/40`
                          : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-lg border ${
                            isSelected
                              ? 'border-current bg-white/10'
                              : 'border-zinc-850 bg-zinc-900 text-zinc-400'
                          }`}
                        >
                          <RatingIcon level={level} size={13} strokeWidth={1.75} />
                        </div>
                        <span className="font-medium">{r.title}</span>
                      </div>
                      <span className="text-[10px] opacity-60">Seviye {level}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kişisel Not (Canlı Karakter Sayaçlı) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Kişisel Not
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {remainingChars} karakter kaldı
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    disabled={isSaving}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </div>
              <div className="relative">
                <textarea
                  value={personalNote}
                  onChange={e => {
                    const val = e.target.value;
                    if (Array.from(val).length <= 200) {
                      setPersonalNote(val);
                    }
                  }}
                  onBlur={handleSaveNote}
                  placeholder="Düşüncelerinizi buraya yazın..."
                  rows={2}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 resize-none"
                />
              </div>
            </div>

            {/* Listeden Kaldır (Film/Dizi Silme) */}
            <div className="pt-2 border-t border-zinc-900">
              {showDeleteConfirm ? (
                <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-3 text-center">
                  <p className="text-xs text-red-300 mb-2">
                    Bu yapımı arşivden kaldırmak istediğinize emin misiniz?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 py-2 text-xs font-medium text-zinc-300"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
                    >
                      {isDeleting ? 'Siliniyor...' : 'Evet, Kaldır'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 py-2.5 text-xs font-medium text-zinc-400 hover:border-red-900/40 hover:bg-red-950/20 hover:text-red-400 transition-all"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                  <span>Arşivden Kaldır</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
