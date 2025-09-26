// src/app/profile/page.js
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth as usarAutenticacao } from '../../hooks/useAuth';
import LayoutDePagina from '../../components/UI/PageLayout';

export default function PaginaPerfil() {
  const [abaAtiva, definirAbaAtiva] = useState('visaoGeral');
  const [dadosPerfil, definirDadosPerfil] = useState(null);
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState(null);
  const contextoAutenticacao = usarAutenticacao();
  const { user: usuario, isAuthenticated: verificarAutenticacao } = contextoAutenticacao || {};

  useEffect(() => {
    const carregarDadosPerfil = async () => {
      if (!verificarAutenticacao?.() || !usuario?.id) {
        definirErro('Você precisa estar logado para ver seu perfil');
        definirCarregando(false);
        return;
      }

      try {
        definirCarregando(true);
        const resposta = await fetch(`/api/profile?playerId=${usuario.id}`);

        if (!resposta.ok) {
          throw new Error('Erro ao carregar dados do perfil');
        }

        const dados = await resposta.json();
        definirDadosPerfil(dados.profile);
      } catch (erroCarregamento) {
        console.error('Erro ao buscar dados do perfil:', erroCarregamento);
        definirErro(erroCarregamento.message);
      } finally {
        definirCarregando(false);
      }
    };

    carregarDadosPerfil();
  }, [usuario?.id, verificarAutenticacao]);

  if (carregando) {
    return (
      <LayoutDePagina>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              👤 Perfil do Jogador
            </h1>
            <div className="text-xl text-purple-300 mb-8">Carregando dados do perfil...</div>
            {/* Animação de carregamento */}
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400"></div>
            </div>
          </div>
        </div>
      </LayoutDePagina>
    );
  }

  if (erro || !dadosPerfil) {
    return (
      <LayoutDePagina>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              👤 Perfil do Jogador
            </h1>
            <div className="text-xl text-red-400 mb-4">
              {erro || 'Erro ao carregar dados do perfil'}
            </div>
            {erro === 'Você precisa estar logado para ver seu perfil' && (
              <div className="mb-4">
                <Link
                  href="/login"
                  className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold mr-4"
                >
                  Fazer Login
                </Link>
              </div>
            )}
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

  const estatisticasJogador = dadosPerfil;
  const partidasRecentes = dadosPerfil.recentMatches || [];
  const conquistas = dadosPerfil.achievementsList || [];
  const cartasFavoritas = dadosPerfil.favoriteCards || [];

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
                  {(usuario?.avatar_url || estatisticasJogador?.avatar_url) ? (
                    <Image 
                      src={usuario?.avatar_url || estatisticasJogador?.avatar_url} 
                      alt={`Avatar de ${estatisticasJogador?.username || usuario?.username}`}
                      width={88}
                      height={88}
                      className="w-full h-full object-cover rounded-full"
                      onError={(evento) => {
                        evento.target.style.display = 'none';
                        evento.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <Image 
                      src="/images/avatars/player.jpg"
                      alt={`Avatar padrão de ${estatisticasJogador?.username || usuario?.username}`}
                      width={88}
                      height={88}
                      className="w-full h-full object-cover rounded-full"
                    />
                  )}
                </div>
              </div>
              {/* Badge de nível */}
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                Nv. {estatisticasJogador?.level || 1}
              </div>
            </div>
            
            {/* Nome do usuário */}
            <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              {estatisticasJogador?.username || usuario?.username || 'Jogador'}
            </h1>
            
            {/* Email e informações adicionais */}
            {(usuario?.email || estatisticasJogador?.email) && (
              <p className="text-sm text-gray-400 mb-2">
                {usuario?.email || estatisticasJogador?.email}
              </p>
            )}
            
            {/* Rank */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-lg font-semibold text-yellow-400">
                {estatisticasJogador?.rank || 'Bronze I'}
              </span>
              <span className="text-sm text-gray-400">
                ({estatisticasJogador?.rankPoints || 0} pontos)
              </span>
            </div>
            
            {/* Botão de editar perfil */}
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-semibold">
              ✏️ Editar Perfil
            </button>
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-purple-300">
            📜 Perfil do Jogador
          </h2>
          <p className="text-xl text-purple-300">
            Acompanhe seu progresso e conquistas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar com informações do jogador */}
          <div className="space-y-6">
            {/* Card de Progresso */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
              <h3 className="text-lg font-bold mb-4 text-center text-blue-400">📈 Progresso</h3>
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-4">
                  Membro desde {estatisticasJogador.joinDate}
                </div>

                {/* Nível e XP */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Nível {estatisticasJogador.level}</span>
                    <span>
                      {estatisticasJogador.xp}/
                      {estatisticasJogador.xp + estatisticasJogador.xpToNext} XP
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${(estatisticasJogador.xp / (estatisticasJogador.xp + estatisticasJogador.xpToNext)) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {estatisticasJogador.xpToNext} XP para o próximo nível
                  </div>
                </div>

                {/* Progresso da Coleção */}
                <div className="bg-black/40 p-4 rounded-lg">
                  <div className="text-sm font-semibold text-blue-400 mb-2">🃏 Coleção</div>
                  <div className="text-lg font-bold">
                    {estatisticasJogador.totalCardsCollected}/
                    {estatisticasJogador.totalCardsAvailable}
                  </div>
                  <div className="text-xs text-gray-400">
                    {estatisticasJogador.totalCardsAvailable > 0
                      ? `${Math.round((estatisticasJogador.totalCardsCollected / estatisticasJogador.totalCardsAvailable) * 100)}% completa`
                      : 'Nenhuma carta disponível'}
                  </div>
                </div>
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
              <h3 className="text-lg font-bold mb-4">📊 Estatísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Partidas:</span>
                  <span className="font-bold">{estatisticasJogador.totalGames}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vitórias:</span>
                  <span className="font-bold text-green-400">{estatisticasJogador.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Derrotas:</span>
                  <span className="font-bold text-red-400">{estatisticasJogador.losses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Taxa de Vitória:</span>
                  <span className={`font-bold ${obterClasseTaxaVitoria(estatisticasJogador.winRate)}`}>
                    {estatisticasJogador.winRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sequência Atual:</span>
                  <span className="font-bold text-yellow-400">{estatisticasJogador.currentStreak}W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Melhor Sequência:</span>
                  <span className="font-bold text-purple-400">{estatisticasJogador.bestStreak}W</span>
                </div>
              </div>
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
                <button
                  onClick={() => definirAbaAtiva('partidas')}
                  className={`flex-1 p-4 font-semibold transition-colors ${
                    abaAtiva === 'partidas'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  ⚔️ Partidas
                </button>
                <button
                  onClick={() => definirAbaAtiva('conquistas')}
                  className={`flex-1 p-4 font-semibold transition-colors ${
                    abaAtiva === 'conquistas'
                      ? 'text-yellow-400 border-b-2 border-yellow-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  🏆 Conquistas
                </button>
              </div>

              <div className="p-6">
                {abaAtiva === 'visaoGeral' && (
                  <div className="space-y-6">
                    {/* Progresso da Coleção */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-black/40 p-6 rounded-lg">
                        <h4 className="text-xl font-bold mb-4 text-blue-400">🃏 Coleção</h4>
                        <div className="text-center">
                          <div className="text-3xl font-bold mb-2">
                            {estatisticasJogador.totalCardsCollected}/
                            {estatisticasJogador.totalCardsAvailable}
                          </div>
                          <div className="text-sm text-gray-400 mb-3">Cartas coletadas</div>
                          <div className="w-full bg-gray-700 rounded-full h-3">
                            <div
                              className="bg-blue-500 h-3 rounded-full"
                              style={{
                                width: `${estatisticasJogador.totalCardsAvailable > 0
                                  ? (estatisticasJogador.totalCardsCollected / estatisticasJogador.totalCardsAvailable) * 100
                                  : 0}%`
                              }}
                            ></div>
                          </div>
                          <div className="text-sm text-blue-400 mt-2">
                            {estatisticasJogador.totalCardsAvailable > 0
                              ? `${Math.round((estatisticasJogador.totalCardsCollected / estatisticasJogador.totalCardsAvailable) * 100)}% completa`
                              : 'Nenhuma carta disponível'}
                          </div>
                        </div>
                      </div>

                      <div className="bg-black/40 p-6 rounded-lg">
                        <h4 className="text-xl font-bold mb-4 text-yellow-400">🏆 Conquistas</h4>
                        <div className="text-center">
                          <div className="text-3xl font-bold mb-2">
                            {conquistas.filter((conquista) => conquista.completed).length}/
                            {conquistas.length}
                          </div>
                          <div className="text-sm text-gray-400 mb-3">Conquistas desbloqueadas</div>
                          <div className="w-full bg-gray-700 rounded-full h-3">
                            <div
                              className="bg-yellow-500 h-3 rounded-full"
                              style={{
                                width: `${conquistas.length > 0
                                  ? (conquistas.filter((conquista) => conquista.completed).length / conquistas.length) * 100
                                  : 0}%`
                              }}
                            ></div>
                          </div>
                          <div className="text-sm text-yellow-400 mt-2">
                            {conquistas.length > 0
                              ? `${Math.round((conquistas.filter((conquista) => conquista.completed).length / conquistas.length) * 100)}% completas`
                              : 'Nenhuma conquista disponível'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cartas Favoritas */}
                    <div className="bg-black/40 p-6 rounded-lg">
                      <h4 className="text-xl font-bold mb-4 text-green-400">💚 Cartas Mais Usadas</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cartasFavoritas.length === 0 && (
                          <div className="col-span-full text-center text-gray-400">
                            Nenhuma carta favorita registrada ainda.
                          </div>
                        )}
                        {cartasFavoritas.map((carta, indice) => (
                          <div key={indice} className="bg-black/30 p-4 rounded border border-gray-600/30">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-bold">{carta.name}</div>
                                <div className="text-sm text-gray-400">{carta.category}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-400">{carta.timesPlayed} jogos</div>
                                <div className={`text-sm font-bold ${obterClasseTaxaVitoria(carta.winRate)}`}>
                                  {carta.winRate}% vitórias
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {abaAtiva === 'partidas' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6">📜 Histórico de Partidas</h3>
                    {partidasRecentes.length === 0 ? (
                      <div className="text-center text-gray-400">
                        Nenhuma partida registrada ainda.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {partidasRecentes.map((partida) => (
                          <div
                            key={partida.id}
                            className={`bg-black/40 p-4 rounded-lg border ${
                              partida.result === 'win' ? 'border-green-500/30' : 'border-red-500/30'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-4">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    partida.result === 'win' ? 'bg-green-500' : 'bg-red-500'
                                  }`}
                                ></div>
                                <div>
                                  <div className="font-bold">vs {partida.opponent}</div>
                                  <div className="text-sm text-gray-400">{partida.deck}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`font-bold ${
                                    partida.result === 'win' ? 'text-green-400' : 'text-red-400'
                                  }`}
                                >
                                  {partida.result === 'win' ? 'VITÓRIA' : 'DERROTA'}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {partida.duration} • {partida.date}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-center mt-6">
                      <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                        Ver mais partidas
                      </button>
                    </div>
                  </div>
                )}

                {abaAtiva === 'conquistas' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6">🏆 Conquistas</h3>
                    {conquistas.length === 0 ? (
                      <div className="text-center text-gray-400">
                        Nenhuma conquista disponível no momento.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {conquistas.map((conquista) => (
                          <div
                            key={conquista.id}
                            className={`bg-black/40 p-4 rounded-lg border ${
                              conquista.completed ? 'border-yellow-500/50' : 'border-gray-600/30'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`text-2xl ${conquista.completed ? '' : 'grayscale opacity-50'}`}>
                                {conquista.icon}
                              </div>
                              <div className="flex-1">
                                <div className={`font-bold ${conquista.completed ? 'text-yellow-400' : 'text-gray-400'}`}>
                                  {conquista.name}
                                </div>
                                <div className="text-sm text-gray-400 mb-2">
                                  {conquista.description}
                                </div>
                                {conquista.completed ? (
                                  <div className="text-xs text-green-400">
                                    ✅ Desbloqueado em {conquista.date}
                                  </div>
                                ) : conquista.progress ? (
                                  <div>
                                    <div className="text-xs text-gray-400 mb-1">
                                      Progresso: {conquista.progress}/{conquista.total}
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                      <div
                                        className="bg-yellow-500 h-2 rounded-full"
                                        style={{ width: `${(conquista.progress / conquista.total) * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-500">🔒 Não desbloqueado</div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold"
          >
            ← Voltar ao Menu Principal
          </Link>
        </div>
      </div>
    </LayoutDePagina>
  );
}
