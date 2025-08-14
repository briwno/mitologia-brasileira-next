// src/app/page.js
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../hooks/useAuth';

function ModeCard({ href, title, emoji, available = true, subtitle, highlight = false, imageSrc }) {
  const [imgError, setImgError] = useState(false);
  const content = (
    <div
      className={`relative h-80 md:h-[26rem] rounded-2xl border-2 overflow-hidden transition-all select-none
        ${available ? (highlight ? 'border-cyan-300 shadow-[0_20px_60px_-20px_rgba(0,255,255,0.35)]' : 'border-neutral-600 hover:border-cyan-400') : 'border-neutral-700 opacity-70 grayscale'}
        bg-gradient-to-b from-black/60 to-black/30 backdrop-blur-sm`}
    >
      {/* Background image (placeholder by default) */}
      <Image
        src={!imageSrc || imgError ? '/images/placeholder.svg' : imageSrc}
        alt={`${title} banner`}
        fill
  className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.03] group-hover:brightness-110 group-hover:saturate-150 group-hover:contrast-110"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        priority={highlight}
        onError={() => setImgError(true)}
      />
      {/* Overlay & decorative frame */}
      <div className="absolute inset-0 pointer-events-none">
  <div className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/20" />
  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.35),transparent_60%)] mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_55%)]" />
        {highlight && <div className="absolute inset-0 animate-pulse bg-cyan-200/5" />}
      </div>
      <div className="absolute top-4 right-4 text-2xl">{emoji}</div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 border-t border-white/10 p-4">
        <div className={`text-center font-extrabold ${available ? 'text-white' : 'text-neutral-400'} text-xl md:text-2xl tracking-wide`}>{title}</div>
        {subtitle && <div className="text-center text-neutral-300 text-xs md:text-sm mt-1">{subtitle}</div>}
        {!available && (
          <div className="text-center text-red-300/90 text-xs md:text-sm mt-1">Requer Nível 20</div>
        )}
      </div>
      {highlight && (
        <div className="absolute inset-x-0 -bottom-3 mx-auto w-11/12 h-1 rounded-full bg-cyan-400/30 blur" />
      )}
    </div>
  );

  return available ? (
    <Link href={href} className="block group transform transition will-change-transform hover:scale-[1.01]">{content}</Link>
  ) : (
    <div className="cursor-not-allowed">{content}</div>
  );
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => setIsLoaded(true), []);
  const { user, isAuthenticated, logout } = useAuth();

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
        {/* Top bar */}
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
            {/* Minimal login/logout */}
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

        {/* Center title banner */}
        <div className="mt-6 flex items-center justify-center">
          <div className="px-6 py-2 rounded-xl border border-white/15 bg-gradient-to-b from-black/50 to-black/30 backdrop-blur-sm shadow-[0_12px_40px_-18px_rgba(0,0,0,0.9)]">
            <div className="text-xs md:text-sm tracking-widest text-cyan-200 text-center">JOGAR</div>
            <div className="flex items-center justify-center">
              <Image
                src="/images/logo.svg"
                alt="Ka'aguy logo"
                width={170}
                height={50}
                className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
                priority
              />
            </div>
            <div className="mt-1 text-[11px] md:text-sm text-neutral-300 text-center italic">Adentre a Ka&#39;aguy. Se for capaz.</div>
          </div>
        </div>

        {/* Tall cards row */}
        <div className="mx-auto mt-6 max-w-7xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ModeCard href="/pvp" title="BATALHA" emoji="⚔️" subtitle="Duelar contra outros jogadores" imageSrc="/images/banners/menubatalha.png" />
            <ModeCard href="/museum" title="MUSEU" emoji="🏛️" subtitle="Explore as lendas" imageSrc="/images/banners/menumuseu.png" />
            <ModeCard href="/ranking" title="RANKING" emoji="🏆" subtitle="Top jogadores" />
            <ModeCard href="/profile" title="PERFIL" emoji="👤" subtitle="Suas conquistas" />
          </div>
        </div>

        {/* Bottom compact actions */}
        <div className="mx-auto mt-6 max-w-5xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/museum" className="group">
              <div className="relative rounded-xl border border-emerald-500/30 bg-black/40 p-4 backdrop-blur-sm hover:border-emerald-400/60 transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-2xl">🎴</div>
                  <div className="flex-1">
                    <div className="font-bold">SUAS CARTAS</div>
                    <div className="text-emerald-200 text-sm">47/60 cartas coletadas</div>
                  </div>
                  <div className="text-emerald-300 text-2xl group-hover:translate-x-1 transition-transform">→</div>
                </div>
              </div>
            </Link>
            <Link href="/shop" className="group">
              <div className="relative rounded-xl border border-pink-500/30 bg-black/40 p-4 backdrop-blur-sm hover:border-pink-400/60 transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-2xl">🛒</div>
                  <div className="flex-1">
                    <div className="font-bold">LOJA</div>
                    <div className="text-pink-200 text-sm">Pacotes e ofertas especiais</div>
                  </div>
                  <div className="text-pink-300 text-2xl group-hover:translate-x-1 transition-transform">→</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile tab bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-white/10 px-4 py-2">
          <div className="flex justify-around items-center">
            <button className="flex flex-col items-center gap-1 p-2 text-cyan-300">
              <span className="text-xl">🏠</span>
              <span className="text-xs font-medium">Início</span>
            </button>
            <Link href="/pvp" className="flex flex-col items-center gap-1 p-2 text-gray-300">
              <span className="text-xl">⚔️</span>
              <span className="text-xs font-medium">Batalha</span>
            </Link>
            <Link href="/museum" className="flex flex-col items-center gap-1 p-2 text-gray-300">
              <span className="text-xl">🏛️</span>
              <span className="text-xs font-medium">Museu</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-1 p-2 text-gray-300">
              <span className="text-xl">👤</span>
              <span className="text-xs font-medium">Perfil</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}