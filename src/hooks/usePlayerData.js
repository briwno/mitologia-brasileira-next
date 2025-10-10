// src/hooks/usePlayerData.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export function usePlayerData() {
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, isAuthenticated } = useAuth() || {};

  // Fetch player coins (da tabela players)
  const fetchCoins = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar coins direto do user (já vem no useAuth)
      if (user.coins !== undefined) {
        setCoins(user.coins);
      } else {
        // Fallback: buscar da API se necessário
        const response = await fetch('/api/auth', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCoins(data.user?.coins || 0);
        } else {
          console.error('[usePlayerData] Falha ao buscar moedas:', response.status);
          setError('Falha ao buscar moedas');
        }
      }
    } catch (err) {
      console.error('[usePlayerData] Erro ao buscar moedas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.coins]);

  // Atualizar moedas localmente (otimista)
  const updateCoins = (newCoins) => {
    setCoins(newCoins);
  };

  // Gastar moedas com validação
  const spendCoins = async (amount, reason = 'purchase') => {
    if (!user?.id || !isAuthenticated()) {
      return Promise.reject(new Error('Não autenticado'));
    }

    if (coins < amount) {
      return Promise.reject(new Error('Moedas insuficientes'));
    }

    try {
      // TODO: Implementar endpoint para atualizar moedas no servidor
      // Por enquanto, atualização local
      const newCoins = coins - amount;
      setCoins(newCoins);

      console.log(`[usePlayerData] Gastou ${amount} moedas. Motivo: ${reason}. Novo saldo: ${newCoins}`);

      return { success: true, newBalance: newCoins };
    } catch (err) {
      console.error('[usePlayerData] Erro ao gastar moedas:', err);
      return Promise.reject(err);
    }
  };

  // Adicionar moedas
  const addCoins = async (amount, reason = 'reward') => {
    if (!user?.id || !isAuthenticated()) {
      return Promise.reject(new Error('Não autenticado'));
    }

    try {
      // TODO: Implementar endpoint para atualizar moedas no servidor
      // Por enquanto, atualização local
      const newCoins = coins + amount;
      setCoins(newCoins);

      console.log(`[usePlayerData] Ganhou ${amount} moedas. Motivo: ${reason}. Novo saldo: ${newCoins}`);

      return { success: true, newBalance: newCoins };
    } catch (err) {
      console.error('[usePlayerData] Erro ao adicionar moedas:', err);
      return Promise.reject(err);
    }
  };

  // Verificar se pode comprar algo
  const canAfford = (cost) => {
    return coins >= cost;
  };

  // Progresso de nível (baseado no XP do usuário)
  const getLevelProgress = () => {
    if (!user) return { current: 0, required: 100, percentage: 0 };
    
    const currentXP = user.xp || 0;
    const currentLevel = user.level || 1;
    const xpForNextLevel = currentLevel * 1000; // Fórmula: level * 1000
    const xpForCurrentLevel = (currentLevel - 1) * 1000;
    const xpProgress = currentXP - xpForCurrentLevel;
    const xpRequired = xpForNextLevel - xpForCurrentLevel;
    
    return {
      current: Math.max(0, xpProgress),
      required: xpRequired,
      percentage: Math.min(100, Math.max(0, Math.round((xpProgress / xpRequired) * 100)))
    };
  };

  // Carregar dados quando o usuário mudar
  useEffect(() => {
    if (user?.id && isAuthenticated()) {
      fetchCoins();
    } else {
      setCoins(0);
      setLoading(false);
    }
  }, [user?.id, isAuthenticated, fetchCoins]);

  // Sincronizar com user.coins quando mudar
  useEffect(() => {
    if (user?.coins !== undefined) {
      setCoins(user.coins);
    }
  }, [user?.coins]);

  return {
    // Dados
    coins,
    loading,
    error,

    // Valores computados
    levelProgress: getLevelProgress(),
    canAfford,

    // Ações
    updateCoins,
    spendCoins,
    addCoins,
    refreshCoins: fetchCoins
  };
}
