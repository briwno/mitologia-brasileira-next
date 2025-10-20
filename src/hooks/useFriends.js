// src/hooks/useFriends.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export function useFriends() {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, isAuthenticated } = useAuth() || {};

  // Buscar todas as amizades
  const fetchFriends = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/friends?playerId=${user.id}`);

      if (!response.ok) {
        throw new Error('Falha ao buscar amigos');
      }

      const data = await response.json();
      const allFriends = data.friends || [];

      // Separar por status
      const accepted = allFriends.filter(f => f.status === 'accepted');
      const pending = allFriends.filter(f => f.status === 'pending' && !f.isSentByMe);
      const sent = allFriends.filter(f => f.status === 'pending' && f.isSentByMe);

      setFriends(accepted);
      setPendingRequests(pending);
      setSentRequests(sent);

      console.log('[useFriends] Amigos carregados:', {
        accepted: accepted.length,
        pending: pending.length,
        sent: sent.length
      });
    } catch (err) {
      console.error('[useFriends] Erro ao buscar amigos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Enviar solicitação de amizade
  const sendFriendRequest = async (friendId) => {
    if (!user?.id || !isAuthenticated()) {
      return Promise.reject(new Error('Não autenticado'));
    }

    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: user.id,
          friendId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao enviar solicitação');
      }

      console.log('[useFriends] Solicitação enviada com sucesso');
      
      // Atualizar lista
      await fetchFriends();

      return { success: true };
    } catch (err) {
      console.error('[useFriends] Erro ao enviar solicitação:', err);
      return Promise.reject(err);
    }
  };

  // Aceitar solicitação de amizade
  const acceptFriendRequest = async (friendshipId) => {
    if (!user?.id || !isAuthenticated()) {
      return Promise.reject(new Error('Não autenticado'));
    }

    try {
      const response = await fetch('/api/friends', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friendshipId,
          status: 'accepted'
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao aceitar solicitação');
      }

      console.log('[useFriends] Solicitação aceita com sucesso');
      
      // Atualizar lista
      await fetchFriends();

      return { success: true };
    } catch (err) {
      console.error('[useFriends] Erro ao aceitar solicitação:', err);
      return Promise.reject(err);
    }
  };

  // Rejeitar solicitação de amizade
  const rejectFriendRequest = async (friendshipId) => {
    if (!user?.id || !isAuthenticated()) {
      return Promise.reject(new Error('Não autenticado'));
    }

    try {
      const response = await fetch('/api/friends', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friendshipId,
          status: 'rejected'
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao rejeitar solicitação');
      }

      console.log('[useFriends] Solicitação rejeitada com sucesso');
      
      // Atualizar lista
      await fetchFriends();

      return { success: true };
    } catch (err) {
      console.error('[useFriends] Erro ao rejeitar solicitação:', err);
      return Promise.reject(err);
    }
  };

  // Remover amigo
  const removeFriend = async (friendshipId) => {
    if (!user?.id || !isAuthenticated()) {
      return Promise.reject(new Error('Não autenticado'));
    }

    try {
      const response = await fetch('/api/friends', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId })
      });

      if (!response.ok) {
        throw new Error('Falha ao remover amigo');
      }

      console.log('[useFriends] Amigo removido com sucesso');
      
      // Atualizar lista
      await fetchFriends();

      return { success: true };
    } catch (err) {
      console.error('[useFriends] Erro ao remover amigo:', err);
      return Promise.reject(err);
    }
  };

  // Bloquear jogador
  const blockPlayer = async (friendshipId) => {
    if (!user?.id || !isAuthenticated()) {
      return Promise.reject(new Error('Não autenticado'));
    }

    try {
      const response = await fetch('/api/friends', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friendshipId,
          status: 'blocked'
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao bloquear jogador');
      }

      console.log('[useFriends] Jogador bloqueado com sucesso');
      
      // Atualizar lista
      await fetchFriends();

      return { success: true };
    } catch (err) {
      console.error('[useFriends] Erro ao bloquear jogador:', err);
      return Promise.reject(err);
    }
  };

  // Buscar jogador(es) por nickname ou UID
  const searchPlayer = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 3) {
      return Promise.reject(new Error('Digite pelo menos 3 caracteres'));
    }

    try {
      const response = await fetch(`/api/players?nickname=${encodeURIComponent(searchTerm)}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Nenhum jogador encontrado');
        }
        throw new Error('Erro ao buscar jogador');
      }

      const data = await response.json();
      
      // Se retornou múltiplos jogadores
      if (data.isMultiple && data.players) {
        return data.players;
      }
      
      // Se retornou um único jogador (busca por UID ou único resultado)
      if (data.player) {
        return [data.player];
      }
      
      // Se retornou array de jogadores
      if (data.players) {
        return data.players;
      }
      
      return [];
    } catch (err) {
      console.error('[useFriends] Erro ao buscar jogador:', err);
      return Promise.reject(err);
    }
  };

  // Carregar amigos ao montar o componente
  useEffect(() => {
    if (user?.id && isAuthenticated()) {
      fetchFriends();
    } else {
      setFriends([]);
      setPendingRequests([]);
      setSentRequests([]);
      setLoading(false);
    }
  }, [user?.id, isAuthenticated, fetchFriends]);

  return {
    // Dados
    friends,
    pendingRequests,
    sentRequests,
    loading,
    error,

    // Contadores
    friendsCount: friends.length,
    pendingCount: pendingRequests.length,
    sentCount: sentRequests.length,

    // Ações
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    blockPlayer,
    searchPlayer,
    refreshFriends: fetchFriends
  };
}
