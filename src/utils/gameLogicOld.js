// src/utils/gameLogic.js
import { CONSTANTES_DO_JOGO, FASES_DO_JOGO, ZONAS_CAMPO, ACOES_TURNO } from './constants';

export class MotorDeJogo {
  constructor(players) {
    this.players = players;
    this.indiceJogadorAtual = 0;
    this.turn = 1;
    this.fase = FASES_DO_JOGO.INICIO;
    this.gameLog = [];
    this.turnPhaseData = {}; // Dados temporários da fase atual
    this.ultimateConditions = new Map(); // Condições para ultimates
  }

  // Inicializar jogo - Nova estrutura
  iniciarJogo() {
    this.players.forEach((player, index) => {
      // Separar deck em lendas e itens
      const lendas = player.deck.filter(card => card.tipo === 'lenda');
      const itens = player.deck.filter(card => card.tipo === 'item');
      
      // Inicializar zonas do campo
      player.zonas = {
        [ZONAS_CAMPO.LENDA_ATIVA]: null,                    // 1 lenda ativa (escolhida na pré-partida)
        [ZONAS_CAMPO.BANCO_LENDAS]: lendas.slice(1),        // 4 lendas restantes
        [ZONAS_CAMPO.MAO_ITENS]: [],                        // Mão de itens (até 3)
        [ZONAS_CAMPO.PILHA_ITENS]: this.embaralharBaralho([...itens]), // Pilha embaralhada
        [ZONAS_CAMPO.DESCARTE_ITENS]: []                    // Descarte de itens
      };
      
      // Definir lenda inicial (primeira do deck ou escolhida)
      player.zonas[ZONAS_CAMPO.LENDA_ATIVA] = lendas[0];
      
      // Status do jogador
      player.energia = 0; // Para ultimates
      player.efeitosAtivos = new Map(); // Buffs/debuffs temporários
    });

    // Compra inicial de itens
    this.players.forEach(player => {
      this.comprarItens(player, 2); // Começar com 2 itens
    });

    this.adicionarAoLog('Partida iniciada! Fase de Início do primeiro turno.', 'info');
    this.executarFaseInicio();
    return this.obterEstadoDoJogo();
  }

  // Comprar itens para a mão
  comprarItens(player, quantidade = 1) {
    const pilhaItens = player.zonas[ZONAS_CAMPO.PILHA_ITENS];
    const maoItens = player.zonas[ZONAS_CAMPO.MAO_ITENS];
    
    for (let i = 0; i < quantidade; i++) {
      if (maoItens.length >= CONSTANTES_DO_JOGO.TAMANHO_MAXIMO_MAO_ITENS) {
        break; // Mão cheia
      }
      
      if (pilhaItens.length === 0) {
        // Reembaralhar descarte se pilha vazia
        if (player.zonas[ZONAS_CAMPO.DESCARTE_ITENS].length > 0) {
          player.zonas[ZONAS_CAMPO.PILHA_ITENS] = this.embaralharBaralho([...player.zonas[ZONAS_CAMPO.DESCARTE_ITENS]]);
          player.zonas[ZONAS_CAMPO.DESCARTE_ITENS] = [];
        } else {
          break; // Sem mais itens
        }
      }
      
      const item = pilhaItens.shift();
      if (item) {
        maoItens.push(item);
      }
    }
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

  // =============================================================================
  // FASES DE TURNO - Nova Estrutura
  // =============================================================================

  // FASE 1: INÍCIO
  executarFaseInicio() {
    this.fase = FASES_DO_JOGO.INICIO;
    this.adicionarAoLog(`--- Turno ${this.turn} - Fase de Início ---`, 'phase');
    
    this.players.forEach((player, index) => {
      // Ativar passivas das lendas
      this.ativarPassivas(player);
      
      // Resolver efeitos contínuos (veneno, queimadura, escudos)
      this.resolverEfeitosContinuos(player);
      
      // Checar condições de ultimate
      this.checarCondicoesUltimate(player);
    });
    
    // Prosseguir para fase de ação
    this.proximaFase();
  }

  // FASE 2: AÇÃO
  executarFaseAcao() {
    this.fase = FASES_DO_JOGO.ACAO;
    const jogadorAtual = this.players[this.indiceJogadorAtual];
    this.adicionarAoLog(`${jogadorAtual.name} - Fase de Ação`, 'phase');
    
    // Aguarda escolha do jogador (será chamado externamente)
    // Possíveis ações: usar habilidade, trocar lenda, usar item, ação especial
  }

  // FASE 3: RESOLUÇÃO
  executarFaseResolucao(resultado) {
    this.fase = FASES_DO_JOGO.RESOLUCAO;
    this.adicionarAoLog('Fase de Resolução', 'phase');
    
    // Calcular dano, aplicar efeitos
    this.aplicarEfeitos(resultado);
    
    // Checar derrotas de lendas
    this.checarDerrota();
    
    // Ativar efeitos pós-ação (contra-ataques, explosões)
    this.ativarEfeitosPosAcao(resultado);
    
    this.proximaFase();
  }

  // FASE 4: FIM DO TURNO
  executarFaseFimTurno() {
    this.fase = FASES_DO_JOGO.FIM_TURNO;
    this.adicionarAoLog('Fase de Fim do Turno', 'phase');
    
    // Ambos compram 1 item (se não estiverem com 3)
    this.players.forEach(player => {
      if (player.zonas[ZONAS_CAMPO.MAO_ITENS].length < CONSTANTES_DO_JOGO.TAMANHO_MAXIMO_MAO_ITENS) {
        this.comprarItens(player, 1);
      }
    });
    
    // Aplicar efeitos de fim de turno
    this.aplicarEfeitosFimTurno();
    
    // Passar turno
    this.passarTurno();
  }

  // =============================================================================
  // MÉTODOS AUXILIARES PARA AS FASES
  // =============================================================================
  
  ativarPassivas(player) {
    const lendaAtiva = player.zonas[ZONAS_CAMPO.LENDA_ATIVA];
    if (lendaAtiva && lendaAtiva.habilidades?.passive) {
      const passiva = lendaAtiva.habilidades.passive;
      this.adicionarAoLog(`Passiva ativada: ${passiva.name}`, 'ability');
      // Implementar lógica específica da passiva
      this.aplicarEfeitoPassiva(player, passiva);
    }
  }

  resolverEfeitosContinuos(player) {
    // Processar buffs/debuffs temporários
    for (const [efeito, dados] of player.efeitosAtivos) {
      dados.turnos--;
      if (dados.turnos <= 0) {
        player.efeitosAtivos.delete(efeito);
        this.adicionarAoLog(`Efeito ${efeito} expirou`, 'info');
      } else {
        // Aplicar efeito contínuo
        this.aplicarEfeitoContinuo(player, efeito, dados);
      }
    }
  }

  checarCondicoesUltimate(player) {
    const lendaAtiva = player.zonas[ZONAS_CAMPO.LENDA_ATIVA];
    if (lendaAtiva && lendaAtiva.habilidades?.skill5) {
      const ultimate = lendaAtiva.habilidades.skill5;
      // Verificar se pode usar ultimate (por turnos, energia, etc.)
      if (ultimate.ppMax === 1 && this.turn >= 5) { // Exemplo: ultimate disponível após turno 5
        this.adicionarAoLog(`Ultimate ${ultimate.name} disponível!`, 'ultimate');
      }
    }
  }

  // =============================================================================
  // AÇÕES PRINCIPAIS DO JOGADOR
  // =============================================================================

  // Usar habilidade da lenda ativa
  usarHabilidade(playerIndex, habilidadeId, target = null) {
    if (this.fase !== FASES_DO_JOGO.ACAO || playerIndex !== this.indiceJogadorAtual) {
      return { success: false, error: 'Não é sua vez ou fase incorreta' };
    }

    const player = this.players[playerIndex];
    const lendaAtiva = player.zonas[ZONAS_CAMPO.LENDA_ATIVA];
    
    if (!lendaAtiva || !lendaAtiva.habilidades?.[habilidadeId]) {
      return { success: false, error: 'Habilidade inválida' };
    }

    const habilidade = lendaAtiva.habilidades[habilidadeId];
    
    // Verificar PP disponível
    if (!lendaAtiva.pp) lendaAtiva.pp = {};
    const ppAtual = lendaAtiva.pp[habilidadeId] || habilidade.ppMax;
    
    if (ppAtual < habilidade.cost) {
      return { success: false, error: 'PP insuficiente' };
    }

    // Gastar PP
    lendaAtiva.pp[habilidadeId] = ppAtual - habilidade.cost;

    this.adicionarAoLog(`${player.name} usou ${habilidade.name}`, 'action');

    // Executar resolução
    const resultado = {
      tipo: ACOES_TURNO.USAR_HABILIDADE,
      playerIndex,
      habilidade,
      target
    };
    
    this.executarFaseResolucao(resultado);
    return { success: true, resultado };
  }

  // Trocar lenda ativa
  trocarLenda(playerIndex, legendaIndex) {
    if (this.fase !== FASES_DO_JOGO.ACAO || playerIndex !== this.indiceJogadorAtual) {
      return { success: false, error: 'Não é sua vez ou fase incorreta' };
    }

    const player = this.players[playerIndex];
    const bancoLendas = player.zonas[ZONAS_CAMPO.BANCO_LENDAS];
    
    if (legendaIndex < 0 || legendaIndex >= bancoLendas.length) {
      return { success: false, error: 'Lenda inválida' };
    }

    // Trocar lendas
    const lendaAtual = player.zonas[ZONAS_CAMPO.LENDA_ATIVA];
    const novaLenda = bancoLendas[legendaIndex];
    
    player.zonas[ZONAS_CAMPO.LENDA_ATIVA] = novaLenda;
    bancoLendas[legendaIndex] = lendaAtual;

    this.adicionarAoLog(`${player.name} trocou para ${novaLenda.nome}`, 'action');

    const resultado = {
      tipo: ACOES_TURNO.TROCAR_LENDA,
      playerIndex,
      lendaAtual,
      novaLenda
    };
    
    this.executarFaseResolucao(resultado);
    return { success: true, resultado };
  }

  // Usar item da mão
  usarItem(playerIndex, itemIndex, target = null) {
    if (this.fase !== FASES_DO_JOGO.ACAO || playerIndex !== this.indiceJogadorAtual) {
      return { success: false, error: 'Não é sua vez ou fase incorreta' };
    }

    const player = this.players[playerIndex];
    const maoItens = player.zonas[ZONAS_CAMPO.MAO_ITENS];
    
    if (itemIndex < 0 || itemIndex >= maoItens.length) {
      return { success: false, error: 'Item inválido' };
    }

    const item = maoItens.splice(itemIndex, 1)[0];
    
    // Mover para descarte
    player.zonas[ZONAS_CAMPO.DESCARTE_ITENS].push(item);

    this.adicionarAoLog(`${player.name} usou ${item.nome}`, 'action');

    const resultado = {
      tipo: ACOES_TURNO.USAR_ITEM,
      playerIndex,
      item,
      target
    };
    
    this.executarFaseResolucao(resultado);
    return { success: true, resultado };
  }

  // =============================================================================
  // MÉTODOS AUXILIARES CONTINUAÇÃO
  // =============================================================================

  aplicarEfeitos(resultado) {
    // Implementa os efeitos baseados no tipo de ação
    switch (resultado.tipo) {
      case ACOES_TURNO.USAR_HABILIDADE:
        this.aplicarEfeitoHabilidade(resultado);
        break;
      case ACOES_TURNO.USAR_ITEM:
        this.aplicarEfeitoItem(resultado);
        break;
      case ACOES_TURNO.TROCAR_LENDA:
        // Troca já foi aplicada, apenas efeitos pós-troca
        this.aplicarEfeitosTroca(resultado);
        break;
    }
  }

  aplicarEfeitoHabilidade(resultado) {
    const { habilidade, target, playerIndex } = resultado;
    const oponente = this.players[1 - playerIndex];
    
    switch (habilidade.kind) {
      case 'damage':
        const dano = habilidade.base || 0;
        if (target) {
          target.vida -= dano;
          this.adicionarAoLog(`Causou ${dano} de dano`, 'damage');
        }
        break;
      case 'heal':
        const cura = habilidade.base || 0;
        if (target) {
          target.vida += cura;
          this.adicionarAoLog(`Curou ${cura} pontos`, 'heal');
        }
        break;
      case 'buff':
      case 'debuff':
        this.aplicarBuff(target, habilidade);
        break;
      case 'stun':
        this.aplicarAtordoamento(target, habilidade.stun || 1);
        break;
    }
  }

  aplicarEfeitoItem(resultado) {
    const { item, target, playerIndex } = resultado;
    // Implementar efeitos específicos dos itens
    this.adicionarAoLog(`Aplicando efeito do item ${item.nome}`, 'item');
  }

  checarDerrota() {
    this.players.forEach((player, index) => {
      const lendaAtiva = player.zonas[ZONAS_CAMPO.LENDA_ATIVA];
      if (lendaAtiva && lendaAtiva.vida <= 0) {
        this.adicionarAoLog(`${lendaAtiva.nome} foi derrotada!`, 'defeat');
        
        // Verificar se há lendas no banco
        const bancoLendas = player.zonas[ZONAS_CAMPO.BANCO_LENDAS];
        if (bancoLendas.length > 0) {
          // Automaticamente trocar para próxima lenda
          const proximaLenda = bancoLendas.shift();
          player.zonas[ZONAS_CAMPO.LENDA_ATIVA] = proximaLenda;
          this.adicionarAoLog(`${proximaLenda.nome} entra em campo`, 'info');
        } else {
          // Jogador derrotado
          this.adicionarAoLog(`${player.name} foi derrotado!`, 'gameover');
          this.gameOver = true;
          this.vencedor = 1 - index;
        }
      }
    });
  }

  passarTurno() {
    this.indiceJogadorAtual = 1 - this.indiceJogadorAtual;
    if (this.indiceJogadorAtual === 0) {
      this.turn++;
    }
    this.executarFaseInicio();
  }

  proximaFase() {
    switch (this.fase) {
      case FASES_DO_JOGO.INICIO:
        this.executarFaseAcao();
        break;
      case FASES_DO_JOGO.RESOLUCAO:
        this.executarFaseFimTurno();
        break;
      default:
        // Fase de ação aguarda input do jogador
        break;
    }
  }

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
