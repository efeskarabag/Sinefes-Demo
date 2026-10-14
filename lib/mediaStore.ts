import { INITIAL_DEMO_ITEMS } from './constants';
import { MediaItem } from './types';

const STORAGE_KEY = 'sinefes_demo_media_items_v1';

/**
 * Oturuma özel medya listesini getirir.
 * İlk defa açıldığında 15 Film + 15 Dizi ile sessionStorage'ı başlatır.
 */
export async function getMediaItems(): Promise<MediaItem[]> {
  if (typeof window !== 'undefined') {
    try {
      const sessionData = sessionStorage.getItem(STORAGE_KEY);
      if (sessionData) {
        return JSON.parse(sessionData) as MediaItem[];
      }
      // İlk ziyaretçi oturumu: 30'luk zengin havuzla başlat
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ITEMS));
      return INITIAL_DEMO_ITEMS;
    } catch (e) {
      console.warn('sessionStorage erişim hatası, varsayılan liste dönülüyor:', e);
      return INITIAL_DEMO_ITEMS;
    }
  }

  return INITIAL_DEMO_ITEMS;
}

/**
 * Oturum hafızasına yeni film veya dizi ekler.
 */
export async function saveMediaItem(item: Omit<MediaItem, 'id' | 'created_at'>): Promise<MediaItem> {
  const newItem: MediaItem = {
    ...item,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      const existing = await getMediaItems();
      const updated = [newItem, ...existing.filter(i => i.tmdb_id !== item.tmdb_id)];
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('sessionStorage kaydetme hatası:', e);
    }
  }

  return newItem;
}

/**
 * Oturumdaki mevcut bir yapımı günceller (puan, durum, not vb.)
 */
export async function updateMediaItem(id: string, updates: Partial<MediaItem>): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const existing = await getMediaItems();
      const updated = existing.map(item => (item.id === id ? { ...item, ...updates } : item));
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (e) {
      console.error('sessionStorage güncelleme hatası:', e);
      return false;
    }
  }

  return false;
}

/**
 * Oturumdan bir yapımı siler.
 */
export async function deleteMediaItem(id: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const existing = await getMediaItems();
      const updated = existing.filter(item => item.id !== id);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (e) {
      console.error('sessionStorage silme hatası:', e);
      return false;
    }
  }

  return false;
}

/**
 * Demo verilerini başlangıçtaki 30 yapıma sıfırlar.
 */
export async function resetDemoData(): Promise<MediaItem[]> {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ITEMS));
      return INITIAL_DEMO_ITEMS;
    } catch (e) {
      console.error('sessionStorage sıfırlama hatası:', e);
    }
  }
  return INITIAL_DEMO_ITEMS;
}
