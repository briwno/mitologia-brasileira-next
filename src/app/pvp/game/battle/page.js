// src/app/pvp/game/battle/page.js
"use client";

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import BattleScreen from '@/components/Game/BattleScreen';
import { useGameState } from '@/hooks/useGameState';

export default function BattlePage() {
  const router = useRouter();
  
  // Mock players para demonstração
  const mockPlayers = useMemo(() => [
    {
      id: '1',
      nome: 'Jogador 1',
      avatar: '/images/avatars/player.jpg',
      ranking: 'Bronze II',
      energia: 3,
      deck: [
        // Lendas
        { tipo: 'lenda', nome: 'Saci-Pererê', imagem: '/images/cards/portraits/saci.jpg', ataque: 5, defesa: 3 },
        { tipo: 'lenda', nome: 'Curupira', imagem: '/images/cards/portraits/curupira.jpg', ataque: 4, defesa: 6 },
        { tipo: 'lenda', nome: 'Iara', imagem: '/images/cards/portraits/iara.jpg', ataque: 6, defesa: 4 },
        { tipo: 'lenda', nome: 'Cuca', imagem: '/images/cards/portraits/cuca.jpg', ataque: 7, defesa: 3 },
        { tipo: 'lenda', nome: 'Boto', imagem: '/images/cards/portraits/boto.jpg', ataque: 5, defesa: 5 },
        // Itens (simplificado)
        ...Array(20).fill().map((_, i) => ({
          tipo: 'item',
          nome: `Item ${i + 1}`,
          imagem: '/images/placeholder.svg',
          tipo_item: i % 2 === 0 ? 'ofensivo' : 'defensivo',
          valor: 2
        }))
      ]
    },
    {
      id: '2',
      nome: 'Oponente',
      avatar: '/images/avatars/player.jpg',
      ranking: 'Prata I',
      energia: 2,
      deck: [
        // Lendas
        { tipo: 'lenda', nome: 'Boitatá', imagem: '/images/cards/portraits/boitata.jpg', ataque: 6, defesa: 4 },
        { tipo: 'lenda', nome: 'Mula-sem-cabeça', imagem: '/images/cards/portraits/mula.jpg', ataque: 5, defesa: 4 },
        { tipo: 'lenda', nome: 'Negrinho do Pastoreio', imagem: '/images/cards/portraits/negrinho.png', ataque: 3, defesa: 7 },
        { tipo: 'lenda', nome: 'Vitória-régia', imagem: '/images/cards/portraits/vitoria.png', ataque: 4, defesa: 5 },
        { tipo: 'lenda', nome: 'Jaci', imagem: '/images/cards/portraits/jaci.png', ataque: 5, defesa: 5 },
        // Itens
        ...Array(20).fill().map((_, i) => ({
          tipo: 'item',
          nome: `Item Oponente ${i + 1}`,
          imagem: '/images/placeholder.svg',
          tipo_item: i % 2 === 0 ? 'ofensivo' : 'defensivo',
          valor: 2
        }))
      ]
    }
  ], []);

  const { gameState, executeAction, endTurn, currentPlayer, opponent } = useGameState(mockPlayers, 'pvp');

  const handleExitBattle = useCallback(() => {
    router.push('/pvp');
  }, [router]);

  return (
    <div className="relative">
      <BattleScreen
        gameState={gameState}
        currentPlayer={currentPlayer}
        opponent={opponent}
        onAction={executeAction}
        onEndTurn={endTurn}
        mode="pvp"
      />
      
      {/* Botão de sair (para desenvolvimento) */}
      <button
        onClick={handleExitBattle}
        className="fixed top-4 left-4 z-50 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
      >
        Sair da Batalha
      </button>
    </div>
  );
}