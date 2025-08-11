// src/components/Game/CardInField.js
"use client";

import CardImage from '../Card/CardImage';

export default function CardInField({ 
  card, 
  position = "player", 
  bonusGlow = false, 
  isActive = false, 
  onClick,
  showMenu = false,
  onSkillClick,
  onUltimateClick,
  onEndTurnClick,
  skillCooldown = 0,
  ultimateCharge = 0,
  actionUsed = false
}) {
  const isPlayer = position === "player";
  const positionClasses = isPlayer 
    ? "absolute bottom-24 left-1/2 -translate-x-1/2"
    : "flex flex-col items-center flex-1";

  const containerClasses = isPlayer
    ? `w-32 h-32 rounded-full bg-gradient-to-b from-amber-900/80 to-yellow-700/60 border-4 border-yellow-400 flex items-center justify-center shadow-2xl mb-2 animate-pulse cursor-pointer transition-all duration-300 ${bonusGlow ? 'ring-4 ring-green-400 shadow-green-400/60' : ''} ${isActive ? 'animate-glow' : ''}`
    : "w-32 h-32 rounded-full bg-gradient-to-t from-indigo-900/80 to-indigo-700/60 border-4 border-blue-400 flex items-center justify-center shadow-2xl mb-2 animate-pulse";

  return (
    <div className={`${positionClasses} flex flex-col items-center z-10`}>
      {/* Carta ativa */}
      <div
        className={containerClasses}
        onClick={onClick}
        title={isPlayer ? "Clique para ver habilidades" : undefined}
      >
        {card && (
          <CardImage card={card} className="w-24 h-24" />
        )}
      </div>
      
      {/* Nome da carta */}
      <div className={`text-center text-xs font-semibold ${isPlayer ? 'text-yellow-200' : 'text-blue-200'}`}>
        {card?.name || '---'}
      </div>

      {/* Habilidades (apenas para oponente ou quando não é menu interativo) */}
      {!isPlayer && card && (
        <div className="flex flex-row gap-2 mt-1 text-xs">
          <span className="bg-blue-900/60 px-2 py-0.5 rounded">
            {card.abilities?.basic?.name || '-'}
          </span>
          <span className="bg-yellow-900/60 px-2 py-0.5 rounded">
            {card.abilities?.ultimate?.name || '-'}
          </span>
        </div>
      )}

      {/* Menu de habilidades interativo (apenas para jogador) */}
      {isPlayer && showMenu && card && (
        <div className="flex flex-row gap-3 mt-2 animate-fade-in">
          <button
            className="flex flex-col items-center bg-black/60 px-3 py-2 rounded-lg border-2 border-blue-400 shadow-lg hover:bg-blue-900/80 transition"
            onClick={onSkillClick}
            disabled={actionUsed || skillCooldown > 0}
            title={card.abilities?.basic?.description || 'Habilidade Básica'}
          >
            <span className="text-lg">✨</span>
            <span className="text-xs mt-1">{card.abilities?.basic?.name || 'Skill'}</span>
            {skillCooldown > 0 && (
              <span className="text-xs text-blue-200">{skillCooldown}t</span>
            )}
          </button>
          
          <button
            className="flex flex-col items-center bg-black/60 px-3 py-2 rounded-lg border-2 border-yellow-400 shadow-lg hover:bg-yellow-900/80 transition"
            onClick={onUltimateClick}
            disabled={actionUsed || ultimateCharge < 100}
            title={card.abilities?.ultimate?.description || 'Ultimate'}
          >
            <span className="text-lg">💥</span>
            <span className="text-xs mt-1">{card.abilities?.ultimate?.name || 'Ultimate'}</span>
            <span className="text-xs text-yellow-200">{ultimateCharge}/100</span>
          </button>
          
          <button
            className="flex flex-col items-center bg-black/60 px-3 py-2 rounded-lg border-2 border-green-400 shadow-lg hover:bg-green-900/80 transition"
            onClick={onEndTurnClick}
            disabled={!isActive}
            title="Finalizar Turno"
          >
            <span className="text-lg">⏭️</span>
            <span className="text-xs mt-1">Finalizar</span>
          </button>
        </div>
      )}
    </div>
  );
}
