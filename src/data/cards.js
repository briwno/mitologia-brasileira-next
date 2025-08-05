// src/data/cards.js

export const cards = [
  {
    id: 1,
    name: 'Curupira',
    region: 'Amazônia',
    category: 'Guardiões da Floresta',
    attack: 7,
    defense: 8,
    life: 15,
    cost: 5,
    ability: 'Confusão da Floresta',
    abilityDescription: 'Reduz o ataque do oponente em 2 pontos por 2 turnos',
    rarity: 'Épico',
    history: 'Protetor da floresta com cabelos vermelhos e pés virados para trás. Confunde caçadores e pune os que destroem a natureza.',
    element: 'Terra'
  },
  {
    id: 2,
    name: 'Iara',
    region: 'Amazônia',
    category: 'Espíritos das Águas',
    attack: 6,
    defense: 5,
    life: 12,
    cost: 4,
    ability: 'Canto Hipnótico',
    abilityDescription: '30% de chance de fazer o oponente perder um turno',
    rarity: 'Raro',
    history: 'Sereia dos rios brasileiros que atrai homens com seu canto mágico, levando-os para o fundo das águas.',
    element: 'Água'
  },
  {
    id: 3,
    name: 'Saci-Pererê',
    region: 'Nacional',
    category: 'Assombrações',
    attack: 5,
    defense: 6,
    life: 10,
    cost: 3,
    ability: 'Travessura',
    abilityDescription: 'Pode roubar um item do oponente ou causar efeito aleatório',
    rarity: 'Comum',
    history: 'Menino negro de uma perna só que usa gorro vermelho. Conhecido por suas travessuras e por causar pequenos transtornos.',
    element: 'Ar'
  },
  {
    id: 4,
    name: 'Boitatá',
    region: 'Sul/Sudeste',
    category: 'Guardiões da Floresta',
    attack: 9,
    defense: 7,
    life: 18,
    cost: 7,
    ability: 'Fogo Protetor',
    abilityDescription: 'Causa 3 pontos de dano ao oponente a cada turno',
    rarity: 'Lendário',
    history: 'Serpente de fogo gigante que protege os campos e florestas contra incêndios e destruição.',
    element: 'Fogo'
  },
  {
    id: 5,
    name: 'Cuca',
    region: 'Sudeste',
    category: 'Assombrações',
    attack: 8,
    defense: 9,
    life: 16,
    cost: 6,
    ability: 'Pesadelo',
    abilityDescription: 'Reduz a defesa do oponente em 3 pontos',
    rarity: 'Épico',
    history: 'Bruxa com cabeça de jacaré que rapta crianças desobedientes. Personagem importante do Sítio do Picapau Amarelo.',
    element: 'Sombra'
  },
  {
    id: 6,
    name: 'Lobisomem',
    region: 'Nacional',
    category: 'Criaturas Noturnas',
    attack: 7,
    defense: 5,
    life: 14,
    cost: 5,
    ability: 'Transformação Lunar',
    abilityDescription: 'Dobra o ataque durante a noite',
    rarity: 'Raro',
    history: 'Homem que se transforma em lobo nas noites de lua cheia, aterrorizando quem encontra pelo caminho.',
    element: 'Sombra'
  },
  {
    id: 7,
    name: 'Mula sem Cabeça',
    region: 'Sudeste',
    category: 'Assombrações',
    attack: 6,
    defense: 7,
    life: 13,
    cost: 4,
    ability: 'Galope Fantasmagórico',
    abilityDescription: 'Pode atacar diretamente o jogador oponente',
    rarity: 'Raro',
    history: 'Mulher amaldiçoada que se transforma em mula sem cabeça, galopando pelas noites com fogo saindo do pescoço.',
    element: 'Fogo'
  },
  {
    id: 8,
    name: 'Boto Cor-de-Rosa',
    region: 'Amazônia',
    category: 'Espíritos das Águas',
    attack: 5,
    defense: 6,
    life: 11,
    cost: 4,
    ability: 'Encantamento',
    abilityDescription: 'Toma controle de uma criatura inimiga por 1 turno',
    rarity: 'Raro',
    history: 'Boto que se transforma em homem elegante para seduzir mulheres nas festas ribeirinhas.',
    element: 'Água'
  },
  {
    id: 9,
    name: 'Caipora',
    region: 'Nacional',
    category: 'Guardiões da Floresta',
    attack: 6,
    defense: 7,
    life: 13,
    cost: 4,
    ability: 'Proteção Animal',
    abilityDescription: 'Invoca animais aliados para proteger o campo',
    rarity: 'Raro',
    history: 'Protetor dos animais da floresta, pune caçadores que matam por esporte ou prazer.',
    element: 'Terra'
  },
  {
    id: 10,
    name: 'Mapinguari',
    region: 'Amazônia',
    category: 'Criaturas Gigantes',
    attack: 10,
    defense: 8,
    life: 20,
    cost: 8,
    ability: 'Rugido Aterrador',
    abilityDescription: 'Paralisa todas as criaturas inimigas por 1 turno',
    rarity: 'Lendário',
    history: 'Criatura gigante da Amazônia, coberta de pelos, com uma boca no estômago e garras enormes.',
    element: 'Terra'
  }
];

export const getCardById = (id) => {
  return cards.find(card => card.id === id);
};

export const getCardsByCategory = (category) => {
  return cards.filter(card => card.category === category);
};

export const getCardsByRegion = (region) => {
  return cards.filter(card => card.region === region);
};

export const getCardsByRarity = (rarity) => {
  return cards.filter(card => card.rarity === rarity);
};
