// src/utils/seasonalEvents.js
import { SEASONS } from '../data/cardsDatabase';

export class SeasonalEventSystem {
  constructor() {
    this.currentEvents = [];
    this.eventHistory = [];
    this.eventMultipliers = new Map();
  }

  // Verificar eventos ativos baseados na data
  getCurrentActiveEvents() {
    const now = new Date();
    const activeEvents = [];

    // Carnaval (Fevereiro/Março)
    if (this.isCarnavalSeason(now)) {
      activeEvents.push({
        id: 'carnival_2025',
        name: SEASONS.CARNIVAL,
        description: 'Celebre o Carnaval! Cartas folclóricas ganham bônus especiais',
        multiplier: 1.75,
        duration: this.getCarnavalDuration(now),
        bonusCards: ['sac001', 'mul001'], // Saci e Mula sem Cabeça
        specialEffects: ['increased_drop_rate', 'exclusive_carnival_cards']
      });
    }

    // São João (Junho)
    if (this.isSaoJoaoSeason(now)) {
      activeEvents.push({
        id: 'sao_joao_2025',
        name: SEASONS.SAO_JOAO,
        description: 'Festa Junina! Criaturas aquáticas e do folclore nordestino brilham',
        multiplier: 1.5,
        duration: this.getSaoJoaoDuration(now),
        bonusCards: ['iar001', 'bot001', 'cab001'], // Iara, Boto, Caboclo d'Água
        specialEffects: ['double_xp_northeast', 'festa_junina_decorations']
      });
    }

    // Dia do Folclore (22 de Agosto)
    if (this.isFolkloreDaySeason(now)) {
      activeEvents.push({
        id: 'folklore_day_2025',
        name: 'Dia do Folclore',
        description: 'Celebração de todas as lendas brasileiras!',
        multiplier: 2.0,
        duration: { days: 3 }, // 3 dias de evento
        bonusCards: ['all'], // Todas as cartas
        specialEffects: ['free_card_packs', 'special_quizzes']
      });
    }

    // Lua Cheia (eventos especiais noturnos)
    if (this.isFullMoonNight(now)) {
      activeEvents.push({
        id: `full_moon_${now.getFullYear()}_${now.getMonth()}`,
        name: 'Lua Cheia',
        description: 'As criaturas noturnas despertam com poder total!',
        multiplier: 2.0,
        duration: { hours: 6 }, // 6 horas de evento
        bonusCards: ['mul001', 'bot001'], // Criaturas noturnas
        specialEffects: ['night_creatures_boost', 'mysterious_encounters']
      });
    }

    // Dia da Amazônia (5 de Setembro)
    if (this.isAmazonDay(now)) {
      activeEvents.push({
        id: 'amazon_day_2025',
        name: 'Dia da Amazônia',
        description: 'Proteja a floresta! Cartas amazônicas ganham força especial',
        multiplier: 1.8,
        duration: { days: 1 },
        bonusCards: ['cur001', 'iar001', 'bot001'], // Cartas amazônicas
        specialEffects: ['amazon_protection_quest', 'environmental_awareness']
      });
    }

    this.currentEvents = activeEvents;
    return activeEvents;
  }

  // Verificar se é temporada de Carnaval
  isCarnavalSeason(date) {
    const year = date.getFullYear();
    const carnavalDate = this.getCarnavalDate(year);
    const startDate = new Date(carnavalDate);
    startDate.setDate(startDate.getDate() - 7); // Começar 1 semana antes
    const endDate = new Date(carnavalDate);
    endDate.setDate(endDate.getDate() + 2); // Terminar 2 dias depois
    
    return date >= startDate && date <= endDate;
  }

  // Verificar se é temporada de São João
  isSaoJoaoSeason(date) {
    const month = date.getMonth();
    const day = date.getDate();
    // Junho (mês 5) do dia 15 ao 30
    return month === 5 && day >= 15 && day <= 30;
  }

  // Verificar se é Dia do Folclore
  isFolkloreDaySeason(date) {
    const month = date.getMonth();
    const day = date.getDate();
    // 22 de Agosto (mês 7) ±1 dia
    return month === 7 && day >= 21 && day <= 23;
  }

  // Verificar se é Dia da Amazônia
  isAmazonDay(date) {
    const month = date.getMonth();
    const day = date.getDate();
    // 5 de Setembro (mês 8)
    return month === 8 && day === 5;
  }

  // Verificar se é lua cheia (simplificado)
  isFullMoonNight(date) {
    // Simplificação: consideramos lua cheia a cada 29.5 dias
    // Em um jogo real, usaríamos uma API astronômica
    const lunarCycle = 29.53059; // dias
    const knownFullMoon = new Date('2025-01-13'); // Data conhecida de lua cheia
    const daysSinceKnownFullMoon = (date - knownFullMoon) / (1000 * 60 * 60 * 24);
    const cyclePosition = daysSinceKnownFullMoon % lunarCycle;
    
    // Consideramos ±1 dia como lua cheia
    return Math.abs(cyclePosition) <= 1 || Math.abs(cyclePosition - lunarCycle) <= 1;
  }

  // Calcular data do Carnaval (47 dias antes da Páscoa)
  getCarnavalDate(year) {
    const easter = this.getEasterDate(year);
    const carnaval = new Date(easter);
    carnaval.setDate(carnaval.getDate() - 47);
    return carnaval;
  }

  // Calcular data da Páscoa (algoritmo simplificado)
  getEasterDate(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    return new Date(year, month - 1, day);
  }

  // Obter duração do Carnaval
  getCarnavalDuration(date) {
    const carnavalDate = this.getCarnavalDate(date.getFullYear());
    const endDate = new Date(carnavalDate);
    endDate.setDate(endDate.getDate() + 2);
    
    return {
      end: endDate,
      daysRemaining: Math.ceil((endDate - date) / (1000 * 60 * 60 * 24))
    };
  }

  // Obter duração do São João
  getSaoJoaoDuration(date) {
    const endDate = new Date(date.getFullYear(), 5, 30); // 30 de junho
    return {
      end: endDate,
      daysRemaining: Math.ceil((endDate - date) / (1000 * 60 * 60 * 24))
    };
  }

  // Aplicar bônus de evento a uma carta
  applyEventBonus(card, eventId = null) {
    const activeEvents = eventId ? 
      this.currentEvents.filter(e => e.id === eventId) : 
      this.currentEvents;

    let totalMultiplier = 1.0;
    const appliedBonuses = [];

    for (const event of activeEvents) {
      if (event.bonusCards.includes('all') || 
          event.bonusCards.includes(card.id) ||
          this.cardMatchesEventCriteria(card, event)) {
        
        totalMultiplier *= event.multiplier;
        appliedBonuses.push({
          event: event.name,
          multiplier: event.multiplier,
          description: event.description
        });
      }
    }

    return {
      multiplier: totalMultiplier,
      bonuses: appliedBonuses,
      hasBonus: totalMultiplier > 1.0
    };
  }

  // Verificar se carta se qualifica para bônus do evento
  cardMatchesEventCriteria(card, event) {
    // Verificações específicas por evento
    switch (event.name) {
      case SEASONS.CARNIVAL:
        return card.tags?.includes('travessura') || 
               card.category === 'Assombrações';
      
      case SEASONS.SAO_JOAO:
        return card.region === 'Nordeste' || 
               card.category === 'Espíritos das Águas';
      
      case 'Lua Cheia':
        return card.tags?.includes('noturno') || 
               ['mul001', 'bot001'].includes(card.id);
      
      case 'Dia da Amazônia':
        return card.region === 'Amazônia';
      
      default:
        return false;
    }
  }

  // Obter recompensas de evento
  getEventRewards(eventId) {
    const event = this.currentEvents.find(e => e.id === eventId);
    if (!event) return null;

    const baseRewards = {
      experience: 100,
      coins: 50,
      cardPacks: 1
    };

    // Multiplicar recompensas base pelo multiplicador do evento
    const multipliedRewards = {};
    for (const [key, value] of Object.entries(baseRewards)) {
      multipliedRewards[key] = Math.floor(value * event.multiplier);
    }

    // Adicionar recompensas especiais
    if (event.specialEffects?.includes('free_card_packs')) {
      multipliedRewards.specialCardPacks = 3;
    }

    if (event.specialEffects?.includes('exclusive_carnival_cards')) {
      multipliedRewards.exclusiveCards = ['carnival_saci', 'carnival_curupira'];
    }

    return multipliedRewards;
  }

  // Inicializar sistema de eventos
  initialize() {
    this.getCurrentActiveEvents();
    
    // Configurar verificação periódica (a cada hora)
    setInterval(() => {
      this.getCurrentActiveEvents();
    }, 60 * 60 * 1000);
    
    return this.currentEvents;
  }
}

// Instância global do sistema de eventos
export const seasonalEvents = new SeasonalEventSystem();

// Funções utilitárias
export const getCurrentEvents = () => {
  return seasonalEvents.getCurrentActiveEvents();
};

export const getCardEventBonus = (card) => {
  return seasonalEvents.applyEventBonus(card);
};

export const isEventActive = (eventName) => {
  return seasonalEvents.currentEvents.some(event => event.name === eventName);
};
