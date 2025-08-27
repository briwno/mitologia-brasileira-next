// src/components/Game/PlayerInfo.js
"use client";

import Image from 'next/image';
import { useState } from 'react';

export default function InfoDoJogador({ avatar, name, hp, color, isActive, position = 'left' }) {
  const [avatarComErro, definirAvatarComErro] = useState(false);
  const vidaMaxima = 100;
  const porcentagemDeVida = (hp / vidaMaxima) * 100;

  // Cores baseadas no jogador
  const cores = {
    player: {
      border: 'border-blue-400',
      bg: 'from-blue-600/60 to-blue-800/60',
      ring: 'ring-blue-400',
      hpBar: 'from-blue-500 to-blue-600',
      text: 'text-blue-300',
    },
    opponent: {
      border: 'border-red-400',
      bg: 'from-red-600/60 to-red-800/60',
      ring: 'ring-red-400',
      hpBar: 'from-red-500 to-red-600',
      text: 'text-red-300',
    },
  };

  const ehCorDoJogador = name === 'Você';
  const coresAtuais = ehCorDoJogador ? cores.player : cores.opponent;

  return (
    <div className={`flex items-center gap-3 bg-black/40 backdrop-blur-sm rounded-xl p-3 border ${coresAtuais.border} ${isActive ? `ring-2 ${coresAtuais.ring} animate-pulse` : ''} transition-all duration-300`}>
      {/* Avatar com moldura aprimorada */}
      <div className="relative">
        <div className={`absolute -inset-1 rounded-full bg-gradient-to-br ${coresAtuais.bg} blur-sm ${isActive ? 'animate-pulse' : ''}`}></div>
        <div className="relative">
          <Image 
            src={!avatar || avatarComErro ? '/images/placeholder.svg' : avatar}
            alt={name} 
            width={48}
            height={48}
            className="w-12 h-12 rounded-full border-2 border-white/50 object-cover relative z-10" 
            onError={() => definirAvatarComErro(true)}
          />
          {/* Indicador de turno */}
          {isActive && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-xs text-black">🎯</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Informações do jogador */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold text-white truncate">{name}</span>
          <span className={`text-xs ${coresAtuais.text} font-medium`}>
            {isActive ? '▶️ Jogando' : '⏸️ Aguardando'}
          </span>
        </div>
        
        {/* Barra de vida aprimorada */}
        <div className="relative">
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
            <div 
              className={`h-full bg-gradient-to-r ${porcentagemDeVida > 30 ? 'from-green-500 to-green-600' : porcentagemDeVida > 15 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-red-600'} transition-all duration-500 relative`}
              style={{ width: `${porcentagemDeVida}%` }}
            >
              {/* Brilho na barra de vida */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          </div>
          
          {/* Texto da vida */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow-md">
              ❤️ {hp}/{vidaMaxima}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
