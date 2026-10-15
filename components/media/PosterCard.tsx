'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Film, Tv, Clock, Layers } from 'lucide-react';
import { MediaItem } from '@/lib/types';
import { ABSURD_RATINGS, STATUS_CONFIG } from '@/lib/constants';
import { StatusIcon, RatingIcon } from '@/components/media/MediaIcons';

interface PosterCardProps {
  item: MediaItem;
  onClick: (item: MediaItem) => void;
}

export const PosterCard: React.FC<PosterCardProps> = ({ item, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.watchlist;
  const absurdRating = item.custom_rating ? ABSURD_RATINGS[item.custom_rating] : null;

  // TMDB poster image URL builder
  const getPosterUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `https://image.tmdb.org/t/p/w500${cleanPath}`;
  };

  const posterUrl = !imgError ? getPosterUrl(item.poster_path) : null;

  // Süre veya Sezon bilgisi
  const durationOrSeasons =
    item.media_type === 'movie'
      ? item.duration || null
      : item.total_seasons
      ? `${item.total_seasons} Sezon`
      : 'Dizi';

  return (
    <div
      onClick={() => onClick(item)}
      className="group relative cursor-pointer flex flex-col select-none transition-opacity duration-150 active:opacity-90"
    >
      {/* 2/3 Aspect Ratio Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-md transition-all duration-300 group-hover:border-zinc-700 group-hover:shadow-xl group-hover:shadow-amber-500/5">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-zinc-900 to-zinc-950 text-zinc-500">
            {item.media_type === 'movie' ? (
              <Film size={28} strokeWidth={1.5} className="mb-2 opacity-40 text-amber-400" />
            ) : (
              <Tv size={28} strokeWidth={1.5} className="mb-2 opacity-40 text-amber-400" />
            )}
            <span className="text-xs font-medium text-zinc-400 line-clamp-2 px-1">
              {item.title}
            </span>
          </div>
        )}

        {/* Gradient shadow overlays for overlay readability */}
        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/85 via-black/35 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        {/* Sol Üst: Sarı IMDb Puanı (★ 7.8) */}
        {item.imdb_rating > 0 && (
          <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-lg bg-black/80 px-1.5 py-0.5 text-[11px] font-bold text-amber-400 backdrop-blur-md border border-amber-500/30 shadow-sm">
            <Star size={10} strokeWidth={1.5} className="fill-amber-400 text-amber-400" />
            <span>{item.imdb_rating.toFixed(1)}</span>
          </div>
        )}

        {/* Sağ Üst: Film ise Süre (118 dk), Dizi ise Sezon Sayısı (3 Sezon) */}
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
          {durationOrSeasons ? (
            <div className="flex items-center gap-1 rounded-lg bg-black/80 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-200 backdrop-blur-md border border-zinc-700/60 shadow-sm">
              {item.media_type === 'movie' ? (
                <Clock size={10} strokeWidth={1.5} className="text-zinc-400" />
              ) : (
                <Layers size={10} strokeWidth={1.5} className="text-zinc-400" />
              )}
              <span>{durationOrSeasons}</span>
            </div>
          ) : (
            <div className="rounded-lg bg-black/80 p-1 text-zinc-300 backdrop-blur-md border border-zinc-700/60">
              {item.media_type === 'movie' ? (
                <Film size={12} strokeWidth={1.5} />
              ) : (
                <Tv size={12} strokeWidth={1.5} />
              )}
            </div>
          )}
        </div>

        {/* Sol Alt: Durum Rozeti (Yazısız, Sadece Minimal İkon) */}
        <div className="absolute bottom-2 left-2 z-10">
          <div
            className={`flex items-center justify-center h-6 w-6 rounded-lg backdrop-blur-md border shadow-md ${statusInfo.badgeStyle}`}
            title={statusInfo.label}
          >
            <StatusIcon status={item.status} size={12} strokeWidth={1.75} />
          </div>
        </div>

        {/* Sağ Alt: Puan Verildiyse (İzlendi veya Yeni Sezon Bekleniyor) Puan Rozeti */}
        {absurdRating && item.custom_rating && (item.status === 'watched' || item.status === 'waiting_season') && (
          <div
            className={`absolute bottom-2 right-2 z-10 flex items-center justify-center h-6 w-6 rounded-lg backdrop-blur-md border shadow-md ${absurdRating.badgeColor}`}
            title={absurdRating.title}
          >
            <RatingIcon level={item.custom_rating} size={13} strokeWidth={1.75} />
          </div>
        )}
      </div>

      {/* Alt Metin: Başlık ve Parantez İçinde Yıl */}
      <div className="mt-2 px-0.5">
        <h3 className="text-xs font-semibold text-zinc-200 line-clamp-1 group-hover:text-amber-400 transition-colors">
          {item.title}
          {item.release_year && (
            <span className="text-zinc-400 font-normal ml-1">
              ({item.release_year})
            </span>
          )}
        </h3>
        {item.personal_note && (
          <p className="mt-0.5 text-[11px] text-zinc-400 line-clamp-1 italic">
            &quot;{item.personal_note}&quot;
          </p>
        )}
      </div>
    </div>
  );
};
