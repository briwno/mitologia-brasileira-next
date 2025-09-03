// src/components/Game/PlayerHand.js
"use client";

import { useState } from 'react';
import Image from 'next/image';
import Icon from '@/components/UI/Icon';

// Mão em leque com arrastar/soltar
export default function MaoDoJogador({
  cards = [],
  selectedCard,
  onCardSelect,
  onCardPlay,
  bonusGlow = false,
  onCardContextMenu
}) {
  const [indiceEmHover, definirIndiceEmHover] = useState(null);
  const [cartaArrastada, definirCartaArrastada] = useState(null);

  const lidarCliqueCarta = (card) => {
  if (card?.isDead) return; // cartas derrotadas não podem ser usadas
    if (selectedCard?.id === card?.id) onCardSelect(null);
    else onCardSelect(card);
  };

  const iniciarArrasto = (e, card, index) => {
    definirCartaArrastada({ card, index });
    e.dataTransfer.setData('text/plain', JSON.stringify({ card, index }));
  };
  const finalizarArrasto = () => definirCartaArrastada(null);

  const sombraBase = '0 10px 32px -6px rgba(0,0,0,0.9), 0 0 0 2px rgba(255,255,255,0.05) inset';

  const isSmall = typeof window !== 'undefined' && window.innerWidth < 768;
  const spacing = isSmall ? 36 : 48;
  const liftHover = isSmall ? 14 : 22;
  const liftSelected = isSmall ? 22 : 34;

  return (
  <div className="relative w-full flex items-end justify-center pb-5 pt-7 pointer-events-none z-20">
      {/* Painel da mão */}
  <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[92%] max-w-6xl h-48 bg-[#0b1622] border-2 border-[#1d3448] rounded-t-3xl" style={{ boxShadow: '0 -6px 24px -4px rgba(0,0,0,0.8), 0 0 0 2px rgba(255,255,255,0.04)' }} />
  <div className="relative flex justify-center w-full max-w-6xl px-10 pointer-events-auto" style={{ height: '11.5rem' }}>
        <div className="relative w-full h-full flex items-end justify-center">
          {cards.map((card, index) => {
            if (!card) return null;
            const estaSelecionada = selectedCard?.id === card.id;
            const estaHover = indiceEmHover === index;
            const estaArrastando = cartaArrastada?.index === index;
            // Distribuição em leque (- (n-1)/2 .. +(n-1)/2)
            const deslocamentoCentral = index - (cards.length - 1) / 2;
    const translateX = deslocamentoCentral * spacing; // espaçamento responsivo
    const rotation = deslocamentoCentral * 2.2; // leve ajuste
            return (
              <div
                key={`${card.id}-${index}`}
                className={`absolute origin-bottom transition-all duration-200 cursor-pointer select-none ${estaSelecionada ? 'z-50' : ''} ${estaHover && !estaSelecionada ? 'z-40' : ''}`}
                style={{
      transform: `translateX(${translateX}px) rotate(${rotation}deg) ${estaSelecionada ? `translateY(-${liftSelected}px)` : estaHover ? `translateY(-${liftHover}px)` : ''}`,
                }}
                onMouseEnter={() => definirIndiceEmHover(index)}
                onMouseLeave={() => definirIndiceEmHover(null)}
                onClick={() => lidarCliqueCarta(card, index)}
                draggable={!card.isDead}
                onDragStart={(e) => { if (card.isDead) { e.preventDefault(); return; } iniciarArrasto(e, card, index); }}
                onDragEnd={finalizarArrasto}
                onContextMenu={(e) => { e.preventDefault(); onCardContextMenu?.(card); }}
              >
                <div
                  className={`group relative w-24 h-36 rounded-lg border-2 overflow-hidden flex items-center justify-center ${estaSelecionada ? 'border-yellow-400' : 'border-neutral-600 hover:border-neutral-400'} ${estaArrastando ? 'opacity-50' : ''} ${bonusGlow ? 'ring-2 ring-green-400' : ''} ${card.isDead ? 'grayscale opacity-60 cursor-not-allowed' : ''}`}
                  style={{ background: '#0e2333', boxShadow: sombraBase }}
                  title={card.nome || card.name}
                >
                  {/* Imagem da carta (portrait) */}
                  {(card.imagens?.retrato || card.images?.portrait) && (
                    <Image
                      src={card.imagens?.retrato || card.images?.portrait}
                      alt={card.nome || card.name}
                      width={300} // resolução intrínseca maior para downscale mais nítido
                      height={450}
                      quality={100}
                      className="w-full h-full object-cover select-none pointer-events-none will-change-transform"
                      priority={false}
                    />
                  )}
                  {/* Fallback */}
                  {!(card.imagens?.retrato || card.images?.portrait) && (
                    <Image
                      src="/images/placeholder.svg"
                      alt={`Placeholder de ${card.nome || card.name}`}
                      width={240}
                      height={360}
                      className="w-full h-full object-cover select-none pointer-events-none will-change-transform"
                    />
                  )}
                  {/* Nome overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-[2px] px-1.5 pb-1 pt-0.5 text-[10px] leading-tight font-medium text-neutral-100 text-center space-y-0.5">
                    <div className="truncate">{card.nome || card.name}</div>
                    <div className="flex justify-center gap-1 text-[9px] font-semibold">
                      <span className="px-1 rounded bg-neutral-900/70 flex items-center gap-1">
                        <Icon name="battle" size={8} />
                        {card.ataque || card.attack}
                      </span>
                      <span className="px-1 rounded bg-neutral-900/70 flex items-center gap-1">
                        <Icon name="shield" size={8} />
                        {card.defesa || card.defense}
                      </span>
                      <span className="px-1 rounded bg-blue-900/70 text-blue-200 flex items-center gap-1">
                        <Icon name="heart" size={8} />
                        {card.vida}
                      </span>
                    </div>
                  </div>
                  {/* Marca de X para derrotadas */}
                  {card.isDead && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-4xl font-black text-red-500/70 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] select-none">
                        <Icon name="disabled" size={48} />
                      </div>
                    </div>
                  )}
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
