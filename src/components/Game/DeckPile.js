// src/components/Game/DeckPile.js
"use client";

import CardImage from '../Card/CardImage';

export default function DeckPile({ 
  count = 0, 
  type = "deck", // "deck" ou "discard"
  position = "right", // "right" ou "left"
  topCard = null, // carta do topo (para descarte)
  sampleCards = [] // cartas de exemplo para mostrar
}) {
  const isDiscard = type === "discard";
  
  const colors = {
    deck: {
      bg: "bg-blue-900/60",
      border: "border-blue-400",
      text: "text-blue-200",
      badge: "bg-blue-600",
      label: "text-blue-300",
      icon: "📚"
    },
    discard: {
      bg: "bg-gray-800/60",
      border: "border-gray-400", 
      text: "text-gray-200",
      badge: "bg-red-600",
      label: "text-gray-300",
      icon: "🗑️"
    }
  };

  const currentColors = colors[type];
  const title = isDiscard ? "Descarte" : "Compra";
  const subtitle = isDiscard ? "Desencanto" : "Baralho";

  return (
    <div className="flex flex-col items-center">
      {/* Pilha visual aumentada */}
      <div className="relative">
        {/* Pilha principal maior */}
        <div className={`w-20 h-28 ${currentColors.bg} border-2 ${currentColors.border} rounded-lg flex flex-col items-center justify-center shadow-lg relative transition-all duration-300 hover:scale-105 cursor-pointer`}>
          
          {/* Se for descarte e tiver carta do topo, mostra a carta */}
          {isDiscard && topCard ? (
            <CardImage card={topCard} className="w-full h-full rounded-lg" />
          ) : (
            // Caso contrário, mostra o ícone
            <>
              <span className="text-3xl mb-1">{currentColors.icon}</span>
              <span className={`${currentColors.text} font-bold text-xs text-center leading-tight`}>
                {title}
              </span>
            </>
          )}
          
          {/* Contador de cartas */}
          {count > 0 && (
            <div className={`absolute -top-2 -right-2 ${currentColors.badge} text-white text-xs rounded-full w-7 h-7 flex items-center justify-center font-bold border-2 border-white`}>
              {count}
            </div>
          )}
        </div>
        
        {/* Efeito de múltiplas cartas empilhadas */}
        {count > 1 && (
          <>
            <div className={`absolute -top-1 -right-1 w-20 h-28 ${currentColors.bg} border-2 ${currentColors.border} rounded-lg -z-10`}></div>
            {count > 2 && (
              <div className={`absolute -top-2 -right-2 w-20 h-28 ${currentColors.bg} border-2 ${currentColors.border} rounded-lg -z-20`}></div>
            )}
          </>
        )}
      </div>
      
      {/* Label da pilha */}
      <span className={`text-sm ${currentColors.label} mt-2 text-center font-medium`}>
        {subtitle}
      </span>
      
      {/* Informação adicional */}
      <span className={`text-xs ${currentColors.label} opacity-75 text-center`}>
        {count} carta{count !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
