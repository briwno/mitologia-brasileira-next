// src/components/PvP/TurnController.jsx
"use client";

/**
 * Controle de Turno
 * Exibe informações do turno e botão de encerrar
 */
export default function TurnController({ 
  isMyTurn, 
  currentTurn, 
  currentPhase,
  onEndTurn,
  disabled = false
}) {
  const phaseNames = {
    'INICIO': 'Início',
    'ACAO': 'Ação',
    'RESOLUCAO': 'Resolução',
    'FIM_TURNO': 'Fim de Turno'
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Indicador de turno */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-xs text-neutral-400 uppercase tracking-wide">
            Turno
          </div>
          <div className="text-2xl font-bold text-cyan-300">
            {currentTurn || 0}
          </div>
        </div>

        <div className="h-8 w-px bg-white/10" />

        <div className="text-center">
          <div className="text-xs text-neutral-400 uppercase tracking-wide">
            Fase
          </div>
          <div className="text-sm font-semibold text-yellow-300">
            {phaseNames[currentPhase] || currentPhase}
          </div>
        </div>
      </div>

      {/* Status do turno */}
      <div className={`
        px-4 py-2 rounded-full font-semibold text-sm
        ${isMyTurn 
          ? 'bg-green-600 text-white animate-pulse' 
          : 'bg-neutral-700 text-neutral-300'
        }
      `}>
        {isMyTurn ? '✅ Seu Turno!' : '⏳ Aguardando oponente...'}
      </div>

      {/* Botão de encerrar turno */}
      {isMyTurn && (
        <button
          onClick={onEndTurn}
          disabled={disabled}
          className={`
            px-8 py-3 rounded-full font-bold text-white
            transition-all shadow-lg
            ${disabled
              ? 'bg-neutral-600 cursor-not-allowed opacity-50'
              : 'bg-cyan-600 hover:bg-cyan-700 hover:scale-105 active:scale-95'
            }
          `}
        >
          ➤ Encerrar Turno
        </button>
      )}

      {/* Dica de ação */}
      {isMyTurn && currentPhase === 'ACAO' && (
        <div className="text-xs text-neutral-400 text-center max-w-xs">
          💡 Escolha uma ação: usar skill, item ou trocar lenda
        </div>
      )}
    </div>
  );
}
