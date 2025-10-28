// src/components/Pet/PetWidget.js
// Widget completo do mascote (avatar + balão de fala)

"use client";

import { useEffect, useRef } from 'react';
import { usePet } from '@/hooks/usePet';
import PetAvatar from './PetAvatar';
import PetBubble from './PetBubble';

export default function PetWidget({ 
  posicao = 'bottom-right', // bottom-right, bottom-left, top-right, top-left
  tamanhoAvatar = 'md',
  posicaoBubble = 'top',
  autoSaudar = true,
  situacao = null,
  className = ''
}) {
  const { 
    fraseAtual, 
    emocaoAtual, 
    visivel, 
    animação,
    alternar,
    saudar,
    falar
  } = usePet();

  // Coordenar saudação e fala contextual para evitar sobrescrever a mensagem
  const _mounted = useRef(false);
  useEffect(() => {
    // Primeiro mount: se autoSaudar=true, saudar primeiro e depois falar a situacao (se houver)
    if (!_mounted.current) {
      _mounted.current = true;
      if (autoSaudar) {
        // iniciar saudação imediatamente
        saudar();
        // após a saudação (4s por padrão no hook), falar a situacao se fornecida
        if (situacao && typeof falar === 'function') {
          const t = setTimeout(() => {
            falar(situacao);
          }, 4200);
          return () => clearTimeout(t);
        }
      } else {
        // sem saudação automática: fala imediatamente a situacao
        if (situacao && typeof falar === 'function') {
          falar(situacao);
        }
      }
    } else {
      // Montado antes: qualquer mudança de `situacao` dispara fala imediata
      if (situacao && typeof falar === 'function') {
        falar(situacao);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [situacao]);

  const posicoes = {
    'bottom-right': 'fixed bottom-4 right-4 md:bottom-8 md:right-20',
    'bottom-left': 'fixed bottom-4 left-4 md:bottom-8 md:left-20',
    'top-right': 'fixed top-20 right-4 md:top-24 md:right-20',
    'top-left': 'fixed top-20 left-4 md:top-24 md:left-20',
    'middle-right': 'fixed top-1/2 -translate-y-1/2 right-4 md:right-20',
    'middle-left': 'fixed top-1/2 -translate-y-1/2 left-4 md:left-20'
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
