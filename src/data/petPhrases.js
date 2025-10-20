// src/data/petPhrases.js
// Sistema de frases e reações do mascote Ybyra'í (Espírito da Ka'aguy)

/**
 * Frases do mascote categorizadas por situação
 * O tom das frases se adapta ao nível do jogador
 */

export const SITUACOES_MASCOTE = {
  PRIMEIRA_VEZ: 'primeira_vez',
  VITORIA: 'vitoria',
  DERROTA: 'derrota',
  SEQUENCIA_VITORIAS: 'sequencia_vitorias',
  MUSEU: 'museu',
  BOOSTER: 'booster',
  NOVA_CARTA_COMUM: 'nova_carta_comum',
  NOVA_CARTA_RARA: 'nova_carta_rara',
  NOVA_CARTA_LENDARIA: 'nova_carta_lendaria',
  NIVEL_UP: 'nivel_up',
  INICIO_BATALHA: 'inicio_batalha',
  LOJA: 'loja',
  AMIGOS: 'amigos',
  QUIZ: 'quiz',
  DECK: 'deck',
  RANKING: 'ranking',
  SAUDACAO_MANHA: 'saudacao_manha',
  SAUDACAO_TARDE: 'saudacao_tarde',
  SAUDACAO_NOITE: 'saudacao_noite',
  OCIOSO: 'ocioso',
  DICA_ESTRATEGIA: 'dica_estrategia',
  CONQUISTA: 'conquista'
};

export const FRASES_MASCOTE = {
  // Primeira vez no jogo
  primeira_vez: [
    { texto: "A floresta te observa, novo guardião.", nivel: 1 },
    { texto: "Bem-vindo à Ka'aguy. Sua jornada começa aqui.", nivel: 1 },
    { texto: "Os espíritos antigos sorriem com sua chegada.", nivel: 1 }
  ],

  // Vitórias
  vitoria: [
    { texto: "A força da mata está contigo!", nivel: 1 },
    { texto: "Seu coração bate no ritmo da floresta!", nivel: 1 },
    { texto: "Os ventos celebram sua vitória!", nivel: 5 },
    { texto: "A sabedoria dos antigos guiou seus passos.", nivel: 10 },
    { texto: "Você honra os espíritos guardiães!", nivel: 15 },
    { texto: "Como uma grande árvore, sua força se enraíza.", nivel: 20 }
  ],

  // Sequência de vitórias
  sequencia_vitorias: [
    { texto: "Três vitórias! A floresta ressoa com seu poder!", nivel: 1 },
    { texto: "Imparável como o rio em cheia!", nivel: 5 },
    { texto: "Os espíritos cantam suas conquistas!", nivel: 10 },
    { texto: "Uma lenda está nascendo entre as árvores...", nivel: 15 }
  ],

  // Derrotas
  derrota: [
    { texto: "Mesmo a árvore mais forte cai — levante-se de novo.", nivel: 1 },
    { texto: "A floresta ensina pela adversidade.", nivel: 1 },
    { texto: "Todo guardião conhece a derrota antes da maestria.", nivel: 5 },
    { texto: "As raízes profundas resistem à tempestade. Persista.", nivel: 10 },
    { texto: "A cada queda, a terra te fortalece.", nivel: 15 },
    { texto: "Até o Curupira tropeça. O que importa é se reerguer.", nivel: 20 }
  ],

  // Museu
  museu: [
    { texto: "Cada carta guarda a memória de um espírito antigo.", nivel: 1 },
    { texto: "Conheça suas raízes, guardião. O passado ilumina o caminho.", nivel: 1 },
    { texto: "As lendas sussurram seus segredos aqui...", nivel: 5 },
    { texto: "Neste lugar, a sabedoria dos antepassados vive.", nivel: 10 },
    { texto: "Sinta a energia ancestral que pulsa nestas histórias.", nivel: 15 }
  ],

  // Abrindo booster
  booster: [
    { texto: "O vento sussurra... o que será revelado?", nivel: 1 },
    { texto: "A floresta prepara seus presentes.", nivel: 1 },
    { texto: "Novos espíritos aguardam para se unir a você.", nivel: 5 },
    { texto: "Que as bênçãos da mata estejam contigo!", nivel: 10 },
    { texto: "O destino tece suas cartas...", nivel: 15 }
  ],

  // Nova carta comum
  nova_carta_comum: [
    { texto: "Todo espírito tem seu valor na floresta.", nivel: 1 },
    { texto: "Pequenas sementes se tornam grandes árvores.", nivel: 1 },
    { texto: "A humildade é o primeiro passo da sabedoria.", nivel: 5 }
  ],

  // Nova carta rara
  nova_carta_rara: [
    { texto: "Um espírito poderoso se junta à sua jornada!", nivel: 1 },
    { texto: "A floresta reconhece sua dedicação.", nivel: 1 },
    { texto: "Que sorte! Os ventos sopram a seu favor.", nivel: 5 },
    { texto: "Um guardião raro confia em suas mãos.", nivel: 10 }
  ],

  // Nova carta lendária
  nova_carta_lendaria: [
    { texto: "As estrelas se alinham! Uma lenda ancestral desperta!", nivel: 1 },
    { texto: "Os espíritos mais antigos reconhecem sua força!", nivel: 5 },
    { texto: "Que honra! Um protetor lendário escolheu você.", nivel: 10 },
    { texto: "A mata inteira testemunha este momento sagrado!", nivel: 15 }
  ],

  // Nível subiu
  nivel_up: [
    { texto: "Você cresce como a grande Samaúma! Parabéns!", nivel: 1 },
    { texto: "Suas raízes se aprofundam, sua copa se expande.", nivel: 1 },
    { texto: "A floresta reconhece sua evolução, guardião!", nivel: 5 },
    { texto: "Mais forte, mais sábio. Continue sua jornada!", nivel: 10 },
    { texto: "Os espíritos celebram seu crescimento!", nivel: 15 }
  ],

  // Início de batalha
  inicio_batalha: [
    { texto: "Que a sabedoria da mata guie sua estratégia.", nivel: 1 },
    { texto: "Respire fundo. A batalha começa.", nivel: 1 },
    { texto: "Confie nos espíritos que carrega.", nivel: 5 },
    { texto: "Cada movimento é uma dança com o destino.", nivel: 10 },
    { texto: "Mostre a força que habita em você!", nivel: 15 }
  ],

  // Loja
  loja: [
    { texto: "Escolha com sabedoria. Nem tudo que brilha é precioso.", nivel: 1 },
    { texto: "A floresta oferece seus tesouros.", nivel: 1 },
    { texto: "Invista no que fortalece suas raízes.", nivel: 5 },
    { texto: "O verdadeiro valor está além do ouro.", nivel: 10 }
  ],

  // Amigos
  amigos: [
    { texto: "Sozinhos somos galhos. Juntos, somos floresta.", nivel: 1 },
    { texto: "Compartilhe sua jornada com outros guardiões.", nivel: 1 },
    { texto: "A força da comunidade é a força da mata.", nivel: 5 },
    { texto: "Amizades são pontes entre espíritos.", nivel: 10 }
  ],

  // Quiz
  quiz: [
    { texto: "O conhecimento é luz na escuridão da floresta.", nivel: 1 },
    { texto: "Aprenda as histórias. Elas guardam segredos.", nivel: 1 },
    { texto: "Cada resposta certa honra nossos ancestrais.", nivel: 5 },
    { texto: "A sabedoria é o maior tesouro da Ka'aguy.", nivel: 10 }
  ],

  // Deck
  deck: [
    { texto: "Monte seu deck como quem tece uma rede: com cuidado.", nivel: 1 },
    { texto: "Equilíbrio e harmonia. É o caminho da floresta.", nivel: 1 },
    { texto: "Cada carta escolhida define seu estilo de batalha.", nivel: 5 },
    { texto: "A sinergia entre espíritos é essencial.", nivel: 10 },
    { texto: "Um deck bem construído é uma obra de arte.", nivel: 15 }
  ],

  // Ranking
  ranking: [
    { texto: "A jornada importa mais que a posição.", nivel: 1 },
    { texto: "Compare-se apenas com quem você foi ontem.", nivel: 1 },
    { texto: "Grandes guerreiros não temem o ranking.", nivel: 5 },
    { texto: "Sua verdadeira força está no coração, não na lista.", nivel: 10 },
    { texto: "Busque glória, mas não se perca nela.", nivel: 15 }
  ],

  // Saudações por período
  saudacao_manha: [
    { texto: "O sol nasce e a floresta desperta. Bom dia, guardião!", nivel: 1 },
    { texto: "A manhã traz novas oportunidades. Que dia será hoje?", nivel: 1 },
    { texto: "Os pássaros cantam sua chegada. Bem-vindo!", nivel: 5 }
  ],

  saudacao_tarde: [
    { texto: "A tarde é momento de ação. O que faremos hoje?", nivel: 1 },
    { texto: "O sol está alto e a floresta pulsa vida!", nivel: 1 },
    { texto: "Boa tarde, guardião. Pronto para aventuras?", nivel: 5 }
  ],

  saudacao_noite: [
    { texto: "A noite chega e os espíritos se fortalecem.", nivel: 1 },
    { texto: "Sob a lua, a magia da floresta brilha mais forte.", nivel: 1 },
    { texto: "Boa noite, guardião. A escuridão não nos assusta.", nivel: 5 }
  ],

  // Estado ocioso
  ocioso: [
    { texto: "...", nivel: 1 },
    { texto: "*observa a floresta*", nivel: 1 },
    { texto: "*escuta o vento*", nivel: 1 },
    { texto: "*balança suavemente*", nivel: 5 },
    { texto: "Hmmm...", nivel: 5 },
    { texto: "*brilha levemente*", nivel: 10 }
  ],

  // Dicas de estratégia
  dica_estrategia: [
    { texto: "Dica: Cartas de fogo são fortes contra natureza.", nivel: 1 },
    { texto: "Dica: Mantenha sempre cartas de suporte no deck.", nivel: 1 },
    { texto: "Dica: Observe o MMR do oponente antes da batalha.", nivel: 5 },
    { texto: "Dica: Combine elementos para criar combos poderosos.", nivel: 10 },
    { texto: "Dica: Não subestime cartas comuns bem posicionadas.", nivel: 10 },
    { texto: "Dica: A defesa pode ser tão importante quanto o ataque.", nivel: 15 }
  ],

  // Conquistas
  conquista: [
    { texto: "Uma conquista desbloqueada! Os espíritos se orgulham!", nivel: 1 },
    { texto: "Você deixa sua marca na história da floresta!", nivel: 5 },
    { texto: "Mais uma prova de sua dedicação, guardião!", nivel: 10 },
    { texto: "A Ka'aguy registra seus feitos para sempre!", nivel: 15 }
  ]
};

/**
 * Seleciona uma frase apropriada baseada na situação e nível do jogador
 * @param {string} situacao - Uma das chaves de SITUACOES_MASCOTE
 * @param {number} nivelJogador - Nível atual do jogador
 * @returns {string} - Frase selecionada
 */
export function obterFraseMascote(situacao, nivelJogador = 1) {
  const frases = FRASES_MASCOTE[situacao];
  
  if (!frases || frases.length === 0) {
    return "..."; // Frase padrão se não encontrar
  }

  // Filtrar frases apropriadas para o nível do jogador
  const frasesApropriadas = frases.filter(f => f.nivel <= nivelJogador);
  
  if (frasesApropriadas.length === 0) {
    // Se não houver frases para o nível, usar a primeira disponível
    return frases[0].texto;
  }

  // Selecionar uma frase aleatória apropriada
  const fraseAleatoria = frasesApropriadas[Math.floor(Math.random() * frasesApropriadas.length)];
  return fraseAleatoria.texto;
}

/**
 * Obtém uma saudação baseada no horário atual
 * @param {number} nivelJogador - Nível atual do jogador
 * @returns {string} - Saudação apropriada
 */
export function obterSaudacaoMascote(nivelJogador = 1) {
  const hora = new Date().getHours();
  
  let situacao;
  if (hora >= 5 && hora < 12) {
    situacao = SITUACOES_MASCOTE.SAUDACAO_MANHA;
  } else if (hora >= 12 && hora < 18) {
    situacao = SITUACOES_MASCOTE.SAUDACAO_TARDE;
  } else {
    situacao = SITUACOES_MASCOTE.SAUDACAO_NOITE;
  }
  
  return obterFraseMascote(situacao, nivelJogador);
}

/**
 * Determina a emoção do mascote baseada na situação
 * @param {string} situacao - Uma das chaves de SITUACOES_MASCOTE
 * @returns {string} - Tipo de emoção (feliz, triste, neutro, animado, pensando)
 */
export function obterEmocaoMascote(situacao) {
  const emocoesMap = {
    [SITUACOES_MASCOTE.VITORIA]: 'feliz',
    [SITUACOES_MASCOTE.SEQUENCIA_VITORIAS]: 'animado',
    [SITUACOES_MASCOTE.DERROTA]: 'triste',
    [SITUACOES_MASCOTE.NOVA_CARTA_LENDARIA]: 'animado',
    [SITUACOES_MASCOTE.NOVA_CARTA_RARA]: 'feliz',
    [SITUACOES_MASCOTE.NIVEL_UP]: 'animado',
    [SITUACOES_MASCOTE.CONQUISTA]: 'animado',
    [SITUACOES_MASCOTE.MUSEU]: 'pensando',
    [SITUACOES_MASCOTE.QUIZ]: 'pensando',
    [SITUACOES_MASCOTE.DECK]: 'pensando',
    [SITUACOES_MASCOTE.OCIOSO]: 'neutro'
  };
  
  return emocoesMap[situacao] || 'neutro';
}
