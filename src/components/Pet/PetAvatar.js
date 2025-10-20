// src/components/Pet/PetAvatar.js
// Componente visual do mascote Ybyra'í

"use client";

import { useEffect, useState } from 'react';

const EMOCOES = {
  neutro: '😐',
  feliz: '😊',
  triste: '😔',
  animado: '🤩',
  pensando: '🤔'
};

const ANIMACOES_CSS = {
  parado: 'animate-bounce-slow',
  falando: 'animate-pulse',
  comemorando: 'animate-bounce',
  pensando: 'animate-wiggle'
};

export default function PetAvatar({ 
  emocao = 'neutro', 
  animação = 'parado',
  tamanho = 'md',
  className = ''
}) {
  const [expressao, setExpressao] = useState(EMOCOES[emocao]);

  useEffect(() => {
    setExpressao(EMOCOES[emocao] || EMOCOES.neutro);
  }, [emocao]);

  const tamanhos = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-4xl',
    lg: 'w-24 h-24 text-6xl',
    xl: 'w-32 h-32 text-8xl'
  };

  return (
    <div className={`relative ${className}`}>
      {/* Avatar do mascote */}
      <div 
        className={`
          ${tamanhos[tamanho]}
          bg-gradient-to-br from-green-600/20 via-emerald-600/20 to-teal-600/20
          backdrop-blur-sm
          rounded-full
          flex items-center justify-center
          border-2 border-green-400/30
          shadow-lg shadow-green-500/20
          ${ANIMACOES_CSS[animação] || ANIMACOES_CSS.parado}
          transition-all duration-300
          hover:scale-110
          cursor-pointer
        `}
        title="Ybyra'í - Espírito da Ka'aguy"
      >
        {/* Ícone espiritual */}
        <div className="relative">
          <span className="drop-shadow-lg">🌿</span>
          {/* Expressão sobreposta */}
          <span 
            className="absolute -top-1 -right-1 text-xs"
            style={{ fontSize: tamanho === 'sm' ? '0.6rem' : '0.8rem' }}
          >
            {expressao}
          </span>
        </div>
      </div>

      {/* Efeito de brilho para celebração */}
      {animação === 'comemorando' && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/30 via-green-400/30 to-blue-400/30 animate-ping" />
      )}

      {/* Partículas flutuantes */}
      {(animação === 'falando' || animação === 'comemorando') && (
        <>
          <div className="absolute -top-2 -right-2 text-green-400 text-xs animate-float">✨</div>
          <div className="absolute -bottom-2 -left-2 text-emerald-400 text-xs animate-float animation-delay-300">🍃</div>
        </>
      )}
    </div>
  );
}
