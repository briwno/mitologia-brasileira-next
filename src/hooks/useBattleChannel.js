import { useState, useCallback } from 'react';
import usePartySocket from 'partysocket/react';

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || "localhost:1999";

/**
 * Hook para comunicação em tempo real durante a batalha via PartyKit
 * 
 * @param {string} roomId - ID da sala de batalha
 * @param {string} playerId - ID do jogador atual
 * @param {Function} onAction - Callback para ações recebidas do oponente
 * @returns {Object} { sendAction, isConnected, opponentConnected, error }
 */
export function useBattleChannel(roomId, playerId, onAction) {
  const [opponentConnected, setOpponentConnected] = useState(false);

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: roomId || "lobby",
    onOpen() {
      console.log("[BattleChannel] Conectado ao PartyKit");
      if (playerId) {
        // Identificar jogador (opcional, dependendo da lógica do servidor)
        socket.send(JSON.stringify({
          type: 'IDENTIFY',
          payload: { userId: playerId }
        }));
      }
    },
    onMessage(event) {
      try {
        const data = JSON.parse(event.data);
        console.log("[BattleChannel] Mensagem recebida:", data);

        if (data.type === 'BATTLE_ACTION') {
          const action = data.payload;
          // Ignorar ações do próprio jogador (embora o servidor já deva filtrar)
          if (action.playerId !== playerId && onAction) {
            onAction(action);
          }
        } else if (data.type === 'PRESENCE_UPDATE') {
          // Se houver mais de 1 conexão, assumimos que o oponente está lá
          // (Simplificação, idealmente verificaríamos IDs únicos)
          setOpponentConnected(data.payload.count > 1);
        }
      } catch (err) {
        console.error("[BattleChannel] Erro ao processar mensagem:", err);
      }
    }
  });

  /**
   * Enviar ação para o oponente
   * @param {string} type - Tipo de ação (USE_SKILL, SWITCH_LEGEND, END_TURN, USE_RELIC, USE_ITEM)
   * @param {Object} payload - Dados da ação
   */
  const sendAction = useCallback((type, payload) => {
    if (!socket || socket.readyState !== 1) { // WebSocket.OPEN === 1
      console.warn('[BattleChannel] Socket não conectado ou indisponível');
      return false;
    }

    const action = {
      type,
      payload,
      playerId,
      timestamp: new Date().toISOString()
    };

    console.log('[BattleChannel] Enviando ação:', action);

    try {
      socket.send(JSON.stringify({
        type: 'BROADCAST_ACTION',
        payload: action
      }));
    } catch (err) {
      console.error('[BattleChannel] Erro ao enviar ação:', err);
      return false;
    }

    return true;
  }, [socket, playerId]);

  return {
    sendAction,
    isConnected: socket.readyState === 1,
    opponentConnected,
    error: null
  };
}
