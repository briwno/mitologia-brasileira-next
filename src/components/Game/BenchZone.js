// src/components/Game/BenchZone.js
"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function BenchZone({
  cards = [],
  position = 'player',
  onCardClick,
  maxSlots = 5,
  canSeeHidden = false,
  flipIndices = new Set(),
  onCardContextMenu,
  highlightSelectable = false
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [errorIndices, setErrorIndices] = useState(new Set());
  const isPlayer = position === 'player';
  const slots = Array(maxSlots).fill(null).map((_, idx) => cards[idx] || null);
  const baseShadow = '0 10px 26px -6px rgba(0,0,0,0.85)';

  return (
    <div className="relative flex flex-col items-center">
  <div className="mb-2 text-[11px] font-bold tracking-wide text-neutral-400">BANCO</div>
  <div className="flex gap-7 justify-center items-center">
        {slots.map((card, index) => (
          <div
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => card && onCardClick && onCardClick(card, index)}
            onContextMenu={card ? (e => { e.preventDefault(); onCardContextMenu && onCardContextMenu(card, index); }) : undefined}
            className={`relative w-24 h-32 rounded-xl border-2 overflow-hidden flex items-center justify-center text-center text-[12px] font-semibold transition-all cursor-pointer ${card ? (isPlayer ? 'border-blue-500 bg-[#123047]' : 'border-red-500 bg-[#472222]') : 'border-dashed border-neutral-600 bg-[#101b25]'} ${hoveredIndex === index ? 'scale-105' : ''}`}
            style={{ boxShadow: card ? baseShadow : 'none', perspective: '800px' }}
          >
            {card ? (
              <div
                className="absolute inset-0 [transform-style:preserve-3d] transition-transform duration-500"
                style={{ transform: flipIndices.has(index) ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
              >
                {/* front */}
                <div className="absolute inset-0 backface-hidden">
                  {(canSeeHidden || card.foiRevelada) ? (
                    <>
                      {card.images?.portrait && !errorIndices.has(index) ? (
                        <Image
                          src={card.images.portrait}
                          alt={card.name}
                          width={200}
                          height={280}
                          quality={95}
                          className="w-full h-full object-cover pointer-events-none select-none will-change-transform"
                          onError={() => setErrorIndices(prev => {
                            const next = new Set(Array.from(prev));
                            next.add(index);
                            return next;
                          })}
                        />
                      ) : (
                        <Image
                          src="/images/placeholder.svg"
                          alt={`Placeholder de ${card.name}`}
                          width={200}
                          height={280}
                          quality={95}
                          className="w-full h-full object-cover pointer-events-none select-none will-change-transform"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/65 px-1.5 py-1 flex flex-col items-center backdrop-blur-sm space-y-0.5">
                        <span className="text-[11px] font-medium text-neutral-100 truncate w-full leading-tight">{card.name}</span>
                        <div className="flex gap-1.5 text-[10px] font-semibold text-neutral-200">
                          <span className="px-1 rounded bg-neutral-900/70">⚔ {card.attack}</span>
                          <span className="px-1 rounded bg-neutral-900/70">🛡 {card.defense}</span>
                          <span className={`px-1 rounded ${isPlayer ? 'bg-blue-900/70 text-blue-200' : 'bg-red-900/70 text-red-200'}`}>❤️ {card.health}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    // back visible when not revealed and viewer cannot see hidden
                    <Image
                      src="/images/card-back.svg"
                      alt="Card back"
                      width={240}
                      height={320}
                      quality={95}
                      className="w-full h-full object-cover pointer-events-none select-none will-change-transform"
                    />
                  )}
                </div>
                {/* back (for flip effect)*/}
                <div className="absolute inset-0 rotate-y-180 backface-hidden">
                  <Image
                    src="/images/card-back.svg"
                    alt="Card back"
                    width={200}
                    height={280}
                    quality={95}
                    className="w-full h-full object-cover pointer-events-none select-none will-change-transform"
                  />
                </div>
              </div>
            ) : (
              <span className="text-[11px] text-neutral-500 font-medium">VAZIO</span>
            )}
            {highlightSelectable && card && (
              <div className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-emerald-400/80 animate-pulse" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
