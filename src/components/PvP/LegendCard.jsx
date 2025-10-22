// src/components/PvP/LegendCard.jsx
"use client";

import Image from "next/image";

/**
 * Componente de carta de lenda no campo
 * Exibe HP, ATK, DEF, shields e efeitos visuais
 */
export default function LegendCard({ 
  legend, 
  isActive = false,
  isEnemy = false,
  onClick = null,
  showStats = true
}) {
  if (!legend) return null;

  const hpPercentage = (legend.hp / (legend.maxHp || 100)) * 100;
  const hpColor = hpPercentage > 50 ? 'bg-green-500' : hpPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div 
      className={`
        relative group cursor-pointer transition-all duration-300
        ${isActive ? 'scale-110 drop-shadow-2xl' : 'scale-100 hover:scale-105'}
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
      onClick={onClick}
    >
      {/* Brilho de status */}
      {isActive && (
        <div className="absolute -inset-2 bg-cyan-400/20 rounded-xl blur-xl animate-pulse" />
      )}

      {/* Container da carta */}
      <div className={`
        relative w-40 h-56 rounded-xl overflow-hidden
        border-2 transition-all
        ${isActive 
          ? isEnemy 
            ? 'border-red-500 shadow-lg shadow-red-500/50' 
            : 'border-cyan-500 shadow-lg shadow-cyan-500/50'
          : 'border-white/20'
        }
        shadow-2xl
      `}>
        {/* Imagem da lenda */}
        <Image
          src={legend.image || '/images/cards/portraits/default.jpg'}
          alt={legend.name}
          fill
          className="object-cover"
        />

        {/* Overlay de informações */}
        {showStats && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            {/* Nome */}
            <div className="absolute top-2 left-2 right-2">
              <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white truncate">
                {legend.name}
              </div>
            </div>

            {/* Barra de HP */}
            <div className="absolute bottom-2 left-2 right-2 space-y-1">
              {/* HP numérico */}
              <div className="flex justify-between items-center text-xs font-semibold text-white">
                <span>HP</span>
                <span>{legend.hp}/{legend.maxHp || 100}</span>
              </div>

              {/* Barra de HP */}
              <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${hpColor} transition-all duration-500`}
                  style={{ width: `${hpPercentage}%` }}
                />
              </div>

              {/* ATK e DEF */}
              <div className="flex justify-between text-xs font-bold">
                <span className="text-red-400">⚔️ {legend.atk || 0}</span>
                <span className="text-blue-400">🛡️ {legend.def || 0}</span>
              </div>

              {/* Shields */}
              {legend.shields > 0 && (
                <div className="flex items-center gap-1 text-xs text-cyan-300">
                  <span>🛡️</span>
                  <span>{legend.shields}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Indicador de ultimate disponível */}
        {legend.ultimate && !legend.ultimateUsed && (
          <div className="absolute top-2 right-2">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-xs font-bold">⚡</span>
            </div>
          </div>
        )}

        {/* Efeitos de status */}
        {legend.statusEffects && legend.statusEffects.length > 0 && (
          <div className="absolute top-10 right-2 flex flex-col gap-1">
            {legend.statusEffects.map((effect, i) => (
              <div 
                key={i}
                className="w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-xs"
                title={`${effect.type} (${effect.duration} turnos)`}
              >
                {getStatusIcon(effect.type)}
              </div>
            ))}
          </div>
        )}

        {/* Overlay de derrota */}
        {legend.hp <= 0 && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <span className="text-2xl font-bold text-red-500">💀</span>
          </div>
        )}
      </div>

      {/* Nome abaixo (para versão compacta) */}
      {!showStats && (
        <div className="mt-1 text-center text-xs font-semibold text-white truncate">
          {legend.name}
        </div>
      )}
    </div>
  );
}

/**
 * Retorna ícone para cada tipo de efeito de status
 */
function getStatusIcon(type) {
  const icons = {
    burn: '🔥',
    poison: '☠️',
    regen: '💚',
    freeze: '❄️',
    stun: '⚡',
    shield: '🛡️',
    buff: '⬆️',
    debuff: '⬇️'
  };
  return icons[type] || '•';
}
