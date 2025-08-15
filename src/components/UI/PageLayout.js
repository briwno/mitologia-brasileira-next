"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function PageLayout({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  useEffect(() => setIsLoaded(true), []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a1420] via-[#0b1d2e] to-[#07131f] text-white">
      {/* Ambient backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-cyan-900/20 via-transparent to-transparent blur-2xl" />
        <div className="absolute inset-y-0 right-0 w-64 bg-gradient-to-l from-emerald-900/20 via-transparent to-transparent blur-2xl" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(120,119,198,0.25)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(74,222,128,0.25)_0%,transparent_50%)]" />
        </div>
      </div>

      <div className={`relative z-10 min-h-screen transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Top bar (shared) */}
        <div className="flex items-center justify-between px-6 pt-4">
          <div className="flex items-center gap-3">
            {/* Brand badge with logo */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm" title="Adentre a Ka&#39;aguy. Se for capaz.">
              <span className="text-lg">🌿</span>
              <Image
                src="/images/logo.svg"
                alt="Ka'aguy"
                width={90}
                height={24}
                className="opacity-90"
                priority
                onClick={() => window.location.href = '/'}
              />
            </div>
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">BR</div>
              <div className="hidden sm:block">
                <div className="text-white font-bold text-sm">{user?.username || 'Convidado'}</div>
                <div className="text-cyan-300 text-xs">{isAuthenticated() ? 'Conectado' : 'Não conectado'}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 hover:border-white/30 transition flex items-center justify-center">⚙️</button>
            <button className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 hover:border-white/30 transition flex items-center justify-center">📜</button>
            {isAuthenticated() ? (
              <button
                onClick={logout}
                title="Sair"
                className="px-3 h-10 rounded-lg bg-black/40 border border-green-400/30 hover:border-green-400/60 text-green-300 text-sm font-semibold"
              >
                Sair
              </button>
            ) : (
              <Link
                href="/login"
                title="Entrar"
                className="px-3 h-10 inline-flex items-center rounded-lg bg-black/40 border border-cyan-400/30 hover:border-cyan-400/60 text-cyan-300 text-sm font-semibold"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>

        {/* Page content */}
        {children}
      </div>
    </main>
  );
}
