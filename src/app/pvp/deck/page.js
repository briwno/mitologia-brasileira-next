"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LayoutDePagina from "../../../components/UI/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import Icon from "@/components/UI/Icon";
import { nanoid } from "nanoid";
import { getConstants } from "@/utils/constantsAPI";

export default function SelecaoDeDeck() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameMode = searchParams.get("mode") || "bot";

  const { user, isAuthenticated } = useAuth();

  const [decksCarregando, setDecksCarregando] = useState(true);
  const [decksSalvos, setDecksSalvos] = useState([]);
  const [deckSelecionado, setDeckSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [constants, setConstants] = useState(null);

  // Carregar constantes da API
  useEffect(() => {
    async function carregarConstantes() {
      try {
        const data = await getConstants();
        setConstants(data);
      } catch (error) {
        console.error('Erro ao carregar constantes:', error);
      }
    }
    carregarConstantes();
  }, []);

  // Carregar decks salvos
  useEffect(() => {
    async function carregarDecks() {
      if (!isAuthenticated() || !user?.id) {
        // Decks ficticios para nao autenticados usando constantes da API
        const decksFicticios = [
          {
            id: "demo1",
            name: "Deck Amazonico",
            lendas: Array(constants?.CONSTANTES_DECK?.TAMANHO_DECK_LENDAS || 5).fill().map((_, i) => `lenda-${i + 1}`),
            itens: Array(constants?.CONSTANTES_DECK?.TAMANHO_DECK_ITENS || 10).fill().map((_, i) => `item-${i + 1}`),
            cards: ["cur001", "boi001", "iar001", "bot001", "sac001"],
            isDefault: true,
          },
          {
            id: "demo2",
            name: "Deck das Aguas",
            lendas: Array(constants?.CONSTANTES_DECK?.TAMANHO_DECK_LENDAS || 5).fill().map((_, i) => `agua-lenda-${i + 1}`),
            itens: Array(constants?.CONSTANTES_DECK?.TAMANHO_DECK_ITENS || 10).fill().map((_, i) => `agua-item-${i + 1}`),
            cards: ["iar001", "mbo001", "ner001", "bot001", "sac001"],
            isDefault: false,
          },
          {
            id: "demo3",
            name: "Deck Magico",
            lendas: Array(constants?.CONSTANTES_DECK?.TAMANHO_DECK_LENDAS || 5).fill().map((_, i) => `magico-lenda-${i + 1}`),
            itens: Array(constants?.CONSTANTES_DECK?.TAMANHO_DECK_ITENS || 10).fill().map((_, i) => `magico-item-${i + 1}`),
            cards: ["sac001", "mul001", "cur001", "bot001", "sac001"],
            isDefault: false,
          },
        ];

        setDecksSalvos(decksFicticios);
        setDeckSelecionado("demo1");
        setDecksCarregando(false);
        return;
      }

      try {
        const res = await fetch(`/api/decks?ownerId=${user.id}`);
        const data = await res.json();
        setDecksSalvos(data.decks || []);

        // Define o primeiro deck como selecionado por padrão
        if (data.decks?.length > 0) {
          const defaultDeck =
            data.decks.find((d) => d.isDefault) || data.decks[0];
          setDeckSelecionado(defaultDeck.id);
        }
      } catch (error) {
        console.error("Erro ao carregar decks:", error);
      } finally {
        setDecksCarregando(false);
      }
    }

    carregarDecks();
  }, [user, isAuthenticated, constants]);

  const iniciarPartida = () => {
    if (!deckSelecionado) return;

    const deck = decksSalvos.find((d) => d.id === deckSelecionado);
    if (!deck || !deck.cards?.length) return;

    // Criar ID da sala e iniciar partida
    const roomId = nanoid(6);
    const query = new URLSearchParams({
      mode: gameMode,
      deck: JSON.stringify(deck.cards),
    });

    router.push(`/pvp/game/${roomId}?${query.toString()}`);
  };

  const criarNovoDeck = () => {
    alert("Funcionalidade de construção de deck em desenvolvimento!");
  };

  if (decksCarregando) {
    return (
      <LayoutDePagina>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Carregando decks...</p>
        </div>
      </LayoutDePagina>
    );
  }

  return (
    <LayoutDePagina>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            🎯 Escolha seu Deck
          </h1>
          <p className="text-xl text-gray-300">
            {gameMode === "bot" && "Prepare-se para batalhar contra a IA"}
            {gameMode === "ranked" &&
              "Partida ranqueada - escolha seu melhor deck!"}
            {gameMode === "custom" && "Partida personalizada"}
          </p>
          {constants?.CONSTANTES_DECK && (
            <div className="text-sm text-green-300 mt-2">
              Regras: {constants.CONSTANTES_DECK.TAMANHO_DECK_LENDAS} Lendas + {constants.CONSTANTES_DECK.TAMANHO_DECK_ITENS} Itens por deck
              • {constants.CONSTANTES_DECK.LIMITE_TEMPO_TURNO}s por turno
            </div>
          )}
        </div>

        {/* Decks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {decksSalvos.map((deck) => (
            <div
              key={deck.id}
              className={`bg-black/30 backdrop-blur-sm rounded-lg border p-6 cursor-pointer transition-all hover:scale-105 ${
                deckSelecionado === deck.id
                  ? "border-yellow-400 shadow-lg shadow-yellow-400/20"
                  : "border-gray-600/30 hover:border-gray-500"
              }`}
              onClick={() => setDeckSelecionado(deck.id)}
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-lg flex items-center justify-center">
                  <Icon name="cards" size={32} />
                </div>

                <h3 className="text-xl font-bold mb-2">{deck.name}</h3>

                <div className="text-gray-400 text-sm mb-4">
                  {deck.lendas?.length || constants?.CONSTANTES_DECK?.TAMANHO_DECK_LENDAS || 5} Lendas • {deck.itens?.length || constants?.CONSTANTES_DECK?.TAMANHO_DECK_ITENS || 10} Itens
                  {deck.isDefault && (
                    <span className="text-yellow-400 ml-2">⭐ Padrao</span>
                  )}
                </div>

                {deckSelecionado === deck.id && (
                  <div className="text-green-400 text-sm">
                    ✓ Deck selecionado
                  </div>
                )}

                {/* Preview das cartas */}
                <div className="mt-3 text-xs text-gray-500">
                  {deck.cards?.slice(0, 3).join(" • ")}
                  {deck.cards?.length > 3 && "..."}
                </div>
              </div>
            </div>
          ))}

          {/* Botão Criar Novo Deck */}
          <div
            className="bg-black/20 backdrop-blur-sm rounded-lg border border-dashed border-gray-500 p-6 cursor-pointer transition-all hover:scale-105 hover:border-yellow-400"
            onClick={() => setModalAberto(true)}
          >
            <div className="text-center text-gray-400 hover:text-yellow-400 transition-colors">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-700 rounded-lg flex items-center justify-center">
                <Icon name="plus" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Novo Deck</h3>
              <p className="text-sm">Criar ou editar deck</p>
            </div>
          </div>
        </div>

        {/* Informações do deck selecionado */}
        {deckSelecionado && (
          <div className="max-w-md mx-auto mb-8 bg-black/20 backdrop-blur-sm rounded-lg border border-gray-600/30 p-4">
            <h3 className="text-lg font-bold mb-2 text-center">
              Deck Selecionado
            </h3>
            {(() => {
              const deck = decksSalvos.find((d) => d.id === deckSelecionado);
              return (
                <div className="text-center">
                  <p className="text-yellow-400 font-semibold">{deck?.name}</p>
                  <p className="text-gray-400 text-sm mb-2">
                    {deck?.cards?.length || 0} cartas
                  </p>
                  <div className="text-xs text-gray-500">
                    {deck?.cards?.join(" • ")}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Ações */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Icon name="back" size={20} />
            Voltar
          </button>

          <button
            onClick={iniciarPartida}
            disabled={!deckSelecionado}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold flex items-center gap-2"
          >
            <Icon name="battle" size={20} />
            Iniciar Batalha!
          </button>
        </div>

        {/* Modal de Opções */}
        {modalAberto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-[#0e1a28] rounded-xl border border-white/10 shadow-2xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 text-center">
                  Opções de Deck
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={criarNovoDeck}
                    className="w-full p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-left"
                  >
                    <div className="font-semibold">🛠️ Construir Novo Deck</div>
                    <div className="text-sm text-gray-300">
                      Monte um deck do zero
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      alert("Funcionalidade em desenvolvimento");
                    }}
                    className="w-full p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-left"
                  >
                    <div className="font-semibold">📥 Importar Deck</div>
                    <div className="text-sm text-gray-300">
                      Cole um código de deck
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => setModalAberto(false)}
                  className="w-full mt-4 p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutDePagina>
  );
}
