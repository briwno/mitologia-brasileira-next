// src/components/Game/SkillOrbs.js
"use client";

import React, { useEffect, useState } from 'react';

export default function SkillOrbs({
  skills = [],
  canUseSkill,
  onUse,
  disabled = false,
}) {
  // Distribui as orbes ao redor de um círculo parcial (210° a 330°)
  const total = Math.min(5, skills.length);
  const isSmall = typeof window !== 'undefined' && window.innerWidth < 768;
  const startDeg = 210;
  const endDeg = 330;
  const radius = isSmall ? 76 : 110;

  // Mobile/touch support: first tap opens details, second tap confirms use
  const [activeIndex, setActiveIndex] = useState(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    try {
      const touchCapable = typeof navigator !== 'undefined' && (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0);
      const coarse = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
      setIsTouch(!!touchCapable || !!coarse);
    } catch {
      setIsTouch(false);
    }
  }, []);

  useEffect(() => {
    if (!isSmall) setActiveIndex(null);
  }, [isSmall]);

  if (!skills || skills.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none z-40">
      {skills.slice(0, 5).map((skill, i) => {
        const t = total === 1 ? 0.5 : i / (total - 1);
        const deg = startDeg + (endDeg - startDeg) * t;
        const rad = (deg * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        const canUse = !disabled && canUseSkill && canUseSkill('player', skill) && !skill.locked;

        const handleClick = (e) => {
          e.stopPropagation();
          if (isTouch || isSmall) {
            if (activeIndex === i) {
              if (canUse && onUse) onUse(i);
              setActiveIndex(null);
            } else {
              setActiveIndex(i);
            }
            return;
          }
          if (canUse && onUse) onUse(i);
        };

        return (
          <button
            key={skill.key || i}
            title={skill.description || skill.name}
            onClick={handleClick}
            disabled={!canUse}
            className={`group pointer-events-auto absolute w-14 h-14 rounded-full border-2 backdrop-blur-sm transition-transform duration-150 flex items-center justify-center text-xl shadow-xl ${
              canUse
                ? 'bg-gradient-to-br from-emerald-500/80 to-cyan-600/80 border-emerald-300/70 hover:scale-110'
                : 'bg-gradient-to-br from-slate-700/70 to-slate-800/70 border-slate-500/60 opacity-60 cursor-not-allowed'
            }`}
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]">{iconFor(skill)}</span>
            {/* PP Badge */}
            <div className="absolute -bottom-1 -right-1 text-[10px] leading-none px-1 py-0.5 rounded bg-black/70 text-yellow-200 font-bold">
              {skill.pp}/{skill.ppMax}
            </div>
            {skill.locked && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-base">🔒</div>
            )}

            {/* Popover */}
            <div
              className={
                `absolute -top-24 left-1/2 -translate-x-1/2 w-48 rounded-lg border border-white/15 bg-neutral-900/95 text-white shadow-2xl p-2 transition-opacity duration-150 z-50 ` +
                ((isTouch || isSmall)
                  ? (activeIndex === i ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')
                  : 'opacity-0 pointer-events-none group-hover:opacity-100 group-focus:opacity-100')
              }
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-bold truncate pr-2">{skill.name}</div>
                <div className="text-[10px] text-yellow-200 font-bold whitespace-nowrap">{skill.pp}/{skill.ppMax} PP</div>
              </div>
              <div className="text-[10px] text-neutral-300 line-clamp-3">{skill.description}</div>
              <div className="mt-1 flex items-center justify-between text-[10px]">
                <div className="text-neutral-400 flex items-center justify-center">{skill.kind === 'stun' ? '💫 Atordoar' : skill.kind === 'debuff' ? '🌀 Debuff' : '⚔️ Dano'}</div>
              </div>
              {skill.locked && (
                <div className="mt-1 text-[10px] text-yellow-300">🔒 Libera em {skill.unlockIn} turno(s)</div>
              )}
              {(isTouch || isSmall) && (
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveIndex(null); }}
                    className="px-2 py-1 text-[11px] rounded bg-neutral-800 border border-neutral-600 hover:bg-neutral-700"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    disabled={!canUse}
                    onClick={(e) => { e.stopPropagation(); if (canUse && onUse) { onUse(i); setActiveIndex(null); } }}
                    className={`px-2 py-1 text-[11px] rounded border ${canUse ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white' : 'bg-neutral-700 border-neutral-600 text-neutral-300 cursor-not-allowed'}`}
                  >
                    Usar
                  </button>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function iconFor(skill) {
  if (!skill) return '⚔️';
  if (skill.key === 'skill5') return '🌟';
  switch (skill.kind) {
    case 'stun':
      return '💫';
    case 'debuff':
      return '🌀';
    case 'damage':
    default:
      return '⚔️';
  }
}
