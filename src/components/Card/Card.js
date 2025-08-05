// src/components/Card/Card.js
"use client";

export default function Card({ card, onClick, disabled = false, showDetails = true }) {
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Comum': return 'border-gray-500 bg-gray-900/20';
      case 'Raro': return 'border-blue-500 bg-blue-900/20';
      case 'Épico': return 'border-purple-500 bg-purple-900/20';
      case 'Lendário': return 'border-yellow-500 bg-yellow-900/20';
      default: return 'border-gray-500 bg-gray-900/20';
    }
  };

  const getElementIcon = (element) => {
    switch (element) {
      case 'Fogo': return '🔥';
      case 'Água': return '💧';
      case 'Terra': return '🌍';
      case 'Ar': return '💨';
      case 'Sombra': return '🌙';
      default: return '⭐';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-lg p-4 border-2 transition-all duration-200 cursor-pointer transform
        ${getRarityColor(card.rarity)}
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:scale-105 hover:shadow-lg hover:border-white/50'
        }
      `}
    >
      {/* Elemento da carta */}
      <div className="absolute top-2 right-2 text-lg">
        {getElementIcon(card.element)}
      </div>

      {/* Custo de mana */}
      <div className="absolute top-2 left-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white">
        {card.cost}
      </div>

      {/* Imagem da carta */}
      <div className="w-full h-32 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        {card.image ? (
          <img 
            src={card.image} 
            alt={card.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-4xl">🎭</div>
        )}
      </div>

      {/* Nome da carta */}
      <h3 className="text-lg font-bold text-center mb-2 text-white">
        {card.name}
      </h3>

      {showDetails && (
        <>
          {/* Categoria e Região */}
          <div className="text-xs text-gray-400 text-center mb-3">
            {card.category} • {card.region}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1 mb-3">
            <div className="bg-red-900/50 p-2 rounded text-center">
              <div className="text-xs text-red-300">ATQ</div>
              <div className="font-bold text-white">{card.attack}</div>
            </div>
            <div className="bg-blue-900/50 p-2 rounded text-center">
              <div className="text-xs text-blue-300">DEF</div>
              <div className="font-bold text-white">{card.defense}</div>
            </div>
            <div className="bg-green-900/50 p-2 rounded text-center">
              <div className="text-xs text-green-300">VIDA</div>
              <div className="font-bold text-white">{card.life}</div>
            </div>
          </div>

          {/* Habilidade */}
          {card.ability && (
            <div className="bg-black/30 p-2 rounded mb-2">
              <div className="text-xs font-semibold text-yellow-400 mb-1">
                {card.ability}
              </div>
              <div className="text-xs text-gray-300">
                {card.abilityDescription}
              </div>
            </div>
          )}

          {/* Raridade */}
          <div className="text-center">
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              card.rarity === 'Comum' ? 'bg-gray-600 text-gray-200' :
              card.rarity === 'Raro' ? 'bg-blue-600 text-blue-100' :
              card.rarity === 'Épico' ? 'bg-purple-600 text-purple-100' :
              'bg-yellow-600 text-yellow-100'
            }`}>
              {card.rarity}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
