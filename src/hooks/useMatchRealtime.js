import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hook para sincronizar estado da partida em tempo real via tabela matches
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

  /**
   * Atualizar dados da partida no banco
   * @param {Object} updates - Campos a atualizar
   */
  const updateMatch = useCallback(async (updates) => {
    if (!roomId) {
      console.warn('[MatchRealtime] updateMatch: roomId ausente');
      return null;
    }

    console.log('[MatchRealtime] Atualizando match:', { roomId, updates });

    try {
      const { data, error: updateError } = await supabase
        .from('matches')
        .update(updates)
        .eq('room_id', roomId)
        .select()
        .single();

      if (updateError) {
        console.error('[MatchRealtime] Erro do Supabase (detalhado):', {
          message: updateError.message || 'Sem mensagem',
          details: updateError.details || 'Sem detalhes',
          hint: updateError.hint || 'Sem hint',
          code: updateError.code || 'Sem código',
          errorCompleto: updateError,
          errorString: JSON.stringify(updateError, null, 2)
        });
        throw updateError;
      }

      if (!data) {
        console.warn('[MatchRealtime] Nenhum dado retornado após update');
        return null;
      }

      console.log('[MatchRealtime] Partida atualizada com sucesso:', data);
      setMatch(data);
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
  }, [roomId]);

  useEffect(() => {
    if (!roomId) {
      console.warn('[MatchRealtime] roomId ausente');
      setLoading(false);
      return;
    }

    // Carregar estado inicial da partida
    const loadMatch = async () => {
      try {
        console.log('[MatchRealtime] Carregando match com room_id:', roomId);
        
        const { data, error: loadError } = await supabase
          .from('matches')
          .select('*')
          .eq('room_id', roomId)
          .single();

        if (loadError) {
          console.error('[MatchRealtime] Erro ao carregar:', {
            message: loadError.message,
            details: loadError.details,
            hint: loadError.hint,
            code: loadError.code
          });
          throw loadError;
        }

        if (!data) {
          throw new Error('Match não encontrado');
        }

        console.log('[MatchRealtime] Partida carregada com sucesso:', data);
        setMatch(data);
        setLoading(false);
      } catch (err) {
        const errorMessage = err?.message || err?.hint || 'Erro ao carregar partida';
        console.error('[MatchRealtime] Erro ao carregar partida:', {
          message: errorMessage,
          error: err,
          roomId
        });
        setError(errorMessage);
        setLoading(false);
      }
    };

    loadMatch();

    // Subscrever a mudanças na tabela matches
    const channel = supabase
      .channel(`match:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('[MatchRealtime] Partida atualizada em tempo real:', payload.new);
          setMatch(payload.new);
          
          if (onMatchUpdate) {
            onMatchUpdate(payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log('[MatchRealtime] Status da subscrição:', status);
      });

    // Cleanup
    return () => {
      console.log('[MatchRealtime] Desconectando do canal de match');
      supabase.removeChannel(channel);
    };
  }, [roomId, onMatchUpdate]);

  return {
    match,
    updateMatch,
    loading,
    error
  };
}
