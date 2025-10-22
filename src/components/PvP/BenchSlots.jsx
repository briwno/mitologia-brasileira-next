// src/components/PvP/BenchSlots.jsx
"use client";

import Image from 'next/image';

/**
 * Componente do Banco de Lendas
 * Exibe as 4 lendas de reserva
 */
export default function BenchSlots({ 
  legends = [], 
  onSelectLegend, 
  disabled = false 
}) {
  return (
    <div className="flex gap-3 justify-center">
      {legends.map((legend, i) => (
        <BenchSlot
          key={legend.id || i}
          legend={legend}
          onClick={() => !disabled && onSelectLegend?.(legend)}
          disabled={disabled || legend.hp <= 0}
        />
      ))}
    </div>
  );
}

/**
 * Slot individual do banco
 */
function BenchSlot({ legend, onClick, disabled }) {
  const isDefeated = legend.hp <= 0;
  const hpPercentage = (legend.hp / (legend.maxHp || 100)) * 100;
  
  return (
    <div
      className={`
        relative w-24 h-32 rounded-lg overflow-hidden
        border-2 transition-all
        ${disabled 
          ? 'border-neutral-700 opacity-50 cursor-not-allowed' 
          : 'border-white/20 hover:border-cyan-400 cursor-pointer hover:scale-105'
        }
        ${isDefeated ? 'grayscale' : ''}
        group shadow-lg
      `}
      onClick={onClick}
      title={legend.name}
    >
      {/* Imagem da lenda */}
      <Image
        src={legend.image || '/images/cards/portraits/default.jpg'}
        alt={legend.name}
        fill
        className="object-cover"
      />

      {/* Overlay com info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent">
        {/* Nome */}
        <div className="absolute bottom-0 left-0 right-0 p-1 text-center">
          <div className="text-xs font-semibold text-white truncate">
            {legend.name}
          </div>
        </div>

        {/* Mini barra de HP */}
        <div className="absolute bottom-8 left-1 right-1">
          <div className="h-1 bg-black/50 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                hpPercentage > 50 ? 'bg-green-500' : 
                hpPercentage > 25 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ width: `${hpPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Overlay de derrota */}
      {isDefeated && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <span className="text-2xl">💀</span>
        </div>
      )}

      {/* Tooltip no hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
        <div className="bg-black/95 border border-cyan-400 rounded-lg px-3 py-2 text-xs">
          <div className="font-bold text-cyan-300">{legend.name}</div>
          <div className="text-white">HP: {legend.hp}/{legend.maxHp || 100}</div>
          <div className="flex gap-2 mt-1">
            <span className="text-red-400">⚔️ {legend.atk}</span>
            <span className="text-blue-400">🛡️ {legend.def}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
