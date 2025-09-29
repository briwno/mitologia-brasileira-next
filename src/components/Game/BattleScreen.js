// src/components/Game/BattleScreen.js
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Icon from "@/components/UI/Icon";
import BattleCard from "./BattleCard";
import {
  ZONAS_CAMPO,
  FASES_DO_JOGO,
  CONSTANTES_DO_JOGO,
} from "@/utils/constants";
import { MotorDeJogo } from "@/utils/gameLogic";
import { useGameCards } from "@/hooks/useGameCards";
import { cardsAPI } from "@/utils/api";
import { mapApiCardToLocal } from "@/utils/cardUtils";

// Card size scaling relative to stage (approx based on SVG):
// small ≈ 4.5% width x 7% height, medium ≈ 5.5% x 8.5%, large ≈ 8.5% x 12%
const SIZE = {
  small: { width: "4.5%", height: "7.0%" },
  medium: { width: "5.5%", height: "8.5%" },
  large: { width: "8.5%", height: "12.0%" },
};

// Componente para exibir informações do jogador
function PlayerInfo({
  player,
  position = "bottom",
  isCurrentPlayer = false,
  posStyle,
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // If posStyle provided, use explicit coordinates; otherwise fall back to legacy corner positions
  const positionClasses = posStyle
    ? "z-20"
    : position === "bottom"
    ? "bottom-4 left-4 z-20"
    : "top-4 right-4 z-20";

  const handleEmojiClick = (emoji) => {
    console.log("Emoji selecionado:", emoji);
    // Aqui você pode implementar a lógica para mostrar o emoji no jogo
    setShowEmojiPicker(false); // Fecha o picker após selecionar
  };

  return (
    <div className={`absolute ${positionClasses}`} style={posStyle}>
      <div className="bg-orange-500/90 rounded-lg p-3 border border-orange-400 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 border-2 border-orange-300">
            <Image
              src={player.avatar || "/images/avatars/player.jpg"}
              alt={`Avatar de ${player.nome}`}
              width={48}
              height={48}
              className="object-cover"
              quality={100}
              decoding="async"
              priority={isCurrentPlayer}
            />
          </div>
          <div>
            <div className="text-white font-bold text-sm">{player.nome}</div>
            <div className="text-orange-100 text-xs">
              {player.ranking || "Iniciante"}
            </div>
          </div>
        </div>
        {position === "bottom" && (
          <div className="relative">
            <button
              className="mt-2 px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-white text-xs transition-colors"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Icon name="smile" size={12} className="inline mr-1" />
              Emote
            </button>

            {/* EmojiPicker simplificado */}
            {showEmojiPicker && (
              <div className="absolute mb-2 left-0 bg-gray-800 p-2 rounded-lg shadow-xl border border-gray-600 z-50">
                <div className="flex gap-1">
                  {[
                    "😀",
                    "😃",
                    "😄",
                    "😁",
                    "😆",
                    "🤔",
                    "😎",
                    "🥳",
                    "😤",
                    "💪",
                  ].map((emoji) => (
                    <button
                      key={emoji}
                      className="text-lg hover:scale-125 transition-transform p-1 hover:bg-gray-700 rounded"
                      onClick={() => handleEmojiClick(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para cartas no banco
function BankCards({ cards, position = "bottom", onClick, posStyle }) {
  const positionClasses = posStyle
    ? "z-10"
    : position === "bottom"
    ? "bottom-4 left-12 z-10"
    : "top-4 right-12 z-10";

  return (
    <div className={`absolute ${positionClasses}`} style={posStyle}>
      <div className="flex gap-2">
        {[...Array(4)].map((_, index) => {
          const card = cards[index];
          return (
            <BattleCard
              key={index}
              card={card}
              type="lenda"
              showStats={false}
              onClick={(selectedCard) => onClick?.(selectedCard, index)}
              className="w-24 h-34"
            />
          );
        })}
      </div>
      {position === "bottom" && (
        <div className="text-white text-xs mt-1 text-center bg-black/50 px-2 py-1 rounded">
          BANCO DE CARTAS
        </div>
      )}
    </div>
  );
}

// Componente para cartas de itens na mão
function HandItems({ items, position = "bottom", onUseItem, posStyle }) {
  const positionClasses = posStyle
    ? "z-10"
    : position === "bottom"
    ? "bottom-4 left-1/2 -translate-x-1/2 z-10"
    : "top-4 left-1/2 -translate-x-1/2 z-10";

  return (
    <div className={`absolute ${positionClasses}`} style={posStyle}>
      <div className="flex gap-2">
        {[...Array(3)].map((_, index) => {
          const item = items?.[index];
          return (
            <div key={index} className="flex flex-col items-center">
              <BattleCard
                card={item}
                type="item"
                showStats={false}
                onClick={
                  item
                    ? (selectedItem) => onUseItem?.(selectedItem, index)
                    : undefined
                }
                className={`w-20 h-28 ${
                  !item
                    ? "opacity-30 border-dashed border-2 border-gray-400"
                    : ""
                }`}
              />
              {position === "bottom" && (
                <div className="text-white text-xs mt-1 bg-black/50 px-1 py-0.5 rounded">
                  ITEM {index + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Componente para exibir habilidades da carta ativa
function CardSkills({ card, onSkillClick, posStyle }) {
  const normalizarElemento = (element) => {
    if (!element) return "";
    return element
      .toString()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  };

  const inferirTipo = (skill, index) => {
    const raw = (skill?.kind || skill?.type || skill?.tipo || "")
      .toString()
      .toLowerCase();
    if (raw.includes("pass")) return "passiva";
    if (raw === "ultimate" || raw === "ulti") return "ultimate";
    if (raw === "basic" || raw === "basica") return "basica";
    if (raw === "active" || raw === "ativa") return "ativa";
    if (index === 4) return "ultimate";
    if (index === 0) return "basica";
    return "ativa";
  };

  const rawKind = (skill) =>
    (skill?.kind || skill?.type || "").toString().toLowerCase();

  const getKindLabel = (skill) => {
    const value = (skill?.kind || skill?.tipo || "").toString().toLowerCase();
    if (!value) return null;

    const labels = {
      damage: "Dano",
      debuff: "Enfraquecimento",
      stun: "Atordoamento",
      buff: "Fortalecimento",
      heal: "Cura",
      passive: "Passiva",
      active: "Ativa",
      basic: "Básica",
      ultimate: "Ultimate",
      support: "Suporte",
      utility: "Utilidade",
      shield: "Escudo",
      energy: "Energia",
      dot: "Dano Contínuo",
      hot: "Regeneração",
      summon: "Invocação",
      status: "Status",
    };

    if (labels[value]) {
      return labels[value];
    }

    return value
      .split(/[-_ ]+/)
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");
  };

  const getElementLabel = (skill) => {
    const rawElement = (skill?.elemento ?? skill?.element ?? "")
      .toString()
      .trim();
    if (!rawElement) return null;
    const normalized = normalizarElemento(rawElement);
    if (!normalized || ["neutro", "none", "nenhum"].includes(normalized)) {
      return null;
    }
    return rawElement.toUpperCase();
  };

  const getCardSkills = (card) => {
    if (!card) {
      return [];
    }

    const abilities = card.habilidades || card.abilities;
    if (!abilities) {
      return [];
    }

    const skills = [];
    const sequentialSkills = [
      abilities.skill1,
      abilities.skill2,
      abilities.skill3,
      abilities.skill4,
      abilities.skill5,
    ];

    sequentialSkills.forEach((skill, index) => {
      if (
        !skill ||
        (!skill.name && !skill.description && !skill.nome && !skill.descricao)
      ) {
        return;
      }

      const tipo = inferirTipo(skill, index);
      const kind = rawKind(skill);
      const elementoOriginal =
        skill.element || card.elemento || card.element || "";
      skills.push({
        id: skill.id || `skill${index + 1}`,
        nome: skill.name || skill.nome || `Habilidade ${index + 1}`,
        descricao: skill.description || skill.descricao || "Sem descrição",
        tipo,
        cooldown: skill.cooldown ?? skill.cooldown_turns ?? 0,
        custo: skill.cost ?? 0,
        disponivel:
          skill.available !== undefined ? Boolean(skill.available) : true,
        elemento: elementoOriginal,
        elementoNormalizado: normalizarElemento(elementoOriginal),
        dano: skill.base ?? skill.damage ?? null,
        pp: skill.pp ?? null,
        ppMax: skill.ppMax ?? skill.pp_max ?? null,
        stun: skill.stun ?? null,
        chance: skill.chance ?? skill.hitChance ?? null,
        heal: skill.heal ?? null,
        kind,
      });
    });

    if (!skills.length) {
      if (
        abilities.basic &&
        (abilities.basic.name || abilities.basic.description)
      ) {
        const elementoOriginal = card.elemento || card.element || "";
        skills.push({
          id: "basic",
          nome: abilities.basic.name,
          descricao: abilities.basic.description,
          tipo: "basica",
          cooldown: abilities.basic.cooldown ?? 0,
          custo: abilities.basic.cost ?? 0,
          disponivel: true,
          elemento: elementoOriginal,
          elementoNormalizado: normalizarElemento(elementoOriginal),
          kind: "basic",
        });
      }

      if (
        abilities.ultimate &&
        (abilities.ultimate.name || abilities.ultimate.description)
      ) {
        const elementoOriginal = card.elemento || card.element || "";
        skills.push({
          id: "ultimate",
          nome: abilities.ultimate.name,
          descricao: abilities.ultimate.description,
          tipo: "ultimate",
          cooldown: abilities.ultimate.cooldown ?? 0,
          custo: abilities.ultimate.cost ?? 0,
          disponivel: true,
          elemento: elementoOriginal,
          elementoNormalizado: normalizarElemento(elementoOriginal),
          kind: "ultimate",
        });
      }
    }

    const passive = abilities.passive;
    if (
      passive &&
      (passive.name || passive.description || passive.nome || passive.descricao)
    ) {
      const elementoOriginal =
        passive.element || card.elemento || card.element || "";
      skills.push({
        id: passive.id || "passive",
        nome: passive.name || passive.nome || "Passiva",
        descricao:
          passive.description || passive.descricao || "Habilidade passiva",
        tipo: "passiva",
        cooldown: passive.cooldown ?? 0,
        custo: passive.cost ?? 0,
        disponivel:
          passive.available !== undefined ? Boolean(passive.available) : true,
        elemento: elementoOriginal,
        elementoNormalizado: normalizarElemento(elementoOriginal),
        kind: "passive",
      });
    }

    return skills;
  };

  const skills = getCardSkills(card);

  if (!card || skills.length === 0) {
    return null;
  }

  const getSkillColor = (skill) => {
    if (!skill.disponivel) return "bg-gray-600 border-gray-500 opacity-50";

    const elemento =
      skill.elementoNormalizado || normalizarElemento(skill.elemento);

    switch (elemento || skill.tipo) {
      case "fogo":
        return "bg-red-600 border-red-400 hover:bg-red-500 shadow-red-500/30";
      case "agua":
        return "bg-cyan-600 border-cyan-400 hover:bg-cyan-500 shadow-cyan-500/30";
      case "terra":
        return "bg-green-700 border-green-500 hover:bg-green-600 shadow-green-500/30";
      case "ar":
        return "bg-sky-600 border-sky-400 hover:bg-sky-500 shadow-sky-500/30";
      case "luz":
        return "bg-yellow-500 border-yellow-300 hover:bg-yellow-400 shadow-yellow-400/30";
      case "sombra":
        return "bg-purple-800 border-purple-600 hover:bg-purple-700 shadow-purple-600/30";
      case "espirito":
        return "bg-indigo-700 border-indigo-500 hover:bg-indigo-600 shadow-indigo-500/30";
      case "basica":
        return "bg-green-600 border-green-400 hover:bg-green-500 shadow-green-400/30";
      case "ativa":
        return "bg-blue-600 border-blue-400 hover:bg-blue-500 shadow-blue-400/30";
      case "ultimate":
        return "bg-gradient-to-r from-purple-600 to-pink-600 border-purple-400 hover:from-purple-500 hover:to-pink-500 shadow-purple-500/50";
      case "passiva":
        return "bg-amber-600 border-amber-400 hover:bg-amber-500 shadow-amber-400/30";
      default:
        return "bg-gray-600 border-gray-500 hover:bg-gray-500 shadow-gray-400/30";
    }
  };

  const getSkillIcon = (skill) => {
    if (skill.kind) {
      switch (skill.kind) {
        case "damage":
          return "⚔️";
        case "debuff":
          return "💀";
        case "stun":
          return "⚡";
        case "buff":
          return "💪";
        case "heal":
          return "💚";
        default:
          return "💫";
      }
    }

    const elemento =
      skill.elementoNormalizado || normalizarElemento(skill.elemento);
    switch (elemento) {
      case "fogo":
        return "🔥";
      case "água":
      case "agua":
        return "💧";
      case "terra":
        return "🌿";
      case "ar":
        return "💨";
      case "espírito":
      case "espirito":
        return "👻";
    }

    switch (skill.tipo) {
      case "basica":
        return "⚔️";
      case "ativa":
        return "💫";
      case "ultimate":
        return "👑";
      case "passiva":
        return "🛡️";
      default:
        return "❓";
    }
  };

  const getSkillSize = (skill) => {
    switch (skill.tipo) {
      case "ultimate":
        return "w-16 h-16 text-2xl border-4";
      case "passiva":
        return "w-10 h-10 text-sm border-2";
      default:
        return "w-12 h-12 text-lg border-2";
    }
  };

  // Organizar habilidades por tipo para melhor layout
  const basicSkills = skills.filter(
    (s) => s.tipo === "basica" || s.tipo === "ativa"
  );
  const ultimateSkill = skills.find((s) => s.tipo === "ultimate");
  const passiveSkill = skills.find((s) => s.tipo === "passiva");
  const ultimateKindLabel = ultimateSkill ? getKindLabel(ultimateSkill) : null;
  const ultimateElementLabel = ultimateSkill
    ? getElementLabel(ultimateSkill)
    : null;
  const passiveKindLabel = passiveSkill ? getKindLabel(passiveSkill) : null;
  const passiveElementLabel = passiveSkill
    ? getElementLabel(passiveSkill)
    : null;

  return (
    <div className="absolute z-10" style={posStyle}>
      <div className="flex items-center justify-center gap-3">
        {/* Skills básicas e ativas */}
        {basicSkills.map((skill) => {
          const kindLabel = getKindLabel(skill);
          const elementLabel = getElementLabel(skill);

          return (
            <div key={skill.id} className="relative group">
              <button
                className={`${getSkillSize(
                  skill
                )} rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${getSkillColor(
                  skill
                )}  
${
  skill.disponivel
    ? "cursor-pointer hover:scale-110 hover:shadow-xl"
    : "cursor-not-allowed"
}`}
                onClick={() => skill.disponivel && onSkillClick?.(skill)}
                disabled={!skill.disponivel}
              >
                {getSkillIcon(skill)}
                {skill.cooldown > 0 && skill.cooldown < 10 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {skill.cooldown}
                  </span>
                )}
              </button>

              {/* Tooltip avançado */}
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900/95 text-white text-sm rounded-lg p-3 shadow-xl border border-gray-600   
opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
              >
                <div className="font-bold text-center mb-1 text-yellow-400">
                  {skill.nome}
                </div>
                {kindLabel && (
                  <div className="text-[11px] text-emerald-200 text-center uppercase tracking-wide mb-1">
                    {kindLabel}
                  </div>
                )}
                {(skill.tipo || elementLabel) && (
                  <div className="text-xs text-gray-300 mb-2 text-center">
                    {skill.tipo ? skill.tipo.toUpperCase() : null}
                    {skill.tipo && elementLabel ? " • " : ""}
                    {elementLabel}
                  </div>
                )}
                <div className="text-xs text-center">{skill.descricao}</div>
                {skill.cooldown > 0 && (
                  <div className="text-xs text-red-400 text-center mt-1">
                    Cooldown: {skill.cooldown} turnos
                  </div>
                )}
                {!skill.disponivel && (
                  <div className="text-xs text-red-500 text-center mt-1 font-bold">
                    INDISPONÍVEL
                  </div>
                )}
                {/* Seta do tooltip */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/95"></div>
              </div>
            </div>
          );
        })}

        {/* Ultimate (destaque central) */}
        {ultimateSkill && (
          <div className="relative group">
            <button
              className={`${getSkillSize(
                ultimateSkill
              )} rounded-full flex items-center justify-center text-white font-bold transition-all duration-300
${getSkillColor(ultimateSkill)} ${
                ultimateSkill.disponivel
                  ? "cursor-pointer hover:scale-110 hover:shadow-2xl animate-pulse"
                  : "cursor-not-allowed"
              }`}
              onClick={() =>
                ultimateSkill.disponivel && onSkillClick?.(ultimateSkill)
              }
              disabled={!ultimateSkill.disponivel}
            >
              {getSkillIcon(ultimateSkill)}
              {ultimateSkill.cooldown > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {ultimateSkill.cooldown}
                </span>
              )}
              {/* Efeito de brilho para ultimate */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 animate-spin-slow"></div>
            </button>

            {/* Tooltip para ultimate */}
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-gradient-to-r from-purple-900/95 to-pink-900/95 text-white text-sm rounded-lg    
p-4 shadow-2xl border border-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
            >
              <div className="font-bold text-center mb-1 text-yellow-300 text-lg">
                ⚡ {ultimateSkill.nome} ⚡
              </div>
              {ultimateKindLabel && (
                <div className="text-[11px] text-purple-200 text-center uppercase tracking-wide mb-1">
                  {ultimateKindLabel}
                </div>
              )}
              <div className="text-xs text-purple-200 mb-2 text-center font-bold">
                ULTIMATE
                {ultimateElementLabel ? ` • ${ultimateElementLabel}` : ""}
              </div>
              <div className="text-sm text-center mb-2">
                {ultimateSkill.descricao}
              </div>
              {ultimateSkill.cooldown > 0 && (
                <div className="text-xs text-purple-300 text-center">
                  ⏳ Cooldown: {ultimateSkill.cooldown} turnos
                </div>
              )}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-purple-900/95"></div>
            </div>
          </div>
        )}

        {/* Passiva (menor, mas com destaque) */}
        {passiveSkill && (
          <div className="relative group">
            <button
              className={`${getSkillSize(
                passiveSkill
              )} rounded-full flex items-center justify-center text-white font-bold transition-all duration-300
${getSkillColor(passiveSkill)} hover:scale-110 hover:shadow-lg`}
              onClick={() => onSkillClick?.(passiveSkill)}
            >
              {getSkillIcon(passiveSkill)}
              {/* Indicador de passiva sempre ativa */}
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3 animate-ping"></div>
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3"></div>
            </button>

            {/* Tooltip para passiva */}
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-amber-900/95 text-white text-sm rounded-lg p-3 shadow-xl border
border-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
            >
              <div className="font-bold text-center mb-1 text-amber-300">
                🛡️ {passiveSkill.nome}
              </div>
              {passiveKindLabel && (
                <div className="text-[11px] text-amber-200 text-center uppercase tracking-wide mb-1">
                  {passiveKindLabel}
                </div>
              )}
              <div className="text-xs text-amber-200 mb-2 text-center font-bold">
                SEMPRE ATIVA
                {passiveElementLabel ? ` • ${passiveElementLabel}` : ""}
              </div>
              <div className="text-xs text-center">
                {passiveSkill.descricao}
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-amber-900/95"></div>
            </div>
          </div>
        )}
      </div>

      {/* Label informativo melhorado */}
      <div className="text-white text-xs mt-3 text-center bg-gradient-to-r from-black/60 via-black/80 to-black/60 px-4 py-2 rounded-full border border-gray-600">
        <span className="text-yellow-400 font-bold">⚡ HABILIDADES</span>
        <span className="text-gray-300 mx-2">•</span>
        <span className="text-blue-300">{card.nome}</span>
      </div>
    </div>
  );
}

// Componente para a carta ativa em campo
function ActiveCard({
  card,
  position = "bottom",
  onClick,
  itemAtivo = null,
  posStyle,
}) {
  const positionClasses = posStyle ? "z-15" : position === "bottom";

  return (
    <div className={`absolute ${positionClasses}`} style={posStyle}>
      <div className="flex items-center justify-center gap-4">
        {/* Carta Ativa */}
        <div className="flex flex-col items-center">
          <BattleCard
            card={card}
            type="lenda"
            isActive={true}
            showStats={true}
            onClick={onClick}
            className="w-40 h-56"
          />
        </div>

        {/* Item Ativo - sempre mostrado ao lado */}
        <div className="flex flex-col items-center">
          <BattleCard
            card={itemAtivo}
            type="item"
            showStats={false}
            isClickable={!!itemAtivo}
            className={`w-20 h-28 ${
              itemAtivo
                ? "border-orange-400 shadow-lg shadow-orange-400/50"
                : "opacity-30 border-dashed border-2 border-gray-400"
            }`}
          />
          {position === "bottom" && (
            <div className="text-white text-xs mt-1 bg-black/50 px-2 py-1 rounded">
              {itemAtivo ? "ITEM ATIVO" : "SLOT ITEM"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para pilha de cartas
function CardStack({ count, position = "bottom", onClick, posStyle }) {
  const positionClasses = posStyle
    ? "z-10"
    : position === "bottom"
    ? "bottom-4 right-4 z-10"
    : "top-4 left-4 z-10";

  return (
    <div className={`absolute ${positionClasses}`} style={posStyle}>
      <div className="flex flex-col items-center">
        {/* Efeito de cartas empilhadas */}
        <div className="absolute top-1 left-1 w-26 h-34 bg-green-600 border-2 border-green-500 rounded-lg opacity-100 rotate-12" />
        <div className="absolute top-1 left-1 w-26 h-34 bg-green-600 border-2 border-green-500 rounded-lg opacity-100 -rotate-12" />
        <div
          className="w-26 h-34 bg-green-700 border-2 border-green-500 rounded-lg cursor-pointer hover:scale-105 transition-all relative overflow-hidden"
          onClick={onClick}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <Icon name="layers" size={16} />
            <div className="text-xs font-bold mt-1">{count}</div>
          </div>
        </div>
        {position === "bottom" && (
          <div className="text-white text-xs mt-1 bg-black/50 px-2 py-1 rounded">
            PILHA DE ITENS
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para log de eventos
function GameLog({ events, posStyle }) {
  return (
    <div className="absolute z-20" style={posStyle}>
      <div className="w-72 h-80 bg-blue-900/90 border-2 border-blue-600 rounded-lg backdrop-blur-sm">
        <div className="p-3 border-b border-blue-600">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Icon name="list" size={16} />
            Log de Eventos
          </h3>
        </div>
        <div className="p-3 h-64 overflow-y-auto">
          <div className="space-y-2">
            {events.length === 0 ? (
              <div className="text-blue-300 text-sm text-center py-8">
                Aguardando ações...
              </div>
            ) : (
              events.map((event, index) => (
                <div key={index} className="text-sm">
                  <div className="text-blue-100">{event.message}</div>
                  <div className="text-blue-400 text-xs">{event.timestamp}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal da tela de batalha
export default function BattleScreen({
  gameState,
  currentPlayer,
  opponent,
  onAction,
  onEndTurn,
  mode = "pvp",
}) {
  const [gameLog, setGameLog] = useState([]);
  const {
    loading: cardsLoading,
    error: cardsError,
    getPlayerData,
  } = useGameCards();

  // Anchor-aware position helper: x/y are percentages of viewport; choose anchors
  const posPercent = ({
    x,
    y,
    centerX = false,
    centerY = false,
    useRight = false,
    useBottom = false,
  }) => {
    const style = {};
    if (useRight) style.right = `${100 - x}%`;
    else style.left = `${x}%`;
    if (useBottom) style.bottom = `${100 - y}%`;
    else style.top = `${y}%`;
    if (centerX && centerY) style.transform = "translate(-50%, -50%)";
    else if (centerX) style.transform = "translateX(-50%)";
    else if (centerY) style.transform = "translateY(-50%)";
    return style;
  };

  // Layout positions derived from the SVG (percentages of a 1920x1080 canvas)
  const POS = {
    // bottom side
    playerBottom: posPercent({ x: 2, y: 92, useBottom: true }), // bottom-left
    bankBottom: posPercent({ x: 16, y: 92, useBottom: true }), // bottom-left row
    itemsBottom: posPercent({ x: 50, y: 95, centerX: true, useBottom: true }), // bottom-center row
    activeBottom: posPercent({ x: 50, y: 65, centerX: true, centerY: true }), // centered
    pileBottom: posPercent({ x: 93, y: 90, useRight: true, useBottom: true }), // bottom-right

    // top side (mirrored)
    playerTop: posPercent({ x: 94, y: 8, useRight: true }), // top-right
    bankTop: posPercent({ x: 84, y: 10, useRight: true }), // top-right row
    itemsTop: posPercent({ x: 50, y: 5, centerX: true }), // top-center row
    activeTop: posPercent({ x: 50, y: 23.5, centerX: true }), // top-center
    pileTop: posPercent({ x: 7, y: 10 }), // top-left

    // UI
    log: posPercent({ x: 96, y: 50, centerY: true, useRight: true }), // right-center
    phase: posPercent({ x: 25, y: 10, centerX: true }), // top-center
    endTurn: posPercent({ x: 7, y: 50, centerY: true }), // left-center

    // Skills - entre pilha de itens e mão de itens (lado inferior)
    skillsBottom: posPercent({ x: 70, y: 90, centerX: true, useBottom: true }), // entre pile e items
  };

  const addToLog = useCallback((message, type = "info") => {
    const newEvent = {
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setGameLog((prev) => [...prev, newEvent]);
  }, []);

  // Handlers para ações do jogador - Integrado com MotorDeJogo
  const handleBankCardClick = useCallback(
    (card, index) => {
      if (gameState?.phase !== "acao") {
        addToLog("Não é a fase de ação!");
        return;
      }

      const resultado = onAction?.({
        type: "TROCAR_LENDA",
        data: { card, index },
      });

      if (resultado?.success) {
        addToLog(`${currentPlayer?.nome} trocou para ${card.nome}`);
      } else {
        addToLog(resultado?.error || "Não foi possível trocar lenda");
      }
    },
    [onAction, addToLog, currentPlayer, gameState]
  );

  const handleUseItem = useCallback(
    (item, index) => {
      if (!item) return; // Slot vazio

      if (gameState?.phase !== "acao") {
        addToLog("Não é a fase de ação!");
        return;
      }

      const resultado = onAction?.({
        type: "USAR_ITEM",
        data: { item, index },
      });

      if (resultado?.success) {
        if (item.categoria === "equipamento") {
          addToLog(`${currentPlayer?.nome} equipou ${item.nome}`);
        } else {
          addToLog(`${currentPlayer?.nome} usou ${item.nome}`);
        }
      } else {
        addToLog(resultado?.error || "Não foi possível usar item");
      }
    },
    [onAction, addToLog, currentPlayer, gameState]
  );

  const handleActiveCardClick = useCallback(
    (card) => {
      if (gameState?.phase !== "acao") {
        addToLog("Não é a fase de ação!");
        return;
      }

      // Por padrão, usar habilidade básica (skill1)
      const resultado = onAction?.({
        type: "USAR_HABILIDADE",
        data: { card, habilidadeId: "skill1" },
      });

      if (resultado?.success) {
        addToLog(`${currentPlayer?.nome} usou habilidade de ${card.nome}`);
      } else {
        addToLog(resultado?.error || "Não foi possível usar habilidade");
      }
    },
    [onAction, addToLog, currentPlayer, gameState]
  );

  const handleSkillClick = useCallback(
    (skill) => {
      if (gameState?.phase !== "acao") {
        addToLog("Não é a fase de ação!");
        return;
      }

      if (!skill.disponivel) {
        addToLog(`${skill.nome} não está disponível!`);
        return;
      }

      const resultado = onAction?.({
        type: "USAR_HABILIDADE",
        data: { habilidadeId: skill.id, skill },
      });

      if (resultado?.success) {
        addToLog(`${currentPlayer?.nome} usou ${skill.nome}!`);
      } else {
        addToLog(resultado?.error || `Não foi possível usar ${skill.nome}`);
      }
    },
    [onAction, addToLog, currentPlayer, gameState]
  );

  const handleDrawCard = useCallback(() => {
    // Compra automática acontece na fase de fim de turno
    addToLog("Compra de cartas acontece automaticamente no fim do turno");
  }, [addToLog]);

  const handleEndTurn = useCallback(() => {
    if (gameState?.phase !== "acao") {
      addToLog("Você só pode encerrar o turno na fase de ação!");
      return;
    }

    onEndTurn?.();
    addToLog(`${currentPlayer?.nome} passou o turno`);
  }, [onEndTurn, addToLog, currentPlayer, gameState]);

  // Carregar dados reais dos jogadores da API - SEM FALLBACKS
  const [realCards, setRealCards] = useState({});
  const [loadingCards, setLoadingCards] = useState(true);

  const resolveCard = useCallback(
    (cardInput) => {
      if (!cardInput) return null;

      const lookupByKey = (key) => {
        if (!key) return null;
        const normalized = key.toString().toLowerCase();
        const stripped = normalized
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "");
        return realCards[key] || realCards[normalized] || realCards[stripped];
      };

      if (typeof cardInput === "string") {
        return resolveCard(lookupByKey(cardInput));
      }

      if (
        cardInput.habilidades &&
        Object.keys(cardInput.habilidades).length > 0
      ) {
        return cardInput;
      }

      if (cardInput.abilities && Object.keys(cardInput.abilities).length > 0) {
        return {
          ...mapApiCardToLocal(cardInput),
          ...cardInput,
          habilidades: cardInput.abilities,
        };
      }

      const byId = cardInput.id ? lookupByKey(cardInput.id) : null;
      if (byId) {
        return {
          ...byId,
          ...cardInput,
          habilidades:
            cardInput.habilidades || cardInput.abilities || byId.habilidades,
        };
      }

      const byName = lookupByKey(cardInput.nome || cardInput.name);
      if (byName) {
        return {
          ...byName,
          ...cardInput,
          habilidades:
            cardInput.habilidades || cardInput.abilities || byName.habilidades,
        };
      }

      const mapped = mapApiCardToLocal(cardInput);
      if (mapped) {
        return {
          ...mapped,
          habilidades: mapped.habilidades || {},
        };
      }

      return null;
    },
    [realCards]
  );

  // Carregar cartas reais da API como no museum/cards
  useEffect(() => {
    const loadRealCards = async () => {
      try {
        setLoadingCards(true);
        console.log("🔄 Iniciando carregamento das cartas da API...");

        const response = await cardsAPI.getAll();
        const apiCards = Array.isArray(response)
          ? response
          : Array.isArray(response?.cards)
          ? response.cards
          : [];

        const mappedCards = apiCards
          .map((card) => {
            const localCard = mapApiCardToLocal(card);
            if (!localCard) return null;
            return {
              ...localCard,
              habilidades: localCard.habilidades || card.abilities || {},
            };
          })
          .filter(Boolean);

        const cardsData = {};
        mappedCards.forEach((card) => {
          const possibleKeys = [
            card.id ? card.id.toString() : null,
            card.nome ? card.nome.toLowerCase() : null,
            card.nome
              ? card.nome
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
                  .toLowerCase()
              : null,
          ].filter(Boolean);

          possibleKeys.forEach((key) => {
            if (key && !cardsData[key]) {
              cardsData[key] = card;
            }
          });
        });

        setRealCards(cardsData);
        console.log("✅ Cartas indexadas:", Object.keys(cardsData).length);
      } catch (error) {
        console.error("❌ Erro ao carregar cartas da API:", error);
      } finally {
        setLoadingCards(false);
      }
    };

    loadRealCards();
  }, []);

  const getRealPlayer = (
    playerData,
    defaultName,
    defaultRanking,
    isOpponent = false
  ) => {
    const activeFallback = isOpponent ? "boitata" : "jaci";
    const bankFallback = isOpponent
      ? ["curupira", "iara", "cuca", "boto"]
      : ["curupira", "iara", "cuca", "boto"];

    const zonasOriginais = playerData?.zonas || {};

    const allAvailableCards = Object.values(realCards);

    let activeCard =
      resolveCard(zonasOriginais[ZONAS_CAMPO.LENDA_ATIVA]) ||
      resolveCard(activeFallback);
    if (!activeCard) {
      activeCard = allAvailableCards[0] || null;
    }

    const bancoOrigem = Array.isArray(zonasOriginais[ZONAS_CAMPO.BANCO_LENDAS])
      ? zonasOriginais[ZONAS_CAMPO.BANCO_LENDAS]
      : bankFallback;
    let bankCards = bancoOrigem.map(resolveCard).filter(Boolean);

    if (bankCards.length === 0 && allAvailableCards.length > 1) {
      bankCards = allAvailableCards
        .filter((card) => !activeCard || card.id !== activeCard.id)
        .slice(0, 4);
    }

    const maoOrigem = Array.isArray(zonasOriginais[ZONAS_CAMPO.MAO_ITENS])
      ? zonasOriginais[ZONAS_CAMPO.MAO_ITENS]
      : [null, null, null];

    return {
      nome: playerData?.nome || defaultName,
      avatar: playerData?.avatar || "/images/avatars/player.jpg",
      ranking: playerData?.ranking || defaultRanking,
      zonas: {
        [ZONAS_CAMPO.LENDA_ATIVA]: activeCard,
        [ZONAS_CAMPO.BANCO_LENDAS]: bankCards,
        [ZONAS_CAMPO.MAO_ITENS]: maoOrigem.map((item) => item ?? null),
        [ZONAS_CAMPO.ITEM_ATIVO]:
          zonasOriginais[ZONAS_CAMPO.ITEM_ATIVO] || null,
        [ZONAS_CAMPO.PILHA_ITENS]:
          zonasOriginais[ZONAS_CAMPO.PILHA_ITENS] || [],
      },
    };
  };

  const realCurrentPlayer = getRealPlayer(
    currentPlayer,
    "Jogador 1",
    "Bronze II",
    false
  );
  const realOpponent = getRealPlayer(opponent, "Oponente", "Prata I", true);

  // Se ainda estiver carregando cartas reais da API, mostrar loading
  if (cardsLoading || loadingCards) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <div className="text-white text-lg font-bold">
            Carregando Cartas Reais da API...
          </div>
          <div className="text-yellow-400 text-sm mt-2">
            Buscando habilidades autênticas
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-blue-900 via-purple-900 to-indigo-900 overflow-hidden flex items-center justify-center">
      {/* Stage 16:9 centralizado */}
      <div
        className="relative"
        style={{
          width: "min(100vw, calc(100vh * 16 / 9))",
          height: "min(100vh, calc(100vw * 9 / 16))",
        }}
      >
        {/* Background do campo de batalha dentro do stage */}
        <div className="absolute inset-0">
          <Image
            src="/images/playmat.svg"
            alt="Campo de batalha"
            fill
            className="object-cover opacity-20"
            priority
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30" />
        </div>

        {/* Divisória central */}
        <div
          className="absolute left-0 right-0"
          style={{ top: "50%", height: "2px" }}
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60" />
        </div>
        <div
          className="absolute bg-black/80 px-6 py-2 rounded-full border border-yellow-400/70 shadow-lg"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <span className="text-yellow-400 text-sm font-bold">
            ⚔️ CAMPO DE BATALHA ⚔️
          </span>
        </div>

        {/* Elementos posicionados exatamente pelo SVG */}
        <PlayerInfo
          player={realCurrentPlayer}
          position="bottom"
          posStyle={POS.playerBottom}
          isCurrentPlayer={true}
        />
        <BankCards
          cards={realCurrentPlayer.zonas[ZONAS_CAMPO.BANCO_LENDAS]}
          position="bottom"
          posStyle={POS.bankBottom}
          onClick={handleBankCardClick}
        />
        <HandItems
          items={realCurrentPlayer.zonas[ZONAS_CAMPO.MAO_ITENS]}
          position="bottom"
          posStyle={POS.itemsBottom}
          onUseItem={handleUseItem}
        />
        <ActiveCard
          card={realCurrentPlayer.zonas[ZONAS_CAMPO.LENDA_ATIVA]}
          position="bottom"
          posStyle={POS.activeBottom}
          onClick={handleActiveCardClick}
          itemAtivo={realCurrentPlayer.zonas[ZONAS_CAMPO.ITEM_ATIVO] || null}
        />
        <CardStack
          count={realCurrentPlayer.zonas[ZONAS_CAMPO.PILHA_ITENS].length || 18}
          position="bottom"
          posStyle={POS.pileBottom}
          onClick={handleDrawCard}
        />

        {/* Habilidades da carta ativa (lado inferior) */}
        <CardSkills
          card={realCurrentPlayer.zonas[ZONAS_CAMPO.LENDA_ATIVA]}
          onSkillClick={handleSkillClick}
          posStyle={POS.skillsBottom}
        />

        {/* Lado do oponente (topo) */}
        <PlayerInfo
          player={realOpponent}
          position="top"
          posStyle={POS.playerTop}
        />
        <BankCards
          cards={realOpponent.zonas[ZONAS_CAMPO.BANCO_LENDAS]}
          position="top"
          posStyle={POS.bankTop}
        />
        <HandItems
          items={realOpponent.zonas[ZONAS_CAMPO.MAO_ITENS]}
          position="top"
          posStyle={POS.itemsTop}
        />
        <ActiveCard
          card={realOpponent.zonas[ZONAS_CAMPO.LENDA_ATIVA]}
          position="top"
          posStyle={POS.activeTop}
          itemAtivo={realOpponent.zonas[ZONAS_CAMPO.ITEM_ATIVO] || null}
        />
        <CardStack
          count={realOpponent.zonas[ZONAS_CAMPO.PILHA_ITENS].length || 15}
          position="top"
          posStyle={POS.pileTop}
        />

        {/* Controles do Turno */}
        <div className="absolute z-20" style={POS.endTurn}>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleEndTurn}
              disabled={gameState?.phase !== "acao"}
              className={`px-10 py-4 text-white font-bold text-lg rounded-xl border-2 shadow-xl transition-all hover:scale-105 hover:shadow-2xl ${
                gameState?.phase === "acao"
                  ? "bg-blue-600 hover:bg-blue-700 border-blue-400"
                  : "bg-gray-600 border-gray-500 cursor-not-allowed opacity-50"
              }`}
            >
              <Icon name="check" size={18} className="inline mr-2" />
              {gameState?.phase === "acao" ? "PASSAR TURNO" : "AGUARDE..."}
            </button>

            <button
              onClick={() => {
                if (confirm("Tem certeza que deseja desistir da partida?")) {
                  onAction?.({ type: "DESISTIR" });
                }
              }}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg border border-red-400 shadow-lg transition-all hover:scale-105"
            >
              🏳️ DESISTIR
            </button>
          </div>
        </div>

        {/* Log de Eventos */}
        <GameLog events={gameLog} posStyle={POS.log} />

        {/* Informações da fase atual */}
        <div className="absolute z-30" style={POS.phase}>
          <div className="bg-black/90 text-white px-6 py-3 rounded-xl border-2 border-yellow-400 shadow-xl">
            <div className="text-center">
              <div className="text-yellow-400 font-bold text-lg">
                {gameState?.phase === "inicio" && "⚡ FASE 1: INÍCIO"}
                {gameState?.phase === "acao" && "⚔️ FASE 2: AÇÃO"}
                {gameState?.phase === "resolucao" && "💥 FASE 3: RESOLUÇÃO"}
                {gameState?.phase === "fim_turno" && "🔄 FASE 4: FIM DO TURNO"}
                {!gameState?.phase && "⚔️ FASE 2: AÇÃO"}
              </div>
              <div className="text-sm text-gray-300">
                Turno {gameState?.turn || 1} - {realCurrentPlayer.nome}
              </div>
              {gameState?.phase === "acao" && (
                <div className="text-xs text-yellow-200 mt-1">
                  Escolha UMA ação
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
