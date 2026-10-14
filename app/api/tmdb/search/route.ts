import { NextResponse } from 'next/server';
import { TMDBMediaResult } from '@/lib/types';

// Örnek popüler arama veri havuzu (TMDB API key henüz girilmediyse test için)
const FALLBACK_POPULAR_POOL: (TMDBMediaResult & { duration?: string; total_seasons?: number; popularity?: number })[] = [
  {
    id: 693134,
    title: 'Dune: Çöl Gezegeni Bölüm İki',
    media_type: 'movie',
    poster_path: '/czembW0Rk1Ke7ra2Nm6akvQ2CMP.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520DRq.jpg',
    release_date: '2024-02-27',
    vote_average: 8.5,
    overview: 'Paul Atreides, ailesini yok eden komploculara karşı intikam savaşı yürütürken Chani ve Fremenlerle birleşir.',
    runtime: 166,
    popularity: 95,
    genres: [{ id: 878, name: 'Bilim Kurgu' }, { id: 12, name: 'Macera' }, { id: 28, name: 'Aksiyon' }],
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    media_type: 'movie',
    poster_path: '/ptpr0kGAckfWYk529Qyv2K370R8.jpg',
    backdrop_path: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    release_date: '2023-07-19',
    vote_average: 8.1,
    overview: 'Amerikalı bilim insanı J. Robert Oppenheimer\'ın atom bombasının geliştirilmesindeki rolünün hikayesi.',
    runtime: 180,
    popularity: 90,
    genres: [{ id: 18, name: 'Dram' }, { id: 36, name: 'Tarih' }],
  },
  {
    id: 114472,
    name: 'Severance',
    media_type: 'tv',
    poster_path: '/9732T0K7i0Uj2xO0Yt6k73277.jpg',
    backdrop_path: '/m4q9G072fK50i3eQxR9N.jpg',
    first_air_date: '2022-02-17',
    vote_average: 8.7,
    overview: 'Mark, çalışma arkadaşlarıyla birlikte anıları cerrahi yöntemle iş ve özel yaşam olarak ayrılmış bir ofis ekibine liderlik eder.',
    number_of_seasons: 2,
    popularity: 88,
    genres: [{ id: 18, name: 'Dram' }, { id: 878, name: 'Bilim Kurgu' }, { id: 9648, name: 'Gizem' }],
  },
  {
    id: 94605,
    name: 'Arcane',
    media_type: 'tv',
    poster_path: '/fqldfqZ0nU29MwXkydv74k6Ut0U.jpg',
    backdrop_path: '/2meX1nMdScFOoV4370rqHWIOfl7.jpg',
    first_air_date: '2021-11-06',
    vote_average: 9.0,
    overview: 'Piltover ve Zaun arasındaki gerilim tırmanırken, iki kız kardeş savaşın zıt taraflarında kendilerini bulur.',
    number_of_seasons: 2,
    popularity: 92,
    genres: [{ id: 16, name: 'Animasyon' }, { id: 878, name: 'Bilim Kurgu' }, { id: 28, name: 'Aksiyon' }],
  },
  {
    id: 157336,
    title: 'Yıldızlararası (Interstellar)',
    original_title: 'Interstellar',
    media_type: 'movie',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    release_date: '2014-11-05',
    vote_average: 8.7,
    overview: 'İnsanlığın Dünya\'daki sonu yaklaşırken, kaşiflerden oluşan bir ekip uzayda yeni bir yuva aramak için solucan deliğinden geçer.',
    runtime: 169,
    popularity: 98,
    genres: [{ id: 12, name: 'Macera' }, { id: 18, name: 'Dram' }, { id: 878, name: 'Bilim Kurgu' }],
  },
  {
    id: 1396,
    name: 'Breaking Bad',
    original_name: 'Breaking Bad',
    media_type: 'tv',
    poster_path: '/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    backdrop_path: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    first_air_date: '2008-01-20',
    vote_average: 9.5,
    overview: 'Kanser teşhisi konan bir kimya öğretmeni, ailesinin geleceğini güvence altına almak için metamfetamin üretimine başlar.',
    number_of_seasons: 5,
    popularity: 99,
    genres: [{ id: 18, name: 'Dram' }, { id: 80, name: 'Suç' }],
  },
  {
    id: 414906,
    title: 'The Batman',
    original_title: 'The Batman',
    media_type: 'movie',
    poster_path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    backdrop_path: '/5P8SmMzSNYikXpxil6BYzG16611.jpg',
    release_date: '2022-03-01',
    vote_average: 7.8,
    overview: 'Sadist bir seri katil Gotham’ın önemli figürlerini öldürmeye başlayınca, Batman gizli yozlaşmayı araştırmak zorunda kalır.',
    runtime: 176,
    popularity: 85,
    genres: [{ id: 80, name: 'Suç' }, { id: 9648, name: 'Gizem' }, { id: 28, name: 'Aksiyon' }],
  },
  {
    id: 100088,
    name: 'The Last of Us',
    original_name: 'The Last of Us',
    media_type: 'tv',
    poster_path: '/uKvVjHNqB5VmOrdxqAt2V7JMrne.jpg',
    backdrop_path: '/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
    first_air_date: '2023-01-15',
    vote_average: 8.6,
    overview: 'Modern uygarlığın yok oluşundan 20 yıl sonra, sert bir hayatta kalan Joel, 14 yaşındaki Ellie\'yi karantina bölgesinden kaçırmakla görevlendirilir.',
    number_of_seasons: 2,
    popularity: 94,
    genres: [{ id: 18, name: 'Dram' }, { id: 878, name: 'Bilim Kurgu' }],
  },
];

// TMDB Genre ID Haritası (Türkçe)
const GENRE_MAP: Record<number, string> = {
  28: 'Aksiyon',
  12: 'Macera',
  16: 'Animasyon',
  35: 'Komedi',
  80: 'Suç',
  99: 'Belgesel',
  18: 'Dram',
  10751: 'Aile',
  14: 'Fantastik',
  36: 'Tarih',
  27: 'Korku',
  10402: 'Müzik',
  9648: 'Gizem',
  10749: 'Romantik',
  878: 'Bilim Kurgu',
  10770: 'TV Film',
  53: 'Gerilim',
  10752: 'Savaş',
  37: 'Vahşi Batı',
  10759: 'Aksiyon & Macera',
  10765: 'Bilim Kurgu & Fantastik',
};

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const row = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;

  for (let i = 1; i <= m; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }
  return row[n];
}

function stringSimilarity(s1: string, s2: string): number {
  const a = s1.toLowerCase().trim();
  const b = s2.toLowerCase().trim();
  if (a === b) return 1.0;
  if (!a || !b) return 0.0;

  if (b.includes(a) || a.includes(b)) {
    const ratio = Math.min(a.length, b.length) / Math.max(a.length, b.length);
    return Math.max(0.78, ratio);
  }

  const dist = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  return Math.max(0, 1 - dist / maxLen);
}

async function generateQueryCandidates(rawQuery: string): Promise<string[]> {
  const candidates: string[] = [];
  const qClean = rawQuery.trim();

  // 1. Google Search Complete
  try {
    const gUrl = `https://suggestqueries.google.com/complete/search?client=firefox&hl=tr&q=${encodeURIComponent(
      qClean
    )}`;
    const res = await fetch(gUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(1800),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data[1])) {
        for (const item of data[1].slice(0, 4)) {
          if (typeof item === 'string') {
            const cleaned = item
              .replace(/\b(izle|film|dizi|oyunculari|oyuncular|konusu|imdb|season|sezon|full|fragman|ekşi|kaç|bölüm)\b.*/gi, '')
              .replace(/[0-9]+\.\s*sezon/gi, '')
              .trim();
            if (cleaned.length >= 2) candidates.push(cleaned);
          }
        }
      }
    }
  } catch {}

  // 2. Wikipedia Opensearch
  for (const lang of ['tr', 'en']) {
    try {
      const wUrl = `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
        qClean
      )}&limit=3&namespace=0&format=json`;
      const res = await fetch(wUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(1800),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data[1])) {
          for (const item of data[1].slice(0, 3)) {
            if (typeof item === 'string') {
              const cleaned = item.replace(/\(.*?\)/g, '').trim();
              if (cleaned.length >= 2) candidates.push(cleaned);
            }
          }
        }
      }
    } catch {}
  }

  // 3. Kelime ayrıştırma & Ön ek varyasyonları
  const words = qClean.split(/\s+/);
  if (words.length === 1 && qClean.length >= 6) {
    candidates.push(qClean.slice(0, qClean.length - 2));
  } else if (words.length > 1) {
    for (const w of words) {
      if (w.length >= 3) candidates.push(w);
    }
  }

  const seen = new Set<string>();
  const uniqueList: string[] = [];
  for (const c of candidates) {
    const key = c.toLowerCase().trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      uniqueList.push(c);
    }
  }

  return uniqueList;
}

async function fetchTmdbMulti(
  queryStr: string,
  apiKey: string,
  language = 'tr-TR'
): Promise<TMDBMediaResult[]> {
  try {
    const tmdbUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(
      queryStr
    )}&language=${language}&include_adult=false`;

    const res = await fetch(tmdbUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).filter(
      (item: TMDBMediaResult) =>
        (item.media_type === 'movie' || item.media_type === 'tv') && Boolean(item.poster_path)
    );
  } catch {
    return [];
  }
}

function scoreItem(
  item: TMDBMediaResult & { popularity?: number },
  rawQuery: string
): number {
  const names = [
    item.title || '',
    item.name || '',
    item.original_title || '',
    item.original_name || '',
  ].filter(Boolean);

  let bestSim = 0;
  for (const name of names) {
    const sim = stringSimilarity(rawQuery, name);
    if (sim > bestSim) bestSim = sim;
  }

  const rawTokens = rawQuery.toLowerCase().split(/\s+/).filter(t => t.length >= 2);
  let tokenMatches = 0;
  for (const name of names) {
    const nLow = name.toLowerCase();
    for (const token of rawTokens) {
      if (nLow.includes(token)) {
        tokenMatches++;
      }
    }
  }
  const tokenBonus = Math.min(tokenMatches * 0.1, 0.2);
  const pop = item.popularity || 0;
  const popBonus = Math.min(pop / 100, 1.0) * 0.15;

  return bestSim + tokenBonus + popBonus;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() || '';

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

  if (apiKey && apiKey.trim() !== '' && !apiKey.includes('your-tmdb')) {
    try {
      // 1. HIZLI YOL: Doğrudan TMDB Türkçe araması
      const directResults = await fetchTmdbMulti(query, apiKey, 'tr-TR');

      if (directResults.length >= 2) {
        const validResults = directResults.map(item => {
          const genresList = (item.genre_ids || [])
            .map((gid: number) => GENRE_MAP[gid])
            .filter(Boolean);

          return {
            ...item,
            genres: genresList.map((g: string) => ({ id: 0, name: g })),
          };
        });

        return NextResponse.json({ results: validResults });
      }

      // 2. ESNEK YOL (TYPO-TOLERANT PIPELINE)
      const candidateQueries = await generateQueryCandidates(query);

      const pooledMap = new Map<number, TMDBMediaResult>();
      for (const item of directResults) {
        pooledMap.set(item.id, item);
      }

      const queryPromises = candidateQueries.slice(0, 4).map(cq => fetchTmdbMulti(cq, apiKey, 'tr-TR'));
      const batchResults = await Promise.allSettled(queryPromises);

      for (const batch of batchResults) {
        if (batch.status === 'fulfilled') {
          for (const item of batch.value) {
            if (!pooledMap.has(item.id)) {
              pooledMap.set(item.id, item);
            }
          }
        }
      }

      if (pooledMap.size === 0) {
        const enPromises = [query, ...candidateQueries.slice(0, 3)].map(cq =>
          fetchTmdbMulti(cq, apiKey, 'en-US')
        );
        const enBatchResults = await Promise.allSettled(enPromises);
        for (const batch of enBatchResults) {
          if (batch.status === 'fulfilled') {
            for (const item of batch.value) {
              if (!pooledMap.has(item.id)) {
                pooledMap.set(item.id, item);
              }
            }
          }
        }
      }

      const allResults = Array.from(pooledMap.values());
      allResults.sort((a, b) => scoreItem(b, query) - scoreItem(a, query));

      const validResults = allResults.map(item => {
        const genresList = (item.genre_ids || [])
          .map((gid: number) => GENRE_MAP[gid])
          .filter(Boolean);

        return {
          ...item,
          genres: genresList.map((g: string) => ({ id: 0, name: g })),
        };
      });

      return NextResponse.json({ results: validResults });
    } catch (err) {
      console.warn('TMDB resilient search failed, falling back to local pool:', err);
    }
  }

  // Fallback / Mock Arama (Fuzzy eşleşmeli)
  const scoredFallback = FALLBACK_POPULAR_POOL.map(item => ({
    item,
    score: scoreItem(item, query),
  })).sort((a, b) => b.score - a.score);

  const matched = scoredFallback.filter(x => x.score > 0.4).map(x => x.item);
  const results = matched.length > 0 ? matched : FALLBACK_POPULAR_POOL.slice(0, 4);

  return NextResponse.json({ results, isMock: true });
}
