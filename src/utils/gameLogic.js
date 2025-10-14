// src/utils/gameLogic.js
import {
  CONSTANTES_DO_JOGO,
  FASES_DO_JOGO,
  ZONAS_CAMPO,
  ACOES_TURNO,
} from "./constants";

const SKILL_KEYS = ["skill1", "skill2", "skill3", "skill4", "skill5"];
const DEFAULT_PP = 3;
const DEFAULT_BUFF_DURATION = 2;
const DEFAULT_SHIELD_DURATION = 2;
const MAX_HAND_SIZE = CONSTANTES_DO_JOGO.TAMANHO_MAXIMO_MAO_ITENS;
const MAX_ULTIMATE_ENERGY = 10;

const randomId = () => `fx_${Math.random().toString(36).slice(2)}_${Date.now()}`;

const normalizeText = (value, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  return value.toString();
};

const toLower = (value, fallback = "") => normalizeText(value, fallback).toLowerCase();

const safeClone = (value) => {
  if (value) {
    return JSON.parse(JSON.stringify(value));
  } else {
    return value;
  }
};

const normalizeChance = (chance) => {
  if (chance == null) return 1;
  const numeric = Number(chance);
  if (Number.isNaN(numeric)) return 1;
  if (numeric <= 1) return Math.max(0, Math.min(1, numeric));
  return Math.max(0, Math.min(1, numeric / 100));
};

const getCardType = (card = {}) => {
  const type = toLower(
    card.tipo || card.type || card.category || card.categoria || "lenda"
  );
  if (type.includes("item")) {
    return CONSTANTES_DO_JOGO.CARD_TYPES.ITEM;
  }
  return CONSTANTES_DO_JOGO.CARD_TYPES.LENDA;
};

const inferAbilityKind = (skillKey, rawKind = "") => {
  const kind = toLower(rawKind);
  if (kind) return kind;
  if (skillKey === "skill5") return "ultimate";
  if (skillKey === "skill1") return "damage";
  return "active";
};

const normalizeAbility = (raw = {}, skillKey, index = 0) => {
  if (!raw) return null;
  const nome = normalizeText(raw.name || raw.nome, `Habilidade ${index + 1}`);
  const descricao = normalizeText(raw.description || raw.descricao || "");
  const kind = inferAbilityKind(skillKey, raw.kind || raw.tipo);
  const ppMax = raw.ppMax ?? raw.pp_max ?? raw.pp ?? DEFAULT_PP;
  const cost = raw.cost ?? raw.custo ?? 1;
  const base = raw.base ?? raw.damage ?? raw.valor ?? 0;
  const heal = raw.heal ?? raw.cura ?? null;
  const buff = raw.buff || raw.bonus || null;
  const debuff = raw.debuff || null;
  const stun = raw.stun ?? raw.atordoar ?? null;
  const chance = normalizeChance(raw.chance ?? raw.accuracy ?? raw.probability);
  const duration = raw.turns ?? raw.duration ?? raw.duracao ?? 0;
  const elemento = raw.element || raw.elemento || null;

  return {
    id: raw.id || skillKey,
    key: skillKey,
    nome,
    descricao,
    kind,
    tipo:
      skillKey === "skill5"
        ? "ultimate"
        : index === 0
        ? "basica"
        : kind === "damage"
        ? "ativa"
        : kind,
    ultimate: kind === "ultimate" || skillKey === "skill5",
    ppMax: Math.max(0, ppMax),
    cost: Math.max(0, cost),
    base,
    heal,
    buff,
    debuff,
    stun,
    chance,
    duration,
    elemento,
  };
};

const normalizePassive = (raw = {}) => {
  if (!raw) return null;
  return {
    id: raw.id || "passive",
    nome: normalizeText(raw.name || raw.nome, "Passiva"),
    descricao: normalizeText(raw.description || raw.descricao || ""),
    kind: toLower(raw.kind || raw.tipo || "passive"),
    heal: raw.heal ?? raw.cura ?? null,
    damage: raw.damage ?? raw.dano ?? null,
    buff: raw.buff || raw.bonus || null,
    debuff: raw.debuff || null,
    duration: raw.turns ?? raw.duration ?? raw.duracao ?? DEFAULT_BUFF_DURATION,
    chance: normalizeChance(raw.chance ?? raw.probability),
  };
};

const ensureLendaState = (card, index = 0) => {
  if (!card) return null;
  const clone = safeClone(card) || {};
  clone.id = clone.id || `lenda_${index}_${Math.random().toString(36).slice(2, 8)}`;
  clone.nome = normalizeText(clone.nome || clone.name, `Lenda ${index + 1}`);
  clone.elemento = normalizeText(clone.elemento || clone.element || "Neutro");
  clone.raridade = normalizeText(clone.raridade || clone.rarity || "Comum");
  clone.ataqueBase = Number(clone.ataque ?? clone.attack ?? clone.ataqueBase) || 0;
  clone.defesaBase = Number(clone.defesa ?? clone.defense ?? clone.defesaBase) || 0;
  const vidaTotal = Number(clone.vida ?? clone.life ?? clone.health ?? 20) || 20;
  clone.vidaMaxima = vidaTotal;
  clone.vidaAtual = Number(clone.vidaAtual ?? vidaTotal);
  clone.energia = Number(clone.energia ?? 0);
  clone.ataqueBonus = Number(clone.ataqueBonus ?? 0);
  clone.defesaBonus = Number(clone.defesaBonus ?? 0);
  clone.status = clone.status || { atordoado: 0 };
  if (Array.isArray(clone.efeitos)) {
    clone.efeitos = clone.efeitos;
  } else {
    clone.efeitos = [];
  }

  const habilidadesOriginais = clone.habilidades || clone.abilities || {};
  const habilidadesNormalizadas = {};
  SKILL_KEYS.forEach((key, idx) => {
    const habilidade = normalizeAbility(habilidadesOriginais[key], key, idx);
    if (habilidade) {
      habilidadesNormalizadas[key] = habilidade;
    }
  });
  if (habilidadesOriginais.passive) {
    habilidadesNormalizadas.passive = normalizePassive(
      habilidadesOriginais.passive
    );
  }
  clone.habilidades = habilidadesNormalizadas;
  clone.ppAtual = Object.fromEntries(
    SKILL_KEYS.map((key) => [key, clone.habilidades[key]?.ppMax ?? DEFAULT_PP])
  );
  clone.ultimateUsado = Boolean(clone.ultimateUsado);
  clone.equipamentoAtivo = clone.equipamentoAtivo || null;
  return clone;
};

const ensureItemState = (card, index = 0) => {
  if (!card) return null;
  const clone = safeClone(card) || {};
  clone.id = clone.id || `item_${index}_${Math.random().toString(36).slice(2, 8)}`;
  clone.nome = normalizeText(clone.nome || clone.name, `Item ${index + 1}`);
  clone.tipo = CONSTANTES_DO_JOGO.CARD_TYPES.ITEM;
  clone.categoria = toLower(
    clone.categoria || clone.category || clone.tipo_item || clone.type
  );
  clone.efeito = clone.efeito || clone.effect || {};
  clone.turnos = Number(clone.turnos ?? clone.duration ?? clone.efeito?.turnos ?? 0);
  clone.valor = Number(clone.valor ?? clone.value ?? clone.efeito?.valor ?? 0);
  return clone;
};

const embaralharBaralho = (deck = []) => {
  const embaralhado = [...deck];
  for (let i = embaralhado.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [embaralhado[i], embaralhado[j]] = [embaralhado[j], embaralhado[i]];
  }
  return embaralhado;
};

const contarMiticas = (lendas = []) =>
  lendas.filter((lenda) =>
    toLower(lenda.raridade).includes("mít") || toLower(lenda.raridade).includes("myth")
  ).length;

const aplicarMudancaStatus = (lenda, stat, delta) => {
  if (!lenda) return;
  lenda[stat] = (lenda[stat] || 0) + delta;
};

export class MotorDeJogo {
  constructor(players = [], options = {}) {
    this.options = options;
    this.rawPlayers = safeClone(players);
    this.resetState();
  }

  resetState() {
    this.players = [];
    this.indiceJogadorAtual = 0;
    this.turn = 1;
    this.fase = FASES_DO_JOGO.INICIO;
    this.gameLog = [];
    this.gameOver = false;
    this.vencedor = null;
    this.tipoVitoria = null;
  }

  prepararJogador(rawPlayer = {}, index = 0) {
    let deck;
    if (Array.isArray(rawPlayer.deck)) {
      deck = rawPlayer.deck;
    } else {
      deck = [];
    }
    const lendasOriginais = rawPlayer.lendas ||
      deck.filter((card) => getCardType(card) === CONSTANTES_DO_JOGO.CARD_TYPES.LENDA);
    const itensOriginais = rawPlayer.itens ||
      deck.filter((card) => getCardType(card) === CONSTANTES_DO_JOGO.CARD_TYPES.ITEM);

    if (!lendasOriginais || lendasOriginais.length === 0) {
      throw new Error(
        `Jogador ${rawPlayer.nome || index + 1} precisa ter pelo menos uma lenda no deck.`
      );
    }

    const lendas = lendasOriginais
      .slice(0, CONSTANTES_DO_JOGO.TAMANHO_DECK_LENDAS)
      .map((card, idx) => ensureLendaState(card, idx));

    const miticas = contarMiticas(lendas);
    if (miticas > CONSTANTES_DO_JOGO.MAXIMO_LENDAS_MITICAS) {
      throw new Error(
        `Deck do jogador ${rawPlayer.nome || index + 1} excede o limite de ${CONSTANTES_DO_JOGO.MAXIMO_LENDAS_MITICAS} lendas míticas.`
      );
    }

    const itens = itensOriginais.map((card, idx) => ensureItemState(card, idx));

    const playerState = {
      id: rawPlayer.id || `player_${index + 1}`,
      nome: normalizeText(rawPlayer.nome || rawPlayer.name, `Jogador ${index + 1}`),
      avatar: rawPlayer.avatar || rawPlayer.avatarUrl || "/images/avatars/player.jpg",
      ranking: rawPlayer.ranking || "Bronze II",
      tipo: rawPlayer.tipo || rawPlayer.type || "humano",
      energia: Number(rawPlayer.energia ?? 0),
      deckOriginal: safeClone(deck),
      deck: {
        lendas,
        itens,
      },
      zonas: {
        [ZONAS_CAMPO.LENDA_ATIVA]: lendas[0],
        [ZONAS_CAMPO.BANCO_LENDAS]: lendas.slice(1, CONSTANTES_DO_JOGO.BANCO_LENDAS + 1),
        [ZONAS_CAMPO.MAO_ITENS]: [],
        [ZONAS_CAMPO.ITEM_ATIVO]: null,
        [ZONAS_CAMPO.PILHA_ITENS]: embaralharBaralho(itens.slice()),
        [ZONAS_CAMPO.DESCARTE_ITENS]: [],
      },
      efeitosAtivos: [],
      cooldowns: {},
      lendasDerrotadas: 0,
      stats: {
        danoCausado: 0,
        danoRecebido: 0,
        curasRealizadas: 0,
        itensUsados: 0,
        habilidadesUsadas: 0,
      },
    };

    return playerState;
  }

  iniciarJogo(playersOverride) {
    if (playersOverride) {
      this.rawPlayers = safeClone(playersOverride);
    }

    if (!Array.isArray(this.rawPlayers) || this.rawPlayers.length < 2) {
      throw new Error("São necessários dois jogadores para iniciar a partida.");
    }

    this.resetState();
    this.players = this.rawPlayers.map((player, index) =>
      this.prepararJogador(player, index)
    );

    this.indiceJogadorAtual = this.options.startingPlayer ?? 0;
    this.turn = 1;
    this.fase = FASES_DO_JOGO.INICIO;

    this.players.forEach((player) => {
      this.comprarItens(player, 2);
    });

    this.adicionarAoLog("Partida iniciada! Fase 1 – Início.", "info");
    this.executarFaseInicio();
    return this.obterEstadoDoJogo();
  }

  executarFaseInicio() {
    this.fase = FASES_DO_JOGO.INICIO;
    const jogadorAtual = this.players[this.indiceJogadorAtual];
    if (!jogadorAtual) return;

    this.adicionarAoLog(
      `--- Turno ${this.turn} • ${jogadorAtual.nome} ---`,
      "phase"
    );
    this.adicionarAoLog("FASE 1: INÍCIO", "phase");

    this.players.forEach((_, index) => {
      this.ativarPassivas(index);
      this.resolverEfeitosContinuos(index);
      this.checarCondicoesUltimate(index);
      this.reduzirCooldowns(index);
    });

    if (this.gameOver) {
      return;
    }

    this.proximaFase();
  }

  executarFaseAcao() {
    if (this.gameOver) return;
    this.fase = FASES_DO_JOGO.ACAO;
    const jogadorAtual = this.players[this.indiceJogadorAtual];
    if (!jogadorAtual) return;

    this.adicionarAoLog("FASE 2: AÇÃO", "phase");
    const lendaAtiva = jogadorAtual.zonas[ZONAS_CAMPO.LENDA_ATIVA];
    if (lendaAtiva?.status?.atordoado > 0) {
      this.adicionarAoLog(
        `${lendaAtiva.nome} está atordoado e perde a ação deste turno.`,
        "stun"
      );
      lendaAtiva.status.atordoado -= 1;
      this.executarFaseResolucao({
        tipo: ACOES_TURNO.ACAO_ESPECIAL,
        skip: true,
        playerIndex: this.indiceJogadorAtual,
      });
    } else {
      this.adicionarAoLog(
        `${jogadorAtual.nome} pode usar habilidade, trocar lenda ou usar item.`,
        "info"
      );
    }
  }

  executarFaseResolucao(resultado) {
    if (this.gameOver) return;
    this.fase = FASES_DO_JOGO.RESOLUCAO;
    this.adicionarAoLog("FASE 3: RESOLUÇÃO", "phase");

    if (resultado && resultado.skip) {
      this.adicionarAoLog("Nenhuma ação foi executada neste turno.", "info");
    } else if (resultado) {
      this.resolverResultado(resultado);
    }

    this.checarDerrota();

    if (this.gameOver) {
      return;
    }

    this.ativarEfeitosPosAcao(resultado);
    this.proximaFase();
  }

  executarFaseFimTurno() {
    if (this.gameOver) return;
    this.fase = FASES_DO_JOGO.FIM_TURNO;
    this.adicionarAoLog("FASE 4: FIM DO TURNO", "phase");

    this.players.forEach((player) => {
      if (player.zonas[ZONAS_CAMPO.MAO_ITENS].length < MAX_HAND_SIZE) {
        const comprados = this.comprarItens(player, 1);
        if (comprados > 0) {
          this.adicionarAoLog(
            `${player.nome} comprou ${comprados} item(s).`,
            "info"
          );
        }
      }
    });

    this.aplicarEfeitosFimTurno();
    this.atualizarEnergiaJogadores();
    this.passarTurno();
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
        break;
    }
  }

  passarTurno() {
    if (this.gameOver) return;
    this.indiceJogadorAtual = (this.indiceJogadorAtual + 1) % this.players.length;
    if (this.indiceJogadorAtual === 0) {
      this.turn += 1;
    }
    this.executarFaseInicio();
  }

  usarHabilidade(playerIndex, habilidadeId, target = null) {
    if (this.gameOver) {
      return { success: false, error: "A partida já terminou." };
    }

    if (
      this.fase !== FASES_DO_JOGO.ACAO ||
      playerIndex !== this.indiceJogadorAtual
    ) {
      return { success: false, error: "Não é a vez deste jogador." };
    }

    const player = this.players[playerIndex];
    const lendaAtiva = player?.zonas?.[ZONAS_CAMPO.LENDA_ATIVA];
    if (!lendaAtiva) {
      return { success: false, error: "Nenhuma lenda ativa disponível." };
    }

    const habilidade = lendaAtiva.habilidades?.[habilidadeId];
    if (!habilidade) {
      return { success: false, error: "Habilidade inválida." };
    }

    if (habilidade.ultimate) {
      const ultimateDisponivel =
        this.turn >= 5 || player.energia >= MAX_ULTIMATE_ENERGY;
      if (lendaAtiva.ultimateUsado) {
        return { success: false, error: "Ultimate já utilizado." };
      }
      if (!ultimateDisponivel) {
        return {
          success: false,
          error: "Ultimate indisponível. Alcançe turno 5 ou 10 de energia.",
        };
      }
    }

    if (this.habilidadeEmCooldown(player, habilidadeId)) {
      const restante = player.cooldowns[habilidadeId];
      return {
        success: false,
        error: `Habilidade em cooldown por ${restante} turno(s).`,
      };
    }

    const ppAtual = lendaAtiva.ppAtual?.[habilidadeId] ?? habilidade.ppMax;
    if (ppAtual < habilidade.cost) {
      return {
        success: false,
        error: `PP insuficiente (${ppAtual}/${habilidade.cost}).`,
      };
    }

    const alvo =
      target ||
      this.players[(playerIndex + 1) % this.players.length].zonas[
        ZONAS_CAMPO.LENDA_ATIVA
      ];

    if (!this.verificarChance(habilidade.chance)) {
      lendaAtiva.ppAtual[habilidadeId] = Math.max(
        0,
        ppAtual - habilidade.cost
      );
      if (habilidadeId !== "skill1" && !habilidade.ultimate) {
        player.cooldowns[habilidadeId] = CONSTANTES_DO_JOGO.COOLDOWN_HABILIDADE;
      }
      this.adicionarAoLog(
        `${player.nome} tentou usar ${habilidade.nome}, mas falhou!`,
        "miss"
      );
      this.executarFaseResolucao({
        tipo: ACOES_TURNO.USAR_HABILIDADE,
        playerIndex,
        habilidade,
        lendaAtiva,
        alvo,
        sucesso: false,
      });
      return { success: true, falha: true };
    }

    lendaAtiva.ppAtual[habilidadeId] = Math.max(0, ppAtual - habilidade.cost);

    if (habilidade.ultimate) {
      lendaAtiva.ultimateUsado = true;
      player.energia = Math.max(0, player.energia - MAX_ULTIMATE_ENERGY);
      this.adicionarAoLog(
        `${player.nome} desencadeou o ultimate ${habilidade.nome}!`,
        "ultimate"
      );
    } else if (habilidadeId !== "skill1") {
      player.cooldowns[habilidadeId] = CONSTANTES_DO_JOGO.COOLDOWN_HABILIDADE;
    }

    player.stats.habilidadesUsadas += 1;

    const resultado = {
      tipo: ACOES_TURNO.USAR_HABILIDADE,
      playerIndex,
      habilidade,
      habilidadeId,
      lendaAtiva,
      alvo,
      sucesso: true,
    };

    this.executarFaseResolucao(resultado);
    return { success: true, resultado };
  }

  trocarLenda(playerIndex, bancoIndex) {
    if (this.gameOver) {
      return { success: false, error: "A partida já terminou." };
    }

    if (
      this.fase !== FASES_DO_JOGO.ACAO ||
      playerIndex !== this.indiceJogadorAtual
    ) {
      return { success: false, error: "Não é a vez deste jogador." };
    }

    const player = this.players[playerIndex];
    const banco = player?.zonas?.[ZONAS_CAMPO.BANCO_LENDAS];
    if (!Array.isArray(banco) || bancoIndex < 0 || bancoIndex >= banco.length) {
      return { success: false, error: "Lenda do banco inválida." };
    }

    const lendaAtual = player.zonas[ZONAS_CAMPO.LENDA_ATIVA];
    const novaLenda = banco[bancoIndex];
    if (!novaLenda) {
      return { success: false, error: "Slot de lenda vazio." };
    }

    banco[bancoIndex] = lendaAtual;
    player.zonas[ZONAS_CAMPO.LENDA_ATIVA] = novaLenda;
    this.adicionarAoLog(
      `${player.nome} colocou ${novaLenda.nome} em campo.`,
      "action"
    );

    this.executarFaseResolucao({
      tipo: ACOES_TURNO.TROCAR_LENDA,
      playerIndex,
      lendaAnterior: lendaAtual,
      novaLenda,
    });

    return { success: true };
  }

  usarItem(playerIndex, itemIndex, target = null) {
    if (this.gameOver) {
      return { success: false, error: "A partida já terminou." };
    }

    if (
      this.fase !== FASES_DO_JOGO.ACAO ||
      playerIndex !== this.indiceJogadorAtual
    ) {
      return { success: false, error: "Não é a vez deste jogador." };
    }

    const player = this.players[playerIndex];
    const mao = player?.zonas?.[ZONAS_CAMPO.MAO_ITENS];
    if (!Array.isArray(mao) || itemIndex < 0 || itemIndex >= mao.length) {
      return { success: false, error: "Item inválido." };
    }

    const item = mao.splice(itemIndex, 1)[0];
    if (!item) {
      return { success: false, error: "Slot vazio." };
    }

    const alvo = target || player.zonas[ZONAS_CAMPO.LENDA_ATIVA];

    if (item.categoria === "equipamento") {
      const anterior = player.zonas[ZONAS_CAMPO.ITEM_ATIVO];
      if (anterior) {
        this.removerEquipamento(
          player.zonas[ZONAS_CAMPO.LENDA_ATIVA]
        );
        player.zonas[ZONAS_CAMPO.DESCARTE_ITENS].push(anterior);
        this.adicionarAoLog(`${player.nome} desequipou ${anterior.nome}.`, "info");
      }
      player.zonas[ZONAS_CAMPO.ITEM_ATIVO] = item;
      this.aplicarEfeitoEquipamento(playerIndex, item);
      this.adicionarAoLog(`${player.nome} equipou ${item.nome}.`, "action");
    } else {
      player.zonas[ZONAS_CAMPO.DESCARTE_ITENS].push(item);
      this.adicionarAoLog(`${player.nome} usou ${item.nome}.`, "action");
    }

    player.stats.itensUsados += 1;

    this.executarFaseResolucao({
      tipo: ACOES_TURNO.USAR_ITEM,
      playerIndex,
      item,
      alvo,
    });

    return { success: true };
  }

  declararDesistencia(playerIndex) {
    if (this.gameOver) {
      return { success: false, error: "A partida já terminou." };
    }

    const player = this.players[playerIndex];
    this.adicionarAoLog(`🏳️ ${player.nome} desistiu da partida.`, "surrender");
    this.gameOver = true;
    this.vencedor = (playerIndex + 1) % this.players.length;
    this.tipoVitoria = "desistencia";
    this.adicionarAoLog(
      `🎉 ${this.players[this.vencedor].nome} venceu por desistência!`,
      "victory"
    );
    return { success: true, vencedor: this.vencedor };
  }

  resolverResultado(resultado) {
    switch (resultado?.tipo) {
      case ACOES_TURNO.USAR_HABILIDADE:
        if (resultado.sucesso) {
          this.aplicarEfeitoHabilidade(resultado);
        }
        break;
      case ACOES_TURNO.USAR_ITEM:
        this.aplicarEfeitoItem(resultado);
        break;
      case ACOES_TURNO.TROCAR_LENDA:
        this.aplicarEfeitosTroca(resultado);
        break;
      default:
        break;
    }
  }

  aplicarEfeitoHabilidade({
    playerIndex,
    habilidade,
    lendaAtiva,
    alvo,
  }) {
    const player = this.players[playerIndex];
    const oponente = this.players[(playerIndex + 1) % this.players.length];
    const alvoPrincipal = alvo || oponente.zonas[ZONAS_CAMPO.LENDA_ATIVA];

    this.adicionarAoLog(
      `${player.nome} usou ${habilidade.nome}.`,
      "ability"
    );

    if ((habilidade.kind === "damage" || habilidade.base) && alvoPrincipal) {
      const dano = this.calcularDanoFinal(lendaAtiva, habilidade, alvoPrincipal);
      const danoCausado = this.aplicarDano(alvoPrincipal, dano, {
        fonte: habilidade.nome,
        jogador: player.nome,
      });
      player.stats.danoCausado += danoCausado;
      oponente.stats.danoRecebido += danoCausado;
    }

    if (habilidade.heal) {
      const alvoCura = alvo || lendaAtiva;
      const curado = this.curarLenda(alvoCura, habilidade.heal, habilidade.nome);
      player.stats.curasRealizadas += curado;
    }

    if (habilidade.buff) {
      let alvoBuff;
      if (habilidade.buff?.alvo === "self") {
        alvoBuff = lendaAtiva;
      } else {
        alvoBuff = alvo || lendaAtiva;
      }
      this.aplicarBuff(playerIndex, alvoBuff, habilidade.buff, habilidade.duration, habilidade.nome);
    }

    if (habilidade.debuff && alvoPrincipal) {
      this.aplicarDebuff(
        (playerIndex + 1) % this.players.length,
        alvoPrincipal,
        habilidade.debuff,
        habilidade.duration,
        habilidade.nome
      );
    }

    if (habilidade.stun && alvoPrincipal) {
      alvoPrincipal.status = alvoPrincipal.status || {};
      alvoPrincipal.status.atordoado = Math.max(
        alvoPrincipal.status.atordoado || 0,
        habilidade.stun
      );
      this.adicionarAoLog(
        `${alvoPrincipal.nome} ficará atordoado por ${habilidade.stun} turno(s).`,
        "stun"
      );
    }
  }

  aplicarEfeitoItem({ playerIndex, item, alvo }) {
    const player = this.players[playerIndex];
    const oponente = this.players[(playerIndex + 1) % this.players.length];
    const alvoPrincipal = alvo || player.zonas[ZONAS_CAMPO.LENDA_ATIVA];
    const categoria = item.categoria || CONSTANTES_DO_JOGO.ITEM_TYPES.UTILITARIO;

    switch (categoria) {
      case CONSTANTES_DO_JOGO.ITEM_TYPES.OFENSIVO: {
        const lendaOponente = oponente.zonas[ZONAS_CAMPO.LENDA_ATIVA];
        if (lendaOponente) {
          const dano = item.efeito?.dano ?? item.valor ?? 2;
          const danoCausado = this.aplicarDano(lendaOponente, dano, {
            fonte: item.nome,
            jogador: player.nome,
            tipo: "item",
          });
          player.stats.danoCausado += danoCausado;
          oponente.stats.danoRecebido += danoCausado;
        }
        break;
      }
      case CONSTANTES_DO_JOGO.ITEM_TYPES.DEFENSIVO: {
        if (item.efeito?.cura) {
          const curado = this.curarLenda(
            alvoPrincipal,
            item.efeito.cura,
            item.nome
          );
          player.stats.curasRealizadas += curado;
        }
        if (item.efeito?.escudo) {
          this.aplicarEscudo(
            playerIndex,
            alvoPrincipal,
            item.efeito.escudo,
            item.efeito.turnos || DEFAULT_SHIELD_DURATION
          );
        }
        break;
      }
      default: {
        if (item.efeito?.comprar_cartas) {
          const quantidade = this.comprarItens(
            player,
            item.efeito.comprar_cartas
          );
          this.adicionarAoLog(
            `${player.nome} comprou ${quantidade} item(s) extras com ${item.nome}.`,
            "utility"
          );
        }
        if (item.efeito?.regenerar_pp) {
          this.regenerarPP(alvoPrincipal, item.efeito.regenerar_pp, item.nome);
        }
        if (item.efeito?.energizar) {
          player.energia = Math.min(
            MAX_ULTIMATE_ENERGY,
            player.energia + item.efeito.energizar
          );
          this.adicionarAoLog(
            `${player.nome} recebeu ${item.efeito.energizar} energia.`,
            "energy"
          );
        }
        break;
      }
    }
  }

  aplicarEfeitosTroca({ novaLenda }) {
    if (!novaLenda) return;
    if (novaLenda.status?.atordoado) {
      novaLenda.status.atordoado = Math.max(0, novaLenda.status.atordoado - 1);
    }
    this.adicionarAoLog(`${novaLenda.nome} se prepara para o combate.`, "info");
  }

  aplicarDano(lenda, valor, contexto = {}) {
    if (!lenda) return 0;
    const danoBase = Math.max(0, Math.floor(valor));
    const absorvido = Math.min(danoBase, lenda.vidaAtual);
    lenda.vidaAtual -= absorvido;

    this.adicionarAoLog(
      `${contexto.jogador || ""}causou ${absorvido} de dano em ${lenda.nome}.`,
      "damage"
    );
    return absorvido;
  }

  curarLenda(lenda, valor, fonte = "Cura") {
    if (!lenda || !valor) return 0;
    const cura = Math.max(0, Math.floor(valor));
    const vidaAntes = lenda.vidaAtual;
    lenda.vidaAtual = Math.min(lenda.vidaMaxima, lenda.vidaAtual + cura);
    const curado = lenda.vidaAtual - vidaAntes;
    if (curado > 0) {
      this.adicionarAoLog(
        `${fonte} restaurou ${curado} de vida em ${lenda.nome}.`,
        "heal"
      );
    }
    return curado;
  }

  aplicarBuff(playerIndex, lenda, buff = {}, duration = DEFAULT_BUFF_DURATION, fonte = "Buff") {
    if (!lenda || !buff) return;
    const statChanges = {};

    if (buff.ataque) {
      aplicarMudancaStatus(lenda, "ataqueBonus", buff.ataque);
      statChanges.ataqueBonus = (statChanges.ataqueBonus || 0) + buff.ataque;
    }
    if (buff.defesa) {
      aplicarMudancaStatus(lenda, "defesaBonus", buff.defesa);
      statChanges.defesaBonus = (statChanges.defesaBonus || 0) + buff.defesa;
    }
    if (buff.vida) {
      this.curarLenda(lenda, buff.vida, fonte);
    }
    if (buff.pp) {
      this.regenerarPP(lenda, buff.pp, fonte);
    }
    if (buff.escudo) {
      this.aplicarEscudo(playerIndex, lenda, buff.escudo, duration);
    }

    if (Object.keys(statChanges).length > 0) {
      this.registrarEfeitoTemporario(playerIndex, lenda, {
        tipo: "buff",
        statChanges,
        duration: duration || DEFAULT_BUFF_DURATION,
        metadata: { fonte },
      });
    }

    this.adicionarAoLog(`${fonte} fortaleceu ${lenda.nome}.`, "buff");
  }

  aplicarDebuff(playerIndex, lenda, debuff = {}, duration = DEFAULT_BUFF_DURATION, fonte = "Debuff") {
    if (!lenda || !debuff) return;
    const statChanges = {};

    if (debuff.ataque) {
      aplicarMudancaStatus(lenda, "ataqueBonus", -Math.abs(debuff.ataque));
      statChanges.ataqueBonus = (statChanges.ataqueBonus || 0) - Math.abs(debuff.ataque);
    }
    if (debuff.defesa) {
      aplicarMudancaStatus(lenda, "defesaBonus", -Math.abs(debuff.defesa));
      statChanges.defesaBonus = (statChanges.defesaBonus || 0) - Math.abs(debuff.defesa);
    }
    if (debuff.vida) {
      this.aplicarDano(lenda, Math.abs(debuff.vida), { fonte });
    }

    if (Object.keys(statChanges).length > 0) {
      this.registrarEfeitoTemporario(playerIndex, lenda, {
        tipo: "debuff",
        statChanges,
        duration: duration || DEFAULT_BUFF_DURATION,
        metadata: { fonte },
        targetOverride: true,
      });
    }

    this.adicionarAoLog(`${fonte} enfraqueceu ${lenda.nome}.`, "debuff");
  }

  aplicarEscudo(playerIndex, lenda, valor, duration = DEFAULT_SHIELD_DURATION) {
    if (!lenda || !valor) return;
    if (Array.isArray(lenda.efeitos)) {
      lenda.efeitos = lenda.efeitos;
    } else {
      lenda.efeitos = [];
    }
    lenda.efeitos.push({
      id: randomId(),
      tipo: "escudo",
      valor: Math.max(0, valor),
      remaining: duration,
      trigger: "fim-turno",
      metadata: { playerIndex },
    });
    this.adicionarAoLog(
      `${lenda.nome} recebeu um escudo de ${valor}.`,
      "shield"
    );
  }

  removerEquipamento(lenda) {
    if (!lenda?.equipamentoAtivo) return;
    const bonuses = lenda.equipamentoAtivo.bonuses || {};
    Object.entries(bonuses).forEach(([stat, delta]) => {
      aplicarMudancaStatus(lenda, stat, -delta);
    });
    lenda.equipamentoAtivo = null;
  }

  aplicarEfeitoEquipamento(playerIndex, item) {
    const player = this.players[playerIndex];
    const lenda = player?.zonas?.[ZONAS_CAMPO.LENDA_ATIVA];
    if (!lenda) return;

    this.removerEquipamento(lenda);

    const bonuses = {};
    const efeito = item.efeito || {};

    if (efeito.ataque) {
      aplicarMudancaStatus(lenda, "ataqueBonus", efeito.ataque);
      bonuses.ataqueBonus = (bonuses.ataqueBonus || 0) + efeito.ataque;
    }
    if (efeito.defesa) {
      aplicarMudancaStatus(lenda, "defesaBonus", efeito.defesa);
      bonuses.defesaBonus = (bonuses.defesaBonus || 0) + efeito.defesa;
    }
    if (efeito.vida) {
      this.curarLenda(lenda, efeito.vida, item.nome);
    }
    if (efeito.pp) {
      this.regenerarPP(lenda, efeito.pp, item.nome);
    }
    if (efeito.escudo) {
      this.aplicarEscudo(
        playerIndex,
        lenda,
        efeito.escudo,
        efeito.turnos || DEFAULT_SHIELD_DURATION
      );
    }

    lenda.equipamentoAtivo = {
      itemId: item.id,
      bonuses,
    };
  }

  registrarEfeitoTemporario(playerIndex, lenda, {
    tipo = "buff",
    statChanges = {},
    duration = DEFAULT_BUFF_DURATION,
    metadata = {},
    trigger = "inicio",
  }) {
    const player = this.players[playerIndex];
    if (!player || !lenda) return;

    player.efeitosAtivos.push({
      id: randomId(),
      tipo,
      targetPlayer: playerIndex,
      targetLendaId: lenda.id,
      statChanges,
      remaining: Math.max(1, duration),
      trigger,
      metadata,
    });
  }

  processarEfeitoAtivo(efeito, trigger) {
    const player = this.players[efeito.targetPlayer];
    if (!player) return false;

    const lenda = this.obterLendaPorId(player, efeito.targetLendaId);
    if (!lenda) return false;

    if (efeito.trigger && efeito.trigger !== trigger) {
      return true;
    }

    if (efeito.tipo === "dot") {
      this.aplicarDano(lenda, efeito.valor || efeito.value || 0, {
        fonte: efeito.metadata?.fonte || "Dano contínuo",
      });
    }

    if (efeito.tipo === "hot") {
      this.curarLenda(lenda, efeito.valor || efeito.value || 0, efeito.metadata?.fonte || "Regeneração");
    }

    efeito.remaining -= 1;

    if (efeito.remaining <= 0) {
      Object.entries(efeito.statChanges || {}).forEach(([stat, delta]) => {
        aplicarMudancaStatus(lenda, stat, -delta);
      });
      this.adicionarAoLog(
        `Efeito ${efeito.metadata?.fonte || efeito.tipo} expirou em ${lenda.nome}.`,
        "info"
      );
      return false;
    }

    return true;
  }

  processarEfeitosDeLenda(lenda, trigger) {
    if (!lenda || !Array.isArray(lenda.efeitos)) return;
    const restantes = [];
    lenda.efeitos.forEach((efeito) => {
      if (efeito.trigger && efeito.trigger !== trigger) {
        restantes.push(efeito);
        return;
      }
      if (efeito.tipo === "escudo") {
        efeito.remaining -= 1;
        if (efeito.remaining > 0 && efeito.valor > 0) {
          restantes.push(efeito);
        } else {
          this.adicionarAoLog(`Escudo de ${lenda.nome} dissipou-se.`, "info");
        }
      } else {
        restantes.push(efeito);
      }
    });
    lenda.efeitos = restantes;
  }

  resolverEfeitosContinuos(playerIndex) {
    const player = this.players[playerIndex];
    if (!player) return;

    const efeitosRestantes = [];
    player.efeitosAtivos.forEach((efeito) => {
      if (this.processarEfeitoAtivo(efeito, "inicio")) {
        efeitosRestantes.push(efeito);
      }
    });
    player.efeitosAtivos = efeitosRestantes;

    this.processarEfeitosDeLenda(
      player.zonas[ZONAS_CAMPO.LENDA_ATIVA],
      "inicio"
    );
  }

  aplicarEfeitosFimTurno() {
    this.players.forEach((player) => {
      const efeitosRestantes = [];
      player.efeitosAtivos.forEach((efeito) => {
        if (this.processarEfeitoAtivo(efeito, "fim-turno")) {
          efeitosRestantes.push(efeito);
        }
      });
      player.efeitosAtivos = efeitosRestantes;
      this.processarEfeitosDeLenda(
        player.zonas[ZONAS_CAMPO.LENDA_ATIVA],
        "fim-turno"
      );
    });
  }

  ativarPassivas(playerIndex) {
    const player = this.players[playerIndex];
    if (!player) return;
    const lenda = player.zonas[ZONAS_CAMPO.LENDA_ATIVA];
    const passiva = lenda?.habilidades?.passive;
    if (!passiva) return;

    if (!this.verificarChance(passiva.chance)) {
      this.adicionarAoLog(
        `${lenda.nome} tentou ativar ${passiva.nome}, mas não surtou efeito.`,
        "miss"
      );
      return;
    }

    if (passiva.heal) {
      this.curarLenda(lenda, passiva.heal, passiva.nome);
    }

    if (passiva.damage) {
      const oponente = this.players[(playerIndex + 1) % this.players.length];
      const alvo = oponente.zonas[ZONAS_CAMPO.LENDA_ATIVA];
      if (alvo) {
        this.aplicarDano(alvo, passiva.damage, {
          fonte: passiva.nome,
          jogador: player.nome,
        });
      }
    }

    if (passiva.buff) {
      this.aplicarBuff(playerIndex, lenda, passiva.buff, passiva.duration, passiva.nome);
    }

    if (passiva.debuff) {
      const oponente = this.players[(playerIndex + 1) % this.players.length];
      const alvo = oponente.zonas[ZONAS_CAMPO.LENDA_ATIVA];
      if (alvo) {
        this.aplicarDebuff(
          (playerIndex + 1) % this.players.length,
          alvo,
          passiva.debuff,
          passiva.duration,
          passiva.nome
        );
      }
    }

    this.adicionarAoLog(
      `${lenda.nome} ativou a passiva ${passiva.nome}.`,
      "passive"
    );
  }

  checarCondicoesUltimate(playerIndex) {
    const player = this.players[playerIndex];
    if (!player) return;
    const lenda = player.zonas[ZONAS_CAMPO.LENDA_ATIVA];
    const ultimate = lenda?.habilidades?.skill5;
    if (!ultimate || lenda.ultimateUsado) return;

    if (this.turn >= 5 || player.energia >= MAX_ULTIMATE_ENERGY) {
      this.adicionarAoLog(
        `Ultimate ${ultimate.nome} disponível para ${lenda.nome}.`,
        "ultimate"
      );
    }
  }

  reduzirCooldowns(playerIndex) {
    const player = this.players[playerIndex];
    if (!player) return;
    Object.entries(player.cooldowns || {}).forEach(([habilidadeId, valor]) => {
      if (valor > 0) {
        player.cooldowns[habilidadeId] = valor - 1;
        if (valor - 1 === 0) {
          this.adicionarAoLog(
            `${player.nome} pode usar novamente ${habilidadeId}.`,
            "info"
          );
        }
      }
      if (player.cooldowns[habilidadeId] <= 0) {
        delete player.cooldowns[habilidadeId];
      }
    });
  }

  habilidadeEmCooldown(player, habilidadeId) {
    if (!player || !player.cooldowns) return false;
    return Boolean(player.cooldowns[habilidadeId]);
  }

  verificarChance(chance) {
    if (typeof this.options.chanceResolver === "function") {
      return !!this.options.chanceResolver(chance);
    }
    if (typeof this.options.random === "function") {
      return this.options.random() <= (chance ?? 1);
    }
    return Math.random() <= (chance ?? 1);
  }

  comprarItens(player, quantidade = 1) {
    if (!player) return 0;
    let comprados = 0;
    const mao = player.zonas[ZONAS_CAMPO.MAO_ITENS];
    const pilha = player.zonas[ZONAS_CAMPO.PILHA_ITENS];
    const descarte = player.zonas[ZONAS_CAMPO.DESCARTE_ITENS];

    for (let i = 0; i < quantidade; i += 1) {
      if (mao.length >= MAX_HAND_SIZE) break;
      if (pilha.length === 0 && descarte.length > 0) {
        pilha.push(...embaralharBaralho(descarte.splice(0)));
      }
      if (pilha.length === 0) break;

      mao.push(pilha.shift());
      comprados += 1;
    }

    return comprados;
  }

  regenerarPP(lenda, quantidade = 1, fonte = "") {
    if (!lenda || !quantidade) return;
    SKILL_KEYS.forEach((key) => {
      const habilidade = lenda.habilidades?.[key];
      if (!habilidade) return;
      const maxPP = habilidade.ppMax ?? DEFAULT_PP;
      const atual = lenda.ppAtual?.[key] ?? maxPP;
      lenda.ppAtual[key] = Math.min(maxPP, atual + quantidade);
    });
    if (fonte) {
      this.adicionarAoLog(
        `${fonte} restaurou ${quantidade} PP em ${lenda.nome}.`,
        "info"
      );
    }
  }

  ativarEfeitosPosAcao(resultado) {
    if (!resultado) return;
    if (resultado.habilidade?.extra) {
      this.adicionarAoLog(
        `Efeito adicional de ${resultado.habilidade.nome} aguardando implementação.`,
        "info"
      );
    }
  }

  atualizarEnergiaJogadores() {
    this.players.forEach((player) => {
      player.energia = Math.min(MAX_ULTIMATE_ENERGY, player.energia + 1);
    });
  }

  calcularDanoFinal(atacante, habilidade, defensor) {
    const base = Number(habilidade.base ?? 0);
    const ataque = atacante.ataqueBase + (atacante.ataqueBonus || 0);
    const defesa = defensor
      ? defensor.defesaBase + (defensor.defesaBonus || 0)
      : 0;
    let dano = base + ataque - defesa;
    if (habilidade.multiplier) {
      dano *= habilidade.multiplier;
    }
    return Math.max(0, Math.round(dano));
  }

  obterLendaPorId(player, lendaId) {
    if (!player) return null;
    const ativa = player.zonas[ZONAS_CAMPO.LENDA_ATIVA];
    if (ativa?.id === lendaId) return ativa;
    const banco = player.zonas[ZONAS_CAMPO.BANCO_LENDAS] || [];
    return banco.find((lenda) => lenda.id === lendaId) || null;
  }

  checarDerrota() {
    this.players.forEach((player, index) => {
      const lendaAtiva = player.zonas[ZONAS_CAMPO.LENDA_ATIVA];
      if (lendaAtiva && lendaAtiva.vidaAtual <= 0) {
        this.adicionarAoLog(`💀 ${lendaAtiva.nome} foi derrotado(a)!`, "defeat");
        player.lendasDerrotadas += 1;

        if (player.zonas[ZONAS_CAMPO.ITEM_ATIVO]) {
          this.removerEquipamento(lendaAtiva);
          player.zonas[ZONAS_CAMPO.DESCARTE_ITENS].push(
            player.zonas[ZONAS_CAMPO.ITEM_ATIVO]
          );
          player.zonas[ZONAS_CAMPO.ITEM_ATIVO] = null;
        }

        const banco = player.zonas[ZONAS_CAMPO.BANCO_LENDAS];
        if (banco.length > 0) {
          const proxima = banco.shift();
          proxima.vidaAtual = proxima.vidaMaxima;
          proxima.ppAtual = Object.fromEntries(
            SKILL_KEYS.map((key) => [
              key,
              proxima.habilidades?.[key]?.ppMax ?? DEFAULT_PP,
            ])
          );
          proxima.ultimateUsado = false;
          proxima.efeitos = [];
          player.efeitosAtivos = player.efeitosAtivos.filter(
            (efeito) => efeito.targetLendaId !== lendaAtiva.id
          );
          player.zonas[ZONAS_CAMPO.LENDA_ATIVA] = proxima;
          this.adicionarAoLog(
            `🔄 ${proxima.nome} entra automaticamente no campo.`,
            "info"
          );
        } else {
          this.gameOver = true;
          this.vencedor = (index + 1) % this.players.length;
          this.tipoVitoria = "eliminacao";
          this.adicionarAoLog(
            `🎉 ${this.players[this.vencedor].nome} venceu por eliminação!`,
            "victory"
          );
        }
      }
    });
  }

  adicionarAoLog(message, type = "info") {
    this.gameLog.push({
      turn: this.turn,
      phase: this.fase,
      message,
      type,
      timestamp: Date.now(),
    });

    if (this.options.maxLogEntries && this.gameLog.length > this.options.maxLogEntries) {
      this.gameLog.splice(0, this.gameLog.length - this.options.maxLogEntries);
    }
  }

  obterEstadoDoJogo() {
    return {
      players: this.players.map((player) => this.serializarJogador(player)),
      currentPlayer: this.indiceJogadorAtual,
      turn: this.turn,
      phase: this.fase,
      gameOver: this.gameOver,
      winner: this.vencedor,
      victoryType: this.tipoVitoria,
      log: [...this.gameLog],
    };
  }

  serializarJogador(player) {
    const clone = safeClone(player);
    clone.cooldowns = { ...player.cooldowns };
    return clone;
  }
}

export default MotorDeJogo;