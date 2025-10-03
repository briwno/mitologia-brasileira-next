// src/components/Card/CardDetail.js
"use client";

import CardImage from './CardImage';
import Icon from '@/components/UI/Icon';
import { obterClassesDeRaridade, obterIconeTipoCarta } from '@/utils/cardUtils';

// Detalhe da Carta com diferentes modos de exibição
export default function DetalheDaCarta({ card, onClose = null, mode = 'battle', wrapperClassName = '' }) {
  if (!card) return null;

  // Usar função utilitária para cores de raridade
  const obterCorDeRaridade = obterClassesDeRaridade;

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

  // Usar função utilitária para ícones de tipo
  const obterIconeDoTipo = obterIconeTipoCarta;

  const isItemCard = (() => {
    if (!card) return false;
    if (card.itemType != null || card.effects != null) return true;
    const tipo = (card.tipo || card.type || card.cardType || '').toString().toLowerCase();
    if (tipo.includes('item')) return true;
    const categoria = (card.categoria || card.category || '').toString().toLowerCase();
    return categoria.includes('item') || categoria.includes('equipamento') || categoria.includes('consum') || categoria.includes('artefato');
  })();

  const itemEffect = card?.effects || card?.efeito || null;
  const getEffectDescription = () => {
    if (!itemEffect) return null;
    if (typeof itemEffect === 'string') return itemEffect;
    return (
      itemEffect.description ||
      itemEffect.descricao ||
      itemEffect.text ||
      itemEffect.effect ||
      null
    );
  };

  const getEffectMeta = () => {
    if (!itemEffect || typeof itemEffect === 'string') return {};
    return {
      type: itemEffect.type || itemEffect.tipo || null,
      value: itemEffect.value || itemEffect.valor || null,
      duration: itemEffect.duration || itemEffect.duracao || null,
      trigger: itemEffect.trigger || itemEffect.condicao || null,
    };
  };

  const effectDescription = getEffectDescription();
  const effectMeta = getEffectMeta();

  const baseWrapperClasses = "bg-black/30 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-600/30 w-full max-w-6xl xl:max-w-7xl overflow-y-auto";
  const extraWrapperClasses = wrapperClassName && wrapperClassName.trim().length > 0 ? wrapperClassName : 'max-h-[90vh]';

  return (
    <div className={`${baseWrapperClasses} ${extraWrapperClasses}`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda: Habilidades */}
          <aside className="order-2 lg:order-1 lg:col-span-3 space-y-3">
            <div className="text-sm font-bold text-white/80">{isItemCard ? 'Efeito do Item' : 'Habilidades'}</div>
            <div className="space-y-2">
              {isItemCard ? (
                <>
                  {effectDescription ? (
                    <div className="bg-purple-900/30 p-2 sm:p-3 rounded border border-white/10">
                      <div className="text-xs sm:text-sm text-purple-300 font-semibold mb-1">✨ Efeito Principal</div>
                      {effectMeta.type && (
                        <div className="text-[11px] uppercase tracking-wide text-purple-200 mb-1">{effectMeta.type}</div>
                      )}
                      <div className="text-xs sm:text-sm text-gray-200 leading-relaxed">{effectDescription}</div>
                      <div className="mt-2 grid grid-cols-1 gap-1 text-[11px] text-gray-300">
                        {effectMeta.value && <div className="text-yellow-300">⚙️ Valor: {effectMeta.value}</div>}
                        {effectMeta.duration && <div className="text-cyan-300">⏱️ Duração: {effectMeta.duration}</div>}
                        {effectMeta.trigger && <div className="text-orange-300">🔁 Condição: {effectMeta.trigger}</div>}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">Nenhum efeito configurado para este item.</div>
                  )}

                  {(card.description || card.descricao || card.lore) && (
                    <div className="bg-black/40 p-3 rounded border border-white/10">
                      <div className="text-xs sm:text-sm text-purple-300 font-semibold mb-1">📜 Descrição</div>
                      <div className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        {card.description || card.descricao || card.lore}
                      </div>
                    </div>
                  )}
                </>
              ) : card.habilidades ? (
                <>
                  {(() => {
                    const habilidades = card.habilidades;
                    const possuiNovaEstrutura = Boolean(
                      habilidades.skill1 ||
                      habilidades.skill2 ||
                      habilidades.skill3 ||
                      habilidades.skill4 ||
                      habilidades.skill5
                    );

                    if (possuiNovaEstrutura) {
                      const blocos = [
                        habilidades.skill1,
                        habilidades.skill2,
                        habilidades.skill3,
                        habilidades.skill4,
                        habilidades.skill5,
                      ].filter(Boolean);

                      const paletas = [
                        { caixa: 'bg-blue-900/30 border-blue-500/30', rotulo: 'text-blue-400' },
                        { caixa: 'bg-cyan-900/30 border-cyan-500/30', rotulo: 'text-cyan-400' },
                        { caixa: 'bg-purple-900/30 border-purple-500/30', rotulo: 'text-purple-400' },
                        { caixa: 'bg-amber-900/30 border-amber-500/30', rotulo: 'text-amber-400' },
                        { caixa: 'bg-red-900/30 border-red-500/30', rotulo: 'text-red-400' },
                      ];

                      return (
                        <>
                          {blocos.map((habilidade, indice) => {
                            const paleta = paletas[indice] || paletas[0];
                            const ppMaximo = typeof habilidade.ppMax === 'number' ? habilidade.ppMax : obterPPMaximoPadrao(indice);
                            const ppAtual = typeof habilidade.pp === 'number' ? habilidade.pp : ppMaximo;

                            return (
                              <div key={`skill-${indice}`} className={`${paleta.caixa} p-2 sm:p-3 rounded border border-white/10`}>
                                <div className="flex justify-between items-center mb-1">
                                  <div className={`text-xs sm:text-sm font-semibold ${paleta.rotulo}`}>
                                    {indice === 4 ? '🌟 Ultimate' : `Habilidade ${indice + 1}`}
                                  </div>
                                  <div className="text-xs text-yellow-400">PP {ppAtual}/{ppMaximo}</div>
                                </div>
                                <div className="font-semibold mb-1 text-sm sm:text-base">{habilidade.name}</div>
                                <div className="text-xs sm:text-sm text-gray-300">{habilidade.description}</div>
                              </div>
                            );
                          })}
                        </>
                      );
                    }

                    return (
                      <>
                        {habilidades.basic && (
                          <div className="bg-blue-900/30 p-2 sm:p-3 rounded border border-white/10">
                            <div className="flex justify-between items-center mb-1">
                              <div className="text-xs sm:text-sm text-blue-400 font-semibold">⚡ Habilidade Básica</div>
                              <div className="text-xs text-yellow-400">💎{habilidades.basic.cost}</div>
                            </div>
                            <div className="font-semibold mb-1 text-sm sm:text-base">{habilidades.basic.name}</div>
                            <div className="text-xs sm:text-sm text-gray-300">{habilidades.basic.description}</div>
                            {habilidades.basic.cooldown > 0 && (
                              <div className="text-xs text-orange-400 mt-1">⏱️ Recarga: {habilidades.basic.cooldown} turno(s)</div>
                            )}
                          </div>
                        )}
                        {habilidades.ultimate && (
                          <div className="bg-purple-900/30 p-2 sm:p-3 rounded border border-white/10">
                            <div className="flex justify-between items-center mb-1">
                              <div className="text-xs sm:text-sm text-purple-400 font-semibold">🌟 Ultimate</div>
                              <div className="text-xs text-yellow-400">💎{habilidades.ultimate.cost}</div>
                            </div>
                            <div className="font-semibold mb-1 text-sm sm:text-base">{habilidades.ultimate.name}</div>
                            <div className="text-xs sm:text-sm text-gray-300">{habilidades.ultimate.description}</div>
                            {habilidades.ultimate.cooldown > 0 && (
                              <div className="text-xs text-orange-400 mt-1">⏱️ Recarga: {habilidades.ultimate.cooldown} turno(s)</div>
                            )}
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
                </>
              ) : (
                <div className="text-xs text-gray-400">Nenhuma habilidade cadastrada.</div>
              )}
            </div>
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
                <div className="font-semibold text-sm sm:text-base">{card.regiao || '—'}</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-400">Categoria</div>
                <div className="font-semibold text-sm sm:text-base">{card.categoria || (isItemCard ? card.itemType || 'Item' : '—')}</div>
              </div>
            </div>

            {/* Tipo e Raridade */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <div className="text-xs sm:text-sm text-gray-400">Tipo</div>
                <div className="font-semibold text-sm sm:text-base">
                  {isItemCard ? '🎁' : obterIconeDoTipo(card.tipo || card.type)} {isItemCard ? (card.itemType || 'Item') : (card.tipo || card.type || 'creature') === 'creature' ? 'Criatura' : (card.tipo || card.type) === 'spell' ? 'Feitiço' : 'Artefato'} 
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
            {(card.condicaoDesbloqueio || card.unlockCondition) && (
              <div className="bg-black/40 p-3 rounded">
                <div className="text-sm text-orange-400 mb-1">🔓 Desbloqueio</div>
                <div className="text-sm text-gray-300">{card.condicaoDesbloqueio || card.unlockCondition}</div>
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
            {(card.historia || card.lore) && (
              <div className="bg-black/40 p-3 rounded">
                <div className="text-sm text-cyan-400 mb-1">História</div>
                <div className="text-sm text-gray-300 italic">{card.historia || card.lore}</div>
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
    </div>
  );
}
