"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Icon from '@/components/UI/Icon';
import { supabase } from '@/lib/supabase';
import { 
  generateRoomCode, 
  validateRoomCode, 
  formatRoomCodeDisplay,
  getModeIcon,
  getModeDescription 
} from '@/utils/roomCodes';

/**
 * Tela de Lobby/Matchmaking
 * Aparece após selecionar o deck, antes de entrar na batalha
 */
export default function MatchmakingLobby({ 
  mode, 
  deck, 
  botDifficulty = 'normal',
  playerName = 'Jogador',
  onCancel 
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [roomCode, setRoomCode] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [status, setStatus] = useState('waiting'); // waiting, searching, ready, error
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);
  const pollingRef = useRef(null);
  const [persistedRoomId, setPersistedRoomId] = useState(null);

  // Gerar código da sala ao montar
  useEffect(() => {
    const code = generateRoomCode(mode);
    setRoomCode(code);
  }, [mode]);

  // Lógica de matchmaking por modo
  useEffect(() => {
    if (mode === 'bot') {
      // Bot: Iniciar imediatamente
      handleBotMatch();
    } else if (mode === 'ranked') {
      // Ranked: Buscar oponente
      handleRankedMatchmaking();
    } else if (mode === 'custom') {
      // Custom: Aguardar host criar ou jogador entrar
      setStatus('waiting');
    }
  }, [mode]);

  const startBattle = () => {
    // Navegar para a tela de batalha com os dados
    const params = new URLSearchParams({
      mode,
      roomCode,
      deckId: deck.id,
      ...(mode === 'bot' && { botDifficulty })
    });
    
    router.push(`/pvp/battle?${params.toString()}`);
  };

  // Countdown antes de iniciar batalha
  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      startBattle();
      //voltar para deck
      onCancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCountdown, countdown]);

  // limpar polling ao desmontar
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        // pode ser um interval ID (number) ou um channel do Supabase
        try {
          if (typeof pollingRef.current.unsubscribe === 'function') {
            // channel
            // unsubscribe pode retornar promise
            const unsub = pollingRef.current.unsubscribe();
            if (unsub && typeof unsub.then === 'function') unsub.catch(() => {});
          } else {
            // interval id
            clearInterval(pollingRef.current);
          }
        } catch (e) {
          // ignora
        }
        pollingRef.current = null;
      }
    };
  }, []);

  const handleBotMatch = async () => {
    // Simular criação de partida contra bot
    setStatus('ready');
    setShowCountdown(true);
  };

  const handleRankedMatchmaking = async () => {
    setStatus('searching');
    
    // TODO: Implementar busca real via API
    // Simulação de matchmaking
    setTimeout(() => {
      setStatus('ready');
      setShowCountdown(true);
    }, 2000);
  };

  const handleCreateCustomRoom = async () => {
    setStatus('waiting');
    setErrorMessage('');

    try {
      if (!user?.id) {
        setErrorMessage('Usuário não autenticado');
        return;
      }

      // Tentar criar via endpoint padrão (server-side cria na tabela matches)
      const res = await fetch('/api/matchmaking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: user.id, deckId: deck.id })
      });

      let returnedRoomId = null;
      if (!res.ok) {
        const txt = await res.text();
        setErrorMessage(txt || 'Erro ao criar sala');
        setStatus('error');
        return;
      }
      const data = await res.json();
      returnedRoomId = data.roomId;

      if (!returnedRoomId) {
        setErrorMessage('Resposta inválida do servidor');
        setStatus('error');
        return;
      }

  // usar o roomId retornado e mostrar para o usuário
  setRoomCode(returnedRoomId.toString());
  setPersistedRoomId(returnedRoomId.toString());
  setStatus('waiting');

  // subscribir via Supabase Realtime para updates na partida
  const pollingRoomId = returnedRoomId.toString();
      // limpar subscription anterior se existir
      if (pollingRef.current) {
        try { await pollingRef.current.unsubscribe(); } catch (e) { /* ignore */ }
        pollingRef.current = null;
      }

      try {
        subscribeToMatch(pollingRoomId);
      } catch (err) {
        console.error('Erro ao abrir subscription Supabase:', err);
      }
    } catch (err) {
      console.error('Erro ao criar sala custom:', err);
      setErrorMessage(err.message || 'Erro desconhecido');
      setStatus('error');
    }
  };

  // helper: subscrever updates da partida via Supabase Realtime
  const subscribeToMatch = (pollingRoomId) => {
    try {
      // limpar anterior
      if (pollingRef.current && typeof pollingRef.current.unsubscribe === 'function') {
        pollingRef.current.unsubscribe().catch(() => {});
        pollingRef.current = null;
      }

      const channel = supabase
        .channel(`match_${pollingRoomId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `room_id=eq.${pollingRoomId}` }, (payload) => {
          console.log('[MatchmakingLobby] Match atualizado:', payload.new);
          const match = payload.new;
          if (match && match.player_b_id && match.status === 'active') {
            console.log('[MatchmakingLobby] ✅ Oponente entrou! Iniciando countdown...');
            setStatus('ready');
            setShowCountdown(true);
            channel.unsubscribe().catch(() => {});
            pollingRef.current = null;
          }
        })
        .subscribe((status) => {
          console.log('[MatchmakingLobby] Status da subscrição:', status);
        });

      pollingRef.current = channel;
    } catch (err) {
      console.error('Erro subscribeToMatch:', err);
    }
  };

  const handleJoinCustomRoom = async () => {
    setErrorMessage('');

    // aceitar tanto CUSTOM_XXXXX quanto apenas o id
    let roomIdInput = customCode;
    if (!roomIdInput) {
      setErrorMessage('Digite o código da sala');
      return;
    }
    if (roomIdInput.includes('_')) {
      const parts = roomIdInput.split('_');
      roomIdInput = parts[1] || parts[0];
    }

    setStatus('searching');

    try {
      if (!user?.id) {
        setErrorMessage('Usuário não autenticado');
        setStatus('error');
        return;
      }

      // Tentar endpoint padrão (server-side atualiza a tabela matches)
      const res = await fetch('/api/matchmaking/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomIdInput, playerId: user.id, deckId: deck.id })
      });

      if (!res.ok) {
        const txt = await res.text();
        setErrorMessage(txt || 'Erro ao entrar na sala');
        setStatus('error');
        return;
      }

      const j = await res.json();
      const match = j.match || j;
      if (match) {
        // entrou com sucesso — iniciar contagem
        setRoomCode(roomIdInput);
        setStatus('ready');
        setShowCountdown(true);
      }
    } catch (err) {
      console.error('Erro ao entrar na sala:', err);
      setErrorMessage(err.message || 'Erro desconhecido');
      setStatus('error');
    }
  };

  const copyRoomCode = () => {
    (async () => {
      try {
        // se modo custom e a sala ainda não foi criada no DB, criar agora usando o código visível
        if (mode === 'custom' && !persistedRoomId) {
          // extrair raw id (sem prefixo custom_)
          let raw = roomCode;
          if (!raw) raw = generateRoomCode(mode);
          if (raw.includes('_')) raw = raw.split('_')[1] || raw;

          const res = await fetch('/api/matchmaking/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId: user?.id, deckId: deck.id, roomId: raw })
          });

          if (!res.ok) {
            const txt = await res.text();
            setErrorMessage(txt || 'Erro ao criar sala');
            setStatus('error');
            return;
          }
          const d = await res.json();
          const created = d.roomId || d.room || raw;
          setRoomCode(created.toString());
          setPersistedRoomId(created.toString());
          // iniciar subscription
          subscribeToMatch(created.toString());
          navigator.clipboard.writeText(created.toString());
          alert('Código copiado! Sala criada e copiada. Compartilhe com seu oponente.');
          return;
        }

        // caso já persistida ou outros modos
        navigator.clipboard.writeText(roomCode);
        alert('Código copiado! Compartilhe com seu oponente.');
      } catch (err) {
        console.error('Erro ao copiar/criar sala:', err);
        setErrorMessage(err.message || 'Erro ao copiar código');
      }
    })();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-[#1a2332] to-[#0f1821] border-2 border-yellow-600/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{getModeIcon(mode)}</div>
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">
            {mode === 'bot' && 'Batalha contra Bot'}
            {mode === 'ranked' && 'Partida Ranqueada'}
            {mode === 'custom' && 'Sala Personalizada'}
          </h2>
          <p className="text-sm text-gray-400">
            {getModeDescription(mode)}
          </p>
        </div>
          <div className="bg-black/40 rounded-lg p-4 mb-6 border border-yellow-600/30">
            <div className="text-xs text-gray-400 mb-1 text-center">Código da Sala</div>

            {mode === 'custom' && !persistedRoomId ? (
              // Sala custom: oculto até criar/copiar
              <div className="flex items-center justify-center gap-2">
                <div className="text-2xl font-mono font-bold text-yellow-400 tracking-wider">
            {/* exibe máscara até o host criar a sala */}
            •••••
                </div>
                <button
            onClick={copyRoomCode}
            className="px-3 py-2 bg-yellow-600 text-black rounded font-semibold hover:bg-yellow-500 transition-colors"
            title="Criar e copiar código da sala"
                >
            Copiar
                </button>
              </div>
            ) : (
              // Sala visível (ranked/bot ou custom já persistida)
              <div className="flex items-center justify-center gap-2">
                <div className="text-2xl font-mono font-bold text-yellow-400 tracking-wider">
            {formatRoomCodeDisplay(roomCode)}
                </div>
                {mode === 'custom' && (
            <button
              onClick={copyRoomCode}
              className="p-2 bg-yellow-600/20 hover:bg-yellow-600/40 rounded transition-colors"
              title="Copiar código"
            >
              <Icon name="copy" size={16} />
            </button>
                )}
              </div>
            )}
          </div>
        <div className="bg-black/20 rounded-lg p-3 mb-6">
          <div className="text-xs text-gray-400 mb-1">Deck Selecionado</div>
          <div className="font-semibold text-cyan-400">{deck.name}</div>
          <div className="text-xs text-gray-500">{deck.cards?.length || 0} cartas</div>
        </div>

        {/* Status específico por modo */}
        {mode === 'bot' && status === 'ready' && !showCountdown && (
          <div className="text-center mb-6">
            <div className="text-green-400 mb-2">✓ Oponente: Bot ({botDifficulty})</div>
          </div>
        )}

        {mode === 'ranked' && status === 'searching' && (
          <div className="text-center mb-6">
            <div className="animate-pulse text-yellow-400 mb-2">
              🔍 Procurando oponente...
            </div>
            <div className="text-xs text-gray-500">Aguarde, buscando jogador com MMR similar</div>
          </div>
        )}

        {mode === 'ranked' && status === 'ready' && !showCountdown && (
          <div className="text-center mb-6">
            <div className="text-green-400 mb-2">✓ Oponente encontrado!</div>
            <div className="text-sm text-gray-400">vs. Jogador Aleatório</div>
          </div>
        )}

        {mode === 'custom' && status === 'waiting' && (
          <div className="space-y-4 mb-6">
            <div className="text-center">
              <div className="text-yellow-400 mb-2">⏳ Aguardando oponente...</div>
              <div className="text-xs text-gray-500">
                Compartilhe o código acima para outro jogador entrar
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-4">
              <div className="text-sm text-gray-400 mb-2 text-center">
                Ou entre em uma sala existente:
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="CUSTOM_XXXXX"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 bg-black/40 border border-gray-600 rounded text-center font-mono text-sm focus:border-yellow-600 focus:outline-none"
                  maxLength={12}
                />
                <button
                  onClick={handleJoinCustomRoom}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold transition-colors"
                >
                  Entrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Countdown */}
        {showCountdown && (
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-yellow-400 animate-pulse mb-2">
              {countdown}
            </div>
            <div className="text-sm text-gray-400">
              Iniciando batalha...
            </div>
          </div>
        )}

        {/* Error */}
        {errorMessage && (
          <div className="bg-red-900/30 border border-red-600 rounded-lg p-3 mb-6 text-red-300 text-sm text-center">
            {errorMessage}
          </div>
        )}

        {/* Actions */}
        {!showCountdown && (
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="back" size={20} />
              Cancelar
            </button>
            
            {mode === 'custom' && status === 'waiting' && (
              <button
                onClick={() => {
                  // criar sala e aguardar
                  handleCreateCustomRoom();
                }}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
              >
                Iniciar (Debug)
              </button>
            )}
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-600 text-center">
            Modo: {mode} | Status: {status}
          </div>
        </div>
      </div>
    </div>
  );
}
