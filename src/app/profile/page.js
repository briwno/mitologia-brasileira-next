// src/app/profile/page.js
"use client";

import Link from 'next/link';
import { useState } from 'react';
import PageLayout from '../../components/UI/PageLayout';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('overview');

  const playerStats = {
    username: 'CurupiraMain',
    level: 12,
    xp: 3750,
    xpToNext: 1250,
    rank: 'Ouro III',
    rankPoints: 1247,
    joinDate: '15 de Janeiro, 2024',
    totalGames: 156,
    wins: 89,
    losses: 67,
    winRate: 57,
    currentStreak: 3,
    bestStreak: 12,
    favoriteCard: 'Curupira',
    totalCardsCollected: 45,
    totalCardsAvailable: 80,
    achievements: 18
  };

  const recentMatches = [
    { id: 1, opponent: 'SaciPlayer', result: 'win', deck: 'Deck Amazônico', duration: '8:34', date: '2 horas atrás' },
    { id: 2, opponent: 'IaraQueen', result: 'win', deck: 'Deck Amazônico', duration: '12:15', date: '1 dia atrás' },
    { id: 3, opponent: 'BoitataKing', result: 'loss', deck: 'Deck Nordestino', duration: '6:22', date: '1 dia atrás' },
    { id: 4, opponent: 'CucaMaster', result: 'win', deck: 'Deck Amazônico', duration: '15:40', date: '2 dias atrás' },
    { id: 5, opponent: 'LobisPlayer', result: 'loss', deck: 'Deck Sulista', duration: '9:18', date: '3 dias atrás' }
  ];

  const achievements = [
    { id: 1, name: 'Primeira Vitória', description: 'Ganhe sua primeira partida', icon: '🏆', completed: true, date: '16 Jan 2024' },
    { id: 2, name: 'Colecionador', description: 'Colete 50 cartas diferentes', icon: '🃏', completed: false, progress: 45, total: 50 },
    { id: 3, name: 'Explorador da Amazônia', description: 'Complete todas as lendas amazônicas', icon: '🌳', completed: true, date: '28 Jan 2024' },
    { id: 4, name: 'Sequência de Vitórias', description: 'Ganhe 5 partidas seguidas', icon: '🔥', completed: true, date: '5 Fev 2024' },
    { id: 5, name: 'Mestre do Quiz', description: 'Acerte 100 perguntas no modo museu', icon: '🧠', completed: false, progress: 67, total: 100 },
    { id: 6, name: 'Guerreiro Ranqueado', description: 'Alcance o rank Ouro', icon: '⭐', completed: true, date: '15 Fev 2024' }
  ];

  const favoriteCards = [
    { name: 'Curupira', category: 'Guardiões', timesPlayed: 89, winRate: 67 },
    { name: 'Iara', category: 'Águas', timesPlayed: 45, winRate: 72 },
    { name: 'Saci-Pererê', category: 'Assombrações', timesPlayed: 67, winRate: 55 },
    { name: 'Boitatá', category: 'Guardiões', timesPlayed: 23, winRate: 78 }
  ];

  const getWinRateColor = (rate) => {
    if (rate >= 70) return 'text-green-400';
    if (rate >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            👤 Perfil do Jogador
          </h1>
          <p className="text-xl text-purple-300">
            Acompanhe seu progresso e conquistas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar com informações do jogador */}
          <div className="space-y-6">
            {/* Card do Jogador */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-b from-green-600 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                  👤
                </div>
                <h2 className="text-2xl font-bold mb-2">{playerStats.username}</h2>
                <div className="text-sm text-gray-400 mb-4">
                  Membro desde {playerStats.joinDate}
                </div>
                
                {/* Nível e XP */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Nível {playerStats.level}</span>
                    <span>{playerStats.xp}/{playerStats.xp + playerStats.xpToNext} XP</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(playerStats.xp / (playerStats.xp + playerStats.xpToNext)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Rank */}
                <div className="bg-black/40 p-3 rounded-lg">
                  <div className="text-yellow-400 font-bold">{playerStats.rank}</div>
                  <div className="text-sm text-gray-400">{playerStats.rankPoints} pontos</div>
                </div>
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
              <h3 className="text-lg font-bold mb-4">📊 Estatísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Partidas:</span>
                  <span className="font-bold">{playerStats.totalGames}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vitórias:</span>
                  <span className="font-bold text-green-400">{playerStats.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Derrotas:</span>
                  <span className="font-bold text-red-400">{playerStats.losses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Taxa de Vitória:</span>
                  <span className={`font-bold ${getWinRateColor(playerStats.winRate)}`}>
                    {playerStats.winRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sequência Atual:</span>
                  <span className="font-bold text-yellow-400">{playerStats.currentStreak}W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Melhor Sequência:</span>
                  <span className="font-bold text-purple-400">{playerStats.bestStreak}W</span>
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
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 p-4 font-semibold transition-colors ${
                    activeTab === 'overview' 
                      ? 'text-blue-400 border-b-2 border-blue-400' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  📊 Visão Geral
                </button>
                <button
                  onClick={() => setActiveTab('matches')}
                  className={`flex-1 p-4 font-semibold transition-colors ${
                    activeTab === 'matches' 
                      ? 'text-green-400 border-b-2 border-green-400' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  ⚔️ Histórico de Partidas
                </button>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`flex-1 p-4 font-semibold transition-colors ${
                    activeTab === 'achievements' 
                      ? 'text-yellow-400 border-b-2 border-yellow-400' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  🏆 Conquistas
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Progresso da Coleção */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-black/40 p-6 rounded-lg">
                        <h4 className="text-xl font-bold mb-4 text-blue-400">🃏 Coleção de Cartas</h4>
                        <div className="text-center">
                          <div className="text-3xl font-bold mb-2">
                            {playerStats.totalCardsCollected}/{playerStats.totalCardsAvailable}
                          </div>
                          <div className="text-sm text-gray-400 mb-3">Cartas coletadas</div>
                          <div className="w-full bg-gray-700 rounded-full h-3">
                            <div 
                              className="bg-blue-500 h-3 rounded-full"
                              style={{ width: `${(playerStats.totalCardsCollected / playerStats.totalCardsAvailable) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-blue-400 mt-2">
                            {Math.round((playerStats.totalCardsCollected / playerStats.totalCardsAvailable) * 100)}% completa
                          </div>
                        </div>
                      </div>

                      <div className="bg-black/40 p-6 rounded-lg">
                        <h4 className="text-xl font-bold mb-4 text-yellow-400">🏆 Conquistas</h4>
                        <div className="text-center">
                          <div className="text-3xl font-bold mb-2">
                            {achievements.filter(a => a.completed).length}/{achievements.length}
                          </div>
                          <div className="text-sm text-gray-400 mb-3">Conquistas desbloqueadas</div>
                          <div className="w-full bg-gray-700 rounded-full h-3">
                            <div 
                              className="bg-yellow-500 h-3 rounded-full"
                              style={{ width: `${(achievements.filter(a => a.completed).length / achievements.length) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-yellow-400 mt-2">
                            {Math.round((achievements.filter(a => a.completed).length / achievements.length) * 100)}% completas
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cartas Favoritas */}
                    <div className="bg-black/40 p-6 rounded-lg">
                      <h4 className="text-xl font-bold mb-4 text-green-400">💚 Cartas Mais Usadas</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {favoriteCards.map((card, index) => (
                          <div key={index} className="bg-black/30 p-4 rounded border border-gray-600/30">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-bold">{card.name}</div>
                                <div className="text-sm text-gray-400">{card.category}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-400">{card.timesPlayed} jogos</div>
                                <div className={`text-sm font-bold ${getWinRateColor(card.winRate)}`}>
                                  {card.winRate}% vitórias
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'matches' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6">📜 Histórico de Partidas</h3>
                    <div className="space-y-3">
                      {recentMatches.map((match) => (
                        <div
                          key={match.id}
                          className={`bg-black/40 p-4 rounded-lg border ${
                            match.result === 'win' 
                              ? 'border-green-500/30' 
                              : 'border-red-500/30'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                              <div className={`w-3 h-3 rounded-full ${
                                match.result === 'win' ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <div>
                                <div className="font-bold">vs {match.opponent}</div>
                                <div className="text-sm text-gray-400">{match.deck}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold ${
                                match.result === 'win' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {match.result === 'win' ? 'VITÓRIA' : 'DERROTA'}
                              </div>
                              <div className="text-sm text-gray-400">{match.duration} • {match.date}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-center mt-6">
                      <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                        Ver Mais Partidas
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'achievements' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6">🏆 Conquistas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`bg-black/40 p-4 rounded-lg border ${
                            achievement.completed 
                              ? 'border-yellow-500/50' 
                              : 'border-gray-600/30'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`text-2xl ${achievement.completed ? '' : 'grayscale opacity-50'}`}>
                              {achievement.icon}
                            </div>
                            <div className="flex-1">
                              <div className={`font-bold ${achievement.completed ? 'text-yellow-400' : 'text-gray-400'}`}>
                                {achievement.name}
                              </div>
                              <div className="text-sm text-gray-400 mb-2">
                                {achievement.description}
                              </div>
                              {achievement.completed ? (
                                <div className="text-xs text-green-400">
                                  ✅ Desbloqueado em {achievement.date}
                                </div>
                              ) : achievement.progress ? (
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">
                                    Progresso: {achievement.progress}/{achievement.total}
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="bg-yellow-500 h-2 rounded-full"
                                      style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500">
                                  🔒 Não desbloqueado
                                </div>
                              )}
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
    </PageLayout>
  );
}
