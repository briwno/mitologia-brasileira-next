// src/components/Game/BattleCard.js
"use client";

import Image from 'next/image';
import Icon from '@/components/UI/Icon';

export default function BattleCard({ 
  card, 
  size = 'medium', 
  type = 'lenda',
  position = 'bottom',
  isActive = false,
  isClickable = true,
  showStats = true,
  onClick,
  className = ''
}) {
  const sizeClasses = {
    small: 'w-16 h-24',
    medium: 'w-20 h-28',
    large: 'w-32 h-44'
  };

  const typeClasses = {
    lenda: {
      bg: isActive ? 'bg-purple-600 border-purple-400' : 'bg-blue-600 border-blue-400',
      hover: isActive ? 'hover:border-purple-300' : 'hover:border-blue-300'
    },
    item: {
      bg: 'bg-green-600 border-green-400',
      hover: 'hover:border-green-300'
    },
    empty: {
      bg: 'bg-gray-700 border-gray-600 border-dashed',
      hover: 'hover:border-gray-500'
    }
  };

  const cardType = card ? type : 'empty';
  const cardClasses = typeClasses[cardType];

  const handleClick = () => {
    if (isClickable && onClick && card) {
      onClick(card);
    }
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        ${cardClasses.bg}
        ${isClickable && card ? 'cursor-pointer' : 'cursor-default'}
        ${isClickable && card ? cardClasses.hover : ''}
        ${isClickable && card ? 'hover:scale-105' : ''}
        rounded-lg border-2 transition-all relative overflow-hidden
        ${className}
      `}
      onClick={handleClick}
    >
      {card ? (
        <>
          {/* Imagem da carta */}
          <div className="w-full h-full relative">
            <Image
              src={card.imagem || '/images/placeholder.svg'}
              alt={card.nome}
              fill
              className="object-cover"
              sizes={`${sizeClasses[size].split(' ')[0].replace('w-', '')}px`}
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Nome da carta */}
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <div className="text-white text-xs font-bold text-center truncate">
                {card.nome}
              </div>
              
              {/* Stats para lendas */}
              {showStats && type === 'lenda' && size !== 'small' && (
                <div className="text-center mt-1">
                  <div className="text-xs text-gray-200 flex justify-center gap-2">
                    <span>ATK: {card.ataque + (card.ataqueBonus || 0)}</span>
                    <span>DEF: {card.defesa + (card.defesaBonus || 0)}</span>
                  </div>
                  {card.vida && (
                    <div className="text-xs text-red-300 mt-1">
                      HP: {card.vida}/{card.defesa}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Indicador de energia/mana para itens */}
            {type === 'item' && card.custo && (
              <div className="absolute top-1 right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{card.custo}</span>
              </div>
            )}

            {/* Indicador de ativo */}
            {isActive && (
              <div className="absolute top-1 left-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <Icon name="star" size={12} className="text-yellow-900" />
              </div>
            )}

            {/* Efeitos visuais para cartas com bonus */}
            {(card.ataqueBonus || card.defesaBonus) && (
              <div className="absolute -inset-1 bg-yellow-400/20 rounded-lg pointer-events-none" />
            )}
          </div>
        </>
      ) : (
        /* Carta vazia */
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
          <Icon 
            name={type === 'lenda' ? 'user' : 'package'} 
            size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} 
          />
          {size !== 'small' && (
            <div className="text-xs mt-1 text-center px-1">
              {type === 'lenda' ? 'LENDA' : 'ITEM'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}