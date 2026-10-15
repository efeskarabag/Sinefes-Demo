import { INITIAL_DEMO_ITEMS } from './constants';
import { MediaItem } from './types';

const STORAGE_KEY = 'sinefes_demo_media_items_v3';

/**
 * Oturuma özel medya listesini getirir.
 * İlk defa açıldığında başlangıç havuzu ile sessionStorage'ı başlatır.
 */
export async function getMediaItems(): Promise<MediaItem[]> {
  if (typeof window !== 'undefined') {
    try {
      const sessionData = sessionStorage.getItem(STORAGE_KEY);
      if (sessionData) {
        return JSON.parse(sessionData) as MediaItem[];
      }
      // İlk ziyaretçi oturumu: zengin havuzla başlat
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
 * Oturum hafızasına birden fazla yapımı topluca ekler (Örn: Bir film serisinin eksik filmleri).
 */
export async function saveMultipleMediaItems(
  items: Array<Omit<MediaItem, 'id' | 'created_at'>>
): Promise<MediaItem[]> {
  const newItems: MediaItem[] = items.map((item, index) => ({
    ...item,
    id: typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `item-${Date.now()}-${index}`,
    created_at: new Date().toISOString(),
  }));

  if (typeof window !== 'undefined') {
    try {
      const existing = await getMediaItems();
      const newTmdbIds = new Set(newItems.map(i => i.tmdb_id));
      const filteredExisting = existing.filter(i => !newTmdbIds.has(i.tmdb_id));
      const updated = [...newItems, ...filteredExisting];
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('sessionStorage toplu kaydetme hatası:', e);
    }
  }

  return newItems;
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
 * Demo verilerini başlangıç havuzuna sıfırlar.
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
