// src/components/PvP/SkillPanel.jsx
"use client";

import { useState } from 'react';

/**
 * Painel de Skills da Lenda Ativa
 * Exibe skills, ultimate e passiva
 */
export default function SkillPanel({ 
  legend, 
  onUseSkill, 
  onUseUltimate,
  disabled = false,
  turnsPlayed = 0
}) {
  const [selectedSkill, setSelectedSkill] = useState(null);

  if (!legend) return null;

  const handleSkillClick = (skill) => {
    if (disabled || skill.cooldown > 0) return;
    
    setSelectedSkill(skill);
    onUseSkill?.(skill);
  };

  const handleUltimateClick = () => {
    if (disabled || legend.ultimateUsed) return;
    
    const requiredTurns = legend.ultimate?.requiredTurns || 5;
    if (turnsPlayed < requiredTurns) return;
    
    onUseUltimate?.();
  };

  return (
    <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg p-4 min-w-[300px]">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
        <span className="text-lg">⚔️</span>
        <span className="font-bold text-cyan-300">{legend.name}</span>
      </div>

      {/* Skills */}
      <div className="space-y-2 mb-3">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
          Habilidades
        </div>
        {legend.skills?.map((skill, i) => (
          <SkillButton
            key={i}
            skill={skill}
            isSelected={selectedSkill?.id === skill.id}
            onClick={() => handleSkillClick(skill)}
            disabled={disabled || skill.cooldown > 0}
          />
        ))}
      </div>

      {/* Ultimate */}
      {legend.ultimate && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
            Ultimate
          </div>
          <UltimateButton
            ultimate={legend.ultimate}
            isUsed={legend.ultimateUsed}
            onClick={handleUltimateClick}
            disabled={disabled}
            turnsPlayed={turnsPlayed}
            requiredTurns={legend.ultimate.requiredTurns || 5}
          />
        </div>
      )}

      {/* Passiva */}
      {legend.passive && (
        <div>
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
            Passiva
          </div>
          <PassiveInfo passive={legend.passive} />
        </div>
      )}
    </div>
  );
}

/**
 * Botão de skill individual
 */
function SkillButton({ skill, isSelected, onClick, disabled }) {
  const isOnCooldown = skill.cooldown && skill.cooldown > 0;

  return (
    <button
      onClick={onClick}
      disabled={disabled || isOnCooldown}
      className={`
        w-full p-2 rounded-lg transition-all text-left
        border-2
        ${isSelected
          ? 'border-cyan-400 bg-cyan-900/30'
          : 'border-white/10 bg-black/30'
        }
        ${disabled || isOnCooldown
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-cyan-400/50 hover:bg-black/50 cursor-pointer'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-semibold text-sm text-white flex items-center gap-2">
            {skill.name}
            {skill.element && (
              <span className="text-xs px-1 py-0.5 rounded bg-white/10">
                {getElementIcon(skill.element)}
              </span>
            )}
          </div>
          <div className="text-xs text-neutral-300 mt-1 line-clamp-2">
            {skill.description}
          </div>
        </div>
        
        <div className="text-right ml-2">
          {isOnCooldown ? (
            <div className="text-red-400 font-bold text-sm">
              {skill.cooldown}⏱️
            </div>
          ) : (
            <div className="text-cyan-400 font-bold text-sm">
              💥 {skill.power}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

/**
 * Botão da Ultimate
 */
function UltimateButton({ 
  ultimate, 
  isUsed, 
  onClick, 
  disabled, 
  turnsPlayed, 
  requiredTurns 
}) {
  const isAvailable = turnsPlayed >= requiredTurns && !isUsed;

  return (
    <button
      onClick={onClick}
      disabled={disabled || !isAvailable}
      className={`
        w-full p-3 rounded-lg transition-all text-left relative overflow-hidden
        border-2
        ${isAvailable
          ? 'border-purple-500 bg-gradient-to-r from-purple-900/50 to-pink-900/50 hover:from-purple-800/50 hover:to-pink-800/50 cursor-pointer animate-pulse'
          : 'border-neutral-700 bg-black/30 opacity-50 cursor-not-allowed'
        }
      `}
    >
      {/* Efeito de brilho */}
      {isAvailable && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      )}

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <div className="font-bold text-sm text-purple-300 flex items-center gap-2">
            ⚡ {ultimate.name}
            <span className="text-xs px-1 py-0.5 rounded bg-purple-500/30 text-purple-200">
              ULTIMATE
            </span>
          </div>
          <div className="text-xs text-neutral-200 mt-1">
            {ultimate.description}
          </div>
        </div>
        
        <div className="text-right ml-2">
          {isUsed ? (
            <div className="text-neutral-500 text-xs">USADA</div>
          ) : isAvailable ? (
            <div className="text-yellow-400 font-bold text-lg animate-bounce">
              ⚡
            </div>
          ) : (
            <div className="text-neutral-400 text-xs">
              {requiredTurns - turnsPlayed} turnos
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

/**
 * Info da passiva
 */
function PassiveInfo({ passive }) {
  return (
    <div className="p-2 rounded-lg bg-green-900/20 border border-green-500/30">
      <div className="font-semibold text-sm text-green-300 flex items-center gap-2">
        🌱 {passive.name}
      </div>
      <div className="text-xs text-neutral-200 mt-1">
        {passive.description}
      </div>
    </div>
  );
}

/**
 * Retorna ícone do elemento
 */
function getElementIcon(element) {
  const icons = {
    'Fogo': '🔥',
    'Água': '💧',
    'Terra': '🌍',
    'Ar': '💨',
    'Sombra': '🌑'
  };
  return icons[element] || element;
}
