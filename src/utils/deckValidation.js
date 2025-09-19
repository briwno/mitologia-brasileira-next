// src/utils/deckValidation.js

export const DECK_RULES = {
  TAMANHO_DECK_LENDAS: 5,      // 5 Lendas únicas no deck
  TAMANHO_DECK_ITENS: 10,      // 10 Itens no deck  
  TAMANHO_MAXIMO_MAO_ITENS: 3, // Máximo 3 itens na mão
  BANCO_LENDAS: 4,              // 4 lendas no banco (reserva)
  LENDA_ATIVA: 1,               // 1 lenda ativa em campo
  LIMITE_TEMPO_TURNO: 300,      // 5 minutos
  
  // Regras derivadas
  MIN_SIZE: 15, // 5 lendas + 10 itens = 15 cartas mínimo
  MAX_SIZE: 15, // Deck fixo de 15 cartas
  MAX_COPIES_PER_CARD: 1, // Apenas 1 cópia de cada carta
  REQUIRED_LENDAS: 5,     // Exatamente 5 lendas
  REQUIRED_ITENS: 10,     // Exatamente 10 itens
  REQUIRED_FIELDS: ['id', 'name', 'category']
};

/**
 * Valida se um deck atende todas as regras do jogo
 * @param {Array} deckCards - Array de cartas do deck (IDs)
 * @param {Array} availableCards - Array de todas as cartas disponíveis
 * @returns {Object} - { isValid: boolean, errors: string[], warnings: string[] }
 */
export function validateDeck(deckCards, availableCards = []) {
  const errors = [];
  const warnings = [];

  // Validação básica de estrutura
  if (!Array.isArray(deckCards)) {
    errors.push('Deck deve ser um array de cartas');
    return { isValid: false, errors, warnings };
  }

  // Validação de tamanho total
  if (deckCards.length !== DECK_RULES.MAX_SIZE) {
    errors.push(`Deck deve ter exatamente ${DECK_RULES.MAX_SIZE} cartas. Atual: ${deckCards.length}`);
  }

  // Validação de duplicatas
  const cardCounts = {};
  const invalidCards = [];
  
  deckCards.forEach((cardId, index) => {
    // Verificar se é um ID válido
    if (typeof cardId !== 'string' && typeof cardId !== 'number') {
      errors.push(`Carta inválida na posição ${index + 1}: ${cardId}`);
      return;
    }

    // Contar ocorrências
    cardCounts[cardId] = (cardCounts[cardId] || 0) + 1;
    
    // Verificar se a carta existe na coleção disponível
    if (availableCards.length > 0) {
      const cardExists = availableCards.some(card => card.id == cardId);
      if (!cardExists) {
        invalidCards.push(cardId);
      }
    }
  });

  // Verificar limite de cópias por carta
  Object.entries(cardCounts).forEach(([cardId, count]) => {
    if (count > DECK_RULES.MAX_COPIES_PER_CARD) {
      errors.push(`Muitas cópias da carta ${cardId}: ${count}/${DECK_RULES.MAX_COPIES_PER_CARD}`);
    }
  });

  // Verificar cartas inválidas
  if (invalidCards.length > 0) {
    errors.push(`Cartas não encontradas na coleção: ${invalidCards.join(', ')}`);
  }

  // Validar composição por categoria (Lendas e Itens)
  if (availableCards.length > 0) {
    const cardsByType = {
      lendas: [],
      itens: []
    };

    deckCards.forEach(cardId => {
      const card = availableCards.find(c => c.id == cardId);
      if (card) {
        // Verificar múltiplos campos para categoria/tipo
        const category = (card.categoria || card.category || '').toLowerCase();
        const type = (card.tipo || card.type || '').toLowerCase();
        
        if (category === 'lenda' || type === 'lenda' || category === 'legend' || type === 'legend') {
          cardsByType.lendas.push(cardId);
        } else if (category === 'item' || type === 'item' || category === 'itens' || type === 'itens') {
          cardsByType.itens.push(cardId);
        }
      }
    });

    // Validar quantidade de lendas
    if (cardsByType.lendas.length !== DECK_RULES.REQUIRED_LENDAS) {
      errors.push(`Deck deve ter exatamente ${DECK_RULES.REQUIRED_LENDAS} lendas. Atual: ${cardsByType.lendas.length}`);
    }

    // Validar quantidade de itens
    if (cardsByType.itens.length !== DECK_RULES.REQUIRED_ITENS) {
      errors.push(`Deck deve ter exatamente ${DECK_RULES.REQUIRED_ITENS} itens. Atual: ${cardsByType.itens.length}`);
    }
  }

  // Validações de balanceamento (warnings)
  if (availableCards.length > 0) {
    const deckCardDetails = deckCards
      .map(id => availableCards.find(card => card.id == id))
      .filter(Boolean);

    // Verificar diversidade de categorias
    const categories = new Set(deckCardDetails.map(card => card.category).filter(Boolean));
    if (categories.size === 1) {
      warnings.push('Deck com apenas uma categoria pode ser previsível');
    }

    // Verificar distribuição de raridade
    const rarities = deckCardDetails.map(card => card.rarity || card.raridade).filter(Boolean);
    const legendaryCount = rarities.filter(r => 
      r.toLowerCase().includes('legendary') || 
      r.toLowerCase().includes('lendária') ||
      r.toLowerCase().includes('épica') ||
      r.toLowerCase().includes('epic')
    ).length;
    
    if (legendaryCount > deckCards.length * 0.3) {
      warnings.push('Muitas cartas raras podem tornar o deck inconsistente');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      size: deckCards.length,
      uniqueCards: Object.keys(cardCounts).length,
      categories: availableCards.length > 0 ? 
        new Set(deckCards.map(id => {
          const card = availableCards.find(c => c.id == id);
          return card?.category;
        }).filter(Boolean)).size : 0
    }
  };
}

/**
 * Valida se um deck pode ser usado em uma partida específica
 * @param {Array} deckCards - Array de IDs das cartas do deck
 * @param {Array} playerCollection - Coleção do jogador
 * @param {string} gameMode - Modo de jogo ('bot', 'casual', 'ranked', 'custom')
 * @returns {Object} - Resultado da validação
 */
export function validateDeckForGame(deckCards, playerCollection, gameMode = 'casual') {
  const validation = validateDeck(deckCards, playerCollection);

  // Regras específicas por modo de jogo
  if (gameMode === 'ranked') {
    // Modo ranqueado é mais rigoroso
    if (validation.isValid && deckCards.length < 25) {
      validation.warnings.push('Recomendado pelo menos 25 cartas para partidas ranqueadas');
    }
  }

  if (gameMode === 'bot') {
    // Modo contra bot é mais flexível
    if (deckCards.length >= 15 && deckCards.length < DECK_RULES.MIN_SIZE) {
      validation.warnings.push('Deck pequeno, mas permitido contra bots');
      // Remove o erro de tamanho mínimo para modo bot
      validation.errors = validation.errors.filter(error => 
        !error.includes('Deck muito pequeno')
      );
      validation.isValid = validation.errors.length === 0;
    }
  }

  return validation;
}

/**
 * Gera um deck inicial válido a partir de uma coleção
 * @param {Array} availableCards - Cartas disponíveis
 * @param {number} targetSize - Tamanho desejado do deck
 * @returns {Array} - Array de IDs das cartas selecionadas
 */
export function generateStarterDeck(availableCards, targetSize = DECK_RULES.MIN_SIZE) {
  if (!Array.isArray(availableCards) || availableCards.length === 0) {
    return [];
  }

  // Priorizar cartas starter se disponíveis
  const starterCards = availableCards.filter(card => card.is_starter);
  const regularCards = availableCards.filter(card => !card.is_starter);
  
  const selectedCards = [];
  
  // Adicionar cartas starter primeiro
  for (const card of starterCards) {
    if (selectedCards.length >= targetSize) break;
    selectedCards.push(card.id);
  }
  
  // Completar com cartas regulares se necessário
  for (const card of regularCards) {
    if (selectedCards.length >= targetSize) break;
    if (!selectedCards.includes(card.id)) {
      selectedCards.push(card.id);
    }
  }
  
  return selectedCards.slice(0, targetSize);
}

/**
 * Formata mensagens de erro/warning de validação para exibição
 * @param {Object} validationResult - Resultado da validateDeck
 * @returns {string} - Mensagem formatada
 */
export function formatValidationMessage(validationResult) {
  const { isValid, errors, warnings } = validationResult;
  
  if (isValid && warnings.length === 0) {
    return 'Deck válido e pronto para batalha!';
  }
  
  let message = '';
  
  if (!isValid) {
    message += '❌ Erros:\n' + errors.map(error => `• ${error}`).join('\n');
  }
  
  if (warnings.length > 0) {
    if (message) message += '\n\n';
    message += '⚠️ Avisos:\n' + warnings.map(warning => `• ${warning}`).join('\n');
  }
  
  return message;
}