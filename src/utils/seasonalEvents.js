// src/utils/seasonalEvents.js
import { ESTACOES } from '../data/cardsDatabase';

export class SeasonalEventSystem {
  constructor() {
  this.currentEvents = [];
  this.eventHistory = [];
  this.eventMultipliers = new Map();
  }

  // Verificar eventos ativos baseados na data
  getCurrentActiveEvents() {
    const agora = new Date();
    const eventosAtivos = [];

    // Carnaval (Fevereiro/Março)
    if (this.isCarnavalSeason(agora)) {
      eventosAtivos.push({
        id: 'carnival_2025',
  name: ESTACOES.CARNIVAL,
        description: 'Celebre o Carnaval! Cartas folclóricas ganham bônus especiais',
        multiplier: 1.75,
        duration: this.getCarnavalDuration(agora),
        bonusCards: ['sac001', 'mul001'], // Saci e Mula sem Cabeça
        specialEffects: ['increased_drop_rate', 'exclusive_carnival_cards']
      });
    }

    // São João (Junho)
    if (this.isSaoJoaoSeason(agora)) {
      eventosAtivos.push({
        id: 'sao_joao_2025',
  name: ESTACOES.SAO_JOAO,
        description: 'Festa Junina! Criaturas aquáticas e do folclore nordestino brilham',
        multiplier: 1.5,
        duration: this.getSaoJoaoDuration(agora),
        bonusCards: ['iar001', 'bot001', 'cab001'], // Iara, Boto, Caboclo d'Água
        specialEffects: ['double_xp_northeast', 'festa_junina_decorations']
      });
    }

    // Dia do Folclore (22 de Agosto)
    if (this.isFolkloreDaySeason(agora)) {
      eventosAtivos.push({
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
    if (this.isFullMoonNight(agora)) {
      eventosAtivos.push({
        id: `full_moon_${agora.getFullYear()}_${agora.getMonth()}`,
        name: 'Lua Cheia',
        description: 'As criaturas noturnas despertam com poder total!',
        multiplier: 2.0,
        duration: { hours: 6 }, // 6 horas de evento
        bonusCards: ['mul001', 'bot001'], // Criaturas noturnas
        specialEffects: ['night_creatures_boost', 'mysterious_encounters']
      });
    }

    // Dia da Amazônia (5 de Setembro)
    if (this.isAmazonDay(agora)) {
      eventosAtivos.push({
        id: 'amazon_day_2025',
        name: 'Dia da Amazônia',
        description: 'Proteja a floresta! Cartas amazônicas ganham força especial',
        multiplier: 1.8,
        duration: { days: 1 },
        bonusCards: ['cur001', 'iar001', 'bot001'], // Cartas amazônicas
        specialEffects: ['amazon_protection_quest', 'environmental_awareness']
      });
    }

    this.currentEvents = eventosAtivos;
    return eventosAtivos;
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
  const cicloLunar = 29.53059; // dias
  const luaCheiaConhecida = new Date('2025-01-13'); // Data conhecida de lua cheia
  const diasDesdeLuaCheia = (date - luaCheiaConhecida) / (1000 * 60 * 60 * 24);
  const posicaoNoCiclo = diasDesdeLuaCheia % cicloLunar;
    
    // Consideramos ±1 dia como lua cheia
  return Math.abs(posicaoNoCiclo) <= 1 || Math.abs(posicaoNoCiclo - cicloLunar) <= 1;
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
    const dataDoCarnaval = this.getCarnavalDate(date.getFullYear());
    const dataFinal = new Date(dataDoCarnaval);
    dataFinal.setDate(dataFinal.getDate() + 2);
    
    return {
      end: dataFinal,
      daysRemaining: Math.ceil((dataFinal - date) / (1000 * 60 * 60 * 24))
    };
  }

  // Obter duração do São João
  getSaoJoaoDuration(date) {
    const dataFinal = new Date(date.getFullYear(), 5, 30); // 30 de junho
    return {
      end: dataFinal,
      daysRemaining: Math.ceil((dataFinal - date) / (1000 * 60 * 60 * 24))
    };
  }

  // Aplicar bônus de evento a uma carta
  applyEventBonus(card, eventId = null) {
    const eventosAtivos = eventId ? 
      this.currentEvents.filter((e) => e.id === eventId) : 
      this.currentEvents;

    let multiplicadorTotal = 1.0;
    const bonusAplicados = [];

    for (const event of eventosAtivos) {
      if (event.bonusCards.includes('all') || 
          event.bonusCards.includes(card.id) ||
          this.cardMatchesEventCriteria(card, event)) {
        
        multiplicadorTotal *= event.multiplier;
        bonusAplicados.push({
          event: event.name,
          multiplier: event.multiplier,
          description: event.description
        });
      }
    }

    return {
      multiplier: multiplicadorTotal,
      bonuses: bonusAplicados,
      hasBonus: multiplicadorTotal > 1.0
    };
  }

  // Verificar se carta se qualifica para bônus do evento
  cardMatchesEventCriteria(card, event) {
    // Verificações específicas por evento
    switch (event.name) {
  case ESTACOES.CARNIVAL:
        return card.tags?.includes('travessura') || 
               (card.categoria || card.category) === 'Assombrações';
      
  case ESTACOES.SAO_JOAO:
        return (card.regiao || card.region) === 'Nordeste' || 
               (card.categoria || card.category) === 'Espíritos das Águas';
      
      case 'Lua Cheia':
        return card.tags?.includes('noturno') || 
               ['mul001', 'bot001'].includes(card.id);
      
      case 'Dia da Amazônia':
        return (card.regiao || card.region) === 'Amazônia';
      
      default:
        return false;
    }
  }

  // Obter recompensas de evento
  getEventRewards(eventId) {
    const event = this.currentEvents.find((e) => e.id === eventId);
    if (!event) return null;

    const recompensasBase = {
      experience: 100,
      coins: 50,
      cardPacks: 1
    };

    // Multiplicar recompensas base pelo multiplicador do evento
    const recompensasMultiplicadas = {};
    for (const [chave, valor] of Object.entries(recompensasBase)) {
      recompensasMultiplicadas[chave] = Math.floor(valor * event.multiplier);
    }

    // Adicionar recompensas especiais
    if (event.specialEffects?.includes('free_card_packs')) {
      recompensasMultiplicadas.specialCardPacks = 3;
    }

    if (event.specialEffects?.includes('exclusive_carnival_cards')) {
      recompensasMultiplicadas.exclusiveCards = ['carnival_saci', 'carnival_curupira'];
    }

    return recompensasMultiplicadas;
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
