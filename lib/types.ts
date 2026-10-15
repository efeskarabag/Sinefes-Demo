export type MediaType = 'movie' | 'tv';

export type MediaStatus = 'watchlist' | 'watched' | 'waiting_season';

export type CustomRating = 1 | 2 | 3 | 4 | 5;

export type SortOption =
  | 'created_desc'
  | 'created_asc'
  | 'title_asc'
  | 'title_desc'
  | 'imdb_desc'
  | 'imdb_asc'
  | 'year_desc'
  | 'year_asc'
  | 'rating_desc';

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface MediaItem {
  id: string;
  tmdb_id: number;
  title: string;
  media_type: MediaType;
  poster_path: string | null;
  backdrop_path: string | null;
  release_year: string;
  imdb_rating: number;
  status: MediaStatus;
  custom_rating: CustomRating | null;
  personal_note: string | null;
  overview?: string | null;
  genres?: string | null;
  duration?: string | null;        // Örn: "118 dk"
  total_seasons?: number | null;   // Örn: 3
  created_at: string;
}

export interface TMDBMediaResult {
  id: number;
  title?: string;
  name?: string;
  media_type?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  original_title?: string;
  original_name?: string;
  popularity?: number;
}

export interface CollectionGroup {
  id: string;
  tmdb_collection_id?: number | null;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview?: string | null;
  items: MediaItem[];
  total_count: number;
  watched_count: number;
  watchlist_count: number;
  completion_percentage: number;
  average_rating: number;
  latest_release_year: string;
}

export type FeedItem =
  | { type: 'single'; item: MediaItem }
  | { type: 'collection'; collection: CollectionGroup };
