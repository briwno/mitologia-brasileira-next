// src/app/api/cards/route.js
import { NextResponse } from 'next/server';

// Mock data das cartas
const cards = [
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
    element: 'Terra',
    image: '/images/cards/curupira.jpg'
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
  rarity: 'Épico',
    history: 'Sereia dos rios brasileiros que atrai homens com seu canto mágico, levando-os para o fundo das águas.',
    element: 'Água',
    image: '/images/cards/iara.jpg'
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
    abilityDescription: 'Pode roubar um item do oponente',
  rarity: 'Épico',
    history: 'Menino negro de uma perna só que usa gorro vermelho. Conhecido por suas travessuras e por causar pequenos transtornos.',
    element: 'Ar',
    image: '/images/cards/saci.jpg'
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
    element: 'Fogo',
    image: '/images/cards/boitata.jpg'
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
    element: 'Sombra',
    image: '/images/cards/cuca.jpg'
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
  rarity: 'Épico',
    history: 'Homem que se transforma em lobo nas noites de lua cheia, aterrorizando quem encontra pelo caminho.',
    element: 'Sombra',
    image: '/images/cards/lobisomem.jpg'
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
  rarity: 'Épico',
    history: 'Mulher amaldiçoada que se transforma em mula sem cabeça, galopando pelas noites com fogo saindo do pescoço.',
    element: 'Fogo',
    image: '/images/cards/mula-sem-cabeca.jpg'
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
  rarity: 'Épico',
    history: 'Boto que se transforma em homem elegante para seduzir mulheres nas festas ribeirinhas.',
    element: 'Água',
    image: '/images/cards/boto.jpg'
  }
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const region = searchParams.get('region');
    const rarity = searchParams.get('rarity');
    const search = searchParams.get('search');

    let filteredCards = [...cards];

    // Aplicar filtros
    if (category && category !== 'all') {
      filteredCards = filteredCards.filter(card => card.category === category);
    }

    if (region && region !== 'all') {
      filteredCards = filteredCards.filter(card => card.region === region);
    }

    if (rarity && rarity !== 'all') {
      filteredCards = filteredCards.filter(card => card.rarity === rarity);
    }

    if (search) {
      filteredCards = filteredCards.filter(card => 
        card.name.toLowerCase().includes(search.toLowerCase()) ||
        card.history.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({
      cards: filteredCards,
      total: filteredCards.length
    });

  } catch (error) {
    console.error('Cards API error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { action, cardId, userId } = await request.json();

    if (action === 'unlock') {
      // Lógica para desbloquear carta
      // Em produção, verificar se o usuário tem permissão para desbloquear
      
      const card = cards.find(c => c.id === cardId);
      if (!card) {
        return NextResponse.json(
          { error: 'Carta não encontrada' },
          { status: 404 }
        );
      }

      // Simular desbloqueio
      return NextResponse.json({
        message: `Carta ${card.name} desbloqueada!`,
        card: card
      });
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Cards POST error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
