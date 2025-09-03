// src/components/UI/EventBanner.js
"use client";

import { useState, useEffect } from 'react';
import { getCurrentEvents, getCardEventBonus } from '../../utils/seasonalEvents';
import Icon from '@/components/UI/Icon';

export default function EventBanner({ card = null, showDetailed = false }) {
  const [eventosAtivos, definirEventosAtivos] = useState([]);
  const [bonusDaCarta, definirBonusDaCarta] = useState(null);

  useEffect(() => {
  const events = getCurrentEvents();
  definirEventosAtivos(events);

    if (card) {
    const bonus = getCardEventBonus(card);
    definirBonusDaCarta(bonus);
    }
  }, [card]);

  if (eventosAtivos.length === 0) return null;

  const obterIconeDoEvento = (eventName) => {
    switch (eventName) {
      case 'Carnaval': return 'carnival';
      case 'São João': return 'bonfire';
      case 'Festa Junina': return 'corn';
      case 'Dia do Folclore': return 'book';
      case 'Lua Cheia': return 'moon';
      case 'Dia da Amazônia': return 'forest';
      default: return 'star';
    }
  };

  const obterCorDoEvento = (eventName) => {
    switch (eventName) {
      case 'Carnaval': return 'from-purple-600 to-yellow-500';
      case 'São João': return 'from-orange-600 to-red-500';
      case 'Festa Junina': return 'from-yellow-600 to-orange-500';
      case 'Dia do Folclore': return 'from-green-600 to-blue-500';
      case 'Lua Cheia': return 'from-blue-800 to-purple-600';
      case 'Dia da Amazônia': return 'from-green-700 to-green-500';
      default: return 'from-gray-600 to-gray-500';
    }
  };

  if (card && bonusDaCarta?.hasBonus) {
    // Banner específico para carta com bônus
    return (
      <div className="bg-gradient-to-r from-yellow-600 to-orange-500 text-white p-2 rounded-lg mb-2 border border-yellow-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">⭐</span>
            <div>
              <div className="text-sm font-bold">Bônus Ativo!</div>
              <div className="text-xs">
        {bonusDaCarta.bonuses.map(bonus => bonus.event).join(', ')}
              </div>
            </div>
          </div>
          <div className="text-right">
      <div className="text-lg font-bold">{bonusDaCarta.multiplier.toFixed(1)}x</div>
            <div className="text-xs">Multiplicador</div>
          </div>
        </div>
      </div>
    );
  }

  if (!showDetailed) {
    // Banner simples - apenas no topo da página, não fixo
    return (
      <div className="mb-6">
    {eventosAtivos.slice(0, 1).map((event, index) => (
          <div
            key={event.id}
      className={`bg-gradient-to-r ${obterCorDoEvento(event.name)} text-white p-3 rounded-lg shadow-lg border-2 border-white/20 backdrop-blur-sm mx-auto max-w-md`}
          >
            <div className="flex items-center space-x-3">
        <span className="text-xl sm:text-2xl">
          <Icon name={obterIconeDoEvento(event.name)} size={24} />
        </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm sm:text-base">{event.name}</div>
                <div className="text-xs sm:text-sm opacity-90 truncate">{event.description}</div>
                <div className="text-xs mt-1 bg-black/20 rounded px-2 py-1 inline-block">
                  Multiplicador: {event.multiplier}x
                </div>
              </div>
            </div>
            {event.duration?.daysRemaining && (
              <div className="mt-2 text-xs text-center bg-black/20 rounded px-2 py-1 flex items-center justify-center gap-1">
                <Icon name="clock" size={12} />
                {event.duration.daysRemaining} dia(s) restante(s)
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Banner detalhado para página de eventos
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-center mb-4 flex items-center justify-center gap-2">
        <Icon name="star" size={24} />
        Eventos Ativos
      </h3>
    {eventosAtivos.map((event, index) => (
        <div
          key={event.id}
      className={`bg-gradient-to-r ${obterCorDoEvento(event.name)} text-white p-4 rounded-lg border-2 border-white/20`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
        <span className="text-3xl">
          <Icon name={obterIconeDoEvento(event.name)} size={32} />
        </span>
              <div>
                <h4 className="text-lg font-bold">{event.name}</h4>
                <p className="text-sm opacity-90">{event.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{event.multiplier}x</div>
              <div className="text-xs">Multiplicador</div>
            </div>
          </div>

          {/* Cartas com bônus */}
          <div className="mb-3">
            <div className="text-sm font-semibold mb-2 flex items-center gap-1">
              <Icon name="cards" size={16} />
              Cartas com Bônus:
            </div>
            <div className="flex flex-wrap gap-2">
              {event.bonusCards.includes('all') ? (
                <span className="text-xs bg-black/20 rounded px-2 py-1">Todas as cartas</span>
              ) : (
                event.bonusCards.map((cardId, idx) => (
                  <span key={idx} className="text-xs bg-black/20 rounded px-2 py-1">
                    {cardId}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Efeitos especiais */}
          {event.specialEffects && event.specialEffects.length > 0 && (
            <div className="mb-3">
              <div className="text-sm font-semibold mb-2">✨ Efeitos Especiais:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {event.specialEffects.map((effect, idx) => (
                  <div key={idx} className="text-xs bg-black/20 rounded px-2 py-1">
                    {effect.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Duração */}
          {event.duration && (
            <div className="text-center">
              <div className="text-sm font-semibold mb-1">⏰ Tempo Restante</div>
              {event.duration.daysRemaining ? (
                <div className="text-lg font-bold">
                  {event.duration.daysRemaining} dia(s)
                </div>
              ) : event.duration.hours ? (
                <div className="text-lg font-bold">
                  {event.duration.hours} hora(s)
                </div>
              ) : (
                <div className="text-lg font-bold">Tempo limitado!</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Componente para mostrar multiplicadores ativos no jogo
export function GameMultipliers({ gameState, cards = [] }) {
  const [multiplicadores, definirMultiplicadores] = useState([]);

  useEffect(() => {
  const multiplicadoresAtivos = [];

    // Verificar eventos sazonais
    const events = getCurrentEvents();
    events.forEach(event => {
      const affectedCards = cards.filter(card => 
        event.bonusCards.includes('all') || event.bonusCards.includes(card.id)
      );
      
      if (affectedCards.length > 0) {
        multiplicadoresAtivos.push({
          type: 'seasonal',
          name: event.name,
          multiplier: event.multiplier,
          icon: obterIconeDoEvento(event.name),
          cards: affectedCards.length
        });
      }
    });

    // Verificar multiplicador regional
  const regions = [...new Set(cards.map(card => card.regiao || card.region))];
    const regionCounts = {};
    regions.forEach(region => {
  const count = cards.filter(card => (card.regiao || card.region) === region).length;
      if (count > 1) {
        regionCounts[region] = count;
  multiplicadoresAtivos.push({
          type: 'regional',
          name: `Sinergia ${region}`,
          multiplier: 1.25,
          icon: '🌍',
          cards: count
        });
      }
    });

    // Verificar lua cheia
    if (gameState?.isFullMoon) {
      const nightCreatures = cards.filter(card => 
        card.tags?.includes('noturno')
      );
      
      if (nightCreatures.length > 0) {
        multiplicadoresAtivos.push({
          type: 'lunar',
          name: 'Lua Cheia',
          multiplier: 2.0,
          icon: '🌕',
          cards: nightCreatures.length
        });
      }
    }

    definirMultiplicadores(multiplicadoresAtivos);
  }, [gameState, cards]);

  if (multiplicadores.length === 0) return null;

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-gray-600/30">
      <div className="text-sm font-bold text-center mb-2 text-yellow-400">
        🎯 Multiplicadores Ativos
      </div>
      <div className="space-y-2">
    {multiplicadores.map((mult, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span>{mult.icon}</span>
              <span>{mult.name}</span>
              <span className="text-gray-400">({mult.cards} carta(s))</span>
            </div>
            <span className="font-bold text-yellow-300">
              {mult.multiplier.toFixed(1)}x
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  function obterIconeDoEvento(eventName) {
    switch (eventName) {
      case 'Carnaval': return '🎭';
      case 'São João': return '🔥';
      case 'Festa Junina': return '🌽';
      case 'Dia do Folclore': return '📚';
      case 'Lua Cheia': return '🌕';
      case 'Dia da Amazônia': return '🌳';
      default: return '🎉';
    }
  }
}
