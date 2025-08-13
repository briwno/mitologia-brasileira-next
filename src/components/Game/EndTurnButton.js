// src/components/Game/EndTurnButton.js
"use client";

export default function EndTurnButton({ onEndTurn, disabled = false, isPlayerTurn = true }) {
  const label = isPlayerTurn ? (disabled ? 'Aguardando...' : 'Finalizar Turno') : 'Aguardando...';
  return (
    <button
      type="button"
      className={`w-48 h-12 rounded-xl border-2 text-sm font-bold tracking-wide transition-all uppercase
        ${!isPlayerTurn || disabled ? 'bg-neutral-800 text-neutral-500 border-neutral-600 cursor-not-allowed' : 'bg-sky-700 hover:bg-sky-600 text-white border-sky-500 active:scale-[0.97]'}
      `}
      style={{ boxShadow: '0 14px 32px -8px rgba(0,0,0,0.85), 0 0 0 2px rgba(255,255,255,0.04) inset' }}
      onClick={onEndTurn}
      disabled={!isPlayerTurn || disabled}
    >
      {label}
    </button>
  );
}
