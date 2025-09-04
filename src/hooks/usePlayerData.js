// src/hooks/usePlayerData.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export function usePlayerData() {
  const [currencies, setCurrencies] = useState(null);
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState({ unlocked: [], available: [] });
  const [quests, setQuests] = useState({ active: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, isAuthenticated } = useAuth() || {};

  // Fetch player currencies
  const fetchCurrencies = useCallback(async (playerId) => {
    try {
      const response = await fetch(`/api/currency?playerId=${playerId}`);
      if (!response.ok) throw new Error('Failed to fetch currencies');
      const data = await response.json();
      setCurrencies(data.currencies);
    } catch (err) {
      console.error('Error fetching currencies:', err);
      setError(err.message);
    }
  }, []);

  // Fetch player statistics
  const fetchStats = useCallback(async (playerId) => {
    try {
      const response = await fetch(`/api/stats?playerId=${playerId}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message);
    }
  }, []);

  // Fetch player achievements
  const fetchAchievements = useCallback(async (playerId) => {
    try {
      const response = await fetch(`/api/achievements?playerId=${playerId}`);
      if (!response.ok) throw new Error('Failed to fetch achievements');
      const data = await response.json();
      setAchievements({
        unlocked: data.unlocked || [],
        available: data.available || [],
        totalUnlocked: data.totalUnlocked || 0,
        totalAvailable: data.totalAvailable || 0
      });
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError(err.message);
    }
  }, []);

  // Fetch player quests
  const fetchQuests = useCallback(async (playerId) => {
    try {
      const response = await fetch(`/api/quests?playerId=${playerId}`);
      if (!response.ok) throw new Error('Failed to fetch quests');
      const data = await response.json();
      setQuests({
        active: data.active || [],
        completed: data.completed || [],
        expired: data.expired || []
      });
    } catch (err) {
      console.error('Error fetching quests:', err);
      setError(err.message);
    }
  }, []);

  // Load all player data
  const loadPlayerData = useCallback(async () => {
    if (!user?.id || !isAuthenticated()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchCurrencies(user.id),
        fetchStats(user.id),
        fetchAchievements(user.id),
        fetchQuests(user.id)
      ]);
    } catch (err) {
      console.error('Error loading player data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAuthenticated, fetchCurrencies, fetchStats, fetchAchievements, fetchQuests]);

  // Auto-assign daily quests
  const assignDailyQuests = useCallback(async () => {
    if (!user?.id || !isAuthenticated()) return;

    try {
      const response = await fetch('/api/quests/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: user.id })
      });
      
      if (response.ok) {
        // Refresh quests after assignment
        await fetchQuests(user.id);
      }
    } catch (err) {
      console.error('Error assigning daily quests:', err);
    }
  }, [user?.id, isAuthenticated, fetchQuests]);

  // Update currencies locally (optimistic update)
  const updateCurrencies = (newCurrencies) => {
    setCurrencies(prev => ({
      ...prev,
      ...newCurrencies
    }));
  };

  // Update stats locally (optimistic update)
  const updateStats = (newStats) => {
    setStats(prev => ({
      ...prev,
      ...newStats
    }));
  };

  // Spend currencies with validation
  const spendCurrencies = async (costs, reason, metadata = {}) => {
    if (!user?.id || !isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch('/api/currency/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: user.id,
          costs,
          reason,
          metadata
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to spend currencies');
      }

      const data = await response.json();
      setCurrencies(data.currencies);
      return data;
    } catch (err) {
      console.error('Error spending currencies:', err);
      throw err;
    }
  };

  // Claim quest rewards
  const claimQuestReward = async (questId) => {
    if (!user?.id || !isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch('/api/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: user.id,
          questId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to claim reward');
      }

      const data = await response.json();
      
      // Refresh currencies and quests
      await Promise.all([
        fetchCurrencies(user.id),
        fetchQuests(user.id)
      ]);

      return data;
    } catch (err) {
      console.error('Error claiming quest reward:', err);
      throw err;
    }
  };

  // Check if player can afford something
  const canAfford = (costs) => {
    if (!currencies) return false;
    
    return Object.entries(costs).every(([currency, cost]) => {
      return currencies[currency] >= cost;
    });
  };

  // Calculate win rate
  const getWinRate = () => {
    if (!stats || stats.total_matches === 0) return 0;
    return Math.round((stats.wins / stats.total_matches) * 100);
  };

  // Get progress for next level (assuming XP system)
  const getLevelProgress = () => {
    if (!user) return { current: 0, required: 100, percentage: 0 };
    
    const currentXP = user.xp || 0;
    const currentLevel = user.level || 1;
    const xpForNextLevel = currentLevel * 100; // Simple formula
    const xpForCurrentLevel = (currentLevel - 1) * 100;
    const xpProgress = currentXP - xpForCurrentLevel;
    const xpRequired = xpForNextLevel - xpForCurrentLevel;
    
    return {
      current: xpProgress,
      required: xpRequired,
      percentage: Math.min(100, Math.round((xpProgress / xpRequired) * 100))
    };
  };

  // Load data when user changes
  useEffect(() => {
    loadPlayerData();
    assignDailyQuests();
  }, [loadPlayerData, assignDailyQuests]);

  return {
    // Data
    currencies,
    stats,
    achievements,
    quests,
    loading,
    error,

    // Computed values
    winRate: getWinRate(),
    levelProgress: getLevelProgress(),

    // Actions
    loadPlayerData,
    updateCurrencies,
    updateStats,
    spendCurrencies,
    claimQuestReward,
    canAfford,

    // Refresh functions
    refreshCurrencies: () => user?.id && fetchCurrencies(user.id),
    refreshStats: () => user?.id && fetchStats(user.id),
    refreshAchievements: () => user?.id && fetchAchievements(user.id),
    refreshQuests: () => user?.id && fetchQuests(user.id)
  };
}
