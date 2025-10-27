// src/utils/relicSystem.js
// Utilitários simples para o sistema de Relíquias descrito em docs/batalhav4.md

const SAMPLE_RELICS = [
  { key: 'amuleto_jaci', name: 'Amuleto de Jaci', type: 'suporte', effect: { heal: 3 } },
  { key: 'raiz_boitata', name: 'Raiz de Boitatá', type: 'ataque', effect: { damage: 3 } },
  { key: 'coracao_kaaguy', name: 'Coração da Ka\'aguy', type: 'campo', effect: { regen: 1 } },
  { key: 'po_pisadeira', name: 'Pó da Pisadeira', type: 'oculta', effect: { skip_turn: 1 } },
  { key: 'espelho_iara', name: 'Espelho da Iara', type: 'defesa', effect: { reflect: true } },
  // Entradas extras para diversidade
  { key: 'vento_sagrado', name: 'Vento Sagrado', type: 'buff', effect: { atk_pct: 0.1 } },
  { key: 'semente_ancestral', name: 'Semente Ancestral', type: 'suporte', effect: { shield: 2 } },
  { key: 'fosforo_lunar', name: 'Fósforo Lunar', type: 'ofensivo', effect: { damage: 2, burn: 1 } },
  { key: 'eco_da_madeira', name: 'Eco da Madeira', type: 'campo', effect: { tempo: 2 } },
  { key: 'brisa_do_norte', name: 'Brisa do Norte', type: 'suporte', effect: { speed: 1 } }
];

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Gera um pool de N relíquias (aleatórias a partir do SAMPLE_RELICS, com repetição)
export function generateRelicPool(count = 10) {
  const pool = [];
  const sample = SAMPLE_RELICS;
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * sample.length);
    // criar cópia e id único
    pool.push({ ...sample[idx], id: `${sample[idx].key}_${Date.now()}_${i}_${Math.floor(Math.random() * 1000)}` });
  }
  return shuffleArray(pool);
}

// Tenta desenhar uma relíquia do pool. Retorna { relic, pool }
export function drawRelic(pool) {
  if (!Array.isArray(pool) || pool.length === 0) return { relic: null, pool: [] };
  const newPool = pool.slice();
  const relic = newPool.shift(); // retirar do topo
  return { relic, pool: newPool };
}

// Uso simples de relíquia (aplica e retorna efeitos simples) — a aplicação real deve ser feita no game logic
export function applyRelicEffect(relic, target, state) {
  // Esta função é um placeholder. Deve retornar uma descrição do efeito
  if (!relic) return { applied: false, message: 'Nenhuma relíquia' };
  const msg = `Relíquia ${relic.name} aplicada a ${target?.name || 'alvo'}`;
  return { applied: true, message: msg, effect: relic.effect };
}

const relicSystem = {
  generateRelicPool,
  drawRelic,
  applyRelicEffect,
};

export default relicSystem;
