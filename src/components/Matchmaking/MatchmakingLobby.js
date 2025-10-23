"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/UI/Icon';
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
  const [roomCode, setRoomCode] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [status, setStatus] = useState('waiting'); // waiting, searching, ready, error
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCountdown, countdown]);

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
    // Aguardar outro jogador entrar com o código
    // TODO: Usar Supabase Realtime para sincronizar
  };

  const handleJoinCustomRoom = async () => {
    if (!validateRoomCode(customCode)) {
      setErrorMessage('Código inválido! Use o formato: CUSTOM_XXXXX');
      return;
    }

    setStatus('searching');
    
    // TODO: Verificar se sala existe e tem vaga
    setTimeout(() => {
      setStatus('ready');
      setShowCountdown(true);
    }, 1000);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert('Código copiado! Compartilhe com seu oponente.');
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

        {/* Código da Sala */}
        <div className="bg-black/40 rounded-lg p-4 mb-6 border border-yellow-600/30">
          <div className="text-xs text-gray-400 mb-1 text-center">Código da Sala</div>
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
        </div>

        {/* Deck Info */}
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
                  setStatus('ready');
                  setShowCountdown(true);
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
