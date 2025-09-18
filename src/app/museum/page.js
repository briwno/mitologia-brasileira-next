// src/app/museum/page.js
"use client";

import Link from 'next/link';
import LayoutDePagina from '../../components/UI/PageLayout';
import Image from 'next/image';
import { useState } from 'react';

function CartaoDeModo({ title, emoji, subtitle, imageSrc, href }) {
    const [hover, setHover] = useState(false);
  return (
    <Link
      href={href}
      className="block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={`group relative h-56 md:h-80 xl:h-[26rem] rounded-xl overflow-visible transition-all select-none w-full text-left ${
          hover
            ? 'shadow-[0_20px_60px_-20px_rgba(40, 71, 21, 0.35)]'
            : 'hover:shadow-[0_12px_40px_-18px_rgba(0,0,0,0.3)]'
        }`}
      >
  {/* imagem de fundo */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <Image
            src={imageSrc || '/images/placeholder.svg'}
            alt={`${title} background`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80 z-10" />
        </div>

  {/* moldura verde */}
        <div className={`absolute inset-0 pointer-events-none rounded-xl z-30 ${hover ? 'ring-2 ring-green-400' : 'ring-1 ring-green-600/60 group-hover:ring-green-400'}`} />
        <div className="absolute -inset-1 pointer-events-none rounded-xl bg-gradient-to-b from-green-300/10 via-transparent to-green-300/0 z-10" />

  {/* conteúdo */}
        <div className="relative z-20 h-full flex flex-col justify-end p-5">
          <div className="mb-4 text-4xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">{emoji}</div>
          <div className="pb-3">
            <div className="text-white font-extrabold text-2xl md:text-3xl tracking-wide">{title.toUpperCase()}</div>
            {subtitle && <div className="text-neutral-200 text-xs md:text-sm mt-1">{subtitle}</div>}
          </div>
        </div>

  {/* emblema verde em losango (acima da moldura) */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="w-10 h-10 rotate-45 bg-green-500/90 border-2 border-green-300 shadow-lg flex items-center justify-center">
            <div className="-rotate-45">{emoji}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Museum() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={href => window.location.href = '/'}>
      <div
        className="relative bg-[#0e1a28] rounded-2xl border border-white/10 shadow-2xl w-full max-w-5xl max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
  {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/30">
          <div>
            <h2 className="text-xl font-bold tracking-wide">🏛️ Museu</h2>
            <p className="text-xs text-white/70">Explore as lendas em diferentes modos</p>
          </div>
          <button
            type="button"
            className="text-white/80 hover:text-white text-2xl leading-none"
            onClick={href => window.location.href = '/'}
            aria-label="Fechar"
            title="Fechar"
          >
            ×
          </button>
        </div>

    {/* Conteúdo */}
        <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(88vh - 64px)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <CartaoDeModo
              title="Catálogo"
              emoji="🃏"
              subtitle="Todas as cartas e suas histórias"
              href="/museum/cards"
              imageSrc="/images/banners/menumuseu.png"
            />
      <CartaoDeModo
              title="Quiz Cultural"
              emoji="🧠"
              subtitle="Teste seus conhecimentos"
              href="/museum/quiz"
              imageSrc="/images/banners/museu.jpg"
            />
      <CartaoDeModo
              title="Mapa das Lendas"
              emoji="🗺️"
              subtitle="Origem geográfica dos mitos"
              href="/museum/map"
              imageSrc="/images/banners/batalha.jpg"
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-white/15 hover:border-white/30 text-neutral-200 hover:text-white bg-black/30"
              onClick={href => window.location.href = '/'}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
