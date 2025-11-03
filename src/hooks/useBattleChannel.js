import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hook para comunicação em tempo real durante a batalha via Supabase Realtime Channels
 * 
 * @param {string} roomId - ID da sala de batalha
 * @param {string} playerId - ID do jogador atual
 * @param {Function} onAction - Callback para ações recebidas do oponente
 * @returns {Object} { sendAction, isConnected, error }
 */
export function useBattleChannel(roomId, playerId, onAction) {
  const channelRef = useRef(null);
  const isConnectedRef = useRef(false);

  /**
   * Enviar ação para o oponente
   * @param {string} type - Tipo de ação (USE_SKILL, SWITCH_LEGEND, END_TURN, USE_RELIC, USE_ITEM)
   * @param {Object} payload - Dados da ação
   */
  const sendAction = useCallback((type, payload) => {
    if (!channelRef.current || !isConnectedRef.current) {
      console.warn('[BattleChannel] Canal não conectado, ação não enviada:', type);
      return false;
    }

    const action = {
      type,
      payload,
      playerId,
      timestamp: new Date().toISOString()
    };

    console.log('[BattleChannel] Enviando ação:', action);

    channelRef.current.send({
      type: 'broadcast',
      event: 'battle_action',
      payload: action
    });

    return true;
  }, [playerId]);

  useEffect(() => {
    if (!roomId || !playerId) {
      console.warn('[BattleChannel] roomId ou playerId ausente');
      return;
    }

    // Criar canal único para a sala
    const channelName = `battle:${roomId}`;
    console.log('[BattleChannel] Conectando ao canal:', channelName);

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false }, // Não receber próprias mensagens
        presence: { key: playerId }
      }
    });

    // Listener para ações de batalha
    channel
      .on('broadcast', { event: 'battle_action' }, ({ payload }) => {
        console.log('[BattleChannel] Ação recebida:', payload);
        
        // Ignorar ações do próprio jogador
        if (payload.playerId === playerId) {
          return;
        }

        // Executar callback com a ação do oponente
        if (onAction) {
          onAction(payload);
        }
      })
      .subscribe((status) => {
        console.log('[BattleChannel] Status da subscrição:', status);
        
        if (status === 'SUBSCRIBED') {
          isConnectedRef.current = true;
          console.log('[BattleChannel] Conectado com sucesso!');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          isConnectedRef.current = false;
          console.error('[BattleChannel] Erro na conexão:', status);
        } else if (status === 'CLOSED') {
          isConnectedRef.current = false;
          console.log('[BattleChannel] Canal fechado');
        }
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      console.log('[BattleChannel] Desconectando do canal');
      isConnectedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [roomId, playerId, onAction]);

  return {
    sendAction,
    isConnected: isConnectedRef.current,
    error: null
  };
}
