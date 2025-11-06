// src/app/profile/[uid]/page.js
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth as usarAutenticacao } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import LayoutDePagina from '@/components/UI/PageLayout';
import { calcularRankingPorMMR, calcularProgressoRanking, obterIconeRanking, obterCorRanking } from '@/utils/mmrUtils';

export default function PaginaPerfilPublico() {
  const params = useParams();
  const uid = params.uid;
  
  const [abaAtiva, definirAbaAtiva] = useState('visaoGeral');
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState(null);
  const [perfilJogador, definirPerfilJogador] = useState(null);
  const [estatisticas, definirEstatisticas] = useState(null);
  const [colecao, definirColecao] = useState(null);
  const [mensagemSucesso, definirMensagemSucesso] = useState('');

  const contextoAutenticacao = usarAutenticacao();
  const { user: usuarioLogado, isAuthenticated: verificarAutenticacao } = contextoAutenticacao || {};
  
  const {
    friends: amigos,
    pendingRequests: solicitacoesPendentes,
    sentRequests: solicitacoesEnviadas,
    sendFriendRequest: enviarSolicitacao
  } = useFriends();

  let estaAutenticado;
  if (typeof verificarAutenticacao === 'function') {
    estaAutenticado = verificarAutenticacao();
  } else {
    estaAutenticado = false;
  }

  // Verificar se é o próprio perfil do usuário logado
  const ehProproPerfil = usuarioLogado?.id === uid;

  // Verificar se já é amigo ou tem solicitação pendente
  const jaAmigo = amigos.some(a => a.friend.id === uid);
  const solicitacaoPendente = [...solicitacoesPendentes, ...solicitacoesEnviadas].some(
    s => s.friend.id === uid
  );

  // Buscar dados do perfil
  useEffect(() => {
    const buscarPerfil = async () => {
      if (!uid) {
        definirErro('UID inválido');
        definirCarregando(false);
        return;
      }

      try {
        definirCarregando(true);
        definirErro(null);

        // Buscar dados básicos do jogador
        const respostaPerfil = await fetch(`/api/players?uid=${uid}`);
        
        if (!respostaPerfil.ok) {
          if (respostaPerfil.status === 404) {
            throw new Error('Jogador não encontrado');
          }
          throw new Error('Erro ao buscar perfil');
        }

        const dadosPerfil = await respostaPerfil.json();
        definirPerfilJogador(dadosPerfil.player || dadosPerfil);

        // Buscar estatísticas
        const respostaStats = await fetch(`/api/players/${uid}/stats`);
        if (respostaStats.ok) {
          const dadosStats = await respostaStats.json();
          definirEstatisticas(dadosStats);
        }

        // Buscar coleção
        const respostaColecao = await fetch(`/api/collection?playerId=${uid}`);
        if (respostaColecao.ok) {
          const dadosColecao = await respostaColecao.json();
          definirColecao(dadosColecao);
        }

      } catch (err) {
        console.error('[PaginaPerfilPublico] Erro:', err);
        definirErro(err.message);
      } finally {
        definirCarregando(false);
      }
    };

    buscarPerfil();
  }, [uid]);

  // Enviar solicitação de amizade
  const handleEnviarSolicitacao = async () => {
    if (!estaAutenticado) {
      definirErro('Você precisa estar logado para adicionar amigos');
      return;
    }

    try {
      await enviarSolicitacao(uid);
      definirMensagemSucesso(`Solicitação enviada para ${perfilJogador?.nickname}!`);
      setTimeout(() => definirMensagemSucesso(''), 3000);
    } catch (err) {
      definirErro(err.message);
    }
  };

  if (carregando) {
    return (
      <LayoutDePagina>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              👤 Perfil do Jogador
            </h1>
            <div className="text-xl text-purple-300 mb-8">Carregando dados do perfil...</div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400"></div>
            </div>
          </div>
        </div>
      </LayoutDePagina>
    );
  }

  if (erro) {
    return (
      <LayoutDePagina>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              👤 Perfil do Jogador
            </h1>
            <div className="text-xl text-red-400 mb-4">{erro}</div>
            <Link
              href="/profile"
              className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold"
            >
              ← Voltar ao Meu Perfil
            </Link>
          </div>
        </div>
      </LayoutDePagina>
    );
  }

  if (!perfilJogador) {
    return (
      <LayoutDePagina>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              👤 Perfil do Jogador
            </h1>
            <div className="text-xl text-red-400 mb-4">Jogador não encontrado</div>
            <Link
              href="/profile"
              className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold"
            >
              ← Voltar ao Meu Perfil
            </Link>
          </div>
        </div>
      </LayoutDePagina>
    );
  }

  // Calcular dados de ranking
  const mmrJogador = perfilJogador?.mmr || 0;
  const levelJogador = perfilJogador?.level || 1;
  const rankingAtual = calcularRankingPorMMR(mmrJogador);
  const progressoRanking = calcularProgressoRanking(mmrJogador);
  const iconeRanking = obterIconeRanking(rankingAtual);
  const corRanking = obterCorRanking(rankingAtual);

  const vitorias = estatisticas?.wins || 0;
  const derrotas = estatisticas?.losses || 0;
  const totalPartidas = vitorias + derrotas;
  const taxaVitoria = totalPartidas > 0 ? Math.round((vitorias / totalPartidas) * 100) : 0;

  const obterClasseTaxaVitoria = (taxa) => {
    if (taxa >= 70) return 'text-green-400';
    if (taxa >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <LayoutDePagina>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          {/* Header com foto e nome do usuário */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              {/* Foto do perfil */}
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 via-blue-600 to-green-600 rounded-full p-1 shadow-lg">
                <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                  {perfilJogador?.avatar_url ? (
                    <Image 
                      src={perfilJogador.avatar_url} 
                      alt={`Avatar de ${perfilJogador?.username || perfilJogador?.nickname}`}
                      width={88}
                      height={88}
                      className="w-full h-full object-cover rounded-full"
                      onError={(evento) => {
                        evento.target.style.display = 'none';
                        evento.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-4xl">
                      {perfilJogador?.nickname?.charAt(0)?.toUpperCase() || 'J'}
                    </div>
                  )}
                </div>
              </div>
              {/* Badge de nível */}
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                Nv. {levelJogador}
              </div>
            </div>
            
            {/* Nome do usuário */}
            <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              {perfilJogador?.nickname || perfilJogador?.name || 'Jogador'}
            </h1>

            {/* Título do jogador */}
            {perfilJogador?.titulo_info && (
              <p className="text-lg mb-2 italic flex items-center justify-center gap-2">
                <span style={{ color: perfilJogador.titulo_info.cor || '#3B82F6' }}>
                  {perfilJogador.titulo_info.icone} {perfilJogador.titulo_info.nome}
                </span>
              </p>
            )}

            {/* UID */}
            <p className="text-sm text-gray-400 mb-2">
              UID: {perfilJogador?.id || 'Desconhecido'}
            </p>
            
            {/* Ranking MMR */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{iconeRanking}</span>
                <span className={`text-lg font-semibold ${corRanking}`}>
                  {rankingAtual}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                MMR: {mmrJogador}
              </div>
            </div>

            {/* Mensagens de feedback */}
            {mensagemSucesso && (
              <div className="mb-4 p-4 bg-green-600/20 border border-green-500 rounded-lg text-center text-green-300">
                ✅ {mensagemSucesso}
              </div>
            )}

            {erro && (
              <div className="mb-4 p-4 bg-red-600/20 border border-red-500 rounded-lg text-center text-red-300">
                ❌ {erro}
              </div>
            )}
            
            {/* Botões de ação */}
            <div className="flex gap-3">
              {ehProproPerfil ? (
                <Link
                  href="/profile"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-semibold"
                >
                  ✏️ Ver Meu Perfil
                </Link>
              ) : (
                <>
                  {estaAutenticado && (
                    <>
                      {jaAmigo ? (
                        <div className="px-4 py-2 bg-green-700 rounded-lg text-sm font-semibold">
                          ✓ Amigo
                        </div>
                      ) : solicitacaoPendente ? (
                        <div className="px-4 py-2 bg-yellow-700 rounded-lg text-sm font-semibold">
                          ⏳ Solicitação Enviada
                        </div>
                      ) : (
                        <button
                          onClick={handleEnviarSolicitacao}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-semibold"
                        >
                          ➕ Adicionar Amigo
                        </button>
                      )}
                      
                      <button
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-semibold"
                        onClick={() => {
                          // TODO: Implementar convite para partida
                          alert('Em breve: Convidar para partida');
                        }}
                      >
                        ⚔️ Desafiar
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-purple-300">
            📜 Perfil Público
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar com informações do jogador */}
          <div className="space-y-6">
            {/* Card de Progresso */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
              <h3 className="text-lg font-bold mb-4 text-center text-blue-400">📈 Informações</h3>
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-4">
                  Membro desde {perfilJogador?.created_at ? new Date(perfilJogador.created_at).toLocaleDateString('pt-BR') : 'Recente'}
                </div>

                {/* Progresso da Coleção */}
                {colecao && (
                  <div className="bg-black/40 p-4 rounded-lg">
                    <div className="text-sm font-semibold text-blue-400 mb-2">🃏 Coleção</div>
                    <div className="text-lg font-bold">
                      {colecao.total}/{colecao.totalAvailable || 60}
                    </div>
                    <div className="text-xs text-gray-400">
                      {colecao.completionPercentage}% completa
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
              <h3 className="text-lg font-bold mb-4">📊 Estatísticas</h3>
              {estatisticas ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Partidas:</span>
                    <span className="font-bold">{totalPartidas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vitórias:</span>
                    <span className="font-bold text-green-400">{vitorias}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Derrotas:</span>
                    <span className="font-bold text-red-400">{derrotas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Taxa de Vitória:</span>
                    <span className={`font-bold ${obterClasseTaxaVitoria(taxaVitoria)}`}>
                      {taxaVitoria}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Melhor Sequência:</span>
                    <span className="font-bold text-purple-400">{estatisticas.bestStreak || 0}W</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  Estatísticas privadas
                </div>
              )}
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600/30 mb-6">
              <div className="flex border-b border-gray-600/30">
                <button
                  onClick={() => definirAbaAtiva('visaoGeral')}
                  className={`flex-1 p-4 font-semibold transition-colors ${
                    abaAtiva === 'visaoGeral'
                      ? 'text-green-400 border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  🏠 Visão Geral
                </button>
              </div>

              <div className="p-6">
                {abaAtiva === 'visaoGeral' && (
                  <div className="space-y-6">
                    {/* Progresso da Coleção */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {colecao && (
                        <div className="bg-black/40 p-6 rounded-lg">
                          <h4 className="text-xl font-bold mb-4 text-blue-400">🃏 Coleção</h4>
                          <div className="text-center">
                            <div className="text-3xl font-bold mb-2">
                              {colecao.total}/{colecao.totalAvailable || 60}
                            </div>
                            <div className="text-sm text-gray-400 mb-3">Cartas coletadas</div>
                            <div className="w-full bg-gray-700 rounded-full h-3">
                              <div
                                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                                style={{
                                  width: `${colecao.completionPercentage}%`
                                }}
                              ></div>
                            </div>
                            <div className="text-sm text-blue-400 mt-2">
                              {colecao.completionPercentage}% completa
                            </div>
                            {colecao.byRarity && (
                              <div className="mt-4 space-y-1 text-xs text-left">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Comuns:</span>
                                  <span>{colecao.byRarity.comum || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-green-400">Incomuns:</span>
                                  <span>{colecao.byRarity.incomum || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-blue-400">Raras:</span>
                                  <span>{colecao.byRarity.rara || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-purple-400">Épicas:</span>
                                  <span>{colecao.byRarity.epica || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-orange-400">Lendárias:</span>
                                  <span>{colecao.byRarity.lendaria || 0}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="bg-black/40 p-6 rounded-lg">
                        <h4 className="text-xl font-bold mb-4 text-purple-400">📊 Desempenho</h4>
                        <div className="text-center">
                          <div className="text-3xl font-bold mb-2 text-green-400">
                            {vitorias}
                          </div>
                          <div className="text-sm text-gray-400 mb-4">Vitórias</div>
                          
                          <div className="text-2xl font-bold mb-2">
                            {taxaVitoria}%
                          </div>
                          <div className="text-sm text-gray-400 mb-3">Taxa de Vitória</div>
                          
                          <div className="w-full bg-gray-700 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-300 ${
                                taxaVitoria >= 70 ? 'bg-green-500' : 
                                taxaVitoria >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{
                                width: `${taxaVitoria}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/profile"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold"
          >
            ← Voltar ao Meu Perfil
          </Link>
        </div>
      </div>
    </LayoutDePagina>
  );
}
