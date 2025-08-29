// src/utils/gameLogic.js
import { CONSTANTES_DO_JOGO, FASES_DO_JOGO } from './constants';

export class MotorDeJogo {
  constructor(players) {
    this.players = players;
  this.indiceJogadorAtual = 0;
    this.turn = 1;
  this.fase = FASES_DO_JOGO?.COMPRA || 'compra';
    this.gameLog = [];
  }

  // Inicializar jogo
  iniciarJogo() {
    this.players.forEach((player, index) => {
      player.vida = CONSTANTES_DO_JOGO.VIDA_INICIAL;
      player.mana = CONSTANTES_DO_JOGO.MANA_INICIAL;
      player.hand = this.comprarMaoInicial(player.deck);
  player.field = [];
  player.cemiterio = [];
    });

    this.adicionarAoLog('Jogo iniciado!', 'info');
    return this.obterEstadoDoJogo();
  }

  // Sacar mão inicial
  comprarMaoInicial(deck) {
    const baralhoEmbaralhado = this.embaralharBaralho([...deck]);
    return baralhoEmbaralhado.splice(0, 5); // 5 cartas iniciais
  }

  // Embaralhar deck
  embaralharBaralho(deck) {
    const embaralhado = [...deck];
    for (let i = embaralhado.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [embaralhado[i], embaralhado[j]] = [embaralhado[j], embaralhado[i]];
    }
    return embaralhado;
  }

  // Comprar carta
  comprarCarta(playerIndex) {
    const player = this.players[playerIndex];
    
    if (player.deck.length === 0) {
      // Dano por fadiga
      player.vida -= this.turn;
      this.adicionarAoLog(`${player.name} sofreu ${this.turn} de dano por fadiga!`, 'warning');
      return null;
    }

    if (player.hand.length >= CONSTANTES_DO_JOGO.TAMANHO_MAXIMO_MAO) {
      // Carta é descartada
      const cartaDescartada = player.deck.shift();
  this.adicionarAoLog(`${player.name} descartou ${cartaDescartada.nome || cartaDescartada.name} (mão cheia)`, 'info');
      return cartaDescartada;
    }

    const cartaComprada = player.deck.shift();
    player.hand.push(cartaComprada);
  this.adicionarAoLog(`${player.name} comprou uma carta`, 'info');
    return cartaComprada;
  }

  // Jogar carta
  jogarCarta(playerIndex, cardIndex, target = null) {
    const player = this.players[playerIndex];
    const card = player.hand[cardIndex];

    // Verificações
    if (!this.podeJogarCarta(playerIndex, card)) {
      return { success: false, error: 'Não é possível jogar esta carta' };
    }

    // Gastar mana (cartas não têm mais custo; custos estão nas habilidades)
  player.mana -= (card.custo || card.cost || 0);

    // Remover carta da mão
    player.hand.splice(cardIndex, 1);

    // Aplicar efeito da carta
    const result = this.aplicarEfeitoDaCarta(card, playerIndex, target);

  this.adicionarAoLog(`${player.name} jogou ${card.nome || card.name}`, 'action');

    return { success: true, result };
  }

  // Verificar se pode jogar carta
  podeJogarCarta(playerIndex, card) {
    const player = this.players[playerIndex];
    
    // Verificar turno
  if (playerIndex !== this.indiceJogadorAtual) {
      return false;
    }

    // Verificar mana
    // Cartas não têm mais custo; manter compat por segurança
  if (player.mana < (card.custo || card.cost || 0)) {
      return false;
    }

    // Verificar fase
  if (this.fase === FASES_DO_JOGO.COMBATE && (card.tipo || card.type) === 'creature') {
      return false;
    }

    return true;
  }

  // Aplicar efeito da carta
  aplicarEfeitoDaCarta(card, playerIndex, target) {
    const player = this.players[playerIndex];

  switch (card.tipo || card.type || 'creature') {
      case 'creature':
        // Adicionar criatura ao campo
        const criatura = {
          ...card,
          vida: card.defesa || card.defense,
          vidaMaxima: card.defesa || card.defense,
          podeAtacar: false, // lentidão de invocação
          effects: []
        };
        player.field.push(criatura);
        break;

  case 'spell':
        // Aplicar efeito do feitiço
        this.aplicarEfeitoDoFeitico(card, playerIndex, target);
        // Feitiços vão para o cemitério
  player.cemiterio.push(card);
        break;

      default:
        // Tratar como criatura por padrão
        const criaturaPadrao = {
          ...card,
          vida: card.defense,
          vidaMaxima: card.defense,
          podeAtacar: false,
          effects: []
        };
        player.field.push(criaturaPadrao);
    }

    return { card, target };
  }

  // Aplicar efeito de feitiço
  aplicarEfeitoDoFeitico(spell, playerIndex, target) {
    const player = this.players[playerIndex];
    const opponent = this.players[1 - playerIndex];

    // Implementar efeitos específicos baseados na habilidade
    switch (spell.ability) {
      case 'Canto Hipnótico':
        if (Math.random() < 0.3) { // 30% de chance
          // Pular próximo turno do oponente (simplificado)
          this.adicionarAoLog(`${opponent.name} perdeu o próximo turno!`, 'special');
        }
        break;

      case 'Fogo Protetor':
        // Causar dano contínuo
  opponent.vida -= 3;
        this.adicionarAoLog(`${opponent.name} sofreu 3 de dano de fogo!`, 'damage');
        break;

      default:
  this.adicionarAoLog(`Efeito de ${spell.nome || spell.name} aplicado`, 'info');
    }
  }

  // Atacar com criatura
  atacarComCriatura(playerIndex, creatureIndex, targetType, targetIndex = null) {
    const player = this.players[playerIndex];
    const opponent = this.players[1 - playerIndex];
    const criatura = player.field[creatureIndex];

    if (!this.podeAtacar(playerIndex, creatureIndex)) {
      return { success: false, error: 'Criatura não pode atacar' };
    }

    if (targetType === 'player') {
      // Atacar jogador diretamente
  opponent.vida -= (criatura.ataque || criatura.attack);
  this.adicionarAoLog(`${criatura.nome || criatura.name} atacou ${opponent.name} causando ${(criatura.ataque || criatura.attack)} de dano!`, 'damage');
    } else if (targetType === 'creature') {
      // Atacar criatura
      const criaturaAlvo = opponent.field[targetIndex];
      
      // Aplicar dano
  criaturaAlvo.vida -= (criatura.ataque || criatura.attack);
  criatura.vida -= (criaturaAlvo.ataque || criaturaAlvo.attack);

  this.adicionarAoLog(`${criatura.nome || criatura.name} atacou ${criaturaAlvo.nome || criaturaAlvo.name}!`, 'combat');

      // Remover criaturas mortas
      if (criaturaAlvo.vida <= 0) {
        opponent.field.splice(targetIndex, 1);
        opponent.cemiterio.push(criaturaAlvo);
  this.adicionarAoLog(`${criaturaAlvo.nome || criaturaAlvo.name} foi destruída!`, 'death');
      }

      if (criatura.vida <= 0) {
        player.field.splice(creatureIndex, 1);
        player.cemiterio.push(criatura);
  this.adicionarAoLog(`${criatura.nome || criatura.name} foi destruída!`, 'death');
      }
    }

    // Marcar criatura como tendo atacado
    if (criatura.vida > 0) {
      criatura.podeAtacar = false;
    }

    return { success: true };
  }

  // Verificar se criatura pode atacar
  podeAtacar(playerIndex, creatureIndex) {
    const player = this.players[playerIndex];
  const criaturaRef = player.field[creatureIndex];

    // Verificar turno
  if (playerIndex !== this.indiceJogadorAtual) {
      return false;
    }

    // Verificar fase
  if (this.fase !== FASES_DO_JOGO.COMBATE) {
      return false;
    }

    // Verificar se pode atacar
  if (!criaturaRef.podeAtacar) {
      return false;
    }

    return true;
  }

  // Finalizar turno
  finalizarTurno() {
  const jogadorAtual = this.players[this.indiceJogadorAtual];

    // Reset de criaturas
    jogadorAtual.field.forEach(creature => {
      creature.podeAtacar = true;
    });

    // Próximo jogador
  this.indiceJogadorAtual = (this.indiceJogadorAtual + 1) % this.players.length;
    
  if (this.indiceJogadorAtual === 0) {
      this.turn++;
    }

    // Novo turno
    this.iniciarTurno();

    return this.obterEstadoDoJogo();
  }

  // Iniciar turno
  iniciarTurno() {
  const jogadorAtual = this.players[this.indiceJogadorAtual];

    // Aumentar mana
  jogadorAtual.mana = Math.min(CONSTANTES_DO_JOGO.MANA_MAXIMA, this.turn);

    // Comprar carta
  this.comprarCarta(this.indiceJogadorAtual);

    // Mudar para fase de compra
  this.fase = FASES_DO_JOGO.COMPRA;

  this.adicionarAoLog(`Turno ${this.turn} - ${jogadorAtual.name}`, 'turn');
  }

  // Verificar condições de vitória
  verificarCondicaoDeVitoria() {
    for (let i = 0; i < this.players.length; i++) {
  if (this.players[i].vida <= 0) {
  const winner = this.players[1 - i];
  return { gameEnded: true, winner, reason: 'vida' };
      }
    }

    return { gameEnded: false };
  }

  // Obter estado do jogo
  obterEstadoDoJogo() {
    return {
      players: this.players.map(p => ({ ...p })),
  indiceJogadorAtual: this.indiceJogadorAtual,
      turn: this.turn,
  fase: this.fase,
      gameLog: [...this.gameLog],
      winCondition: this.verificarCondicaoDeVitoria()
    };
  }

  // Adicionar ao log
  adicionarAoLog(message, type = 'info') {
    this.gameLog.push({
      message,
      type,
      timestamp: Date.now(),
      turn: this.turn
    });

    // Manter apenas últimas 50 entradas
    if (this.gameLog.length > 50) {
      this.gameLog = this.gameLog.slice(-50);
    }
  }
}

// Utilitários de deck
export const UtilitariosDeck = {
  // Validar deck
  validarDeck(cards) {
    const errors = [];

    if (cards.length < CONSTANTES_DO_JOGO.TAMANHO_MINIMO_DECK) {
      errors.push(`Deck deve ter pelo menos ${CONSTANTES_DO_JOGO.TAMANHO_MINIMO_DECK} cartas`);
    }

    if (cards.length > CONSTANTES_DO_JOGO.TAMANHO_MAXIMO_DECK) {
      errors.push(`Deck não pode ter mais de ${CONSTANTES_DO_JOGO.TAMANHO_MAXIMO_DECK} cartas`);
    }

    // Verificar limite de cópias
    const cardCounts = {};
    cards.forEach(card => {
      cardCounts[card.id] = (cardCounts[card.id] || 0) + 1;
    });

    for (const [cardId, count] of Object.entries(cardCounts)) {
      if (count > CONSTANTES_DO_JOGO.COPIAS_MAXIMAS_POR_CARTA) {
        errors.push(`Máximo ${CONSTANTES_DO_JOGO.COPIAS_MAXIMAS_POR_CARTA} cópias da mesma carta`);
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Calcular estatísticas do deck
  calcularEstatisticasDoDeck(cards) {
    // Compat: sem custo por carta, agregados baseados em ataque
  const totalCost = cards.reduce((sum, card) => sum + (card.custo || card.cost || 0), 0);
    const averageCost = cards.length ? (totalCost / cards.length) : 0;

    const costDistribution = {};
    cards.forEach(card => {
  const c = card.custo || card.cost || 0;
      costDistribution[c] = (costDistribution[c] || 0) + 1;
    });

    const categoryDistribution = {};
    cards.forEach(card => {
  const cat = card.categoria || card.category;
  categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
    });

    return {
      totalCards: cards.length,
      averageCost: Math.round(averageCost * 10) / 10,
      costDistribution,
      categoryDistribution,
      uniqueCards: new Set(cards.map(c => c.id)).size
    };
  }
};
