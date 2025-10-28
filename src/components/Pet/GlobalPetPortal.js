"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import PetWidget from './PetWidget';
import { SITUACOES_MASCOTE } from '@/data/petPhrases';

export default function GlobalPetPortal() {
  const pathname = usePathname();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => setIsLoaded(true), []);

  if (!isLoaded) return null;

  // Nunca renderiza o mascote global nas rotas de PvP (essas telas têm seu próprio mascot)
  if (pathname?.startsWith('/pvp')) return null;

  const situacao = (function mapPathToSituacao(p){
    if(!p) return SITUACOES_MASCOTE.OCIOSO;
    if(p === '/' || p === '/home') return SITUACOES_MASCOTE.SAUDACAO_MANHA;
    if(p.startsWith('/museum')) return SITUACOES_MASCOTE.MUSEU;
    if(p.startsWith('/card_inventory')) return SITUACOES_MASCOTE.DECK;
    if(p.startsWith('/shop')) return SITUACOES_MASCOTE.LOJA;
    if(p.startsWith('/ranking')) return SITUACOES_MASCOTE.RANKING;
    if(p.startsWith('/profile')) return SITUACOES_MASCOTE.OCIOSO;
    if(p.startsWith('/museum/quiz')) return SITUACOES_MASCOTE.QUIZ;
    return SITUACOES_MASCOTE.OCIOSO;
  })(pathname);

  return (
    <PetWidget
      posicao="bottom-right"
      tamanhoAvatar="md"
      posicaoBubble="top"
      autoSaudar={true}
      situacao={situacao}
      className="pointer-events-auto"
    />
  );
}
