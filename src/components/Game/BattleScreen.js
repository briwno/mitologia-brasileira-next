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
                  {["😀", "😃", "😄", "😁", "😆", "🤔", "😎", "🥳", "😤", "💪"].map((emoji) => (
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
                onClick={item ? (selectedItem) => onUseItem?.(selectedItem, index) : undefined}
                className={`w-20 h-28 ${!item ? "opacity-30 border-dashed border-2 border-gray-400" : ""}`}
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


// Componente para a carta ativa em campo
function ActiveCard({
  card,
  position = "bottom",
  onClick,
  itemAtivo = null,
  posStyle,
}) {
  const positionClasses = posStyle
    ? "z-15"
    : position === "bottom";

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
        <div className="absolute top-1 left-1 w-26 h-34 bg-green-600 border-2 border-green-500 rounded-lg opacity-100 rotate-20" />
        <div className="absolute top-1 left-1 w-26 h-34 bg-green-600 border-2 border-green-500 rounded-lg opacity-100 -rotate-20" />
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
  const { loading: cardsLoading, error: cardsError, getPlayerData } = useGameCards();

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
    playerBottom: posPercent({ x: 6, y: 92, useBottom: true }), // bottom-left
    bankBottom: posPercent({ x: 16, y: 92, useBottom: true }), // bottom-left row
    itemsBottom: posPercent({ x: 50, y: 95, centerX: true, useBottom: true }), // bottom-center row
    activeBottom: posPercent({ x: 50, y: 65, centerX: true, centerY: true }), // centered
    pileBottom: posPercent({ x: 93, y: 90, useRight: true, useBottom: true }), // bottom-right

    // top side (mirrored)
    playerTop: posPercent({ x: 94, y: 8, useRight: true }), // top-right
    bankTop: posPercent({ x: 84, y: 10, useRight: true }), // top-right row
    itemsTop: posPercent({ x: 50, y: 5, centerX: true }), // top-center row
    activeTop: posPercent({ x: 50, y: 23.5    , centerX: true }), // top-center
    pileTop: posPercent({ x: 7, y: 10 }), // top-left

    // UI
    log: posPercent({ x: 96, y: 50, centerY: true, useRight: true }), // right-center
    phase: posPercent({ x: 25, y: 10, centerX: true }), // top-center
    endTurn: posPercent({ x: 7, y: 50, centerY: true }), // left-center
  };

  const addToLog = useCallback((message, type = "info") => {
    const newEvent = {
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setGameLog((prev) => [...prev, newEvent]);
  }, []);

  // Handlers para ações do jogador
  const handleBankCardClick = useCallback(
    (card, index) => {
      onAction?.({
        type: "TROCAR_LENDA",
        data: { card, index },
      });
      addToLog(`Tentativa de trocar para ${card.nome}`);
    },
    [onAction, addToLog]
  );

  const handleUseItem = useCallback(
    (item, index) => {
      onAction?.({
        type: "USAR_ITEM",
        data: { item, index },
      });
      addToLog(`${currentPlayer?.nome} usou ${item.nome}`);
    },
    [onAction, addToLog, currentPlayer]
  );

  const handleActiveCardClick = useCallback(
    (card) => {
      onAction?.({
        type: "USAR_HABILIDADE",
        data: { card },
      });
      addToLog(`${currentPlayer?.nome} ativou habilidade de ${card.nome}`);
    },
    [onAction, addToLog, currentPlayer]
  );

  const handleDrawCard = useCallback(() => {
    onAction?.({
      type: "COMPRAR_ITEM",
    });
    addToLog(`${currentPlayer?.nome} comprou uma carta`);
  }, [onAction, addToLog, currentPlayer]);

  const handleEndTurn = useCallback(() => {
    onEndTurn?.();
    addToLog(`${currentPlayer?.nome} encerrou o turno`);
  }, [onEndTurn, addToLog, currentPlayer]);

  // Carregar dados reais dos jogadores da API ou usar fallback mock
  const getRealOrMockPlayer = (playerData, defaultName, defaultRanking, isOpponent = false) => {
    // Se temos dados do hook e não está carregando
    if (!cardsLoading && !cardsError && getPlayerData) {
      const realPlayerData = getPlayerData(
        playerData?.nome || defaultName, 
        playerData?.avatar || "/images/avatars/player.jpg",
        playerData?.ranking || defaultRanking
      );
      
      if (realPlayerData) {
        return {
          ...realPlayerData,
          zonas: {
            [ZONAS_CAMPO.LENDA_ATIVA]: playerData?.zonas?.[ZONAS_CAMPO.LENDA_ATIVA] || realPlayerData.zonas.LENDA_ATIVA,
            [ZONAS_CAMPO.BANCO_LENDAS]: playerData?.zonas?.[ZONAS_CAMPO.BANCO_LENDAS] || realPlayerData.zonas.BANCO_LENDAS,
            [ZONAS_CAMPO.MAO_ITENS]: playerData?.zonas?.[ZONAS_CAMPO.MAO_ITENS] || realPlayerData.zonas.MAO_ITENS,
            [ZONAS_CAMPO.PILHA_ITENS]: playerData?.zonas?.[ZONAS_CAMPO.PILHA_ITENS] || realPlayerData.zonas.PILHA_ITENS,
          }
        };
      }
    }

    // Fallback para dados mock se API não disponível
    return {
      nome: playerData?.nome || defaultName,
      avatar: playerData?.avatar || "/images/avatars/player.jpg",
      ranking: playerData?.ranking || defaultRanking,
      zonas: {
        [ZONAS_CAMPO.LENDA_ATIVA]: playerData?.zonas?.[ZONAS_CAMPO.LENDA_ATIVA] || {
          nome: isOpponent ? "Boitatá" : "Jaci",
          imagem: isOpponent ? "/images/cards/portraits/boitata.jpg" : "/images/cards/portraits/jaci.png",
          ataque: isOpponent ? 6 : 5,
          defesa: isOpponent ? 4 : 3,
        },
        [ZONAS_CAMPO.BANCO_LENDAS]: playerData?.zonas?.[ZONAS_CAMPO.BANCO_LENDAS] || (
          isOpponent ? [
            { nome: "???", imagem: null },
            { nome: "???", imagem: null },
            { nome: "???", imagem: null },
            { nome: "???", imagem: null },
          ] : [
            { nome: "Curupira", imagem: "/images/cards/portraits/curupira.jpg" },
            { nome: "Iara", imagem: "/images/cards/portraits/iara.jpg" },
            { nome: "Cuca", imagem: "/images/cards/portraits/cuca.jpg" },
            { nome: "Boto", imagem: "/images/cards/portraits/boto.jpg" },
          ]
        ),
        [ZONAS_CAMPO.MAO_ITENS]: playerData?.zonas?.[ZONAS_CAMPO.MAO_ITENS] || (
          isOpponent ? [
            { nome: "???", imagem: null },
            null,
            null,
          ] : [
            { nome: "Poção de Força", imagem: "/images/placeholder.svg" },
            { nome: "Escudo Mágico", imagem: "/images/placeholder.svg" },
            null, // terceiro slot vazio
          ]
        ),
        [ZONAS_CAMPO.ITEM_ATIVO]: playerData?.zonas?.[ZONAS_CAMPO.ITEM_ATIVO] || (
          isOpponent ? null : { nome: "Amuleto de Proteção", imagem: "/images/placeholder.svg" }
        ),
        [ZONAS_CAMPO.PILHA_ITENS]: playerData?.zonas?.[ZONAS_CAMPO.PILHA_ITENS] || [],
      },
    };
  };

  const mockCurrentPlayer = getRealOrMockPlayer(currentPlayer, "Jogador 1", "Bronze II", false);
  const mockOpponent = getRealOrMockPlayer(opponent, "Oponente", "Prata I", true);

  // Se ainda estiver carregando cartas, mostrar loading
  if (cardsLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <div className="text-white text-lg font-bold">Carregando Cartas de Alta Qualidade...</div>
          <div className="text-yellow-400 text-sm mt-2">Preparando o campo de batalha</div>
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
          player={mockCurrentPlayer}
          position="bottom"
          posStyle={POS.playerBottom}
          isCurrentPlayer={true}
        />
        <BankCards
          cards={mockCurrentPlayer.zonas[ZONAS_CAMPO.BANCO_LENDAS]}
          position="bottom"
          posStyle={POS.bankBottom}
          onClick={handleBankCardClick}
        />
        <HandItems
          items={mockCurrentPlayer.zonas[ZONAS_CAMPO.MAO_ITENS]}
          position="bottom"
          posStyle={POS.itemsBottom}
          onUseItem={handleUseItem}
        />
        <ActiveCard
          card={mockCurrentPlayer.zonas[ZONAS_CAMPO.LENDA_ATIVA]}
          position="bottom"
          posStyle={POS.activeBottom}
          onClick={handleActiveCardClick}
          itemAtivo={mockCurrentPlayer.zonas[ZONAS_CAMPO.ITEM_ATIVO] || null}
        />
        <CardStack
          count={mockCurrentPlayer.zonas[ZONAS_CAMPO.PILHA_ITENS].length || 18}
          position="bottom"
          posStyle={POS.pileBottom}
          onClick={handleDrawCard}
        />

        {/* Lado do oponente (topo) */}
        <PlayerInfo
          player={mockOpponent}
          position="top"
          posStyle={POS.playerTop}
        />
        <BankCards
          cards={mockOpponent.zonas[ZONAS_CAMPO.BANCO_LENDAS]}
          position="top"
          posStyle={POS.bankTop}
        />
        <HandItems
          items={mockOpponent.zonas[ZONAS_CAMPO.MAO_ITENS]}
          position="top"
          posStyle={POS.itemsTop}
        />
        <ActiveCard
          card={mockOpponent.zonas[ZONAS_CAMPO.LENDA_ATIVA]}
          position="top"
          posStyle={POS.activeTop}
          itemAtivo={mockOpponent.zonas[ZONAS_CAMPO.ITEM_ATIVO] || null}
        />
        <CardStack
          count={mockOpponent.zonas[ZONAS_CAMPO.PILHA_ITENS].length || 15}
          position="top"
          posStyle={POS.pileTop}
        />

        {/* Botão Encerrar Turno */}
        <div className="absolute z-20" style={POS.endTurn}>
          <button
            onClick={handleEndTurn}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl border-2 border-blue-400 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            <Icon name="check" size={18} className="inline mr-2" />
            ENCERRAR TURNO
          </button>
        </div>

        {/* Log de Eventos */}
        <GameLog events={gameLog} posStyle={POS.log} />

        {/* Informações da fase atual */}
        <div className="absolute z-30" style={POS.phase}>
          <div className="bg-black/90 text-white px-6 py-3 rounded-xl border-2 border-yellow-400 shadow-xl">
            <div className="text-center">
              <div className="text-yellow-400 font-bold text-lg">
                {gameState?.fase || FASES_DO_JOGO.ACAO}
              </div>
              <div className="text-sm text-gray-300">
                Turno {gameState?.turn || 1} - {mockCurrentPlayer.nome}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
