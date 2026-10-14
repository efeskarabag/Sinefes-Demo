import { NextResponse } from 'next/server';

function getCanonicalPlatformKey(name: string): string {
  const n = name
    .toLowerCase()
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (n.includes('netflix')) return 'netflix';
  if (n.includes('disney')) return 'disney';
  if (n.includes('prime video') || n.includes('amazon prime') || n === 'amazon') return 'prime';
  if (n.includes('apple tv') || n.includes('apple')) return 'apple';
  if (n.includes('hbo') || n === 'max') return 'hbo';
  if (n.includes('blu')) return 'blutv';
  if (n.includes('gain') || n.includes('gaın')) return 'gain';
  if (n.includes('exxen')) return 'exxen';
  if (n.includes('mubi')) return 'mubi';
  if (n.includes('bein') || n.includes('tod')) return 'tod';
  if (n === 'tv plus' || n === 'tvplus') return 'tvplus';
  if (n.includes('d smart') || n.includes('dsmart')) return 'dsmart';
  if (n.includes('tivibu')) return 'tivibu';

  return n.replace(/\s+/g, '');
}

function isSamePlatform(name1: string, name2: string): boolean {
  const k1 = getCanonicalPlatformKey(name1);
  const k2 = getCanonicalPlatformKey(name2);
  return k1 === k2;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type') || 'movie';

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your-tmdb')) {
    return NextResponse.json({
      runtime: null,
      number_of_seasons: null,
      watch_providers: [],
    });
  }

  try {
    const tmdbUrl = `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}&language=tr-TR&append_to_response=watch/providers`;

    const response = await fetch(tmdbUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from TMDB' },
        { status: response.status }
      );
    }

    const data = await response.json();

    const trProviders = data['watch/providers']?.results?.TR;
    const flatrate: Array<{ provider_id: number; provider_name: string; logo_path: string | null }> = [];
    
    // 1. JustWatch TR Flatrate platformları
    if (trProviders?.flatrate && Array.isArray(trProviders.flatrate)) {
      for (const p of trProviders.flatrate) {
        flatrate.push({
          provider_id: p.provider_id,
          provider_name: p.provider_name,
          logo_path: p.logo_path,
        });
      }
    }

    // 2. Dizi ise ve TV yayın ağı/streaming platformu (Netflix, Disney+, HBO, BluTV, GAİN, Exxen vs.) varsa
    if (Array.isArray(data.networks)) {
      for (const net of data.networks) {
        if (net.name) {
          const alreadyExists = flatrate.some(p => isSamePlatform(p.provider_name, net.name));
          if (!alreadyExists) {
            flatrate.push({
              provider_id: net.id,
              provider_name: net.name,
              logo_path: net.logo_path || null,
            });
          }
        }
      }
    }

    // 3. Film ise ve yapım şirketleri arasında streaming platformu varsa (Netflix Originals, Apple Studios vb.)
    if (Array.isArray(data.production_companies)) {
      const STREAMING_COMPANIES = [
        { match: 'netflix', name: 'Netflix' },
        { match: 'apple', name: 'Apple TV+' },
        { match: 'disney', name: 'Disney+' },
        { match: 'amazon', name: 'Prime Video' },
        { match: 'blutv', name: 'BluTV' },
        { match: 'gain', name: 'GAİN' },
        { match: 'exxen', name: 'Exxen' },
        { match: 'hbo', name: 'HBO Max' },
        { match: 'mubi', name: 'MUBI' },
      ];
      for (const comp of data.production_companies) {
        if (comp.name) {
          const lowerComp = comp.name.toLowerCase();
          const matched = STREAMING_COMPANIES.find(sc => lowerComp.includes(sc.match));
          if (matched) {
            const alreadyExists = flatrate.some(p => isSamePlatform(p.provider_name, matched.name));
            if (!alreadyExists) {
              flatrate.push({
                provider_id: comp.id,
                provider_name: matched.name,
                logo_path: comp.logo_path || null,
              });
            }
          }
        }
      }
    }

    const buy = trProviders?.buy || [];
    const rent = trProviders?.rent || [];
    const link = trProviders?.link || null;

    return NextResponse.json({
      id: data.id,
      title: data.title || data.name,
      runtime: data.runtime || null,
      number_of_seasons: data.number_of_seasons || null,
      number_of_episodes: data.number_of_episodes || null,
      status: data.status || null,
      watch_providers: {
        flatrate,
        buy: buy.map((p: any) => ({
          provider_id: p.provider_id,
          provider_name: p.provider_name,
          logo_path: p.logo_path,
        })),
        rent: rent.map((p: any) => ({
          provider_id: p.provider_id,
          provider_name: p.provider_name,
          logo_path: p.logo_path,
        })),
        link,
      },
    });
  } catch (error) {
    console.error('TMDB details fetch error:', error);
    return NextResponse.json(
      { error: 'Server error while fetching TMDB details' },
      { status: 500 }
    );
  }
}
