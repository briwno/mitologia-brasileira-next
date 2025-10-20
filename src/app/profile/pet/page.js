// src/app/profile/pet/page.js
"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePet } from '@/hooks/usePet';
import LayoutDePagina from '@/components/UI/PageLayout';
import PetAvatar from '@/components/Pet/PetAvatar';
import { FRASES_MASCOTE } from '@/data/petPhrases';

export default function PaginaMascote() {
  const [situacaoSelecionada, definirSituacaoSelecionada] = useState('saudacao_manha');
  const contextoAutenticacao = useAuth();
  const { user: usuario, isAuthenticated: verificarAutenticacao } = contextoAutenticacao || {};
  
  const { 
    falar, 
    fraseAtual, 
    emocaoAtual, 
    animação,
    nivelJogador,
    SITUACOES 
  } = usePet();

  let estaAutenticado;
  if (typeof verificarAutenticacao === 'function') {
    estaAutenticado = verificarAutenticacao();
  } else {
    estaAutenticado = false;
  }

  // Estatísticas do mascote
  const totalFrases = Object.values(FRASES_MASCOTE).reduce((acc, arr) => acc + arr.length, 0);
  const situacoesDisponiveis = Object.keys(FRASES_MASCOTE).length;

  // Simular interação
  const handleTestarFrase = (situacao) => {
    definirSituacaoSelecionada(situacao);
    falar(situacao, 10000); // 10 segundos para visualização
  };

  if (!estaAutenticado) {
    return (
      <LayoutDePagina>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              🌿 Ybyra&apos;í - Espírito da Ka&apos;aguy
            </h1>
            <div className="text-xl text-red-400 mb-4">
              Você precisa estar logado para conhecer seu mascote
            </div>
            <div className="mb-4">
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold mr-4"
              >
                Fazer Login
              </Link>
            </div>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold"
            >
              ← Voltar ao Menu Principal
            </Link>
          </div>
        </div>
      </LayoutDePagina>
    );
  }

  return (
    <LayoutDePagina>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
            🌿 Ybyra&apos;í - Espírito da Ka&apos;aguy
          </h1>
          <p className="text-xl text-green-300">
            Seu guardião espiritual da floresta
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna esquerda - Avatar e Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar grande */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 border border-green-600/30">
              <div className="flex flex-col items-center">
                <PetAvatar 
                  emocao={emocaoAtual}
                  animação={animação}
                  tamanho="xl"
                  className="mb-6"
                />
                <h2 className="text-2xl font-bold text-green-400 mb-2">Ybyra&apos;í</h2>
                <p className="text-sm text-gray-400 text-center italic mb-4">
                  &ldquo;Espírito ancestral das árvores sagradas&rdquo;
                </p>
                
                {/* Frase atual */}
                {fraseAtual && (
                  <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 w-full">
                    <p className="text-sm text-green-200 italic text-center">
                      &ldquo;{fraseAtual}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-green-600/30">
              <h3 className="text-lg font-bold mb-4 text-green-400">📊 Informações</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Seu Nível:</span>
                  <span className="font-bold text-green-400">{nivelJogador}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total de Frases:</span>
                  <span className="font-bold">{totalFrases}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Situações:</span>
                  <span className="font-bold">{situacoesDisponiveis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Emoção Atual:</span>
                  <span className="font-bold capitalize">{emocaoAtual}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Animação:</span>
                  <span className="font-bold capitalize">{animação}</span>
                </div>
              </div>
            </div>

            {/* Sobre o mascote */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-green-600/30">
              <h3 className="text-lg font-bold mb-4 text-green-400">📖 Sobre Ybyra&apos;í</h3>
              <p className="text-sm text-gray-300 leading-relaxed mb-3">
                Ybyra&apos;í é um espírito ancestral que habita as árvores sagradas da Ka&apos;aguy (floresta). 
                Feito de folhas vivas e madeira mística, ele é a voz da natureza e guardião dos segredos antigos.
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">
                Ele acompanha você desde o início de sua jornada, crescendo em sabedoria conforme você evolui. 
                Suas palavras são guiadas pelos espíritos da mata e carregam a essência do folclore brasileiro.
              </p>
            </div>
          </div>

          {/* Coluna direita - Interações */}
          <div className="lg:col-span-2">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-green-600/30">
              <h3 className="text-2xl font-bold mb-6 text-green-400">💬 Interaja com Ybyra&apos;í</h3>
              <p className="text-gray-300 mb-6">
                Clique nos botões abaixo para ver como o mascote reage a diferentes situações do jogo.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Vitória */}
                <button
                  onClick={() => handleTestarFrase(SITUACOES.VITORIA)}
                  className={`p-4 rounded-lg border transition-all ${
                    situacaoSelecionada === SITUACOES.VITORIA
                      ? 'bg-green-600/30 border-green-400'
                      : 'bg-black/40 border-gray-600/30 hover:border-green-400/50'
                  }`}
                >
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="text-sm font-semibold">Vitória</div>
                </button>

                {/* Derrota */}
                <button
                  onClick={() => handleTestarFrase(SITUACOES.DERROTA)}
                  className={`p-4 rounded-lg border transition-all ${
                    situacaoSelecionada === SITUACOES.DERROTA
                      ? 'bg-green-600/30 border-green-400'
                      : 'bg-black/40 border-gray-600/30 hover:border-green-400/50'
                  }`}
                >
                  <div className="text-2xl mb-2">😔</div>
                  <div className="text-sm font-semibold">Derrota</div>
                </button>

                {/* Booster */}
                <button
                  onClick={() => handleTestarFrase(SITUACOES.BOOSTER)}
                  className={`p-4 rounded-lg border transition-all ${
                    situacaoSelecionada === SITUACOES.BOOSTER
                      ? 'bg-green-600/30 border-green-400'
                      : 'bg-black/40 border-gray-600/30 hover:border-green-400/50'
                  }`}
                >
                  <div className="text-2xl mb-2">🎁</div>
                  <div className="text-sm font-semibold">Booster</div>
                </button>

                {/* Museu */}
                <button
                  onClick={() => handleTestarFrase(SITUACOES.MUSEU)}
                  className={`p-4 rounded-lg border transition-all ${
                    situacaoSelecionada === SITUACOES.MUSEU
                      ? 'bg-green-600/30 border-green-400'
                      : 'bg-black/40 border-gray-600/30 hover:border-green-400/50'
                  }`}
                >
                  <div className="text-2xl mb-2">🏛️</div>
                  <div className="text-sm font-semibold">Museu</div>
                </button>

                {/* Nível Up */}
                <button
                  onClick={() => handleTestarFrase(SITUACOES.NIVEL_UP)}
                  className={`p-4 rounded-lg border transition-all ${
                    situacaoSelecionada === SITUACOES.NIVEL_UP
                      ? 'bg-green-600/30 border-green-400'
                      : 'bg-black/40 border-gray-600/30 hover:border-green-400/50'
                  }`}
                >
                  <div className="text-2xl mb-2">⬆️</div>
                  <div className="text-sm font-semibold">Nível Up</div>
                </button>

                {/* Carta Lendária */}
                <button
                  onClick={() => handleTestarFrase(SITUACOES.NOVA_CARTA_LENDARIA)}
                  className={`p-4 rounded-lg border transition-all ${
                    situacaoSelecionada === SITUACOES.NOVA_CARTA_LENDARIA
                      ? 'bg-green-600/30 border-green-400'
                      : 'bg-black/40 border-gray-600/30 hover:border-green-400/50'
                  }`}
                >
                  <div className="text-2xl mb-2">✨</div>
                  <div className="text-sm font-semibold">Lendária</div>
                </button>

                {/* Amigos */}
                <button
                  onClick={() => handleTestarFrase(SITUACOES.AMIGOS)}
                  className={`p-4 rounded-lg border transition-all ${
                    situacaoSelecionada === SITUACOES.AMIGOS
                      ? 'bg-green-600/30 border-green-400'
                      : 'bg-black/40 border-gray-600/30 hover:border-green-400/50'
                  }`}
                >
                  <div className="text-2xl mb-2">👥</div>
                  <div className="text-sm font-semibold">Amigos</div>
                </button>

                {/* Quiz */}
                <button
                  onClick={() => handleTestarFrase(SITUACOES.QUIZ)}
                  className={`p-4 rounded-lg border transition-all ${
                    situacaoSelecionada === SITUACOES.QUIZ
                      ? 'bg-green-600/30 border-green-400'
                      : 'bg-black/40 border-gray-600/30 hover:border-green-400/50'
                  }`}
                >
                  <div className="text-2xl mb-2">❓</div>
                  <div className="text-sm font-semibold">Quiz</div>
                </button>

                {/* Deck */}
                <button
                  onClick={() => handleTestarFrase(SITUACOES.DECK)}
                  className={`p-4 rounded-lg border transition-all ${
                    situacaoSelecionada === SITUACOES.DECK
                      ? 'bg-green-600/30 border-green-400'
                      : 'bg-black/40 border-gray-600/30 hover:border-green-400/50'
                  }`}
                >
                  <div className="text-2xl mb-2">🃏</div>
                  <div className="text-sm font-semibold">Deck</div>
                </button>

                {/* Loja */}
                <button
                  onClick={() => handleTestarFrase(SITUACOES.LOJA)}
                  className={`p-4 rounded-lg border transition-all ${
                    situacaoSelecionada === SITUACOES.LOJA
                      ? 'bg-green-600/30 border-green-400'
                      : 'bg-black/40 border-gray-600/30 hover:border-green-400/50'
                  }`}
                >
                  <div className="text-2xl mb-2">🏪</div>
                  <div className="text-sm font-semibold">Loja</div>
                </button>

                {/* Ranking */}
                <button
                  onClick={() => handleTestarFrase(SITUACOES.RANKING)}
                  className={`p-4 rounded-lg border transition-all ${
                    situacaoSelecionada === SITUACOES.RANKING
                      ? 'bg-green-600/30 border-green-400'
                      : 'bg-black/40 border-gray-600/30 hover:border-green-400/50'
                  }`}
                >
                  <div className="text-2xl mb-2">🏅</div>
                  <div className="text-sm font-semibold">Ranking</div>
                </button>

                {/* Saudação */}
                <button
                  onClick={() => handleTestarFrase(SITUACOES.SAUDACAO_MANHA)}
                  className={`p-4 rounded-lg border transition-all ${
                    situacaoSelecionada === SITUACOES.SAUDACAO_MANHA
                      ? 'bg-green-600/30 border-green-400'
                      : 'bg-black/40 border-gray-600/30 hover:border-green-400/50'
                  }`}
                >
                  <div className="text-2xl mb-2">👋</div>
                  <div className="text-sm font-semibold">Saudação</div>
                </button>
              </div>

              {/* Como funciona */}
              <div className="mt-8 bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                <h4 className="text-lg font-bold text-green-400 mb-3">🌟 Como Funciona</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span>O mascote aparece em momentos-chave do jogo para te guiar e motivar</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span>Suas frases evoluem conforme você sobe de nível (você está no nível {nivelJogador})</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span>Clique no mascote flutuante para ver mensagens e dicas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span>Ele reage automaticamente a vitórias, derrotas e conquistas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span>Inspirado no folclore brasileiro e na sabedoria da floresta</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Botão voltar */}
        <div className="text-center mt-8">
          <Link
            href="/profile"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold"
          >
            ← Voltar ao Perfil
          </Link>
        </div>
      </div>
    </LayoutDePagina>
  );
}
