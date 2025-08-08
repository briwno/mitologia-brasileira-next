// src/data/cardsDatabase.js
export const CARD_CATEGORIES = {
  GUARDIANS: 'Guardiões da Floresta',
  SPIRITS: 'Espíritos das Águas',
  HAUNTS: 'Assombrações',
  PROTECTORS: 'Protetores Humanos',
  MYSTICAL: 'Entidades Místicas'
};

export const CARD_RARITIES = {
  COMMON: 'Comum',
  RARE: 'Raro',
  EPIC: 'Épico',
  LEGENDARY: 'Lendário',
  MYTHIC: 'Mítico'
};

export const REGIONS = {
  AMAZONIA: 'Amazônia',
  NORTHEAST: 'Nordeste',
  SOUTHEAST: 'Sudeste',
  SOUTH: 'Sul',
  MIDWEST: 'Centro-Oeste',
  NATIONAL: 'Nacional'
};

export const CARD_TYPES = {
  CREATURE: 'creature',
  SPELL: 'spell',
  ARTIFACT: 'artifact'
};

export const ELEMENTS = {
  EARTH: 'Terra',
  WATER: 'Água',
  FIRE: 'Fogo',
  AIR: 'Ar',
  SPIRIT: 'Espírito'
};

export const SEASONS = {
  CARNIVAL: 'Carnaval',
  SAO_JOAO: 'São João',
  FESTA_JUNINA: 'Festa Junina',
  CHRISTMAS: 'Natal'
};

export const cardsDatabase = [
  // REGIÃO AMAZÔNICA
  {
    id: 'cur001',
    name: 'Curupira',
    region: REGIONS.AMAZONIA,
    category: CARD_CATEGORIES.GUARDIANS,
    type: CARD_TYPES.CREATURE,
    cost: 5,
    attack: 7,
    defense: 8,
    health: 15,
    rarity: CARD_RARITIES.EPIC,
    element: ELEMENTS.EARTH,
    abilities: {
      basic: {
        name: 'Confusão da Floresta',
        description: 'Reduz o ataque do oponente em 2 pontos por 2 turnos',
        cost: 2,
        cooldown: 0
      },
      ultimate: {
        name: 'Fúria da Mata',
        description: 'Invoca espíritos da floresta que causam 5 pontos de dano e atordoam o inimigo por 1 turno',
        cost: 4,
        cooldown: 3
      },
      passive: {
        name: 'Protetor da Natureza',
        description: 'Ganha +1 de defesa para cada aliado da floresta em campo'
      }
    },
    lore: 'Protetor da floresta com cabelos vermelhos e pés virados para trás. Confunde caçadores e pune os que destroem a natureza.',
    discovered: true,
    images: {
      portrait: '/images/cards/portraits/curupira.jpg',
      full: '/images/cards/full/curupira.jpg'
    },
    tags: ['protetor', 'floresta', 'confusão', 'natureza'],
    unlockCondition: 'Vitória em 5 partidas PvP',
    seasonalBonus: null
  },
  {
    id: 'iar001',
    name: 'Iara',
    region: REGIONS.AMAZONIA,
    category: CARD_CATEGORIES.SPIRITS,
    type: CARD_TYPES.CREATURE,
    cost: 4,
    attack: 6,
    defense: 5,
    health: 12,
    rarity: CARD_RARITIES.RARE,
    element: ELEMENTS.WATER,
    abilities: {
      basic: {
        name: 'Canto Hipnótico',
        description: '30% de chance de fazer o oponente perder um turno',
        cost: 2,
        cooldown: 1
      },
      ultimate: {
        name: 'Abraço das Profundezas',
        description: 'Arrasta o inimigo para as águas, causando 7 pontos de dano e bloqueando suas habilidades por 2 turnos',
        cost: 5,
        cooldown: 4
      },
      passive: {
        name: 'Domínio Aquático',
        description: 'Recupera 1 ponto de vida por turno em ambientes aquáticos'
      }
    },
    lore: 'Sereia dos rios brasileiros que atrai homens com seu canto mágico, levando-os para o fundo das águas.',
    discovered: true,
    images: {
      portrait: '/images/cards/portraits/iara.jpg',
      full: '/images/cards/full/iara.jpg'
    },
    tags: ['água', 'sedução', 'controle', 'hipnose'],
    unlockCondition: 'Complete 3 quizzes sobre folclore aquático',
    seasonalBonus: {
      season: SEASONS.SAO_JOAO,
      multiplier: 1.5,
      description: 'Durante São João, Iara fica mais poderosa'
    }
  },
  {
    id: 'bot001',
    name: 'Boto Cor-de-Rosa',
    region: REGIONS.AMAZONIA,
    category: CARD_CATEGORIES.SPIRITS,
    type: CARD_TYPES.CREATURE,
    cost: 6,
    attack: 8,
    defense: 7,
    health: 14,
    rarity: CARD_RARITIES.LEGENDARY,
    element: ELEMENTS.WATER,
    abilities: {
      basic: {
        name: 'Transformação Noturna',
        description: 'Durante turnos pares, ganha +3/+3 e sedução',
        cost: 3,
        cooldown: 0
      },
      ultimate: {
        name: 'Encanto do Sedutor',
        description: 'Controla uma criatura inimiga por 2 turnos',
        cost: 6,
        cooldown: 5
      },
      passive: {
        name: 'Dualidade',
        description: 'Alterna entre forma humana e golfinho a cada turno'
      }
    },
    lore: 'Golfinho encantado que se transforma em homem sedutor nas noites de festa.',
    discovered: true,
    images: {
      portrait: '/images/cards/portraits/boto.jpg',
      full: '/images/cards/full/boto.jpg'
    },
    tags: ['transformação', 'sedução', 'água', 'noturno'],
    unlockCondition: 'Explore 100% da região Amazônica',
    seasonalBonus: {
      season: SEASONS.FESTA_JUNINA,
      multiplier: 2.0,
      description: 'Durante Festa Junina, Boto fica irresistível'
    }
  },


//REGIAO NORDESTE
{
    id: 'enc001',
    name: 'O Encourado',
    region: REGIONS.NORTHEAST,
    category: CARD_CATEGORIES.HAUNTS,
    type: CARD_TYPES.CREATURE,
    cost: 4,
    attack: 7,
    defense: 3,
    health: 10,
    rarity: CARD_RARITIES.MYTHIC,
    element: ELEMENTS.AIR,
    abilities: {
        basic: {
            name: 'Hemorragia',
            description: 'Causa 2 pontos de dano deixando o oponente sangrando por 2 turnos (1 de dano por turno)',
            cost: 1,
            cooldown: 1
        },
        ultimate: {
            name: 'Quando as Galinhas Param de Botar',
            description: 'Recupera 5 pontos de vida e causa 3 pontos de dano ao oponente',
            cost: 4,
            cooldown: 3
        },
        passive: {
            name: 'Sede de Sangue',
            description: 'A cada 2 turnos, recupera 1 ponto de vida'
        }
    },
    lore: 'Um vampiro que se alimenta do sangue dos animais da caatinga. Persegue especialmente aqueles que não vão à igreja.',
    discovered: true,
    images: {
        portrait: '/images/cards/portraits/encourado.jpg',
        full: '/images/cards/full/encourado.jpg'
    },
    tags: ['travessura', 'mobilidade', 'esquiva', 'vento'],
    unlockCondition: 'Starter card - sempre disponível',
    seasonalBonus: null
},

  // REGIÃO NACIONAL
  {
    id: 'sac001',
    name: 'Saci-Pererê',
    region: REGIONS.NATIONAL,
    category: CARD_CATEGORIES.HAUNTS,
    type: CARD_TYPES.CREATURE,
    cost: 3,
    attack: 5,
    defense: 6,
    health: 10,
    rarity: CARD_RARITIES.COMMON,
    element: ELEMENTS.AIR,
    abilities: {
      basic: {
        name: 'Travessura',
        description: 'Pode roubar um item do oponente',
        cost: 1,
        cooldown: 1
      },
      ultimate: {
        name: 'Redemoinho Caótico',
        description: 'Cria um tornado que causa 4 pontos de dano a todos os inimigos e tem 40% de chance de desarmar suas cartas de equipamento',
        cost: 4,
        cooldown: 3
      },
      passive: {
        name: 'Astúcia',
        description: '15% de chance de esquivar completamente de qualquer ataque'
      }
    },
    lore: 'Menino negro de uma perna só que usa gorro vermelho. Conhecido por suas travessuras e por causar pequenos transtornos.',
    discovered: true,
    images: {
      portrait: '/images/cards/portraits/saci.jpg',
      full: '/images/cards/full/saci.jpg'
    },
    tags: ['travessura', 'mobilidade', 'esquiva', 'vento'],
    unlockCondition: 'Starter card - sempre disponível',
    seasonalBonus: null
  },

  // REGIÃO SUL/SUDESTE
  {
    id: 'boi001',
    name: 'Boitatá - A Serpente de Fogo',
    region: REGIONS.SOUTHEAST,
    category: CARD_CATEGORIES.GUARDIANS,
    type: CARD_TYPES.CREATURE,
    cost: 7,
    attack: 9,
    defense: 7,
    health: 18,
    rarity: CARD_RARITIES.LEGENDARY,
    element: ELEMENTS.FIRE,
    abilities: {
      basic: {
        name: 'Fogo Protetor',
        description: 'Causa 3 pontos de dano ao oponente a cada turno',
        cost: 3,
        cooldown: 0
      },
      ultimate: {
        name: 'Incêndio Purificador',
        description: 'Lança uma onda de chamas que causa 8 pontos de dano e queima o inimigo por 3 turnos (2 de dano por turno)',
        cost: 6,
        cooldown: 4
      },
      passive: {
        name: 'Corpo Flamejante',
        description: 'Reflete 25% do dano físico recebido de volta ao atacante'
      }
    },
    lore: 'Serpente de fogo gigante que protege os campos e florestas contra incêndios e destruição.',
    discovered: true,
    images: {
      portrait: '/images/cards/portraits/boitata.jpg',
      full: '/images/cards/full/boitata.jpg'
    },
    tags: ['fogo', 'proteção', 'dano contínuo', 'serpente'],
    unlockCondition: 'Ganhe 50 partidas ranqueadas',
    seasonalBonus: null
  },
  {
    id: 'cuc001',
    name: 'Cuca',
    region: REGIONS.SOUTHEAST,
    category: CARD_CATEGORIES.HAUNTS,
    type: CARD_TYPES.CREATURE,
    cost: 6,
    attack: 8,
    defense: 9,
    health: 16,
    rarity: CARD_RARITIES.EPIC,
    element: ELEMENTS.SPIRIT,
    abilities: {
      basic: {
        name: 'Pesadelo',
        description: 'Reduz a defesa do oponente em 3 pontos',
        cost: 2,
        cooldown: 1
      },
      ultimate: {
        name: 'Maldição da Transformação',
        description: 'Transforma temporariamente uma carta inimiga em uma criatura fraca com apenas 3 de ataque e defesa por 2 turnos',
        cost: 5,
        cooldown: 4
      },
      passive: {
        name: 'Resistência Arcana',
        description: '30% de resistência contra habilidades mágicas inimigas'
      }
    },
    lore: 'Bruxa com cabeça de jacaré que rapta crianças desobedientes. Personagem importante do Sítio do Picapau Amarelo.',
    discovered: true,
    images: {
      portrait: '/images/cards/portraits/cuca.jpg',
      full: '/images/cards/full/cuca.jpg'
    },
    tags: ['medo', 'transformação', 'magia', 'jacaré'],
    unlockCondition: 'Complete todos os quizzes do Sudeste',
    seasonalBonus: null
  },
  {
    id: 'mul001',
    name: 'Mula sem Cabeça',
    region: REGIONS.SOUTHEAST,
    category: CARD_CATEGORIES.HAUNTS,
    type: CARD_TYPES.CREATURE,
    cost: 4,
    attack: 7,
    defense: 4,
    health: 11,
    rarity: CARD_RARITIES.EPIC,
    element: ELEMENTS.SPIRIT,
    abilities: {
      basic: {
        name: 'Galope Fantasma',
        description: 'Pode atacar diretamente ignorando criaturas bloqueadoras',
        cost: 2,
        cooldown: 1
      },
      ultimate: {
        name: 'Uivo do Terror',
        description: 'Aterroriza todos os inimigos, reduzindo ataque e defesa em 2 por 3 turnos',
        cost: 4,
        cooldown: 3
      },
      passive: {
        name: 'Forma Etérea',
        description: '20% de chance de ignorar ataques físicos'
      }
    },
    lore: 'Alma penada que galopa pelas noites assombrando os pecadores.',
    discovered: true,
    images: {
      portrait: '/images/cards/portraits/mula.jpg',
      full: '/images/cards/full/mula.jpg'
    },
    tags: ['velocidade', 'atravessar', 'fantasma', 'terror'],
    unlockCondition: 'Jogue durante a lua cheia (evento especial)',
    seasonalBonus: null
  }
];

// Combos especiais
export const CARD_COMBOS = {
  FOREST_GUARDIANS: {
    name: 'Guardiões da Mata',
    cards: ['cur001', 'cai001'], // Curupira + Caipora
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
    cards: ['mul001', 'cor001'], // Mula sem Cabeça + Corpo-Seco
    effect: {
      type: 'attack_multiplier',
      value: 1.75,
      description: 'Multiplicador 1.75x no ataque contra qualquer oponente'
    }
  },
  DIVINE_PROTECTION: {
    name: 'Proteção Divina',
    cards: ['tup001', 'gua001'], // Tupã + Guaraci
    effect: {
      type: 'damage_reduction',
      value: 0.5,
      duration: 3,
      description: 'Reduz o dano recebido pela metade por 3 turnos'
    }
  }
};

// Multiplicadores de jogo
export const MULTIPLIERS = {
  REGIONAL: {
    value: 1.25,
    description: 'Cartas da mesma região recebem +25% de bônus de ataque'
  },
  ELEMENTAL: {
    advantages: {
      [ELEMENTS.WATER]: [ELEMENTS.FIRE],
      [ELEMENTS.FIRE]: [ELEMENTS.AIR],
      [ELEMENTS.AIR]: [ELEMENTS.EARTH],
      [ELEMENTS.EARTH]: [ELEMENTS.WATER],
      [ELEMENTS.SPIRIT]: [ELEMENTS.EARTH, ELEMENTS.AIR]
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
export const UNLOCK_CONDITIONS = {
  STARTER: 'Starter card - sempre disponível',
  PVP_WINS: (count) => `Vitória em ${count} partidas PvP`,
  QUIZ_COMPLETE: (region) => `Complete todos os quizzes do ${region}`,
  REGION_EXPLORE: (percent) => `Explore ${percent}% da região`,
  RANKED_WINS: (count) => `Ganhe ${count} partidas ranqueadas`,
  SPECIAL_EVENT: (event) => `Participe do evento ${event}`,
  LUNAR_EVENT: 'Jogue durante a lua cheia (evento especial)'
};

export const getCardsByRegion = (region) => {
  return cardsDatabase.filter(card => card.region === region);
};

export const getCardsByCategory = (category) => {
  return cardsDatabase.filter(card => card.category === category);
};

export const getCardsByRarity = (rarity) => {
  return cardsDatabase.filter(card => card.rarity === rarity);
};

export const getDiscoveredCards = () => {
  return cardsDatabase.filter(card => card.discovered);
};

export const getUndiscoveredCards = () => {
  return cardsDatabase.filter(card => !card.discovered);
};

export const searchCards = (query) => {
  const lowerQuery = query.toLowerCase();
  return cardsDatabase.filter(card => 
    card.name.toLowerCase().includes(lowerQuery) ||
    card.lore.toLowerCase().includes(lowerQuery) ||
    card.tags.some(tag => tag.includes(lowerQuery))
  );
};

export const getCardStats = () => {
  const total = cardsDatabase.length;
  const discovered = getDiscoveredCards().length;
  const byRarity = {};
  
  Object.values(CARD_RARITIES).forEach(rarity => {
    byRarity[rarity] = getCardsByRarity(rarity).length;
  });

  return {
    total,
    discovered,
    undiscovered: total - discovered,
    progress: Math.round((discovered / total) * 100),
    byRarity
  };
};
