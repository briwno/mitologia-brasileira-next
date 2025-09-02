// src/components/Game/Mascot.js
"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';

export default function Mascot({
  type = 'saci', // 'saci' | 'iara' | 'cuca' | etc
  mood = 'neutral', // 'happy' | 'worried' | 'neutral'
  onClick,
}) {
  const sprite = useMemo(() => spriteFor(type, mood), [type, mood]);

  return (
    <div className="relative w-44 h-44 md:w-52 md:h-52 xl:w-60 xl:h-60 select-none">
      <div className={`absolute inset-0 rounded-2xl border border-emerald-600/40 bg-emerald-900/10 ${
        mood === 'happy' ? 'ring-2 ring-emerald-400/50' : mood === 'worried' ? 'ring-2 ring-yellow-400/40' : ''
      }`} />
      <button
        className="relative w-full h-full flex items-center justify-center pointer-events-auto"
        onClick={onClick}
        title="Mascote"
      >
        {sprite && (
          <Image
            src={sprite}
            alt={`Mascote ${type}`}
            width={240}
            height={240}
            className={`object-contain ${mood === 'happy' ? 'animate-bounce' : ''}`}
            priority={false}
          />
        )}
      </button>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-neutral-300 bg-black/50 rounded-full px-2 py-0.5 border border-neutral-700">
        Companheiro Mítico
      </div>
    </div>
  );
}

function spriteFor(type, mood) {
  // Placeholders. Substitua por sprites reais no futuro.
  // Placeholder claro; substitua por sprites específicos depois
  const base = '/images/placeholder.svg';
  return base;
}
