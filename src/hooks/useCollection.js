// src/hooks/useCollection.js
"use client";

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';

export function useCollection() {
  const { user, loading: userLoading } = useAuth();
  const [cards, setCards] = useState([]); // array de IDs (ex: ['cur001','iar001'])
  const [itemCards, setItemCards] = useState([]); // array de IDs de item cards
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const playerId = user?.id || null; // UUID do Auth

  const load = useCallback(async () => {
    if (!playerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/collection?playerId=${encodeURIComponent(playerId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao carregar coleção');
      if (Array.isArray(data.cards)) {
        setCards(data.cards);
      } else {
        setCards([]);
      }
      if (Array.isArray(data.itemCards)) {
        setItemCards(data.itemCards);
      } else {
        setItemCards([]);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  const setAll = useCallback(async (nextCards, nextItemCards = []) => {
    if (!playerId) return { ok: false };
    try {
      const res = await fetch('/api/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, cards: nextCards, itemCards: nextItemCards })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao salvar coleção');
      setCards(data.cards || []);
      setItemCards(data.itemCards || []);
      return { ok: true, cards: data.cards, itemCards: data.itemCards };
    } catch (e) {
      setError(e.message);
      return { ok: false, error: e.message };
    }
  }, [playerId]);

  const addCard = useCallback(async (cardId) => {
    if (!playerId) return { ok: false };
    try {
      const res = await fetch('/api/collection', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, add: cardId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao adicionar carta');
      setCards(data.cards || []);
      setItemCards(data.itemCards || []);
      return { ok: true };
    } catch (e) {
      setError(e.message);
      return { ok: false, error: e.message };
    }
  }, [playerId]);

  const removeCard = useCallback(async (cardId) => {
    if (!playerId) return { ok: false };
    try {
      const res = await fetch('/api/collection', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, remove: cardId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao remover carta');
      setCards(data.cards || []);
      setItemCards(data.itemCards || []);
      return { ok: true };
    } catch (e) {
      setError(e.message);
      return { ok: false, error: e.message };
    }
  }, [playerId]);

  const addItemCard = useCallback(async (itemCardId) => {
    if (!playerId) return { ok: false };
    try {
      const res = await fetch('/api/collection', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, addItemCard: itemCardId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao adicionar item card');
      setCards(data.cards || []);
      setItemCards(data.itemCards || []);
      return { ok: true };
    } catch (e) {
      setError(e.message);
      return { ok: false, error: e.message };
    }
  }, [playerId]);

  const removeItemCard = useCallback(async (itemCardId) => {
    if (!playerId) return { ok: false };
    try {
      const res = await fetch('/api/collection', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, removeItemCard: itemCardId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao remover item card');
      setCards(data.cards || []);
      setItemCards(data.itemCards || []);
      return { ok: true };
    } catch (e) {
      setError(e.message);
      return { ok: false, error: e.message };
    }
  }, [playerId]);

  // auto-load quando logado
  useEffect(() => {
    if (playerId && !userLoading) {
      load();
    }
  }, [playerId, userLoading, load]);

  return {
    cards,
    itemCards,
    loading: loading || userLoading,
    error,
    load,
    setAll,
    addCard,
    removeCard,
    addItemCard,
    removeItemCard,
    isReady: !!playerId && !userLoading,
  };
}
