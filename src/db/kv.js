// src/db/kv.js - helpers para estado efêmero de partidas (Vercel KV)
import { kv } from '@vercel/kv';

const NS = 'match';

function key(roomId) {
  return `${NS}:${roomId}`;
}

export async function getMatchState(roomId) {
  if (!roomId) throw new Error('roomId é obrigatório');
  const state = await kv.get(key(roomId));
  return state || null;
}

export async function createMatchState(roomId, payload, ttlSeconds = 60 * 60) {
  if (!roomId) throw new Error('roomId é obrigatório');
  const base = {
    version: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: 'active',
    ...payload,
  };
  await kv.set(key(roomId), base, { ex: ttlSeconds });
  return base;
}

// CAS simples por versão; retorna { ok, state, error }
export async function updateMatchState(roomId, updater, opts = {}) {
  const ttlSeconds = opts.ttlSeconds ?? 60 * 60;
  const maxRetries = opts.maxRetries ?? 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    const current = (await kv.get(key(roomId))) || null;
    const next = await updater(current);
    if (!next) return { ok: false, state: current, error: 'no-op' };

    // garantir avanço de versão e timestamps
    next.version = (current?.version || 0) + 1;
    next.updatedAt = Date.now();

    const tx = kv.multi();
    // if current is null, ensure key does not exist; otherwise check version
    if (!current) {
      tx.set(key(roomId), next, { ex: ttlSeconds, nx: true });
    } else {
      // Compare-and-swap por versão: lemos versão e reescrevemos se igual
      // Como Vercel KV não tem CAS nativo por campo, usamos WATCH-like via version shadow key
      const vKey = `${key(roomId)}:v`;
      const curVersion = current.version || 0;
      const curStored = (await kv.get(vKey)) ?? curVersion; // tolerante
      if (curStored !== curVersion) {
        continue; // conflito, refazer leitura
      }
      tx.set(vKey, next.version);
      tx.set(key(roomId), next, { ex: ttlSeconds });
    }

    const res = await tx.exec();
    if (res) {
      return { ok: true, state: next };
    }
  }

  const latest = await kv.get(key(roomId));
  return { ok: false, state: latest, error: 'conflict' };
}

export async function deleteMatchState(roomId) {
  await kv.del(key(roomId));
  await kv.del(`${key(roomId)}:v`);
  return true;
}

export async function extendTTL(roomId, ttlSeconds = 60 * 60) {
  const state = await kv.get(key(roomId));
  if (!state) return false;
  await kv.expire(key(roomId), ttlSeconds);
  return true;
}
