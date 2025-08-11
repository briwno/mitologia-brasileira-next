// src/components/Game/PlayerInfo.js
"use client";

import Image from 'next/image';

export default function PlayerInfo({ avatar, name, hp, color, isActive, position = "left" }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${isActive ? 'ring-4 ring-yellow-400 animate-glow' : ''}`} style={{ minWidth: 70 }}>
      <div className="relative flex items-center justify-center">
        {/* Moldura tribal animada */}
        <div className="absolute -inset-1 z-0 rounded-full border-4 border-green-900 bg-gradient-to-br from-green-700/60 to-yellow-800/60 shadow-xl animate-pulse-slow" style={{ filter: 'blur(2px)' }}></div>
        
        {/* Avatar */}
        <Image 
          src={avatar} 
          alt={name} 
          width={56}
          height={56}
          className="w-14 h-14 rounded-full border-4 border-yellow-700 z-10 object-cover" 
        />
        
        {/* Barra de vida */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/80 px-2 py-0.5 rounded-full border-2 border-yellow-400 shadow">
          <span className="text-red-400 text-lg">❤</span>
          <span className="text-yellow-100 font-bold text-sm">{hp}</span>
        </div>
      </div>
      
      {/* Nome do jogador */}
      <span className="text-xs font-bold text-yellow-200 drop-shadow">{name}</span>
    </div>
  );
}
