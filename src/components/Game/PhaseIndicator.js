// src/components/Game/PhaseIndicator.js
"use client";

export default function PhaseIndicator({ 
  currentPhase, 
  currentPlayer, 
  turn, 
  players = [] 
}) {
  const phases = [
    { id: 'inicio', name: 'Início', icon: '🌅', description: 'Ativação de passivas e efeitos contínuos' },
    { id: 'acao', name: 'Ação', icon: '⚔️', description: 'Escolha sua ação: habilidade, troca ou item' },
    { id: 'resolucao', name: 'Resolução', icon: '💥', description: 'Aplicação de efeitos e verificação de derrotas' },
    { id: 'fim_turno', name: 'Fim do Turno', icon: '🔄', description: 'Compra de itens e efeitos de fim de turno' }
  ];

  const currentPhaseData = phases.find(p => p.id === currentPhase) || phases[0];
  const playerName = players[currentPlayer]?.name || `Jogador ${currentPlayer + 1}`;

  return (
    <div className="phase-indicator bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 rounded-lg border border-purple-500/50 mb-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{currentPhaseData.icon}</div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Turno {turn} - {currentPhaseData.name}
            </h3>
            <p className="text-sm text-gray-300">
              {currentPhaseData.description}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-400">Vez de:</div>
          <div className="font-semibold text-yellow-400">{playerName}</div>
        </div>
      </div>

      {/* Barra de Progresso das Fases */}
      <div className="phase-progress">
        <div className="flex justify-between mb-2">
          {phases.map((phase, index) => (
            <div 
              key={phase.id}
              className={`
                flex-1 text-center text-xs font-medium transition-all duration-300
                ${phase.id === currentPhase 
                  ? 'text-yellow-400 scale-110' 
                  : phases.findIndex(p => p.id === currentPhase) > index
                    ? 'text-green-400'
                    : 'text-gray-500'
                }
              `}
            >
              <div className="text-lg mb-1">{phase.icon}</div>
              <div>{phase.name}</div>
            </div>
          ))}
        </div>
        
        {/* Barra de Progresso */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${((phases.findIndex(p => p.id === currentPhase) + 1) / phases.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Instruções baseadas na fase */}
      <div className="mt-3 p-2 bg-black/30 rounded text-sm text-gray-300">
        {getPhaseInstructions(currentPhase, currentPlayer === 0)} {/* Assumindo que player 0 é o humano */}
      </div>
    </div>
  );
}

function getPhaseInstructions(phase, isPlayerTurn) {
  switch (phase) {
    case 'inicio':
      return '🔮 Passivas estão sendo ativadas e efeitos contínuos processados...';
    
    case 'acao':
      if (isPlayerTurn) {
        return '⚡ Sua vez! Escolha uma ação: Use uma habilidade, troque de lenda, use um item ou faça uma ação especial.';
      }
      return '⏳ Aguardando o oponente escolher sua ação...';
    
    case 'resolucao':
      return '💢 Efeitos estão sendo aplicados e derrotas verificadas...';
    
    case 'fim_turno':
      return '🎒 Comprando itens e aplicando efeitos de fim de turno...';
    
    default:
      return '❓ Processando...';
  }
}

// Componente adicional para mostrar o log de ações da fase
export function PhaseLog({ actions = [] }) {
  if (actions.length === 0) return null;

  return (
    <div className="phase-log mt-4 p-3 bg-black/40 rounded border border-gray-600">
      <h4 className="text-sm font-semibold text-gray-300 mb-2">📋 Log da Fase</h4>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {actions.slice(-5).map((action, index) => (
          <div 
            key={index}
            className={`text-xs p-1 rounded ${getLogTypeStyle(action.type)}`}
          >
            <span className="font-medium">{action.message}</span>
            {action.timestamp && (
              <span className="text-gray-500 ml-2">
                {new Date(action.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getLogTypeStyle(type) {
  switch (type) {
    case 'damage':
      return 'text-red-300 bg-red-900/20';
    case 'heal':
      return 'text-green-300 bg-green-900/20';
    case 'buff':
      return 'text-blue-300 bg-blue-900/20';
    case 'debuff':
      return 'text-orange-300 bg-orange-900/20';
    case 'ultimate':
      return 'text-purple-300 bg-purple-900/20 border border-purple-500/50';
    case 'action':
      return 'text-yellow-300 bg-yellow-900/20';
    case 'phase':
      return 'text-cyan-300 bg-cyan-900/20';
    case 'defeat':
      return 'text-red-400 bg-red-900/30 font-bold';
    case 'gameover':
      return 'text-red-500 bg-red-900/50 font-bold border border-red-500';
    default:
      return 'text-gray-300 bg-gray-800/20';
  }
}