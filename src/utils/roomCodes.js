// src/utils/roomCodes.js

/**
 * Utilitário para geração e validação de códigos de sala de batalha
 */

/**
 * Gera um código de sala único baseado no modo de jogo
 * @param {string} mode - Modo de jogo: 'bot', 'ranked', 'custom'
 * @returns {string} Código da sala (ex: 'pvp_A3X9K')
 */
export function generateRoomCode(mode) {
  const prefixes = {
    bot: 'bot',
    ranked: 'pvp',
    custom: 'custom'
  };
  
  const prefix = prefixes[mode] || 'custom';
  const randomPart = generateRandomString(5);
  
  return `${prefix}_${randomPart}`;
}

/**
 * Gera string aleatória de caracteres alfanuméricos
 * @param {number} length - Tamanho da string
 * @returns {string} String aleatória
 */
function generateRandomString(length) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Remove caracteres confusos (I, O, 0, 1)
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Valida formato de código de sala
 * @param {string} code - Código a validar
 * @returns {boolean} True se válido
 */
export function validateRoomCode(code) {
  if (!code || typeof code !== 'string') return false;
  
  const pattern = /^(bot|pvp|custom)_[A-Z0-9]{5}$/;
  return pattern.test(code);
}

/**
 * Extrai o modo de jogo do código da sala
 * @param {string} code - Código da sala
 * @returns {string|null} Modo ('bot', 'ranked', 'custom') ou null se inválido
 */
export function extractModeFromCode(code) {
  if (!validateRoomCode(code)) return null;
  
  const prefix = code.split('_')[0];
  
  const modeMap = {
    bot: 'bot',
    pvp: 'ranked',
    custom: 'custom'
  };
  
  return modeMap[prefix] || null;
}

/**
 * Formata código para exibição amigável
 * @param {string} code - Código da sala
 * @returns {string} Código formatado (ex: 'PVP A3X9K')
 */
export function formatRoomCodeDisplay(code) {
  if (!validateRoomCode(code)) return code;
  
  const [prefix, id] = code.split('_');
  const formattedPrefix = prefix.toUpperCase();
  
  return `${formattedPrefix} ${id}`;
}

/**
 * Gera nome de sala amigável baseado no modo
 * @param {string} mode - Modo de jogo
 * @param {string} playerName - Nome do jogador
 * @returns {string} Nome da sala
 */
export function generateRoomName(mode, playerName = 'Anônimo') {
  const modeNames = {
    bot: 'Treino contra Bot',
    ranked: 'Partida Ranqueada',
    custom: 'Sala Personalizada'
  };
  
  const modeName = modeNames[mode] || 'Batalha';
  const timestamp = new Date().toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return `${modeName} - ${playerName} (${timestamp})`;
}

/**
 * Retorna ícone do modo de jogo
 * @param {string} mode - Modo de jogo
 * @returns {string} Emoji do modo
 */
export function getModeIcon(mode) {
  const icons = {
    bot: '🤖',
    ranked: '🏆',
    custom: '🏠'
  };
  
  return icons[mode] || '⚔️';
}

/**
 * Retorna descrição do modo de jogo
 * @param {string} mode - Modo de jogo
 * @returns {string} Descrição
 */
export function getModeDescription(mode) {
  const descriptions = {
    bot: 'Treinar contra IA - Não afeta ranking',
    ranked: 'Valendo pontos de MMR - Encontre oponente',
    custom: 'Crie ou entre em sala com código'
  };
  
  return descriptions[mode] || 'Modo de batalha';
}
