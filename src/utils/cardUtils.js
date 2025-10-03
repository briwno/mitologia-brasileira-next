// src/utils/cardUtils.js

import {
  valorComPadrao,
  primeiroValorDefinido,
  valorFoiDefinido,
  valorQuandoVerdadeiro,
} from './valores';

// Mapas de tradução (API -> PT-BR) centralizados
export const TRANSLATION_MAPS = {
  RARITY: { 
    COMMON: 'Comum',
    UNCOMMON: 'Incomum', 
    RARE: 'Raro',
    EPIC: 'Épico', 
    LEGENDARY: 'Lendário', 
    MYTHIC: 'Mítico' 
  },
  REGION: { 
    AMAZONIA: 'Amazônia', 
    NORTHEAST: 'Nordeste', 
    SOUTHEAST: 'Sudeste', 
    SOUTH: 'Sul', 
    MIDWEST: 'Centro-Oeste', 
    NATIONAL: 'Nacional' 
  },
  CATEGORY: { 
    GUARDIANS: 'Guardiões da Floresta', 
    SPIRITS: 'Espíritos das Águas', 
    HAUNTS: 'Assombrações', 
    PROTECTORS: 'Protetores Humanos', 
    MYSTICAL: 'Entidades Místicas' 
  },
  ELEMENT: { 
    EARTH: 'Terra', 
    WATER: 'Água', 
    FIRE: 'Fogo', 
    AIR: 'Ar', 
    SPIRIT: 'Espírito' 
  },
  SEASON: { 
    CARNIVAL: 'Carnaval', 
    SAO_JOAO: 'São João', 
    FESTA_JUNINA: 'Festa Junina', 
    CHRISTMAS: 'Natal' 
  },
  ITEM_TYPE: { 
    CONSUMABLE: 'Consumível', 
    EQUIPMENT: 'Equipamento', 
    ARTIFACT: 'Artefato', 
    RELIC: 'Relíquia', 
    SCROLL: 'Pergaminho' 
  }
};
 
export const inferirCustoParaJogar = (carta) => {
  if (!carta) {
    return null;
  }

  const habilidadePrincipal = carta.abilities && carta.abilities.skill1 ? carta.abilities.skill1.cost : null;
  const habilidadeBasica = carta.abilities && carta.abilities.basic ? carta.abilities.basic.cost : null;
  const habilidadeFinal = carta.abilities && carta.abilities.ultimate ? carta.abilities.ultimate.cost : null;
  const custoInferido = primeiroValorDefinido(habilidadePrincipal, habilidadeBasica, habilidadeFinal);

  if (typeof custoInferido === 'number') {
    return custoInferido;
  }

  const custoAlternativo = primeiroValorDefinido(carta.cost, carta.custo);
  if (typeof custoAlternativo === 'number') {
    return custoAlternativo;
  }

  return null;
};

/**
 * Função utilitária para traduzir valores usando os mapas
 * @param {string} value - Valor a ser traduzido
 * @param {Object} map - Mapa de tradução
 * @returns {string} - Valor traduzido ou original se não encontrado
 */
export const traduzirValor = (valor, mapa) => {
  if (!valorFoiDefinido(valor)) {
    return valor;
  }
  if (!mapa || typeof mapa !== 'object') {
    return valor;
  }
  // Normalizar para MAIÚSCULAS para bater com as chaves do mapa
  const chaveNormalizada = typeof valor === 'string' ? valor.toUpperCase() : valor;
  if (valorFoiDefinido(mapa[chaveNormalizada])) {
    return mapa[chaveNormalizada];
  }
  // Tentar busca direta caso não seja string
  if (valorFoiDefinido(mapa[valor])) {
    return mapa[valor];
  }
  return valor;
};

/**
 * Formatar labels de enum (ex: SOME_VALUE -> Some Value)
 * @param {string} value - Valor enum
 * @returns {string} - Label formatado
 */
export const formatarRotuloEnum = (valor) => {
  if (typeof valor !== 'string') {
    return valor;
  }
  const minusculo = valor.toLowerCase();
  const partes = minusculo.split('_');
  const rotulo = partes.map((palavra) => {
    if (palavra.length === 0) {
      return palavra;
    }
    const primeiraLetra = palavra.charAt(0).toUpperCase();
    const restante = palavra.slice(1);
    return `${primeiraLetra}${restante}`;
  });
  return rotulo.join(' ');
};

/**
 * Obter classes CSS para frames de raridade
 * @param {string} rarity - Raridade da carta
 * @returns {string} - Classes CSS
 */
export const obterClassesDeRaridade = (raridade) => {
  const valor = raridade;
  if (valor === TRANSLATION_MAPS.RARITY.MYTHIC) {
    return 'border-red-500 text-red-400 bg-red-900/20';
  }
  if (valor === TRANSLATION_MAPS.RARITY.LEGENDARY) {
    return 'border-yellow-500 text-yellow-400 bg-yellow-900/20';
  }
  if (valor === TRANSLATION_MAPS.RARITY.EPIC) {
    return 'border-purple-500 text-purple-400 bg-purple-900/20';
  }
  return 'border-gray-500 text-gray-400 bg-gray-900/20';
};

/**
 * Obter gradientes CSS para raridade
 * @param {string} rarity - Raridade da carta
 * @returns {string} - Classes de gradiente
 */
export const obterGradienteDeRaridade = (raridade) => {
  const valor = raridade;
  if (valor === TRANSLATION_MAPS.RARITY.MYTHIC) {
    return 'from-red-400/20 to-red-600/30 border-red-400/50';
  }
  if (valor === TRANSLATION_MAPS.RARITY.LEGENDARY) {
    return 'from-yellow-400/20 to-yellow-600/30 border-yellow-400/50';
  }
  if (valor === TRANSLATION_MAPS.RARITY.EPIC) {
    return 'from-purple-400/20 to-purple-600/30 border-purple-400/50';
  }
  return 'from-gray-400/20 to-gray-600/30 border-gray-400/50';
};

/**
 * Mapear carta da API para o formato local
 * @param {Object} apiCard - Carta no formato da API
 * @returns {Object} - Carta no formato local
 */
export const mapearCartaDaApi = (cartaApi) => {
  if (!cartaApi) {
    return null;
  }

  const bonusSazonalBruto = valorComPadrao(cartaApi.seasonalBonus, cartaApi.seasonal_bonus);
  let detalhesBonus = null;
  if (bonusSazonalBruto) {
    const chaveEstacao = valorComPadrao(bonusSazonalBruto.season, bonusSazonalBruto.estacao);
    const estacaoTraduzida = traduzirValor(chaveEstacao, TRANSLATION_MAPS.SEASON);
    const estacaoFinal = valorFoiDefinido(estacaoTraduzida) ? estacaoTraduzida : formatarRotuloEnum(chaveEstacao);
    const descricao = primeiroValorDefinido(
      bonusSazonalBruto.description,
      bonusSazonalBruto.descricao,
      bonusSazonalBruto.text,
      ''
    );
    const multiplicador = primeiroValorDefinido(
      bonusSazonalBruto.multiplier,
      bonusSazonalBruto.multiplicador,
      bonusSazonalBruto.bonus
    );
    detalhesBonus = {
      estacao: estacaoFinal,
      descricao,
      multiplicador: multiplicador,
    };
  }

  const custoInferido = inferirCustoParaJogar(cartaApi);
  let custoFinal = null;
  if (typeof custoInferido === 'number') {
    custoFinal = custoInferido;
  }

  const descricao = primeiroValorDefinido(
    cartaApi.description,
    cartaApi.lore,
    cartaApi.history
  );

  const imagens = valorQuandoVerdadeiro(cartaApi.images, {});
  const habilidades = valorQuandoVerdadeiro(cartaApi.abilities, {});
  const tipo = primeiroValorDefinido(cartaApi.cardType, cartaApi.card_type, 'creature');
  const vida = primeiroValorDefinido(cartaApi.life, cartaApi.health, 0);

  return {
    id: cartaApi.id,
    nome: cartaApi.name,
    regiao: traduzirValor(cartaApi.region, TRANSLATION_MAPS.REGION),
    categoria: traduzirValor(cartaApi.category, TRANSLATION_MAPS.CATEGORY),
    raridade: traduzirValor(cartaApi.rarity, TRANSLATION_MAPS.RARITY),
    elemento: traduzirValor(cartaApi.element, TRANSLATION_MAPS.ELEMENT),
    ataque: valorComPadrao(cartaApi.attack, 0),
    defesa: valorComPadrao(cartaApi.defense, 0),
    vida,
    custo: custoFinal,
    descricao,
    imagens,
    habilidades,
    tipo,
    tags: valorQuandoVerdadeiro(cartaApi.tags, []),
    bonusSazonal: detalhesBonus,
    isStarter: valorComPadrao(cartaApi.is_starter, false),
    condicaoDesbloqueio: valorComPadrao(cartaApi.unlock_condition, cartaApi.unlockCondition),
  };
};

/**
 * Obter classes CSS para wrapper modal padrão
 * @returns {string} - Classes CSS do modal
 */
export const obterClassesDeModal = () => {
  return 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4';
};

/**
 * Filtrar cartas baseado em critérios
 * @param {Array} cards - Array de cartas
 * @param {Object} filters - Filtros aplicados
 * @returns {Array} - Cartas filtradas
 */
export const filtrarCartas = (cartas, filtros = {}) => {
  if (!Array.isArray(cartas)) {
    return [];
  }

  return cartas.filter((carta) => {
    let condicaoBusca = true;
    if (filtros.search) {
      const termo = filtros.search.toLowerCase();
      const nome = valorComPadrao(carta.nome, '').toLowerCase();
      const regiao = valorComPadrao(carta.regiao, '').toLowerCase();
      const categoria = valorComPadrao(carta.categoria, '').toLowerCase();
      condicaoBusca = nome.includes(termo) || regiao.includes(termo) || categoria.includes(termo);
    }

    let condicaoRegiao = true;
    if (filtros.region && filtros.region !== 'all') {
      condicaoRegiao = carta.regiao === filtros.region;
    }

    let condicaoCategoria = true;
    if (filtros.category && filtros.category !== 'all') {
      condicaoCategoria = carta.categoria === filtros.category;
    }

    let condicaoRaridade = true;
    if (filtros.rarity && filtros.rarity !== 'all') {
      condicaoRaridade = carta.raridade === filtros.rarity;
    }

    let condicaoElemento = true;
    if (filtros.element && filtros.element !== 'all') {
      condicaoElemento = carta.elemento === filtros.element;
    }

    return condicaoBusca && condicaoRegiao && condicaoCategoria && condicaoRaridade && condicaoElemento;
  });
};

/**
 * Obter ícone do tipo de carta
 * @param {string} cardType - Tipo da carta
 * @returns {string} - Emoji do tipo
 */
export const obterIconeTipoCarta = (tipoCarta) => {
  let texto = '';
  if (valorFoiDefinido(tipoCarta)) {
    texto = tipoCarta.toString().toLowerCase();
  }
  if (texto === 'spell') {
    return '✨';
  }
  if (texto === 'artifact') {
    return '⚱️';
  }
  return '👾';
};