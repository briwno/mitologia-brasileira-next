// src/app/profile/friends/page.js
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import LayoutDePagina from '@/components/UI/PageLayout';
import { calcularRankingPorMMR, obterIconeRanking, obterCorRanking } from '@/utils/mmrUtils';

export default function PaginaAmigos() {
  const [abaAtiva, definirAbaAtiva] = useState('amigos');
  const [busca, definirBusca] = useState('');
  const [jogadoresBuscados, definirJogadoresBuscados] = useState([]);
  const [buscando, definirBuscando] = useState(false);
  const [erro, definirErro] = useState(null);
  const [mensagemSucesso, definirMensagemSucesso] = useState('');
  
  const contextoAutenticacao = useAuth();
  const { user: usuario, isAuthenticated: verificarAutenticacao } = contextoAutenticacao || {};

  const {
    friends: amigos,
    pendingRequests: solicitacoesPendentes,
    sentRequests: solicitacoesEnviadas,
    loading: carregando,
    friendsCount: totalAmigos,
    pendingCount: totalPendentes,
    sendFriendRequest: enviarSolicitacao,
    acceptFriendRequest: aceitarSolicitacao,
    rejectFriendRequest: rejeitarSolicitacao,
    removeFriend: removerAmigo,
    searchPlayer: buscarJogador,
    refreshFriends: atualizarAmigos
  } = useFriends();

  let estaAutenticado;
  if (typeof verificarAutenticacao === 'function') {
    estaAutenticado = verificarAutenticacao();
  } else {
    estaAutenticado = false;
  }

  // Buscar jogador(es)
  const handleBuscarJogador = async () => {
    if (!busca || busca.length < 3) {
      definirErro('Digite pelo menos 3 caracteres');
      return;
    }

    definirBuscando(true);
    definirErro(null);
    definirJogadoresBuscados([]);
    definirMensagemSucesso('');

    try {
      const jogadores = await buscarJogador(busca);
      
      if (!jogadores || jogadores.length === 0) {
        definirErro('Nenhum jogador encontrado');
        return;
      }

      // Filtrar e adicionar informações extras para cada jogador
      const jogadoresComStatus = jogadores
        .filter(jogador => jogador.id !== usuario?.id) // Remover o próprio usuário
        .map(jogador => {
          const jaAmigo = amigos.some(a => a.friend.id === jogador.id);
          const pendente = [...solicitacoesPendentes, ...solicitacoesEnviadas].some(
            s => s.friend.id === jogador.id
          );

          return {
            ...jogador,
            jaAmigo,
            solicitacaoPendente: pendente
          };
        });

      if (jogadoresComStatus.length === 0) {
        definirErro('Nenhum jogador disponível para adicionar');
        return;
      }

      definirJogadoresBuscados(jogadoresComStatus);
    } catch (err) {
      definirErro(err.message);
    } finally {
      definirBuscando(false);
    }
  };

  // Enviar solicitação de amizade
  const handleEnviarSolicitacao = async (friendId, nomeAmigo) => {
    try {
      await enviarSolicitacao(friendId);
      definirMensagemSucesso(`Solicitação enviada para ${nomeAmigo}!`);
      
      // Atualizar lista de jogadores buscados
      definirJogadoresBuscados(prev => 
        prev.map(j => j.id === friendId ? { ...j, solicitacaoPendente: true } : j)
      );
      
      setTimeout(() => {
        definirMensagemSucesso('');
      }, 3000);
    } catch (err) {
      definirErro(err.message);
    }
  };

  // Aceitar solicitação
  const handleAceitarSolicitacao = async (friendshipId) => {
    try {
      await aceitarSolicitacao(friendshipId);
      definirMensagemSucesso('Amigo adicionado com sucesso!');
      setTimeout(() => definirMensagemSucesso(''), 3000);
    } catch (err) {
      definirErro(err.message);
    }
  };

  // Rejeitar solicitação
  const handleRejeitarSolicitacao = async (friendshipId) => {
    try {
      await rejeitarSolicitacao(friendshipId);
      definirMensagemSucesso('Solicitação rejeitada');
      setTimeout(() => definirMensagemSucesso(''), 3000);
    } catch (err) {
      definirErro(err.message);
    }
  };

  // Remover amigo
  const handleRemoverAmigo = async (friendshipId, nomeAmigo) => {
    if (!confirm(`Tem certeza que deseja remover ${nomeAmigo} da sua lista de amigos?`)) {
      return;
    }

    try {
      await removerAmigo(friendshipId);
      definirMensagemSucesso('Amigo removido');
      setTimeout(() => definirMensagemSucesso(''), 3000);
    } catch (err) {
      definirErro(err.message);
    }
  };

  if (!estaAutenticado) {
    return (
      <LayoutDePagina>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              👥 Amigos
            </h1>
            <div className="text-xl text-red-400 mb-4">
              Você precisa estar logado para ver seus amigos
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
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            👥 Amigos
          </h1>
          <p className="text-xl text-purple-300">
            Gerencie sua lista de amigos e convites
          </p>
        </div>

        {/* Mensagens de feedback */}
        {mensagemSucesso && (
          <div className="mb-6 p-4 bg-green-600/20 border border-green-500 rounded-lg text-center text-green-300">
            ✅ {mensagemSucesso}
          </div>
        )}

        {erro && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-center text-red-300">
            ❌ {erro}
          </div>
        )}

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30 text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">{totalAmigos}</div>
            <div className="text-gray-400">Amigos</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30 text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">{totalPendentes}</div>
            <div className="text-gray-400">Solicitações Recebidas</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30 text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">{solicitacoesEnviadas.length}</div>
            <div className="text-gray-400">Solicitações Enviadas</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600/30 mb-6">
          <div className="flex border-b border-gray-600/30 overflow-x-auto">
            <button
              onClick={() => definirAbaAtiva('amigos')}
              className={`flex-1 p-4 font-semibold transition-colors whitespace-nowrap ${
                abaAtiva === 'amigos'
                  ? 'text-green-400 border-b-2 border-green-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              👥 Meus Amigos ({totalAmigos})
            </button>
            <button
              onClick={() => definirAbaAtiva('pendentes')}
              className={`flex-1 p-4 font-semibold transition-colors whitespace-nowrap ${
                abaAtiva === 'pendentes'
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              📬 Recebidas ({totalPendentes})
            </button>
            <button
              onClick={() => definirAbaAtiva('enviadas')}
              className={`flex-1 p-4 font-semibold transition-colors whitespace-nowrap ${
                abaAtiva === 'enviadas'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              📤 Enviadas ({solicitacoesEnviadas.length})
            </button>
            <button
              onClick={() => definirAbaAtiva('adicionar')}
              className={`flex-1 p-4 font-semibold transition-colors whitespace-nowrap ${
                abaAtiva === 'adicionar'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              ➕ Adicionar Amigo
            </button>
          </div>

          <div className="p-6">
            {carregando ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
                </div>
                <div className="text-gray-400">Carregando...</div>
              </div>
            ) : (
              <>
                {/* Aba: Meus Amigos */}
                {abaAtiva === 'amigos' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6 text-green-400">👥 Meus Amigos</h3>
                    {amigos.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <div className="text-6xl mb-4">😔</div>
                        <p className="text-xl mb-2">Você ainda não tem amigos</p>
                        <p className="text-sm mb-6">Adicione amigos para jogar juntos!</p>
                        <button
                          onClick={() => definirAbaAtiva('adicionar')}
                          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-semibold"
                        >
                          ➕ Adicionar Primeiro Amigo
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {amigos.map((amizade) => {
                          const amigo = amizade.friend;
                          const ranking = calcularRankingPorMMR(amigo.mmr || 0);
                          const iconeRanking = obterIconeRanking(ranking);
                          const corRanking = obterCorRanking(ranking);

                          return (
                            <div
                              key={amizade.id}
                              className="bg-black/40 p-4 rounded-lg border border-green-500/30 hover:border-green-400/50 transition-colors"
                            >
                              <div className="flex items-start gap-3 mb-3">
                                {/* Avatar */}
                                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-full p-1 flex-shrink-0">
                                  <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                                    {amigo.avatar_url ? (
                                      <Image
                                        src={amigo.avatar_url}
                                        alt={amigo.nickname}
                                        width={56}
                                        height={56}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="text-2xl">👤</div>
                                    )}
                                  </div>
                                </div>

                                {/* Informações */}
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-lg truncate">{amigo.nickname}</div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-400">Nv. {amigo.level || 1}</span>
                                    <span className={corRanking}>
                                      {iconeRanking} {ranking}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    MMR: {amigo.mmr || 0}
                                  </div>
                                </div>
                              </div>

                              {/* Ações */}
                              <div className="flex gap-2">
                                <button
                                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold transition-colors"
                                  onClick={() => {
                                    // TODO: Implementar convite para partida
                                    alert('Em breve: Convidar para partida');
                                  }}
                                >
                                  ⚔️ Desafiar
                                </button>
                                <button
                                  className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold transition-colors"
                                  onClick={() => handleRemoverAmigo(amizade.friendshipId, amigo.nickname)}
                                  title="Remover amigo"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Aba: Solicitações Recebidas */}
                {abaAtiva === 'pendentes' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6 text-yellow-400">📬 Solicitações Recebidas</h3>
                    {solicitacoesPendentes.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <div className="text-6xl mb-4">📭</div>
                        <p>Nenhuma solicitação pendente</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {solicitacoesPendentes.map((solicitacao) => {
                          const jogador = solicitacao.friend;
                          const ranking = calcularRankingPorMMR(jogador.mmr || 0);
                          const iconeRanking = obterIconeRanking(ranking);
                          const corRanking = obterCorRanking(ranking);

                          return (
                            <div
                              key={solicitacao.id}
                              className="bg-black/40 p-4 rounded-lg border border-yellow-500/30"
                            >
                              <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-full p-1 flex-shrink-0">
                                  <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                                    {jogador.avatar_url ? (
                                      <Image
                                        src={jogador.avatar_url}
                                        alt={jogador.nickname}
                                        width={56}
                                        height={56}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="text-2xl">👤</div>
                                    )}
                                  </div>
                                </div>

                                {/* Informações */}
                                <div className="flex-1">
                                  <div className="font-bold text-lg">{jogador.nickname}</div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-400">Nv. {jogador.level || 1}</span>
                                    <span className={corRanking}>
                                      {iconeRanking} {ranking}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {new Date(solicitacao.createdAt).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>

                                {/* Ações */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAceitarSolicitacao(solicitacao.friendshipId)}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold transition-colors"
                                  >
                                    ✓ Aceitar
                                  </button>
                                  <button
                                    onClick={() => handleRejeitarSolicitacao(solicitacao.friendshipId)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold transition-colors"
                                  >
                                    ✗ Rejeitar
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Aba: Solicitações Enviadas */}
                {abaAtiva === 'enviadas' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6 text-blue-400">📤 Solicitações Enviadas</h3>
                    {solicitacoesEnviadas.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <div className="text-6xl mb-4">📪</div>
                        <p>Nenhuma solicitação enviada</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {solicitacoesEnviadas.map((solicitacao) => {
                          const jogador = solicitacao.friend;
                          const ranking = calcularRankingPorMMR(jogador.mmr || 0);
                          const iconeRanking = obterIconeRanking(ranking);
                          const corRanking = obterCorRanking(ranking);

                          return (
                            <div
                              key={solicitacao.id}
                              className="bg-black/40 p-4 rounded-lg border border-blue-500/30"
                            >
                              <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-1 flex-shrink-0">
                                  <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                                    {jogador.avatar_url ? (
                                      <Image
                                        src={jogador.avatar_url}
                                        alt={jogador.nickname}
                                        width={56}
                                        height={56}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="text-2xl">👤</div>
                                    )}
                                  </div>
                                </div>

                                {/* Informações */}
                                <div className="flex-1">
                                  <div className="font-bold text-lg">{jogador.nickname}</div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-400">Nv. {jogador.level || 1}</span>
                                    <span className={corRanking}>
                                      {iconeRanking} {ranking}
                                    </span>
                                  </div>
                                  <div className="text-xs text-yellow-400">
                                    ⏳ Aguardando resposta
                                  </div>
                                </div>

                                {/* Data */}
                                <div className="text-xs text-gray-400">
                                  {new Date(solicitacao.createdAt).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Aba: Adicionar Amigo */}
                {abaAtiva === 'adicionar' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6 text-purple-400">➕ Adicionar Novo Amigo</h3>
                    
                    {/* Campo de busca */}
                    <div className="bg-black/40 p-6 rounded-lg border border-purple-500/30 mb-6">
                      <label className="block text-sm font-semibold mb-2">Buscar Jogadores</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={busca}
                          onChange={(e) => {
                            definirBusca(e.target.value);
                            definirErro(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleBuscarJogador();
                            }
                          }}
                          placeholder="Digite o nickname (mínimo 3 letras) ou UID do jogador..."
                          className="flex-1 px-4 py-2 bg-black/50 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                        />
                        <button
                          onClick={handleBuscarJogador}
                          disabled={buscando || !busca || busca.length < 3}
                          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                        >
                          {buscando ? '🔍 Buscando...' : '🔍 Buscar'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        💡 Busca parcial: Digite parte do nickname (min. 3 letras) • Busca exata: Cole o UID do jogador
                      </p>
                    </div>

                    {/* Resultados da busca */}
                    {jogadoresBuscados.length > 0 && (
                      <div className="bg-black/40 p-6 rounded-lg border border-green-500/30">
                        <h4 className="text-lg font-bold mb-4 text-green-400">
                          {jogadoresBuscados.length === 1 
                            ? 'Jogador Encontrado' 
                            : `${jogadoresBuscados.length} Jogadores Encontrados`}
                        </h4>
                        <div className="space-y-3">
                          {jogadoresBuscados.map((jogador) => {
                            const ranking = calcularRankingPorMMR(jogador.mmr || 0);
                            const iconeRanking = obterIconeRanking(ranking);
                            const corRanking = obterCorRanking(ranking);

                            return (
                              <div
                                key={jogador.id}
                                className="bg-black/30 p-4 rounded-lg border border-gray-600/30 hover:border-purple-400/50 transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  {/* Avatar */}
                                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full p-1 flex-shrink-0">
                                    <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                                      {jogador.avatar_url ? (
                                        <Image
                                          src={jogador.avatar_url}
                                          alt={jogador.nickname}
                                          width={56}
                                          height={56}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="text-2xl">👤</div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Informações */}
                                  <div className="flex-1">
                                    <div className="font-bold text-lg mb-1">{jogador.nickname}</div>
                                    <div className="flex items-center gap-3 text-sm mb-1">
                                      <span className="text-gray-400">Nv. {jogador.level || 1}</span>
                                      <span className={corRanking}>
                                        {iconeRanking} {ranking}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      MMR: {jogador.mmr || 0}
                                    </div>
                                  </div>

                                  {/* Ação */}
                                  <div>
                                    {jogador.jaAmigo ? (
                                      <div className="px-4 py-2 bg-gray-700 rounded-lg text-center">
                                        <div className="text-green-400 text-sm font-semibold">✓ Amigo</div>
                                      </div>
                                    ) : jogador.solicitacaoPendente ? (
                                      <div className="px-4 py-2 bg-gray-700 rounded-lg text-center">
                                        <div className="text-yellow-400 text-sm font-semibold">⏳ Pendente</div>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleEnviarSolicitacao(jogador.id, jogador.nickname)}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors text-sm"
                                      >
                                        ➕ Adicionar
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
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
