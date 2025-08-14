// src/components/Game/PlayerHand.js
"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function PlayerHand({
  cards = [],
  selectedCard,
  onCardSelect,
  onCardPlay,
  bonusGlow = false
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);

  const handleCardClick = (card) => {
    if (selectedCard?.id === card?.id) onCardSelect(null); else onCardSelect(card);
  };

  const handleDragStart = (e, card, index) => {
    setDraggedCard({ card, index });
    e.dataTransfer.setData('text/plain', JSON.stringify({ card, index }));
  };
  const handleDragEnd = () => setDraggedCard(null);

  const baseShadow = '0 10px 32px -6px rgba(0,0,0,0.9), 0 0 0 2px rgba(255,255,255,0.05) inset';

  return (
    <div className="relative w-full flex items-end justify-center pb-4 pt-6 pointer-events-none">
      {/* Hand container panel */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[90%] max-w-5xl h-44 bg-[#0b1622] border-2 border-[#1d3448] rounded-t-3xl" style={{ boxShadow: '0 -6px 24px -4px rgba(0,0,0,0.8), 0 0 0 2px rgba(255,255,255,0.04)' }} />
      <div className="relative flex justify-center w-full max-w-5xl px-10 pointer-events-auto" style={{ height: '10.5rem' }}>
        <div className="relative w-full h-full flex items-end justify-center">
          {cards.map((card, index) => {
            if (!card) return null;
            const isSelected = selectedCard?.id === card.id;
            const isHovered = hoveredIndex === index;
            const isDragged = draggedCard?.index === index;
            // Fan distribution calculation (- (n-1)/2 .. +(n-1)/2)
            const centerOffset = index - (cards.length - 1) / 2;
            const translateX = centerOffset * 48; // wider spacing for more negative space
            const rotation = centerOffset * 2.5; // degrees
            return (
              <div
                key={`${card.id}-${index}`}
                className={`absolute origin-bottom transition-all duration-200 cursor-pointer select-none ${isSelected ? 'z-50' : ''} ${isHovered && !isSelected ? 'z-40' : ''}`}
                style={{
                  transform: `translateX(${translateX}px) rotate(${rotation}deg) ${isSelected ? 'translateY(-28px)' : isHovered ? 'translateY(-18px)' : ''}`,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleCardClick(card, index)}
                draggable
                onDragStart={(e) => handleDragStart(e, card, index)}
                onDragEnd={handleDragEnd}
              >
                <div
                  className={`group relative w-20 h-32 rounded-lg border-2 overflow-hidden flex items-center justify-center ${isSelected ? 'border-yellow-400' : 'border-neutral-600 hover:border-neutral-400'} ${isDragged ? 'opacity-50' : ''} ${bonusGlow ? 'ring-2 ring-green-400' : ''}`}
                  style={{ background: '#0e2333', boxShadow: baseShadow }}
                  title={card.name}
                >
                  {/* Imagem da carta (portrait) */}
                  {card.images?.portrait && (
                    <Image
                      src={card.images.portrait}
                      alt={card.name}
                      width={240} // higher intrinsic resolution for sharper downscale
                      height={360}
                      quality={100}
                      className="w-full h-full object-cover select-none pointer-events-none will-change-transform"
                      priority={false}
                    />
                  )}
                  {/* Fallback */}
                  {!card.images?.portrait && (
                    <Image
                      src="/images/placeholder.svg"
                      alt={`Placeholder de ${card.name}`}
                      width={240}
                      height={360}
                      className="w-full h-full object-cover select-none pointer-events-none will-change-transform"
                    />
                  )}
                  {/* Nome overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-[2px] px-1 pb-1 pt-0.5 text-[9px] leading-tight font-medium text-neutral-100 text-center space-y-0.5">
                    <div className="truncate">{card.name}</div>
                    <div className="flex justify-center gap-1 text-[8px] font-semibold">
                      <span className="px-1 rounded bg-neutral-900/70">⚔ {card.attack}</span>
                      <span className="px-1 rounded bg-neutral-900/70">🛡 {card.defense}</span>
                      <span className="px-1 rounded bg-blue-900/70 text-blue-200">❤️ {card.health}</span>
                    </div>
                  </div>
                  {/* Custo */}
                  <div className="absolute top-0 right-0 bg-neutral-900/80 rounded-bl px-1 py-0.5 text-[10px] font-bold text-blue-300 tracking-wide shadow-lg">
                    {card.manaCost || card.cost || 0}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {cards.length === 0 && (
        <div className="absolute bottom-6 text-neutral-500 text-sm font-medium">Mão vazia</div>
      )}
    </div>
  );
}
