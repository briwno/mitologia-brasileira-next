// src/app/page.js
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-green-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(120,119,198,0.3)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(74,222,128,0.3)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(59,130,246,0.1)_50%,transparent_70%)]"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
              fontSize: `${1 + Math.random() * 2}rem`
            }}
          >
            {['⚡', '🌟', '🔥', '💎', '⚔️', '🛡️', '👑'][Math.floor(Math.random() * 7)]}
          </div>
        ))}
      </div>

      <div className={`relative z-10 min-h-screen transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Header */}
        <header className="relative px-4 pt-4 pb-2">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-4">
            {/* Player Info */}
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                BR
              </div>
              <div className="hidden sm:block">
                <div className="text-white font-bold text-sm">Bruno Player</div>
                <div className="text-blue-300 text-xs">Nível 12 • Diamante 3</div>
              </div>
            </div>

            {/* Currency */}
            <div className="flex gap-3">
              <div className="bg-black/40 backdrop-blur-sm rounded-xl px-3 py-2 border border-purple-400/30 flex items-center gap-2">
                <span className="text-purple-400 text-lg">💎</span>
                <span className="text-white font-bold text-sm">1,247</span>
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-xl px-3 py-2 border border-yellow-400/30 flex items-center gap-2">
                <span className="text-yellow-400 text-lg">🪙</span>
                <span className="text-white font-bold text-sm">8,560</span>
              </div>
            </div>
          </div>

          {/* Game Title */}
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-2 animate-pulse">
              MITOLOGIA BRASILEIRA
            </h1>
            <div className="text-lg md:text-xl text-cyan-300 font-bold tracking-wider">
              ⚔️ BATALHA DOS ENCANTADOS ⚔️
            </div>
          </div>
        </header>

        {/* Main Menu Grid */}
        <div className="px-4 pb-8">
          {/* Primary Battle Button */}
          <div className="mb-6">
            <Link href="/pvp">
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gradient-to-br from-red-600 to-orange-600 rounded-3xl p-6 md:p-8 border-2 border-red-400/50 group-hover:border-red-300 transition-all duration-300 transform group-hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl md:text-4xl group-hover:animate-bounce">
                        ⚔️
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white mb-1">BATALHA</h2>
                        <p className="text-orange-200 text-sm md:text-base">Duela contra outros jogadores</p>
                      </div>
                    </div>
                    <div className="text-white/80 text-4xl group-hover:translate-x-2 transition-transform">
                      ▶️
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Secondary Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Museu */}
            <Link href="/museum">
              <div className="relative group cursor-pointer h-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-300"></div>
                <div className="relative bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30 group-hover:border-blue-300 transition-all duration-300 transform group-hover:scale-105 h-full">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl mb-3 mx-auto group-hover:animate-pulse">
                      🏛️
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">MUSEU</h3>
                    <p className="text-blue-200 text-sm">Explore as lendas</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Perfil */}
            <Link href="/profile">
              <div className="relative group cursor-pointer h-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-300"></div>
                <div className="relative bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30 group-hover:border-purple-300 transition-all duration-300 transform group-hover:scale-105 h-full">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl mb-3 mx-auto group-hover:animate-spin">
                      👤
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">PERFIL</h3>
                    <p className="text-purple-200 text-sm">Suas conquistas</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Ranking */}
            <Link href="/ranking">
              <div className="relative group cursor-pointer h-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-300"></div>
                <div className="relative bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-400/30 group-hover:border-yellow-300 transition-all duration-300 transform group-hover:scale-105 h-full">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-2xl mb-3 mx-auto group-hover:animate-bounce">
                      🏆
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">RANKING</h3>
                    <p className="text-yellow-200 text-sm">Top jogadores</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Bottom Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cartas */}
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-300"></div>
              <div className="relative bg-black/50 backdrop-blur-sm rounded-2xl p-4 border border-emerald-400/30 group-hover:border-emerald-300 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center text-xl group-hover:animate-pulse">
                    🎴
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">SUAS CARTAS</h3>
                    <p className="text-emerald-200 text-sm">47/60 cartas coletadas</p>
                  </div>
                  <div className="text-emerald-300 text-2xl group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </div>
              </div>
            </div>

            {/* Loja */}
            
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-300"></div>
              <div className="relative bg-black/50 backdrop-blur-sm rounded-2xl p-4 border border-pink-400/30 group-hover:border-pink-300 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center text-xl group-hover:animate-spin">
                    🛒
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">LOJA</h3>
                    <p className="text-pink-200 text-sm">Pacotes e ofertas especiais</p>
                  </div>
                  <div className="text-pink-300 text-2xl group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tab Bar (Mobile) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-white/20 px-4 py-2">
          <div className="flex justify-around items-center">
            <button className="flex flex-col items-center gap-1 p-2 text-blue-400">
              <span className="text-xl">🏠</span>
              <span className="text-xs font-medium">Início</span>
            </button>
            <Link href="/pvp" className="flex flex-col items-center gap-1 p-2 text-gray-400">
              <span className="text-xl">⚔️</span>
              <span className="text-xs font-medium">Batalha</span>
            </Link>
            <Link href="/museum" className="flex flex-col items-center gap-1 p-2 text-gray-400">
              <span className="text-xl">🏛️</span>
              <span className="text-xs font-medium">Museu</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-1 p-2 text-gray-400">
              <span className="text-xl">👤</span>
              <span className="text-xs font-medium">Perfil</span>
            </Link>
          </div>
        </div>

        {/* Notification Dot */}
        <div className="fixed top-20 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      </div>
    </main>
  );
}