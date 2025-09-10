// src/app/museum/page.js
"use client";

import Link from 'next/link';
import LayoutDePagina from '../../components/UI/PageLayout';

export default function Museum() {
  return (
    <LayoutDePagina>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            🏛️ Modo Museu
          </h1>
          <p className="text-xl text-green-300 mb-8">
            Explore a rica mitologia brasileira e desbloqueie cartas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <Link href="/museum/cards">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-blue-500/30 hover:border-blue-400 transition-all cursor-pointer group">
              <div className="text-center">
                <div className="text-4xl mb-4">🃏</div>
                <h3 className="text-2xl font-bold mb-3 text-blue-400 group-hover:text-blue-300">
                  Catálogo de Cartas
                </h3>
                <p className="text-gray-300 mb-4">
                  Explore todas as cartas do jogo e aprenda sobre cada criatura folclórica
                </p>
                <div className="text-sm text-blue-300">
                  📊 12/30 cartas descobertas
                </div>
              </div>
            </div>
          </Link>

          <Link href="/museum/stories">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-rose-500/30 hover:border-rose-400 transition-all cursor-pointer group">
              <div className="text-center">
                <div className="text-4xl mb-4">📖</div>
                <h3 className="text-2xl font-bold mb-3 text-rose-400 group-hover:text-rose-300">
                  Contos de Ka’aguy
                </h3>
                <p className="text-gray-300 mb-4">
                  Leia narrativas curtas sobre as lendas por trás das cartas
                </p>
                <div className="text-sm text-rose-300">
                  ✨ Novo modo
                </div>
              </div>
            </div>
          </Link>

          <Link href="/museum/quiz">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-green-500/30 hover:border-green-400 transition-all cursor-pointer group">
              <div className="text-center">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-2xl font-bold mb-3 text-green-400 group-hover:text-green-300">
                  Quiz Cultural
                </h3>
                <p className="text-gray-300 mb-4">
                  Teste seus conhecimentos sobre folclore brasileiro e ganhe recompensas
                </p>
                <div className="text-sm text-green-300">
                  🏆 Nível 3 - 850 pontos
                </div>
              </div>
            </div>
          </Link>

          <Link href="/museum/map">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-yellow-500/30 hover:border-yellow-400 transition-all cursor-pointer group">
              <div className="text-center">
                <div className="text-4xl mb-4">🗺️</div>
                <h3 className="text-2xl font-bold mb-3 text-yellow-400 group-hover:text-yellow-300">
                  Mapa das Lendas
                </h3>
                <p className="text-gray-300 mb-4">
                  Descubra a origem geográfica de cada mito e lenda brasileira
                </p>
                <div className="text-sm text-yellow-300">
                  🌎 5/7 regiões exploradas
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-8 border border-purple-500/30">
          <h2 className="text-3xl font-bold mb-6 text-purple-400">📚 Biblioteca do Folclore</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-green-400">Últimas Descobertas</h3>
              <div className="space-y-2">
                <div className="bg-black/30 p-3 rounded border-l-4 border-green-500">
                  <p className="font-medium">Curupira desbloqueado!</p>
                  <p className="text-sm text-gray-400">Protetor da floresta amazônica</p>
                </div>
                <div className="bg-black/30 p-3 rounded border-l-4 border-blue-500">
                  <p className="font-medium">Iara descoberta!</p>
                  <p className="text-sm text-gray-400">Sereia dos rios brasileiros</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-yellow-400">Conquistas Recentes</h3>
              <div className="space-y-2">
                <div className="bg-black/30 p-3 rounded">
                  <p className="font-medium">🏆 Explorador da Amazônia</p>
                  <p className="text-sm text-gray-400">Complete todas as lendas amazônicas</p>
                </div>
                <div className="bg-black/30 p-3 rounded">
                  <p className="font-medium">🎓 Mestre do Quiz</p>
                  <p className="text-sm text-gray-400">Acerte 10 perguntas seguidas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold"
          >
            ← Voltar ao Menu Principal
          </Link>
        </div>
      </div>
  </LayoutDePagina>
  );
}
