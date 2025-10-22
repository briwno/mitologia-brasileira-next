"use client";

import { useState, useEffect } from 'react';
import LegendCard from '@/components/PvP/LegendCard';
import BattleLog from '@/components/PvP/BattleLog';
import ItemHand from '@/components/PvP/ItemHand';
import BenchSlots from '@/components/PvP/BenchSlots';
import TurnController from '@/components/PvP/TurnController';
import BattleDecorations from '@/components/PvP/BattleDecorations';
import PlayerHUD from '@/components/PvP/PlayerHUD';
import BenchRow from '@/components/PvP/BenchRow';
import SkillPanelSide from '@/components/PvP/SkillPanelSide';
import { carregarDadosDeCartas } from '@/services/cartasServico';

/**
 * DEMO do Novo Layout TCG - Usando Componentes Reutilizáveis
 * Esta página demonstra o layout completo da batalha com dados reais do banco
 */
export default function BattleDemoPage() {
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null); // Para mostrar skills ao lado
  const [showSkillPanel, setShowSkillPanel] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(true);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([
    { type: 'usar_skill', text: 'Saci usou Redemoinho', timestamp: '10:00:01', formatted: 'usou Redemoinho em Boitatá' },
    { type: 'damage', text: 'Causou 25 de dano', data: { damage: 25 }, timestamp: '10:00:02', formatted: 'causou 25 de dano' },
    { type: 'trocar_lenda', text: 'Trocou para Curupira', timestamp: '10:00:15', formatted: 'trocou para Curupira' },
  ]);

  // Carregar cartas do banco de dados usando o serviço
  useEffect(() => {
    async function loadCards() {
      try {
        const dados = await carregarDadosDeCartas();
        
        console.log('📦 Cartas carregadas:', dados.cartas.length);
        console.log('📦 Itens carregados:', dados.itens.length);
        
        if (dados.cartas && dados.cartas.length > 0) {
          setCards(dados.cartas);
        }
      } catch (error) {
        console.error('Erro ao carregar cartas:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCards();
  }, []);

  // Transformar dados do banco em formato de batalha
  const transformCardData = (card, hp, maxHp) => {
    // Usar dados vindos do banco já normalizados pelo serviço
    const nome = card.nome || card.name || 'Carta Desconhecida';
    const imagem = card.imagens?.retrato || card.images?.portrait || card.imagem || `/images/cards/portraits/${card.id}.jpg`;
    
    // ✅ CARREGAR TODAS AS 5 SKILLS DO BANCO (abilities é JSONB)
    const abilities = card.habilidades || card.abilities || {};
    
    const skills = [
      // Skill 1
      abilities.skill1 && {
        id: 'skill1',
        name: abilities.skill1.name,
        description: abilities.skill1.description || '',
        power: abilities.skill1.power || abilities.skill1.damage || 20,
        pp: abilities.skill1.pp || abilities.skill1.cost || 2,
        maxPP: abilities.skill1.ppMax || abilities.skill1.maxPP || abilities.skill1.pp || 2,
        cooldown: abilities.skill1.cooldown || 0,
        image: abilities.skill1.image
      },
      // Skill 2
      abilities.skill2 && {
        id: 'skill2',
        name: abilities.skill2.name,
        description: abilities.skill2.description || '',
        power: abilities.skill2.power || abilities.skill2.damage || 25,
        pp: abilities.skill2.pp || abilities.skill2.cost || 3,
        maxPP: abilities.skill2.ppMax || abilities.skill2.maxPP || abilities.skill2.pp || 3,
        cooldown: abilities.skill2.cooldown || 1,
        image: abilities.skill2.image
      },
      // Skill 3
      abilities.skill3 && {
        id: 'skill3',
        name: abilities.skill3.name,
        description: abilities.skill3.description || '',
        power: abilities.skill3.power || abilities.skill3.damage || 30,
        pp: abilities.skill3.pp || abilities.skill3.cost || 4,
        maxPP: abilities.skill3.ppMax || abilities.skill3.maxPP || abilities.skill3.pp || 4,
        cooldown: abilities.skill3.cooldown || 2,
        image: abilities.skill3.image
      },
      // Skill 4
      abilities.skill4 && {
        id: 'skill4',
        name: abilities.skill4.name,
        description: abilities.skill4.description || '',
        power: abilities.skill4.power || abilities.skill4.damage || 35,
        pp: abilities.skill4.pp || abilities.skill4.cost || 5,
        maxPP: abilities.skill4.ppMax || abilities.skill4.maxPP || abilities.skill4.pp || 5,
        cooldown: abilities.skill4.cooldown || 3,
        image: abilities.skill4.image
      },
      // Skill 5 (Ultimate)
      abilities.skill5 && {
        id: 'skill5',
        name: abilities.skill5.name,
        description: abilities.skill5.description || '',
        power: abilities.skill5.power || abilities.skill5.damage || 60,
        pp: abilities.skill5.pp || abilities.skill5.cost || 6,
        maxPP: abilities.skill5.ppMax || abilities.skill5.maxPP || abilities.skill5.pp || 6,
        cooldown: abilities.skill5.cooldown || 4,
        image: abilities.skill5.image,
        isUltimate: true
      }
    ].filter(Boolean); // Remover skills inexistentes
    
    // Habilidade Passiva (separada das skills)
    const passive = abilities.passive ? {
      name: abilities.passive.name,
      description: abilities.passive.description || '',
      effect: abilities.passive.effect || 'buff',
      value: abilities.passive.value || 0.1,
      trigger: abilities.passive.trigger || 'turn_start',
      image: abilities.passive.image
    } : null;
    
    // 🐛 DEBUG: Ver quantas skills foram carregadas
    console.log(`📊 [${nome}] Skills carregadas: ${skills.length}`, {
      skills: skills.map(s => s.name),
      passive: passive?.name || 'Nenhuma'
    });
    
    return {
      id: card.id,
      name: nome,
      image: imagem,
      hp: hp || card.vida || card.life || card.hp || 80,
      maxHp: maxHp || card.vida || card.life || card.max_hp || card.hp || 100,
      atk: card.ataque || card.attack || card.atk || 7,
      def: card.defesa || card.defense || card.def || 5,
      element: card.elemento || card.element || 'Neutro',
      shields: card.shields || 0,
      statusEffects: [],
      skills: skills,
      passive: passive
    };
  };

  // Dados de batalha com cartas do banco
  const opponent = {
    name: 'Oponente',
    activeLegend: loading || cards.length < 2 ? {
      id: 'boitata',
      name: 'Boitatá',
      image: '/images/cards/portraits/boitata.jpg',
      hp: 70,
      maxHp: 90,
      atk: 8,
      def: 6,
      element: 'Fogo',
      shields: 5
    } : transformCardData(cards[0], 70, 90),
    bench: loading || cards.length < 6 ? [
      { id: 'mula', name: 'Mula-sem-cabeça', image: '/images/cards/portraits/mula.jpg', hp: 80, maxHp: 80, atk: 9, def: 5 },
      { id: 'negrinho', name: 'Negrinho', image: '/images/cards/portraits/negrinho.png', hp: 60, maxHp: 70, atk: 6, def: 7 },
      { id: 'vitoria', name: 'Vitória-régia', image: '/images/cards/portraits/vitoria.png', hp: 50, maxHp: 75, atk: 5, def: 8 },
      { id: 'jaci', name: 'Jaci', image: '/images/cards/portraits/jaci.png', hp: 0, maxHp: 65, atk: 7, def: 4 }
    ] : [
      transformCardData(cards[1], 80, 80),
      transformCardData(cards[2], 60, 70),
      transformCardData(cards[3], 50, 75),
      transformCardData(cards[4], 0, 65)
    ],
    itemHand: [{}, {}, {}]
  };

  const myPlayer = {
    activeLegend: loading || cards.length < 7 ? {
      id: 'saci',
      name: 'Saci-Pererê',
      image: '/images/cards/portraits/saci.jpg',
      hp: 65,
      maxHp: 80,
      atk: 7,
      def: 5,
      element: 'Ar',
      shields: 10,
      statusEffects: [{ type: 'buff', duration: 2 }],
      skills: [
        { id: 'redemoinho', name: 'Redemoinho', description: 'Ataque de vento devastador', power: 25, element: 'Ar', cooldown: 0 },
        { id: 'travessura', name: 'Travessura', description: 'Confunde o oponente', power: 15, element: 'Ar', cooldown: 2 }
      ],
      ultimate: { name: 'Furacão do Saci', description: 'Ultimate devastadora', power: 60, requiredTurns: 3 },
      passive: { name: 'Pulo da Sorte', description: 'Aumenta evasão', effect: 'buff_def', value: 0.1, trigger: 'turn_start' }
    } : transformCardData(cards[5], 65, 80),
    bench: loading || cards.length < 10 ? [
      { id: 'curupira', name: 'Curupira', image: '/images/cards/portraits/curupira.png', hp: 90, maxHp: 100, atk: 8, def: 6 },
      { id: 'iara', name: 'Iara', image: '/images/cards/portraits/iara.jpg', hp: 50, maxHp: 70, atk: 6, def: 4 },
      { id: 'cuca', name: 'Cuca', image: '/images/cards/portraits/cuca.jpg', hp: 0, maxHp: 85, atk: 9, def: 5 },
      { id: 'boto', name: 'Boto', image: '/images/cards/portraits/boto.jpg', hp: 75, maxHp: 75, atk: 7, def: 6 }
    ] : [
      transformCardData(cards[6], 90, 100),
      transformCardData(cards[7], 50, 70),
      transformCardData(cards[8], 0, 85),
      transformCardData(cards[9], 75, 75)
    ],
    itemHand: [
      { id: 'pocao', name: 'Poção de Cura', type: 'heal', value: 30, description: 'Restaura 30 HP', uses: 1 },
      { id: 'escudo', name: 'Escudo Místico', type: 'defensivo', value: 15, description: 'Adiciona 15 de defesa', uses: 2 }
    ],
    turnsPlayed: 3
  };

  const handleAddLog = (type, message) => {
    setLogs(prev => [...prev, {
      type,
      text: message,
      formatted: message,
      timestamp: new Date().toLocaleTimeString('pt-BR')
    }]);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#1a2332] via-[#0f1821] to-[#0a1118] text-white overflow-hidden">
      {/* Background mais claro */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[url('/images/banners/battle-bg.jpg')] bg-cover bg-center" />
      </div>

      {/* Decorações */}
      <BattleDecorations />

      {/* Botão de saída */}
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => window.history.back()}
          className="px-3 py-1.5 bg-red-600/90 hover:bg-red-700 text-xs font-semibold rounded-lg transition-colors shadow-lg"
        >
          ← Sair
        </button>
      </div>

      {/* Badge de DEMO */}
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-yellow-600/90 text-black font-bold px-3 py-1 rounded-lg text-xs shadow-lg">
          🎮 DEMO
        </div>
      </div>

      {/* Controles de teste */}
      <div className="absolute top-34 left-4 z-50 bg-black/70 backdrop-blur-sm rounded-lg p-2 space-y-1 text-xs border border-white/10">
        <button onClick={() => setIsMyTurn(!isMyTurn)} className="w-full px-2 py-1 bg-cyan-600/80 hover:bg-cyan-700 rounded text-[10px] font-medium">
          {isMyTurn ? '🟢 Meu Turno' : '🔴 Adversário'}
        </button>
        <button onClick={() => handleAddLog('damage', 'Teste de ação!')} className="w-full px-2 py-1 bg-green-600/80 hover:bg-green-700 rounded text-[10px] font-medium">
          + Log
        </button>
        <div className="text-[9px] text-neutral-400 text-center pt-1 border-t border-white/10">
          💡 Clique nas cartas para ver skills
        </div>
      </div>

      {/* Layout Principal */}
      <div className="relative z-10 h-screen flex flex-col py-4">
        
        {/* ========== TOPO: OPONENTE + BANCO ========== */}
        <div className="px-6 flex items-start justify-between mb-2">
          {/* HUD Oponente + Banco Horizontal */}
          <div className="flex items-center gap-4">
            <PlayerHUD player={opponent} isEnemy={true} />
            <BenchRow 
              legends={opponent.bench}
              onSelectCard={(legend) => setSelectedCard(selectedCard?.id === legend.id ? null : legend)}
              selectedCard={selectedCard}
              isEnemy={true}
            />
          </div>

          {/* Itens Oponente */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-10 h-14 rounded border ${
                  i < 2
                    ? 'bg-green-900/30 border-green-600/50'
                    : 'bg-black/20 border-neutral-700/30 opacity-40'
                } flex items-center justify-center`}
              >
                {i < 2 && <span className="text-xs text-green-400">?</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ========== CENTRO: CAMPO DE BATALHA ========== */}
        <div className="flex-1 relative flex items-center justify-center">
          {/* Oval Grande - Como na imagem */}
          <div className="absolute w-[900px] h-[500px] rounded-full border-4 border-yellow-600/40 opacity-60" />

          {/* Carta Oponente - TOPO */}
          <div className="absolute" style={{ top: '10%', left: '50%', transform: 'translateX(-50%)' }}>
            <LegendCard
              legend={opponent.activeLegend}
              isActive={true}
              isEnemy={true}
              onClick={() => {
                setSelectedTarget(opponent.activeLegend);
                setSelectedCard(selectedCard?.id === opponent.activeLegend.id ? null : opponent.activeLegend);
              }}
              showStats={true}
            />
          </div>

          {/* Painel de Skills do Oponente - Ao lado da carta */}
          {selectedCard && selectedCard.id === opponent.activeLegend.id && (
            <div 
              className="absolute z-30"
              style={{ top: '10%', left: 'calc(50% + 180px)' }}
            >
              <SkillPanelSide
                card={selectedCard}
                onClose={() => setSelectedCard(null)}
                isEnemy={true}
              />
            </div>
          )}

          {/* Label Central Pequeno */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-black/80 border-2 border-yellow-600/60 rounded-full px-8 py-1.5">
              <div className="text-yellow-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <span>⚔️</span>
                <span>Campo de Batalha</span>
                <span>⚔️</span>
              </div>
            </div>
          </div>

          {/* Carta Jogador - BASE */}
          <div className="absolute" style={{ bottom: '10%', left: '50%', transform: 'translateX(-50%)' }}>
            <LegendCard
              legend={myPlayer.activeLegend}
              isActive={true}
              isEnemy={false}
              onClick={() => {
                setSelectedCard(selectedCard?.id === myPlayer.activeLegend.id ? null : myPlayer.activeLegend);
              }}
              showStats={true}
            />
          </div>

          {/* Painel de Skills do Jogador - Ao lado da carta */}
          {selectedCard && selectedCard.id === myPlayer.activeLegend.id && (
            <div 
              className="absolute z-30"
              style={{ bottom: '10%', left: 'calc(50% + 180px)' }}
            >
              <SkillPanelSide
                card={selectedCard}
                onClose={() => setSelectedCard(null)}
                onUseSkill={(skill) => {
                  if (isMyTurn) {
                    handleAddLog('usar_skill', `Usou ${skill.name}`);
                  }
                }}
                isMyTurn={isMyTurn}
                turnsPlayed={myPlayer.turnsPlayed}
              />
            </div>
          )}

          {/* Log */}
          <div className="absolute right-4 top-4">
            <BattleLog logs={logs} />
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-2 rounded-lg">
              <div className="text-cyan-400 text-sm animate-pulse">⏳ Carregando cartas do banco...</div>
            </div>
          )}
        </div>

        {/* ========== BASE: JOGADOR + BANCO + ITENS ========== */}
        <div className="px-6 flex items-end justify-between gap-6 mb-2">
          
          {/* HUD Jogador */}
          <PlayerHUD player={myPlayer} />

          {/* BANCO + ITENS - CENTRO */}
          <div className="flex-1 flex flex-col items-center gap-3">
            {/* Banco de Cartas */}
            <div className="bg-cyan-900/40 border border-cyan-500/60 rounded-xl px-4 py-2 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">Banco de Cartas</span>
                <div className="flex gap-2">
                  <BenchSlots
                    legends={myPlayer.bench}
                    onSelectLegend={(legend) => handleAddLog('trocar_lenda', `Trocou para ${legend.name}`)}
                    disabled={!isMyTurn}
                  />
                </div>
              </div>
            </div>

            {/* Seus Itens */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-emerald-400 uppercase font-semibold">Seus Itens</span>
              <ItemHand
                items={myPlayer.itemHand}
                onUseItem={(item) => handleAddLog('usar_item', `Usou ${item.name}`)}
                disabled={!isMyTurn}
              />
            </div>
          </div>

          {/* Controle Turno */}
          <div>
            <TurnController
              isMyTurn={isMyTurn}
              currentTurn={currentTurn}
              currentPhase="ACAO"
              onEndTurn={() => {
                handleAddLog('fim_turno', 'Turno encerrado');
                setIsMyTurn(false);
                setCurrentTurn(prev => prev + 1);
              }}
              disabled={!isMyTurn}
            />
          </div>
        </div>
      </div>

      {/* Indicador de Target Selecionado */}
      {selectedTarget && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-cyan-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg flex items-center gap-2 animate-bounce">
            <span>🎯 Alvo:</span>
            <span>{selectedTarget.name}</span>
            <button onClick={() => setSelectedTarget(null)} className="ml-2 hover:text-red-300">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
