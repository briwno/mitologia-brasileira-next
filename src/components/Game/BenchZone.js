// src/components/Game/BenchZone.js
"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function BenchZone({
  cards = [],
  position = 'player',
  onCardClick,
  maxSlots = 5
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const isPlayer = position === 'player';
  const slots = Array(maxSlots).fill(null).map((_, idx) => cards[idx] || null);
  const baseShadow = '0 8px 22px -4px rgba(0,0,0,0.85)';

  return (
    <div className="relative flex flex-col items-center">
      <div className="mb-2 text-[10px] font-bold tracking-wide text-neutral-400">BANCO</div>
      <div className="flex gap-6 justify-center items-center">
        {slots.map((card, index) => (
          <div
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => card && onCardClick && onCardClick(card, index)}
            className={`relative w-20 h-28 rounded-lg border-2 overflow-hidden flex items-center justify-center text-center text-[11px] font-semibold transition-all cursor-pointer ${card ? (isPlayer ? 'border-blue-500 bg-[#123047]' : 'border-red-500 bg-[#472222]') : 'border-dashed border-neutral-600 bg-[#101b25]'} ${hoveredIndex === index ? 'scale-105' : ''}`}
            style={{ boxShadow: card ? baseShadow : 'none' }}
          >
            {card ? (
              <>
                {card.images?.portrait && (
                  <Image
                    src={card.images.portrait}
                    alt={card.name}
                    width={200}
                    height={280}
                    quality={95}
                    className="w-full h-full object-cover pointer-events-none select-none will-change-transform"
                  />
                )}
                {!card.images?.portrait && (
                  <span className="line-clamp-3 leading-tight text-white px-1">
                    {card.name}
                  </span>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/65 px-1 py-0.5 flex flex-col items-center backdrop-blur-sm space-y-0.5">
                  <span className="text-[10px] font-medium text-neutral-100 truncate w-full leading-tight">{card.name}</span>
                  <div className="flex gap-1 text-[9px] font-semibold text-neutral-200">
                    <span className="px-1 rounded bg-neutral-900/70">⚔ {card.attack}</span>
                    <span className="px-1 rounded bg-neutral-900/70">🛡 {card.defense}</span>
                    <span className={`px-1 rounded ${isPlayer ? 'bg-blue-900/70 text-blue-200' : 'bg-red-900/70 text-red-200'}`}>❤️ {card.health}</span>
                  </div>
                </div>
              </>
            ) : (
              <span className="text-[10px] text-neutral-500 font-medium">VAZIO</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
