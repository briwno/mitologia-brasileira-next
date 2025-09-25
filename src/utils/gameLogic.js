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
    this.ultimateUsed = new Map(); // Controla ultimates já usados
    this.habilidadeCooldowns = new Map(); // Controla cooldowns das habilidades
    this.gameOver = false;
    this.vencedor = null;
    this.tipoVitoria = null; // 'eliminacao' ou 'desistencia'
  }

  // =============================================================================
  // INICIALIZAÇÃO DO JOGO
  // =============================================================================

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
        [ZONAS_CAMPO.ITEM_ATIVO]: null,                     // 1 item equipado na lenda ativa
        [ZONAS_CAMPO.PILHA_ITENS]: this.embaralharBaralho([...itens]), // Pilha embaralhada
        [ZONAS_CAMPO.DESCARTE_ITENS]: []                    // Descarte de itens
      };
      
      // Definir lenda inicial (primeira do deck ou escolhida)
      const lendaInicial = lendas[0];
      lendaInicial.vidaAtual = lendaInicial.vida; // Inicializar vida atual
      lendaInicial.ppAtual = {}; // Inicializar PP atual para cada habilidade
      lendaInicial.ultimateUsado = false; // Ultimate ainda não usado
      player.zonas[ZONAS_CAMPO.LENDA_ATIVA] = lendaInicial;
      
      // Status do jogador
      player.energia = 0; // Para ultimates
      player.efeitosAtivos = new Map(); // Buffs/debuffs temporários
      player.lendasDerrotadas = 0; // Contador de lendas derrotadas
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
    let comprados = 0;
    
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
        comprados++;
      }
    }
    
    return comprados;
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
    const jogadorAtual = this.players[this.indiceJogadorAtual];
    this.adicionarAoLog(`--- Turno ${this.turn} - ${jogadorAtual.name} ---`, 'phase');
    this.adicionarAoLog('FASE 1: INÍCIO', 'phase');
    
    this.players.forEach((player, index) => {
      // 1. Ativação Passiva: Ativar todas as habilidades passivas da Lenda Ativa
      this.ativarPassivas(player);
      
      // 2. Resolução de Efeitos Contínuos (DoT/HoT): Resolver efeitos persistentes
      this.resolverEfeitosContinuos(player);
      
      // 3. Verificação de Ultimate: Verificar se os requisitos foram atendidos
      this.checarCondicoesUltimate(player);
      
      // Reduzir cooldowns das habilidades
      this.reduzirCooldowns(player);
    });
    
    // Verificar se jogo acabou por derrota
    if (this.gameOver) return this.obterEstadoDoJogo();
    
    // Prosseguir para fase de ação
    this.proximaFase();
  }

  // FASE 2: AÇÃO
  executarFaseAcao() {
    this.fase = FASES_DO_JOGO.ACAO;
    const jogadorAtual = this.players[this.indiceJogadorAtual];
    this.adicionarAoLog('FASE 2: AÇÃO', 'phase');
    this.adicionarAoLog(`${jogadorAtual.name} deve escolher UMA ação:`, 'info');
    this.adicionarAoLog('• Usar Habilidade (PP disponível)', 'info');
    this.adicionarAoLog('• Trocar Lenda (consome ação)', 'info');
    this.adicionarAoLog('• Usar Item (da mão)', 'info');
    
    // Aguarda escolha do jogador (será chamado externamente via usarHabilidade, trocarLenda, usarItem)
    // IMPORTANTE: O jogador deve escolher APENAS UMA ação que consome o turno inteiro
  }

  // FASE 3: RESOLUÇÃO
  executarFaseResolucao(resultado) {
    this.fase = FASES_DO_JOGO.RESOLUCAO;
    this.adicionarAoLog('FASE 3: RESOLUÇÃO', 'phase');
    
    // 1. Cálculo e Consumo: Calcular dano final e reduzir PP
    this.aplicarEfeitos(resultado);
    
    // 2. Verificação de Derrota: Avaliar se alguma Lenda atingiu 0 HP
    this.checarDerrota();
    
    // Se jogo acabou, parar aqui
    if (this.gameOver) return this.obterEstadoDoJogo();
    
    // 3. Efeitos Pós-Ação: Ativar efeitos desencadeados pela jogada
    this.ativarEfeitosPosAcao(resultado);
    
    this.proximaFase();
  }

  // FASE 4: FIM DO TURNO
  executarFaseFimTurno() {
    this.fase = FASES_DO_JOGO.FIM_TURNO;
    this.adicionarAoLog('FASE 4: FIM DO TURNO', 'phase');
    
    // 1. Compra de Item: AMBOS os jogadores compram 1 carta adicional da Pilha
    // Condição: A Mão de Itens não deve estar no limite máximo de 3 cartas
    this.players.forEach((player, index) => {
      if (player.zonas[ZONAS_CAMPO.MAO_ITENS].length < CONSTANTES_DO_JOGO.TAMANHO_MAXIMO_MAO_ITENS) {
        const comprou = this.comprarItens(player, 1);
        if (comprou > 0) {
          this.adicionarAoLog(`${player.name} comprou ${comprou} item`, 'info');
        }
      } else {
        this.adicionarAoLog(`${player.name} tem mão cheia (3/3 itens)`, 'info');
      }
    });
    
    // 2. Efeitos de Fim de Turno: Aplicar efeitos programados para o final
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
    if (lendaAtiva && lendaAtiva.habilidades?.skill5 && !lendaAtiva.ultimateUsado) {
      const ultimate = lendaAtiva.habilidades.skill5;
      // Verificar se pode usar ultimate (requisitos específicos)
      if (this.turn >= 5 || player.energia >= 10) { // Exemplo: disponível após turno 5 ou energia 10
        this.adicionarAoLog(`Ultimate ${ultimate.name} DISPONÍVEL para ${lendaAtiva.nome}!`, 'ultimate');
      }
    }
  }

  reduzirCooldowns(player) {
    const playerId = this.players.indexOf(player);
    const lendaAtiva = player.zonas[ZONAS_CAMPO.LENDA_ATIVA];
    
    if (lendaAtiva && this.habilidadeCooldowns.has(playerId)) {
      const cooldowns = this.habilidadeCooldowns.get(playerId);
      for (const [habilidadeId, turnosRestantes] of cooldowns) {
        if (turnosRestantes > 0) {
          cooldowns.set(habilidadeId, turnosRestantes - 1);
          if (turnosRestantes - 1 === 0) {
            this.adicionarAoLog(`${lendaAtiva.habilidades[habilidadeId]?.name || habilidadeId} não está mais em cooldown`, 'info');
          }
        }
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
    
    // Verificar se é ultimate e se já foi usado
    if (habilidadeId === 'skill5' && lendaAtiva.ultimateUsado) {
      return { success: false, error: 'Ultimate já foi usado nesta partida' };
    }
    
    // Verificar cooldown (3 turnos para mesma habilidade)
    if (this.habilidadeEmCooldown(playerIndex, habilidadeId)) {
      const cooldown = this.obterCooldownRestante(playerIndex, habilidadeId);
      return { success: false, error: `Habilidade em cooldown por ${cooldown} turnos` };
    }
    
    // Verificar PP disponível
    if (!lendaAtiva.ppAtual) lendaAtiva.ppAtual = {};
    const ppAtual = lendaAtiva.ppAtual[habilidadeId] || habilidade.ppMax;
    
    if (ppAtual < habilidade.cost) {
      return { success: false, error: `PP insuficiente (${ppAtual}/${habilidade.cost})` };
    }

    // Gastar PP
    lendaAtiva.ppAtual[habilidadeId] = ppAtual - habilidade.cost;
    
    // Aplicar cooldown (exceto ataque básico)
    if (habilidadeId !== 'skill1') { // skill1 = ataque básico sem cooldown
      this.aplicarCooldown(playerIndex, habilidadeId, CONSTANTES_DO_JOGO.COOLDOWN_HABILIDADE);
    }
    
    // Marcar ultimate como usado se for o caso
    if (habilidadeId === 'skill5') {
      lendaAtiva.ultimateUsado = true;
      this.adicionarAoLog(`🔥 ULTIMATE USADO! ${habilidade.name} não pode mais ser usado nesta partida`, 'ultimate');
    }

    this.adicionarAoLog(`${player.name} usou ${habilidade.name} (${habilidade.cost} PP)`, 'action');

    // Executar resolução
    const resultado = {
      tipo: ACOES_TURNO.USAR_HABILIDADE,
      playerIndex,
      habilidade,
      habilidadeId,
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
    
    if (itemIndex < 0 || itemIndex >= maoItens.length || !maoItens[itemIndex]) {
      return { success: false, error: 'Item inválido ou slot vazio' };
    }

    const item = maoItens.splice(itemIndex, 1)[0];
    
    // Verificar se é item equipável (fica ativo) ou consumível (usa e descarta)
    if (item.categoria === 'equipamento') {
      // Item equipável: substitui item ativo atual
      const itemAtivoAnterior = player.zonas[ZONAS_CAMPO.ITEM_ATIVO];
      if (itemAtivoAnterior) {
        // Mover item ativo anterior para descarte
        player.zonas[ZONAS_CAMPO.DESCARTE_ITENS].push(itemAtivoAnterior);
        this.adicionarAoLog(`${itemAtivoAnterior.nome} foi desequipado`, 'info');
      }
      
      // Equipar novo item
      player.zonas[ZONAS_CAMPO.ITEM_ATIVO] = item;
      this.adicionarAoLog(`${player.name} equipou ${item.nome}`, 'action');
    } else {
      // Item consumível: usar e descartar
      player.zonas[ZONAS_CAMPO.DESCARTE_ITENS].push(item);
      this.adicionarAoLog(`${player.name} usou ${item.nome}`, 'action');
    }

    const resultado = {
      tipo: ACOES_TURNO.USAR_ITEM,
      playerIndex,
      item,
      target,
      equipavel: item.categoria === 'equipamento'
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
    const player = this.players[playerIndex];
    const oponente = this.players[1 - playerIndex];
    
    this.adicionarAoLog(`Aplicando efeito do item ${item.nome}`, 'item');
    
    // Aplicar efeitos baseados no tipo do item
    if (item.efeito) {
      switch (item.tipo) {
        case 'ofensivo':
          if (item.efeito.dano) {
            const lendaOponente = oponente.zonas[ZONAS_CAMPO.LENDA_ATIVA];
            if (lendaOponente) {
              lendaOponente.vida -= item.efeito.dano;
              this.adicionarAoLog(`${item.nome} causou ${item.efeito.dano} de dano`, 'damage');
            }
          }
          break;
          
        case 'defensivo':
          if (item.efeito.cura) {
            const lendaAtiva = player.zonas[ZONAS_CAMPO.LENDA_ATIVA];
            if (lendaAtiva) {
              lendaAtiva.vida = Math.min(lendaAtiva.vidaMaxima || lendaAtiva.vida + 100, lendaAtiva.vida + item.efeito.cura);
              this.adicionarAoLog(`${item.nome} curou ${item.efeito.cura} pontos`, 'heal');
            }
          }
          if (item.efeito.escudo) {
            player.efeitosAtivos.set('escudo', { valor: item.efeito.escudo, turnos: 3 });
            this.adicionarAoLog(`${item.nome} concedeu escudo de ${item.efeito.escudo}`, 'buff');
          }
          break;
          
        case 'utilitario':
          if (item.efeito.comprar_cartas) {
            this.comprarItens(player, item.efeito.comprar_cartas);
            this.adicionarAoLog(`${item.nome} permitiu comprar ${item.efeito.comprar_cartas} itens`, 'utility');
          }
          if (item.efeito.regenerar_pp) {
            const lendaAtiva = player.zonas[ZONAS_CAMPO.LENDA_ATIVA];
            if (lendaAtiva && lendaAtiva.habilidades) {
              Object.keys(lendaAtiva.habilidades).forEach(skillId => {
                if (skillId !== 'passive' && lendaAtiva.habilidades[skillId]) {
                  const skill = lendaAtiva.habilidades[skillId];
                  if (!lendaAtiva.pp) lendaAtiva.pp = {};
                  lendaAtiva.pp[skillId] = Math.min((lendaAtiva.pp[skillId] || 0) + item.efeito.regenerar_pp, skill.ppMax);
                }
              });
              this.adicionarAoLog(`${item.nome} regenerou ${item.efeito.regenerar_pp} PP`, 'utility');
            }
          }
          break;
      }
    }
  }

  aplicarEfeitosTroca(resultado) {
    // Efeitos que acontecem quando uma lenda entra/sai de campo
    this.adicionarAoLog('Efeitos de troca aplicados', 'info');
  }

  aplicarEfeitoPassiva(player, passiva) {
    // Implementar efeitos das passivas
    this.adicionarAoLog(`Efeito passivo: ${passiva.description}`, 'passive');
  }

  aplicarEfeitoContinuo(player, efeito, dados) {
    // Aplicar veneno, queimadura, etc
    this.adicionarAoLog(`Efeito contínuo: ${efeito}`, 'continuous');
  }

  aplicarBuff(target, habilidade) {
    // Aplicar buffs/debuffs
    this.adicionarAoLog(`Aplicando ${habilidade.kind}`, 'buff');
  }

  aplicarAtordoamento(target, turnos) {
    // Aplicar atordoamento
    this.adicionarAoLog(`Alvo atordoado por ${turnos} turnos`, 'stun');
  }

  ativarEfeitosPosAcao(resultado) {
    // Contra-ataques, explosões finais, etc
    this.adicionarAoLog('Verificando efeitos pós-ação', 'info');
  }

  aplicarEfeitosFimTurno() {
    // Regeneração, veneno, buffs que expiram
    this.adicionarAoLog('Aplicando efeitos de fim de turno', 'info');
  }

  checarDerrota() {
    this.players.forEach((player, index) => {
      const lendaAtiva = player.zonas[ZONAS_CAMPO.LENDA_ATIVA];
      if (lendaAtiva && lendaAtiva.vidaAtual <= 0) {
        this.adicionarAoLog(`💀 ${lendaAtiva.nome} foi derrotada!`, 'defeat');
        player.lendasDerrotadas++;
        
        // Descartar item ativo se houver
        if (player.zonas[ZONAS_CAMPO.ITEM_ATIVO]) {
          player.zonas[ZONAS_CAMPO.DESCARTE_ITENS].push(player.zonas[ZONAS_CAMPO.ITEM_ATIVO]);
          player.zonas[ZONAS_CAMPO.ITEM_ATIVO] = null;
        }
        
        // Verificar se há lendas no banco
        const bancoLendas = player.zonas[ZONAS_CAMPO.BANCO_LENDAS];
        if (bancoLendas.length > 0) {
          // Automaticamente trocar para próxima lenda
          const proximaLenda = bancoLendas.shift();
          proximaLenda.vidaAtual = proximaLenda.vida; // Resetar vida
          proximaLenda.ppAtual = {}; // Resetar PP
          proximaLenda.ultimateUsado = false; // Resetar ultimate
          player.zonas[ZONAS_CAMPO.LENDA_ATIVA] = proximaLenda;
          this.adicionarAoLog(`🔄 ${proximaLenda.nome} entra em campo automaticamente`, 'info');
        } else {
          // VITÓRIA POR ELIMINAÇÃO: Todas as 5 lendas foram derrotadas
          this.adicionarAoLog(`🏆 ${player.name} perdeu todas as 5 lendas!`, 'gameover');
          this.adicionarAoLog(`🎉 VITÓRIA POR ELIMINAÇÃO!`, 'victory');
          this.gameOver = true;
          this.vencedor = 1 - index;
          this.tipoVitoria = 'eliminacao';
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

  // =============================================================================
  // MÉTODOS DE UTILIDADE
  // =============================================================================

  obterEstadoDoJogo() {
    return {
      players: this.players,
      currentPlayer: this.indiceJogadorAtual,
      turn: this.turn,
      phase: this.fase,
      gameOver: this.gameOver,
      winner: this.vencedor,
      log: this.gameLog
    };
  }

  // =============================================================================
  // SISTEMA DE COOLDOWN
  // =============================================================================
  
  aplicarCooldown(playerIndex, habilidadeId, turnos) {
    if (!this.habilidadeCooldowns.has(playerIndex)) {
      this.habilidadeCooldowns.set(playerIndex, new Map());
    }
    this.habilidadeCooldowns.get(playerIndex).set(habilidadeId, turnos);
  }
  
  habilidadeEmCooldown(playerIndex, habilidadeId) {
    if (!this.habilidadeCooldowns.has(playerIndex)) return false;
    const cooldowns = this.habilidadeCooldowns.get(playerIndex);
    return cooldowns.has(habilidadeId) && cooldowns.get(habilidadeId) > 0;
  }
  
  obterCooldownRestante(playerIndex, habilidadeId) {
    if (!this.habilidadeCooldowns.has(playerIndex)) return 0;
    return this.habilidadeCooldowns.get(playerIndex).get(habilidadeId) || 0;
  }

  // =============================================================================
  // SISTEMA DE DESISTÊNCIA
  // =============================================================================
  
  declararDesistencia(playerIndex) {
    if (this.gameOver) {
      return { success: false, error: 'Jogo já terminou' };
    }
    
    const player = this.players[playerIndex];
    this.adicionarAoLog(`🏳️ ${player.name} declarou desistência!`, 'surrender');
    this.adicionarAoLog(`🎉 VITÓRIA POR DESISTÊNCIA!`, 'victory');
    
    this.gameOver = true;
    this.vencedor = 1 - playerIndex;
    this.tipoVitoria = 'desistencia';
    
    return { success: true, vencedor: this.vencedor };
  }

  adicionarAoLog(message, type = 'info') {
    this.gameLog.push({
      turn: this.turn,
      phase: this.fase,
      message,
      type,
      timestamp: Date.now()
    });
  }
}