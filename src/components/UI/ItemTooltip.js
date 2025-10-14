// src/components/UI/ItemTooltip.js
"use client";

import { useState } from 'react';

export default function ItemTooltip({ item, children }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!item) return children;

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 border border-gray-600 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">
              {(() => {
                if (item.tipo === 'ofensivo') {
                  return '⚔️';
                } else if (item.tipo === 'defensivo') {
                  return '🛡️';
                } else {
                  return '🔧';
                }
              })()}
            </span>
            <div>
              <div className="font-bold text-white text-sm">{item.nome}</div>
              <div className="text-xs text-gray-400 uppercase">{item.raridade} • {item.tipo}</div>
            </div>
          </div>
          
          {/* Description */}
          {item.descricao && (
            <div className="text-gray-300 text-xs mb-2">
              {item.descricao}
            </div>
          )}
          
          {/* Effects */}
          <div className="border-t border-gray-700 pt-2">
            <div className="text-yellow-400 text-xs font-semibold mb-1">EFEITO:</div>
            <div className="text-green-300 text-xs">
              {(() => {
                if (typeof item.efeito === 'string') {
                  return item.efeito;
                } else {
                  return (
                    <div className="space-y-1">
                      {item.efeito.dano && <div>• Causa {item.efeito.dano} de dano</div>}
                      {item.efeito.cura && <div>• Cura {item.efeito.cura} pontos de vida</div>}
                      {item.efeito.escudo && <div>• Concede escudo de {item.efeito.escudo}</div>}
                      {item.efeito.comprar_cartas && <div>• Compra {item.efeito.comprar_cartas} itens</div>}
                      {item.efeito.regenerar_pp && <div>• Regenera {item.efeito.regenerar_pp} PP</div>}
                      {item.efeito.descricao && <div>• {item.efeito.descricao}</div>}
                    </div>
                  );
                }
              })()}
            </div>
          </div>
          
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}