'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isGateOpen: boolean;
  openGate: () => void;
  closeGate: () => void;
  verifyPin: (pin: string) => Promise<boolean>;
  loginAsGuest: () => void;
  lockSession: () => void;
}

const SESSION_AUTH_KEY = 'sinefes_demo_session_auth_v1';

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  isGateOpen: false,
  openGate: () => {},
  closeGate: () => {},
  verifyPin: async () => false,
  loginAsGuest: () => {},
  lockSession: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGateOpen, setIsGateOpen] = useState<boolean>(false);

  // Oturum durumunu sadece geçerli sekmenin sessionStorage'ından oku
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const authFlag = sessionStorage.getItem(SESSION_AUTH_KEY);
        if (authFlag === 'true') {
          setIsAuthenticated(true);
        }
      }
    } catch {
      // sessionStorage erişilemezse varsayılan false kalır
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openGate = () => setIsGateOpen(true);
  const closeGate = () => setIsGateOpen(false);

  // Tek tıkla engellemesiz misafir girişi
  const loginAsGuest = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
      }
    } catch {}
    setIsAuthenticated(true);
    setIsGateOpen(false);
  };

  // PIN doğrulaması (123456 veya sunucu doğrulaması)
  const verifyPin = async (enteredPin: string): Promise<boolean> => {
    const trimmed = enteredPin.trim();

    // 1. Doğrudan Demo PIN kontrolü
    if (trimmed === '123456') {
      loginAsGuest();
      return true;
    }

    // 2. API rotası fallback kontrolü
    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: trimmed }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        loginAsGuest();
        return true;
      }
    } catch {
      // API hatası
    }

    return false;
  };

  // Oturumu kilitle / kapat
  const lockSession = () => {
    setIsAuthenticated(false);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(SESSION_AUTH_KEY);
      }
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        isGateOpen,
        openGate,
        closeGate,
        verifyPin,
        loginAsGuest,
        lockSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
