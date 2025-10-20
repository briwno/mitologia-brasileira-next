// src/hooks/usePet.js
// Hook customizado para gerenciar o mascote Ybyra'í

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  obterFraseMascote, 
  obterSaudacaoMascote, 
  obterEmocaoMascote,
  SITUACOES_MASCOTE 
} from '@/data/petPhrases';

export function usePet() {
  const [fraseAtual, setFraseAtual] = useState('');
  const [emocaoAtual, setEmocaoAtual] = useState('neutro');
  const [visivel, setVisivel] = useState(false);
  const [animação, setAnimação] = useState('parado'); // parado, falando, comemorando, pensando
  
  const { user } = useAuth() || {};
  const nivelJogador = user?.level || 1;

  // Mostrar frase do mascote
  const falar = useCallback((situacao, duracao = 5000) => {
    const frase = obterFraseMascote(situacao, nivelJogador);
    const emocao = obterEmocaoMascote(situacao);
    
    setFraseAtual(frase);
    setEmocaoAtual(emocao);
    setVisivel(true);
    setAnimação('falando');

    // Auto-ocultar após duração
    const timer = setTimeout(() => {
      setVisivel(false);
      setAnimação('parado');
    }, duracao);

    return () => clearTimeout(timer);
  }, [nivelJogador]);

  // Mostrar saudação inicial
  const saudar = useCallback(() => {
    const saudacao = obterSaudacaoMascote(nivelJogador);
    setFraseAtual(saudacao);
    setEmocaoAtual('feliz');
    setVisivel(true);
    setAnimação('falando');

    // Auto-ocultar após 4 segundos
    setTimeout(() => {
      setVisivel(false);
      setAnimação('parado');
    }, 4000);
  }, [nivelJogador]);

  // Mostrar/ocultar manualmente
  const mostrar = useCallback(() => {
    setVisivel(true);
  }, []);

  const ocultar = useCallback(() => {
    setVisivel(false);
    setAnimação('parado');
  }, []);

  // Alternar visibilidade
  const alternar = useCallback(() => {
    setVisivel(prev => !prev);
  }, []);

  // Celebrar (para vitórias, conquistas, etc)
  const celebrar = useCallback((duracao = 3000) => {
    setAnimação('comemorando');
    setTimeout(() => {
      setAnimação('parado');
    }, duracao);
  }, []);

  // Pensar (para momentos estratégicos)
  const pensar = useCallback((duracao = 2000) => {
    setAnimação('pensando');
    setTimeout(() => {
      setAnimação('parado');
    }, duracao);
  }, []);

  // Obter frase sem exibir (útil para pré-visualização)
  const obterFrase = useCallback((situacao) => {
    return obterFraseMascote(situacao, nivelJogador);
  }, [nivelJogador]);

  // Resetar para estado ocioso
  const resetar = useCallback(() => {
    setFraseAtual('');
    setEmocaoAtual('neutro');
    setAnimação('parado');
    setVisivel(false);
  }, []);

  return {
    // Estado
    fraseAtual,
    emocaoAtual,
    visivel,
    animação,
    nivelJogador,

    // Ações
    falar,
    saudar,
    mostrar,
    ocultar,
    alternar,
    celebrar,
    pensar,
    obterFrase,
    resetar,

    // Constantes
    SITUACOES: SITUACOES_MASCOTE
  };
}
