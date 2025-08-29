// src/data/cardsDatabase.js
export const CATEGORIAS_CARTAS = {
  GUARDIANS: 'Guardiões da Floresta',
  SPIRITS: 'Espíritos das Águas',
  HAUNTS: 'Assombrações',
  PROTECTORS: 'Protetores Humanos',
  MYSTICAL: 'Entidades Místicas'
};

export const RARIDADES_CARTAS = {
  EPIC: 'Épico',
  LEGENDARY: 'Lendário',
  MYTHIC: 'Mítico'
};

export const REGIOES = {
  AMAZONIA: 'Amazônia',
  NORTHEAST: 'Nordeste',
  SOUTHEAST: 'Sudeste',
  SOUTH: 'Sul',
  MIDWEST: 'Centro-Oeste',
  NATIONAL: 'Nacional'
};

export const TIPOS_CARTA = {
  CREATURE: 'creature',
  SPELL: 'spell',
  ARTIFACT: 'artifact'
};

export const ELEMENTOS = {
  EARTH: 'Terra',
  WATER: 'Água',
  FIRE: 'Fogo',
  AIR: 'Ar',
  SPIRIT: 'Espírito'
};

export const ESTACOES = {
  CARNIVAL: 'Carnaval',
  SAO_JOAO: 'São João',
  FESTA_JUNINA: 'Festa Junina',
  CHRISTMAS: 'Natal'
};

export const bancoDeCartas = [
  // REGIÃO AMAZÔNICA
  {
    id: 'cur001',
    nome: 'Curupira',
    regiao: REGIOES.AMAZONIA,
    categoria: CATEGORIAS_CARTAS.GUARDIANS,
    tipo: TIPOS_CARTA.CREATURE,
    custo: 5,
    ataque: 7,
	defesa: 8,
	vida: 15,
    raridade: RARIDADES_CARTAS.EPIC,
    elemento: ELEMENTOS.EARTH,
    habilidades: {
      skill1: { name: 'Confusão da Floresta', description: 'Reduz o ataque do oponente em 2 por 2 turnos', cost: 2, kind: 'debuff' },
      skill2: { name: 'Golpe de Vinha', description: 'Ataque reforçado pelas raízes', cost: 2, kind: 'damage', base: 2 },
      skill3: { name: 'Enredar', description: 'Atordoa o alvo por 1 turno', cost: 3, kind: 'stun', stun: 1 },
      skill4: { name: 'Fúria da Mata', description: 'Espíritos causam dano massivo e atordoam', cost: 4, kind: 'damage', base: 5, stun: 1 },
  skill5: { name: 'Despertar da Mata', description: 'Poder ancestral da floresta, golpe devastador após resistência em campo.', cost: 6, kind: 'damage', base: 8 },
  passive: { name: 'Protetor da Natureza', description: 'Ganha +1 de defesa para cada aliado da floresta em campo' }
    },
    historia: 'Protetor da floresta com cabelos vermelhos e pés virados para trás. Confunde caçadores e pune os que destroem a natureza.',
    descoberta: true,
    imagens: {
      retrato: '/images/cards/portraits/curupira.jpg',
      completa: '/images/cards/full/curupira.jpg'
    },
    tags: ['protetor', 'floresta', 'confusão', 'natureza'],
    condicaoDesbloqueio: 'Vitória em 5 partidas PvP',
    bonusSazonal: null
  },
  {
    id: 'cai001',
    nome: 'Caiçara',
    descoberta: true
  },
  {
    id: 'tupa001',
    nome: 'Tupã',
    regiao: REGIOES.AMAZONIA,
    categoria: CATEGORIAS_CARTAS.GUARDIANS,
    tipo: TIPOS_CARTA.CREATURE,
    custo: 6,
    ataque: 8,
	defesa: 7,
	vida: 14,
    raridade: RARIDADES_CARTAS.MYTHIC,
    elemento: ELEMENTOS.EARTH,
    habilidades: {
      skill1: { name: 'Raio Divino', description: 'Golpe de raio com chance de atordoar', cost: 3, kind: 'stun', base: 3, stun: 1, chance: 0.5 },
      skill2: { name: 'Trovão Ecoante', description: 'Dano elétrico em alvo único', cost: 3, kind: 'damage', base: 4 },
      skill3: { name: 'Calmaria Antes da Tempestade', description: 'Enfraquece o inimigo reduzindo ataque', cost: 2, kind: 'debuff' },
      skill4: { name: 'Fúria da Tempestade', description: 'Tempestade devastadora', cost: 8, kind: 'damage', base: 8, stun: 1 },
  skill5: { name: 'Julgamento Celeste', description: 'O trovão final de Tupã que rasga os céus.', cost: 7, kind: 'damage', base: 9 },
  passive: { name: 'O Criador', description: 'Ao entrar, torna o campo sagrado; +1 defesa para aliados' }
    },
    historia: 'Deus das tempestades e protetor da floresta, Tupã é temido por todos os seres que habitam a Amazônia.',
    descoberta: true
  },
  {
    id: 'boiu001',
    nome: 'Boiuna',
    descoberta: true
  },
  {
    id: 'cabo001',
    nome: 'Caboclo D’Água',
    descoberta: true
  },
  {
    id:'corpo001',
    nome: 'Corpo Seco',
    descoberta: true
  },
  {
    id: 'iar001',
    nome: 'Iara',
    regiao: REGIOES.AMAZONIA,
    categoria: CATEGORIAS_CARTAS.SPIRITS,
    tipo: TIPOS_CARTA.CREATURE,
    custo: 4,
    ataque: 6,
	defesa: 5,
	vida: 12,
	raridade: RARIDADES_CARTAS.EPIC,
    elemento: ELEMENTOS.WATER,
    habilidades: {
      skill1: { name: 'Canto Hipnótico', description: '30% de chance de atordoar por 1 turno', cost: 2, kind: 'stun', stun: 1, chance: 0.3 },
      skill2: { name: 'Jato d’Água', description: 'Ataque aquático veloz', cost: 2, kind: 'damage', base: 2 },
      skill3: { name: 'Redemoinho', description: 'Reduz a mobilidade do alvo', cost: 3, kind: 'debuff' },
      skill4: { name: 'Abraço das Profundezas', description: 'Arrasta e causa grande dano', cost: 5, kind: 'damage', base: 5 },
  skill5: { name: 'Canto do Abismo', description: 'Um chamado profundo que concentra a fúria das águas.', cost: 6, kind: 'damage', base: 8 },
  passive: { name: 'Domínio Aquático', description: 'Recupera 1 ponto de vida por turno em ambientes aquáticos' }
    },
    historia: 'Sereia dos rios brasileiros que atrai homens com seu canto mágico, levando-os para o fundo das águas.',
    descoberta: true,
    imagens: {
      retrato: '/images/cards/portraits/iara.jpg',
      completa: '/images/cards/full/iara.jpg'
    },
    tags: ['água', 'sedução', 'controle', 'hipnose'],
    condicaoDesbloqueio: 'Complete 3 quizzes sobre folclore aquático',
    bonusSazonal: {
      estacao: ESTACOES.SAO_JOAO,
      multiplicador: 1.5,
      descricao: 'Durante São João, Iara fica mais poderosa'
    }
  },
  {
    id: 'bot001',
    nome: 'Boto Cor-de-Rosa',
    regiao: REGIOES.AMAZONIA,
    categoria: CATEGORIAS_CARTAS.SPIRITS,
    tipo: TIPOS_CARTA.CREATURE,
    custo: 6,
    ataque: 8,
	defesa: 7,
	vida: 14,
    raridade: RARIDADES_CARTAS.LEGENDARY,
    elemento: ELEMENTOS.WATER,
    habilidades: {
      skill1: { name: 'Transformação Noturna', description: 'Ganha poder adicional em turnos pares', cost: 2, kind: 'buff' },
      skill2: { name: 'Investida Aquática', description: 'Ataque potente aquático', cost: 2, kind: 'damage', base: 3 },
      skill3: { name: 'Encanto', description: 'Reduz a defesa do alvo', cost: 3, kind: 'debuff' },
      skill4: { name: 'Encanto do Sedutor', description: 'Dobra o impacto e controla brevemente', cost: 5, kind: 'damage', base: 5 },
  skill5: { name: 'Maré Rubra', description: 'Uma onda avassaladora que varre o campo.', cost: 6, kind: 'damage', base: 8 },
  passive: { name: 'Dualidade', description: 'Alterna entre forma humana e golfinho a cada turno' }
    },
    historia: 'Golfinho encantado que se transforma em homem sedutor nas noites de festa.',
    descoberta: true,
    imagens: {
      retrato: '/images/cards/portraits/boto.jpg',
      completa: '/images/cards/full/boto.jpg'
    },
    tags: ['transformação', 'sedução', 'água', 'noturno'],
    condicaoDesbloqueio: 'Explore 100% da região Amazônica',
    bonusSazonal: {
      estacao: ESTACOES.FESTA_JUNINA,
      multiplicador: 2.0,
      descricao: 'Durante Festa Junina, Boto fica irresistível'
    }
  },
{
    id: 'enc001',
    nome: 'O Encourado',
    regiao: REGIOES.NORTHEAST,
    categoria: CATEGORIAS_CARTAS.HAUNTS,
    tipo: TIPOS_CARTA.CREATURE,
    custo: 4,
    ataque: 7,
	defesa: 3,
	vida: 10,
    raridade: RARIDADES_CARTAS.MYTHIC,
    elemento: ELEMENTOS.AIR,
  habilidades: {
    skill1: { name: 'Hemorragia', description: 'Causa dano e sangramento', cost: 1, kind: 'damage', base: 2 },
    skill2: { name: 'Lâmina Seca', description: 'Ataque cortante', cost: 2, kind: 'damage', base: 2 },
    skill3: { name: 'Medo Noturno', description: 'Atordoa por 1 turno', cost: 3, kind: 'stun', stun: 1 },
    skill4: { name: 'Quando as Galinhas Param de Botar', description: 'Recupera vida e causa dano', cost: 4, kind: 'damage', base: 3, heal: 5 },
  skill5: { name: 'Banho de Sangue', description: 'Ataque final brutal que aterroriza a noite.', cost: 6, kind: 'damage', base: 8 },
  passive: { name: 'Sede de Sangue', description: 'A cada 2 turnos, recupera 1 ponto de vida' }
  },
    historia: 'Um vampiro que se alimenta do sangue dos animais da caatinga. Persegue especialmente aqueles que não vão à igreja.',
    descoberta: true,
    imagens: {
        retrato: '/images/cards/portraits/encourado.jpg',
        completa: '/images/cards/full/encourado.jpg'
    },
    tags: ['travessura', 'mobilidade', 'esquiva', 'vento'],
    condicaoDesbloqueio: 'Banner Semanal',
    bonusSazonal: null
},
  {
    id: 'sac001',
    nome: 'Saci-Pererê',
    regiao: REGIOES.NATIONAL,
    categoria: CATEGORIAS_CARTAS.HAUNTS,
    tipo: TIPOS_CARTA.CREATURE,
    custo: 3,
    ataque: 5,
	defesa: 6,
	vida: 10,
	raridade: RARIDADES_CARTAS.EPIC,
    elemento: ELEMENTOS.AIR,
    habilidades: {
        skill1: { name: 'Travessura', description: 'Rouba um item do oponente', cost: 1, kind: 'debuff' },
        skill2: { name: 'Chute do Redemoinho', description: 'Ataque rápido', cost: 2, kind: 'damage', base: 2 },
        skill3: { name: 'Poeira nos Olhos', description: 'Atordoa por 1 turno', cost: 3, kind: 'stun', stun: 1 },
        skill4: { name: 'Redemoinho Caótico', description: 'Dano em área com chance de desarmar', cost: 4, kind: 'damage', base: 4 },
  skill5: { name: 'Tempestade de Redemoinhos', description: 'Um turbilhão incontrolável que leva tudo.', cost: 6, kind: 'damage', base: 8 },
  passive: { name: 'Astúcia', description: '15% de chance de esquivar completamente de qualquer ataque' }
      },
    historia: 'Menino negro de uma perna só que usa gorro vermelho. Conhecido por suas travessuras e por causar pequenos transtornos.',
    descoberta: true,
    imagens: {
      retrato: '/images/cards/portraits/saci.jpg',
      completa: '/images/cards/full/saci.jpg'
    },
    tags: ['travessura', 'mobilidade', 'esquiva', 'vento'],
    condicaoDesbloqueio: 'Starter card - sempre disponível',
    bonusSazonal: null
  },
  {
    id: 'boi001',
    nome: 'Boitatá',
    regiao: REGIOES.SOUTHEAST,
    categoria: CATEGORIAS_CARTAS.GUARDIANS,
    tipo: TIPOS_CARTA.CREATURE,
    custo: 7,
    ataque: 9,
	defesa: 7,
	vida: 18,
    raridade: RARIDADES_CARTAS.LEGENDARY,
    elemento: ELEMENTOS.FIRE,
    habilidades: {
      skill1: { name: 'Fogo Protetor', description: 'Causa dano contínuo', cost: 2, kind: 'damage', base: 3 },
      skill2: { name: 'Chama Ancestral', description: 'Explosão de fogo', cost: 3, kind: 'damage', base: 3 },
      skill3: { name: 'Muralha de Fogo', description: 'Reduz o ataque do alvo', cost: 3, kind: 'debuff' },
      skill4: { name: 'Incêndio Purificador', description: 'Onda de chamas devastadora', cost: 5, kind: 'damage', base: 6 },
  skill5: { name: 'Inferno da Selva', description: 'Chamas ancestrais que consomem tudo.', cost: 7, kind: 'damage', base: 9 },
  passive: { name: 'Corpo Flamejante', description: 'Reflete parte do dano recebido' }
    },
    historia: 'Serpente de fogo gigante que protege os campos e florestas contra incêndios e destruição.',
    descoberta: true,
    imagens: {
      retrato: '/images/cards/portraits/boitata.jpg',
      completa: '/images/cards/full/boitata.jpg'
    },
    tags: ['fogo', 'proteção', 'dano contínuo', 'serpente'],
    condicaoDesbloqueio: 'Ganhe 50 partidas ranqueadas',
    bonusSazonal: null
  },
  {
    id: 'cuc001',
    nome: 'Cuca',
    regiao: REGIOES.SOUTHEAST,
    categoria: CATEGORIAS_CARTAS.HAUNTS,
    tipo: TIPOS_CARTA.CREATURE,
    custo: 6,
    ataque: 8,
	defesa: 9,
	vida: 16,
    raridade: RARIDADES_CARTAS.EPIC,
    elemento: ELEMENTOS.SPIRIT,
    habilidades: {
      skill1: { name: 'Pesadelo', description: 'Reduz a defesa do oponente', cost: 2, kind: 'debuff' },
      skill2: { name: 'Garra Arcana', description: 'Ataque mágico', cost: 2, kind: 'damage', base: 2 },
      skill3: { name: 'Assombro', description: 'Atordoa por 1 turno', cost: 3, kind: 'stun', stun: 1 },
      skill4: { name: 'Maldição da Transformação', description: 'Enfraquece muito o alvo temporariamente', cost: 5, kind: 'debuff' },
  skill5: { name: 'Pavor Arcano', description: 'Canaliza terrores antigos em um ataque esmagador.', cost: 6, kind: 'damage', base: 8 },
  passive: { name: 'Resistência Arcana', description: '30% de resistência contra habilidades mágicas inimigas' }
    },
    historia: 'Bruxa com cabeça de jacaré que rapta crianças desobedientes. Personagem importante do Sítio do Picapau Amarelo.',
    descoberta: true,
    imagens: {
      retrato: '/images/cards/portraits/cuca.jpg',
      completa: '/images/cards/full/cuca.jpg'
    },
    tags: ['medo', 'transformação', 'magia', 'jacaré'],
    condicaoDesbloqueio: 'Complete todos os quizzes do Sudeste',
    bonusSazonal: null
  },
  {
    id: 'mul001',
    nome: 'Mula sem Cabeça',
    regiao: REGIOES.SOUTHEAST,
    categoria: CATEGORIAS_CARTAS.HAUNTS,
    tipo: TIPOS_CARTA.CREATURE,
    custo: 4,
    ataque: 7,
	defesa: 4,
	vida: 11,
    raridade: RARIDADES_CARTAS.EPIC,
    elemento: ELEMENTOS.SPIRIT,
    habilidades: {
      skill1: { name: 'Galope Fantasma', description: 'Ataque que ignora bloqueio', cost: 2, kind: 'damage', base: 2 },
      skill2: { name: 'Chamas Assombradas', description: 'Ataque flamejante', cost: 2, kind: 'damage', base: 2 },
      skill3: { name: 'Assombro Estridente', description: 'Atordoa por 1 turno', cost: 3, kind: 'stun', stun: 1 },
      skill4: { name: 'Uivo do Terror', description: 'Aterroriza e reduz atributos', cost: 4, kind: 'debuff' },
  skill5: { name: 'Ruína Fantasmal', description: 'Um clarão sobrenatural que devasta o alvo.', cost: 6, kind: 'damage', base: 8 },
  passive: { name: 'Forma Etérea', description: '20% de chance de ignorar ataques físicos' }
    },
    historia: 'Alma penada que galopa pelas noites assombrando os pecadores.',
    descoberta: true,
    imagens: {
      retrato: '/images/cards/portraits/mula.jpg',
      completa: '/images/cards/full/mula.jpg'
    },
    tags: ['velocidade', 'atravessar', 'fantasma', 'terror'],
    condicaoDesbloqueio: 'Jogue durante a lua cheia (evento especial)',
    bonusSazonal: null
  }
];

// Combos especiais
export const COMBOS_CARTAS = {
  FOREST_GUARDIANS: {
    name: 'Guardiões da Mata',
  cards: ['cur001', 'cai001'], // Curupira + Caiçara (TODO: adicionar Caipora quando existir)
    effect: {
      type: 'defense_multiplier',
      value: 2.0,
      description: 'Multiplicador 2x na defesa de ambas as cartas'
    }
  },
  WATER_ENCHANTED: {
    name: 'Encantados das Águas',
    cards: ['iar001', 'bot001'], // Iara + Boto
    effect: {
      type: 'ability_chance',
      value: 2.0,
      description: 'Dobra a chance de ativar habilidades especiais'
    }
  },
  NIGHT_TERROR: {
    name: 'Terror Noturno',
  cards: ['mul001', 'corpo001'], // Mula sem Cabeça + Corpo-Seco
    effect: {
      type: 'attack_multiplier',
      value: 1.75,
      description: 'Multiplicador 1.75x no ataque contra qualquer oponente'
    }
  },
  DIVINE_PROTECTION: {
    name: 'Proteção Divina',
  cards: ['tupa001', 'gua001'], // Tupã + Guaraci (TODO: adicionar Guaraci quando existir)
    effect: {
      type: 'damage_reduction',
      value: 0.5,
      duration: 3,
      description: 'Reduz o dano recebido pela metade por 3 turnos'
    }
  }
};

// Multiplicadores de jogo
export const MULTIPLICADORES = {
  REGIONAL: {
    value: 1.25,
    description: 'Cartas da mesma região recebem +25% de bônus de ataque'
  },
  ELEMENTAL: {
    advantages: {
      [ELEMENTOS.WATER]: [ELEMENTOS.FIRE],
      [ELEMENTOS.FIRE]: [ELEMENTOS.AIR],
      [ELEMENTOS.AIR]: [ELEMENTOS.EARTH],
      [ELEMENTOS.EARTH]: [ELEMENTOS.WATER],
      [ELEMENTOS.SPIRIT]: [ELEMENTOS.EARTH, ELEMENTOS.AIR]
    },
    value: 1.5,
    description: 'Vantagens elementais garantem multiplicador 1.5x de dano'
  },
  FULL_MOON: {
    value: 2.0,
    condition: 'night_creatures',
    description: 'Criaturas noturnas recebem 2x de poder durante turnos específicos'
  },
  SEASONAL: {
    value: 1.75,
    description: 'Durante eventos temáticos, cartas relacionadas recebem 1.75x de bônus'
  },
  COUNTERATTACK: {
    value: 1.5,
    condition: 'after_damage',
    description: 'Após sofrer dano, algumas cartas podem multiplicar seu ataque por 1.5x'
  }
};

// Condições de desbloqueio
export const CONDICOES_DESBLOQUEIO = {
  STARTER: 'Starter card - sempre disponível',
  PVP_WINS: (count) => `Vitória em ${count} partidas PvP`,
  QUIZ_COMPLETE: (region) => `Complete todos os quizzes do ${region}`,
  REGION_EXPLORE: (percent) => `Explore ${percent}% da região`,
  RANKED_WINS: (count) => `Ganhe ${count} partidas ranqueadas`,
  SPECIAL_EVENT: (event) => `Participe do evento ${event}`,
  LUNAR_EVENT: 'Jogue durante a lua cheia (evento especial)'
};

// Utilitários de consulta
export const getCardsByRegion = (region) => {
  // Retorna cartas da região informada
  return bancoDeCartas.filter((carta) => carta.regiao === region);
};

export const getCardsByCategory = (category) => {
  // Retorna cartas da categoria informada
  return bancoDeCartas.filter((carta) => carta.categoria === category);
};

export const getCardsByRarity = (rarity) => {
  // Retorna cartas pela raridade
  return bancoDeCartas.filter((carta) => carta.raridade === rarity);
};

export const getDiscoveredCards = () => {
  // Cartas já descobertas
  return bancoDeCartas.filter((carta) => carta.descoberta);
};

export const getUndiscoveredCards = () => {
  // Cartas ainda não descobertas
  return bancoDeCartas.filter((carta) => !carta.descoberta);
};

export const searchCards = (query) => {
  // Busca por nome, lore ou tags (case-insensitive)
  const consultaMinuscula = query.toLowerCase();
  return bancoDeCartas.filter((carta) =>
    (carta.nome || '').toLowerCase().includes(consultaMinuscula) ||
    (carta.historia || '').toLowerCase().includes(consultaMinuscula) ||
    carta.tags.some((tag) => tag.includes(consultaMinuscula))
  );
};

export const getCardStats = () => {
  // Estatísticas agregadas para dashboards/relatórios
  const totalCartas = bancoDeCartas.length;
  const descobertas = getDiscoveredCards().length;
  const porRaridade = {};

  Object.values(RARIDADES_CARTAS).forEach((raridade) => {
    porRaridade[raridade] = getCardsByRarity(raridade).length;
  });

  return {
    total: totalCartas,
    discovered: descobertas,
    undiscovered: totalCartas - descobertas,
    progress: Math.round((descobertas / totalCartas) * 100),
    byRarity: porRaridade,
  };
};
