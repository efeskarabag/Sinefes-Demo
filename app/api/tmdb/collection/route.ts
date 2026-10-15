import { NextResponse } from 'next/server';

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

interface TmdbRawPart {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  vote_average?: number;
  overview?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const franchiseId = searchParams.get('franchiseId');

  if (!id && !franchiseId) {
    return NextResponse.json({ error: 'Collection ID or Franchise ID is required' }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your-tmdb')) {
    return NextResponse.json({ error: 'TMDB API key is missing' }, { status: 500 });
  }

  try {
    // 1. Özel Sinematik Evren / Parçalı Franchise Kontrolleri
    if (franchiseId === 'franchise-xmen') {
      const [cMain, cWolv, cDead, mNewMutants] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/collection/748?api_key=${apiKey}&language=tr-TR`, { next: { revalidate: 86400 } }).then(r => r.ok ? r.json() : null),
        fetch(`https://api.themoviedb.org/3/collection/453993?api_key=${apiKey}&language=tr-TR`, { next: { revalidate: 86400 } }).then(r => r.ok ? r.json() : null),
        fetch(`https://api.themoviedb.org/3/collection/448150?api_key=${apiKey}&language=tr-TR`, { next: { revalidate: 86400 } }).then(r => r.ok ? r.json() : null),
        fetch(`https://api.themoviedb.org/3/movie/340102?api_key=${apiKey}&language=tr-TR`, { next: { revalidate: 86400 } }).then(r => r.ok ? r.json() : null),
      ]);

      const rawParts: TmdbRawPart[] = [
        ...(cMain?.parts || []),
        ...(cWolv?.parts || []),
        ...(cDead?.parts || []),
      ];

      if (mNewMutants?.id) {
        rawParts.push(mNewMutants);
      }

      // ID'ye göre tekilleştir (Mükerrer part olmasın)
      const uniqueMap = new Map<number, TmdbRawPart>();
      rawParts.forEach(p => {
        if (p?.id && !uniqueMap.has(p.id)) {
          uniqueMap.set(p.id, p);
        }
      });

      const parts: CollectionPart[] = Array.from(uniqueMap.values())
        .map(p => ({
          id: p.id,
          title: p.title || p.name || 'İsimsiz Film',
          poster_path: p.poster_path || null,
          backdrop_path: p.backdrop_path || null,
          release_date: p.release_date || null,
          release_year: p.release_date ? p.release_date.substring(0, 4) : '',
          vote_average: Math.round((p.vote_average || 0) * 10) / 10,
          overview: p.overview || '',
        }))
        .sort((a, b) => (a.release_date || '9999').localeCompare(b.release_date || '9999'));

      return NextResponse.json({
        id: 748,
        franchise_id: 'franchise-xmen',
        name: 'X-Men Serisi',
        overview: 'X-Men, Wolverine, Deadpool ve Yeni Mutantlar sinematik evreninin tüm yapımları.',
        poster_path: '/31rqs6ZxFdi5nWZZaFPIr17q8jt.jpg',
        backdrop_path: '/ykVHlrE3aSvHYeIXOrWDsYZ18vv.jpg',
        parts,
      });
    }

    if (franchiseId === 'franchise-lotr') {
      const [cLotr, cHobbit] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/collection/119?api_key=${apiKey}&language=tr-TR`, { next: { revalidate: 86400 } }).then(r => r.ok ? r.json() : null),
        fetch(`https://api.themoviedb.org/3/collection/121938?api_key=${apiKey}&language=tr-TR`, { next: { revalidate: 86400 } }).then(r => r.ok ? r.json() : null),
      ]);

      const rawParts: TmdbRawPart[] = [
        ...(cLotr?.parts || []),
        ...(cHobbit?.parts || []),
      ];

      const parts: CollectionPart[] = rawParts
        .map(p => ({
          id: p.id,
          title: p.title || p.name || 'İsimsiz Film',
          poster_path: p.poster_path || null,
          backdrop_path: p.backdrop_path || null,
          release_date: p.release_date || null,
          release_year: p.release_date ? p.release_date.substring(0, 4) : '',
          vote_average: Math.round((p.vote_average || 0) * 10) / 10,
          overview: p.overview || '',
        }))
        .sort((a, b) => (a.release_date || '9999').localeCompare(b.release_date || '9999'));

      return NextResponse.json({
        id: 119,
        franchise_id: 'franchise-lotr',
        name: 'Yüzüklerin Efendisi & Hobbit',
        overview: 'J.R.R. Tolkien evreninde geçen efsanevi Orta Dünya serisi.',
        poster_path: '/p4A3n9m3Tz3E6wK0yE1iXy9E2Z8.jpg',
        backdrop_path: '/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg',
        parts,
      });
    }

    // 2. Standart TMDB Koleksiyonu
    const targetId = id || (franchiseId ? getTmdbIdForFranchise(franchiseId) : null);
    if (!targetId) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const tmdbUrl = `https://api.themoviedb.org/3/collection/${targetId}?api_key=${apiKey}&language=tr-TR`;

    const response = await fetch(tmdbUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 }, // 24 saat önbellek
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch collection from TMDB' },
        { status: response.status }
      );
    }

    const data = await response.json();

    const parts: CollectionPart[] = Array.isArray(data.parts)
      ? data.parts
          .map((p: TmdbRawPart) => ({
            id: p.id,
            title: p.title || p.name || 'İsimsiz Film',
            poster_path: p.poster_path || null,
            backdrop_path: p.backdrop_path || null,
            release_date: p.release_date || null,
            release_year: p.release_date ? p.release_date.substring(0, 4) : '',
            vote_average: Math.round((p.vote_average || 0) * 10) / 10,
            overview: p.overview || '',
          }))
          .sort((a: CollectionPart, b: CollectionPart) =>
            (a.release_date || '9999').localeCompare(b.release_date || '9999')
          )
      : [];

    return NextResponse.json({
      id: data.id,
      name: data.name,
      overview: data.overview || null,
      poster_path: data.poster_path || null,
      backdrop_path: data.backdrop_path || null,
      parts,
    });
  } catch (error) {
    console.error('TMDB collection fetch error:', error);
    return NextResponse.json(
      { error: 'Server error while fetching collection' },
      { status: 500 }
    );
  }
}

function getTmdbIdForFranchise(franchiseId: string): number | null {
  const map: Record<string, number> = {
    'franchise-bad-boys': 14890,
    'franchise-never-back-down': 96676,
    'franchise-kardes-takimi': 1294316,
    'franchise-dag': 474026,
    'franchise-harry-potter': 1241,
    'franchise-dark-knight': 263,
    'franchise-john-wick': 404609,
  };
  return map[franchiseId] || null;
}
