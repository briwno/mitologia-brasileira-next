// Exemplo de uso do usePlayerData simplificado
// Componente para exibir moedas do jogador

'use client';

import { usePlayerData } from '@/hooks/usePlayerData';
import { useAuth } from '@/hooks/useAuth';

export default function PlayerCoins() {
  const { user } = useAuth();
  const { coins, loading, error, canAfford, spendCoins, addCoins } = usePlayerData();

  if (!user) {
    return (
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-red-500/30">
        <p className="text-red-400 text-sm">Faça login para ver suas moedas</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-green-500/30">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Carregando moedas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-red-500/30">
        <p className="text-red-400 text-sm">Erro: {error}</p>
      </div>
    );
  }

  const handleTestPurchase = async () => {
    const cost = 100;
    if (!canAfford(cost)) {
      alert('Moedas insuficientes!');
      return;
    }

    try {
      const result = await spendCoins(cost, 'test_purchase');
      alert(`Compra realizada! Novo saldo: ${result.newBalance} moedas`);
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleTestReward = async () => {
    try {
      const result = await addCoins(50, 'test_reward');
      alert(`Recompensa recebida! Novo saldo: ${result.newBalance} moedas`);
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-green-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Moedas</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🪙</span>
          <span className="text-2xl font-bold text-yellow-400">{coins}</span>
        </div>
      </div>

      {/* Testes */}
      <div className="space-y-2">
        <button
          onClick={handleTestPurchase}
          className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm transition-colors disabled:opacity-50"
          disabled={!canAfford(100)}
        >
          Testar Compra (-100 moedas)
        </button>

        <button
          onClick={handleTestReward}
          className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm transition-colors"
        >
          Testar Recompensa (+50 moedas)
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          {canAfford(100) ? '✅ Pode comprar item de 100 moedas' : '❌ Moedas insuficientes para item de 100'}
        </p>
      </div>
    </div>
  );
}
