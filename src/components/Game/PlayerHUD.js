// src/components/Game/PlayerHUD.js
"use client";

export default function PlayerHUD({
  player,
  position = 'bottom-right'
}) {
  const isPlayer = position === 'bottom-right';
  const panelColor = isPlayer ? 'bg-[#0f2540]' : 'bg-[#401b1b]';
  const borderColor = isPlayer ? 'border-blue-500' : 'border-red-500';

  return (
    <div
      className={`relative rounded-xl px-5 py-4 min-w-60 border-2 ${panelColor} ${borderColor} text-xs`}
      style={{ boxShadow: '0 10px 28px -6px rgba(0,0,0,0.85)' }}
    >
      <div className="flex gap-4 items-center">
        {/* Placeholder avatar circle */}
        <div className="relative">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-[10px] uppercase tracking-wider ${isPlayer ? 'bg-blue-700 text-blue-100' : 'bg-red-700 text-red-100'} border border-white/10`}>
            {player.name?.slice(0,2) || 'PL'}
          </div>
          {player.isActive && (
            <div className={`absolute inset-0 rounded-full animate-ping ${isPlayer ? 'bg-blue-400/30' : 'bg-red-400/30'}`} />
          )}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className={`text-sm font-bold ${isPlayer ? 'text-blue-200' : 'text-red-200'} leading-none`}>{player.name}</div>
          {/* Health bar */}
            <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden relative">
              <div className={`${isPlayer ? 'bg-blue-500' : 'bg-red-500'} h-full transition-all`} style={{ width: `${Math.min(100, player.hp)}%` }} />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white/90">{player.hp}/100</span>
            </div>
          {/* Ultimate bar */}
          <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden relative">
            <div className="bg-yellow-500 h-full transition-all" style={{ width: `${Math.min(100, player.ultimate || 0)}%` }} />
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-neutral-900">⚡</span>
          </div>
          <div className="flex justify-between text-[10px] text-neutral-400">
            <span>Lv {player.level || 1}</span>
            <span>{player.gamesWon || 0} vitórias</span>
          </div>
        </div>
      </div>
      {player.isActive && (
        <div className={`absolute -top-3 -right-3 px-3 py-1 rounded-full text-[10px] font-bold ${isPlayer ? 'bg-blue-600' : 'bg-red-600'} text-white shadow-lg`}>{isPlayer ? 'SEU TURNO' : 'TURNO'}</div>
      )}
    </div>
  );
}
