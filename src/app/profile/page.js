// src/app/profile/page.js
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth as usarAutenticacao } from '@/hooks/useAuth';
import { usePlayerData as usarDadosJogador } from '@/hooks/usePlayerData';
import { useMMR } from '@/hooks/useMMR';
import LayoutDePagina from '@/components/UI/PageLayout';
import { calcularRankingPorMMR, calcularProgressoRanking, obterIconeRanking, obterCorRanking } from '@/utils/mmrUtils';

export default function PaginaPerfil() {
  const [abaAtiva, definirAbaAtiva] = useState('visaoGeral');
  const contextoAutenticacao = usarAutenticacao();
  const { user: usuario, isAuthenticated: verificarAutenticacao } = contextoAutenticacao || {};
  
  // Hook de dados do jogador
  const informacoesJogador = usarDadosJogador();
  const {
    currencies: moedas,
    stats: estatisticas,
    collection: colecao,
    quests: missoes,
    winRate: taxaVitoria,
    levelProgress: progressoNivel,
    loading: carregando,
    error: erro,
  } = informacoesJogador || {};
  
  // Hook de MMR para dados de ranking
  const { ranking: dadosRanking, mmr: mmrDoHook, level: levelDoHook } = useMMR();

  let estaAutenticado;
  if (typeof verificarAutenticacao === 'function') {
    estaAutenticado = verificarAutenticacao();
  } else {
    estaAutenticado = false;
  }

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

  if (!estaAutenticado) {
    return (
      <LayoutDePagina>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              👤 Perfil do Jogador
            </h1>
            <div className="text-xl text-red-400 mb-4">
              Você precisa estar logado para ver seu perfil
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

  if (erro) {
    return (
      <LayoutDePagina>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              👤 Perfil do Jogador
            </h1>
            <div className="text-xl text-red-400 mb-4">
              {erro}
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

  // Dados do jogador vindos do hook
  const partidasRecentes = estatisticas?.recentMatches || [];
  const conquistas = estatisticas?.achievements || [];
  const cartasFavoritas = estatisticas?.favoriteCards || [];

  // Calcular ranking baseado no MMR (priorizar dados do hook)
  const mmrJogador = mmrDoHook || usuario?.mmr || 0;
  const levelJogador = levelDoHook || usuario?.level || 1;
  const rankingAtual = dadosRanking?.ranking || calcularRankingPorMMR(mmrJogador);
  const progressoRanking = dadosRanking?.progresso || calcularProgressoRanking(mmrJogador);
  const iconeRanking = dadosRanking?.icone || obterIconeRanking(rankingAtual);
  const corRanking = dadosRanking?.cor || obterCorRanking(rankingAtual);

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
                  {usuario?.avatar_url ? (
                    <Image 
                      src={usuario.avatar_url} 
                      alt={`Avatar de ${usuario?.username || usuario?.name}`}
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
                      {usuario?.name?.charAt(0)?.toUpperCase() || usuario?.username?.charAt(0)?.toUpperCase() || 'J'}
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
              {usuario?.nickname || usuario?.name || 'Jogador'}
            </h1>

            {/* Título do jogador */}
            {usuario?.title && (
              <p className="text-lg text-cyan-400 mb-2 italic">
                {usuario.title}
              </p>
            )}

            {/* UID */}
            <p className="text-sm text-gray-400 mb-2">
              UID: {usuario?.id || 'Desconhecido'}
            </p>

            {/* Email e informações adicionais */}
            {usuario?.email && (
              <p className="text-sm text-gray-400 mb-2">
                {usuario.email}
              </p>
            )}
            
            {/* Ranking MMR */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{iconeRanking}</span>
                <span className={`text-lg font-semibold ${corRanking}`}>
                  {rankingAtual}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                MMR: {mmrJogador} / {progressoRanking.mmrProximo !== mmrJogador ? progressoRanking.mmrProximo : '∞'}
              </div>
              {/* Barra de progresso para próximo ranking */}
              {progressoRanking.proximo !== 'Lenda Máxima' && (
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{rankingAtual}</span>
                    <span>{progressoRanking.progresso}%</span>
                    <span>{progressoRanking.proximo}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressoRanking.progresso}%` }}
                    ></div>
                  </div>
                </div>
              )}
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
                  Membro desde {usuario?.created_at ? new Date(usuario.created_at).toLocaleDateString('pt-BR') : 'Recente'}
                </div>

                {/* Nível e XP */}
                {progressoNivel && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Nível {levelJogador}</span>
                      <span>
                        {progressoNivel.currentXP}/{progressoNivel.xpNeeded} XP
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${progressoNivel.percentage}%`
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {progressoNivel.xpToNext} XP para o próximo nível
                    </div>
                  </div>
                )}

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
                    <span className="font-bold">{estatisticas.totalGames || (estatisticas.wins + estatisticas.losses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vitórias:</span>
                    <span className="font-bold text-green-400">{estatisticas.wins || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Derrotas:</span>
                    <span className="font-bold text-red-400">{estatisticas.losses || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Taxa de Vitória:</span>
                    <span className={`font-bold ${obterClasseTaxaVitoria(taxaVitoria)}`}>
                      {taxaVitoria}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sequência Atual:</span>
                    <span className="font-bold text-yellow-400">{estatisticas.currentStreak || 0}W</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Melhor Sequência:</span>
                    <span className="font-bold text-purple-400">{estatisticas.bestStreak || 0}W</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  Nenhuma estatística disponível
                </div>
              )}
            </div>

            {/* Moedas e Recursos */}
            {moedas && (
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
                <h3 className="text-lg font-bold mb-4">💰 Recursos</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Ouro:</span>
                    <span className="font-bold text-yellow-400">{moedas.gold?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Gemas:</span>
                    <span className="font-bold text-blue-400">{moedas.gems?.toLocaleString() || 0}</span>
                  </div>
                  {moedas.tokens > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Tokens:</span>
                      <span className="font-bold text-purple-400">{moedas.tokens}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
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
                        <h4 className="text-xl font-bold mb-4 text-yellow-400">🏆 Conquistas</h4>
                        <div className="text-center">
                          <div className="text-3xl font-bold mb-2">
                            {conquistas.filter((conquista) => conquista.completed).length}/
                            {conquistas.length}
                          </div>
                          <div className="text-sm text-gray-400 mb-3">Conquistas desbloqueadas</div>
                          <div className="w-full bg-gray-700 rounded-full h-3">
                            <div
                              className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
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
