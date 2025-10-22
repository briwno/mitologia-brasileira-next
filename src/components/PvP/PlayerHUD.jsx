"use client";

/**
 * Componente de HUD do jogador
 * Mostra avatar, nome e rank
 */
export default function PlayerHUD({ 
  player, 
  isEnemy = false 
}) {
  const bgColor = isEnemy ? 'bg-orange-600/80 border-orange-400' : 'bg-cyan-600/80 border-cyan-400';
  const borderColor = isEnemy ? 'border-orange-300' : 'border-cyan-300';
  const textColor = isEnemy ? 'text-orange-200' : 'text-cyan-200';

  return (
    <div className={`${bgColor} border-2 rounded-xl px-3 py-2 shadow-lg`}>
      <div className="flex items-center gap-2">
        <div className={`w-10 h-10 rounded-full bg-black/30 border-2 ${borderColor} flex items-center justify-center`}>
          <span className="text-lg">{isEnemy ? '👤' : '🎮'}</span>
        </div>
        <div>
          <div className="font-bold text-xs text-white">{player?.name || 'Jogador'}</div>
          <div className={`text-[9px] ${textColor}`}>
            Rank: {player?.rank || 'Bronze II'}
          </div>
        </div>
      </div>
    </div>
  );
}
