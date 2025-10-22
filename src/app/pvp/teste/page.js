'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestePvP() {
  const [playerId, setPlayerId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState([]);
  const [isReady, setIsReady] = useState(false);

  // Gera um ID único para o jogador ao carregar a página
  useEffect(() => {
    const id = `player_${Math.random().toString(36).substring(2, 9)}`;
    setPlayerId(id);
  }, []);

  // Subscrição em tempo real para mudanças na sala
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log('🔔 Mudança detectada:', payload);
          
          if (payload.new && payload.new.state) {
            const state = payload.new.state;
            
            if (state.messages) {
              setMessages(state.messages);
            }
            
            if (state.players) {
              setPlayers(state.players);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da subscrição:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Criar sala
  const handleCreateRoom = async () => {
    try {
      console.log('🚀 Tentando criar sala...');
      
      const response = await fetch('/api/matchmaking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });

      const data = await response.json();
      
      console.log('📦 Resposta da API:', data);
      
      if (!response.ok) {
        console.error('❌ Erro na API:', data);
        alert(`Erro ao criar sala: ${data.error || 'Erro desconhecido'}`);
        return;
      }
      
      if (data.roomId) {
        setRoomId(data.roomId);
        setIsConnected(true);
        setPlayers([playerId]);
        addSystemMessage(`Sala criada! Código: ${data.roomId}`);
      }
    } catch (error) {
      console.error('💥 Erro ao criar sala:', error);
      alert(`Erro ao criar sala: ${error.message}`);
    }
  };

  // Entrar na sala
  const handleJoinRoom = async () => {
    if (!inputRoomId.trim()) {
      alert('Digite o código da sala!');
      return;
    }

    try {
      // Primeiro, busca a sala existente
      const { data: match, error } = await supabase
        .from('matches')
        .select('*')
        .eq('room_id', inputRoomId)
        .single();

      if (error || !match) {
        alert('Sala não encontrada!');
        return;
      }

      // Adiciona o jogador à lista de players
      const currentState = match.state || {};
      const currentPlayers = currentState.players || [];
      const currentMessages = currentState.messages || [];

      if (currentPlayers.includes(playerId)) {
        alert('Você já está nesta sala!');
        return;
      }

      const updatedPlayers = [...currentPlayers, playerId];
      const updatedMessages = [
        ...currentMessages,
        {
          type: 'system',
          text: `${playerId} entrou na sala`,
          timestamp: new Date().toISOString(),
        },
      ];

      // Atualiza a sala
      const { error: updateError } = await supabase
        .from('matches')
        .update({
          state: {
            ...currentState,
            players: updatedPlayers,
            messages: updatedMessages,
          },
        })
        .eq('room_id', inputRoomId);

      if (updateError) {
        console.error('Erro ao entrar na sala:', updateError);
        alert('Erro ao entrar na sala!');
        return;
      }

      setRoomId(inputRoomId);
      setIsConnected(true);
      setPlayers(updatedPlayers);
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Erro ao entrar na sala:', error);
      alert('Erro ao entrar na sala!');
    }
  };

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      // Busca estado atual
      const { data: match } = await supabase
        .from('matches')
        .select('state')
        .eq('room_id', roomId)
        .single();

      const currentState = match?.state || {};
      const currentMessages = currentState.messages || [];

      const newMessage = {
        type: 'user',
        playerId,
        text: messageInput,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...currentMessages, newMessage];

      // Atualiza mensagens
      await supabase
        .from('matches')
        .update({
          state: {
            ...currentState,
            messages: updatedMessages,
          },
        })
        .eq('room_id', roomId);

      setMessageInput('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  // Toggle ready status
  const handleToggleReady = async () => {
    try {
      const { data: match } = await supabase
        .from('matches')
        .select('state')
        .eq('room_id', roomId)
        .single();

      const currentState = match?.state || {};
      const currentMessages = currentState.messages || [];
      const readyPlayers = currentState.readyPlayers || [];

      const newReadyState = !isReady;
      const updatedReadyPlayers = newReadyState
        ? [...readyPlayers, playerId]
        : readyPlayers.filter((p) => p !== playerId);

      const statusMessage = {
        type: 'system',
        text: `${playerId} está ${newReadyState ? 'PRONTO' : 'não pronto'}`,
        timestamp: new Date().toISOString(),
      };

      await supabase
        .from('matches')
        .update({
          state: {
            ...currentState,
            readyPlayers: updatedReadyPlayers,
            messages: [...currentMessages, statusMessage],
          },
        })
        .eq('room_id', roomId);

      setIsReady(newReadyState);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  // Sair da sala
  const handleLeaveRoom = async () => {
    try {
      const { data: match } = await supabase
        .from('matches')
        .select('state')
        .eq('room_id', roomId)
        .single();

      const currentState = match?.state || {};
      const currentPlayers = currentState.players || [];
      const currentMessages = currentState.messages || [];

      const updatedPlayers = currentPlayers.filter((p) => p !== playerId);
      const leaveMessage = {
        type: 'system',
        text: `${playerId} saiu da sala`,
        timestamp: new Date().toISOString(),
      };

      await supabase
        .from('matches')
        .update({
          state: {
            ...currentState,
            players: updatedPlayers,
            messages: [...currentMessages, leaveMessage],
          },
        })
        .eq('room_id', roomId);

      setRoomId('');
      setIsConnected(false);
      setMessages([]);
      setPlayers([]);
      setIsReady(false);
    } catch (error) {
      console.error('Erro ao sair da sala:', error);
    }
  };

  // Adiciona mensagem do sistema localmente
  const addSystemMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        type: 'system',
        text,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-orange-800 to-red-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-amber-100 mb-8">
          🎮 Teste de Conexão PvP
        </h1>

        {/* Informações do Jogador */}
        <div className="bg-amber-100/10 backdrop-blur-sm border-2 border-amber-500/30 rounded-lg p-4 mb-6">
          <p className="text-amber-100 text-sm">
            <strong>Seu ID:</strong> {playerId}
          </p>
          {roomId && (
            <p className="text-amber-100 text-sm mt-2">
              <strong>Sala:</strong> {roomId}
            </p>
          )}
        </div>

        {!isConnected ? (
          /* Tela de Entrada */
          <div className="bg-amber-100/10 backdrop-blur-sm border-2 border-amber-500/30 rounded-lg p-8">
            <div className="space-y-6">
              {/* Criar Sala */}
              <div>
                <h2 className="text-2xl font-bold text-amber-100 mb-4">
                  Criar Nova Sala
                </h2>
                <button
                  onClick={handleCreateRoom}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  ➕ Criar Sala
                </button>
              </div>

              <div className="border-t border-amber-500/30 pt-6">
                <h2 className="text-2xl font-bold text-amber-100 mb-4">
                  Entrar em Sala Existente
                </h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputRoomId}
                    onChange={(e) => setInputRoomId(e.target.value)}
                    placeholder="Digite o código da sala"
                    className="flex-1 bg-amber-100/20 border-2 border-amber-500/50 rounded-lg px-4 py-3 text-amber-100 placeholder-amber-300/50 focus:outline-none focus:border-amber-400"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleJoinRoom();
                    }}
                  />
                  <button
                    onClick={handleJoinRoom}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    🚪 Entrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Tela da Sala */
          <div className="space-y-6">
            {/* Jogadores Conectados */}
            <div className="bg-amber-100/10 backdrop-blur-sm border-2 border-amber-500/30 rounded-lg p-6">
              <h2 className="text-xl font-bold text-amber-100 mb-4">
                👥 Jogadores Conectados ({players.length})
              </h2>
              <div className="space-y-2">
                {players.map((player) => (
                  <div
                    key={player}
                    className="bg-amber-100/20 rounded-lg p-3 flex items-center justify-between"
                  >
                    <span className="text-amber-100">
                      {player === playerId ? '⭐ Você' : player}
                    </span>
                    {player === playerId && (
                      <button
                        onClick={handleToggleReady}
                        className={`px-4 py-1 rounded-full font-bold transition-colors ${
                          isReady
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-600 text-gray-200'
                        }`}
                      >
                        {isReady ? '✓ PRONTO' : 'Não Pronto'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat de Mensagens */}
            <div className="bg-amber-100/10 backdrop-blur-sm border-2 border-amber-500/30 rounded-lg p-6">
              <h2 className="text-xl font-bold text-amber-100 mb-4">
                💬 Chat em Tempo Real
              </h2>
              
              {/* Área de mensagens */}
              <div className="bg-black/20 rounded-lg p-4 h-64 overflow-y-auto mb-4 space-y-2">
                {messages.length === 0 ? (
                  <p className="text-amber-300/50 text-center">
                    Nenhuma mensagem ainda...
                  </p>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`rounded-lg p-3 ${
                        msg.type === 'system'
                          ? 'bg-blue-900/30 text-blue-200 italic'
                          : msg.playerId === playerId
                          ? 'bg-green-900/30 text-green-100 ml-8'
                          : 'bg-amber-900/30 text-amber-100 mr-8'
                      }`}
                    >
                      {msg.type === 'user' && (
                        <span className="font-bold text-xs block mb-1">
                          {msg.playerId === playerId ? 'Você' : msg.playerId}
                        </span>
                      )}
                      <p className="text-sm">{msg.text}</p>
                      <span className="text-xs opacity-50">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Input de mensagem */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 bg-amber-100/20 border-2 border-amber-500/50 rounded-lg px-4 py-3 text-amber-100 placeholder-amber-300/50 focus:outline-none focus:border-amber-400"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  📤 Enviar
                </button>
              </div>
            </div>

            {/* Botão Sair */}
            <button
              onClick={handleLeaveRoom}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🚪 Sair da Sala
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
