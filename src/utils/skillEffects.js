import { applyHealing, recalculateLegendStats } from './battleSystem';

function ensureStatusCollection(legend) {
  if (legend === null) {
    return;
  }
  if (legend === undefined) {
    return;
  }

  const ehArray = Array.isArray(legend.statusEffects);
  if (ehArray === false) {
    legend.statusEffects = [];
  }
}

function createStatusEffect(type, value, duration, extra) {
  let valorRegistrado = 0;
  if (typeof value === 'number') {
    valorRegistrado = value;
  }

  let duracaoRegistrada = 1;
  if (typeof duration === 'number') {
    duracaoRegistrada = duration;
  }

  const estrutura = {
    type,
    value: valorRegistrado,
    duration: duracaoRegistrada
  };

  if (extra && typeof extra === 'object') {
    const chaves = Object.keys(extra);
    chaves.forEach(chave => {
      estrutura[chave] = extra[chave];
    });
  }

  return estrutura;
}

function shouldApplyEffect(effect, forcedFlag) {
  if (effect === null) {
    return false;
  }
  if (effect === undefined) {
    return false;
  }

  if (typeof forcedFlag === 'boolean') {
    return forcedFlag;
  }

  if (typeof effect.chance === 'number') {
    const roll = Math.random();
    if (roll > effect.chance) {
      return false;
    }
  }

  return true;
}

function resolveTarget(effect, skill, atacante, defensor, jogadorAtacante, jogadorDefensor) {
  let legendaEscolhida = defensor;
  let jogadorEscolhido = jogadorDefensor;

  let indicador = null;
  if (effect && typeof effect.target === 'string' && effect.target.length > 0) {
    indicador = effect.target;
  }

  if (indicador === null && skill && typeof skill.target === 'string' && skill.target.length > 0) {
    indicador = skill.target;
  }

  if (effect && effect.kind === 'self_heal') {
    indicador = 'self';
  }

  let usaAtacante = false;
  if (indicador === 'self') {
    usaAtacante = true;
  } else if (indicador === 'ally') {
    usaAtacante = true;
  } else if (indicador === 'attacker') {
    usaAtacante = true;
  }

  if (usaAtacante) {
    legendaEscolhida = atacante;
    jogadorEscolhido = jogadorAtacante;
  }

  let usaDefensor = false;
  if (indicador === 'enemy') {
    usaDefensor = true;
  } else if (indicador === 'opponent') {
    usaDefensor = true;
  }

  if (usaDefensor) {
    legendaEscolhida = defensor;
    jogadorEscolhido = jogadorDefensor;
  }

  return { legenda: legendaEscolhida, jogador: jogadorEscolhido };
}

function adicionarStatus(legend, tipo, valor, duracao, extra) {
  if (legend === null) {
    return;
  }
  if (legend === undefined) {
    return;
  }

  ensureStatusCollection(legend);
  const efeito = createStatusEffect(tipo, valor, duracao, extra);
  legend.statusEffects.push(efeito);
}

function intensificarQueimadura(legend, incrementos) {
  if (legend === null) {
    return;
  }
  if (legend === undefined) {
    return;
  }

  const ehArray = Array.isArray(legend.statusEffects);
  if (ehArray === false) {
    return;
  }

  for (let i = 0; i < legend.statusEffects.length; i += 1) {
    const efeito = legend.statusEffects[i];
    if (efeito === null) {
      continue;
    }
    if (efeito === undefined) {
      continue;
    }
    if (efeito.type === 'burn') {
      if (typeof incrementos.value === 'number') {
        efeito.value += incrementos.value;
      }
      if (typeof incrementos.duration === 'number') {
        if (incrementos.duration > efeito.duration) {
          efeito.duration = incrementos.duration;
        }
      }
      return;
    }
  }

  adicionarStatus(legend, 'burn', incrementos.value, incrementos.duration, {});
}

function aplicarBuffTemporal(legend, tipo, valor, duracao) {
  adicionarStatus(legend, tipo, valor, duracao, {});
  recalculateLegendStats(legend);
}

function aplicarDebuffTemporal(legend, tipo, valor, duracao) {
  adicionarStatus(legend, tipo, valor, duracao, {});
  recalculateLegendStats(legend);
}

function obterNomeLegenda(legend) {
  let nome = 'Alvo';
  if (legend && typeof legend.name === 'string') {
    if (legend.name.length > 0) {
      nome = legend.name;
    }
  }
  return nome;
}

function obterNomeJogador(player) {
  let nome = 'Jogador';
  if (player && typeof player.name === 'string') {
    if (player.name.length > 0) {
      nome = player.name;
    }
  }
  return nome;
}

export function processSkillEffects(params) {
  const logs = [];

  let skill = null;
  if (params) {
    skill = params.skill;
  }
  if (skill === null) {
    return logs;
  }
  if (skill === undefined) {
    return logs;
  }

  let efeitos = [];
  if (skill && Array.isArray(skill.effects)) {
    efeitos = skill.effects;
  }

  efeitos.forEach((effect, indice) => {
    let forcedFlag;
    if (params && Array.isArray(params.forcedResults)) {
      if (params.forcedResults.length > indice) {
        forcedFlag = params.forcedResults[indice];
      }
    }

    if (shouldApplyEffect(effect, forcedFlag) === false) {
      return;
    }

    const alvo = resolveTarget(effect, skill, params.attackerLegend, params.defenderLegend, params.attackerPlayer, params.defenderPlayer);
    const legendaAlvo = alvo.legenda;

    let valorPadrao = 0;
    if (effect && typeof effect.value === 'number') {
      valorPadrao = effect.value;
    }

    let duracaoPadrao = 1;
    if (effect && typeof effect.duration === 'number') {
      duracaoPadrao = effect.duration;
    }

    const nomeAlvo = obterNomeLegenda(legendaAlvo);
    const nomeAtacante = obterNomeLegenda(params.attackerLegend);

    switch (effect.kind) {
      case 'burn':
        adicionarStatus(legendaAlvo, 'burn', valorPadrao, duracaoPadrao, {});
        logs.push({ type: 'status', text: `${nomeAlvo} agora queima por ${duracaoPadrao} turno(s).` });
        break;

      case 'ignite_bonus':
        intensificarQueimadura(legendaAlvo, { value: valorPadrao, duration: duracaoPadrao });
        logs.push({ type: 'status', text: `${nomeAlvo} teve a queimadura intensificada.` });
        break;

      case 'retaliate_burn':
        adicionarStatus(legendaAlvo, 'retaliate_burn', valorPadrao, duracaoPadrao, {});
        break;

      case 'bleed':
        adicionarStatus(legendaAlvo, 'bleed', valorPadrao, duracaoPadrao, {});
        logs.push({ type: 'status', text: `${nomeAlvo} está sangrando.` });
        break;

      case 'poison':
        adicionarStatus(legendaAlvo, 'poison', valorPadrao, duracaoPadrao, {});
        logs.push({ type: 'status', text: `${nomeAlvo} foi envenenado.` });
        break;

      case 'stun':
        adicionarStatus(legendaAlvo, 'stun', valorPadrao, duracaoPadrao, {});
        logs.push({ type: 'controle', text: `${nomeAlvo} ficou atordoado.` });
        break;

      case 'fear':
        adicionarStatus(legendaAlvo, 'fear', valorPadrao, duracaoPadrao, {});
        logs.push({ type: 'controle', text: `${nomeAlvo} está tomado pelo medo.` });
        break;

      case 'charm':
        adicionarStatus(legendaAlvo, 'charm', valorPadrao, duracaoPadrao, {});
        logs.push({ type: 'controle', text: `${nomeAlvo} está encantado.` });
        break;

      case 'root':
        adicionarStatus(legendaAlvo, 'root', valorPadrao, duracaoPadrao, {});
        logs.push({ type: 'controle', text: `${nomeAlvo} não pode se mover.` });
        break;

      case 'disarm':
        const extraDisarm = {};
        if (effect && typeof effect.chance === 'number') {
          extraDisarm.chance = effect.chance;
        }
        adicionarStatus(legendaAlvo, 'disarm', valorPadrao, duracaoPadrao, extraDisarm);
        break;

      case 'attack_down':
        aplicarDebuffTemporal(legendaAlvo, 'attack_down', valorPadrao, duracaoPadrao);
        logs.push({ type: 'debuff', text: `${nomeAlvo} perdeu ${valorPadrao} de ATK.` });
        break;

      case 'defense_down':
        aplicarDebuffTemporal(legendaAlvo, 'defense_down', valorPadrao, duracaoPadrao);
        logs.push({ type: 'debuff', text: `${nomeAlvo} perdeu ${valorPadrao} de DEF.` });
        break;

      case 'attack_up':
        aplicarBuffTemporal(legendaAlvo, 'attack_up', valorPadrao, duracaoPadrao);
        logs.push({ type: 'buff', text: `${nomeAlvo} ganhou ${valorPadrao} de ATK.` });
        break;

      case 'defense_up':
        aplicarBuffTemporal(legendaAlvo, 'defense_up', valorPadrao, duracaoPadrao);
        logs.push({ type: 'buff', text: `${nomeAlvo} ganhou ${valorPadrao} de DEF.` });
        break;

      case 'shield':
        if (legendaAlvo && typeof legendaAlvo.shields !== 'number') {
          legendaAlvo.shields = 0;
        }
        if (legendaAlvo) {
          legendaAlvo.shields += valorPadrao;
        }
        logs.push({ type: 'buff', text: `${nomeAlvo} recebeu um escudo de ${valorPadrao}.` });
        break;

      case 'shield_temporary':
        if (legendaAlvo && typeof legendaAlvo.shields !== 'number') {
          legendaAlvo.shields = 0;
        }
        if (legendaAlvo) {
          legendaAlvo.shields += valorPadrao;
          adicionarStatus(legendaAlvo, 'shield_temporary', valorPadrao, duracaoPadrao, {});
        }
        logs.push({ type: 'buff', text: `${nomeAlvo} ganhou um escudo temporário.` });
        break;

      case 'heal':
        if (legendaAlvo) {
          const resultadoCura = applyHealing(legendaAlvo, valorPadrao);
          logs.push({ type: 'heal', text: `${nomeAlvo} recuperou ${resultadoCura.healing} de vida.` });
        }
        break;

      case 'self_heal':
        if (params.attackerLegend) {
          const resultado = applyHealing(params.attackerLegend, valorPadrao);
          logs.push({ type: 'heal', text: `${nomeAtacante} recuperou ${resultado.healing} de vida.` });
        }
        break;

      case 'heal_self':
        if (legendaAlvo) {
          const resultadoSelf = applyHealing(legendaAlvo, valorPadrao);
          logs.push({ type: 'heal', text: `${nomeAlvo} recuperou ${resultadoSelf.healing}.` });
        }
        break;

      case 'steal_relic':
        if (params.attackerPlayer && params.defenderPlayer && params.defenderPlayer.storedRelic) {
          const relic = params.defenderPlayer.storedRelic;
          params.defenderPlayer.storedRelic = null;

          if (params.attackerPlayer.storedRelic) {
            const ehArrayPool = Array.isArray(params.attackerPlayer.relicPool);
            if (ehArrayPool === false) {
              params.attackerPlayer.relicPool = [];
            }
            params.attackerPlayer.relicPool.push(params.attackerPlayer.storedRelic);
          }

          params.attackerPlayer.storedRelic = relic;
          const nomeLadrao = obterNomeJogador(params.attackerPlayer);
          logs.push({ type: 'relic', text: `${nomeLadrao} roubou a relíquia do oponente.` });
        }
        break;

      case 'berserk':
        aplicarBuffTemporal(legendaAlvo, 'attack_up', valorPadrao, duracaoPadrao);
        logs.push({ type: 'buff', text: `${nomeAlvo} entrou em fúria.` });
        break;

      case 'speed_down':
        adicionarStatus(legendaAlvo, 'speed_down', valorPadrao, duracaoPadrao, {});
        break;

      case 'evasion':
        adicionarStatus(legendaAlvo, 'evasion', valorPadrao, duracaoPadrao, {});
        break;

      default:
        let efeitoNome = 'desconhecido';
        if (effect && effect.kind) {
          efeitoNome = effect.kind;
        }
        logs.push({ type: 'info', text: `Efeito ${efeitoNome} ainda não implementado completamente.` });
        break;
    }
  });

  recalculateLegendStats(params.attackerLegend);
  recalculateLegendStats(params.defenderLegend);

  return logs;
}
