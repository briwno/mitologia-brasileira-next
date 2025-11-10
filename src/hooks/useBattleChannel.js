import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hook para comunicação em tempo real durante a batalha via Supabase Realtime Channels
 * 
 * @param {string} roomId - ID da sala de batalha
 * @param {string} playerId - ID do jogador atual
 * @param {Function} onAction - Callback para ações recebidas do oponente
 * @returns {Object} { sendAction, isConnected, opponentConnected, error }
 */
export function useBattleChannel(roomId, playerId, onAction) {
  const channelRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [opponentConnected, setOpponentConnected] = useState(false);

  /**
   * Enviar ação para o oponente
   * @param {string} type - Tipo de ação (USE_SKILL, SWITCH_LEGEND, END_TURN, USE_RELIC, USE_ITEM)
   * @param {Object} payload - Dados da ação
   */
  const sendAction = useCallback((type, payload) => {
    if (!channelRef.current || !isConnected) {
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
  }, [playerId, isConnected]);

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

    // Listener para presença (detecção de conexão/desconexão)
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const presenceKeys = Object.keys(state);
        console.log('[BattleChannel] Presença sincronizada:', presenceKeys);
        
        // Verificar se há oponente conectado (outro playerId além do nosso)
        const opponentPresent = presenceKeys.some(key => key !== playerId);
        setOpponentConnected(opponentPresent);
        
        if (opponentPresent) {
          console.log('[BattleChannel] ✅ Oponente está conectado!');
        } else {
          console.log('[BattleChannel] ⏳ Aguardando oponente conectar...');
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('[BattleChannel] Jogador entrou:', key, newPresences);
        if (key !== playerId) {
          setOpponentConnected(true);
          console.log('[BattleChannel] ✅ Oponente conectou!');
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('[BattleChannel] Jogador saiu:', key, leftPresences);
        if (key !== playerId) {
          setOpponentConnected(false);
          console.log('[BattleChannel] ⚠️ Oponente desconectou!');
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
          setIsConnected(true);
          console.log('[BattleChannel] ✅ Conectado ao canal de batalha!');
          
          // Rastrear presença após conexão bem-sucedida
          channel.track({ 
            online_at: new Date().toISOString(),
            playerId 
          });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false);
          console.error('[BattleChannel] ❌ Erro na conexão:', status);
        } else if (status === 'CLOSED') {
          setIsConnected(false);
          setOpponentConnected(false);
          console.log('[BattleChannel] Canal fechado');
        }
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      console.log('[BattleChannel] Desconectando do canal');
      setIsConnected(false);
      setOpponentConnected(false);
      
      if (channel) {
        channel.untrack();
        supabase.removeChannel(channel);
      }
    };
  }, [roomId, playerId, onAction]);

  return {
    sendAction,
    isConnected,
    opponentConnected,
    error: null
  };
}
