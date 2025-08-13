// src/components/Game/GameZones.js
"use client";
import Image from 'next/image';

export default function GameZones({
  deckCount = 0,
  discardCount = 0,
  position = 'player',
  onDeckClick,
  onDiscardClick,
  topDiscardCard = null
}) {
  const isPlayer = position === 'player';
  const baseShadow = '0 14px 32px -10px rgba(0,0,0,0.85), 0 0 0 2px rgba(255,255,255,0.04) inset';

  return (
    <div className="flex flex-col items-center gap-8 select-none">
      {/* Deck with card back asset */}
      <button
        type="button"
        disabled={!isPlayer}
        onClick={isPlayer ? onDeckClick : undefined}
        className={`relative w-[4.8rem] h-[6.7rem] rounded-xl border-2 overflow-hidden transition-all active:scale-[0.97]
          ${isPlayer ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
          ${isPlayer ? 'border-sky-600' : 'border-red-600'} bg-[#0c1f2d]`}
        style={{ boxShadow: baseShadow }}
      >
        <Image src="/images/card-back.svg" alt="Deck" fill className="object-cover" />
        <div className="absolute -top-2 -right-2 bg-black/85 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-sky-200 border border-sky-600 shadow-md">
          {deckCount}
        </div>
      </button>
      {/* Discard shows last card portrait */}
      <button
        type="button"
        disabled={!isPlayer || discardCount === 0}
        onClick={isPlayer ? onDiscardClick : undefined}
        className={`relative w-[4.8rem] h-[6.7rem] rounded-xl border-2 overflow-hidden transition-all active:scale-[0.97]
          ${isPlayer ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
          ${discardCount === 0 ? 'opacity-50' : ''}
          ${isPlayer ? 'border-amber-600' : 'border-red-600'} bg-[#2d2d2d]`}
        style={{ boxShadow: baseShadow }}
      >
        {topDiscardCard && topDiscardCard.images?.portrait && (
          <Image src={topDiscardCard.images.portrait} alt={topDiscardCard.name} fill className="object-cover" />
        )}
        {!topDiscardCard && (
          <span className="text-[10px] font-semibold text-neutral-400">Vazio</span>
        )}
        <div className="absolute -top-2 -left-2 bg-black/85 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-amber-200 border border-amber-600 shadow-md">
          {discardCount}
        </div>
      </button>
    </div>
  );
}
