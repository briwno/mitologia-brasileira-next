// src/components/Game/SkillButtons.js
"use client";

export default function SkillButtons({ 
  card,
  onSkillClick,
  onUltimateClick,
  skillCooldown = 0,
  ultimateCharge = 0,
  actionUsed = false,
  layout = "horizontal" // "horizontal" ou "vertical"
}) {
  if (!card) return null;

  const containerClasses = layout === "horizontal" 
    ? "flex flex-row gap-3"
    : "flex flex-col gap-2";

  return (
    <div className={containerClasses}>
      {/* Botão de Habilidade Básica */}
      <button
        className="flex flex-col items-center bg-black/60 px-3 py-2 rounded-lg border-2 border-blue-400 shadow-lg hover:bg-blue-900/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onSkillClick}
        disabled={actionUsed || skillCooldown > 0}
        title={card.abilities?.basic?.description || 'Habilidade Básica'}
      >
        <span className="text-lg">✨</span>
        <span className="text-xs mt-1 text-center leading-tight">
          {card.abilities?.basic?.name || 'Skill'}
        </span>
        {skillCooldown > 0 && (
          <span className="text-xs text-blue-200">{skillCooldown}t</span>
        )}
      </button>
      
      {/* Botão de Ultimate */}
      <button
        className="flex flex-col items-center bg-black/60 px-3 py-2 rounded-lg border-2 border-yellow-400 shadow-lg hover:bg-yellow-900/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onUltimateClick}
        disabled={actionUsed || ultimateCharge < 100}
        title={card.abilities?.ultimate?.description || 'Ultimate'}
      >
        <span className="text-lg">💥</span>
        <span className="text-xs mt-1 text-center leading-tight">
          {card.abilities?.ultimate?.name || 'Ultimate'}
        </span>
        <span className="text-xs text-yellow-200">{ultimateCharge}/100</span>
      </button>
    </div>
  );
}
