// src/components/Game/Hand.js
"use client";

import CardImage from '../Card/CardImage';

export default function Hand({ 
  cards = [], 
  selectedCard, 
  onCardSelect, 
  onCardPlay,
  bonusGlow = false,
  newCardIndex = -1 
}) {
  return (
    <div className="flex flex-row items-end justify-center flex-1 gap-[-2rem]">
      {cards.map((card, idx) => {
        const isSelected = selectedCard?.id === card.id;
        const isNewCard = bonusGlow && idx === newCardIndex;
        
        return (
          <div
            key={card.id}
            className={`
              relative transition-transform duration-200 hover:z-20 hover:-translate-y-8 cursor-pointer -ml-8
              ${isSelected ? 'ring-4 ring-yellow-400' : ''}
              ${isNewCard ? 'animate-card-draw' : ''}
            `}
            style={{ zIndex: idx + 1 }}
            onClick={() => onCardSelect(card)}
            onDoubleClick={() => onCardPlay(card)}
            title={`${card.name} - Duplo clique para jogar`}
          >
            <CardImage 
              card={card} 
              className="w-20 h-28 rounded-lg border-2 border-white/30 shadow-lg transition-all duration-200 hover:border-yellow-400/50" 
            />
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
