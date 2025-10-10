// Componente completo para exibir perfil do jogador
// Mostra: avatar, nome, nível, XP, moedas, MMR

'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePlayerData } from '@/hooks/usePlayerData';

export default function PlayerProfile({ compact = false }) {
  const { user, loading: authLoading } = useAuth();
  const { coins, loading: dataLoading, levelProgress } = usePlayerData();

  const loading = authLoading || dataLoading;

  if (loading) {
    return (
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-green-500/30 animate-pulse">
        <div className="h-20 bg-gray-700 rounded" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-red-500/30">
        <p className="text-center text-red-400">Faça login para ver o perfil</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-green-500/30">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar_url}
            alt={user.username}
            className="w-10 h-10 rounded-full border-2 border-green-500"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate">{user.username}</h3>
            <p className="text-xs text-gray-400 truncate">{user.title}</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg">🪙</span>
            <span className="font-bold text-yellow-400">{coins}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-green-500/30">
      {/* Header com avatar e info básica */}
      <div className="flex items-start gap-4 mb-6">
        <img
          src={user.avatar_url}
          alt={user.username}
          className="w-20 h-20 rounded-full border-4 border-green-500 shadow-lg"
        />
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{user.username}</h2>
          <p className="text-gray-400 text-sm mb-2">{user.title}</p>
          
          {/* Nível e XP */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Nível {user.level}</span>
              <span className="text-gray-400">
                {levelProgress.current} / {levelProgress.required} XP
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-500"
                style={{ width: `${levelProgress.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats em Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Moedas */}
        <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/30">
          <div className="text-center">
            <div className="text-2xl mb-1">🪙</div>
            <p className="text-xs text-gray-400 mb-1">Moedas</p>
            <p className="text-xl font-bold text-yellow-400">{coins}</p>
          </div>
        </div>

        {/* Level */}
        <div className="bg-black/30 p-4 rounded-lg border border-green-500/30">
          <div className="text-center">
            <div className="text-2xl mb-1">⭐</div>
            <p className="text-xs text-gray-400 mb-1">Nível</p>
            <p className="text-xl font-bold text-green-400">{user.level}</p>
          </div>
        </div>

        {/* MMR */}
        <div className="bg-black/30 p-4 rounded-lg border border-purple-500/30">
          <div className="text-center">
            <div className="text-2xl mb-1">🏆</div>
            <p className="text-xs text-gray-400 mb-1">MMR</p>
            <p className="text-xl font-bold text-purple-400">{user.mmr || 1000}</p>
          </div>
        </div>
      </div>

      {/* XP atual do usuário */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>XP Total: {user.xp || 0}</span>
          <span>ID: {user.id}</span>
        </div>
      </div>
    </div>
  );
}
