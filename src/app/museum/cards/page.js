// src/app/museum/cards/page.js
"use client";



import { useState, useMemo, useEffect } from 'react';

// Mapas de tradução (API -> PT-BR)
const MAP_RARITY = { EPIC: 'Épico', LEGENDARY: 'Lendário', MYTHIC: 'Mítico' };
const MAP_REGION = { AMAZONIA: 'Amazônia', NORTHEAST: 'Nordeste', SOUTHEAST: 'Sudeste', SOUTH: 'Sul', MIDWEST: 'Centro-Oeste', NATIONAL: 'Nacional' };
const MAP_CATEGORY = { GUARDIANS: 'Guardiões da Floresta', SPIRITS: 'Espíritos das Águas', HAUNTS: 'Assombrações', PROTECTORS: 'Protetores Humanos', MYSTICAL: 'Entidades Místicas' };
const MAP_ELEMENT = { EARTH: 'Terra', WATER: 'Água', FIRE: 'Fogo', AIR: 'Ar', SPIRIT: 'Espírito' };
const MAP_SEASON = { CARNIVAL: 'Carnaval', SAO_JOAO: 'São João', FESTA_JUNINA: 'Festa Junina', CHRISTMAS: 'Natal' };
const translate = (val, map) => map?.[val] || val;
const formatEnumLabel = (val) => (typeof val === 'string' ? val.toLowerCase().split('_').map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(' ') : val);
import Image from 'next/image';
import Link from 'next/link';
import LayoutDePagina from '../../../components/UI/PageLayout';
// Removido bancoDeCartas: agora buscando da API /api/cards
import CardDetail from '../../../components/Card/CardDetail';

// Card estilo "story quest"
function StoryCard({ card, onClick, idx = 0 }) {
  // Escolhe a melhor fonte disponível: preferir a imagem completa se existir (maior resolução), senão retrato
  const fullSrc = card.images?.completa || card.imagens?.completa || card.images?.full || card.imagens?.full;
  const portrait = card.images?.retrato || card.imagens?.retrato || card.images?.portrait || card.imagens?.portrait || card.image || card.imagem;
  const imgSrc = fullSrc || portrait || '/images/placeholder.svg';
  const rarityStyles = {
    'Épico': 'from-purple-500/50 to-purple-900/60 border-purple-400/40' ,
    'Lendário': 'from-amber-400/60 to-amber-800/60 border-amber-400/40',
    'Mítico': 'from-rose-500/60 to-rose-900/60 border-rose-400/40'
  };
  const rare = card.raridade || card.rarity;
  const style = rarityStyles[rare] || 'from-slate-400/30 to-slate-800/60 border-slate-400/30';
  const isMythic = rare === 'Mítico' || rare === 'MYTHIC';

  // Build a CSS gradient matching rarityStyles colors for the OUTER animated border
  const getRarityGradient = (r) => {
    if (r === 'Mítico' || r === 'MYTHIC') {
      return 'linear-gradient(135deg, rgba(244,63,94,0.6), rgba(255, 0, 0, 0.6))'; 
    }
    if (r === 'Lendário' || r === 'LEGENDARY') {
      return 'linear-gradient(135deg, rgba(231, 178, 2, 0.97), rgba(255, 180, 67, 0.6))'; 
    }
    if (r === 'Épico' || r === 'EPIC') {
      return 'linear-gradient(135deg, rgba(168,85,247,0.5), rgba(144, 0, 255, 0.6))'; 
    }
    return 'linear-gradient(135deg, rgba(148,163,184,0.3), rgba(51,65,85,0.6))'; 
  };
  const borderStyle = {
    backgroundImage: getRarityGradient(rare),
    backgroundSize: isMythic ? '200% 200%' : undefined,
    animation: isMythic ? 'mb-gradient-shift 6s linear infinite' : undefined,
  };

  return (
    <div
      className={`relative rounded-xl p-[2px] transition-all group transform duration-200 will-change-transform hover:scale-[1.03]`}
      style={borderStyle}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <style jsx>{`
        @keyframes mb-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div className={`relative w-full aspect-[7/11] rounded-xl overflow-hidden backdrop-blur-sm bg-gradient-to-b ${style} shadow-lg focus:outline-none ring-0`}>
      {/* Glow on hover */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300">
        <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 blur-xl" />
      </div>
      <Image
        src={imgSrc}
        alt={card.nome || card.name}
        fill
        className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.04]"
        sizes="(min-width:1536px) 22vw, (min-width:1280px) 24vw, (min-width:1024px) 28vw, (min-width:640px) 44vw, 92vw"
        quality={100}
        priority={idx < 8}
        loading={idx < 8 ? 'eager' : 'lazy'}
        fetchPriority={idx < 8 ? 'high' : 'auto'}
        unoptimized={typeof imgSrc === 'string' && imgSrc.startsWith('http')}
      />
  <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/30 to-black/75" />
      <div className="absolute bottom-0 inset-x-0 p-3 flex flex-col gap-1 text-left">
  <span className="text-[10px] tracking-wide font-semibold text-white/60 uppercase line-clamp-1">{card.regiao || card.region || '—'}</span>
  <h3 className="text-sm font-bold leading-snug drop-shadow-sm line-clamp-2">{card.nome || card.name}</h3>
  <span className="text-[10px] font-semibold text-white/70 tracking-wide">{card.raridade || card.rarity}</span>
      </div>
      {card.novo && (
        <div className="absolute top-2 right-2 bg-orange-600 text-[10px] px-2 py-1 rounded-full font-bold shadow">NOVO</div>
      )}
      </div>
    </div>
  );
}

// Modal com abas
function StoryModal({ card, onClose }) {
  const [tab, setTab] = useState('detalhes'); // 'detalhes' | 'historia'
  const [stories, setStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(false);
  const [storiesError, setStoriesError] = useState(null);
  const portrait = card?.images?.retrato || card?.imagens?.retrato || card?.image || card?.imagem || '/images/placeholder.svg';

  useEffect(() => {
    if (tab !== 'historia') {
      return;
    }
    
    setLoadingStories(true);
    setStoriesError(null);
    
    if (!card?.id) {
      setStoriesError('Card ID não encontrado');
      setLoadingStories(false);
      return;
    }
    
    fetch(`/api/contos?cardId=${encodeURIComponent(card.id)}`)
      .then(res => {
        if (!res.ok) throw new Error(`Falha ao carregar contos: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const loaded = data.stories || [];
        setStories(loaded);
      })
      .catch(e => {
        console.error('Erro ao carregar contos:', e);
        setStoriesError(e.message);
      })
      .finally(() => {
        setLoadingStories(false);
      });
  }, [tab, card]);

  if (!card) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-7xl bg-[#101b28] rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/30">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              📜 <span className="text-cyan-300">{card.nome || card.name}</span>
            </h2>
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 text-xs">
              <button
                onClick={() => setTab('detalhes')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${tab === 'detalhes' ? 'bg-cyan-600 text-white' : 'text-white/70 hover:text-white'}`}
              >Detalhes</button>
              <button
                onClick={() => setTab('historia')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${tab === 'historia' ? 'bg-cyan-600 text-white' : 'text-white/70 hover:text-white'}`}
              >História</button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl leading-none px-3 py-1 rounded"
            aria-label="Fechar"
          >×</button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {tab === 'detalhes' ? (
            <CardDetail card={card} onClose={null} />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
        <div className="relative w-full aspect-[3/4] md:aspect-auto md:h-full rounded-xl overflow-hidden border border-white/10 bg-black/40">
                <Image
                  src={portrait}
                  alt={`Retrato de ${card.nome || card.name}`}
                  fill
          className="object-contain"
          sizes="(max-width:768px) 95vw, (max-width:1280px) 640px, 800px"
          quality={98}
                  priority
                />
              </div>
              <div className="space-y-5 max-h-[60vh] md:max-h-[70vh] overflow-y-auto pr-1">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-3">Contos Folclóricos</h3>
                  {loadingStories && <div className="text-sm text-gray-400">Carregando contos...</div>}
                  {storiesError && <div className="text-sm text-red-400">Erro: {storiesError}</div>}
                  {!loadingStories && !storiesError && stories.length === 0 && (
                    <p className="text-sm text-gray-400">Nenhum conto cadastrado para esta carta ainda.</p>
                  )}
                  <div className="space-y-6">
                    {stories.map(story => (
                      <article key={story.id} className="bg-black/40 border border-white/10 p-4 rounded-lg">
                        <h4 className="font-semibold text-amber-300 text-sm mb-1">{story.title}</h4>
                        {story.subtitle && <div className="text-xs text-gray-400 mb-2">{story.subtitle}</div>}
                        {story.summary && <p className="text-xs text-gray-400 mb-3 whitespace-pre-line">{story.summary}</p>}
                        <div className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">{story.body}</div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {story.tags?.map(t => (
                            <span key={t} className="text-[10px] bg-gray-700/60 px-2 py-0.5 rounded">#{t}</span>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-white/10 text-xs text-gray-400 leading-relaxed">
                  Este conteúdo integra o acervo educativo de Ka’aguy e promove o folclore brasileiro.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogoComContos() {
  const [selected, setSelected] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/cards');
        if (!res.ok) throw new Error('Falha ao carregar cartas');
        const data = await res.json();
        const mapped = (data.cards || []).map((c, idx) => {
          const sb = c.seasonalBonus || c.seasonal_bonus;
          const seasonKey = sb?.season || sb?.estacao;
          const bonusSazonal = sb ? {
            estacao: translate(seasonKey, MAP_SEASON) || formatEnumLabel(seasonKey),
            descricao: sb.description || sb.descricao || sb.text || '',
            multiplicador: sb.multiplier || sb.multiplicador || sb.bonus || null
          } : null;
          return {
            id: c.id,
            nome: c.name,
            regiao: translate(c.region, MAP_REGION),
            categoria: translate(c.category, MAP_CATEGORY),
            raridade: translate(c.rarity, MAP_RARITY),
            historia: c.history,
            imagens: c.images,
            imagem: c.image,
            elemento: translate(c.element, MAP_ELEMENT),
            habilidades: c.abilities || {},
            tipo: (c.cardType || c.card_type || 'CREATURE').toString().toLowerCase(),
            novo: idx == 5,
            tags: c.tags,
            bonusSazonal
          };
        });
        if (!cancelled) setCards(mapped);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const storyCards = useMemo(() => {
    // Coloca cartas marcadas como "novo" no topo; mantém ordem relativa para o restante
    const arr = [...cards];
    arr.sort((a, b) => (b.novo === true) - (a.novo === true));
    return arr;
  }, [cards]);
  return (
    <LayoutDePagina>
      <div className="container mx-auto px-4 py-8">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500">🃏 Cartas & Contos</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Selecione uma carta para ver os detalhes de jogo ou ler o conto folclórico associado.
          </p>
        </div>

        {/* Lista estilo "story quests" - grid 4 colunas */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">Carregando cartas...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-20">Erro: {error}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {storyCards.map((card, i) => (
              <StoryCard
                key={card.id}
                card={card}
                idx={i}
                onClick={() => {
                  setSelected(card);
                }}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/museum" className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors">← Voltar ao Museu</Link>
        </div>
      </div>

      <StoryModal card={selected} onClose={() => setSelected(null)} />
    </LayoutDePagina>
  );
}
