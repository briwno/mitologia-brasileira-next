// src/utils/cardMigration.js
// Script para migrar dados antigos para nova estrutura

import { cards as oldCards } from '../data/cards';
import { bancoDeCartas } from '../data/cardsDatabase';

// Mapeamento de cartas antigas para novas
export const migrateOldCardFormat = (oldCard) => {
  return {
    id: `mig${oldCard.id.toString().padStart(3, '0')}`,
    name: oldCard.name,
    region: oldCard.region,
    category: oldCard.category,
    type: oldCard.type || 'creature',
    cost: oldCard.cost,
    attack: oldCard.attack,
    defense: oldCard.defense,
    health: oldCard.life || oldCard.health,
    rarity: oldCard.rarity,
    ability: oldCard.ability,
    abilityDescription: oldCard.abilityDescription || `Habilidade especial de ${oldCard.name}`,
    lore: oldCard.history || `Criatura lendária da mitologia brasileira.`,
    discovered: oldCard.discovered !== false,
    images: {
      portrait: `/images/cards/portraits/${oldCard.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.jpg`,
      full: `/images/cards/full/${oldCard.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.jpg`
    },
    tags: [oldCard.element?.toLowerCase() || 'mitologia', 'brasileiro']
  };
};

// Função para usar dados migrados se não houver novos
export const getCompatibleCards = () => {
  if (bancoDeCartas && bancoDeCartas.length > 0) {
    return bancoDeCartas;
  }
  
  // Fallback para dados antigos migrados
  return oldCards.map(migrateOldCardFormat);
};

export default getCompatibleCards;
