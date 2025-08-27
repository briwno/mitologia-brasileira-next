// src/app/museum/map/page.js
"use client";

import Link from 'next/link';
import { useState } from 'react';
import LayoutDePagina from '../../../components/UI/PageLayout';

export default function InteractiveMap() {
  const [selectedRegion, setSelectedRegion] = useState(null);

  const regions = [
    {
      id: 'north',
      name: 'Região Norte',
      description: 'Amazônia e seus mistérios',
      legends: ['Curupira', 'Iara', 'Boto Cor-de-Rosa', 'Mapinguari', 'Cobra Grande'],
      completed: 4,
      total: 5,
      color: 'bg-green-500',
      position: { top: '20%', left: '25%' }
    },
    {
      id: 'northeast',
      name: 'Região Nordeste',
      description: 'Sertão e lendas do cangaço',
      legends: ['Caipora', 'Mãe d\'Água', 'Caboclo d\'Água', 'Cuca', 'Lobisomem'],
      completed: 2,
      total: 5,
      color: 'bg-yellow-500',
      position: { top: '25%', left: '55%' }
    },
    {
      id: 'centerwest',
      name: 'Região Centro-Oeste',
      description: 'Pantanal e cerrado míticos',
      legends: ['Minhocão', 'Pisadeira', 'Anhangá', 'Matinta Perera'],
      completed: 1,
      total: 4,
      color: 'bg-orange-500',
      position: { top: '45%', left: '35%' }
    },
    {
      id: 'southeast',
      name: 'Região Sudeste',
      description: 'Montanhas e vales assombrados',
      legends: ['Saci-Pererê', 'Mula sem Cabeça', 'Cuca', 'Corpo-Seco', 'Loira do Banheiro'],
      completed: 3,
      total: 5,
      color: 'bg-blue-500',
      position: { top: '60%', left: '50%' }
    },
    {
      id: 'south',
      name: 'Região Sul',
      description: 'Pampas e tradições gaúchas',
      legends: ['Boitatá', 'Negrinho do Pastoreio', 'M\'Boi-Tatá', 'Alamoa'],
      completed: 2,
      total: 4,
      color: 'bg-purple-500',
      position: { top: '75%', left: '45%' }
    }
  ];

  const getProgressColor = (completed, total) => {
    const percentage = (completed / total) * 100;
    if (percentage === 100) return 'text-green-400';
    if (percentage >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <LayoutDePagina>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            🗺️ Mapa das Lendas
          </h1>
          <p className="text-xl text-green-300">
            Explore as origens geográficas da mitologia brasileira
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mapa */}
          <div className="lg:col-span-2">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
              <h2 className="text-2xl font-bold mb-6 text-center">Mapa do Brasil</h2>
              
              {/* Área do Mapa */}
              <div className="relative w-full h-96 bg-gradient-to-b from-green-800 to-blue-800 rounded-lg border-2 border-gray-600 overflow-hidden">
                {/* Representação simplificada do mapa do Brasil */}
                <div className="absolute inset-0 opacity-20">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path
                      d="M20,15 L35,10 L55,15 L70,20 L75,35 L70,50 L65,65 L55,75 L45,80 L35,75 L25,70 L20,55 L15,40 L20,25 Z"
                      fill="currentColor"
                      className="text-green-600"
                    />
                  </svg>
                </div>

                {/* Pontos das regiões */}
                {regions.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => setSelectedRegion(region)}
                    className={`absolute w-6 h-6 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 ${region.color} ${
                      selectedRegion?.id === region.id ? 'scale-150 ring-4 ring-white/50' : ''
                    }`}
                    style={{ top: region.position.top, left: region.position.left }}
                    title={region.name}
                  >
                    <span className="sr-only">{region.name}</span>
                  </button>
                ))}

                {/* Legenda */}
                <div className="absolute bottom-4 left-4 bg-black/50 p-2 rounded text-xs">
                  <div className="text-white/80">Clique nos pontos para explorar</div>
                </div>
              </div>

              {/* Progresso geral */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                {regions.map((region) => (
                  <div
                    key={region.id}
                    className={`text-center p-3 rounded-lg cursor-pointer transition-all ${
                      selectedRegion?.id === region.id 
                        ? 'bg-black/50 border border-white/30' 
                        : 'bg-black/20 hover:bg-black/30'
                    }`}
                    onClick={() => setSelectedRegion(region)}
                  >
                    <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${region.color}`}></div>
                    <div className="text-xs font-semibold">{region.name.split(' ')[1]}</div>
                    <div className={`text-xs ${getProgressColor(region.completed, region.total)}`}>
                      {region.completed}/{region.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Painel de Informações */}
          <div className="space-y-6">
            {selectedRegion ? (
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
                <div className={`w-8 h-8 rounded-full ${selectedRegion.color} mb-4`}></div>
                <h3 className="text-2xl font-bold mb-2">{selectedRegion.name}</h3>
                <p className="text-gray-300 mb-4">{selectedRegion.description}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Progresso</span>
                    <span className={`text-sm font-bold ${getProgressColor(selectedRegion.completed, selectedRegion.total)}`}>
                      {selectedRegion.completed}/{selectedRegion.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(selectedRegion.completed / selectedRegion.total) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Lendas da Região:</h4>
                  <div className="space-y-2">
                    {selectedRegion.legends.map((legend, index) => (
                      <div
                        key={legend}
                        className={`p-2 rounded border-l-4 ${
                          index < selectedRegion.completed 
                            ? 'border-green-500 bg-green-500/10 text-green-300' 
                            : 'border-gray-600 bg-gray-600/10 text-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{legend}</span>
                          <span className="text-xs">
                            {index < selectedRegion.completed ? '✅' : '🔒'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30 text-center">
                <div className="text-4xl mb-4">🗺️</div>
                <h3 className="text-xl font-bold mb-2">Explore o Mapa</h3>
                <p className="text-gray-300">
                  Clique nos pontos do mapa para descobrir as lendas de cada região do Brasil
                </p>
              </div>
            )}

            {/* Estatísticas Gerais */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
              <h3 className="text-xl font-bold mb-4">📊 Estatísticas Gerais</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Regiões Exploradas:</span>
                  <span className="font-bold text-green-400">5/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lendas Descobertas:</span>
                  <span className="font-bold text-yellow-400">12/23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Progresso Total:</span>
                  <span className="font-bold text-blue-400">52%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/museum"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold"
          >
            ← Voltar ao Museu
          </Link>
        </div>
      </div>
  </LayoutDePagina>
  );
}
