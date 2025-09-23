// src/app/api/constants/route.js
import { NextResponse } from 'next/server';

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

// Combos especiais
export const COMBOS_CARTAS = {
  FOREST_GUARDIANS: {
    name: 'Guardiões da Mata',
    cards: ['cur001', 'cai001'], // Curupira + Caiçara
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
    cards: ['tupa001', 'gua001'], // Tupã + Guaraci
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
      'Água': ['Fogo'],
      'Fogo': ['Ar'],
      'Ar': ['Terra'],
      'Terra': ['Água'],
      'Espírito': ['Terra', 'Ar']
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

// Constantes de deck e jogo
export const CONSTANTES_DECK = {
  TAMANHO_DECK_LENDAS: 5,      // 5 Lendas únicas no deck
  TAMANHO_DECK_ITENS: 20,      // 20 Itens no deck
  TAMANHO_MAXIMO_MAO_ITENS: 3, // Máximo 3 itens na mão
  BANCO_LENDAS: 4,              // 4 lendas no banco (reserva)
  LENDA_ATIVA: 1,               // 1 lenda ativa em campo
  LIMITE_TEMPO_TURNO: 300,      // 5 minutos
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const constants = {
      CATEGORIAS_CARTAS,
      RARIDADES_CARTAS,
      REGIOES,
      TIPOS_CARTA,
      ELEMENTOS,
      ESTACOES,
      COMBOS_CARTAS,
      MULTIPLICADORES,
      CONSTANTES_DECK
    };

    // Se um tipo específico for solicitado, retorna apenas ele
    if (type && constants[type]) {
      return NextResponse.json(constants[type]);
    }

    // Senão, retorna todas as constantes
    return NextResponse.json(constants);

  } catch (error) {
    console.error('Erro ao buscar constantes:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}