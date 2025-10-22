"use client";

import Image from 'next/image';

/**
 * Componente de painel de skills que aparece ao lado da carta
 * Mostra todas as 5 skills + passiva com imagens do banco de dados
 */
export default function SkillPanelSide({ 
  card,
  onClose,
  onUseSkill,
  isMyTurn = false,
  isEnemy = false,
  turnsPlayed = 0
}) {
  if (!card) return null;

  const themeColor = isEnemy ? 'red' : 'cyan';
  const bgClass = isEnemy ? 'bg-red-900/30 border-red-500/40' : 'bg-cyan-900/30 border-cyan-500/40';
  const textClass = isEnemy ? 'text-red-300' : 'text-cyan-300';
  const titleClass = isEnemy ? 'text-red-400' : 'text-cyan-400';
  const hoverClass = !isEnemy && isMyTurn ? 'hover:bg-cyan-800/40 cursor-pointer' : '';

  const paletas = [
    { caixa: 'bg-blue-900/30 border-blue-500/30', rotulo: 'text-blue-400' },
    { caixa: 'bg-cyan-900/30 border-cyan-500/30', rotulo: 'text-cyan-400' },
    { caixa: 'bg-purple-900/30 border-purple-500/30', rotulo: 'text-purple-400' },
    { caixa: 'bg-amber-900/30 border-amber-500/30', rotulo: 'text-amber-400' },
    { caixa: 'bg-red-900/30 border-red-500/30', rotulo: 'text-red-400' },
  ];

  return (
    <div className={`bg-black/95 border-2 border-${themeColor}-500/70 rounded-xl p-4 shadow-2xl max-w-[320px] max-h-[600px] overflow-y-auto`}>
      {/* Cabeçalho */}
      <div className={`${titleClass} font-bold text-sm mb-3 flex items-center gap-2`}>
        <span>⚔️</span>
        <span className="flex-1">Skills de {card.name}</span>
        <button 
          onClick={onClose}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Skills normais (1-5) */}
      <div className="space-y-2">
        {card.skills?.map((skill, i) => {
          const paleta = paletas[i] || paletas[0];
          const isUltimate = skill.isUltimate || i === 4; // Skill 5 é ultimate
          
          return (
            <div 
              key={skill.id || i} 
              className={`${isUltimate ? 'bg-purple-900/40 border-purple-500/50' : paleta.caixa} border rounded-lg p-2 transition-all ${hoverClass}`}
              onClick={() => {
                if (isMyTurn && onUseSkill && !isEnemy) {
                  onUseSkill(skill);
                }
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                {/* Imagem da skill */}
                {skill.image && (
                  <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden border border-white/20">
                    <Image 
                      src={skill.image} 
                      alt={skill.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-xs ${isUltimate ? 'text-purple-300' : paleta.rotulo}`}>
                    {isUltimate ? '💫 ' : ''}{skill.name}
                  </div>
                  {skill.pp && skill.maxPP && (
                    <div className="text-[9px] text-yellow-400">PP {skill.pp}/{skill.maxPP}</div>
                  )}
                </div>
              </div>
              
              <div className="text-[10px] text-neutral-300 mt-1">{skill.description}</div>
              
              <div className="flex gap-2 mt-2 text-[9px]">
                {skill.power > 0 && <span className="text-orange-400">⚡ {skill.power}</span>}
                {skill.cooldown > 0 && <span className="text-cyan-400">🔄 CD: {skill.cooldown}</span>}
              </div>
            </div>
          );
        })}

        {/* Habilidade Passiva */}
        {card.passive && (
          <div className="bg-green-900/40 border border-green-500/50 rounded-lg p-2">
            <div className="flex items-center gap-2 mb-1">
              {/* Imagem da passiva */}
              {card.passive.image && (
                <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden border border-white/20">
                  <Image 
                    src={card.passive.image} 
                    alt={card.passive.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="flex-1">
                <div className="font-bold text-xs text-green-400">🔮 {card.passive.name}</div>
              </div>
            </div>
            
            <div className="text-[10px] text-neutral-300 mt-1">{card.passive.description}</div>
          </div>
        )}
      </div>
    </div>
  );
}
