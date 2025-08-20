// src/components/PvP/PvPModal.js
"use client";

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cardsDatabase } from '@/data/cardsDatabase';
import { useAuth } from '@/hooks/useAuth';
import { useCollection } from '@/hooks/useCollection';

function ModeCard({ title, emoji, active, onClick, subtitle, imageSrc }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative h-56 md:h-80 xl:h-[26rem] rounded-xl overflow-visible transition-all select-none w-full text-left ${
        active
          ? 'shadow-[0_20px_60px_-20px_rgba(255,215,0,0.45)]'
          : 'hover:shadow-[0_12px_40px_-18px_rgba(0,0,0,0.3)]'
      }`}
    >
      {/* background image */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <Image
          src={imageSrc || '/images/placeholder.svg'}
          alt={`${title} background`}
          fill
          priority={active}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80 z-10" />
      </div>

      {/* golden frame */}
      <div
        className={`absolute inset-0 pointer-events-none rounded-xl z-30 ${
          active ? 'ring-2 ring-yellow-400' : 'ring-1 ring-yellow-600/60 group-hover:ring-yellow-400'
        }`}
      />
      <div className="absolute -inset-1 pointer-events-none rounded-xl bg-gradient-to-b from-yellow-300/10 via-transparent to-yellow-300/0 z-10" />

      {/* selected badge */}
      {active && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-yellow-400 text-black flex items-center justify-center text-xs font-extrabold shadow z-40">
          ✓
        </div>
      )}

      {/* content */}
      <div className="relative z-20 h-full flex flex-col justify-end p-5">
        <div className="mb-4 text-4xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">{emoji}</div>
        <div className="pb-3">
          <div className="text-white font-extrabold text-2xl md:text-3xl tracking-wide">{title.toUpperCase()}</div>
          {subtitle && <div className="text-neutral-200 text-xs md:text-sm mt-1">{subtitle}</div>}
        </div>
      </div>

      {/* diamond emblem (above frame) */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <div className="w-10 h-10 rotate-45 bg-yellow-500/90 border-2 border-yellow-300 shadow-lg flex items-center justify-center">
          <div className="-rotate-45">{emoji}</div>
        </div>
      </div>
    </button>
  );
}

export default function PvPModal({ onClose }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'ranked' | 'rooms'
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [savingDeck, setSavingDeck] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { cards: ownedIds, loading: loadingCollection } = useCollection();

  // Build real collection from owned ids; fallback to small sample if unauthenticated
  const modalCollection = useMemo(() => {
    const all = cardsDatabase || [];
    if (isAuthenticated() && !loadingCollection && ownedIds?.length) {
      const map = new Map(all.map((c) => [c.id, c]));
      return ownedIds
        .map((id) => map.get(id))
        .filter(Boolean)
        .map((c) => ({
          id: c.id,
          name: c.name,
          category: c.category,
          attack: c.attack || 0,
          defense: c.defense || 0,
          life: c.health || 0,
        }));
    }
    // fallback slice
    return all
      .filter((c) => c?.name && c?.discovered)
      .slice(0, 12)
      .map((c) => ({
        id: c.id,
        name: c.name,
        category: c.category,
        attack: c.attack || 0,
        defense: c.defense || 0,
        life: c.health || 0,
      }));
  }, [ownedIds, isAuthenticated, loadingCollection]);

  const [modalDeckCards, setModalDeckCards] = useState([]); // {id, quantity}
  const modalDeckCount = useMemo(
    () => modalDeckCards.reduce((s, c) => s + c.quantity, 0),
    [modalDeckCards]
  );

  const handleQuickMatch = () => {
    const roomId = 'QUICK' + Math.random().toString(36).substr(2, 6).toUpperCase();
    onClose?.();
    router.push(`/pvp/game/${roomId}`);
  };

  const handleCreateRoom = async () => {
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-room', playerId: 'guest' }),
      });
      if (res.ok) {
        const data = await res.json();
        const roomId = data.roomId || data.room?.id;
        if (roomId) {
          onClose?.();
          return router.push(`/pvp/game/${roomId}`);
        }
      }
      const newRoomCode = 'ROOM' + Math.random().toString(36).substr(2, 6).toUpperCase();
      onClose?.();
      router.push(`/pvp/game/${newRoomCode}`);
    } catch {
      const newRoomCode = 'ROOM' + Math.random().toString(36).substr(2, 6).toUpperCase();
      onClose?.();
      router.push(`/pvp/game/${newRoomCode}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={() => onClose?.()}
    >
      <div
        className="relative bg-[#0e1a28] rounded-2xl border border-white/10 shadow-2xl w-full max-w-5xl max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/30">
          <div>
            <h2 className="text-xl font-bold tracking-wide">⚔️ Batalha</h2>
            <p className="text-xs text-white/70">Escolha um modo e jogue</p>
          </div>
          <button
            type="button"
            className="text-white/80 hover:text-white text-2xl leading-none"
            onClick={() => onClose?.()}
            aria-label="Fechar"
            title="Fechar"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(88vh - 64px)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ModeCard
              title="Normal"
              emoji="🎯"
              active={activeTab === 'quick'}
              subtitle="Partida casual rápida"
              imageSrc="/images/banners/menubatalha.png"
              onClick={() => setActiveTab('quick')}
            />
            <ModeCard
              title="Ranqueada"
              emoji="🏆"
              active={activeTab === 'ranked'}
              subtitle="Valendo pontos de ranking"
              imageSrc="/images/banners/batalha.jpg"
              onClick={() => setActiveTab('ranked')}
            />
            <ModeCard
              title="Personalizada"
              emoji="🏠"
              active={activeTab === 'rooms'}
              subtitle="Crie ou entre em salas"
              imageSrc="/images/banners/museu.jpg"
              onClick={() => setActiveTab('rooms')}
            />
          </div>

          {/* Actions */}
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-purple-400/50 text-purple-200 hover:border-purple-300 hover:text-white bg-black/30"
              onClick={() => setShowDeckModal(true)}
            >
              ⚙️ Editar Deck
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-white/15 hover:border-white/30 text-neutral-200 hover:text-white bg-black/30"
                onClick={() => onClose?.()}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`px-8 py-3 rounded-xl font-extrabold tracking-wide transition bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_12px_40px_-18px_rgba(0,0,0,0.6)]`}
                onClick={() => {
                  if (activeTab === 'quick' || activeTab === 'ranked') return handleQuickMatch();
                  return handleCreateRoom();
                }}
              >
                {activeTab === 'rooms' ? 'CRIAR SALA' : 'JOGAR'}
              </button>
            </div>
          </div>

          {/* Deck Editor Modal (nested) */}
          {showDeckModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
              onClick={() => setShowDeckModal(false)}
            >
              <div
                className="bg-[#101c2a] rounded-xl shadow-lg p-6 md:p-8 w-[95vw] md:w-[900px] max-h-[85vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg md:text-xl font-bold">Editar Deck</h2>
                    <p className="text-sm text-white/70">Selecione até 30 cartas</p>
                  </div>
                  <button
                    type="button"
                    className="text-white text-2xl hover:text-cyan-300"
                    onClick={() => setShowDeckModal(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* coleção */}
                  <div className="md:col-span-2 border border-white/10 rounded-lg p-3 bg-black/30">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {modalCollection.map((card) => (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => {
                            setModalDeckCards((prev) => {
                              const total = prev.reduce((s, c) => s + c.quantity, 0);
                              if (total >= 30) return prev; // limit
                              if (prev.some((c) => c.id === card.id)) return prev; // 1x each
                              return [...prev, { id: card.id, quantity: 1 }];
                            });
                          }}
                          className="bg-black/40 rounded-lg p-3 border border-gray-600/30 hover:border-blue-500/50 transition-all text-left"
                        >
                          <div className="w-full h-20 bg-gradient-to-b from-gray-700 to-gray-800 rounded mb-2 flex items-center justify-center">
                            <span className="text-2xl">🎭</span>
                          </div>
                          <div className="font-semibold text-sm">{card.name}</div>
                          <div className="text-xs text-gray-400 truncate">{card.category}</div>
                          <div className="grid grid-cols-3 gap-1 text-[10px] mt-1">
                            <div className="bg-red-900/50 p-1 rounded text-center">{card.attack}</div>
                            <div className="bg-blue-900/50 p-1 rounded text-center">{card.defense}</div>
                            <div className="bg-green-900/50 p-1 rounded text-center">{card.life}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* deck atual */}
                  <div className="border border-white/10 rounded-lg p-3 bg-black/30 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">Deck Atual</div>
                      <div className="text-sm text-white/70">{modalDeckCards.reduce((s, c) => s + c.quantity, 0)}/30</div>
                    </div>
                    <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: '48vh' }}>
                      {modalDeckCards.length === 0 && (
                        <div className="text-xs text-white/60">Seu deck está vazio. Clique nas cartas para adicionar.</div>
                      )}
                      {modalDeckCards.map((dc) => {
                        const c = modalCollection.find((x) => x.id === dc.id);
                        return (
                          <div
                            key={dc.id}
                            className="bg-black/40 p-2 rounded border border-white/10 flex items-center justify-between"
                          >
                            <div className="truncate pr-2">
                              <div className="text-sm font-medium truncate">{c?.name || dc.id}</div>
                              <div className="text-[11px] text-white/60 truncate">{c?.category}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setModalDeckCards((prev) => prev.filter((x) => x.id !== dc.id))}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                            >
                              Remover
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                        onClick={() => setModalDeckCards([])}
                      >
                        Limpar
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm disabled:bg-gray-600 disabled:cursor-not-allowed"
                        disabled={modalDeckCount < 20 || savingDeck}
                        onClick={async () => {
                          if (modalDeckCount < 20) return;
                          try {
                            setSavingDeck(true);
                            if (!isAuthenticated()) {
                              setShowDeckModal(false);
                              return;
                            }
                            const payload = {
                              ownerId: Number(user?.id),
                              name: 'Deck PvP',
                              cards: modalDeckCards.map((c) => c.id),
                            };
                            await fetch('/api/decks', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(payload),
                            });
                            setShowDeckModal(false);
                          } catch (e) {
                            console.error(e);
                            setShowDeckModal(false);
                          } finally {
                            setSavingDeck(false);
                          }
                        }}
                      >
                        {savingDeck ? 'Salvando...' : 'Salvar'}
                      </button>
                    </div>
                  </div>
                </div>
+              <div className="mt-3 text-[11px] text-white/50">Mínimo de 20 cartas para salvar. 1 cópia por carta neste protótipo.</div>
               </div>
             </div>
           )}
         </div>
       </div>
     </div>
   );
 }
