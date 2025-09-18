// src/components/Ranking/RankingModal.js
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Icon from '@/components/UI/Icon';

function CartaoDeModo({ title, iconName, subtitle, imageSrc, href, simboloRanque }) {
  const [hover, setHover] = useState(false);
  
  // Verificação de segurança para props
  if (!title || !iconName || !href) {
    return null;
  }
  
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
            ? 'shadow-[0_20px_60px_-20px_rgba(255,193,7,0.35)]'
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

        {/* moldura dourada */}
        <div className={`absolute inset-0 pointer-events-none rounded-xl z-30 ${hover ? 'ring-2 ring-yellow-400' : 'ring-1 ring-yellow-600/60 group-hover:ring-yellow-400'}`} />
        <div className="absolute -inset-1 pointer-events-none rounded-xl bg-gradient-to-b from-yellow-300/10 via-transparent to-yellow-300/0 z-10" />

        {/* conteúdo */}
        <div className="relative z-20 h-full flex flex-col justify-end p-5">
          <div className="mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            <Icon name={iconName} size={48} />
            {simboloRanque && <span className="ml-2">{simboloRanque}</span>}
          </div>
          <div className="pb-3">
            <div className="text-white font-extrabold text-2xl md:text-3xl tracking-wide">{title.toUpperCase()}</div>
            {subtitle && <div className="text-neutral-200 text-xs md:text-sm mt-1">{subtitle}</div>}
          </div>
        </div>

        {/* emblema dourado em losango (acima da moldura) */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="w-10 h-10 rotate-45 bg-yellow-500/90 border-2 border-yellow-300 shadow-lg flex items-center justify-center">
            <div className="-rotate-45">
              <Icon name={iconName} size={20} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function RankingModal({ onClose }) {
  // Verificação de segurança
  if (!onClose || typeof onClose !== 'function') {
    console.warn('RankingModal: onClose prop is required and must be a function');
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => onClose?.()}>
      <div
        className="relative bg-[#0e1a28] rounded-2xl border border-white/10 shadow-2xl w-full max-w-5xl max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/30">
          <div>
            <h2 className="text-xl font-bold tracking-wide flex items-center gap-2">
              <Icon name="trophy" size={24} />
              Ranking
            </h2>
            <p className="text-xs text-white/70">Escolha um modo e jogue</p>
          </div>
          <button
            type="button"
            className="text-white/80 hover:text-white text-2xl leading-none"
            onClick={() => onClose?.()}
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
              title="Seu Ranque"
              iconName="medal"
              subtitle="Veja sua posição atual"
              href="/ranking"
              imageSrc="/images/backgrounds/ranque-background.jpg"
              simboloRanque="🥉"
            />
            <CartaoDeModo
              title="Top Jogadores"
              iconName="calendar"
              subtitle="Melhores jogadores por pontuação"
              href="/ranking/"
              imageSrc="/images/backgrounds/semanal-background.jpg"
            />
            <CartaoDeModo
              title="Recompensas"
              iconName="gift"
              subtitle="Prêmios por ranking"
              href="/ranking/rewards"
              imageSrc="/images/backgrounds/recompensas-background.jpg"
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-white/15 hover:border-white/30 text-neutral-200 hover:text-white bg-black/30"
              onClick={() => onClose?.()}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
