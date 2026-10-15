'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Crown, Star } from 'lucide-react';
import { CollectionGroup } from '@/lib/types';
import { SeriesIcon } from '@/components/media/MediaIcons';

interface CollectionStackCardProps {
  collection: CollectionGroup;
  onClick: (collection: CollectionGroup) => void;
}

export const CollectionStackCard: React.FC<CollectionStackCardProps> = ({
  collection,
  onClick,
}) => {
  const [imgErrorCount, setImgErrorCount] = useState(0);

  useEffect(() => {
    setImgErrorCount(0);
  }, [collection.id, collection.poster_path]);

  // TMDB poster image URL builder
  const getPosterUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `https://image.tmdb.org/t/p/w500${cleanPath}`;
  };

  // 1. Tercih: Koleksiyon resmi afişi, 2. Tercih: Serideki ilk filmin afişi
  const candidatePosterPath =
    imgErrorCount === 0 && collection.poster_path
      ? collection.poster_path
      : imgErrorCount <= 1 && collection.items[0]?.poster_path
      ? collection.items[0].poster_path
      : null;

  const posterUrl = getPosterUrl(candidatePosterPath);
  const isCompleted = collection.completion_percentage === 100;

  // Yıl aralığı (örn: 2000 - 2024)
  const years = collection.items
    .map(i => parseInt(i.release_year))
    .filter(y => !isNaN(y) && y > 0)
    .sort((a, b) => a - b);

  const yearSpan =
    years.length > 1
      ? `${years[0]} - ${years[years.length - 1]}`
      : years.length === 1
      ? `${years[0]}`
      : collection.latest_release_year;

  return (
    <div
      onClick={() => onClick(collection)}
      className="group relative cursor-pointer flex flex-col select-none transition-opacity duration-150 active:opacity-90"
    >
      {/* 3D Deste / Yığın Katmanları (Stack Effect) */}
      <div className="relative aspect-[2/3] w-full">
        {/* Katman 3: En alttaki eğik kart gölgesi */}
        <div className="absolute inset-0 translate-x-2 -translate-y-2 rotate-2 rounded-2xl bg-zinc-900 border border-zinc-700/40 shadow-sm opacity-60 transition-transform duration-300 group-hover:translate-x-3 group-hover:-translate-y-3 group-hover:rotate-3" />

        {/* Katman 2: Ortadaki hafif eğik kart */}
        <div className="absolute inset-0 translate-x-1 -translate-y-1 rotate-1 rounded-2xl bg-zinc-850 border border-zinc-700/60 shadow-sm opacity-80 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:-translate-y-1.5 group-hover:rotate-1.5" />

        {/* Katman 1: Ön plandaki ana koleksiyon afişi */}
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-zinc-900 border border-amber-500/40 shadow-lg shadow-black/60 transition-all duration-300 group-hover:border-amber-400 group-hover:shadow-xl group-hover:shadow-amber-500/10">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={collection.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => setImgErrorCount(prev => prev + 1)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-zinc-500">
              <SeriesIcon size={36} className="mb-2 text-amber-400 opacity-60" />
              <span className="text-xs font-bold text-zinc-300 line-clamp-2 px-1">
                {collection.name}
              </span>
            </div>
          )}

          {/* Karartma Gradyanları */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-none" />

          {/* Sol Üst: "14 Film" Rozeti (Kehribar Işıltılı) */}
          <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-lg bg-amber-500/25 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 backdrop-blur-md border border-amber-500/40 shadow-sm">
            <SeriesIcon size={11} className="text-amber-400" />
            <span>{collection.total_count} Film</span>
          </div>

          {/* Sağ Üst: Tamamlandı Rozeti veya Ortalama Puan */}
          <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
            {isCompleted ? (
              <div className="flex items-center gap-1 rounded-lg bg-emerald-500/25 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 backdrop-blur-md border border-emerald-500/40 shadow-sm">
                <Crown size={11} strokeWidth={2} className="text-emerald-400" />
                <span className="hidden sm:inline">Bitti</span>
              </div>
            ) : collection.average_rating > 0 ? (
              <div className="flex items-center gap-1 rounded-lg bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-md border border-amber-500/30 shadow-sm">
                <Star size={9} strokeWidth={1.5} className="fill-amber-400 text-amber-400" />
                <span>{collection.average_rating.toFixed(1)}</span>
              </div>
            ) : null}
          </div>

          {/* Alt Bölüm: İlerleme Çubuğu ve İzlendi Sayacı */}
          <div className="absolute inset-x-2 bottom-2 z-10 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-300">
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                {collection.watched_count}/{collection.total_count}
                <span className="text-zinc-400 font-normal">izlendi</span>
              </span>
              <span className="text-zinc-400 font-mono">
                %{collection.completion_percentage}
              </span>
            </div>

            {/* İlerleme Çubuğu */}
            <div className="h-1.5 w-full rounded-full bg-zinc-800/90 overflow-hidden border border-zinc-700/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300'
                }`}
                style={{ width: `${Math.max(5, collection.completion_percentage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kart Altı Başlık ve Bilgi */}
      <div className="mt-2 px-0.5">
        <h3 className="text-xs font-bold text-zinc-100 line-clamp-1 group-hover:text-amber-400 transition-colors flex items-center gap-1">
          <span>{collection.name}</span>
        </h3>
        <p className="mt-0.5 text-[11px] font-medium text-amber-400/90 flex items-center gap-1.5">
          <span className="flex items-center gap-1 font-semibold text-amber-400">
            <SeriesIcon size={11} strokeWidth={2} />
            <span>Seri</span>
          </span>
          {yearSpan && (
            <>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400 font-normal">{yearSpan}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
