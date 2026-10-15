import { MediaItem, CollectionGroup, FeedItem } from './types';

// Popüler ve bilinen sinematik evrenler / seriler
// (TMDB'de parçalanmış alt koleksiyonları da tek bir çatı altında birleştirir)
export interface FranchiseMeta {
  id: string;
  tmdb_collection_id?: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview?: string;
  movie_tmdb_ids: number[];
}

export const KNOWN_FRANCHISES: FranchiseMeta[] = [
  {
    id: 'franchise-xmen',
    tmdb_collection_id: 748,
    name: 'X-Men Serisi',
    poster_path: '/31rqs6ZxFdi5nWZZaFPIr17q8jt.jpg',
    backdrop_path: '/ykVHlrE3aSvHYeIXOrWDsYZ18vv.jpg',
    overview: 'X-Men, Wolverine, Deadpool ve Yeni Mutantlar sinematik evreninin tüm yapımları.',
    movie_tmdb_ids: [
      36657,  // X-Men (2000)
      36658,  // X-Men 2 (2003)
      36668,  // X-Men: Son Direniş (2006)
      2080,   // X-Men Başlangıç: Wolverine (2009)
      49538,  // X-Men: Birinci Sınıf (2011)
      76170,  // Wolverine (2013)
      127585, // X-Men: Geçmiş Günler Gelecek (2014)
      293660, // Deadpool (2016)
      246655, // X-Men: Apocalypse (2016)
      263115, // Logan: Wolverine (2017)
      383498, // Deadpool 2 (2018)
      320288, // X-Men: Dark Phoenix (2019)
      340102, // Yeni Mutantlar (2020)
      533535, // Deadpool ve Wolverine (2024)
    ],
  },
  {
    id: 'franchise-bad-boys',
    tmdb_collection_id: 14890,
    name: 'Çılgın İkili (Bad Boys) Serisi',
    poster_path: '/eyFIxc3EHUn6SJlGgZyVDwiUp1P.jpg',
    backdrop_path: '/r8kZJbi6UNhilLhM5WhauYELIR8.jpg',
    overview: 'Miami polis departmanının efsanevi ikilisi Mike Lowrey ve Marcus Burnett maceraları.',
    movie_tmdb_ids: [9737, 8961, 38700, 573435],
  },
  {
    id: 'franchise-never-back-down',
    tmdb_collection_id: 96676,
    name: 'Asla Pes Etme Serisi',
    poster_path: '/w8S6H9tV9cnctATHDw71ntoZWcC.jpg',
    backdrop_path: '/p89IHzPRxUczf1ALOurfzus0br6.jpg',
    overview: 'Yeraltı dövüş kulüpleri ve karma dövüş sanatları (MMA) serisi.',
    movie_tmdb_ids: [8456, 70006, 391757, 763025],
  },
  {
    id: 'franchise-kardes-takimi',
    tmdb_collection_id: 1294316,
    name: 'Kardeş Takımı Serisi',
    poster_path: null,
    backdrop_path: null,
    overview: 'Kardeş Takımı yerli komedi serisi.',
    movie_tmdb_ids: [1219304, 1294311, 1516288],
  },
  {
    id: 'franchise-dag',
    tmdb_collection_id: 474026,
    name: 'Dağ Serisi',
    poster_path: '/lAVc5jXeeN16vMF0yFLfPrIfSfv.jpg',
    backdrop_path: '/gLjWjk5jzpaoL0cbnSQdmZwQ9JM.jpg',
    overview: 'Alper Çağlar imzalı Dağ ve Dağ II sinema serisi.',
    movie_tmdb_ids: [246871, 427008],
  },
  {
    id: 'franchise-harry-potter',
    tmdb_collection_id: 1241,
    name: 'Harry Potter Serisi',
    poster_path: '/bnOxure2AqAatT9S479lZaKSaaM.jpg',
    backdrop_path: '/4gV0rKUjB1nLUdZB4zIltLvNZZr.jpg',
    overview: 'Büyücülük dünyasının 8 filmlik efsanevi serisi.',
    movie_tmdb_ids: [671, 672, 673, 674, 675, 767, 12444, 12445],
  },
  {
    id: 'franchise-lotr',
    tmdb_collection_id: 119,
    name: 'Yüzüklerin Efendisi & Hobbit',
    poster_path: '/oENY593nKRVL2PnxXsMtlh8izb4.jpg',
    backdrop_path: '/bccR2CGTWVVSZAG0yqmy3DIvhTX.jpg',
    overview: 'J.R.R. Tolkien evreninde geçen efsanevi Orta Dünya serisi.',
    movie_tmdb_ids: [120, 121, 122, 49051, 57158, 122917],
  },
  {
    id: 'franchise-dark-knight',
    tmdb_collection_id: 263,
    name: 'Kara Şövalye Üçlemesi',
    poster_path: '/fDWCNgS5wDXQiPQmzHG1ePKIZqe.jpg',
    backdrop_path: '/xyhrCEdB4XRkelfVsqXeUZ6rLHi.jpg',
    overview: 'Christopher Nolan imzalı Batman üçlemesi.',
    movie_tmdb_ids: [272, 155, 49026],
  },
  {
    id: 'franchise-john-wick',
    tmdb_collection_id: 404609,
    name: 'John Wick Serisi',
    poster_path: '/sm7rZZivZm2NhJDucFf3gpfFdVt.jpg',
    backdrop_path: '/fSwYa5q2xRkBoOOjueLpkLf3N1m.jpg',
    overview: 'Baba Yaga John Wick aksiyon serisi.',
    movie_tmdb_ids: [245891, 324552, 458156, 603692],
  },
];

// Filmin ait olduğu franchise meta verisini bulur
export function isMovieInFranchise(movie: MediaItem, franchise: FranchiseMeta): boolean {
  if (franchise.movie_tmdb_ids.includes(movie.tmdb_id)) {
    return true;
  }
  // Dinamik isim/evren eşleme (Gelecekte çıkacak yeni X-Men, Wolverine veya Deadpool filmleri için)
  const t = (movie.title || '').toLowerCase();
  if (franchise.id === 'franchise-xmen') {
    if (t.includes('x-men') || t.includes('wolverine') || t.includes('deadpool') || t.includes('mutantlar') || t.includes('new mutants')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-bad-boys') {
    if (t.includes('bad boys') || t.includes('çılgın ikili')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-never-back-down') {
    if (t.includes('asla pes etme') || t.includes('never back down')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-kardes-takimi') {
    if (t.includes('kardeş takımı')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-dag') {
    if (t === 'dağ' || t === 'dağ ii' || t === 'dağ 2' || t.startsWith('dağ ')) {
      return true;
    }
  }
  return false;
}

export function getFranchiseForMovie(movie: MediaItem): FranchiseMeta | null {
  for (const f of KNOWN_FRANCHISES) {
    if (isMovieInFranchise(movie, f)) {
      return f;
    }
  }
  return null;
}

// Seride henüz izlenmemiş ilk filmi bulur (Maraton modu "Sıradaki Film")
export function getNextToWatchInCollection(collection: CollectionGroup): MediaItem | null {
  return collection.items.find(item => item.status === 'watchlist') || null;
}

/**
 * Ana akış listesini alır; eğer groupBySeries aktifse,
 * arşivde en az 2 filmi bulunan serileri tek bir CollectionGroup yığınına toplar.
 * Tekil filmler veya diziler aynen tekil kalır.
 */
export function groupMediaItemsIntoFeed(
  items: MediaItem[],
  groupBySeries: boolean
): FeedItem[] {
  // Eğer serileri gruplama kapalıysa tüm yapımları tekil göster
  if (!groupBySeries) {
    return items.map(item => ({ type: 'single', item }));
  }

  const result: FeedItem[] = [];
  const handledItemIds = new Set<string>();

  // Sadece filmler seriler halinde gruplanır
  const movies = items.filter(i => i.media_type === 'movie');
  const tvShows = items.filter(i => i.media_type === 'tv');

  // 1. Bilinen Franchise'lara göre filmleri eşle
  for (const franchise of KNOWN_FRANCHISES) {
    const matchingMovies = movies.filter(m =>
      isMovieInFranchise(m, franchise) && !handledItemIds.has(m.id)
    );

    // Bir serinin yığın kartı oluşturması için arşivde EN AZ 2 filminin bulunması gerekir
    if (matchingMovies.length >= 2) {
      matchingMovies.forEach(m => handledItemIds.add(m.id));

      // Filmleri çıkış yılına göre kronolojik sırala (Eski ➔ Yeni)
      const sortedChronologically = [...matchingMovies].sort((a, b) => {
        const yearA = parseInt(a.release_year) || 0;
        const yearB = parseInt(b.release_year) || 0;
        return yearA - yearB;
      });

      const watchedCount = matchingMovies.filter(m => m.status === 'watched').length;
      const watchlistCount = matchingMovies.filter(m => m.status === 'watchlist').length;
      const totalCount = matchingMovies.length;
      const completionPercentage = Math.round((watchedCount / totalCount) * 100);

      const ratings = matchingMovies.map(m => m.imdb_rating).filter(r => r > 0);
      const avgRating = ratings.length > 0
        ? parseFloat((ratings.reduce((acc, r) => acc + r, 0) / ratings.length).toFixed(1))
        : 0;

      const latestYear = sortedChronologically[sortedChronologically.length - 1]?.release_year || '';

      const collectionGroup: CollectionGroup = {
        id: franchise.id,
        tmdb_collection_id: franchise.tmdb_collection_id || null,
        name: franchise.name,
        poster_path: franchise.poster_path || sortedChronologically[0]?.poster_path || null,
        backdrop_path: franchise.backdrop_path || sortedChronologically[0]?.backdrop_path || null,
        overview: franchise.overview || null,
        items: sortedChronologically,
        total_count: totalCount,
        watched_count: watchedCount,
        watchlist_count: watchlistCount,
        completion_percentage: completionPercentage,
        average_rating: avgRating,
        latest_release_year: latestYear,
      };

      result.push({
        type: 'collection',
        collection: collectionGroup,
      });
    }
  }

  // 2. Franchise'a girmeyen diğer filmler ve diziler tekil kart olarak eklenir
  for (const item of items) {
    if (!handledItemIds.has(item.id)) {
      result.push({
        type: 'single',
        item,
      });
    }
  }

  return result;
}
