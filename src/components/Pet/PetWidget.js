// src/components/Pet/PetWidget.js
// Widget completo do mascote (avatar + balão de fala)

"use client";

import { useEffect } from 'react';
import { usePet } from '@/hooks/usePet';
import PetAvatar from './PetAvatar';
import PetBubble from './PetBubble';

export default function PetWidget({ 
  posicao = 'bottom-right', // bottom-right, bottom-left, top-right, top-left
  tamanhoAvatar = 'md',
  posicaoBubble = 'top',
  autoSaudar = true,
  className = ''
}) {
  const { 
    fraseAtual, 
    emocaoAtual, 
    visivel, 
    animação,
    alternar,
    saudar
  } = usePet();

  // Saudação automática ao montar
  useEffect(() => {
    if (autoSaudar) {
      const timer = setTimeout(() => {
        saudar();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoSaudar, saudar]);

  const posicoes = {
    'bottom-right': 'fixed bottom-4 right-4 md:bottom-8 md:right-8',
    'bottom-left': 'fixed bottom-4 left-4 md:bottom-8 md:left-8',
    'top-right': 'fixed top-20 right-4 md:top-24 md:right-8',
    'top-left': 'fixed top-20 left-4 md:top-24 md:left-8'
  };

  return (
    <div 
      className={`
        ${posicoes[posicao]}
        z-40
        ${className}
      `}
      onClick={alternar}
    >
      <div className="relative">
        {/* Balão de fala */}
        {visivel && fraseAtual && (
          <PetBubble 
            frase={fraseAtual}
            visivel={visivel}
            posicao={posicaoBubble}
          />
        )}

        {/* Avatar do mascote */}
        <PetAvatar 
          emocao={emocaoAtual}
          animação={animação}
          tamanho={tamanhoAvatar}
        />

        {/* Indicador de clique */}
        {!visivel && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
}
