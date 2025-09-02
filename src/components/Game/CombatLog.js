// src/components/Game/CombatLog.js
"use client";

import React from 'react';

export default function CombatLog({ entries = [] }) {
  const latest = entries.slice(-4).reverse();
  return (
    <div className="w-64 md:w-72 xl:w-80 bg-neutral-900/70 backdrop-blur-sm border border-neutral-700/70 rounded-xl p-3 shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">📜</span>
        <div className="font-bold text-sm">Tomo do Cronista</div>
      </div>
      <div className="space-y-2 text-xs">
        {latest.length === 0 && (
          <div className="text-neutral-400">Sem eventos ainda.</div>
        )}
        {latest.map((e, idx) => (
          <div key={idx} className={`flex items-start gap-2 p-2 rounded border ${
            e.side === 'player'
              ? 'bg-emerald-900/30 border-emerald-700/50'
              : 'bg-sky-900/30 border-sky-700/50'
          }`}>
            <div className="text-base leading-none">{iconFor(e.type)}</div>
            <div className="flex-1 leading-tight">
              <div className="font-semibold text-neutral-100">{e.title}</div>
              {e.desc && <div className="text-neutral-300">{e.desc}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function iconFor(type) {
  switch (type) {
    case 'damage':
      return '⚔️';
    case 'stun':
      return '💫';
    case 'switch':
      return '🔄';
    case 'heal':
      return '✨';
    default:
      return '📝';
  }
}
