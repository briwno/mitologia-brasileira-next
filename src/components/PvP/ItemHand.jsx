// src/components/PvP/ItemHand.jsx
"use client";

import { useState } from 'react';

/**
 * Componente da Mão de Itens
 * Exibe até 3 itens que o jogador pode usar
 */
export default function ItemHand({ items = [], onUseItem, disabled = false }) {
  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemClick = (item) => {
    if (disabled) return;
    
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
      onUseItem?.(item);
    }
  };

  // Preencher slots vazios
  const slots = [...items];
  while (slots.length < 3) {
    slots.push(null);
  }

  return (
    <div className="flex gap-3 justify-center">
      {slots.map((item, i) => (
        <ItemSlot
          key={i}
          item={item}
          isSelected={selectedItem?.id === item?.id}
          onClick={() => item && handleItemClick(item)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

/**
 * Slot individual de item
 */
function ItemSlot({ item, isSelected, onClick, disabled }) {
  if (!item) {
    return (
      <div className="w-16 h-24 bg-black/30 border-2 border-neutral-700/50 rounded-lg opacity-40 flex flex-col items-center justify-center">
        <span className="text-neutral-600 text-2xl">🎒</span>
        <span className="text-neutral-600 text-xs mt-1">ITEM</span>
      </div>
    );
  }

  return (
    <div
      className={`
        w-16 h-24 rounded-lg transition-all cursor-pointer
        border-2 relative group
        ${isSelected 
          ? 'border-cyan-400 shadow-lg shadow-cyan-400/50 scale-105' 
          : 'border-emerald-400/30 hover:border-emerald-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        bg-gradient-to-br from-emerald-900/60 to-black/60
        shadow-lg
      `}
      onClick={onClick}
    >
      {/* Ícone do tipo de item */}
      <div className="absolute top-1 left-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-xs">
        {getItemTypeIcon(item.type)}
      </div>

      {/* Nome do item */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-1 text-center">
        <span className="text-[10px] font-bold text-emerald-300 line-clamp-3 leading-tight px-1">
          {item.name}
        </span>
      </div>

      {/* Tooltip expandido no hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <div className="bg-black/95 border border-emerald-400 rounded-lg p-2 min-w-[160px] text-xs">
          <div className="font-bold text-emerald-300 mb-1">{item.name}</div>
          <div className="text-neutral-200">{item.description}</div>
          {item.uses && (
            <div className="text-cyan-400 mt-1">Usos: {item.uses}</div>
          )}
        </div>
      </div>

      {/* Contador de usos */}
      {item.uses && (
        <div className="absolute bottom-1 right-1 w-5 h-5 bg-cyan-600 rounded-full flex items-center justify-center text-xs font-bold">
          {item.uses}
        </div>
      )}
    </div>
  );
}

/**
 * Retorna ícone do tipo de item
 */
function getItemTypeIcon(type) {
  const icons = {
    ofensivo: '⚔️',
    defensivo: '🛡️',
    utilitario: '✨',
    heal: '💚',
    buff: '⬆️',
    debuff: '⬇️'
  };
  return icons[type] || '📦';
}

/**
 * Formata exibição do valor do item
 */
function getItemValueDisplay(item) {
  switch (item.type) {
    case 'heal':
      return `+${item.value} HP`;
    case 'buff':
      return `+${item.value} ATK`;
    case 'debuff':
      return `-${item.value} DEF`;
    case 'ofensivo':
      return `${item.value} DMG`;
    case 'defensivo':
      return `+${item.value} DEF`;
    default:
      return item.value;
  }
}
