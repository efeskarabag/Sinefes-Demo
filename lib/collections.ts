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
    id: 'franchise-spiderman',
    tmdb_collection_id: 531241,
    name: 'Örümcek-Adam Serisi',
    poster_path: '/yeba3Y820OjApZO9aJevDsNeMEd.jpg',
    backdrop_path: '/AvnqpRwlEaYNVL6wzC4RN94EdSd.jpg',
    overview: 'Peter Parker, Miles Morales ve çoklu evren Örümcek-Adam maceralarının tümü.',
    movie_tmdb_ids: [
      557,    // Spider-Man (2002)
      558,    // Spider-Man 2 (2004)
      559,    // Spider-Man 3 (2007)
      1930,   // The Amazing Spider-Man (2012)
      102382, // The Amazing Spider-Man 2 (2014)
      315635, // Örümcek-Adam: Eve Dönüş (2017)
      429617, // Örümcek-Adam: Evden Uzakta (2019)
      634649, // Örümcek-Adam: Eve Dönüş Yok (2021)
      969681, // Örümcek-Adam: Yepyeni Bir Gün (2026)
      324857, // Örümcek-Adam: Örümcek Evreninde (2018)
      569094, // Örümcek-Adam: Örümcek Evrenine Geçiş (2023)
    ],
  },
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
  {
    id: 'franchise-fast-furious',
    tmdb_collection_id: 9485,
    name: 'Hızlı ve Öfkeli Serisi',
    poster_path: '/gq5WiRNqM07j1cg9v0e6fQmsv2u.jpg',
    backdrop_path: '/zN41OoWBExreY9i33x3X3qA4fK5.jpg',
    overview: 'Sokak yarışlarından küresel operasyonlara uzanan aksiyon serisi.',
    movie_tmdb_ids: [9799, 584, 9615, 13804, 51497, 87827, 168259, 337339, 384018, 385687, 335977],
  },
  {
    id: 'franchise-matrix',
    tmdb_collection_id: 2344,
    name: 'Matrix Serisi',
    poster_path: '/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg',
    backdrop_path: '/RhBBDz4sUjV1B4q5f0Jk1M82g1.jpg',
    overview: 'Gerçeklik ve simülasyon arasındaki savaşı konu alan kült bilim kurgu serisi.',
    movie_tmdb_ids: [603, 604, 605, 624860],
  },
  {
    id: 'franchise-star-wars',
    tmdb_collection_id: 10,
    name: 'Star Wars (Yıldız Savaşları)',
    poster_path: '/gq5WiRNqM07j1cg9v0e6fQmsv2u.jpg',
    backdrop_path: '/d8duY2thAFOiNk4gEvpn9d0gyIf.jpg',
    overview: 'Çok çok uzak bir galaksideki Güç ve Skywalker efsanesi.',
    movie_tmdb_ids: [11, 1891, 1892, 1893, 1894, 1895, 140607, 181808, 181812, 330459, 348350],
  },
  {
    id: 'franchise-pirates',
    tmdb_collection_id: 295,
    name: 'Karayip Korsanları Serisi',
    poster_path: '/z8onk7LV9MPkweKP0umqu7UK4e.jpg',
    backdrop_path: '/kmcqbVl6k0iB3W7Vj0kK82w8Z.jpg',
    overview: 'Kaptan Jack Sparrow ve denizlerin lanetli efsaneleri.',
    movie_tmdb_ids: [22, 58, 285, 1865, 166426],
  },
  {
    id: 'franchise-mission-impossible',
    tmdb_collection_id: 87359,
    name: 'Görevimiz Tehlike Serisi',
    poster_path: '/bdE1N8C2fL9gqM07j1cg9v0e6f.jpg',
    backdrop_path: '/628Dep6AxEtDxjZoGP78TsOxYbK.jpg',
    overview: 'Ajan Ethan Hunt ve IMF ekibinin nefes kesen görevleri.',
    movie_tmdb_ids: [954, 955, 956, 56292, 177677, 353081, 575264, 575265],
  },
  {
    id: 'franchise-hunger-games',
    tmdb_collection_id: 131635,
    name: 'Açlık Oyunları Serisi',
    poster_path: '/yHA9Fc37Vmpap5Umvgwioa951kC.jpg',
    backdrop_path: '/iR1qG7GvL4XyG8uW4q82qY9Z5.jpg',
    overview: 'Panem ve Katniss Everdeen distopya serisi.',
    movie_tmdb_ids: [70160, 101299, 131631, 131634, 753342],
  },
  {
    id: 'franchise-twilight',
    tmdb_collection_id: 33514,
    name: 'Alacakaranlık Efsanesi',
    poster_path: '/7rU9qY0F4L9gqM07j1cg9v0e6f.jpg',
    backdrop_path: '/a1n8C2fL9gqM07j1cg9v0e6f.jpg',
    overview: 'Bella Swan ve vampir Edward Cullen efsanesi.',
    movie_tmdb_ids: [8966, 18239, 24021, 50619, 50620],
  },
  {
    id: 'franchise-shrek',
    tmdb_collection_id: 12248,
    name: 'Şrek Serisi',
    poster_path: '/iB64vpL3dIQQOb0vJVVeA54F11Q.jpg',
    backdrop_path: '/7WJptW0ufRaNOyCGTXDpmVf8e.jpg',
    overview: 'Yeşil dev Şrek ve Uzak Çok Uzak Krallık serisi.',
    movie_tmdb_ids: [808, 809, 810, 10191],
  },
  {
    id: 'franchise-ice-age',
    tmdb_collection_id: 8354,
    name: 'Buz Devri Serisi',
    poster_path: '/gLh4ffqE750j7q4K8w9Z5v11.jpg',
    backdrop_path: '/7rU9qY0F4L9gqM07j1cg9v0e6f.jpg',
    overview: 'Manny, Sid, Diego ve Scrat maceraları.',
    movie_tmdb_ids: [425, 950, 8355, 57800, 278154],
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
    id: 'franchise-kolpacino',
    tmdb_collection_id: 1134260,
    name: 'Kolpaçino Serisi',
    poster_path: '/45550.jpg',
    backdrop_path: null,
    overview: 'Şafak Sezer imzalı efsanevi Kolpaçino komedi serisi.',
    movie_tmdb_ids: [45550, 137494, 381643, 1134259],
  },
  {
    id: 'franchise-recep-ivedik',
    tmdb_collection_id: 373289,
    name: 'Recep İvedik Serisi',
    poster_path: null,
    backdrop_path: null,
    overview: 'Şahan Gökbakar imzalı Recep İvedik serisi.',
    movie_tmdb_ids: [10419, 17565, 33501, 255288, 439007, 638848, 1040330],
  },
  {
    id: 'franchise-cakallarla-dans',
    tmdb_collection_id: 373291,
    name: 'Çakallarla Dans Serisi',
    poster_path: null,
    backdrop_path: null,
    overview: 'Murat Şeker imzalı Çakallarla Dans komedi serisi.',
    movie_tmdb_ids: [59740, 149363, 308439, 427003, 561622, 1039868, 1368940],
  },
  {
    id: 'franchise-hababam-sinifi',
    name: 'Hababam Sınıfı Serisi',
    poster_path: null,
    backdrop_path: null,
    overview: 'Rıfat Ilgaz ve Ertem Eğilmez klasiği Hababam Sınıfı.',
    movie_tmdb_ids: [28114, 28115, 28116, 28117, 28118, 28119],
  },
  {
    id: 'franchise-organize-isler',
    name: 'Organize İşler Serisi',
    poster_path: null,
    backdrop_path: null,
    overview: 'Yılmaz Erdoğan imzalı Organize İşler serisi.',
    movie_tmdb_ids: [13715, 521777],
  },
  {
    id: 'franchise-gora-arog',
    name: 'G.O.R.A. & A.R.O.G Evreni',
    poster_path: null,
    backdrop_path: null,
    overview: 'Cem Yılmaz imzalı G.O.R.A, A.R.O.G ve Arif V 216 sinema serisi.',
    movie_tmdb_ids: [13714, 15159, 448341],
  },
];

// Dinamik seri / koleksiyon kayıt defteri
const dynamicCollectionsRegistry = new Map<string, FranchiseMeta>();

export function getRegisteredCollections(): FranchiseMeta[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem('sinefes_demo_dynamic_collections');
      if (raw) {
        const parsed: FranchiseMeta[] = JSON.parse(raw);
        parsed.forEach(c => dynamicCollectionsRegistry.set(c.id, c));
      }
    } catch {}
  }
  return Array.from(dynamicCollectionsRegistry.values());
}

export function registerDynamicCollection(collection: FranchiseMeta): void {
  dynamicCollectionsRegistry.set(collection.id, collection);
  if (typeof window !== 'undefined') {
    try {
      const all = Array.from(dynamicCollectionsRegistry.values());
      sessionStorage.setItem('sinefes_demo_dynamic_collections', JSON.stringify(all));
    } catch {}
  }
}

// Filmin ait olduğu franchise meta verisini bulur
export function isMovieInFranchise(movie: MediaItem, franchise: FranchiseMeta): boolean {
  if (franchise.movie_tmdb_ids && franchise.movie_tmdb_ids.includes(movie.tmdb_id)) {
    return true;
  }
  if (franchise.tmdb_collection_id && movie.tmdb_collection_id === franchise.tmdb_collection_id) {
    return true;
  }

  // Dinamik isim/evren eşleme
  const t = (movie.title || '').toLowerCase();

  if (franchise.id === 'franchise-spiderman') {
    if (t.includes('örümcek-adam') || t.includes('örümcek adam') || t.includes('spider-man') || t.includes('spiderman')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-xmen') {
    if (t.includes('x-men') || t.includes('wolverine') || t.includes('deadpool') || t.includes('mutantlar') || t.includes('new mutants')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-harry-potter') {
    if (t.includes('harry potter')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-lotr') {
    if (t.includes('yüzüklerin efendisi') || t.includes('lord of the rings') || t.includes('hobbit')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-matrix') {
    if (t.includes('matrix')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-star-wars') {
    if (t.includes('star wars') || t.includes('yıldız savaşları')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-fast-furious') {
    if (t.includes('hızlı ve öfkeli') || t.includes('fast & furious') || t.includes('fast and furious') || t.includes('tokyo drift') || t.includes('hobbs & shaw')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-pirates') {
    if (t.includes('karayip korsanları') || t.includes('pirates of the caribbean')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-mission-impossible') {
    if (t.includes('görevimiz tehlike') || t.includes('mission: impossible') || t.includes('mission impossible')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-hunger-games') {
    if (t.includes('açlık oyunları') || t.includes('hunger games')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-twilight') {
    if (t.includes('alacakaranlık') || t.includes('twilight')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-shrek') {
    if (t.includes('şrek') || t.includes('shrek')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-ice-age') {
    if (t.includes('buz devri') || t.includes('ice age')) {
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
  if (franchise.id === 'franchise-kolpacino') {
    if (t.includes('kolpaçino')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-recep-ivedik') {
    if (t.includes('recep ivedik')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-cakallarla-dans') {
    if (t.includes('çakallarla dans')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-hababam-sinifi') {
    if (t.includes('hababam sınıfı')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-organize-isler') {
    if (t.includes('organize işler')) {
      return true;
    }
  }
  if (franchise.id === 'franchise-gora-arog') {
    if (t.includes('g.o.r.a') || t.includes('gora') || t.includes('a.r.o.g') || t.includes('arog') || t.includes('arif v 216')) {
      return true;
    }
  }

  return false;
}

export function getFranchiseForMovie(movie: MediaItem): FranchiseMeta | null {
  const dynamicCollections = getRegisteredCollections();
  const all = [...KNOWN_FRANCHISES, ...dynamicCollections];
  for (const f of all) {
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

  // 1. Bilinen Popüler Franchise'lar + Dinamik Kayıtlı Koleksiyonlar
  const dynamicCollections = getRegisteredCollections();
  const allFranchises = [...KNOWN_FRANCHISES, ...dynamicCollections];
  const uniqueFranchises = Array.from(new Map(allFranchises.map(f => [f.id, f])).values());

  for (const franchise of uniqueFranchises) {
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

  // 2. Dinamik tmdb_collection_id bazlı gruplama (Herhangi bir TMDB koleksiyonu için)
  const collectionIdMap = new Map<number, MediaItem[]>();
  for (const m of movies) {
    if (!handledItemIds.has(m.id) && m.tmdb_collection_id) {
      const list = collectionIdMap.get(m.tmdb_collection_id) || [];
      list.push(m);
      collectionIdMap.set(m.tmdb_collection_id, list);
    }
  }

  for (const [colId, colMovies] of collectionIdMap.entries()) {
    if (colMovies.length >= 2) {
      colMovies.forEach(m => handledItemIds.add(m.id));
      const sorted = [...colMovies].sort((a, b) => (parseInt(a.release_year) || 0) - (parseInt(b.release_year) || 0));
      const watchedCount = colMovies.filter(m => m.status === 'watched').length;
      const watchlistCount = colMovies.filter(m => m.status === 'watchlist').length;
      const ratings = colMovies.map(m => m.imdb_rating).filter(r => r > 0);
      const avgRating = ratings.length > 0
        ? parseFloat((ratings.reduce((acc, r) => acc + r, 0) / ratings.length).toFixed(1))
        : 0;

      result.push({
        type: 'collection',
        collection: {
          id: `collection-${colId}`,
          tmdb_collection_id: colId,
          name: colMovies[0].collection_name || `${colMovies[0].title.split(':')[0].trim()} Serisi`,
          poster_path: colMovies[0].poster_path,
          backdrop_path: colMovies[0].backdrop_path,
          overview: null,
          items: sorted,
          total_count: colMovies.length,
          watched_count: watchedCount,
          watchlist_count: watchlistCount,
          completion_percentage: Math.round((watchedCount / colMovies.length) * 100),
          average_rating: avgRating,
          latest_release_year: sorted[sorted.length - 1]?.release_year || '',
        },
      });
    }
  }

  // 3. Ortak Başlık Ön-Eki Heuristiği (Örn: "Örümcek-Adam: Eve Dönüş", "Örümcek-Adam: Evden Uzakta")
  const prefixMap = new Map<string, MediaItem[]>();
  for (const m of movies) {
    if (!handledItemIds.has(m.id)) {
      const colonIdx = m.title.indexOf(':');
      if (colonIdx > 2) {
        const prefix = m.title.substring(0, colonIdx).trim().toLowerCase();
        if (prefix.length >= 4) {
          const list = prefixMap.get(prefix) || [];
          list.push(m);
          prefixMap.set(prefix, list);
        }
      }
    }
  }

  for (const [prefix, pMovies] of prefixMap.entries()) {
    if (pMovies.length >= 2) {
      pMovies.forEach(m => handledItemIds.add(m.id));
      const sorted = [...pMovies].sort((a, b) => (parseInt(a.release_year) || 0) - (parseInt(b.release_year) || 0));
      const watchedCount = pMovies.filter(m => m.status === 'watched').length;
      const watchlistCount = pMovies.filter(m => m.status === 'watchlist').length;
      const ratings = pMovies.map(m => m.imdb_rating).filter(r => r > 0);
      const avgRating = ratings.length > 0
        ? parseFloat((ratings.reduce((acc, r) => acc + r, 0) / ratings.length).toFixed(1))
        : 0;
      const displayPrefix = pMovies[0].title.split(':')[0].trim();

      result.push({
        type: 'collection',
        collection: {
          id: `prefix-${prefix.replace(/\s+/g, '-')}`,
          tmdb_collection_id: pMovies[0].tmdb_collection_id || null,
          name: `${displayPrefix} Serisi`,
          poster_path: pMovies[0].poster_path,
          backdrop_path: pMovies[0].backdrop_path,
          overview: null,
          items: sorted,
          total_count: pMovies.length,
          watched_count: watchedCount,
          watchlist_count: watchlistCount,
          completion_percentage: Math.round((watchedCount / pMovies.length) * 100),
          average_rating: avgRating,
          latest_release_year: sorted[sorted.length - 1]?.release_year || '',
        },
      });
    }
  }

  // 4. Franchise veya seriye girmeyen diğer tekil filmler ve diziler
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
