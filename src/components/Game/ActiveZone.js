// src/components/Game/ActiveZone.js
"use client";

import { useState } from 'react';
import Image from 'next/image';

// Zona ativa do tabuleiro (carta em campo)
export default function ZonaAtiva({
  card,
  position = 'player',
  onCardClick,
  isPlayerTurn = false,
  onDrop,
  onDragOver,
  onCardContextMenu
}) {
  const ehJogador = position === 'player';
  const sombraBase = '0 10px 30px -6px rgba(0,0,0,0.85)';
  const [imagemComErro, definirImagemComErro] = useState(false);
  return (
    <div className="relative">
      <div
        className={`relative w-48 h-66 rounded-2xl border-2 flex items-center justify-center transition-all ${card ? (ehJogador ? 'border-blue-500' : 'border-red-500') : 'border-dashed border-neutral-600'} ${!card && ehJogador && isPlayerTurn ? 'hover:border-green-400' : ''}`}
        style={{ background: card ? (ehJogador ? '#123047' : '#472222') : '#111a22', boxShadow: sombraBase }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={card ? onCardClick : undefined}
        onContextMenu={card ? (e => { e.preventDefault(); onCardContextMenu && onCardContextMenu(card); }) : undefined}
      >
        {!card && (
          <span className="text-[12px] text-neutral-400 font-semibold text-center px-2 leading-tight">{ehJogador && isPlayerTurn ? 'SOLTE AQUI' : 'VAZIO'}</span>
        )}
        {card && (
          <>
        {(card.imagens?.retrato || card.images?.portrait) && !imagemComErro && (
              <Image
      src={card.imagens?.retrato || card.images?.portrait}
        alt={card.nome || card.name}
                width={320}
                height={440}
                quality={100}
                className="w-full h-full object-cover rounded-2xl pointer-events-none select-none will-change-transform"
                priority={false}
                onError={() => definirImagemComErro(true)}
              />
            )}
        {(!(card.imagens?.retrato || card.images?.portrait) || imagemComErro) && (
              <Image
                src="/images/placeholder.svg"
          alt={`Placeholder de ${card.nome || card.name}`}
                width={320}
                height={440}
                className="w-full h-full object-cover rounded-2xl pointer-events-none select-none will-change-transform"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-1.5 py-1.5 flex flex-col items-center gap-1">
        <span className="text-[12px] font-semibold text-neutral-100 leading-tight truncate max-w-full">{card.nome || card.name}</span>
              <div className="flex gap-1.5 text-[10px] font-semibold text-neutral-200">
          <span className="px-1 rounded bg-neutral-900/70">⚔ {card.ataque || card.attack}</span>
          <span className="px-1 rounded bg-neutral-900/70">🛡 {card.defesa || card.defense}</span>
                <span className={`px-1 rounded ${ehJogador ? 'bg-blue-900/70 text-blue-200' : 'bg-red-900/70 text-red-200'}`}>❤️ {card.vida}</span>
              </div>
            </div>
          </>
        )}
        {/* Badge de Ultimate (desbloqueio após 3 turnos em campo) */}
        {card && (
          (() => {
            const turnos = card.onFieldTurns || 0;
            const restante = Math.max(0, 3 - turnos);
            const exibir = true; // sempre mostrar estado da ultimate do ativo
            if (!exibir) return null;
            return (
              <div className="absolute top-1 left-1">
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-sm ${restante > 0 ? 'bg-amber-900/40 border-amber-500/40 text-amber-200' : 'bg-emerald-900/40 border-emerald-500/40 text-emerald-200'}`}>
                  {restante > 0 ? `🌟 Ultimate em ${restante}` : '🌟 Ultimate pronta'}
                </div>
              </div>
            );
          })()
        )}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-bold tracking-wide text-neutral-300">ATIVO</div>
      </div>
    </div>
  );
}

