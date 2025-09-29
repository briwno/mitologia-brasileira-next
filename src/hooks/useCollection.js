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

  const uid = user?.email || user?.uid || null; // usamos email ou uid

  const load = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/collection?uid=${encodeURIComponent(uid)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao carregar coleção');
      setCards(Array.isArray(data.cards) ? data.cards : []);
      setItemCards(Array.isArray(data.itemCards) ? data.itemCards : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  const setAll = useCallback(async (nextCards, nextItemCards = []) => {
    if (!uid) return { ok: false };
    try {
      const res = await fetch('/api/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, cards: nextCards, itemCards: nextItemCards })
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
  }, [uid]);

  const addCard = useCallback(async (cardId) => {
    if (!uid) return { ok: false };
    try {
      const res = await fetch('/api/collection', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, add: cardId })
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
  }, [uid]);

  const removeCard = useCallback(async (cardId) => {
    if (!uid) return { ok: false };
    try {
      const res = await fetch('/api/collection', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, remove: cardId })
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
  }, [uid]);

  const addItemCard = useCallback(async (itemCardId) => {
    if (!uid) return { ok: false };
    try {
      const res = await fetch('/api/collection', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, addItemCard: itemCardId })
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
  }, [uid]);

  const removeItemCard = useCallback(async (itemCardId) => {
    if (!uid) return { ok: false };
    try {
      const res = await fetch('/api/collection', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, removeItemCard: itemCardId })
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
  }, [uid]);

  // auto-load quando logado
  useEffect(() => {
    if (uid && !userLoading) {
      load();
    }
  }, [uid, userLoading, load]);

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
    isReady: !!uid && !userLoading,
  };
}
