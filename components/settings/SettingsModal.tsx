'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Unlock, Database, KeyRound, CheckCircle2, RotateCcw, Info } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGate: () => void;
  onResetData: () => Promise<void>;
  totalItemsCount: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenGate,
  onResetData,
  totalItemsCount,
}) => {
  const { isAuthenticated, lockSession } = useAuth();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl shadow-black/80"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <X size={18} strokeWidth={1.75} />
          </button>

          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 mb-4">
            <Lock size={18} strokeWidth={1.75} className="text-amber-400" />
            Demo Ayarları & Hafıza
          </h3>

          <div className="space-y-4">
            {/* Session Status Box */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-400">Oturum Durumu</span>
                {isAuthenticated ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 size={12} strokeWidth={1.75} />
                    Misafir Oturumu Aktif
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
                    <Lock size={12} strokeWidth={1.75} />
                    Kilitli
                  </span>
                )}
              </div>

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    lockSession();
                    onClose();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-900/40 bg-red-950/20 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-950/40 transition active:scale-95"
                >
                  <Lock size={14} strokeWidth={1.75} />
                  <span>Oturumu Kilitle (PIN Ekranına Dön)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGate();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition active:scale-95"
                >
                  <Unlock size={14} strokeWidth={1.75} />
                  <span>Demoya Giriş Yap</span>
                </button>
              )}
            </div>

            {/* Storage Info */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Database size={13} strokeWidth={1.75} /> Veri Deposu:
                </span>
                <span className="font-semibold text-emerald-400">
                  Oturum Belleği (sessionStorage)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <KeyRound size={13} strokeWidth={1.75} /> Mevcut Arşiv:
                </span>
                <span className="font-semibold text-zinc-200">{totalItemsCount} yapım</span>
              </div>

              {/* Reset to 30 items button */}
              <button
                type="button"
                onClick={async () => {
                  await onResetData();
                  onClose();
                }}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-850/80 py-2 text-xs font-medium text-zinc-200 hover:border-amber-500/50 hover:text-amber-400 transition active:scale-95"
              >
                <RotateCcw size={13} strokeWidth={1.75} className="text-amber-400" />
                <span>Başlangıç Havuzuna Sıfırla (30 Yapım)</span>
              </button>
            </div>

            {/* Quick Helper Info */}
            <div className="flex gap-2.5 rounded-2xl border border-zinc-850 bg-zinc-900/30 p-3 text-[11px] text-zinc-400">
              <Info size={16} strokeWidth={1.75} className="flex-shrink-0 text-amber-400 mt-0.5" />
              <p className="leading-relaxed">
                Bu sürümde veritabanı kirliliği oluşmaz. Ziyaretçilerin eklediği, puanladığı veya sildiği içerikler yalnızca kendi tarayıcı oturumunda saklanır ve sekme kapatıldığında otomatik temizlenir.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
