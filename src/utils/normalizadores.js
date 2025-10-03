// src/utils/normalizadores.js
// Funções genéricas de normalização e detecção de tipos

import { 
  primeiroValorDefinido, 
  valorComPadrao,
  valorFoiDefinido 
} from './valores';

/**
 * Normaliza texto para comparação (remove acentos, converte para minúsculas)
 * @param {*} valor - Valor a ser normalizado
 * @returns {string} - Texto normalizado
 */
export function normalizarTextoParaComparacao(valor) {
  if (!valorFoiDefinido(valor)) {
    return '';
  }
  
  const texto = String(valor);
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Normaliza raridade para chave única
 * @param {string} raridade - Raridade a normalizar
 * @returns {string} - Chave normalizada
 */
export function normalizarRaridade(raridade) {
  const chave = normalizarTextoParaComparacao(raridade);
  
  const mapeamento = {
    'common': 'comum',
    'uncommon': 'incomum',
    'rare': 'raro',
    'epic': 'epico',
    'legendary': 'lendario',
    'mythic': 'mitico'
  };
  
  return valorComPadrao(mapeamento[chave], chave);
}

/**
 * Normaliza tipo de item para chave única
 * @param {string} tipoItem - Tipo do item
 * @returns {string} - Chave normalizada
 */
export function normalizarTipoItem(tipoItem) {
  const chave = normalizarTextoParaComparacao(tipoItem);
  
  const mapeamento = {
    'consumable': 'consumivel',
    'equipment': 'equipamento',
    'artifact': 'artefato',
    'relic': 'reliquia',
    'scroll': 'pergaminho'
  };
  
  return valorComPadrao(mapeamento[chave], chave);
}

/**
 * Detecta se uma carta é do tipo lenda
 * @param {Object} carta - Carta a verificar
 * @returns {boolean} - true se for lenda
 */
export function ehCartaDeLenda(carta) {
  if (!carta) {
    return false;
  }
  
  const categoria = normalizarTextoParaComparacao(
    primeiroValorDefinido(carta.categoria, carta.category)
  );
  const tipo = normalizarTextoParaComparacao(
    primeiroValorDefinido(carta.tipo, carta.type, carta.cardType, carta.card_type)
  );
  
  const termosLenda = ['lenda', 'legend', 'creature'];
  
  return termosLenda.some(termo => 
    categoria.includes(termo) || tipo.includes(termo)
  );
}

/**
 * Detecta se uma carta é do tipo item
 * @param {Object} carta - Carta a verificar
 * @returns {boolean} - true se for item
 */
export function ehCartaDeItem(carta) {
  if (!carta) {
    return false;
  }
  
  // Verifica campos específicos de itens
  if (valorFoiDefinido(carta.tipo_item) || valorFoiDefinido(carta.itemType)) {
    return true;
  }
  
  if (valorFoiDefinido(carta.effects) || valorFoiDefinido(carta.efeito)) {
    return true;
  }
  
  const categoria = normalizarTextoParaComparacao(
    primeiroValorDefinido(carta.categoria, carta.category)
  );
  const tipo = normalizarTextoParaComparacao(
    primeiroValorDefinido(carta.tipo, carta.type, carta.cardType, carta.card_type)
  );
  
  const termosItem = ['item', 'equipamento', 'equipment', 'consumivel', 'consumable', 'artefato', 'artifact'];
  
  return termosItem.some(termo => 
    categoria.includes(termo) || tipo.includes(termo)
  );
}

/**
 * Extrai URL de imagem de diferentes estruturas de dados
 * @param {Object} carta - Carta com imagens
 * @param {string} tipoPreferido - 'retrato' ou 'completa'
 * @returns {string} - URL da imagem ou placeholder
 */
export function extrairImagemDaCarta(carta, tipoPreferido = 'retrato') {
  if (!carta) {
    return '/images/placeholder.svg';
  }
  
  const imagens = primeiroValorDefinido(carta.imagens, carta.images, {});
  
  if (tipoPreferido === 'retrato') {
    return primeiroValorDefinido(
      imagens.retrato,
      imagens.portrait,
      imagens.completa,
      imagens.full,
      carta.imagem,
      carta.image,
      '/images/placeholder.svg'
    );
  }
  
  return primeiroValorDefinido(
    imagens.completa,
    imagens.full,
    imagens.retrato,
    imagens.portrait,
    carta.imagem,
    carta.image,
    '/images/placeholder.svg'
  );
}

/**
 * Normaliza estrutura de imagens para formato padrão
 * @param {Object} dadosBrutos - Dados com imagens em qualquer formato
 * @returns {Object} - { retrato: string, completa: string }
 */
export function normalizarEstruturaDeImagens(dadosBrutos) {
  if (!dadosBrutos) {
    return {
      retrato: '/images/placeholder.svg',
      completa: '/images/placeholder.svg'
    };
  }
  
  const imagens = primeiroValorDefinido(dadosBrutos.imagens, dadosBrutos.images, {});
  
  const retrato = primeiroValorDefinido(
    imagens.retrato,
    imagens.portrait,
    dadosBrutos.imagem,
    dadosBrutos.image,
    '/images/placeholder.svg'
  );
  
  const completa = primeiroValorDefinido(
    imagens.completa,
    imagens.full,
    retrato,
    '/images/placeholder.svg'
  );
  
  return { retrato, completa };
}
