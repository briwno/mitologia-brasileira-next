// src/components/Game/BattleScreen.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Icon from '@/components/UI/Icon';
import BattleCard from './BattleCard';
import { ZONAS_CAMPO, FASES_DO_JOGO, CONSTANTES_DO_JOGO } from '@/utils/constants';
import { MotorDeJogo } from '@/utils/gameLogic';

// Componente para exibir informações do jogador
function PlayerInfo({ player, position = 'bottom', isCurrentPlayer = false }) {
  const positionClasses = position === 'bottom' 
    ? 'bottom-4 left-4' 
    : 'top-4 right-4';

  return (
    <div className={`absolute ${positionClasses} z-20`}>
      <div className="bg-orange-500/90 rounded-lg p-3 border border-orange-400 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 border-2 border-orange-300">
            <Image
              src={player.avatar || '/images/avatars/player.jpg'}
              alt={`Avatar de ${player.nome}`}
              width={48}
              height={48}
              className="object-cover"
              quality={90}
            />
          </div>
          <div>
            <div className="text-white font-bold text-sm">{player.nome}</div>
            <div className="text-orange-100 text-xs">
              {player.ranking || 'Iniciante'}
            </div>

          </div>
        </div>
        {position === 'bottom' && (
          <button className="mt-2 px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-white text-xs">
            <Icon name="smile" size={12} className="inline mr-1" />
            Emote
          </button>
        )}
      </div>
    </div>
  );
}

// Componente para cartas no banco
function BankCards({ cards, position = 'bottom', onClick }) {
  const positionClasses = position === 'bottom' 
    ? 'bottom-4 left-20' 
    : 'top-4 right-20';

  return (
    <div className={`absolute ${positionClasses} z-10`}>
      <div className="flex gap-2">
        {[...Array(4)].map((_, index) => {
          const card = cards[index];
          return (
            <BattleCard
              key={index}
              card={card}
              size="small"
              type="lenda"
              showStats={false}
              onClick={(selectedCard) => onClick?.(selectedCard, index)}
            />
          );
        })}
      </div>
      {position === 'bottom' && (
        <div className="text-white text-xs mt-1 text-center bg-black/50 px-2 py-1 rounded">
          BANCO DE CARTAS
        </div>
      )}
    </div>
  );
}

// Componente para cartas de itens na mão
function HandItems({ items, position = 'bottom', onUseItem }) {
  const positionClasses = position === 'bottom' 
    ? 'bottom-4 left-1/2 -translate-x-1/2' 
    : 'top-4 left-1/2 -translate-x-1/2';

  return (
    <div className={`absolute ${positionClasses} z-10`}>
      <div className="flex gap-2">
        {[...Array(3)].map((_, index) => {
          const item = items[index];
          return (
            <div key={index} className="flex flex-col items-center">
              <BattleCard
                card={item}
                size="medium"
                type="item"
                showStats={false}
                onClick={(selectedItem) => onUseItem?.(selectedItem, index)}
                className={!item ? "text-gray-500" : ""}
              />
              {position === 'bottom' && (
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
function ActiveCard({ card, position = 'bottom', onClick, itemAtivo = null }) {
  const positionClasses = position === 'bottom' 
    ? 'bottom-20 left-1/2 -translate-x-1/2' 
    : 'top-20 left-1/2 -translate-x-1/2';

  return (
    <div className={`absolute ${positionClasses} z-15`}>
      <div className="flex items-center justify-center gap-4">
        {/* Carta Ativa */}
        <div className="flex flex-col items-center">
          <BattleCard
            card={card}
            size="large"
            type="lenda"
            isActive={true}
            showStats={true}
            onClick={onClick}
          />
          {position === 'bottom' && (
            <div className="text-white text-xs mt-1 bg-black/50 px-2 py-1 rounded">
              CARTA ATIVA
            </div>
          )}
        </div>

        {/* Item Ativo */}
        {itemAtivo && (
          <div className="flex flex-col items-center">
            <BattleCard
              card={itemAtivo}
              size="medium"
              type="item"
              showStats={false}
              isClickable={false}
              className="border-orange-400 bg-orange-600"
            />
            {position === 'bottom' && (
              <div className="text-white text-xs mt-1 bg-black/50 px-2 py-1 rounded">
                ITEM ATIVO
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para pilha de cartas
function CardStack({ count, position = 'bottom', onClick }) {
  const positionClasses = position === 'bottom' 
    ? 'bottom-4 right-4' 
    : 'top-4 left-4';

  return (
    <div className={`absolute ${positionClasses} z-10`}>
      <div className="flex flex-col items-center">
        <div
          className="w-16 h-24 bg-green-700 border-2 border-green-500 rounded-lg cursor-pointer hover:scale-105 transition-all relative overflow-hidden"
          onClick={onClick}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <Icon name="layers" size={16} />
            <div className="text-xs font-bold mt-1">{count}</div>
          </div>
          {/* Efeito de cartas empilhadas */}
          <div className="absolute -top-1 -right-1 w-16 h-24 bg-green-600 border-2 border-green-400 rounded-lg -z-10" />
          <div className="absolute -top-2 -right-2 w-16 h-24 bg-green-500 border-2 border-green-300 rounded-lg -z-20" />
        </div>
        {position === 'bottom' && (
          <div className="text-white text-xs mt-1 bg-black/50 px-2 py-1 rounded">
            PILHA DE ITENS
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para log de eventos
function GameLog({ events }) {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
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
  mode = 'pvp' 
}) {
  const [gameLog, setGameLog] = useState([]);

  const addToLog = useCallback((message, type = 'info') => {
    const newEvent = {
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setGameLog(prev => [...prev, newEvent]);
  }, []);

  // Handlers para ações do jogador
  const handleBankCardClick = useCallback((card, index) => {
    onAction?.({
      type: 'TROCAR_LENDA',
      data: { card, index }
    });
    addToLog(`Tentativa de trocar para ${card.nome}`);
  }, [onAction, addToLog]);

  const handleUseItem = useCallback((item, index) => {
    onAction?.({
      type: 'USAR_ITEM',
      data: { item, index }
    });
    addToLog(`${currentPlayer?.nome} usou ${item.nome}`);
  }, [onAction, addToLog, currentPlayer]);

  const handleActiveCardClick = useCallback((card) => {
    onAction?.({
      type: 'USAR_HABILIDADE',
      data: { card }
    });
    addToLog(`${currentPlayer?.nome} ativou habilidade de ${card.nome}`);
  }, [onAction, addToLog, currentPlayer]);

  const handleDrawCard = useCallback(() => {
    onAction?.({
      type: 'COMPRAR_ITEM'
    });
    addToLog(`${currentPlayer?.nome} comprou uma carta`);
  }, [onAction, addToLog, currentPlayer]);

  const handleEndTurn = useCallback(() => {
    onEndTurn?.();
    addToLog(`${currentPlayer?.nome} encerrou o turno`);
  }, [onEndTurn, addToLog, currentPlayer]);

  // Garantir estrutura válida para currentPlayer
  const mockCurrentPlayer = {
    nome: currentPlayer?.nome || 'Jogador 1',
    avatar: currentPlayer?.avatar || '/images/avatars/player.jpg',
    ranking: currentPlayer?.ranking || 'Bronze II',
    zonas: {
      [ZONAS_CAMPO.LENDA_ATIVA]: currentPlayer?.zonas?.[ZONAS_CAMPO.LENDA_ATIVA] || {
        nome: 'Saci-Pererê',
        imagem: '/images/cards/portraits/saci.jpg',
        ataque: 5,
        defesa: 3
      },
      [ZONAS_CAMPO.BANCO_LENDAS]: currentPlayer?.zonas?.[ZONAS_CAMPO.BANCO_LENDAS] || [
        { nome: 'Curupira', imagem: '/images/cards/portraits/curupira.jpg' },
        { nome: 'Iara', imagem: '/images/cards/portraits/iara.jpg' },
        { nome: 'Cuca', imagem: '/images/cards/portraits/cuca.jpg' },
        { nome: 'Boto', imagem: '/images/cards/portraits/boto.jpg' }
      ],
      [ZONAS_CAMPO.MAO_ITENS]: currentPlayer?.zonas?.[ZONAS_CAMPO.MAO_ITENS] || [
        { nome: 'Poção de Força', imagem: '/images/placeholder.svg' },
        { nome: 'Escudo Mágico', imagem: '/images/placeholder.svg' }
      ],
      [ZONAS_CAMPO.PILHA_ITENS]: currentPlayer?.zonas?.[ZONAS_CAMPO.PILHA_ITENS] || []
    }
  };

  // Garantir estrutura válida para opponent
  const mockOpponent = {
    nome: opponent?.nome || 'Oponente',
    avatar: opponent?.avatar || '/images/avatars/player.jpg',
    ranking: opponent?.ranking || 'Prata I',
    zonas: {
      [ZONAS_CAMPO.LENDA_ATIVA]: opponent?.zonas?.[ZONAS_CAMPO.LENDA_ATIVA] || {
        nome: 'Boitatá',
        imagem: '/images/cards/portraits/boitata.jpg',
        ataque: 6,
        defesa: 4
      },
      [ZONAS_CAMPO.BANCO_LENDAS]: opponent?.zonas?.[ZONAS_CAMPO.BANCO_LENDAS] || [
        { nome: '???', imagem: null },
        { nome: '???', imagem: null },
        { nome: '???', imagem: null },
        { nome: '???', imagem: null }
      ],
      [ZONAS_CAMPO.MAO_ITENS]: opponent?.zonas?.[ZONAS_CAMPO.MAO_ITENS] || [
        { nome: '???', imagem: null }
      ],
      [ZONAS_CAMPO.PILHA_ITENS]: opponent?.zonas?.[ZONAS_CAMPO.PILHA_ITENS] || []
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
      {/* Background do campo de batalha */}
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
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 px-6 py-2 rounded-full border border-yellow-400/70 shadow-lg">
        <span className="text-yellow-400 text-sm font-bold">⚔️ CAMPO DE BATALHA ⚔️</span>
      </div>

      {/* Área do Jogador (inferior) */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2">
        <PlayerInfo 
          player={mockCurrentPlayer} 
          position="bottom" 
          isCurrentPlayer={true}
        />
        <BankCards 
          cards={mockCurrentPlayer.zonas[ZONAS_CAMPO.BANCO_LENDAS]} 
          position="bottom"
          onClick={handleBankCardClick}
        />
        <HandItems 
          items={mockCurrentPlayer.zonas[ZONAS_CAMPO.MAO_ITENS]} 
          position="bottom"
          onUseItem={handleUseItem}
        />
        <ActiveCard 
          card={mockCurrentPlayer.zonas[ZONAS_CAMPO.LENDA_ATIVA]} 
          position="bottom"
          onClick={handleActiveCardClick}
        />
        <CardStack 
          count={mockCurrentPlayer.zonas[ZONAS_CAMPO.PILHA_ITENS].length || 18} 
          position="bottom"
          onClick={handleDrawCard}
        />
        
        {/* Botão Encerrar Turno */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={handleEndTurn}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl border-2 border-blue-400 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            <Icon name="check" size={18} className="inline mr-2" />
            ENCERRAR TURNO
          </button>
        </div>
      </div>

      {/* Área do Adversário (superior) */}
      <div className="absolute top-0 left-0 right-0 h-1/2">
        <PlayerInfo 
          player={mockOpponent} 
          position="top"
        />
        <BankCards 
          cards={mockOpponent.zonas[ZONAS_CAMPO.BANCO_LENDAS]} 
          position="top"
        />
        <HandItems 
          items={mockOpponent.zonas[ZONAS_CAMPO.MAO_ITENS]} 
          position="top"
        />
        <ActiveCard 
          card={mockOpponent.zonas[ZONAS_CAMPO.LENDA_ATIVA]} 
          position="top"
        />
        <CardStack 
          count={mockOpponent.zonas[ZONAS_CAMPO.PILHA_ITENS].length || 15} 
          position="top"
        />
      </div>

      {/* Log de Eventos */}
      <GameLog events={gameLog} />

      {/* Informações da fase atual */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
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
  );
}