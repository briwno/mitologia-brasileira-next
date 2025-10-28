"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePlayerData } from '@/hooks/usePlayerData';
import { useMMR } from '@/hooks/useMMR';
import { calcularRankingPorMMR, obterIconeRanking } from '@/utils/mmrUtils';
import { useAuth } from '@/hooks/useAuth';

/**
 * Componente de HUD do jogador
 * Mostra avatar, nome e rank
 */
export default function PlayerHUD({ 
  player, 
  isOpponent = false,
  isEnemy = false, // Compatibilidade com BattleScreen
  isMyTurn = false, // se é o turno do jogador local
  onUseRelic = () => {} // callback quando jogador usa a relíquia
}) {
  const { user } = useAuth();
  const { usuario: playerData } = usePlayerData();
  const { ranking: dadosRanking, mmr: mmrDoHook } = useMMR();

  // isEnemy é alias para isOpponent
  const isOponente = isOpponent || isEnemy;

  // Definir cores: jogador LOCAL = AZUL, oponente = VERMELHO
  const bgColor = isOponente ? 'bg-red-600/80 border-red-400' : 'bg-blue-600/80 border-blue-400';
  const borderColor = isOponente ? 'border-red-300' : 'border-blue-300';
  const textColor = isOponente ? 'text-red-200' : 'text-blue-200';

  let displayName = 'Jogador';
  let displayRank = 'Bronze 1';
  let displayIcon = '🏅';
  let avatarUrl = null;
  const [botName, setBotName] = useState(null);

  // Detectar se é bot
  const isBot = Boolean(
    player?.isBot || 
    player?.bot || 
    player?.ai || 
    player?.type === 'bot' || 
    player?.isAI ||
    (player?.name && player.name.toLowerCase().includes('bot'))
  );

  useEffect(() => {
    if (isBot) {
      if (player?.name) {
        setBotName(player.name);
      } else if (!botName) {
        const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
        setBotName(`BOT ${suffix}`);
      }
    } else {
      setBotName(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBot, player?.name]);

  if (!isOponente) {
    // ===== JOGADOR LOCAL =====
    displayName = playerData?.nickname || user?.nickname || user?.email || 'Jogador';
    avatarUrl = playerData?.avatar_url || user?.avatar_url || null;

    const mmrJogador = mmrDoHook || playerData?.mmr || user?.mmr || 0;
    const rankingAtual = dadosRanking?.ranking || calcularRankingPorMMR(mmrJogador);
    displayRank = rankingAtual || 'Bronze 1';
    displayIcon = dadosRanking?.icone || obterIconeRanking(rankingAtual) || '🏅';
  } else {
    // ===== OPONENTE =====
    if (isBot) {
      // BOT: mostra só "Bot {dificuldade}"
      displayName = botName || 'BOT';
      displayRank = player?.difficulty || player?.level || 'Normal';
      displayIcon = '🤖';
      avatarUrl = null;
    } else {
      // JOGADOR REAL
      displayName = player?.nickname || player?.name || 'Oponente';
      avatarUrl = player?.avatar_url || null;
      
      if (player?.rank) {
        displayRank = player.rank;
      } else if (player?.mmr !== undefined) {
        displayRank = calcularRankingPorMMR(player.mmr);
      } else {
        displayRank = '???';
      }
      displayIcon = player?.rankIcon || obterIconeRanking(displayRank) || '🎮';
    }
  }

  return (
    <div className={`${bgColor} border-2 rounded-xl px-10 py-5 shadow-lg`}>
      <div className="flex items-center gap-2">
        <div className={`w-10 h-10 rounded-full bg-black/30 border-2 ${borderColor} flex items-center justify-center overflow-hidden`}>
          {avatarUrl && !isBot ? (
            <Image src={avatarUrl} alt={displayName} width={40} height={40} className="object-cover rounded-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg">{displayIcon}</div>
          )}
        </div>
        <div>
          <div className="font-bold text-xs text-white truncate max-w-[120px]" title={displayName}>
            {displayName}
          </div>
          <div className={`text-[9px] ${textColor}`}>
            {!isBot && <span className="mr-1">{displayIcon}</span>}
            {displayRank}
          </div>
        </div>
      </div>
      {/* Relíquia armazenada (apenas visível para o jogador local) - UI/UX melhorada com tooltip */}
      {!isOponente && player?.storedRelic ? (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Ícone com cor por raridade + tooltip ao passar o mouse */}
            <div className="relative group">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold border-2 ${getRarityClass(player.storedRelic?.rarity)} bg-gradient-to-br from-black/20 to-white/3`}>🔮</div>

              {/* Tooltip - aparece ao hover */}
              <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-2 hidden group-hover:block z-50">
                <div className="max-w-xs p-3 bg-black/90 text-xs rounded shadow-lg border border-gray-700">
                  <div className="font-semibold text-sm text-white truncate" title={player.storedRelic.name}>{player.storedRelic.name}</div>
                  <div className="text-[12px] text-gray-200 mt-1">{player.storedRelic.effect?.description || player.storedRelic.type || 'Sem descrição'}</div>
                  {player.storedRelic.effect && (
                    <div className="text-[11px] text-gray-400 mt-2">
                      <div><span className="font-semibold text-gray-200">Efeitos:</span> {renderEffectSummary(player.storedRelic.effect)}</div>
                    </div>
                  )}
                  <div className="mt-2 text-[11px] text-gray-500">Clique em "Usar Relíquia" para ativar.</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-white truncate max-w-[200px]" title={player.storedRelic.name}>{player.storedRelic.name}</div>
              <div className="text-[10px] text-gray-200">{player.storedRelic.rarity ? `${player.storedRelic.rarity}` : ''} {player.storedRelic.type ? `· ${player.storedRelic.type}` : ''}</div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="text-[10px] text-gray-300">Reliquia Disponivel</div>
            <button
              onClick={() => onUseRelic()}
              disabled={!isMyTurn}
              className={`px-3 py-1 rounded-md text-[12px] font-semibold transition ${isMyTurn ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gray-700/40 cursor-not-allowed opacity-60'} text-white`}
            >
              Usar Relíquia
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Helpers locais
function getRarityClass(rarity) {
  switch ((rarity || '').toString().toLowerCase()) {
    case 'lendaria':
    case 'lenda':
    case 'mythic':
    case 'mitica':
      return 'border-yellow-400';
    case 'epica':
    case 'epic':
      return 'border-purple-400';
    case 'rara':
    case 'rare':
      return 'border-sky-400';
    case 'comum':
    case 'common':
    default:
      return 'border-gray-400';
  }
}

function renderEffectSummary(effect) {
  if (!effect) return '—';
  const parts = [];
  if (effect.heal) parts.push(`Cura ${effect.heal}`);
  if (effect.damage) parts.push(`Dano ${effect.damage}`);
  if (effect.shield) parts.push(`Escudo ${effect.shield}`);
  if (effect.skip_turn) parts.push('Pula turno');
  if (effect.duration) parts.push(`Duração ${effect.duration}`);
  return parts.length ? parts.join(' · ') : 'Efeito especial';
}
