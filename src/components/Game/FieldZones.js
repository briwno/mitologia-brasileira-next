// src/components/Game/FieldZones.js
"use client";

import { useState } from 'react';
import Card from '@/components/Card/Card';
import ItemCard from '@/components/Card/ItemCard';
import ItemTooltip from '@/components/UI/ItemTooltip';

export default function FieldZones({ 
  player, 
  isCurrentPlayer = false, 
  onUseSkill, 
  onSwitchLegend, 
  onUseItem,
  gamePhase 
}) {
  const [selectedSkill, setSelectedSkill] = useState(null);

  if (!player?.zonas) return null;

  const {
    lenda_ativa,
    banco_lendas,
    mao_itens,
    pilha_itens,
    descarte_itens
  } = player.zonas;

  return (
    <div className="field-zones p-4 border rounded-lg bg-gray-900/50">
      {/* Área do Jogador */}
      <div className="player-info mb-4">
        <h3 className="text-lg font-bold text-white">{player.name}</h3>
        <div className="text-sm text-gray-300">
          Energia: {player.energia || 0}
        </div>
      </div>

      {/* Lenda Ativa */}
      <div className="active-legend mb-6">
        <h4 className="text-md font-semibold text-yellow-400 mb-2">
          🏆 Lenda Ativa
        </h4>
        {lenda_ativa ? (
          <div className="bg-gradient-to-br from-yellow-800/30 to-yellow-600/30 p-4 rounded-lg border border-yellow-500/50">
            <Card 
              card={lenda_ativa} 
              className="max-w-xs mx-auto"
              showStats={true}
            />
            
            {/* Barra de Vida */}
            <div className="mt-3 bg-gray-700 rounded-full h-3">
              <div 
                className="bg-red-500 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.max(0, (lenda_ativa.vida / (lenda_ativa.vidaMaxima || lenda_ativa.vida)) * 100)}%`
                }}
              />
            </div>
            <div className="text-center text-sm text-white mt-1">
              {lenda_ativa.vida} / {lenda_ativa.vidaMaxima || lenda_ativa.vida} HP
            </div>

            {/* Habilidades - só mostrar se for jogador atual */}
            {isCurrentPlayer && gamePhase === 'acao' && (
              <SkillPanel 
                legend={lenda_ativa}
                onUseSkill={onUseSkill}
                selectedSkill={selectedSkill}
                setSelectedSkill={setSelectedSkill}
              />
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 p-4 border border-dashed border-gray-600 rounded">
            Nenhuma lenda ativa
          </div>
        )}
      </div>

      {/* Banco de Lendas */}
      <div className="legend-bench mb-6">
        <h4 className="text-md font-semibold text-blue-400 mb-2">
          🏛️ Banco de Lendas ({banco_lendas.length}/4)
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {banco_lendas.map((lenda, index) => (
            <div 
              key={lenda.id} 
              className={`bg-gray-800/50 p-2 rounded border ${
                isCurrentPlayer && gamePhase === 'acao' 
                  ? 'cursor-pointer hover:border-blue-500 hover:bg-blue-900/20' 
                  : 'opacity-75'
              }`}
              onClick={() => isCurrentPlayer && gamePhase === 'acao' && onSwitchLegend?.(index)}
            >
              <Card 
                card={lenda} 
                className="scale-75 origin-top"
                showStats={false}
              />
              <div className="text-xs text-center text-gray-400 mt-1">
                {lenda.vida} HP
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área de Itens - Mão + Pilha */}
      <div className="items-area mb-4">
        <h4 className="text-md font-semibold text-green-400 mb-3">
          🎒 Sistema de Itens
        </h4>
        
        {/* Mão de Itens - só mostrar se for jogador atual */}
        {isCurrentPlayer ? (
          <div className="item-hand mb-4 p-3 bg-green-900/20 rounded-lg border border-green-600/30">
            <h5 className="text-sm font-semibold text-green-300 mb-3">
              ✋ Mão de Itens ({mao_itens.length}/3)
            </h5>
            <div className="flex gap-3 justify-center min-h-[80px] items-center">
              {mao_itens.length > 0 ? (
                mao_itens.map((item, index) => (
                  <ItemTooltip key={item.id} item={item}>
                    <div 
                      className={`relative transform transition-all duration-200 ${
                        gamePhase === 'acao' 
                          ? 'cursor-pointer hover:scale-110 hover:shadow-green-500/50 hover:shadow-lg hover:-translate-y-2' 
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => gamePhase === 'acao' && onUseItem?.(index)}
                    >
                      <ItemCard 
                        item={item}
                        className="w-24 h-32"
                        showEffects={true}
                      />
                      {gamePhase === 'acao' && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                          Usar
                        </div>
                      )}
                    </div>
                  </ItemTooltip>
                ))
              ) : (
                Array.from({length: 3}, (_, i) => (
                  <div 
                    key={i}
                    className="w-24 h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500"
                  >
                    <div className="text-center text-xs">
                      <div className="text-2xl mb-1">📦</div>
                      <div>Vazio</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Para o oponente, mostrar apenas contador */
          <div className="opponent-items p-3 bg-gray-800/30 rounded-lg border border-gray-600/50">
            <h5 className="text-sm text-gray-400 mb-2">🎒 Itens do Oponente</h5>
            <div className="flex justify-center">
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-300">{mao_itens.length}</div>
                <div className="text-xs text-gray-500">itens na mão</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Pilha e Descarte de Itens */}
        <div className="item-piles grid grid-cols-2 gap-3 mt-3">
          {/* Pilha de Itens */}
          <div className="item-pile bg-blue-900/20 p-3 rounded-lg border border-blue-600/30 text-center">
            <div className="text-3xl mb-2">📚</div>
            <div className="font-bold text-blue-300 text-lg">{pilha_itens.length}</div>
            <div className="text-xs text-blue-400">Pilha de Itens</div>
            {pilha_itens.length === 0 && (
              <div className="text-xs text-red-400 mt-1">Vazio</div>
            )}
          </div>
          
          {/* Descarte de Itens */}
          <div className="item-discard bg-gray-700/30 p-3 rounded-lg border border-gray-500/30 text-center">
            <div className="text-3xl mb-2">🗑️</div>
            <div className="font-bold text-gray-300 text-lg">{descarte_itens.length}</div>
            <div className="text-xs text-gray-400">Descarte</div>
            {descarte_itens.length > 0 && (
              <div className="text-xs text-yellow-400 mt-1">
                Último: {descarte_itens[descarte_itens.length - 1]?.nome}
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Efeitos Ativos */}
      {player.efeitosAtivos && player.efeitosAtivos.size > 0 && (
        <div className="active-effects mt-4">
          <h5 className="text-sm font-semibold text-purple-400 mb-2">✨ Efeitos Ativos</h5>
          <div className="flex flex-wrap gap-1">
            {Array.from(player.efeitosAtivos.entries()).map(([efeito, dados]) => (
              <span 
                key={efeito}
                className="px-2 py-1 bg-purple-900/50 rounded text-xs text-purple-200"
              >
                {efeito} ({dados.turnos}t)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para painel de habilidades
function SkillPanel({ legend, onUseSkill, selectedSkill, setSelectedSkill }) {
  if (!legend.habilidades) return null;

  const skills = ['skill1', 'skill2', 'skill3', 'skill4', 'skill5'];

  return (
    <div className="skills-panel mt-4">
      <h5 className="text-sm font-semibold text-cyan-400 mb-2">⚡ Habilidades</h5>
      
      {/* Passiva */}
      {legend.habilidades.passive && (
        <div className="passive mb-3 p-2 bg-indigo-900/30 rounded border border-indigo-500/50">
          <div className="text-xs font-semibold text-indigo-300">
            🛡️ PASSIVA: {legend.habilidades.passive.name}
          </div>
          <div className="text-xs text-indigo-200">
            {legend.habilidades.passive.description}
          </div>
        </div>
      )}

      {/* Habilidades Ativas */}
      <div className="grid grid-cols-2 gap-2">
        {skills.map((skillId) => {
          const skill = legend.habilidades[skillId];
          if (!skill) return null;

          const ppAtual = legend.pp?.[skillId] || skill.ppMax;
          const canUse = ppAtual >= skill.cost;
          const isUltimate = skillId === 'skill5';

          return (
            <button
              key={skillId}
              className={`
                p-2 rounded text-xs transition-all
                ${canUse 
                  ? (isUltimate 
                      ? 'bg-gradient-to-r from-red-700 to-orange-700 hover:from-red-600 hover:to-orange-600 border border-red-500' 
                      : 'bg-blue-700 hover:bg-blue-600 border border-blue-500'
                    )
                  : 'bg-gray-700 opacity-50 cursor-not-allowed border border-gray-600'
                }
                ${selectedSkill === skillId ? 'ring-2 ring-yellow-400' : ''}
              `}
              onClick={() => canUse && onUseSkill?.(skillId)}
              disabled={!canUse}
            >
              <div className="font-semibold">
                {isUltimate ? '💀' : '⚔️'} {skill.name}
              </div>
              <div className="text-xs opacity-90">
                PP: {ppAtual}/{skill.ppMax} | Custo: {skill.cost}
              </div>
              {isUltimate && (
                <div className="text-xs text-yellow-300 font-bold">
                  ULTIMATE
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}