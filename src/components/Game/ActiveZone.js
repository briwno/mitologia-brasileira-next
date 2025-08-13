// src/components/Game/ActiveZone.js
"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function ActiveZone({
  card,
  position = 'player',
  onCardClick,
  isPlayerTurn = false,
  onDrop,
  onDragOver,
  onCardContextMenu
}) {
  const isPlayer = position === 'player';
  const baseShadow = '0 10px 30px -6px rgba(0,0,0,0.85)';
  return (
    <div className="relative">
      <div
        className={`relative w-40 h-56 rounded-2xl border-2 flex items-center justify-center transition-all ${card ? (isPlayer ? 'border-blue-500' : 'border-red-500') : 'border-dashed border-neutral-600'} ${!card && isPlayer && isPlayerTurn ? 'hover:border-green-400' : ''}`}
        style={{ background: card ? (isPlayer ? '#123047' : '#472222') : '#111a22', boxShadow: baseShadow }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={card ? onCardClick : undefined}
        onContextMenu={card ? (e => { e.preventDefault(); onCardContextMenu && onCardContextMenu(card); }) : undefined}
      >
        {!card && (
          <span className="text-[12px] text-neutral-400 font-semibold text-center px-2 leading-tight">{isPlayer && isPlayerTurn ? 'SOLTE AQUI' : 'VAZIO'}</span>
        )}
        {card && (
          <>
            {card.images?.portrait && (
              <Image
                src={card.images.portrait}
                alt={card.name}
                width={320}
                height={440}
                quality={100}
                className="w-full h-full object-cover rounded-2xl pointer-events-none select-none will-change-transform"
                priority={false}
              />
            )}
            {!card.images?.portrait && (
              <span className="text-[12px] font-bold text-white leading-tight line-clamp-3 px-2 text-center">
                {card.name}
              </span>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-1.5 py-1.5 flex flex-col items-center gap-1">
              <span className="text-[12px] font-semibold text-neutral-100 leading-tight truncate max-w-full">{card.name}</span>
              <div className="flex gap-1.5 text-[10px] font-semibold text-neutral-200">
                <span className="px-1 rounded bg-neutral-900/70">⚔ {card.attack}</span>
                <span className="px-1 rounded bg-neutral-900/70">🛡 {card.defense}</span>
                <span className={`px-1 rounded ${isPlayer ? 'bg-blue-900/70 text-blue-200' : 'bg-red-900/70 text-red-200'}`}>❤️ {card.health}</span>
              </div>
            </div>
          </>
        )}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-bold tracking-wide text-neutral-300">ATIVO</div>
      </div>
    </div>
  );
}
