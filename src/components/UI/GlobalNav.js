// src/components/UI/GlobalNav.js
"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import Icon from '@/components/UI/Icon';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Carrega o modal de PvP de forma dinâmica (sem SSR) com fallback de carregamento
const PvPModal = dynamic(() => import('@/components/PvP/PvPModal'), { ssr: false, loading: () => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
    <LoadingSpinner text="Abrindo Batalha..." />
  </div>
) });
// Carrega o modal do Museu de forma dinâmica (sem SSR) com fallback de carregamento
const MuseumModal = dynamic(() => import('@/components/Museum/MuseumModal'), { ssr: false, loading: () => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
    <LoadingSpinner text="Abrindo Museu..." />
  </div>
) });

// Navegação global (mobile + desktop)
export default function NavegacaoGlobal() {
  const pathname = usePathname();
  const [carregado, setCarregado] = useState(false);
  const [mostrarModalPvP, definirMostrarModalPvP] = useState(false);
  const [mostrarModalMuseu, definirMostrarModalMuseu] = useState(false);

  useEffect(() => {
    setCarregado(true);
  }, []);

  // Oculta a navegação na tela de sala de jogo (durante a partida)
  if (pathname?.startsWith('/pvp/game')) {
    return null;
  }

  if (pathname?.startsWith('/divulgar')) {
    return null;
  }

  return (
    <>
      {/* Barra de abas inferior (mobile) - visível em todas as páginas */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-white/10 px-4 py-2 z-50">
        <div className="flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center gap-1 p-2 text-cyan-300">
            <Icon name="home" size={20} />
            <span className="text-xs font-medium">Início</span>
          </Link>
          <button onClick={() => definirMostrarModalPvP(true)} className="flex flex-col items-center gap-1 p-2 text-gray-300">
            <Icon name="battle" size={20} />
            <span className="text-xs font-medium">Batalha</span>
          </button>
          <button onClick={() => definirMostrarModalMuseu(true)} className="flex flex-col items-center gap-1 p-2 text-gray-300">
            <Icon name="museum" size={20} />
            <span className="text-xs font-medium">Museu</span>
          </button>
          <Link href="/profile" className="flex flex-col items-center gap-1 p-2 text-gray-300">
            <Icon name="profile" size={20} />
            <span className="text-xs font-medium">Perfil</span>
          </Link>
        </div>
      </div>

      {/* Navegação flutuante (desktop) */}
      <div className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/70 backdrop-blur-md border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <Link href="/" className="px-3 py-1.5 rounded-lg text-sm text-white/90 hover:text-white hover:bg-white/10">Início</Link>
          <button onClick={() => definirMostrarModalPvP(true)} className="px-3 py-1.5 rounded-lg text-sm text-white/90 hover:text-white hover:bg-white/10">Batalha</button>
      <button onClick={() => definirMostrarModalMuseu(true)} className="px-3 py-1.5 rounded-lg text-sm text-white/90 hover:text-white hover:bg-white/10">Museu</button>
          <Link href="/ranking" className="px-3 py-1.5 rounded-lg text-sm text-white/90 hover:text-white hover:bg-white/10">Ranking</Link>
          <Link href="/profile" className="px-3 py-1.5 rounded-lg text-sm text-white/90 hover:text-white hover:bg-white/10">Perfil</Link>
        </div>
      </div>

      {/* Modais - Renderizados apenas após carregamento completo */}
      {carregado && mostrarModalPvP && <PvPModal onClose={() => definirMostrarModalPvP(false)} />}
      {carregado && mostrarModalMuseu && <MuseumModal onClose={() => definirMostrarModalMuseu(false)} />}
    </>
  );
}
