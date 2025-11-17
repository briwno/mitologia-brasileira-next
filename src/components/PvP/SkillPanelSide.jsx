"use client";

import { useState } from 'react';
import Image from 'next/image';

const efeitoLabels = {
  burn: 'Queimadura',
  ignite_bonus: 'Intensificar fogo',
  retaliate_burn: 'Revidar com fogo',
  bleed: 'Sangramento',
  poison: 'Veneno',
  stun: 'Atordoamento',
  fear: 'Medo',
  charm: 'Encantamento',
  root: 'Enraizamento',
  disarm: 'Desarmar',
  attack_down: 'Redução de ATK',
  defense_down: 'Redução de DEF',
  attack_up: 'Aumento de ATK',
  defense_up: 'Aumento de DEF',
  shield: 'Escudo',
  shield_temporary: 'Escudo Temporário',
  heal: 'Cura',
  self_heal: 'Auto Cura',
  heal_self: 'Auto Cura',
  steal_relic: 'Roubar Relíquia',
  berserk: 'Fúria',
  speed_down: 'Redução de Velocidade',
  evasion: 'Evasão'
};

function formatarEfeito(effect) {
  if (effect === null) {
    return null;
  }
  if (effect === undefined) {
    return null;
  }

  let base = efeitoLabels[effect.kind];
  if (base === undefined) {
    base = effect.kind;
  }

  const partes = [];
  partes.push(base);

  if (typeof effect.value === 'number') {
    if (effect.value > 0) {
      partes.push(`+${effect.value}`);
    }
    if (effect.value < 0) {
      partes.push(`${effect.value}`);
    }
  }

  if (typeof effect.duration === 'number') {
    if (effect.duration === 1) {
      partes.push('por 1 turno');
    } else if (effect.duration > 1) {
      partes.push(`por ${effect.duration} turnos`);
    }
  }

  if (typeof effect.chance === 'number') {
    const porcentagem = Math.round(effect.chance * 100);
    partes.push(`${porcentagem}%`);
  }

  return partes.join(' • ');
}

function obterClasseContainer(isEnemy) {
  const classes = ['bg-black/95', 'border-2', 'rounded-xl', 'p-4', 'shadow-2xl', 'max-w-[320px]', 'max-h-[600px]', 'overflow-y-auto', 'space-y-4'];
  if (isEnemy === true) {
    classes.push('border-red-500/70');
  } else {
    classes.push('border-cyan-500/70');
  }
  return classes.join(' ');
}

function obterClasseCabecalho(isEnemy) {
  const classes = ['font-bold', 'text-sm', 'mb-3', 'flex', 'items-center', 'gap-2'];
  if (isEnemy === true) {
    classes.push('text-red-400');
  } else {
    classes.push('text-cyan-400');
  }
  return classes.join(' ');
}

function obterClasseSkill(isEnemy, isUltimate, podeUsar) {
  const classes = ['border', 'rounded-lg', 'p-3', 'transition-all', 'relative'];

  if (isUltimate === true) {
    classes.push('bg-purple-900/40');
    classes.push('border-purple-500/50');
  } else {
    if (isEnemy === true) {
      classes.push('bg-red-900/30');
      classes.push('border-red-500/40');
    } else {
      classes.push('bg-cyan-900/30');
      classes.push('border-cyan-500/40');
    }
  }

  if (podeUsar === true) {
    if (isEnemy === true) {
      // apenas visualização
    } else {
      classes.push('hover:bg-cyan-800/40');
      classes.push('cursor-pointer');
    }
  } else {
    classes.push('opacity-60');
    classes.push('cursor-not-allowed');
  }

  return classes.join(' ');
}

function obterDescricaoTipo(skill) {
  if (skill === null) {
    return 'Indefinido';
  }
  if (skill === undefined) {
    return 'Indefinido';
  }

  if (typeof skill.type === 'string') {
    const mapa = {
      damage: 'Ofensiva',
      buff: 'Bônus',
      debuff: 'Penalidade',
      control: 'Controle',
      heal: 'Cura',
      shield: 'Proteção'
    };
    const descricao = mapa[skill.type];
    if (descricao) {
      return descricao;
    }
    return skill.type;
  }

  return 'Indefinido';
}

function obterDescricaoAlvo(skill) {
  if (skill === null) {
    return 'Alvo indefinido';
  }
  if (skill === undefined) {
    return 'Alvo indefinido';
  }

  const alvo = skill.target;
  if (alvo === 'self') {
    return 'A si mesmo';
  }
  if (alvo === 'ally') {
    return 'Aliado';
  }
  if (alvo === 'attacker') {
    return 'Lenda ativa';
  }
  if (alvo === 'enemy') {
    return 'Oponente';
  }
  if (alvo === 'opponent') {
    return 'Oponente';
  }
  return 'Alvo indefinido';
}

function obterPP(skill) {
  let capacidade = null;
  let atual = null;

  if (typeof skill.ppMax === 'number') {
    capacidade = skill.ppMax;
  } else if (typeof skill.maxPP === 'number') {
    capacidade = skill.maxPP;
  }

  if (typeof skill.pp === 'number') {
    atual = skill.pp;
  } else if (typeof skill.pp_atual === 'number') {
    atual = skill.pp_atual;
  }

  if (atual === null) {
    if (capacidade === null) {
      // permanece nulo
    } else {
      atual = capacidade;
    }
  }

  return { capacidade, atual };
}

function calcularBloqueio(skill, contexto) {
  const resultado = { podeUsar: true, motivo: null };

  if (contexto.isEnemy === true) {
    resultado.podeUsar = false;
    resultado.motivo = 'Somente visualização';
    return resultado;
  }

  if (contexto.isMyTurn === true) {
    // segue fluxo normal
  } else {
    resultado.podeUsar = false;
    resultado.motivo = 'Aguarde sua vez';
    return resultado;
  }

  const ppInfo = obterPP(skill);
  if (ppInfo.atual === null) {
    // sem informação de PP
  } else {
    if (ppInfo.atual <= 0) {
      resultado.podeUsar = false;
      resultado.motivo = 'Sem PP disponível';
      return resultado;
    }
  }

  if (skill.isUltimate === true) {
    let requisito = null;
    if (skill.ultimateRequirements && typeof skill.ultimateRequirements.min_turn === 'number') {
      requisito = skill.ultimateRequirements.min_turn;
    } else if (typeof skill.requiredTurns === 'number') {
      requisito = skill.requiredTurns;
    } else if (typeof skill.required_turns === 'number') {
      requisito = skill.required_turns;
    }

    if (requisito === null) {
      // nenhum requisito adicional
    } else {
      if (contexto.turnsPlayed < requisito) {
        resultado.podeUsar = false;
        resultado.motivo = `Disponível a partir do turno ${requisito}`;
        return resultado;
      }
    }
  }

  return resultado;
}

function usarImagem(skill) {
  const info = { possui: false, fonte: null };
  if (skill && typeof skill.image === 'string') {
    if (skill.image.length > 0) {
      info.possui = true;
      info.fonte = skill.image;
    }
  }
  return info;
}

function obterChaveSkill(skill, index) {
  let chave = `skill-${index}`;
  if (skill && skill.id) {
    chave = String(skill.id);
  }
  return chave;
}

export default function SkillPanelSide({
  card,
  onClose,
  onUseSkill,
  isMyTurn = false,
  isEnemy = false,
  turnsPlayed = 0
}) {
  if (card === null) {
    return null;
  }
  if (card === undefined) {
    return null;
  }

  const [fallbacks, setFallbacks] = useState({});

  const containerClasse = obterClasseContainer(isEnemy);
  const cabecalhoClasse = obterClasseCabecalho(isEnemy);

  let nomeLenda = card.name;
  if (typeof nomeLenda === 'string') {
    if (nomeLenda.length === 0) {
      nomeLenda = 'Lenda';
    }
  } else {
    nomeLenda = 'Lenda';
  }

  const estatisticas = [
    { rotulo: 'HP', valor: card.hp },
    { rotulo: 'ATK', valor: card.atk },
    { rotulo: 'DEF', valor: card.def }
  ];

  const tratarErroImagem = (id) => {
    setFallbacks((anterior) => {
      const atual = { ...anterior };
      atual[id] = true;
      return atual;
    });
  };

  const fechar = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const elementosSkills = [];
  if (Array.isArray(card.skills)) {
    card.skills.forEach((skill, index) => {
      const chaveSkill = obterChaveSkill(skill, index);
      const infoImagem = usarImagem(skill);
      const bloqueio = calcularBloqueio(skill, { isEnemy, isMyTurn, turnsPlayed });
      const classesSkill = obterClasseSkill(isEnemy, skill && skill.isUltimate === true, bloqueio.podeUsar);
      const ppInfo = obterPP(skill);

      let textoPP = 'N/A';
      if (ppInfo.capacidade === null) {
        // mantém padrão
      } else if (ppInfo.atual === null) {
        // mantém padrão
      } else {
        textoPP = `${ppInfo.atual}/${ppInfo.capacidade}`;
      }

      let poderTexto = 'Sem dano direto';
      if (skill && typeof skill.power === 'number') {
        if (skill.power > 0) {
          poderTexto = `Dano base ${skill.power}`;
        }
        if (skill.power === 0) {
          poderTexto = 'Sem dano direto';
        }
      }

      const efeitosElementos = [];
      if (skill && Array.isArray(skill.effects)) {
        skill.effects.forEach((effect, idx) => {
          const texto = formatarEfeito(effect);
          if (texto === null) {
            return;
          }
          const prefixo = obterChaveSkill(skill, index);
          const chaveEfeito = `${prefixo}-effect-${idx}`;
          efeitosElementos.push(
            <span key={chaveEfeito} className="px-2 py-0.5 bg-black/40 border border-white/10 rounded-full text-[10px] text-neutral-200">
              {texto}
            </span>
          );
        });
      }

      let alvoDescricao = obterDescricaoAlvo(skill);
      let tipoDescricao = obterDescricaoTipo(skill);

      let tituloSkill = `Skill ${index + 1}`;
      if (skill) {
        if (typeof skill.name === 'string') {
          if (skill.name.length > 0) {
            tituloSkill = skill.name;
          }
        }
      }

      let marcadorUltimate = null;
      if (skill && skill.isUltimate === true) {
        marcadorUltimate = (
          <span className="text-xs px-2 py-0.5 rounded bg-purple-500/40 text-purple-100 font-semibold">
            ULTIMATE
          </span>
        );
      }

      let cooldownTexto = null;
      if (skill && typeof skill.cooldown === 'number') {
        if (skill.cooldown > 0) {
          cooldownTexto = `${skill.cooldown} turno(s) de recarga`;
        }
      }

      let bloqueioMensagem = null;
      if (bloqueio.motivo) {
        bloqueioMensagem = (
          <div className="mt-2 text-[10px] text-red-300">
            {bloqueio.motivo}
          </div>
        );
      }

      const aoClicar = () => {
        if (bloqueio.podeUsar === true) {
          if (typeof onUseSkill === 'function') {
            onUseSkill(skill);
          }
        }
      };

      let mostrarImagem = false;
      if (infoImagem.possui === true) {
        if (fallbacks[chaveSkill] === true) {
          mostrarImagem = false;
        } else {
          mostrarImagem = true;
        }
      }

      let blocoImagem = null;
      if (mostrarImagem === true) {
        blocoImagem = (
          <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden border border-white/10">
            <Image
              src={infoImagem.fonte}
              alt={tituloSkill}
              fill
              className="object-cover"
              sizes="48px"
              onError={() => tratarErroImagem(chaveSkill)}
            />
          </div>
        );
      }

      elementosSkills.push(
        <button
          type="button"
          key={chaveSkill}
          className={classesSkill}
          onClick={aoClicar}
        >
          <div className="flex items-start gap-3">
            {blocoImagem}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-left">
                <span className="text-sm font-semibold text-white">
                  {tituloSkill}
                </span>
                {marcadorUltimate}
              </div>
              <div className="text-[11px] text-neutral-300 mt-1 text-left">
                {(function () {
                  if (skill) {
                    if (typeof skill.description === 'string') {
                      if (skill.description.length > 0) {
                        return skill.description;
                      }
                    }
                  }
                  return 'Sem descrição.';
                }())}
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[10px] text-neutral-200">
                <div>
                  <span className="font-semibold text-neutral-100">Tipo:</span> {tipoDescricao}
                </div>
                <div>
                  <span className="font-semibold text-neutral-100">Alvo:</span> {alvoDescricao}
                </div>
                <div>
                  <span className="font-semibold text-neutral-100">Potência:</span> {poderTexto}
                </div>
                <div>
                  <span className="font-semibold text-neutral-100">PP:</span> {textoPP}
                </div>
                {cooldownTexto && (
                  <div className="col-span-2">
                    <span className="font-semibold text-neutral-100">Recarga:</span> {cooldownTexto}
                  </div>
                )}
              </div>

              {efeitosElementos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {efeitosElementos}
                </div>
              )}

              {bloqueioMensagem}
            </div>
          </div>
        </button>
      );
    });
  }

  let blocoPassiva = null;
  if (card.passive) {
    let nomePassiva = 'Passiva';
    if (card.passive.name && typeof card.passive.name === 'string') {
      if (card.passive.name.length > 0) {
        nomePassiva = card.passive.name;
      }
    }

    let descricaoPassiva = 'Efeito passivo não descrito.';
    if (card.passive.description && typeof card.passive.description === 'string') {
      if (card.passive.description.length > 0) {
        descricaoPassiva = card.passive.description;
      }
    }

    blocoPassiva = (
      <div className="bg-green-900/30 border border-green-500/40 rounded-lg p-3 text-left space-y-2">
        <div className="flex items-center gap-2 text-green-300 font-semibold text-sm">
          <span>🔮</span>
          <span>{nomePassiva}</span>
        </div>
        <div className="text-[11px] text-neutral-200">
          {descricaoPassiva}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasse}>
      <div className={cabecalhoClasse}>
        <span>⚔️</span>
        <span className="flex-1">Habilidades de {nomeLenda}</span>
        <button
          type="button"
          onClick={fechar}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px] text-neutral-300">
        {estatisticas.map((stat) => {
          let valorExibido = '-';
          if (typeof stat.valor === 'number') {
            valorExibido = String(stat.valor);
          }

          return (
            <div key={stat.rotulo} className="bg-white/5 rounded-md px-2 py-1 text-center">
              <div className="font-semibold text-xs text-white">{stat.rotulo}</div>
              <div>{valorExibido}</div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {elementosSkills}
      </div>

      {blocoPassiva}
    </div>
  );
}
