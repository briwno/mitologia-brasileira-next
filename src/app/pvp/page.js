// src/app/pvp/page.js
"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PvPLobby() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('quick');
  const [playerDeck, setPlayerDeck] = useState('Deck Amazônico');
  const [isSearching, setIsSearching] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const availableDecks = [
    { name: 'Deck Amazônico', cards: 30, theme: 'Criaturas da floresta', color: 'green' },
    { name: 'Deck Nordestino', cards: 28, theme: 'Lendas do sertão', color: 'yellow' },
    { name: 'Deck Sulista', cards: 25, theme: 'Tradições gaúchas', color: 'purple' },
    { name: 'Deck Sudeste', cards: 32, theme: 'Assombrações urbanas', color: 'blue' }
  ];

  const onlineRooms = [
    { id: 'ROOM001', host: 'CurupiraMain', players: '1/2', mode: 'Ranked', region: 'Amazônia' },
    { id: 'ROOM002', host: 'SaciPlayer', players: '1/2', mode: 'Casual', region: 'Nacional' },
    { id: 'ROOM003', host: 'IaraQueen', players: '1/2', mode: 'Torneio', region: 'Norte' }
  ];

  const handleQuickMatch = () => {
    setIsSearching(true);
    // Simular busca por partida
    setTimeout(() => {
      setIsSearching(false);
      // Gerar ID da sala e redirecionar para o jogo
      const roomId = 'QUICK' + Math.random().toString(36).substr(2, 6).toUpperCase();
      router.push(`/pvp/game/${roomId}`);
    }, 3000);
  };

  const handleJoinRoom = (roomId) => {
    // Redirecionar diretamente para a sala de jogo
    router.push(`/pvp/game/${roomId}`);
  };

  const handleCreateRoom = () => {
    // Criar sala e redirecionar
    const newRoomCode = 'ROOM' + Math.random().toString(36).substr(2, 6).toUpperCase();
    router.push(`/pvp/game/${newRoomCode}`);
  };

  const handleDemoGame = () => {
    // Método demo para acessar gameplay diretamente
    router.push('/pvp/game/DEMO123');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            ⚔️ Batalha PvP
          </h1>
          <p className="text-xl text-red-300">
            Duelle contra outros jogadores em batalhas épicas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Painel Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs de Modos */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600/30">
              <div className="flex border-b border-gray-600/30">
                <button
                  onClick={() => setActiveTab('quick')}
                  className={`flex-1 p-4 font-semibold transition-colors ${
                    activeTab === 'quick' 
                      ? 'text-green-400 border-b-2 border-green-400' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  🎯 Partida Rápida
                </button>
                <button
                  onClick={() => setActiveTab('rooms')}
                  className={`flex-1 p-4 font-semibold transition-colors ${
                    activeTab === 'rooms' 
                      ? 'text-blue-400 border-b-2 border-blue-400' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  🏠 Salas Personalizadas
                </button>
                <button
                  onClick={() => setActiveTab('ranked')}
                  className={`flex-1 p-4 font-semibold transition-colors ${
                    activeTab === 'ranked' 
                      ? 'text-yellow-400 border-b-2 border-yellow-400' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  🏆 Ranqueada
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'quick' && (
                  <div className="text-center">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-2">Partida Rápida</h3>
                      <p className="text-gray-300">
                        Encontre um oponente automaticamente para uma batalha casual
                      </p>
                    </div>
                    
                    {isSearching ? (
                      <div className="space-y-4">
                        <div className="animate-spin w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-green-400">Procurando oponente...</p>
                        <button
                          onClick={() => setIsSearching(false)}
                          className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleQuickMatch}
                        className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg text-xl font-semibold transition-colors"
                      >
                        🎮 Iniciar Partida
                      </button>
                    )}
                  </div>
                )}

                {activeTab === 'rooms' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold">Salas Disponíveis</h3>
                      <button
                        onClick={handleCreateRoom}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        + Criar Sala
                      </button>
                    </div>

                    <div className="space-y-3 mb-6">
                      {onlineRooms.map((room) => (
                        <div
                          key={room.id}
                          className="bg-black/40 p-4 rounded-lg border border-gray-600/30 flex justify-between items-center"
                        >
                          <div>
                            <div className="font-semibold">{room.host}</div>
                            <div className="text-sm text-gray-400">
                              {room.mode} • {room.region} • {room.players}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-xs bg-green-600 px-2 py-1 rounded">
                              {room.id}
                            </span>
                            <button
                              onClick={() => handleJoinRoom(room.id)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                            >
                              Entrar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-600/30 pt-4">
                      <h4 className="font-semibold mb-3">Entrar com Código</h4>
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                          placeholder="CÓDIGO DA SALA"
                          className="flex-1 px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={() => handleJoinRoom(roomCode)}
                          disabled={!roomCode}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                        >
                          Entrar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'ranked' && (
                  <div className="text-center">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-2">Partida Ranqueada</h3>
                      <p className="text-gray-300 mb-4">
                        Compete contra jogadores do seu nível para subir no ranking
                      </p>
                      <div className="bg-black/40 p-4 rounded-lg inline-block">
                        <div className="text-sm text-gray-400">Seu Rank Atual</div>
                        <div className="text-xl font-bold text-yellow-400">Ouro III</div>
                        <div className="text-sm text-gray-400">1,247 pontos</div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleQuickMatch}
                      className="px-8 py-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-xl font-semibold transition-colors"
                    >
                      🏆 Buscar Partida Ranqueada
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Painel Lateral */}
          <div className="space-y-6">
            {/* Deck Selecionado */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
              <h3 className="text-xl font-bold mb-4">🃏 Deck Selecionado</h3>
              
              <div className="space-y-4">
                <select
                  value={playerDeck}
                  onChange={(e) => setPlayerDeck(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-green-500 focus:outline-none"
                >
                  {availableDecks.map((deck) => (
                    <option key={deck.name} value={deck.name}>
                      {deck.name} ({deck.cards} cartas)
                    </option>
                  ))}
                </select>

                {(() => {
                  const selectedDeck = availableDecks.find(d => d.name === playerDeck);
                  return selectedDeck && (
                    <div className="bg-black/40 p-3 rounded">
                      <div className="font-semibold mb-1">{selectedDeck.name}</div>
                      <div className="text-sm text-gray-400 mb-2">{selectedDeck.theme}</div>
                      <div className="text-xs">
                        <span className={`px-2 py-1 rounded bg-${selectedDeck.color}-600`}>
                          {selectedDeck.cards} cartas
                        </span>
                      </div>
                    </div>
                  );
                })()}

                <Link
                  href="/pvp/deck"
                  className="block w-full text-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                >
                  ⚙️ Editar Deck
                </Link>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
              <h3 className="text-xl font-bold mb-4">📊 Suas Estatísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Vitórias:</span>
                  <span className="font-bold text-green-400">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Derrotas:</span>
                  <span className="font-bold text-red-400">23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Taxa de Vitória:</span>
                  <span className="font-bold text-yellow-400">67%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sequência Atual:</span>
                  <span className="font-bold text-blue-400">5 vitórias</span>
                </div>
              </div>
            </div>

            {/* Jogadores Online */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
              <h3 className="text-xl font-bold mb-4">👥 Jogadores Online</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">1,247</div>
                <div className="text-sm text-gray-400">jogadores conectados</div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-400">
                  🎮 {onlineRooms.length} salas ativas
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          {/* Botão Demo para testar gameplay */}
          <button
            onClick={handleDemoGame}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-semibold mr-4"
          >
            🎮 Demo Gameplay
          </button>
          
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
