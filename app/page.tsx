'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  CheckCircle2,
  X,
  Film,
  Tv,
  ArrowUpDown,
  Filter,
  LogOut,
  SlidersHorizontal,
  Layers,
  Check,
} from 'lucide-react';
import { CollectionGroup, MediaItem, MediaStatus, MediaType, SortOption } from '@/lib/types';
import { STATUS_CONFIG, SORT_OPTIONS } from '@/lib/constants';
import {
  getMediaItems,
  saveMediaItem,
  saveMultipleMediaItems,
  updateMediaItem,
  deleteMediaItem,
  resetDemoData,
} from '@/lib/mediaStore';
import confetti from 'canvas-confetti';
import { useAuth } from '@/lib/authContext';
import { PosterCard } from '@/components/media/PosterCard';
import { CollectionStackCard } from '@/components/media/CollectionStackCard';
import { MediaDetailBottomSheet } from '@/components/media/MediaDetailBottomSheet';
import { CollectionDetailSheet } from '@/components/media/CollectionDetailSheet';
import { SearchSheet } from '@/components/search/SearchSheet';
import { SecurityGateModal } from '@/components/gate/SecurityGateModal';
import { BottomNav, NavTab } from '@/components/navigation/BottomNav';
import { StatusIcon, SeriesIcon } from '@/components/media/MediaIcons';
import { SinefesLogo } from '@/components/common/SinefesLogo';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { groupMediaItemsIntoFeed } from '@/lib/collections';

export default function Home() {
  const { isAuthenticated, isLoading: isAuthLoading, lockSession, openGate } = useAuth();

  // Data states
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter & Nav states
  const [activeTab, setActiveTab] = useState<NavTab>('movies');
  const [activeStatus, setActiveStatus] = useState<MediaStatus | 'all'>('all');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('created_desc');
  const [isSortModalOpen, setIsSortModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [localSearch, setLocalSearch] = useState<string>('');
  const [isLocalSearchActive, setIsLocalSearchActive] = useState<boolean>(false);
  const [groupBySeries, setGroupBySeries] = useState<boolean>(true);

  // Modals & Sheets
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<CollectionGroup | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isCollectionSheetOpen, setIsCollectionSheetOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Toast feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  // Sıralama veya ayar modalı açıkken arka plan kaymasını engelle
  useEffect(() => {
    if (!isSortModalOpen && !isSettingsOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSortModalOpen(false);
        setIsSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [isSortModalOpen, isSettingsOpen]);

  // Sıralama ve seri gruplama tercihini oturum hafızasından yükle
  useEffect(() => {
    try {
      const savedSort = sessionStorage.getItem('sinefes_demo_sort_option') as SortOption | null;
      if (savedSort && SORT_OPTIONS.some(o => o.id === savedSort)) {
        setSortOption(savedSort);
      }
      const savedGroupBySeries = sessionStorage.getItem('sinefes_demo_group_by_series');
      if (savedGroupBySeries !== null) {
        setGroupBySeries(savedGroupBySeries === 'true');
      }
    } catch {}
  }, []);

  // Durum filtresi ve aktif sekme tercihini oturum hafızasından yükle
  useEffect(() => {
    try {
      const savedTab = sessionStorage.getItem('sinefes_demo_active_tab') as NavTab | null;
      const targetTab: NavTab = savedTab === 'movies' || savedTab === 'tv' ? savedTab : 'movies';
      if (savedTab && (savedTab === 'movies' || savedTab === 'tv')) {
        setActiveTab(targetTab);
      }

      const savedStatus = (sessionStorage.getItem(`sinefes_demo_status_${targetTab}`) ||
        sessionStorage.getItem('sinefes_demo_status_filter')) as (MediaStatus | 'all') | null;

      if (
        savedStatus &&
        (savedStatus === 'all' ||
          savedStatus === 'watchlist' ||
          savedStatus === 'watched' ||
          savedStatus === 'waiting_season')
      ) {
        if (targetTab === 'movies' && savedStatus === 'waiting_season') {
          setActiveStatus('all');
        } else {
          setActiveStatus(savedStatus);
        }
      }
    } catch {}
  }, []);

  const handleSelectSort = (optId: SortOption) => {
    setSortOption(optId);
    setIsSortModalOpen(false);
    try {
      sessionStorage.setItem('sinefes_demo_sort_option', optId);
    } catch {}
  };

  const handleSelectStatus = (status: MediaStatus | 'all') => {
    setActiveStatus(status);
    try {
      sessionStorage.setItem(`sinefes_demo_status_${activeTab}`, status);
      sessionStorage.setItem('sinefes_demo_status_filter', status);
    } catch {}
  };

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    setLocalSearch('');
    setSelectedGenres([]);

    try {
      sessionStorage.setItem('sinefes_demo_active_tab', tab);
      const savedForTab = (sessionStorage.getItem(`sinefes_demo_status_${tab}`) ||
        sessionStorage.getItem('sinefes_demo_status_filter')) as (MediaStatus | 'all') | null;

      if (
        savedForTab &&
        (savedForTab === 'all' ||
          savedForTab === 'watchlist' ||
          savedForTab === 'watched' ||
          savedForTab === 'waiting_season')
      ) {
        if (tab === 'movies' && savedForTab === 'waiting_season') {
          setActiveStatus('all');
        } else {
          setActiveStatus(savedForTab);
        }
      } else {
        if (tab === 'movies' && activeStatus === 'waiting_season') {
          setActiveStatus('all');
        }
      }
    } catch {
      if (tab === 'movies' && activeStatus === 'waiting_season') {
        setActiveStatus('all');
      }
    }
  };

  // Oturum açıldığında verileri yükle
  useEffect(() => {
    if (isAuthenticated) {
      let isMounted = true;
      getMediaItems().then(data => {
        if (isMounted) {
          setItems(data);
          setIsLoading(false);
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [isAuthenticated]);

  // Dinamik tür listesi
  const availableGenres = useMemo(() => {
    const currentMediaType: MediaType = activeTab === 'movies' ? 'movie' : 'tv';
    const forTab = items.filter(i => i.media_type === currentMediaType);
    const genreSet = new Set<string>();

    forTab.forEach(item => {
      if (item.genres) {
        item.genres.split(',').forEach(g => {
          const trimmed = g.trim();
          if (trimmed) genreSet.add(trimmed);
        });
      }
    });

    return Array.from(genreSet).sort();
  }, [items, activeTab]);

  // Filtreleme & Sıralama
  const filteredAndSortedItems = useMemo(() => {
    const currentMediaType: MediaType = activeTab === 'movies' ? 'movie' : 'tv';

    // 1. Filtreleme
    const filtered = items.filter(item => {
      if (item.media_type !== currentMediaType) return false;

      if (activeStatus !== 'all' && item.status !== activeStatus) return false;

      if (selectedGenres.length > 0) {
        if (!item.genres) return false;
        const itemGenresLower = item.genres.toLowerCase();
        const hasAllSelected = selectedGenres.every(g =>
          itemGenresLower.includes(g.toLowerCase())
        );
        if (!hasAllSelected) return false;
      }

      if (localSearch.trim()) {
        const q = localSearch.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesNote = item.personal_note?.toLowerCase().includes(q);
        const matchesYear = item.release_year?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesNote && !matchesYear) return false;
      }

      return true;
    });

    // 2. Sıralama
    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'created_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'created_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title_asc':
          return (a.title || '').localeCompare(b.title || '', 'tr', { sensitivity: 'base' });
        case 'title_desc':
          return (b.title || '').localeCompare(a.title || '', 'tr', { sensitivity: 'base' });
        case 'imdb_desc':
          return (b.imdb_rating || 0) - (a.imdb_rating || 0);
        case 'imdb_asc':
          return (a.imdb_rating || 0) - (b.imdb_rating || 0);
        case 'year_desc':
          return parseInt(b.release_year || '0', 10) - parseInt(a.release_year || '0', 10);
        case 'year_asc':
          return parseInt(a.release_year || '0', 10) - parseInt(b.release_year || '0', 10);
        case 'rating_desc':
          return (b.custom_rating || 0) - (a.custom_rating || 0);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [items, activeTab, activeStatus, selectedGenres, sortOption, localSearch]);

  const existingTmdbIds = useMemo(() => {
    return new Set(items.map(i => i.tmdb_id));
  }, [items]);

  // Akıllı Seri Yığınları (Collection Stacks)
  const feedItems = useMemo(() => {
    return groupMediaItemsIntoFeed(
      filteredAndSortedItems,
      activeTab === 'movies' && groupBySeries
    );
  }, [filteredAndSortedItems, activeTab, groupBySeries]);

  // Handlers
  const handleOpenDetail = (item: MediaItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleOpenCollection = (collection: CollectionGroup) => {
    setSelectedCollection(collection);
    setIsCollectionSheetOpen(true);
  };

  const handleUpdateItem = async (id: string, updates: Partial<MediaItem>) => {
    const success = await updateMediaItem(id, updates);
    if (success) {
      setItems(prev =>
        prev.map(i => (i.id === id ? { ...i, ...updates } : i))
      );
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(prev => (prev ? { ...prev, ...updates } : null));
      }
      showToast('Değişiklikler kaydedildi.');
    }
  };

  const handleDeleteItem = async (id: string) => {
    const success = await deleteMediaItem(id);
    if (success) {
      setItems(prev => prev.filter(i => i.id !== id));
      if (selectedItem?.id === id) {
        setIsDetailOpen(false);
      }
      showToast('Yapım arşivden kaldırıldı.');
    }
  };

  const handleAddItem = async (newItemData: Omit<MediaItem, 'id' | 'created_at'>) => {
    const created = await saveMediaItem(newItemData);
    setItems(prev => [created, ...prev.filter(i => i.tmdb_id !== created.tmdb_id)]);
    showToast(`"${created.title}" arşive eklendi.`);
  };

  const handleBatchAddItems = async (
    newItemsData: Array<Omit<MediaItem, 'id' | 'created_at'>>,
    seriesName?: string
  ) => {
    if (newItemsData.length === 0) return;
    const createdItems = await saveMultipleMediaItems(newItemsData);
    if (createdItems.length > 0) {
      const newTmdbIds = new Set(createdItems.map(i => i.tmdb_id));
      setItems(prev => [...createdItems, ...prev.filter(i => !newTmdbIds.has(i.tmdb_id))]);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff', '#10b981'],
        });
      } catch {}
      showToast(
        seriesName
          ? `"${seriesName}" serisinden ${createdItems.length} film izleme listene eklendi!`
          : `${createdItems.length} film izleme listene eklendi!`
      );
    }
  };

  const handleResetData = async () => {
    const fresh = await resetDemoData();
    setItems(fresh);
    showToast('Demo başlangıç verileri geri yüklendi.');
  };

  // Sekmeye göre durumlar (Filmlerde sezon yok)
  const visibleStatuses: MediaStatus[] = useMemo(() => {
    if (activeTab === 'movies') {
      return ['watchlist', 'watched'];
    }
    return ['watchlist', 'watched', 'waiting_season'];
  }, [activeTab]);

  // Durum sayaçları
  const statusCounts = useMemo(() => {
    const currentMediaType: MediaType = activeTab === 'movies' ? 'movie' : 'tv';
    const forTab = items.filter(i => i.media_type === currentMediaType);

    return {
      all: forTab.length,
      watchlist: forTab.filter(i => i.status === 'watchlist').length,
      watched: forTab.filter(i => i.status === 'watched').length,
      waiting_season: forTab.filter(i => i.status === 'waiting_season').length,
    };
  }, [items, activeTab]);

  // 1. Session Initializing
  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="animate-pulse">
          <SinefesLogo size={56} />
        </div>
      </main>
    );
  }

  // 2. Demo Gate (Misafir Girişi + PIN)
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <SecurityGateModal
          isOpen={true}
          isDismissible={false}
          onSuccess={() => {
            getMediaItems().then(data => {
              setItems(data);
              setIsLoading(false);
            });
            showToast('Canlı demoya hoş geldiniz!');
          }}
        />
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] text-zinc-100 pb-28 md:pb-24 selection:bg-amber-500 selection:text-black">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-4 z-50 flex justify-center pointer-events-none">
          <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-zinc-900/95 px-4 py-2 text-xs font-semibold text-amber-300 shadow-xl backdrop-blur-md animate-fade-in">
            <CheckCircle2 size={14} strokeWidth={1.5} className="text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-850/80 bg-zinc-950/80 px-4 sm:px-6 lg:px-8 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between min-h-[38px]">
          {isLocalSearchActive ? (
            /* In-place Arama */
            <div className="flex w-full items-center gap-2 animate-in fade-in duration-200">
              <div className="relative flex-1 flex items-center">
                <Search size={14} strokeWidth={1.5} className="absolute left-3 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={e => setLocalSearch(e.target.value)}
                  placeholder={`${activeTab === 'movies' ? 'Filmlerim' : 'Dizilerim'} içinde ara...`}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/95 py-1.5 pl-9 pr-8 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none"
                  autoFocus
                />
                {localSearch && (
                  <button
                    type="button"
                    onClick={() => setLocalSearch('')}
                    className="absolute right-2.5 text-zinc-400 hover:text-zinc-200"
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsLocalSearchActive(false);
                  setLocalSearch('');
                }}
                className="px-2.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-amber-400 transition"
              >
                Kapat
              </button>
            </div>
          ) : (
            /* Standart Header */
            <>
              {/* Logo & Brand */}
              <SinefesLogo size={36} showText={true} />

              {/* Quick Header Actions */}
              <div className="flex items-center gap-2">
                {/* Desktop Tabs */}
                <div className="hidden md:flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 mr-2">
                  <button
                    type="button"
                    onClick={() => handleSelectTab('movies')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      activeTab === 'movies'
                        ? 'bg-amber-500 text-zinc-950 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Film size={14} strokeWidth={1.5} />
                    <span>Filmler</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTab('tv')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      activeTab === 'tv'
                        ? 'bg-amber-500 text-zinc-950 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Tv size={14} strokeWidth={1.5} />
                    <span>Diziler</span>
                  </button>
                </div>

                {/* Arşivde Filtrele Arama Butonu */}
                <button
                  type="button"
                  onClick={() => setIsLocalSearchActive(true)}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition ${
                    localSearch ? 'border-amber-500/50 bg-amber-500/15 text-amber-400' : ''
                  }`}
                  title="Arşivde Filtrele"
                >
                  <Search size={15} strokeWidth={1.5} />
                </button>

                {/* Demo Ayarları / Hafıza Butonu */}
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-amber-400 hover:border-zinc-700 transition"
                  title="Demo Ayarları & Hafıza"
                >
                  <SlidersHorizontal size={14} strokeWidth={1.5} />
                </button>

                {/* Oturumu Kilitle Butonu */}
                <button
                  type="button"
                  onClick={lockSession}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-red-400 hover:border-zinc-700 hover:bg-zinc-800 transition-colors"
                  title="Oturumu Kilitle"
                  aria-label="Kilitle"
                >
                  <LogOut size={14} strokeWidth={1.5} />
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 pt-4">
        {/* Status Filter Tabs (Sakin, zıplama yapmayan, sabit genişlikli segment bar) */}
        <div className="flex items-center gap-1 p-1 rounded-2xl border border-zinc-850 bg-zinc-950/80 shadow-inner w-full mb-3">
          {/* Tümü (All) */}
          <button
            type="button"
            onClick={() => handleSelectStatus('all')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl py-2 px-1 sm:px-2.5 transition-colors duration-150 active:opacity-85 ${
              activeStatus === 'all'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
            title="Tümü"
          >
            <Layers size={13} strokeWidth={1.75} className="flex-shrink-0" />
            <span className="text-xs font-bold truncate">Tümü</span>
            <span
              className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-mono leading-none ${
                activeStatus === 'all' ? 'bg-zinc-950/20 text-zinc-950 font-bold' : 'bg-zinc-850 text-zinc-400'
              }`}
            >
              {statusCounts.all}
            </span>
          </button>

          {/* Sekmeye göre filtrelenen durumlar */}
          {visibleStatuses.map(statusKey => {
            const conf = STATUS_CONFIG[statusKey];
            const isSelected = activeStatus === statusKey;
            const count = statusCounts[statusKey];

            return (
              <button
                key={statusKey}
                type="button"
                onClick={() => handleSelectStatus(statusKey)}
                className={`flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl py-2 px-1 sm:px-2.5 transition-colors duration-150 active:opacity-85 ${
                  isSelected
                    ? `${
                        statusKey === 'watchlist'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/15'
                          : statusKey === 'watched'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/15'
                          : 'bg-purple-500/15 text-purple-400 border border-purple-500/40 shadow-sm shadow-purple-500/15'
                      } font-semibold`
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                }`}
                title={conf.label}
              >
                <span className="flex-shrink-0">
                  <StatusIcon
                    status={statusKey}
                    size={13}
                    strokeWidth={1.75}
                    className={isSelected ? 'text-current' : 'text-zinc-400'}
                  />
                </span>

                <span className="text-xs font-semibold truncate">
                  {statusKey === 'watched' ? (
                    <>
                      İzlendi<span className="hidden md:inline">&nbsp;/ Bitti</span>
                    </>
                  ) : statusKey === 'waiting_season' ? (
                    <>
                      Yeni Sezon<span className="hidden md:inline">&nbsp;Bekleniyor</span>
                    </>
                  ) : (
                    conf.label
                  )}
                </span>

                <span
                  className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-mono leading-none ${
                    isSelected ? 'bg-current/15 text-current font-bold' : 'bg-zinc-850 text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Türler (Genre) & Sıralama Barı */}
        <div className="flex items-center justify-between gap-2 my-2.5">
          {/* Sol: Tür Çipleri */}
          {availableGenres.length > 0 ? (
            <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1 pl-0.5 pr-0.5 flex-shrink-0">
                <Filter size={11} strokeWidth={1.5} />
              </span>
              <button
                type="button"
                onClick={() => setSelectedGenres([])}
                className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium border transition ${
                  selectedGenres.length === 0
                    ? 'border-zinc-600 bg-zinc-800 text-zinc-100 font-semibold'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Hepsi
              </button>
              {availableGenres.map(genre => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => {
                      setSelectedGenres(prev =>
                        prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
                      );
                    }}
                    className={`flex-shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium border transition active:opacity-75 ${
                      isSelected
                        ? 'border-amber-500/50 bg-amber-500/20 text-amber-300 font-semibold shadow-sm shadow-amber-500/10'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>{genre}</span>
                    {isSelected && <Check size={11} strokeWidth={2} className="text-amber-400" />}
                  </button>
                );
              })}
              {selectedGenres.length > 1 && (
                <span className="text-[10px] text-amber-400/80 font-medium pl-1 flex-shrink-0">
                  ({selectedGenres.length} kesişim)
                </span>
              )}
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <span className="text-xs text-zinc-400 font-medium">
                {activeTab === 'movies' ? 'Filmler' : 'Diziler'}
              </span>
            </div>
          )}

          {/* Sağ: Seri Gruplama & Sıralama Butonları */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {activeTab === 'movies' && (
              <button
                type="button"
                onClick={() => {
                  setGroupBySeries(prev => {
                    const next = !prev;
                    try {
                      sessionStorage.setItem('sinefes_demo_group_by_series', String(next));
                    } catch {}
                    return next;
                  });
                }}
                className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[11px] font-semibold transition active:opacity-80 shadow-sm ${
                  groupBySeries
                    ? 'border-amber-500/50 bg-amber-500/20 text-amber-300 shadow-amber-500/10'
                    : 'border-zinc-800 bg-zinc-900/90 text-zinc-400 hover:text-zinc-200'
                }`}
                title={groupBySeries ? 'Seri gruplamasını kapat' : 'Serileri birleştir'}
              >
                <SeriesIcon size={13} className={groupBySeries ? 'text-amber-400' : 'text-zinc-500'} />
                <span>Seriler</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsSortModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:border-amber-500/50 hover:text-amber-400 transition-colors shadow-sm"
            >
              <ArrowUpDown size={12} strokeWidth={1.5} className="text-amber-400" />
              <span className="hidden sm:inline">
                {SORT_OPTIONS.find(o => o.id === sortOption)?.label.split('(')[0].trim() || 'Sırala'}
              </span>
              <span className="sm:hidden">Sırala</span>
            </button>
          </div>
        </div>

        {/* Poster Izgarası (Mobilde 2, Tablette 3-4, Masaüstünde 5-6 Kolon) */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 pt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div
                key={i}
                className="aspect-[2/3] w-full animate-pulse rounded-2xl bg-zinc-900/80 border border-zinc-800/50"
              />
            ))}
          </div>
        ) : feedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 text-zinc-600">
              {activeTab === 'movies' ? (
                <Film size={26} strokeWidth={1.5} />
              ) : (
                <Tv size={26} strokeWidth={1.5} />
              )}
            </div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-1">
              Bu filtreye uygun yapım bulunamadı
            </h3>
            <p className="text-xs text-zinc-500 max-w-xs mb-4">
              {selectedGenres.length > 0
                ? `Seçilen türlere (${selectedGenres.join(', ')}) uygun içerik bulunamadı.`
                : localSearch
                ? `"${localSearch}" aramasına uygun içerik bulunamadı.`
                : 'Arşivinize film veya dizi ekleyerek başlayabilirsiniz.'}
            </p>
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition active:opacity-85 shadow-md shadow-amber-500/20"
            >
              <Plus size={15} strokeWidth={1.75} />
              <span>Film & Dizi Ekle</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 pt-1">
            {feedItems.map(feedItem =>
              feedItem.type === 'collection' ? (
                <CollectionStackCard
                  key={feedItem.collection.id}
                  collection={feedItem.collection}
                  onClick={handleOpenCollection}
                />
              ) : (
                <PosterCard
                  key={feedItem.item.id}
                  item={feedItem.item}
                  onClick={handleOpenDetail}
                />
              )
            )}
          </div>
        )}
      </main>

      {/* Sıralama Seçim Modal */}
      {isSortModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 cursor-pointer select-none"
          onClick={() => setIsSortModalOpen(false)}
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl z-10 animate-in slide-in-from-bottom-4 cursor-default select-text"
          >
            <div className="flex items-center justify-between mb-3.5">
              <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <ArrowUpDown size={15} strokeWidth={1.5} className="text-amber-400" />
                Sıralama Seçenekleri
              </h4>
              <button
                onClick={() => setIsSortModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>
            <div className="space-y-1.5">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectSort(opt.id)}
                  className={`flex w-full items-center justify-between rounded-xl p-3 text-xs font-medium border transition ${
                    sortOption === opt.id
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 font-semibold'
                      : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortOption === opt.id && (
                    <CheckCircle2 size={15} strokeWidth={1.5} className="text-amber-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating / Bottom Navigation Bar */}
      <BottomNav
        currentTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Detay Paneli (Masaüstünde Modal, Mobilde Bottom Sheet) */}
      <MediaDetailBottomSheet
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
        }}
        onUpdate={handleUpdateItem}
        onDelete={handleDeleteItem}
        archiveItems={items}
        onAddMultiple={handleBatchAddItems}
      />

      {/* Seri / Koleksiyon Detay Paneli */}
      <CollectionDetailSheet
        collection={selectedCollection}
        isOpen={isCollectionSheetOpen}
        onClose={() => {
          setIsCollectionSheetOpen(false);
        }}
        onSelectMovie={movie => {
          setSelectedItem(movie);
          setIsDetailOpen(true);
        }}
        archiveItems={items}
        onAddMultiple={handleBatchAddItems}
        onAddSingle={handleAddItem}
      />

      {/* Canlı TMDB Arama ve Ekleme Paneli */}
      <SearchSheet
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onAdd={handleAddItem}
        existingTmdbIds={existingTmdbIds}
      />

      {/* Demo Ayarları & Hafıza Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenGate={openGate}
        onResetData={handleResetData}
        totalItemsCount={items.length}
      />
    </div>
  );
}
