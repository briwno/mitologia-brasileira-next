import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import usePartySocket from 'partysocket/react';

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || "mitologia-brasileira-party.briwno.partykit.dev";

/**
 * Hook para sincronizar estado da partida em tempo real via PartyKit (com persistência no Supabase)
 * Monitora mudanças na partida (status, turnos, etc)
 * 
 * @param {string} roomId - ID da sala/match
 * @param {Function} onMatchUpdate - Callback quando a partida é atualizada
 * @returns {Object} { match, updateMatch, loading, error }
 */
export function useMatchRealtime(roomId, onMatchUpdate) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: roomId || "lobby",
    onMessage(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'SYNC_STATE' && data.payload.match) {
          console.log('[MatchRealtime] Recebido SYNC_STATE via PartyKit:', data.payload.match);
          setMatch(data.payload.match);
          if (onMatchUpdate) {
            onMatchUpdate(data.payload.match);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('[MatchRealtime] Erro ao processar mensagem do PartyKit:', err);
      }
    }
  });

  /**
   * Atualizar dados da partida no banco e notificar via PartyKit
   * @param {Object} updates - Campos a atualizar
   */
  const updateMatch = useCallback(async (updates) => {
    if (!roomId) {
      console.warn('[MatchRealtime] updateMatch: roomId ausente');
      return null;
    }

    const nowIso = new Date().toISOString();
    const payload = { ...updates };

    if (!Object.prototype.hasOwnProperty.call(payload, 'last_activity_at')) {
      payload.last_activity_at = nowIso;
    }

    if (!Object.prototype.hasOwnProperty.call(payload, 'updated_at')) {
      payload.updated_at = nowIso;
    }

    console.log('[MatchRealtime] Atualizando match:', { roomId, payload });

    try {
      // 1. Atualizar no Supabase (Persistência)
      const { data, error: updateError } = await supabase
        .from('matches')
        .update(payload)
        .eq('room_id', roomId)
        .select()
        .single();

      if (updateError) {
        console.error('[MatchRealtime] Erro do Supabase:', updateError);
        throw updateError;
      }

      if (!data) {
        console.warn('[MatchRealtime] Nenhum dado retornado após update');
        return null;
      }

      // 2. Broadcast via PartyKit (Realtime)
      if (socket && socket.readyState === 1) {
        socket.send(JSON.stringify({
          type: 'UPDATE_MATCH_STATE',
          payload: data // Envia o objeto completo atualizado
        }));
      }

      console.log('[MatchRealtime] Partida atualizada com sucesso:', data);
      setMatch(data);
      if (onMatchUpdate) {
        onMatchUpdate(data);
      }
      return data;
    } catch (err) {
      const errorMessage = err?.message || err?.hint || 'Erro desconhecido ao atualizar partida';
      console.error('[MatchRealtime] Erro ao atualizar partida:', {
        message: errorMessage,
        error: err,
        roomId,
        updates
      });
      setError(errorMessage);
      return null;
    }
  }, [roomId, onMatchUpdate, socket]);

  useEffect(() => {
    if (!roomId) {
      console.warn('[MatchRealtime] roomId ausente');
      setLoading(false);
      return;
    }

    // Carregar estado inicial da partida via Supabase
    const loadMatch = async () => {
      try {
        console.log('[MatchRealtime] Carregando match com room_id:', roomId);
        
        const { data, error: loadError } = await supabase
          .from('matches')
          .select('*')
          .eq('room_id', roomId)
          .single();

        if (loadError) {
          console.error('[MatchRealtime] Erro ao carregar:', loadError);
          throw loadError;
        }

        if (!data) {
          throw new Error('Match não encontrado');
        }

        console.log('[MatchRealtime] Partida carregada com sucesso:', data);
        setMatch(data);
        if (onMatchUpdate) {
          onMatchUpdate(data);
        }
        
        // Opcional: Inicializar estado no PartyKit se necessário
        if (socket && socket.readyState === 1) {
           socket.send(JSON.stringify({
             type: 'INIT_MATCH',
             payload: data
           }));
        }

        setLoading(false);
      } catch (err) {
        const errorMessage = err?.message || err?.hint || 'Erro ao carregar partida';
        console.error('[MatchRealtime] Erro ao carregar partida:', err);
        setError(errorMessage);
        setLoading(false);
      }
    };

    loadMatch();

    // Cleanup
    return () => {
      // PartySocket limpa automaticamente
    };
  }, [roomId, onMatchUpdate, socket]); // socket dependency is stable

  return {
    match,
    updateMatch,
    loading,
    error
  };
}
