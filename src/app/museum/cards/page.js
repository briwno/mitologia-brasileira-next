// src/app/museum/cards/page.js
"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LayoutDePagina from '../../../components/UI/PageLayout';
import { bancoDeCartas } from '../../../data/cardsDatabase';
import CardDetail from '../../../components/Card/CardDetail';

// Card estilo "story quest"
function StoryCard({ card, onClick }) {
  const portrait = card.imagens?.retrato || card.imagem || '/images/placeholder.svg';
  const rarityStyles = {
    'Épico': 'from-purple-500/50 to-purple-900/60 border-purple-400/40',
    'Lendário': 'from-amber-400/60 to-amber-800/60 border-amber-400/40',
    'Mítico': 'from-rose-500/60 to-rose-900/60 border-rose-400/40'
  };
  const style = rarityStyles[card.raridade] || 'from-slate-400/30 to-slate-800/60 border-slate-400/30';

  return (
    <button
      onClick={onClick}
      className={`relative w-full aspect-[7/11] rounded-xl overflow-hidden border backdrop-blur-sm bg-gradient-to-b ${style} shadow-lg hover:shadow-2xl focus:outline-none ring-0 hover:ring-2 ring-white/40 transition-all group`}
    >
      <Image
        src={portrait}
        alt={card.nome}
        fill
        className="object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-500"
        sizes="(max-width:768px) 40vw, (max-width:1200px) 20vw, 15vw"
        priority={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/85" />
      <div className="absolute bottom-0 inset-x-0 p-3 flex flex-col gap-1 text-left">
        <span className="text-[10px] tracking-wide font-semibold text-white/60 uppercase line-clamp-1">{card.regiao || '—'}</span>
        <h3 className="text-sm font-bold leading-snug drop-shadow-sm line-clamp-2">{card.nome}</h3>
        <span className="text-[10px] font-semibold text-white/70 tracking-wide">{card.raridade}</span>
      </div>
      {card.novo && (
        <div className="absolute top-2 right-2 bg-orange-600 text-[10px] px-2 py-1 rounded-full font-bold shadow">NOVO</div>
      )}
    </button>
  );
}

// Modal com abas
function StoryModal({ card, onClose }) {
  const [tab, setTab] = useState('detalhes'); // 'detalhes' | 'historia'
  if (!card) return null;
  const full = card.imagens?.completa || card.imagens?.retrato || '/images/placeholder.svg';

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
              📜 <span className="text-cyan-300">{card.nome}</span>
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
                  src={full}
                  alt={`Arte completa de ${card.nome}`}
                  fill
                  className="object-contain"
                  sizes="(max-width:768px) 100vw, 40vw"
                />
              </div>
              <div className="space-y-5 max-h-[60vh] md:max-h-[70vh] overflow-y-auto pr-1">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-2">História / Conto</h3>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                    {card.historia || 'Ainda não há uma história cadastrada para esta carta.'}
                  </p>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-white/10 text-xs text-gray-400 leading-relaxed">
                  Esta história faz parte do acervo educativo de Ka’aguy, promovendo o folclore brasileiro.
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
  const storyCards = useMemo(() => bancoDeCartas.filter(c => c.descoberta).map((c, idx) => ({ ...c, novo: idx < 3 })), []);
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
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {storyCards.map(card => (
            <StoryCard key={card.id} card={card} onClick={() => setSelected(card)} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/museum" className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors">← Voltar ao Museu</Link>
        </div>
      </div>

      <StoryModal card={selected} onClose={() => setSelected(null)} />
    </LayoutDePagina>
  );
}
