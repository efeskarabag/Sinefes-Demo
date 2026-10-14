'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { SinefesLogo } from '@/components/common/SinefesLogo';

interface SecurityGateModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  isDismissible?: boolean;
}

export const SecurityGateModal: React.FC<SecurityGateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isDismissible = false,
}) => {
  const { verifyPin, loginAsGuest } = useAuth();
  const [pin, setPin] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGuestEntry = () => {
    loginAsGuest();
    if (onSuccess) onSuccess();
    if (onClose) onClose();
  };

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin.trim() || isChecking) return;

    setIsChecking(true);
    setErrorMessage(null);

    const success = await verifyPin(pin.trim());

    setIsChecking(false);
    if (success) {
      setPin('');
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } else {
      setIsShaking(true);
      setErrorMessage('Geçersiz Güvenlik PIN Kodu! (Demo için "110795" kullanabilirsiniz)');
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
        inputRef.current?.focus();
      }, 600);
    }
  };

  const handleNumpadPress = (val: string | number) => {
    if (val === 'C') {
      setPin('');
      setErrorMessage(null);
      inputRef.current?.focus();
    } else if (val === 'enter') {
      handleFormSubmit();
    } else {
      if (pin.length < 8) {
        const next = pin + val.toString();
        setPin(next);
        setErrorMessage(null);
        if (next.length === 6) {
          verifyPin(next).then(ok => {
            if (ok) {
              setPin('');
              if (onSuccess) onSuccess();
              if (onClose) onClose();
            }
          });
        }
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b] select-none">
        {/* Radial Background Glow matching site's orange & black theme */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.15) 0%, rgba(234, 88, 12, 0.05) 45%, #09090b 80%)',
          }}
        />

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{
            opacity: 1,
            y: 0,
            x: isShaking ? [-12, 12, -8, 8, -4, 4, 0] : 0,
          }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35 }}
          className="relative w-full max-w-[400px] rounded-3xl border border-zinc-800/80 bg-[#0e0e11]/95 p-6 sm:p-7 backdrop-blur-2xl shadow-2xl shadow-black/90 text-center"
        >
          {/* Optional close button */}
          {isDismissible && onClose && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-white transition-colors"
              aria-label="Kapat"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          )}

          {/* Header & App Logo */}
          <div className="mb-5 flex flex-col items-center">
            <SinefesLogo size={52} />

            <div className="mt-3.5 flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-wider text-zinc-100 font-sans">
                Sinefes
              </h2>
              <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                Canlı Demo
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-400 max-w-[280px] leading-relaxed">
              Kişisel film ve dizi takip arşivini hemen canlı keşfedin.
            </p>
          </div>

          {/* TEK TIKLA MISAFIR GIRISI BUTONU */}
          <button
            type="button"
            onClick={handleGuestEntry}
            className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 py-3 px-4 font-bold text-xs text-zinc-950 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-200 mb-4"
          >
            <Sparkles size={16} strokeWidth={2} className="text-zinc-950 animate-pulse" />
            <span className="text-sm font-extrabold tracking-wide">
              ✨ Canlı Demoya Gir (Misafir Girişi)
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <span className="relative bg-[#0e0e11] px-3 text-[11px] font-medium text-zinc-500">
              veya PIN ile girin (Varsayılan: 110795)
            </span>
          </div>

          {/* PIN Form */}
          <form onSubmit={handleFormSubmit} className="w-full">
            <div className="relative mb-2.5 flex items-center">
              <input
                ref={inputRef}
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                maxLength={8}
                value={pin}
                onChange={e => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setPin(cleaned);
                  setErrorMessage(null);
                }}
                placeholder="••••••"
                className={`w-full rounded-xl border bg-black/60 py-3 pl-4 pr-12 text-center font-mono text-2xl tracking-[10px] text-white placeholder-zinc-700 outline-none transition-all ${
                  errorMessage
                    ? 'border-red-500/80 shadow-[0_0_16px_rgba(239,68,68,0.3)]'
                    : 'border-zinc-800 focus:border-amber-500 focus:shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                }`}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isChecking || !pin.trim()}
                className={`absolute right-2.5 flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                  pin.length >= 4
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 hover:from-amber-400 hover:to-orange-400 font-bold active:scale-95 shadow-md shadow-amber-500/25'
                    : 'bg-white/5 text-zinc-600 cursor-not-allowed'
                }`}
                title="Giriş Yap"
              >
                <ArrowRight size={18} strokeWidth={2} />
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-3 flex items-center justify-center gap-1.5 text-xs font-medium text-red-400 animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={14} strokeWidth={1.75} />
                <span>{errorMessage}</span>
              </div>
            )}
          </form>

          {/* Touch Numpad */}
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'enter'].map(btn => (
              <button
                key={btn}
                type="button"
                onClick={() => handleNumpadPress(btn)}
                disabled={isChecking}
                className={`flex h-11 items-center justify-center rounded-xl border font-mono transition-all active:scale-95 ${
                  btn === 'enter'
                    ? 'border-amber-500/50 bg-amber-500/15 text-amber-400 font-semibold text-xs hover:bg-amber-500/25 shadow-sm shadow-amber-500/15'
                    : btn === 'C'
                    ? 'border-zinc-800/80 bg-zinc-900/50 text-zinc-400 font-semibold text-xs hover:text-white hover:border-zinc-700'
                    : 'border-zinc-800/80 bg-zinc-900/60 text-lg font-medium text-zinc-200 hover:border-amber-500/30 hover:bg-zinc-800/80'
                }`}
              >
                {btn === 'enter' ? 'GİRİŞ' : btn}
              </button>
            ))}
          </div>

          <p className="mt-4 text-[10px] text-zinc-500 leading-relaxed">
            🔒 Bu oturum tarayıcı sekmenize özeldir (sessionStorage). Sekmeyi kapattığınızda tüm veriler sıfırlanır.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
