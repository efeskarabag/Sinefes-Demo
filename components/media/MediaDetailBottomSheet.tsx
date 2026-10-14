'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MediaItem, MediaStatus, CustomRating, WatchProvider } from '@/lib/types';
import { ABSURD_RATINGS, STATUS_CONFIG } from '@/lib/constants';
import { useAuth } from '@/lib/authContext';
import { StatusIcon, RatingIcon } from '@/components/media/MediaIcons';

interface MediaDetailBottomSheetProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<MediaItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const MediaDetailBottomSheet: React.FC<MediaDetailBottomSheetProps> = ({
  item,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const { isAuthenticated, openGate } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<MediaStatus>(item?.status ?? 'watchlist');
  const [selectedRating, setSelectedRating] = useState<CustomRating | null>(item?.custom_rating ?? null);
  const [personalNote, setPersonalNote] = useState<string>(item?.personal_note ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [backdropError, setBackdropError] = useState(false);

  // Watch Providers (Nerede İzlenir?) ve TMDB detayları
  const [watchProviders, setWatchProviders] = useState<{
    flatrate: WatchProvider[];
    buy: WatchProvider[];
    rent: WatchProvider[];
    link: string | null;
  } | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(true);

  useEffect(() => {
    if (!item?.tmdb_id) return;
    let isMounted = true;
    setIsLoadingDetails(true);

    fetch(`/api/tmdb/details?id=${item.tmdb_id}&type=${item.media_type}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!isMounted || !data) return;
        setWatchProviders(data.watch_providers || null);

        // Dizi ise ve kayıtlı sezon sayısı hatalı/eksikse otomatik düzelt
        if (
          item.media_type === 'tv' &&
          data.number_of_seasons &&
          data.number_of_seasons !== item.total_seasons
        ) {
          onUpdate(item.id, { total_seasons: data.number_of_seasons });
        }

        // Film ise ve süre eksikse otomatik düzelt
        if (
          item.media_type === 'movie' &&
          data.runtime &&
          !item.duration
        ) {
          onUpdate(item.id, { duration: `${data.runtime} dk` });
        }
      })
      .catch(err => console.warn('Failed to fetch media details in sheet:', err))
      .finally(() => {
        if (isMounted) setIsLoadingDetails(false);
      });

    return () => {
      isMounted = false;
    };
  }, [item?.id, item?.tmdb_id, item?.media_type, item?.total_seasons, item?.duration, onUpdate]);

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

  if (!isOpen || !item) return null;

  // TMDB Image URL resolver
  const formatImageUrl = (path: string | null | undefined, size = 'w500') => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `https://image.tmdb.org/t/p/${size}${cleanPath}`;
  };

  const backdropUrl = !backdropError ? formatImageUrl(item.backdrop_path, 'w780') : null;
  const posterUrl = !imgError ? formatImageUrl(item.poster_path, 'w500') : null;

  // Filmlerde "Yeni Sezon Bekleniyor" durumuna gerek yok
  const availableStatuses: MediaStatus[] =
    item.media_type === 'movie'
      ? ['watchlist', 'watched']
      : ['watchlist', 'watched', 'waiting_season'];

  const handleStatusChange = async (newStatus: MediaStatus) => {
    if (!isAuthenticated) {
      openGate();
      return;
    }
    setSelectedStatus(newStatus);
    await onUpdate(item.id, { status: newStatus });
  };

  const handleRatingSelect = async (level: CustomRating) => {
    if (!isAuthenticated) {
      openGate();
      return;
    }
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
    setIsSaving(true);
    await onUpdate(item.id, { personal_note: personalNote.trim() || null });
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!isAuthenticated) {
      openGate();
      return;
    }
    setIsDeleting(true);
    await onDelete(item.id);
    setIsDeleting(false);
    onClose();
  };

  const remainingChars = Math.max(0, 200 - Array.from(personalNote).length);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center cursor-pointer select-none"
        onClick={onClose}
      >
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal / Bottom Sheet Window */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="relative max-h-[92vh] md:max-h-[88vh] w-full max-w-lg md:max-w-xl overflow-y-auto overscroll-contain rounded-t-3xl md:rounded-3xl border border-zinc-800/80 bg-zinc-950 pb-28 md:pb-8 pt-3 text-zinc-100 shadow-2xl scrollbar-none z-10 md:my-auto cursor-default select-text"
        >
          {/* Mobile Grab Handle */}
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
                className="object-cover opacity-50"
                onError={() => setBackdropError(true)}
              />
            ) : posterUrl ? (
              <Image
                src={posterUrl}
                alt={item.title}
                fill
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

            {/* Nerede İzlenir? (Platformlar) */}
            <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <PlayCircle size={14} strokeWidth={1.75} className="text-amber-400" />
                  Nerede İzlenir?
                </h4>
                <div className="flex items-center gap-2.5">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(item.title + ' izle nerede izlenir')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition"
                  >
                    <Search size={10} strokeWidth={1.5} />
                    <span>Google</span>
                  </a>
                  {watchProviders?.link && (
                    <a
                      href={watchProviders.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5 transition"
                    >
                      <span>TMDB</span>
                      <ExternalLink size={9} strokeWidth={1.5} />
                    </a>
                  )}
                </div>
              </div>

              {/* Platform Listesi */}
              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-3 text-zinc-500 gap-2 text-xs">
                  <Loader2 size={14} className="animate-spin text-amber-400" />
                  <span>Platformlar kontrol ediliyor...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {(() => {
                    const official = [
                      ...(watchProviders?.flatrate || []),
                      ...(watchProviders?.flatrate?.length ? [] : (watchProviders?.rent || []).slice(0, 2)),
                    ];
                    const unique = Array.from(
                      new Map(official.map(p => [p.provider_id, p])).values()
                    );

                    const getPlatformSearchUrl = (name: string) => {
                      return `https://www.google.com/search?q=${encodeURIComponent(`${name} ${item.title}`)}`;
                    };

                    return (
                      <div className="flex flex-wrap items-center gap-2">
                        {unique.map(p => (
                          <a
                            key={p.provider_id}
                            href={getPlatformSearchUrl(p.provider_name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/70 hover:bg-zinc-900/90 hover:border-zinc-700 px-2.5 py-1.5 shadow-sm transition active:scale-95 group"
                            title={`${p.provider_name}'de ara / izle`}
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
                            <ExternalLink size={10} strokeWidth={1.5} className="text-zinc-500 group-hover:text-zinc-300 ml-0.5" />
                          </a>
                        ))}

                        {/* HDFilmcehennemi Kartı */}
                        <a
                          href={getPlatformSearchUrl('hdfilmcehennemi')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/70 hover:bg-zinc-900/90 hover:border-zinc-700 px-2.5 py-1.5 shadow-sm transition active:scale-95 group"
                          title="HDFilmcehennemi'nde ara / izle"
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/15 text-amber-400 flex-shrink-0">
                            <Film size={12} strokeWidth={1.75} />
                          </div>
                          <span className="text-xs font-medium text-zinc-200">
                            HDFilmcehennemi
                          </span>
                          <ExternalLink size={10} strokeWidth={1.5} className="text-zinc-500 group-hover:text-zinc-300 ml-0.5" />
                        </a>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Durum Yönetimi */}
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
                      className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-medium border transition-all text-center ${
                        isSelected
                          ? `${conf.badgeStyle} ${conf.borderStyle} font-semibold ring-1 ring-amber-500/30`
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

            {/* Puanlama Sistemi */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Sparkles size={13} strokeWidth={1.5} className="text-amber-400" />
                  Puanım
                </h4>
                {selectedRating && (
                  <span className="text-xs font-bold text-amber-400">
                    {ABSURD_RATINGS[selectedRating].title}
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
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium border transition-all ${
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

            {/* Kişisel Not */}
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
    </AnimatePresence>
  );
};
