// src/components/Game/CardInField.js
"use client";

import { useState, useEffect, useRef } from 'react';

export default function CardInField({
  card,
  position = 'player',
  bonusGlow = false,
  isActive = false,
  onClick
}) {
  const [showDetails, setShowDetails] = useState(false);
  const modalRef = useRef(null);
  const isPlayer = position === "player";

  // Fechar modal quando clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowDetails(false);
      }
    }

    if (showDetails) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDetails]);

  // Função para mostrar detalhes da carta
  const handleCardClick = () => {
    setShowDetails(!showDetails); // Sempre mostra detalhes para qualquer carta
  };

  return (
    <div
      className={`w-28 h-40 md:w-32 md:h-44 rounded-xl border-2 flex items-center justify-center text-center p-2 cursor-pointer transition-all ${isPlayer ? 'border-blue-500 bg-[#123047]' : 'border-red-500 bg-[#472222]'} hover:scale-[1.03]`}
      style={{ boxShadow: '0 8px 26px -4px rgba(0,0,0,0.8)' }}
      onClick={handleCardClick}
    >
      {card && (
        <div className="flex flex-col items-center text-[11px] font-semibold text-white leading-tight">
          <span className="line-clamp-3">{card.name}</span>
          <span className="mt-1 text-[10px] font-normal opacity-80">{card.health} HP</span>
        </div>
      )}
    </div>
  );
}
