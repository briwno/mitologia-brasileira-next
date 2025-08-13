// src/components/Game/Hand.js
"use client";

import { useState, useRef, useEffect } from 'react';
import CardImage from '../Card/CardImage';

export default function Hand({ 
  cards = [], 
  selectedCard, 
  onCardSelect, 
  onCardPlay,
  bonusGlow = false,
  newCardIndex = -1 
}) {
  const [showDetails, setShowDetails] = useState(null); // ID da carta que está mostrando detalhes
  const modalRef = useRef(null);

  // Fechar modal quando clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowDetails(null);
      }
    }

    if (showDetails) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDetails]);

  const handleCardClick = (card, event) => {
    if (event.ctrlKey || event.metaKey) {
      // Ctrl+Click ou Cmd+Click para mostrar detalhes
      setShowDetails(showDetails === card.id ? null : card.id);
    } else {
      // Click normal para selecionar
      onCardSelect(card);
    }
  };

  const handleRightClick = (card, event) => {
    event.preventDefault();
    setShowDetails(showDetails === card.id ? null : card.id);
  };
  return (
    <div className="flex flex-row items-end justify-center flex-1 gap-[-2rem] relative z-15">
      {cards.map((card, idx) => {
        const isSelected = selectedCard?.id === card.id;
        const isNewCard = bonusGlow && idx === newCardIndex;
        
        return (
          <div
            key={card.id}
            className={`
              relative transition-transform duration-200 hover:z-[25] hover:-translate-y-8 cursor-pointer -ml-8
              ${isSelected ? 'ring-4 ring-yellow-400' : ''}
              ${isNewCard ? 'animate-card-draw' : ''}
            `}
            style={{ zIndex: idx + 16 }}
            onClick={(e) => handleCardClick(card, e)}
            onContextMenu={(e) => handleRightClick(card, e)}
            onDoubleClick={() => onCardPlay(card)}
            title={`${card.name} - Duplo clique para jogar | Ctrl+Click ou botão direito para detalhes`}
          >
            <CardImage 
              card={card} 
              className="w-20 h-28 rounded-lg border-2 border-white/30 shadow-lg transition-all duration-200 hover:border-yellow-400/50" 
            />
            
            {/* Modal de detalhes da carta da mão */}
            {showDetails === card.id && (
              <div 
                ref={modalRef}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/95 backdrop-blur-sm rounded-lg p-4 border border-blue-400/50 z-[9999] animate-fade-in min-w-64 max-w-80 shadow-2xl"
              >
                <div className="text-center mb-2">
                  <div className="text-sm font-bold text-blue-300">{card.name}</div>
                  <div className="text-xs text-gray-300">{card.element} • {card.rarity}</div>
                  <div className="text-xs text-yellow-300">❤️ {card.health} | ⚔️ {card.attack} | 🛡️ {card.defense}</div>
                </div>
                
                {/* Habilidades */}
                <div className="space-y-2 text-xs">
                  {card.abilities?.basic && (
                    <div className="bg-blue-900/30 rounded p-2">
                      <div className="font-bold text-blue-300">✨ {card.abilities.basic.name}</div>
                      <div className="text-gray-300">{card.abilities.basic.description}</div>
                      {card.abilities.basic.damage && (
                        <div className="text-red-300 text-xs">Dano: {card.abilities.basic.damage}</div>
                      )}
                    </div>
                  )}
                  
                  {card.abilities?.ultimate && (
                    <div className="bg-yellow-900/30 rounded p-2">
                      <div className="font-bold text-yellow-300">💥 {card.abilities.ultimate.name}</div>
                      <div className="text-gray-300">{card.abilities.ultimate.description}</div>
                      {card.abilities.ultimate.damage && (
                        <div className="text-red-300 text-xs">Dano: {card.abilities.ultimate.damage}</div>
                      )}
                    </div>
                  )}
                  
                  {card.abilities?.passive && (
                    <div className="bg-purple-900/30 rounded p-2">
                      <div className="font-bold text-purple-300">🔮 {card.abilities.passive.name}</div>
                      <div className="text-gray-300">{card.abilities.passive.description}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Indicador quando não há cartas */}
      {cards.length === 0 && (
        <div className="flex items-center justify-center w-20 h-28 rounded-lg border-2 border-dashed border-gray-400/50 bg-gray-800/30">
          <span className="text-gray-400 text-xs text-center">Sem cartas</span>
        </div>
      )}
    </div>
  );
}
