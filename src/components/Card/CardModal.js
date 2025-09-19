// src/components/Card/CardModal.js
"use client";

import CardDetail from './CardDetail';
import { getModalClasses } from '@/utils/cardUtils';

/**
 * Wrapper modal padrão para CardDetail com diferentes modos
 * @param {Object} card - Carta selecionada
 * @param {Function} onClose - Função de fechamento
 * @param {string} mode - Modo do modal ('battle', 'lore', 'collection')
 * @param {Object} props - Props adicionais
 */
export default function CardModal({ card, onClose, mode = 'battle', ...props }) {
  if (!card) return null;

  return (
    <div 
      className={getModalClasses()}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <CardDetail 
          card={card} 
          onClose={onClose}
          mode={mode}
          {...props}
        />
      </div>
    </div>
  );
}