// src/hooks/useMMR.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { calcularRankingPorMMR, calcularProgressoRanking, obterIconeRanking, obterCorRanking } from '@/utils/mmrUtils';

export function useMMR() {
  const [mmr, setMMR] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, isAuthenticated } = useAuth() || {};

  // Fetch MMR data
  const fetchMMR = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar MMR direto do user (já vem no useAuth)
      if (user.mmr !== undefined) {
        setMMR(user.mmr);
        setLevel(user.level || 1);
      } else {
        // Fallback: buscar da API se necessário
        const response = await fetch('/api/auth', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setMMR(data.user?.mmr || 0);
          setLevel(data.user?.level || 1);
        } else {
          console.error('[useMMR] Falha ao buscar MMR:', response.status);
          setError('Falha ao buscar dados de ranking');
        }
      }
    } catch (err) {
      console.error('[useMMR] Erro ao buscar MMR:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.mmr, user?.level]);

  // Atualizar MMR localmente
  const updateMMR = (newMMR, newLevel = null) => {
    setMMR(newMMR);
    if (newLevel !== null) {
      setLevel(newLevel);
    }
  };

  // Ganhar/perder MMR após partida
  const updateMMRAfterMatch = async (result, opponentMMR = null) => {
    if (!user?.id || !isAuthenticated()) {
      return Promise.reject(new Error('Não autenticado'));
    }

    try {
      let mmrChange = 0;
      
      // Cálculo básico de MMR (pode ser refinado)
      if (result === 'win') {
        mmrChange = opponentMMR ? 
          Math.max(10, 30 - Math.max(0, mmr - opponentMMR) / 10) : 15;
      } else if (result === 'loss') {
        mmrChange = opponentMMR ? 
          -Math.max(10, 30 - Math.max(0, opponentMMR - mmr) / 10) : -15;
      } else if (result === 'draw') {
        mmrChange = 0;
      }

      const newMMR = Math.max(0, mmr + mmrChange);

      // TODO: Implementar endpoint para atualizar MMR no servidor
      // Por enquanto, atualização local
      setMMR(newMMR);

      let changeSign;
      if (mmrChange >= 0) {
        changeSign = '+';
      } else {
        changeSign = '';
      }
      console.log(`[useMMR] MMR atualizado: ${mmr} → ${newMMR} (${changeSign}${mmrChange})`);

      return { 
        success: true, 
        newMMR, 
        change: mmrChange,
        previousMMR: mmr 
      };
    } catch (err) {
      console.error('[useMMR] Erro ao atualizar MMR:', err);
      return Promise.reject(err);
    }
  };

  // Calcular dados de ranking
  const getRankingData = () => {
    const rankingAtual = calcularRankingPorMMR(mmr);
    const progressoRanking = calcularProgressoRanking(mmr);
    const iconeRanking = obterIconeRanking(rankingAtual);
    const corRanking = obterCorRanking(rankingAtual);

    return {
      ranking: rankingAtual,
      progresso: progressoRanking,
      icone: iconeRanking,
      cor: corRanking,
      mmr: mmr
    };
  };

  // Carregar dados quando o usuário mudar
  useEffect(() => {
    if (user?.id && isAuthenticated()) {
      fetchMMR();
    } else {
      setMMR(0);
      setLevel(1);
      setLoading(false);
    }
  }, [user?.id, isAuthenticated, fetchMMR]);

  // Sincronizar com user.mmr quando mudar
  useEffect(() => {
    if (user?.mmr !== undefined) {
      setMMR(user.mmr);
    }
    if (user?.level !== undefined) {
      setLevel(user.level);
    }
  }, [user?.mmr, user?.level]);

  return {
    // Dados básicos
    mmr,
    level,
    loading,
    error,

    // Dados de ranking computados
    ranking: getRankingData(),

    // Ações
    updateMMR,
    updateMMRAfterMatch,
    refreshMMR: fetchMMR
  };
}