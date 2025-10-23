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
  isEnemy = false // Compatibilidade com BattleScreen
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
    <div className={`${bgColor} border-2 rounded-xl px-3 py-2 shadow-lg`}>
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
    </div>
  );
}
