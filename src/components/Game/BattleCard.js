// src/components/Game/BattleCard.js
"use client";

import Image from 'next/image';
import Icon from '@/components/UI/Icon';

export default function BattleCard({ 
  card, 
  type = 'lenda',
  isActive = false,
  isClickable = true,
  showStats = true,
  onClick,
  className = '',
  style = {}
}) {
  const handleClick = () => {
    if (isClickable && onClick && card) {
      onClick(card);
    }
  };

  // Determinar classes baseado no tipo e estado
  const getTypeClasses = () => {
    if (!card) return 'bg-gray-700 border-gray-600 border-dashed hover:border-gray-500';
    
    if (type === 'lenda') {
      return isActive 
        ? 'bg-purple-600 border-purple-400 hover:animate-pulse'
        : 'bg-blue-600 border-blue-400 hover:animate-pulse';
    }
    
    return 'bg-green-600 border-green-400 hover:border-green-300';
  };

  return (
    <div
      className={`
        rounded-lg border-2 transition-all relative overflow-hidden
        ${getTypeClasses()}
        ${(() => {
          if (isClickable && card) {
            return 'cursor-pointer hover:scale-105';
          } else {
            return 'cursor-default';
          }
        })()}
        ${className}
      `}
      onClick={handleClick}
      style={style}
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
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={100}
              priority={isActive}
              decoding="async"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Nome da carta */}
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <div className="text-white text-xs font-bold text-center truncate">
                {card.nome}
              </div>
              
              {/* Stats para lendas */}
              {showStats && type === 'lenda' && (
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
              <div className="absolute inset-0 z-10 pointer-events-none animate-pulse bg-yellow-300/20 rounded-lg ring-4 ring-yellow-400/0" />
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
            name={(() => {
              if (type === 'lenda') {
                return 'user';
              } else {
                return 'package';
              }
            })()} 
            size={20} 
          />
          <div className="text-xs mt-1 text-center px-1">
            {(() => {
              if (type === 'lenda') {
                return 'LENDA';
              } else {
                return 'ITEM';
              }
            })()}
          </div>
        </div>
      )}
    </div>
  );
}