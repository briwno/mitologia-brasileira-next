// src/components/Card/ItemCard.js
import Image from 'next/image';
import { useState } from 'react';

export default function ItemCard({ item, onClick, className = '', showEffects = true }) {
  const [imageError, setImageError] = useState(false);

  if (!item) return null;

  const rarityStyles = {
    'COMMON': 'from-gray-500/50 to-gray-800/60 border-gray-400/40',
    'RARE': 'from-blue-500/50 to-blue-800/60 border-blue-400/40',
    'EPIC': 'from-purple-500/50 to-purple-800/60 border-purple-400/40',
    'LEGENDARY': 'from-amber-400/60 to-amber-800/60 border-amber-400/40',
    'MYTHIC': 'from-rose-500/60 to-rose-800/60 border-rose-400/40'
  };

  const typeIcons = {
    'CONSUMABLE': '🧪',
    'EQUIPMENT': '⚔️',
    'ARTIFACT': '🔮',
    'RELIC': '🏺',
    'SCROLL': '📜'
  };

  const rarity = (item.rarity || 'COMMON').toUpperCase();
  const style = rarityStyles[rarity] || rarityStyles['COMMON'];
  const typeIcon = typeIcons[item.itemType] || '📦';

  // Get best available image
  const imgSrc = item.images?.completa || item.images?.full || item.images?.retrato || item.images?.portrait || '/images/placeholder.svg';

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
            alt={item.name}
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
          <span className="hidden sm:inline">{item.itemType}</span>
        </div>

        {/* Rarity Badge */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${style.split(' ')[0]}`} />
        </div>

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
          {item.name}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-white/80 leading-relaxed mb-2 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Effects */}
        {showEffects && item.effects && Object.keys(item.effects).length > 0 && (
          <div className="text-xs">
            <div className="text-yellow-300 font-medium mb-1">Efeito:</div>
            <div className="text-white/90">
              {item.effects.description || 
               `${item.effects.type || 'Efeito'} ${item.effects.value || ''} ${item.effects.duration ? `(${item.effects.duration})` : ''}`.trim()
              }
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