// src/app/page.js

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-900 via-blue-900 to-purple-900 text-white p-4">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          Mitologia Brasileira
        </h1>
        <h2 className="text-3xl font-semibold mb-6 text-green-300">
          Batalha dos Encantados
        </h2>
        <p className="text-lg mb-8 text-center max-w-2xl leading-relaxed">
          Bem-vindo ao jogo de cartas inspirado na rica mitologia brasileira!
          Explore o modo museu para conhecer as lendas ou desafie outros jogadores
          em batalhas emocionantes com criaturas folclóricas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-green-500/30">
          <h3 className="text-xl font-bold mb-2 text-green-400">🏛️ Modo Museu</h3>
          <p className="text-sm mb-4">Descubra as lendas brasileiras, complete quizzes e desbloqueie cartas</p>
          <a
            href="/museum"
            className="block w-full text-center px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Explorar
          </a>
        </div>

        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-red-500/30">
          <h3 className="text-xl font-bold mb-2 text-red-400">⚔️ Batalha PvP</h3>
          <p className="text-sm mb-4">Duela contra outros jogadores com seu baralho personalizado</p>
          <a
            href="/pvp"
            className="block w-full text-center px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors"
          >
            Batalhar
          </a>
        </div>

        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-yellow-500/30">
          <h3 className="text-xl font-bold mb-2 text-yellow-400">👤 Perfil</h3>
          <p className="text-sm mb-4">Veja suas cartas, conquistas e estatísticas</p>
          <a
            href="/profile"
            className="block w-full text-center px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition-colors"
          >
            Ver Perfil
          </a>
        </div>
      </div>

      <div className="space-x-4">
        <a
          href="/login"
          className="px-8 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-semibold"
        >
          Entrar / Cadastrar
        </a>
        <a
          href="/ranking"
          className="px-8 py-3 bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
        >
          Ranking
        </a>
      </div>

      <div className="mt-12 text-center text-sm text-gray-400">
        <p>Preservando e celebrando o folclore brasileiro através dos jogos</p>
      </div>
    </main>
  );
}