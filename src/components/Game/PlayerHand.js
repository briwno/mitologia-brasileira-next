// src/components/Game/PlayerHand.js
"use client";

import { useState } from 'react';
import Image from 'next/image';

// Mão em leque com arrastar/soltar
export default function MaoDoJogador({
  cards = [],
  selectedCard,
  onCardSelect,
  onCardPlay,
  bonusGlow = false
}) {
  const [indiceEmHover, definirIndiceEmHover] = useState(null);
  const [cartaArrastada, definirCartaArrastada] = useState(null);

  const lidarCliqueCarta = (card) => {
    if (selectedCard?.id === card?.id) onCardSelect(null);
    else onCardSelect(card);
  };

  const iniciarArrasto = (e, card, index) => {
    definirCartaArrastada({ card, index });
    e.dataTransfer.setData('text/plain', JSON.stringify({ card, index }));
  };
  const finalizarArrasto = () => definirCartaArrastada(null);

  const sombraBase = '0 10px 32px -6px rgba(0,0,0,0.9), 0 0 0 2px rgba(255,255,255,0.05) inset';

  return (
    <div className="relative w-full flex items-end justify-center pb-4 pt-6 pointer-events-none">
      {/* Painel da mão */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[90%] max-w-5xl h-44 bg-[#0b1622] border-2 border-[#1d3448] rounded-t-3xl" style={{ boxShadow: '0 -6px 24px -4px rgba(0,0,0,0.8), 0 0 0 2px rgba(255,255,255,0.04)' }} />
      <div className="relative flex justify-center w-full max-w-5xl px-10 pointer-events-auto" style={{ height: '10.5rem' }}>
        <div className="relative w-full h-full flex items-end justify-center">
          {cards.map((card, index) => {
            if (!card) return null;
            const estaSelecionada = selectedCard?.id === card.id;
            const estaHover = indiceEmHover === index;
            const estaArrastando = cartaArrastada?.index === index;
            // Distribuição em leque (- (n-1)/2 .. +(n-1)/2)
            const deslocamentoCentral = index - (cards.length - 1) / 2;
            const translateX = deslocamentoCentral * 48; // espaçamento mais largo
            const rotation = deslocamentoCentral * 2.5; // graus
            return (
              <div
                key={`${card.id}-${index}`}
                className={`absolute origin-bottom transition-all duration-200 cursor-pointer select-none ${estaSelecionada ? 'z-50' : ''} ${estaHover && !estaSelecionada ? 'z-40' : ''}`}
                style={{
                  transform: `translateX(${translateX}px) rotate(${rotation}deg) ${estaSelecionada ? 'translateY(-28px)' : estaHover ? 'translateY(-18px)' : ''}`,
                }}
                onMouseEnter={() => definirIndiceEmHover(index)}
                onMouseLeave={() => definirIndiceEmHover(null)}
                onClick={() => lidarCliqueCarta(card, index)}
                draggable
                onDragStart={(e) => iniciarArrasto(e, card, index)}
                onDragEnd={finalizarArrasto}
              >
                <div
                  className={`group relative w-20 h-32 rounded-lg border-2 overflow-hidden flex items-center justify-center ${estaSelecionada ? 'border-yellow-400' : 'border-neutral-600 hover:border-neutral-400'} ${estaArrastando ? 'opacity-50' : ''} ${bonusGlow ? 'ring-2 ring-green-400' : ''}`}
                  style={{ background: '#0e2333', boxShadow: sombraBase }}
                  title={card.name}
                >
                  {/* Imagem da carta (portrait) */}
                  {card.images?.portrait && (
                    <Image
                      src={card.images.portrait}
                      alt={card.name}
                      width={240} // resolução intrínseca maior para downscale mais nítido
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
                  {/* Sem custo por carta: custos estão nas habilidades */}
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
