"use client";

import Image from 'next/image';

/**
 * Componente de linha de banco de cartas (versão compacta)
 * Usado para mostrar cartas do banco de forma horizontal
 */
export default function BenchRow({ 
  legends = [], 
  onSelectCard = null,
  selectedCard = null,
  isEnemy = false,
  maxCards = 4
}) {
  const borderColor = isEnemy ? 'border-orange-500/60' : 'border-cyan-500/60';
  const hoverColor = isEnemy ? 'hover:border-orange-400' : 'hover:border-cyan-400';

  return (
    <div className="flex gap-2">
      {legends.slice(0, maxCards).map((legend, i) => (
        <div
          key={legend.id || i}
          className={`relative w-14 h-20 rounded-lg overflow-hidden border-2 bg-black/50 transition-all cursor-pointer
            ${selectedCard?.id === legend.id ? 'border-yellow-400 ring-2 ring-yellow-400' : `${borderColor} ${hoverColor}`}
          `}
          title={legend.name}
          onClick={() => onSelectCard && onSelectCard(legend)}
        >
          <Image
            src={legend.image || '/images/cards/portraits/default.jpg'}
            alt={legend.name}
            fill
            className="object-cover"
          />
          
          {/* HP overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-1 py-0.5">
            <div className="text-[8px] text-white font-bold flex justify-between">
              <span>HP</span>
              <span>{legend.hp}/{legend.maxHp}</span>
            </div>
            <div className="h-1 bg-neutral-700 rounded-full overflow-hidden mt-0.5">
              <div 
                className={`h-full ${legend.hp > 50 ? 'bg-green-500' : legend.hp > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${(legend.hp / legend.maxHp) * 100}%` }}
              />
            </div>
          </div>

          {/* Indicador de morte */}
          {legend.hp === 0 && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <span className="text-xl">💀</span>
            </div>
          )}

          {/* Seleção visual */}
          {selectedCard?.id === legend.id && (
            <div className="absolute inset-0 border-2 border-yellow-400 animate-pulse pointer-events-none" />
          )}
        </div>
      ))}
    </div>
  );
}
