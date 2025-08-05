// src/app/ranking/page.js
"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function Ranking() {
  const [activeTab, setActiveTab] = useState('global');
  const [selectedSeason, setSelectedSeason] = useState('current');

  const globalRanking = [
    { rank: 1, username: 'CurupiraMaster', points: 3250, tier: 'Diamante I', region: 'Amazônia', winRate: 89, avatar: '👑' },
    { rank: 2, username: 'IaraQueen', points: 3180, tier: 'Diamante II', region: 'Norte', winRate: 85, avatar: '🧜‍♀️' },
    { rank: 3, username: 'SaciLegend', points: 3050, tier: 'Diamante III', region: 'Nacional', winRate: 82, avatar: '🎭' },
    { rank: 4, username: 'BoitataKing', points: 2920, tier: 'Platina I', region: 'Sul', winRate: 80, avatar: '🐍' },
    { rank: 5, username: 'CucaMaster', points: 2850, tier: 'Platina I', region: 'Sudeste', winRate: 78, avatar: '👹' },
    { rank: 6, username: 'LobisPlayer', points: 2750, tier: 'Platina II', region: 'Sul', winRate: 76, avatar: '🐺' },
    { rank: 7, username: 'MapinguariMain', points: 2680, tier: 'Platina II', region: 'Amazônia', winRate: 74, avatar: '🦍' },
    { rank: 8, username: 'CaiporaGamer', points: 2550, tier: 'Platina III', region: 'Nacional', winRate: 72, avatar: '🍃' },
    { rank: 9, username: 'MulaPlayer', points: 2480, tier: 'Ouro I', region: 'Sudeste', winRate: 70, avatar: '🐴' },
    { rank: 10, username: 'BotoRosa', points: 2420, tier: 'Ouro I', region: 'Norte', winRate: 68, avatar: '🐬' },
    // Posição do jogador atual
    { rank: 47, username: 'CurupiraMain', points: 1247, tier: 'Ouro III', region: 'Amazônia', winRate: 57, avatar: '👤', isCurrentPlayer: true }
  ];

  const seasonalRanking = [
    { rank: 1, username: 'SeasonMaster', points: 850, tier: 'Diamante I', winRate: 92, avatar: '🏆' },
    { rank: 2, username: 'QuickClimber', points: 780, tier: 'Platina I', winRate: 88, avatar: '⚡' },
    { rank: 3, username: 'RisingLegend', points: 720, tier: 'Platina II', winRate: 85, avatar: '📈' }
  ];

  const weeklyLeaders = [
    { rank: 1, username: 'WeekWarrior', points: 150, wins: 25, avatar: '⭐' },
    { rank: 2, username: 'FastClimber', points: 140, wins: 23, avatar: '🚀' },
    { rank: 3, username: 'ConsistentPlay', points: 130, wins: 22, avatar: '💎' }
  ];

  const achievements = [
    { name: 'Primeira Lenda', description: 'Primeiro jogador a alcançar Diamante I', player: 'CurupiraMaster', date: '15 Jan 2024' },
    { name: 'Invencível', description: 'Maior sequência de vitórias: 47 jogos', player: 'IaraQueen', date: '28 Jan 2024' },
    { name: 'Colecionador Máximo', description: 'Primeiro a completar 100% da coleção', player: 'SaciLegend', date: '5 Fev 2024' },
    { name: 'Mestre do Museu', description: 'Maior pontuação no modo quiz: 9,850 pts', player: 'CucaMaster', date: '12 Fev 2024' }
  ];

  const getTierColor = (tier) => {
    if (tier.includes('Diamante')) return 'text-cyan-400';
    if (tier.includes('Platina')) return 'text-gray-300';
    if (tier.includes('Ouro')) return 'text-yellow-400';
    if (tier.includes('Prata')) return 'text-gray-400';
    return 'text-orange-400';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            🏆 Ranking
          </h1>
          <p className="text-xl text-orange-300">
            Os melhores jogadores do Batalha dos Encantados
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Podium e Top Players */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600/30 mb-6">
              <div className="flex border-b border-gray-600/30">
                <button
                  onClick={() => setActiveTab('global')}
                  className={`flex-1 p-4 font-semibold transition-colors ${
                    activeTab === 'global' 
                      ? 'text-yellow-400 border-b-2 border-yellow-400' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  🌍 Ranking Global
                </button>
                <button
                  onClick={() => setActiveTab('seasonal')}
                  className={`flex-1 p-4 font-semibold transition-colors ${
                    activeTab === 'seasonal' 
                      ? 'text-green-400 border-b-2 border-green-400' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  📅 Temporada Atual
                </button>
                <button
                  onClick={() => setActiveTab('weekly')}
                  className={`flex-1 p-4 font-semibold transition-colors ${
                    activeTab === 'weekly' 
                      ? 'text-blue-400 border-b-2 border-blue-400' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  ⚡ Ranking Semanal
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'global' && (
                  <>
                    {/* Podium */}
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold mb-6 text-center">🏆 Top 3 Global</h3>
                      <div className="flex justify-center items-end space-x-4 mb-8">
                        {/* 2º Lugar */}
                        <div className="text-center">
                          <div className="bg-gradient-to-b from-gray-400 to-gray-600 w-20 h-16 rounded-lg flex items-center justify-center mb-2">
                            <span className="text-2xl">{globalRanking[1].avatar}</span>
                          </div>
                          <div className="bg-black/40 p-3 rounded-lg">
                            <div className="text-xl mb-1">🥈</div>
                            <div className="font-bold text-sm">{globalRanking[1].username}</div>
                            <div className="text-xs text-gray-300">{globalRanking[1].points} pts</div>
                          </div>
                        </div>

                        {/* 1º Lugar */}
                        <div className="text-center">
                          <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 w-24 h-20 rounded-lg flex items-center justify-center mb-2">
                            <span className="text-3xl">{globalRanking[0].avatar}</span>
                          </div>
                          <div className="bg-black/40 p-4 rounded-lg border border-yellow-500/50">
                            <div className="text-2xl mb-1">🥇</div>
                            <div className="font-bold">{globalRanking[0].username}</div>
                            <div className="text-sm text-yellow-400">{globalRanking[0].points} pts</div>
                            <div className="text-xs text-gray-300 mt-1">{globalRanking[0].tier}</div>
                          </div>
                        </div>

                        {/* 3º Lugar */}
                        <div className="text-center">
                          <div className="bg-gradient-to-b from-orange-400 to-orange-600 w-20 h-16 rounded-lg flex items-center justify-center mb-2">
                            <span className="text-2xl">{globalRanking[2].avatar}</span>
                          </div>
                          <div className="bg-black/40 p-3 rounded-lg">
                            <div className="text-xl mb-1">🥉</div>
                            <div className="font-bold text-sm">{globalRanking[2].username}</div>
                            <div className="text-xs text-gray-300">{globalRanking[2].points} pts</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lista de Ranking */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold mb-4">📋 Ranking Completo</h3>
                      {globalRanking.map((player) => (
                        <div
                          key={player.rank}
                          className={`bg-black/40 p-4 rounded-lg border transition-all ${
                            player.isCurrentPlayer 
                              ? 'border-green-500/50 bg-green-900/20' 
                              : 'border-gray-600/30 hover:border-gray-500/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="text-2xl font-bold text-yellow-400 min-w-12">
                                {getRankIcon(player.rank)}
                              </div>
                              <div className="w-10 h-10 bg-gradient-to-b from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                                <span className="text-lg">{player.avatar}</span>
                              </div>
                              <div>
                                <div className={`font-bold ${player.isCurrentPlayer ? 'text-green-400' : ''}`}>
                                  {player.username}
                                  {player.isCurrentPlayer && <span className="ml-2 text-sm text-green-400">(Você)</span>}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {player.region}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold ${getTierColor(player.tier)}`}>
                                {player.tier}
                              </div>
                              <div className="text-sm text-gray-400">
                                {player.points} pts • {player.winRate}% WR
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === 'seasonal' && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-4">📅 Temporada 3 - "Lendas do Norte"</h3>
                      <div className="bg-black/40 p-4 rounded-lg mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-green-400">23</div>
                            <div className="text-sm text-gray-400">Dias restantes</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-400">1,847</div>
                            <div className="text-sm text-gray-400">Jogadores ativos</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-yellow-400">5</div>
                            <div className="text-sm text-gray-400">Novas cartas</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {seasonalRanking.map((player) => (
                        <div
                          key={player.rank}
                          className="bg-black/40 p-4 rounded-lg border border-gray-600/30"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="text-2xl font-bold text-green-400">
                                {getRankIcon(player.rank)}
                              </div>
                              <div className="w-10 h-10 bg-gradient-to-b from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                                <span className="text-lg">{player.avatar}</span>
                              </div>
                              <div>
                                <div className="font-bold">{player.username}</div>
                                <div className={`text-sm ${getTierColor(player.tier)}`}>
                                  {player.tier}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-400">{player.points} pts</div>
                              <div className="text-sm text-gray-400">{player.winRate}% WR</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'weekly' && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-4">⚡ Top da Semana</h3>
                      <div className="text-center text-gray-400 mb-4">
                        Semana de 3 a 10 de Março, 2024
                      </div>
                    </div>

                    <div className="space-y-3">
                      {weeklyLeaders.map((player) => (
                        <div
                          key={player.rank}
                          className="bg-black/40 p-4 rounded-lg border border-gray-600/30"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="text-2xl font-bold text-blue-400">
                                {getRankIcon(player.rank)}
                              </div>
                              <div className="w-10 h-10 bg-gradient-to-b from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                                <span className="text-lg">{player.avatar}</span>
                              </div>
                              <div>
                                <div className="font-bold">{player.username}</div>
                                <div className="text-sm text-gray-400">
                                  {player.wins} vitórias esta semana
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-blue-400">+{player.points} pts</div>
                              <div className="text-sm text-gray-400">esta semana</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sua Posição */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
              <h3 className="text-xl font-bold mb-4">🎯 Sua Posição</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">#47</div>
                <div className="text-sm text-gray-400 mb-3">Ranking Global</div>
                <div className="bg-black/40 p-3 rounded-lg mb-4">
                  <div className="font-bold text-yellow-400">Ouro III</div>
                  <div className="text-sm text-gray-400">1,247 pontos</div>
                </div>
                <div className="text-xs text-gray-400">
                  📈 +15 posições esta semana
                </div>
              </div>
            </div>

            {/* Próxima Recompensa */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
              <h3 className="text-xl font-bold mb-4">🎁 Próxima Recompensa</h3>
              <div className="text-center">
                <div className="text-2xl mb-2">🏆</div>
                <div className="font-bold mb-2">Ouro II</div>
                <div className="text-sm text-gray-400 mb-3">
                  Faltam 153 pontos
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: '75%' }}
                  ></div>
                </div>
                <div className="text-xs text-yellow-400">
                  89% do caminho
                </div>
              </div>
            </div>

            {/* Histórico de Ranks */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
              <h3 className="text-xl font-bold mb-4">📊 Progressão</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Temporada Atual</span>
                  <span className="text-yellow-400">Ouro III</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Temporada 2</span>
                  <span className="text-gray-400">Prata I</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Temporada 1</span>
                  <span className="text-orange-400">Bronze II</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Melhor Rank</span>
                  <span className="text-yellow-400">Ouro III</span>
                </div>
              </div>
            </div>

            {/* Conquistas Notáveis */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
              <h3 className="text-xl font-bold mb-4">⭐ Recordes Globais</h3>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="bg-black/40 p-3 rounded">
                    <div className="font-semibold text-sm text-yellow-400 mb-1">
                      {achievement.name}
                    </div>
                    <div className="text-xs text-gray-400 mb-1">
                      {achievement.description}
                    </div>
                    <div className="text-xs text-green-400">
                      🏆 {achievement.player} • {achievement.date}
                    </div>
                  </div>
                ))}
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
    </main>
  );
}
