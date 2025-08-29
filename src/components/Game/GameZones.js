// src/components/Game/GameZones.js
"use client";
import Image from 'next/image';

// Zonas de interação: compra (deck) e descarte
export default function ZonasDoJogo({
  deckCount = 0,
  discardCount = 0,
  position = 'player',
  onDeckClick,
  onDiscardClick,
  topDiscardCard = null,
}) {
  const ehJogador = position === 'player';
  const sombraBase = '0 14px 32px -10px rgba(0,0,0,0.85), 0 0 0 2px rgba(255,255,255,0.04) inset';

  return (
    <div className="flex flex-col items-center gap-8 select-none">
      {/* Deck com verso de carta */}
      <button
        type="button"
        disabled={!ehJogador}
        onClick={ehJogador ? onDeckClick : undefined}
        className={`relative w-[4.8rem] h-[6.7rem] rounded-xl border-2 overflow-hidden transition-all active:scale-[0.97]
          ${ehJogador ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
          ${ehJogador ? 'border-sky-600' : 'border-red-600'} bg-[#0c1f2d]`}
        style={{ boxShadow: sombraBase }}
      >
        <Image src="/images/card-back.svg" alt="Deck" fill className="object-cover" />
        <div className="absolute -top-2 -right-2 bg-black/85 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-sky-200 border border-sky-600 shadow-md">
          {deckCount}
        </div>
      </button>
      {/* Descarte mostra a última carta */}
      <button
        type="button"
        disabled={!ehJogador || discardCount === 0}
        onClick={ehJogador ? onDiscardClick : undefined}
        className={`relative w-[4.8rem] h-[6.7rem] rounded-xl border-2 overflow-hidden transition-all active:scale-[0.97]
          ${ehJogador ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
          ${discardCount === 0 ? 'opacity-50' : ''}
          ${ehJogador ? 'border-amber-600' : 'border-red-600'} bg-[#2d2d2d]`}
        style={{ boxShadow: sombraBase }}
      >
        {topDiscardCard && (topDiscardCard.imagens?.retrato || topDiscardCard.images?.portrait) && (
          <Image src={topDiscardCard.imagens?.retrato || topDiscardCard.images?.portrait} alt={topDiscardCard.nome || topDiscardCard.name} fill className="object-cover" />
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
