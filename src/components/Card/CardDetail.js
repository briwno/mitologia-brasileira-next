// src/components/Card/CardDetail.js
"use client";

import CardImage from './CardImage';

export default function CardDetail({ card, onClose = null }) {
  if (!card) return null;

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Comum': return 'border-gray-500 text-gray-400 bg-gray-900/20';
      case 'Raro': return 'border-blue-500 text-blue-400 bg-blue-900/20';
      case 'Épico': return 'border-purple-500 text-purple-400 bg-purple-900/20';
      case 'Lendário': return 'border-yellow-500 text-yellow-400 bg-yellow-900/20';
      case 'Mítico': return 'border-red-500 text-red-400 bg-red-900/20';
      default: return 'border-gray-500 text-gray-400 bg-gray-900/20';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'creature': return '👾';
      case 'spell': return '✨';
      case 'artifact': return '⚱️';
      default: return '🎭';
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-600/30 max-w-xs sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto">
      {/* Header com botão de fechar */}
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white pr-2">
          {card.discovered ? card.name : '???'}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-lg sm:text-xl flex-shrink-0"
          >
            ✕
          </button>
        )}
      </div>

      {/* Imagem da carta */}
      <div className="flex justify-center mb-3 sm:mb-4">
        <CardImage card={card} size="large" />
      </div>

      {card.discovered ? (
        <div className="space-y-3 sm:space-y-4">
          {/* Informações básicas */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <div className="text-xs sm:text-sm text-gray-400">Região</div>
              <div className="font-semibold text-sm sm:text-base">{card.region}</div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-400">Categoria</div>
              <div className="font-semibold text-sm sm:text-base">{card.category}</div>
            </div>
          </div>

          {/* Tipo e Raridade */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <div className="text-xs sm:text-sm text-gray-400">Tipo</div>
              <div className="font-semibold text-sm sm:text-base">
                {getTypeIcon(card.type)} {card.type === 'creature' ? 'Criatura' : card.type === 'spell' ? 'Feitiço' : 'Artefato'}
              </div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-400">Raridade</div>
              <div className={`font-semibold text-sm sm:text-base ${getRarityColor(card.rarity).split(' ')[1]}`}>
                {card.rarity}
              </div>
            </div>
          </div>

          {/* Custo e Estatísticas */}
          <div className="bg-black/40 p-2 sm:p-3 rounded">
            <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center">
              <div>
                <div className="text-xs text-yellow-400">Custo</div>
                <div className="text-sm sm:text-lg lg:text-xl font-bold">💎{card.cost}</div>
              </div>
              {card.type === 'creature' && (
                <>
                  <div>
                    <div className="text-xs text-red-400">Ataque</div>
                    <div className="text-sm sm:text-lg lg:text-xl font-bold">⚔️{card.attack}</div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-400">Defesa</div>
                    <div className="text-sm sm:text-lg lg:text-xl font-bold">🛡️{card.defense}</div>
                  </div>
                  <div>
                    <div className="text-xs text-green-400">Vida</div>
                    <div className="text-sm sm:text-lg lg:text-xl font-bold">❤️{card.health}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Habilidades */}
          {card.abilities && (
            <div className="space-y-2 sm:space-y-3">
              {/* Habilidade Básica */}
              {card.abilities.basic && (
                <div className="bg-blue-900/30 p-2 sm:p-3 rounded border border-blue-500/30">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-xs sm:text-sm text-blue-400 font-semibold">⚡ Habilidade Básica</div>
                    <div className="text-xs text-yellow-400">💎{card.abilities.basic.cost}</div>
                  </div>
                  <div className="font-semibold mb-1 text-sm sm:text-base">{card.abilities.basic.name}</div>
                  <div className="text-xs sm:text-sm text-gray-300">{card.abilities.basic.description}</div>
                  {card.abilities.basic.cooldown > 0 && (
                    <div className="text-xs text-orange-400 mt-1">
                      ⏱️ Recarga: {card.abilities.basic.cooldown} turno(s)
                    </div>
                  )}
                </div>
              )}

              {/* Habilidade Ultimate */}
              {card.abilities.ultimate && (
                <div className="bg-purple-900/30 p-2 sm:p-3 rounded border border-purple-500/30">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-xs sm:text-sm text-purple-400 font-semibold">🌟 Ultimate</div>
                    <div className="text-xs text-yellow-400">💎{card.abilities.ultimate.cost}</div>
                  </div>
                  <div className="font-semibold mb-1 text-sm sm:text-base">{card.abilities.ultimate.name}</div>
                  <div className="text-xs sm:text-sm text-gray-300">{card.abilities.ultimate.description}</div>
                  <div className="text-xs text-orange-400 mt-1">
                    ⏱️ Recarga: {card.abilities.ultimate.cooldown} turno(s)
                  </div>
                </div>
              )}

              {/* Habilidade Passiva */}
              {card.abilities.passive && (
                <div className="bg-green-900/30 p-2 sm:p-3 rounded border border-green-500/30">
                  <div className="text-xs sm:text-sm text-green-400 font-semibold mb-1">🔮 Passiva</div>
                  <div className="font-semibold mb-1 text-sm sm:text-base">{card.abilities.passive.name}</div>
                  <div className="text-xs sm:text-sm text-gray-300">{card.abilities.passive.description}</div>
                </div>
              )}
            </div>
          )}

          {/* Elemento */}
          {card.element && (
            <div className="bg-black/40 p-3 rounded">
              <div className="text-sm text-cyan-400 mb-1">Elemento</div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {card.element === 'Terra' ? '🌍' :
                   card.element === 'Água' ? '💧' :
                   card.element === 'Fogo' ? '🔥' :
                   card.element === 'Ar' ? '💨' :
                   card.element === 'Espírito' ? '👻' : '⭐'}
                </span>
                <span className="font-semibold">{card.element}</span>
              </div>
            </div>
          )}

          {/* Condição de Desbloqueio */}
          {card.unlockCondition && (
            <div className="bg-black/40 p-3 rounded">
              <div className="text-sm text-orange-400 mb-1">🔓 Desbloqueio</div>
              <div className="text-sm text-gray-300">{card.unlockCondition}</div>
            </div>
          )}

          {/* Bônus Sazonal */}
          {card.seasonalBonus && (
            <div className="bg-yellow-900/30 p-3 rounded border border-yellow-500/30">
              <div className="text-sm text-yellow-400 mb-1">🎉 Bônus Sazonal</div>
              <div className="font-semibold mb-1">{card.seasonalBonus.season}</div>
              <div className="text-sm text-gray-300 mb-1">{card.seasonalBonus.description}</div>
              <div className="text-xs text-yellow-300">
                Multiplicador: {card.seasonalBonus.multiplier}x
              </div>
            </div>
          )}

          {/* Lore */}
          {card.lore && (
            <div className="bg-black/40 p-3 rounded">
              <div className="text-sm text-cyan-400 mb-1">História</div>
              <div className="text-sm text-gray-300 italic">{card.lore}</div>
            </div>
          )}

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div>
              <div className="text-sm text-gray-400 mb-2">Tags</div>
              <div className="flex flex-wrap gap-1">
                {card.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-700 px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-4">🔒</div>
          <div className="font-semibold mb-2">Carta Não Descoberta</div>
          <div className="text-sm">
            Complete desafios no museu ou encontre em batalhas para desbloquear esta carta.
          </div>
        </div>
      )}
    </div>
  );
}
