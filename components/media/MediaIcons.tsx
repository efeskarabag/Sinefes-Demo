'use client';

import React from 'react';
import {
  Bookmark,
  CheckCircle2,
  Hourglass,
  Skull,
  Meh,
  Popcorn,
  Flame,
  Crown,
  Film,
  Tv,
} from 'lucide-react';
import { MediaStatus, CustomRating, MediaType } from '@/lib/types';

interface StatusIconProps {
  status: MediaStatus;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export const StatusIcon: React.FC<StatusIconProps> = ({
  status,
  size = 13,
  className = '',
  strokeWidth = 1.75,
}) => {
  switch (status) {
    case 'watchlist':
      return <Bookmark size={size} strokeWidth={strokeWidth} className={className} />;
    case 'watched':
      return <CheckCircle2 size={size} strokeWidth={strokeWidth} className={className} />;
    case 'waiting_season':
      return <Hourglass size={size} strokeWidth={strokeWidth} className={className} />;
    default:
      return <Bookmark size={size} strokeWidth={strokeWidth} className={className} />;
  }
};

interface RatingIconProps {
  level: CustomRating;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export const RatingIcon: React.FC<RatingIconProps> = ({
  level,
  size = 14,
  className = '',
  strokeWidth = 1.5,
}) => {
  switch (level) {
    case 1:
      return <Skull size={size} strokeWidth={strokeWidth} className={className} />;
    case 2:
      return <Meh size={size} strokeWidth={strokeWidth} className={className} />;
    case 3:
      return <Popcorn size={size} strokeWidth={strokeWidth} className={className} />;
    case 4:
      return <Flame size={size} strokeWidth={strokeWidth} className={className} />;
    case 5:
      return <Crown size={size} strokeWidth={strokeWidth} className={className} />;
    default:
      return null;
  }
};

interface MediaTypeIconProps {
  type: MediaType;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export const MediaTypeIcon: React.FC<MediaTypeIconProps> = ({
  type,
  size = 14,
  className = '',
  strokeWidth = 1.5,
}) => {
  return type === 'movie' ? (
    <Film size={size} strokeWidth={strokeWidth} className={className} />
  ) : (
    <Tv size={size} strokeWidth={strokeWidth} className={className} />
  );
};

// Sinematik Seri / Koleksiyon Destesi İkonu (2 üst üste binen film posteri + oynat işareti)
export const SeriesIcon: React.FC<{
  size?: number;
  className?: string;
  strokeWidth?: number;
}> = ({ size = 14, className = '', strokeWidth = 1.75 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="7" y="2.5" width="13" height="16" rx="2" opacity="0.45" />
    <rect x="3.5" y="5.5" width="13" height="16" rx="2" />
    <path d="M8.5 11.5l3.5 2-3.5 2v-4z" fill="currentColor" stroke="none" />
  </svg>
);

