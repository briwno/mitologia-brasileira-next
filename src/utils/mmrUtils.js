// src/utils/mmrUtils.js
// Utilitários para sistema de MMR e ranking

/**
 * Calcula o ranking baseado no MMR usando as constantes definidas
 * @param {number} mmr - MMR do jogador
 * @returns {string} - Ranking do jogador (ex: "Bronze 1", "Prata 2", etc.)
 */
export function calcularRankingPorMMR(mmr) {
  const mmrRankings = [
    { min: 0, max: 33, rank: 'Bronze 1' },
    { min: 34, max: 66, rank: 'Bronze 2' },
    { min: 67, max: 99, rank: 'Bronze 3' },

    { min: 100, max: 166, rank: 'Prata 1' },
    { min: 167, max: 233, rank: 'Prata 2' },
    { min: 234, max: 299, rank: 'Prata 3' },

    { min: 300, max: 366, rank: 'Ouro 1' },
    { min: 367, max: 433, rank: 'Ouro 2' },
    { min: 434, max: 499, rank: 'Ouro 3' },

    { min: 500, max: 599, rank: 'Platina 1' },
    { min: 600, max: 699, rank: 'Platina 2' },
    { min: 700, max: 799, rank: 'Platina 3' },

    { min: 800, max: 899, rank: 'Diamante 1' },
    { min: 900, max: 999, rank: 'Diamante 2' },
    { min: 1000, max: 1200, rank: 'Diamante 3' },

    { min: 1201, max: 1350, rank: 'Mestre' },
    { min: 1351, max: 1650, rank: 'Grão-Mestre' },
    { min: 1651, max: Infinity, rank: 'Lenda' },
  ];

  const ranking = mmrRankings.find(r => mmr >= r.min && mmr <= r.max);
  if (ranking) {
    return ranking.rank;
  } else {
    return 'Bronze 1';
  }
}

/**
 * Retorna o progresso do jogador no ranking atual
 * @param {number} mmr - MMR do jogador
 * @returns {object} - { atual, proximo, progresso, mmrAtual, mmrProximo }
 */
export function calcularProgressoRanking(mmr) {
  const mmrRankings = [
    { min: 0, max: 33, rank: 'Bronze 1' },
    { min: 34, max: 66, rank: 'Bronze 2' },
    { min: 67, max: 99, rank: 'Bronze 3' },

    { min: 100, max: 166, rank: 'Prata 1' },
    { min: 167, max: 233, rank: 'Prata 2' },
    { min: 234, max: 299, rank: 'Prata 3' },

    { min: 300, max: 366, rank: 'Ouro 1' },
    { min: 367, max: 433, rank: 'Ouro 2' },
    { min: 434, max: 499, rank: 'Ouro 3' },

    { min: 500, max: 599, rank: 'Platina 1' },
    { min: 600, max: 699, rank: 'Platina 2' },
    { min: 700, max: 799, rank: 'Platina 3' },

    { min: 800, max: 899, rank: 'Diamante 1' },
    { min: 900, max: 999, rank: 'Diamante 2' },
    { min: 1000, max: 1200, rank: 'Diamante 3' },

    { min: 1201, max: 1350, rank: 'Mestre' },
    { min: 1351, max: 1650, rank: 'Grão-Mestre' },
    { min: 1651, max: Infinity, rank: 'Lenda' },
  ];

  const indiceAtual = mmrRankings.findIndex(r => mmr >= r.min && mmr <= r.max);
  const rankingAtual = mmrRankings[indiceAtual];
  const proximoRanking = mmrRankings[indiceAtual + 1];
  
  if (!rankingAtual) {
    return {
      atual: 'Bronze 1',
      proximo: 'Bronze 2',
      progresso: 0,
      mmrAtual: mmr,
      mmrProximo: 34
    };
  }

  if (!proximoRanking) {
    // Já é Lenda
    return {
      atual: rankingAtual.rank,
      proximo: 'Lenda Máxima',
      progresso: 100,
      mmrAtual: mmr,
      mmrProximo: mmr
    };
  }

  const progressoAtual = mmr - rankingAtual.min;
  const totalParaProximo = rankingAtual.max - rankingAtual.min + 1;
  const porcentagemProgresso = Math.min(100, (progressoAtual / totalParaProximo) * 100);

  return {
    atual: rankingAtual.rank,
    proximo: proximoRanking.rank,
    progresso: Math.round(porcentagemProgresso),
    mmrAtual: mmr,
    mmrProximo: proximoRanking.min
  };
}

/**
 * Retorna o ícone correspondente ao ranking
 * @param {string} ranking - Nome do ranking
 * @returns {string} - Emoji/ícone do ranking
 */
export function obterIconeRanking(ranking) {
  if (ranking.includes('Bronze')) return '🥉';
  if (ranking.includes('Prata')) return '🥈';
  if (ranking.includes('Ouro')) return '🥇';
  if (ranking.includes('Platina')) return '💎';
  if (ranking.includes('Diamante')) return '💠';
  if (ranking.includes('Mestre')) return '👑';
  if (ranking.includes('Grão-Mestre')) return '⚡';
  if (ranking.includes('Lenda')) return '🌟';
  return '🏆';
}

/**
 * Retorna a cor correspondente ao ranking para Tailwind CSS
 * @param {string} ranking - Nome do ranking
 * @returns {string} - Classe CSS de cor
 */
export function obterCorRanking(ranking) {
  if (ranking.includes('Bronze')) return 'text-orange-600';
  if (ranking.includes('Prata')) return 'text-gray-400';
  if (ranking.includes('Ouro')) return 'text-yellow-400';
  if (ranking.includes('Platina')) return 'text-cyan-400';
  if (ranking.includes('Diamante')) return 'text-blue-400';
  if (ranking.includes('Mestre')) return 'text-purple-400';
  if (ranking.includes('Grão-Mestre')) return 'text-pink-400';
  if (ranking.includes('Lenda')) return 'text-amber-300';
  return 'text-gray-400';
}