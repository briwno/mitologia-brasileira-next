"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LayoutDePagina from "@/components/UI/PageLayout";
import DeckBuilder from "@/components/Deck/DeckBuilder";
import { useAuth } from "@/hooks/useAuth";
import { useCollection } from "@/hooks/useCollection";
import ItemCard from "@/components/Card/ItemCard";
import CardModal from "@/components/Card/CardModal";
import CardImage from "@/components/Card/CardImage";
import { obterClassesDeRaridade } from "@/utils/cardUtils";
import { carregarDadosDeCartas } from "@/services/cartasServico";
import {
  primeiroValorDefinido,
  valorComPadrao,
  valorFoiDefinido,
} from "@/utils/valores";
import {
  normalizarTextoParaComparacao,
  normalizarRaridade,
  normalizarTipoItem,
  ehCartaDeLenda,
  ehCartaDeItem,
} from "@/utils/normalizadores";

export default function PaginaInventarioDeCartas() {
  const { user, isAuthenticated } = useAuth();
  const {
    cards: ownedIds,
    itemCards: ownedItemIds,
    loading: loadingCollection,
    error: collectionError,
  } = useCollection();

  const [activeTab, setActiveTab] = useState("cards"); // 'cards' | 'items'
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");
  const [category, setCategory] = useState("all");
  const [rarity, setRarity] = useState("all");
  const [cardTypeFilter, setCardTypeFilter] = useState("all"); // 'all' | 'lendas' | 'itens'

  // Carregar cartas via API
  const [allCards, setAllCards] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [cardsError, setCardsError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingCards(true);

        const dados = await carregarDadosDeCartas();

        if (!cancelled) {
          setAllCards(dados.cartas);
          setAllItems(dados.itens);
        }
      } catch (e) {
        if (!cancelled) setCardsError(e.message);
      } finally {
        if (!cancelled) setLoadingCards(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Mapear coleção real a partir dos IDs possuídos
  const byId = useMemo(
    () => new Map(allCards.map((c) => [c.id, c])),
    [allCards]
  );
  const ownedCards = useMemo(() => {
    if (!isAuthenticated()) {
      return [];
    }
    if (!Array.isArray(ownedIds)) {
      return [];
    }
    if (ownedIds.length === 0) {
      return [];
    }
    return ownedIds.map((id) => byId.get(id)).filter(Boolean);
  }, [ownedIds, isAuthenticated, byId]);

  // Filtros derivados dinamicamente das cartas carregadas
  const allRegions = useMemo(() => {
    const regioes = allCards
      .map((carta) =>
        normalizarTextoParaComparacao(
          primeiroValorDefinido(carta.regiao, carta.region, null)
        )
      )
      .filter(Boolean);
    const mapaOriginal = new Map();
    allCards.forEach((carta) => {
      const chave = normalizarTextoParaComparacao(
        primeiroValorDefinido(carta.regiao, carta.region)
      );
      if (chave) {
        mapaOriginal.set(
          chave,
          primeiroValorDefinido(carta.regiao, carta.region)
        );
      }
    });
    const semDuplicatas = Array.from(new Set(regioes));
    return [
      "all",
      ...semDuplicatas.map((chave) => mapaOriginal.get(chave) || chave),
    ];
  }, [allCards]);

  const allCategories = useMemo(() => {
    const categorias = allCards
      .map((carta) =>
        normalizarTextoParaComparacao(
          primeiroValorDefinido(carta.categoria, carta.category, null)
        )
      )
      .filter(Boolean);
    const mapaOriginal = new Map();
    allCards.forEach((carta) => {
      const chave = normalizarTextoParaComparacao(
        primeiroValorDefinido(carta.categoria, carta.category)
      );
      if (chave) {
        mapaOriginal.set(
          chave,
          primeiroValorDefinido(carta.categoria, carta.category)
        );
      }
    });
    const semDuplicatas = Array.from(new Set(categorias));
    return [
      "all",
      ...semDuplicatas.map((chave) => mapaOriginal.get(chave) || chave),
    ];
  }, [allCards]);

  const allRarities = useMemo(() => {
    const raridades = allCards
      .map((carta) =>
        normalizarRaridade(
          primeiroValorDefinido(carta.raridade, carta.rarity, null)
        )
      )
      .filter(Boolean);
    const mapaOriginal = new Map();
    allCards.forEach((carta) => {
      const chave = normalizarRaridade(
        primeiroValorDefinido(carta.raridade, carta.rarity)
      );
      if (chave) {
        mapaOriginal.set(
          chave,
          primeiroValorDefinido(carta.raridade, carta.rarity)
        );
      }
    });
    const semDuplicatas = Array.from(new Set(raridades));
    return [
      "all",
      ...semDuplicatas.map((chave) => mapaOriginal.get(chave) || chave),
    ];
  }, [allCards]);

  const filteredCards = useMemo(() => {
    const termoNormalizado = normalizarTextoParaComparacao(search);
    const filtroRegiaoAtivo = region !== "all";
    const filtroCategoriaAtivo = category !== "all";
    const filtroRaridadeAtivo = rarity !== "all";
    const regiaoNormalizada = normalizarTextoParaComparacao(region);
    const categoriaNormalizada = normalizarTextoParaComparacao(category);
    const raridadeNormalizada = normalizarRaridade(rarity);

    return ownedCards.filter((carta) => {
      const regiaoCarta = normalizarTextoParaComparacao(
        primeiroValorDefinido(carta.regiao, carta.region)
      );
      if (filtroRegiaoAtivo && regiaoCarta !== regiaoNormalizada) {
        return false;
      }

      const categoriaCarta = normalizarTextoParaComparacao(
        primeiroValorDefinido(carta.categoria, carta.category)
      );
      if (filtroCategoriaAtivo && categoriaCarta !== categoriaNormalizada) {
        return false;
      }

      const raridadeCarta = normalizarRaridade(
        primeiroValorDefinido(carta.raridade, carta.rarity)
      );
      if (filtroRaridadeAtivo && raridadeCarta !== raridadeNormalizada) {
        return false;
      }

      if (termoNormalizado) {
        const nomeCarta = normalizarTextoParaComparacao(
          primeiroValorDefinido(carta.nome, carta.name)
        );
        const historiaCarta = normalizarTextoParaComparacao(
          primeiroValorDefinido(carta.historia, carta.lore)
        );
        if (
          !nomeCarta.includes(termoNormalizado) &&
          !historiaCarta.includes(termoNormalizado)
        ) {
          return false;
        }
      }

      if (cardTypeFilter === "lendas" && !ehCartaDeLenda(carta)) {
        return false;
      }
      if (cardTypeFilter === "itens" && !ehCartaDeItem(carta)) {
        return false;
      }

      return true;
    });
  }, [ownedCards, region, category, rarity, search, cardTypeFilter]);

  const filteredItems = useMemo(() => {
    const termoNormalizado = normalizarTextoParaComparacao(search);
    const raridadeFiltro = normalizarRaridade(rarity);
    const categoriaCalculada = normalizarTipoItem(category);
    const categoriasValidas = new Set([
      "item",
      "itens",
      "consumivel",
      "equipamento",
      "artefato",
      "reliquia",
      "pergaminho",
    ]);
    const aplicarFiltroRaridade = activeTab === "items" && rarity !== "all";
    const aplicarFiltroCategoria =
      activeTab === "items" &&
      category !== "all" &&
      categoriasValidas.has(categoriaCalculada);

    return allItems.filter((item) => {
      if (termoNormalizado) {
        const nomeItem = normalizarTextoParaComparacao(
          primeiroValorDefinido(item.nome, item.name)
        );
        const descricaoItem = normalizarTextoParaComparacao(
          primeiroValorDefinido(item.descricao, item.description)
        );
        if (
          !nomeItem.includes(termoNormalizado) &&
          !descricaoItem.includes(termoNormalizado)
        ) {
          return false;
        }
      }

      if (aplicarFiltroRaridade) {
        const raridadeItem = normalizarRaridade(
          primeiroValorDefinido(item.raridade, item.rarity)
        );
        if (raridadeItem !== raridadeFiltro) {
          return false;
        }
      }

      if (aplicarFiltroCategoria) {
        const categoriaItem = normalizarTipoItem(
          primeiroValorDefinido(item.tipo_item, item.itemType, item.tipo)
        );
        if (categoriaItem !== categoriaCalculada) {
          return false;
        }
      }

      return true;
    });
  }, [allItems, search, rarity, category, activeTab]);

  const totalAvailable = allCards.length;
  const totalOwned = ownedCards.length;

  const [selectedCard, setSelectedCard] = useState(null);
  const [showDeckBuilder, setShowDeckBuilder] = useState(false);

  // Estatísticas para o deck builder
  const legendsCount = useMemo(
    () => ownedCards.filter(ehCartaDeLenda).length,
    [ownedCards]
  );
  const itemsCount = useMemo(
    () => ownedCards.filter(ehCartaDeItem).length,
    [ownedCards]
  );
  const canBuildDeck = legendsCount >= 5 && itemsCount >= 20;
  const exibindoCarregamento = [loadingCards, loadingCollection].some(Boolean);

  // Handler para salvar deck
  const handleSaveDeck = async (cardIds) => {
    try {
      if (!isAuthenticated()) {
        alert("Você precisa estar logado para salvar decks!");
        return;
      }
      if (!valorFoiDefinido(user?.id)) {
        alert("Você precisa estar logado para salvar decks!");
        return;
      }

      const payload = {
        ownerId: Number(user.id),
        name: `Deck da Coleção - ${new Date().toLocaleString("pt-BR")}`,
        cards: cardIds,
      };

      const response = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Deck salvo com sucesso!");
        return;
      }

      const errorData = await response.json().catch(() => ({}));
      const message = valorComPadrao(errorData.error, "Erro ao salvar deck");
      console.error(
        "[CardInventory] Falha ao salvar deck:",
        response.status,
        message
      );
      alert(message);
    } catch (error) {
      console.error("Erro ao salvar deck:", error);
      alert("Erro ao salvar deck. Tente novamente.");
    }
  };

  return (
    <LayoutDePagina>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            🎒 Inventário
          </h1>
          <p className="text-xl text-purple-300">Suas cartas</p>
        </div>

        {/* Resumo Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30">
            <div className="text-sm text-gray-400">Cartas Coletadas</div>
            <div className="text-2xl font-bold">
              {totalOwned}/{totalAvailable}
            </div>
            <div className="text-xs text-gray-500">Progresso da Coleção</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30">
            <div className="text-sm text-gray-400">Itens</div>
            <div className="text-2xl font-bold">{allItems.length}</div>
            <div className="text-xs text-gray-500">
              Equipamentos e Consumíveis
            </div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30">
            <div className="text-sm text-gray-400 mb-2">Ações Rápidas</div>
            <div className="text-xs text-gray-400 mb-2 space-y-1">
              <div className="flex justify-between">
                <span>🔮 Lendas:</span>
                <span
                  className={
                    legendsCount >= 5 ? "text-green-400" : "text-yellow-400"
                  }
                >
                  {legendsCount}/5+
                </span>
              </div>
              <div className="flex justify-between">
                <span>⚔️ Itens:</span>
                <span
                  className={
                    itemsCount >= 20 ? "text-green-400" : "text-yellow-400"
                  }
                >
                  {itemsCount}/20+
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowDeckBuilder(true)}
              className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 rounded-lg text-sm font-semibold transition-all"
            >
              ⚔️ Montar Deck
            </button>
            <div className="text-xs text-gray-500 mt-1 text-center">
              {!canBuildDeck ? (
                <div>
                  {legendsCount < 5 && (
                    <div>Precisa de {5 - legendsCount} lendas</div>
                  )}
                  {itemsCount < 20 && (
                    <div>Precisa de {20 - itemsCount} itens</div>
                  )}
                </div>
              ) : (
                "Criar deck de 25 cartas"
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600/30 mb-6">
          <div className="flex border-b border-gray-600/30">
            <button
              onClick={() => setActiveTab("cards")}
              className={`flex-1 p-4 font-semibold transition-colors ${
                activeTab === "cards"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              🃏 Cartas ({ownedCards.length})
            </button>
            <button
              onClick={() => setActiveTab("items")}
              className={`flex-1 p-4 font-semibold transition-colors ${
                activeTab === "items"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              📦 Itens ({allItems.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === "cards" && (
              <>
                {!isAuthenticated() ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4">🔒</div>
                    <div className="text-lg mb-4 text-gray-300">
                      Faça login para ver sua coleção de cartas
                    </div>
                    <Link
                      href="/login"
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
                    >
                      Ir para Login
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
                      <input
                        type="text"
                        placeholder="Buscar por nome ou lore..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                      />
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                      >
                        {allRegions.map((r) => (
                          <option key={r} value={r}>
                            {r === "all" ? "Todas as Regiões" : r}
                          </option>
                        ))}
                      </select>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                      >
                        {allCategories.map((c) => (
                          <option key={c} value={c}>
                            {c === "all" ? "Todas as Categorias" : c}
                          </option>
                        ))}
                      </select>
                      <select
                        value={rarity}
                        onChange={(e) => setRarity(e.target.value)}
                        className="px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                      >
                        {allRarities.map((rr) => (
                          <option key={rr} value={rr}>
                            {rr === "all" ? "Todas as Raridades" : rr}
                          </option>
                        ))}
                      </select>
                      <select
                        value={cardTypeFilter}
                        onChange={(e) => setCardTypeFilter(e.target.value)}
                        className="px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="all">Todos os Tipos</option>
                        <option value="lendas">
                          🔮 Apenas Lendas ({legendsCount})
                        </option>
                        <option value="itens">
                          ⚔️ Apenas Itens ({itemsCount})
                        </option>
                      </select>
                    </div>

                    {exibindoCarregamento ? (
                      <div className="text-center text-gray-400">
                        Carregando cartas e coleção...
                      </div>
                    ) : cardsError ? (
                      <div className="text-center py-12 text-red-400">
                        Erro ao carregar cartas: {cardsError}
                      </div>
                    ) : collectionError ? (
                      <div className="text-center py-12">
                        <div className="text-red-400 mb-4">
                          Erro ao carregar coleção: {collectionError}
                        </div>
                      </div>
                    ) : filteredCards.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        Nenhuma carta encontrada com os filtros atuais.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredCards.map((card) => {
                          const rotuloRaridade = valorComPadrao(
                            primeiroValorDefinido(card.raridade, card.rarity),
                            "Comum"
                          );
                          const frame = obterClassesDeRaridade(rotuloRaridade);
                          const classesFrame = frame.split(" ");
                          const frameText = valorComPadrao(
                            classesFrame[1],
                            "text-gray-400"
                          );
                          const isLegend = ehCartaDeLenda(card);
                          const isItem = ehCartaDeItem(card);
                          const nomeCarta = valorComPadrao(
                            primeiroValorDefinido(card.nome, card.name),
                            "Carta desconhecida"
                          );
                          const regiaoCarta = valorComPadrao(
                            primeiroValorDefinido(card.regiao, card.region),
                            "Região misteriosa"
                          );
                          const categoriaCarta = valorComPadrao(
                            primeiroValorDefinido(
                              card.categoria,
                              card.category
                            ),
                            "Categoria desconhecida"
                          );
                          const possuiStatus = [
                            card.ataque,
                            card.attack,
                            card.defesa,
                            card.defense,
                            card.vida,
                            card.life,
                          ].some(valorFoiDefinido);
                          const ataqueCarta = valorComPadrao(
                            primeiroValorDefinido(card.ataque, card.attack),
                            "-"
                          );
                          const defesaCarta = valorComPadrao(
                            primeiroValorDefinido(card.defesa, card.defense),
                            "-"
                          );
                          const vidaCarta = valorComPadrao(
                            primeiroValorDefinido(card.vida, card.life),
                            "-"
                          );

                          return (
                            <div
                              key={card.id}
                              onClick={() => setSelectedCard(card)}
                              className={`bg-black/30 backdrop-blur-sm rounded-lg p-3 border-2 transition-all hover:scale-105 cursor-pointer ${frame} relative`}
                            >
                              {/* Badge de tipo de carta */}
                              <div className="absolute top-2 right-2">
                                {isLegend && (
                                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs">
                                    🔮
                                  </div>
                                )}
                                {isItem && (
                                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs">
                                    ⚔️
                                  </div>
                                )}
                              </div>

                              <div className="text-center">
                                <div className="mb-3">
                                  <CardImage
                                    card={card}
                                    size="medium"
                                    className="mx-auto"
                                  />
                                </div>
                                <h4 className="text-sm font-bold mb-1">
                                  {nomeCarta}
                                </h4>
                                <div className="text-xs text-gray-400 mb-1">
                                  {regiaoCarta} • {categoriaCarta}
                                </div>
                                <div
                                  className={`text-xs font-semibold mb-2 ${frameText}`}
                                >
                                  {rotuloRaridade}
                                </div>
                                {possuiStatus && (
                                  <div className="grid grid-cols-3 gap-1 text-xs">
                                    <div className="bg-red-900/40 p-1 rounded">
                                      ATQ: {ataqueCarta}
                                    </div>
                                    <div className="bg-blue-900/40 p-1 rounded">
                                      DEF: {defesaCarta}
                                    </div>
                                    <div className="bg-green-900/40 p-1 rounded">
                                      VIDA: {vidaCarta}
                                    </div>
                                  </div>
                                )}
                                {/* Badge específica do inventário */}
                                <div className="mt-2 flex gap-1 justify-center">
                                  <div className="text-[10px] inline-block px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-700/50">
                                    Possuída
                                  </div>
                                  {isLegend && (
                                    <div className="text-[10px] inline-block px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-700/50">
                                      Lenda
                                    </div>
                                  )}
                                  {isItem && (
                                    <div className="text-[10px] inline-block px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/50">
                                      Item
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {activeTab === "items" && (
              <>
                {!isAuthenticated() ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4">🔒</div>
                    <div className="text-lg mb-4 text-gray-300">
                      Faça login para ver sua coleção de itens
                    </div>
                    <Link
                      href="/login"
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
                    >
                      Ir para Login
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Filtros para itens */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                      <input
                        type="text"
                        placeholder="Buscar itens..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                      />
                      <select
                        value={rarity}
                        onChange={(e) => setRarity(e.target.value)}
                        className="px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="all">Todas as Raridades</option>
                        <option value="COMMON">Comum</option>
                        <option value="RARE">Raro</option>
                        <option value="EPIC">Épico</option>
                        <option value="LEGENDARY">Lendário</option>
                        <option value="MYTHIC">Mítico</option>
                      </select>
                      <select
                        onChange={(e) => {
                          const itemType = e.target.value;
                          setCategory(itemType === "all" ? "all" : itemType);
                        }}
                        className="px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="all">Todos os Tipos</option>
                        <option value="CONSUMABLE">Consumível</option>
                        <option value="EQUIPMENT">Equipamento</option>
                        <option value="ARTIFACT">Artefato</option>
                        <option value="RELIC">Relíquia</option>
                        <option value="SCROLL">Pergaminho</option>
                      </select>
                    </div>

                    {loadingCards ? (
                      <div className="text-center text-gray-400">
                        Carregando itens...
                      </div>
                    ) : cardsError ? (
                      <div className="text-center py-12 text-red-400">
                        Erro ao carregar itens: {cardsError}
                      </div>
                    ) : allItems.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        Nenhum item disponível para exibição.
                      </div>
                    ) : filteredItems.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        Nenhum item atende aos filtros atuais.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredItems.map((item) => (
                          <ItemCard
                            key={item.id}
                            item={item}
                            onClick={() => setSelectedCard(item)}
                            className="hover:scale-105 transition-transform"
                            isOwned={ownedItemIds.includes(item.id)}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal de Detalhes da Carta */}
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          mode="battle"
        />

        {/* Deck Builder */}
        <DeckBuilder
          isOpen={showDeckBuilder}
          onClose={() => setShowDeckBuilder(false)}
          onSave={handleSaveDeck}
          availableCards={ownedCards}
          title="Montar Deck da Coleção"
          subtitle={`Selecione 5 lendas e 20 itens de sua coleção (${legendsCount} lendas e ${itemsCount} itens disponíveis)`}
        />
      </div>
    </LayoutDePagina>
  );
}
