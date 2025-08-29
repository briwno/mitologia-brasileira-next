// src/components/Game/CardInField.js
"use client";

import { useState, useEffect, useRef } from 'react';

// Cartão compacto em campo (mostra nome/HP e abre detalhes ao clicar)
export default function CartaEmCampo({
  card,
  position = 'player',
  bonusGlow = false,
  isActive = false,
  onClick
}) {
  const [mostrarDetalhes, definirMostrarDetalhes] = useState(false);
  const referenciaModal = useRef(null);
  const ehJogador = position === 'player';

  // Fechar modal quando clicar fora
  useEffect(() => {
    function lidarCliqueFora(evento) {
      if (referenciaModal.current && !referenciaModal.current.contains(evento.target)) {
        definirMostrarDetalhes(false);
      }
    }

    if (mostrarDetalhes) {
      document.addEventListener('mousedown', lidarCliqueFora);
    }

    return () => {
      document.removeEventListener('mousedown', lidarCliqueFora);
    };
  }, [mostrarDetalhes]);

  // Função para mostrar detalhes da carta
  const lidarCliqueNaCarta = () => {
    definirMostrarDetalhes(!mostrarDetalhes); // Sempre mostra detalhes para qualquer carta
  };

  return (
    <div
      className={`w-28 h-40 md:w-32 md:h-44 rounded-xl border-2 flex items-center justify-center text-center p-2 cursor-pointer transition-all ${ehJogador ? 'border-blue-500 bg-[#123047]' : 'border-red-500 bg-[#472222]'} hover:scale-[1.03]`}
      style={{ boxShadow: '0 8px 26px -4px rgba(0,0,0,0.8)' }}
      onClick={lidarCliqueNaCarta}
    >
      {card && (
        <div className="flex flex-col items-center text-[11px] font-semibold text-white leading-tight">
          <span className="line-clamp-3">{card.nome || card.name}</span>
          <span className="mt-1 text-[10px] font-normal opacity-80">{card.vida} HP</span>
        </div>
      )}
    </div>
  );
}
