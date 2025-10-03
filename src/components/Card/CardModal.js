// src/components/Card/CardModal.js
"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import CardDetail from './CardDetail';
import Icon from '@/components/UI/Icon';
import { getModalClasses } from '@/utils/cardUtils';

const isItemCard = (card) => {
  if (!card) return false;
  if (card.itemType || card.effects) return true;

  const tipo = (card.tipo || card.type || card.cardType || '').toString().toLowerCase();
  if (tipo === 'item' || tipo === 'itens') return true;

  const categoria = (card.categoria || card.category || '').toString().toLowerCase();
  if (!categoria) return false;
  return categoria.includes('item') || categoria.includes('equipamento') || categoria.includes('consum') || categoria.includes('artefato');
};

const getCardPortrait = (card) => {
  if (!card) return '/images/placeholder.svg';
  const images = card.images || card.imagens || {};
  return (
    images.completa ||
    images.full ||
    images.retrato ||
    images.portrait ||
    card.image ||
    card.imagem ||
    '/images/placeholder.svg'
  );
};

function StoriesSection({ card, stories, loading, error, onRetry }) {
  if (!card) return null;

  const portrait = getCardPortrait(card);

  return (
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
          {loading && <div className="text-sm text-gray-400">Carregando contos...</div>}
          {error && (
            <div className="text-sm text-red-400 space-y-2">
              <div>Erro: {error}</div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-3 py-1 text-xs bg-red-600/20 border border-red-500/40 rounded hover:bg-red-600/30 transition"
                >
                  Tentar novamente
                </button>
              )}
            </div>
          )}
          {!loading && !error && stories && stories.length === 0 && (
            <p className="text-sm text-gray-400">Nenhum conto cadastrado para esta carta ainda.</p>
          )}
          <div className="space-y-6">
            {stories?.map((story) => (
              <article key={story.id} className="bg-black/40 border border-white/10 p-4 rounded-lg">
                <h4 className="font-semibold text-amber-300 text-sm mb-1">{story.title}</h4>
                {story.subtitle && <div className="text-xs text-gray-400 mb-2">{story.subtitle}</div>}
                {story.summary && <p className="text-xs text-gray-400 mb-3 whitespace-pre-line">{story.summary}</p>}
                <div className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">{story.body}</div>
                {story.tags && story.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {story.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-gray-700/60 px-2 py-0.5 rounded">#{tag}</span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
        <div className="bg-black/40 rounded-lg p-4 border border-white/10 text-xs text-gray-400 leading-relaxed">
          Este conteúdo integra o acervo educativo de Ka’aguy e promove o folclore brasileiro.
        </div>
      </div>
    </div>
  );
}

export default function CardModal({
  card,
  onClose,
  mode = 'battle',
  showStories = false,
  initialTab = 'detalhes',
  ...props
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [stories, setStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(false);
  const [storiesError, setStoriesError] = useState(null);
  const [reloadStoriesKey, setReloadStoriesKey] = useState(0);

  const itemCard = useMemo(() => isItemCard(card), [card]);
  const shouldShowStoriesTab = showStories && !itemCard;

  useEffect(() => {
    if (!card) return;
    setActiveTab(shouldShowStoriesTab ? initialTab : 'detalhes');
    setStories([]);
    setStoriesError(null);
    setReloadStoriesKey(0);
  }, [card, shouldShowStoriesTab, initialTab]);

  useEffect(() => {
    if (!card?.id || !shouldShowStoriesTab || activeTab !== 'contos') return;

    let cancelled = false;

    const fetchStories = async () => {
      try {
        setLoadingStories(true);
        setStoriesError(null);

        const response = await fetch(`/api/contos?cardId=${encodeURIComponent(card.id)}`);
        if (!response.ok) {
          throw new Error(`Falha ao carregar contos (${response.status})`);
        }

        const data = await response.json();
        if (!cancelled) {
          setStories(Array.isArray(data.stories) ? data.stories : []);
        }
      } catch (error) {
        if (!cancelled) {
          setStoriesError(error.message || 'Erro desconhecido ao carregar contos');
        }
      } finally {
        if (!cancelled) {
          setLoadingStories(false);
        }
      }
    };

    fetchStories();

    return () => {
      cancelled = true;
    };
  }, [card?.id, shouldShowStoriesTab, activeTab, reloadStoriesKey]);

  if (!card) return null;

  const handleOverlayClick = () => {
    if (onClose) onClose();
  };

  const handleRetryStories = () => {
    setReloadStoriesKey((key) => key + 1);
  };

  const modalContent = shouldShowStoriesTab && activeTab === 'contos'
    ? <StoriesSection card={card} stories={stories} loading={loadingStories} error={storiesError} onRetry={storiesError ? handleRetryStories : null} />
    : (
      <CardDetail
        card={card}
        onClose={null}
        mode={mode}
        wrapperClassName="max-h-full"
        {...props}
      />
    );

  return (
    <div className={getModalClasses()} onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="card-modal-title">
      <div
        className="relative w-full max-w-7xl bg-[#101b28] rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/30">
          <div className="flex items-center gap-4">
            <h2 id="card-modal-title" className="text-xl font-bold text-white flex items-center gap-2">
              <span>{itemCard ? '🎁 Item' : '🃏 Carta'}</span>
              <span className="text-cyan-300">{card.nome || card.name}</span>
            </h2>
            {shouldShowStoriesTab && (
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 text-xs">
                <button
                  onClick={() => setActiveTab('detalhes')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors ${activeTab === 'detalhes' ? 'bg-cyan-600 text-white' : 'text-white/70 hover:text-white'}`}
                >
                  Detalhes
                </button>
                <button
                  onClick={() => setActiveTab('contos')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors ${activeTab === 'contos' ? 'bg-cyan-600 text-white' : 'text-white/70 hover:text-white'}`}
                >
                  Contos
                </button>
              </div>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-xl leading-none px-3 py-1 rounded"
              aria-label="Fechar"
            >
              <Icon name="x" size={20} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {modalContent}
        </div>
      </div>
    </div>
  );
}