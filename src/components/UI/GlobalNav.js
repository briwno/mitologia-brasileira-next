// src/components/UI/GlobalNav.js
"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const PvPModal = dynamic(() => import('@/components/PvP/PvPModal'), { ssr: false });
const MuseumModal = dynamic(() => import('@/components/Museum/MuseumModal'), { ssr: false });

export default function GlobalNav() {
  const pathname = usePathname();
  const [showPvPModal, setShowPvPModal] = useState(false);
  const [showMuseumModal, setShowMuseumModal] = useState(false);

  // Hide nav on the in-match game room screen
  if (pathname?.startsWith('/pvp/game')) {
    return null;
  }

  return (
    <>
      {/* Mobile bottom tab bar - visible on all pages */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-white/10 px-4 py-2 z-50">
        <div className="flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center gap-1 p-2 text-cyan-300">
            <span className="text-xl">🏠</span>
            <span className="text-xs font-medium">Início</span>
          </Link>
          <button onClick={() => setShowPvPModal(true)} className="flex flex-col items-center gap-1 p-2 text-gray-300">
            <span className="text-xl">⚔️</span>
            <span className="text-xs font-medium">Batalha</span>
          </button>
          <button onClick={() => setShowMuseumModal(true)} className="flex flex-col items-center gap-1 p-2 text-gray-300">
            <span className="text-xl">🏛️</span>
            <span className="text-xs font-medium">Museu</span>
          </button>
          <Link href="/profile" className="flex flex-col items-center gap-1 p-2 text-gray-300">
            <span className="text-xl">👤</span>
            <span className="text-xs font-medium">Perfil</span>
          </Link>
        </div>
      </div>

      {/* Desktop floating nav */}
      <div className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/70 backdrop-blur-md border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <Link href="/" className="px-3 py-1.5 rounded-lg text-sm text-white/90 hover:text-white hover:bg-white/10">Início</Link>
          <button onClick={() => setShowPvPModal(true)} className="px-3 py-1.5 rounded-lg text-sm text-white/90 hover:text-white hover:bg-white/10">Batalha</button>
          <button onClick={() => setShowMuseumModal(true)} className="px-3 py-1.5 rounded-lg text-sm text-white/90 hover:text-white hover:bg-white/10">Museu</button>
          <Link href="/ranking" className="px-3 py-1.5 rounded-lg text-sm text-white/90 hover:text-white hover:bg-white/10">Ranking</Link>
          <Link href="/profile" className="px-3 py-1.5 rounded-lg text-sm text-white/90 hover:text-white hover:bg-white/10">Perfil</Link>
        </div>
      </div>

      {showPvPModal && <PvPModal onClose={() => setShowPvPModal(false)} />}
      {showMuseumModal && <MuseumModal onClose={() => setShowMuseumModal(false)} />}
    </>
  );
}
