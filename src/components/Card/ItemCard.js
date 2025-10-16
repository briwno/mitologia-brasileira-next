// src/components/Card/ItemCard.js
import Image from 'next/image';
import { useState } from 'react';

export default function ItemCard({ item, onClick, className = '', showEffects = true, isOwned = false }) {
  const [imageError, setImageError] = useState(false);

  if (!item) return null;

  const rarityStyles = {
    'COMUM': 'from-gray-500/50 to-gray-800/60 border-gray-400/40',
    'INCOMUM': 'from-green-500/50 to-green-800/60 border-green-400/40',
    'RARO': 'from-blue-500/50 to-blue-800/60 border-blue-400/40',
    'EPICO': 'from-purple-500/50 to-purple-800/60 border-purple-400/40',
    'LENDARIO': 'from-amber-400/60 to-amber-800/60 border-amber-400/40',
    'MITICO': 'from-rose-500/60 to-rose-800/60 border-rose-400/40'
  };

  const typeIcons = {
    'ofensivo': '⚔️',
    'defensivo': '🛡️',
    'utilitario': '�',
    'cura': '🧪',
    'buff': '✨'
  };

  const rarity = (item.raridade || 'COMUM').toUpperCase();
  const style = rarityStyles[rarity] || rarityStyles['COMUM'];
  const typeIcon = typeIcons[item.tipo] || '📦';

  // Get best available image or use placeholder
  const imgSrc = item.imagem || '/images/placeholder.svg';

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className={`relative group rounded-xl overflow-hidden backdrop-blur-sm bg-gradient-to-b ${style} shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-xl ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {!imageError ? (
          <Image
            src={imgSrc}
            alt={`${item.nome || item.name || 'Item'} - ${item.tipo_item || item.tipo || 'Item de jogo'} ${rarity}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            quality={90}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
            <div className="text-center text-white/70">
              <div className="text-4xl mb-2">{typeIcon}</div>
              <div className="text-xs px-2">Sem Imagem</div>
            </div>
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs font-medium flex items-center gap-1">
          <span>{typeIcon}</span>
          <span className="hidden sm:inline">{item.tipo}</span>
        </div>

        {/* Rarity Badge */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${style.split(' ')[0]}`} />
        </div>

        {/* Owned Indicator */}
        {isOwned && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-green-600/90 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs font-medium">
            ✓ Possuído
          </div>
        )}

        {/* Tradeable Indicator */}
        {item.isTradeable === false && (
          <div className="absolute bottom-2 right-2 bg-red-600/90 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs font-medium">
            🔒 Não Trocável
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-3 bg-black/60 backdrop-blur-sm text-white">
        {/* Name */}
        <h3 className="font-bold text-sm leading-tight mb-1 line-clamp-2">
          {item.nome}
        </h3>

        {/* Description */}
        {item.descricao && (
          <p className="text-xs text-white/80 leading-relaxed mb-2 line-clamp-2">
            {item.descricao}
          </p>
        )}

        {/* Effects - Detailed */}
        {showEffects && item.efeito && (
          <div className="text-xs mt-2 bg-black/40 rounded p-2">
            <div className="text-yellow-300 font-medium mb-1">⚡ Efeito:</div>
            <div className="text-white/90 space-y-1">
              {typeof item.efeito === 'string' ? (
                <div>{item.efeito}</div>
              ) : (
                <>
                  {/* Description of effect */}
                  {(item.efeito.descricao || item.efeito.description || item.descricao) && (
                    <div className="text-white/80 italic mb-1">
                      {item.efeito.descricao || item.efeito.description || item.descricao}
                    </div>
                  )}
                  
                  {/* Numeric details */}
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {(item.efeito.dano || item.efeito.damage) && (
                      <div className="flex items-center gap-1">
                        <span className="text-red-400">⚔️</span>
                        <span className="font-semibold text-red-300">+{item.efeito.dano || item.efeito.damage}</span>
                      </div>
                    )}
                    {(item.efeito.cura || item.efeito.heal || item.efeito.regen_per_turn) && (
                      <div className="flex items-center gap-1">
                        <span className="text-green-400">❤️</span>
                        <span className="font-semibold text-green-300">+{item.efeito.cura || item.efeito.heal || item.efeito.regen_per_turn}</span>
                      </div>
                    )}
                    {(item.efeito.defesa || item.efeito.defense) && (
                      <div className="flex items-center gap-1">
                        <span className="text-blue-400">🛡️</span>
                        <span className="font-semibold text-blue-300">+{item.efeito.defesa || item.efeito.defense}</span>
                      </div>
                    )}
                    {(item.efeito.ataque || item.efeito.attack) && (
                      <div className="flex items-center gap-1">
                        <span className="text-orange-400">⚔️</span>
                        <span className="font-semibold text-orange-300">+{item.efeito.ataque || item.efeito.attack}</span>
                      </div>
                    )}
                    {(item.efeito.duracao || item.efeito.duration) && (
                      <div className="flex items-center gap-1">
                        <span className="text-purple-400">⏱️</span>
                        <span className="font-semibold text-purple-300">{item.efeito.duracao || item.efeito.duration} turnos</span>
                      </div>
                    )}
                    {(item.efeito.valor || item.efeito.value) && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">✨</span>
                        <span className="font-semibold text-yellow-300">{item.efeito.valor || item.efeito.value}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Rarity Label */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-white/60 uppercase tracking-wider font-medium">
            {rarity}
          </span>
          {item.unlockCondition && (
            <span className="text-xs text-yellow-300">🔓 {item.unlockCondition}</span>
          )}
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div 
        aria-hidden 
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 blur-sm" />
      </div>
    </div>
  );
}