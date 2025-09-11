// src/components/Card/CardDetail.js
"use client";

import CardImage from './CardImage';
import Icon from '@/components/UI/Icon';

// Detalhe da Carta
export default function DetalheDaCarta({ card, onClose = null }) {
  if (!card) return null;

  const obterCorDeRaridade = (rarity) => {
    switch (rarity) {
      case 'Épico': return 'border-purple-500 text-purple-400 bg-purple-900/20';
      case 'Lendário': return 'border-yellow-500 text-yellow-400 bg-yellow-900/20';
      case 'Mítico': return 'border-red-500 text-red-400 bg-red-900/20';
      default: return 'border-gray-500 text-gray-400 bg-gray-900/20';
    }
  };

  const obterPPMaximoPadrao = (indice) => {
    // índice começa em 0 para skill1..skill5
    switch (indice) {
      case 0: return 10;
      case 1: return 10;
      case 2: return 5;
      case 3: return 3;
      case 4: return 1;
      default: return 1;
    }
  };

  const obterIconeDoTipo = (raw) => {
    const type = (raw || '').toString().toLowerCase();
    switch (type) {
      case 'creature': return '👾';
      case 'spell': return '✨';
      case 'artifact': return '⚱️';
      default: return '👾';
    }
  };

  return (
  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-600/30 w-full max-w-6xl xl:max-w-7xl max-h-[90vh] overflow-y-auto">
      {/* Header com botão de fechar */}
      <div className="flex justify-between items-start mb-3 sm:mb-4">
  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white pr-2">{card.nome}</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-lg sm:text-xl flex-shrink-0"
          >
            <Icon name="x" size={20} />
          </button>
        )}
      </div>

  {true ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda: Habilidades */}
          <aside className="order-2 lg:order-1 lg:col-span-3 space-y-3">
            <div className="text-sm font-bold text-white/80">Habilidades</div>
            {card.habilidades && (
              <div className="space-y-2">
                {(() => {
                  const abilities = card.habilidades;
                  const usesNew = abilities.skill1 || abilities.skill2 || abilities.skill3 || abilities.skill4 || abilities.skill5;
                  if (usesNew) {
                    const skillBlocks = [abilities.skill1, abilities.skill2, abilities.skill3, abilities.skill4, abilities.skill5].filter(Boolean);
                    const palettes = [
                      { box: 'bg-blue-900/30 border-blue-500/30', label: 'text-blue-400' },
                      { box: 'bg-cyan-900/30 border-cyan-500/30', label: 'text-cyan-400' },
                      { box: 'bg-purple-900/30 border-purple-500/30', label: 'text-purple-400' },
                      { box: 'bg-amber-900/30 border-amber-500/30', label: 'text-amber-400' },
                      { box: 'bg-red-900/30 border-red-500/30', label: 'text-red-400' },
                    ];
                    return (
                      <>
                        {skillBlocks.map((s, idx) => {
                          const pal = palettes[idx] || palettes[0];
                          return (
                            <div key={`skill-${idx}`} className={`${pal.box} p-2 sm:p-3 rounded border border-white/10`}>
                              <div className="flex justify-between items-center mb-1">
                                <div className={`text-xs sm:text-sm font-semibold ${pal.label}`}>
                                  {idx === 4 ? '🌟 Ultimate' : `Habilidade ${idx + 1}`}
                                </div>
                                {typeof s.ppMax === 'number' && typeof s.pp === 'number' ? (
                                  <div className="text-xs text-yellow-400">PP {s.pp}/{s.ppMax}</div>
                                ) : s.ppMax ? (
                                  <div className="text-xs text-yellow-400">PP {s.ppMax}/{s.ppMax}</div>
                                ) : (
                                  <div className="text-xs text-yellow-400">PP {obterPPMaximoPadrao(idx)}/{obterPPMaximoPadrao(idx)}</div>
                                )}
                              </div>
                              <div className="font-semibold mb-1 text-sm sm:text-base">{s.name}</div>
                              <div className="text-xs sm:text-sm text-gray-300">{s.description}</div>
                            </div>
                          );
                        })}
                      </>
                    );
                  }
                  // Fallback antigo: básica e ultimate
                  return (
                    <>
                      {abilities.basic && (
                        <div className="bg-blue-900/30 p-2 sm:p-3 rounded border border-white/10">
                          <div className="flex justify-between items-center mb-1">
                            <div className="text-xs sm:text-sm text-blue-400 font-semibold">⚡ Habilidade Básica</div>
                            <div className="text-xs text-yellow-400">💎{abilities.basic.cost}</div>
                          </div>
                          <div className="font-semibold mb-1 text-sm sm:text-base">{abilities.basic.name}</div>
                          <div className="text-xs sm:text-sm text-gray-300">{abilities.basic.description}</div>
                          {abilities.basic.cooldown > 0 && (
                            <div className="text-xs text-orange-400 mt-1">⏱️ Recarga: {abilities.basic.cooldown} turno(s)</div>
                          )}
                        </div>
                      )}
                      {abilities.ultimate && (
                        <div className="bg-purple-900/30 p-2 sm:p-3 rounded border border-white/10">
                          <div className="flex justify-between items-center mb-1">
                            <div className="text-xs sm:text-sm text-purple-400 font-semibold">🌟 Ultimate</div>
                            <div className="text-xs text-yellow-400">💎{abilities.ultimate.cost}</div>
                          </div>
                          <div className="font-semibold mb-1 text-sm sm:text-base">{abilities.ultimate.name}</div>
                          <div className="text-xs sm:text-sm text-gray-300">{abilities.ultimate.description}</div>
                          <div className="text-xs text-orange-400 mt-1">⏱️ Recarga: {abilities.ultimate.cooldown} turno(s)</div>
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* Habilidade Passiva */}
                {card.habilidades.passive && (
                  <div className="bg-green-900/30 p-2 sm:p-3 rounded border border-white/10">
                    <div className="text-xs sm:text-sm text-green-400 font-semibold mb-1">🔮 Passiva</div>
                    <div className="font-semibold mb-1 text-sm sm:text-base">{card.habilidades.passive.name}</div>
                    <div className="text-xs sm:text-sm text-gray-300">{card.habilidades.passive.description}</div>
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* Coluna Central: Imagem */}
          <section className="order-1 lg:order-2 lg:col-span-6 flex items-center justify-center">
            <div className="w-full max-w-[960px] rounded-2xl border border-white/10 bg-black/20 p-3 shadow-xl">
              <CardImage card={card} size="xl" preferFull className="w-full h-[34rem] md:h-[38rem] xl:h-[42rem]" />
            </div>
          </section>

          {/* Coluna Direita: Outras Informações */}
          <aside className="order-3 lg:col-span-3 space-y-3">
            {/* Informações básicas */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <div className="text-xs sm:text-sm text-gray-400">Região</div>
                <div className="font-semibold text-sm sm:text-base">{card.regiao}</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-400">Categoria</div>
                <div className="font-semibold text-sm sm:text-base">{card.categoria}</div>
              </div>
            </div>

            {/* Tipo e Raridade */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <div className="text-xs sm:text-sm text-gray-400">Tipo</div>
                <div className="font-semibold text-sm sm:text-base">
                  {obterIconeDoTipo(card.tipo || card.type)} {(card.tipo || card.type || 'creature') === 'creature' ? 'Criatura' : (card.tipo || card.type) === 'spell' ? 'Feitiço' : 'Artefato'} 
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-400">Raridade</div>
                <div className={`font-semibold text-sm sm:text-base ${obterCorDeRaridade(card.raridade).split(' ')[1]}`}>
                  {card.raridade}
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            {card.tipo === 'creature' && (
              <div className="bg-black/40 p-2 sm:p-3 rounded">
                <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center">
                  <div>
                    <div className="text-xs text-red-400">Ataque</div>
                    <div className="text-sm sm:text-lg lg:text-xl font-bold">⚔️{card.ataque}</div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-400">Defesa</div>
                    <div className="text-sm sm:text-lg lg:text-xl font-bold">🛡️{card.defesa}</div>
                  </div>
                  <div>
                    <div className="text-xs text-green-400">Vida</div>
                    <div className="text-sm sm:text-lg lg:text-xl font-bold">❤️{card.vida}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Elemento */}
            {card.elemento && (
              <div className="bg-black/40 p-3 rounded">
                <div className="text-sm text-cyan-400 mb-1">Elemento</div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {card.elemento === 'Terra' ? '🌍' :
                     card.elemento === 'Água' ? '💧' :
                     card.elemento === 'Fogo' ? '🔥' :
                     card.elemento === 'Ar' ? '💨' :
                     card.elemento === 'Espírito' ? '👻' : '⭐'}
                  </span>
                  <span className="font-semibold">{card.elemento}</span>
                </div>
              </div>
            )}

            {/* Condição de Desbloqueio */}
            {card.condicaoDesbloqueio && (
              <div className="bg-black/40 p-3 rounded">
                <div className="text-sm text-orange-400 mb-1">🔓 Desbloqueio</div>
                <div className="text-sm text-gray-300">{card.condicaoDesbloqueio}</div>
              </div>
            )}

            {/* Bônus Sazonal */}
            {card.bonusSazonal && (
              <div className="bg-yellow-900/30 p-3 rounded border border-yellow-500/30">
                <div className="text-sm text-yellow-400 mb-1">🎉 Bônus Sazonal</div>
                <div className="font-semibold mb-1">{card.bonusSazonal.estacao}</div>
                <div className="text-sm text-gray-300 mb-1">{card.bonusSazonal.descricao}</div>
                <div className="text-xs text-yellow-300">Multiplicador: {card.bonusSazonal.multiplicador}x</div>
              </div>
            )}

            {/* Lore */}
            {card.historia && (
              <div className="bg-black/40 p-3 rounded">
                <div className="text-sm text-cyan-400 mb-1">História</div>
                <div className="text-sm text-gray-300 italic">{card.historia}</div>
              </div>
            )}

            {/* Tags */}
            {card.tags && card.tags.length > 0 && (
              <div>
                <div className="text-sm text-gray-400 mb-2">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {card.tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-gray-700 px-2 py-1 rounded">#{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
  ) : null}
    </div>
  );
}
