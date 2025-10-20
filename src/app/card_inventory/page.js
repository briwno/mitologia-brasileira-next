"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
      ...semDuplicatas.map((chave) => {
        const valor = mapaOriginal.get(chave);
        if (valor) {
          return valor;
        }
        return chave;
      }),
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
      ...semDuplicatas.map((chave) => {
        const valor = mapaOriginal.get(chave);
        if (valor) {
          return valor;
        }
        return chave;
      }),
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
      ...semDuplicatas.map((chave) => {
        const valor = mapaOriginal.get(chave);
        if (valor) {
          return valor;
        }
        return chave;
      }),
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

  // Filtrar itens possuídos pelo usuário
  const byItemId = useMemo(
    () => new Map(allItems.map((i) => [i.id, i])),
    [allItems]
  );
  const ownedItems = useMemo(() => {
    if (!isAuthenticated()) {
      return [];
    }
    if (!Array.isArray(ownedItemIds)) {
      return [];
    }
    if (ownedItemIds.length === 0) {
      return [];
    }
    return ownedItemIds.map((id) => byItemId.get(id)).filter(Boolean);
  }, [ownedItemIds, isAuthenticated, byItemId]);

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

    return ownedItems.filter((item) => {
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
  }, [ownedItems, search, rarity, category, activeTab]);

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
        ownerId: user.id,
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

      let errorData = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }
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
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/40 backdrop-blur-sm rounded-xl p-6 border-2 border-blue-500/50 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-blue-200 font-semibold">📚 Coleção</div>
              <div className="text-xs px-2 py-1 bg-blue-500/30 rounded-full text-blue-200">
                {(() => {
                  if (totalAvailable > 0) {
                    return Math.round((totalOwned / totalAvailable) * 100);
                  }
                  return 0;
                })()}%
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {totalOwned}<span className="text-xl text-blue-300">/{totalAvailable}</span>
            </div>
            <div className="text-xs text-blue-300">Cartas Coletadas</div>
            {/* Barra de progresso */}
            <div className="mt-3 h-2 bg-black/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${(() => {
                  if (totalAvailable > 0) {
                    return (totalOwned / totalAvailable) * 100;
                  }
                  return 0;
                })()}%` }}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/40 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-500/50 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-purple-200 font-semibold">📦 Inventário</div>
              <div className="text-xs px-2 py-1 bg-purple-500/30 rounded-full text-purple-200">
                Total
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {allItems.length}
            </div>
            <div className="text-xs text-purple-300">Itens Disponíveis</div>
            {/* Stats adicionais */}
            <div className="mt-3 flex gap-2 text-xs">
              <div className="px-2 py-1 bg-purple-500/20 rounded">⚔️ Equipamentos</div>
              <div className="px-2 py-1 bg-purple-500/20 rounded">🧪 Consumíveis</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-green-900/40 backdrop-blur-sm rounded-xl p-6 border-2 border-green-500/50 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-green-200 font-semibold">⚔️ Deck Builder</div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                canBuildDeck ? 'bg-green-500/30 text-green-200' : 'bg-yellow-500/30 text-yellow-200'
              }`}>
                {canBuildDeck ? 'Pronto!' : 'Faltam cartas'}
              </div>
            </div>
            <div className="space-y-2 mb-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-300">🔮 Lendas</span>
                <span className={legendsCount >= 5 ? "text-sm font-bold text-green-400" : "text-sm font-bold text-yellow-400"}>
                  {legendsCount}/5
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-300">⚔️ Itens</span>
                <span className={itemsCount >= 20 ? "text-sm font-bold text-green-400" : "text-sm font-bold text-yellow-400"}>
                  {itemsCount}/20
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowDeckBuilder(true)}
              disabled={!canBuildDeck}
              className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 rounded-lg text-sm font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canBuildDeck ? '🎯 Montar Deck' : '🔒 Colete mais cartas'}
            </button>
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
              📦 Itens ({ownedItems.length})
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

                          // Cores por raridade
                          const rarityColors = {
                            'Mítico': 'from-red-600/20 to-red-900/40 border-red-500/50',
                            'Lendário': 'from-orange-600/20 to-orange-900/40 border-orange-500/50',
                            'Épico': 'from-purple-600/20 to-purple-900/40 border-purple-500/50',
                            'Raro': 'from-blue-600/20 to-blue-900/40 border-blue-500/50',
                            'Comum': 'from-gray-600/20 to-gray-900/40 border-gray-500/50'
                          };
                          
                          let cardBg = rarityColors[rotuloRaridade];
                          if (!cardBg) {
                            cardBg = rarityColors['Comum'];
                          }

                          return (
                            <div
                              key={card.id}
                              onClick={() => setSelectedCard(card)}
                              className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10`}
                            >
                              {/* Card Container */}
                              <div className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${cardBg} border-2 backdrop-blur-sm`}>
                                {/* Imagem da Carta */}
                                <div className="relative aspect-[3/4] overflow-hidden bg-black/30">
                                  {(() => {
                                    const imagemSrc = card.imagens?.retrato || card.images?.portrait;
                                    if (imagemSrc) {
                                      return (
                                        <Image
                                          src={imagemSrc}
                                          alt={`${nomeCarta} - ${regiaoCarta}`}
                                          fill
                                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                          quality={90}
                                        />
                                      );
                                    }
                                    return (
                                      <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                                        <div className="text-center text-white/70">
                                          <div className="text-4xl mb-2">🔮</div>
                                          <div className="text-xs px-2">Sem Imagem</div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                  {/* Gradiente overlay para melhor legibilidade */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                </div>

                                {/* Informações da Carta */}
                                <div className="p-3 space-y-2">
                                  {/* Nome */}
                                  <h3 className="font-bold text-sm line-clamp-1 text-white">
                                    {nomeCarta}
                                  </h3>

                                  {/* Região e Categoria */}
                                  <div className="flex items-center gap-1 text-xs text-gray-300">
                                    <span className="truncate">{regiaoCarta}</span>
                                    <span>•</span>
                                    <span className="truncate">{categoriaCarta}</span>
                                  </div>

                                  {/* Raridade */}
                                  <div className="flex justify-center">
                                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${frame.split(' ')[1]} ${frame.split(' ')[0]}`}>
                                      {rotuloRaridade}
                                    </div>
                                  </div>

                                  {/* Stats */}
                                  {(() => {
                                    if (ataqueCarta !== "-" || defesaCarta !== "-" || vidaCarta !== "-") {
                                      return (
                                        <div className="grid grid-cols-3 gap-1 text-xs pt-2 border-t border-white/10">
                                          <div className="text-center">
                                            <div className="text-red-400 font-bold">ATQ</div>
                                            <div className="text-white">{ataqueCarta}</div>
                                          </div>
                                          <div className="text-center">
                                            <div className="text-blue-400 font-bold">DEF</div>
                                            <div className="text-white">{defesaCarta}</div>
                                          </div>
                                          <div className="text-center">
                                            <div className="text-green-400 font-bold">VIDA</div>
                                            <div className="text-white">{vidaCarta}</div>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>

                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />
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
