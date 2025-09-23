"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import LayoutDePagina from '@/components/UI/PageLayout';
import DeckBuilder from '@/components/Deck/DeckBuilder';
import { useAuth } from '@/hooks/useAuth';
import { useCollection } from '@/hooks/useCollection';
import ItemCard from '@/components/Card/ItemCard';
import CardModal from '@/components/Card/CardModal';
import CardImage from '@/components/Card/CardImage';
import { cardsAPI } from '@/utils/api';
import { 
  TRANSLATION_MAPS, 
  translate, 
  formatEnumLabel, 
  mapApiCardToLocal, 
  getRarityFrameClasses, 
  filterCards 
} from '@/utils/cardUtils';

export default function PaginaInventarioDeCartas() {
	const { user, isAuthenticated } = useAuth();
	const { cards: ownedIds, itemCards: ownedItemIds, loading: loadingCollection, error: collectionError } = useCollection();

	const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'items'
	const [search, setSearch] = useState('');
	const [region, setRegion] = useState('all');
	const [category, setCategory] = useState('all');
	const [rarity, setRarity] = useState('all');
	const [cardTypeFilter, setCardTypeFilter] = useState('all'); // 'all' | 'lendas' | 'itens'



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
				
				// Fetch cards usando API client
				const cardsData = await cardsAPI.getAll();
				
				// Fetch items (ainda usando fetch pois não tem no API client)
				const itemsRes = await fetch('/api/item-cards');
				if (!itemsRes.ok) throw new Error('Falha ao carregar itens');
				const itemsData = await itemsRes.json();
				
				// Mapear cartas para compatibilidade com DeckBuilder
				const mappedCards = (cardsData.cards || []).map(card => {
					const localCard = mapApiCardToLocal(card);
					// Garantir compatibilidade de campos para DeckBuilder
					return {
						...localCard,
						name: localCard.nome || card.name,
						category: localCard.categoria || card.category,
						region: localCard.regiao || card.region,
						rarity: localCard.raridade || card.rarity,
						attack: localCard.ataque || card.attack,
						defense: localCard.defesa || card.defense,
						life: localCard.vida || card.life
					};
				});
				
				if (!cancelled) {
					setAllCards(mappedCards);
					setAllItems(itemsData.itemCards || []);
				}
			} catch (e) {
				if (!cancelled) setCardsError(e.message);
			} finally {
				if (!cancelled) setLoadingCards(false);
			}
		})();
		return () => { cancelled = true; };
	}, []);

	// Mapear coleção real a partir dos IDs possuídos
	const byId = useMemo(() => new Map(allCards.map(c => [c.id, c])), [allCards]);
	const ownedCards = useMemo(() => {
		if (!isAuthenticated() || !ownedIds?.length) return [];
		return ownedIds.map(id => byId.get(id)).filter(Boolean);
	}, [ownedIds, isAuthenticated, byId]);

	// Filtros derivados dinamicamente das cartas carregadas
	const allRegions = useMemo(() => ['all', ...Array.from(new Set(allCards.map(c => c.regiao).filter(Boolean)))], [allCards]);
	const allCategories = useMemo(() => ['all', ...Array.from(new Set(allCards.map(c => c.categoria).filter(Boolean)))], [allCards]);
	const allRarities = useMemo(() => ['all', ...Array.from(new Set(allCards.map(c => c.raridade).filter(Boolean)))], [allCards]);

	const filteredCards = useMemo(() => {
		const pool = ownedCards;
		const term = search.trim().toLowerCase();
		return pool.filter(c => {
			if (region !== 'all' && (c.regiao || c.region) !== region) return false;
			if (category !== 'all' && (c.categoria || c.category) !== category) return false;
			if (rarity !== 'all' && (c.raridade || c.rarity) !== rarity) return false;
			if (term && !((c.nome || c.name || '').toLowerCase().includes(term) || (c.historia || c.lore || '').toLowerCase().includes(term))) return false;
			
			// Filtro por tipo de carta (lenda/item)
			if (cardTypeFilter === 'lendas' && !isLegendCard(c)) return false;
			if (cardTypeFilter === 'itens' && !isItemCard(c)) return false;
			
			return true;
		});
	}, [ownedCards, region, category, rarity, search, cardTypeFilter]);

	const totalAvailable = allCards.length;
	const totalOwned = ownedCards.length;

	const [selectedCard, setSelectedCard] = useState(null);
	const [showDeckBuilder, setShowDeckBuilder] = useState(false);

	// Função para identificar tipo de carta
	const isLegendCard = (card) => {
		const category = (card.category || card.categoria || '').toLowerCase();
		const type = (card.type || card.tipo || '').toLowerCase();
		const cardType = (card.cardType || card.card_type || '').toLowerCase();
		
		return category === 'lenda' || type === 'lenda' || 
			   category === 'legend' || type === 'legend' ||
			   cardType === 'lenda' || cardType === 'legend' ||
			   // Outras categorias que podem ser lendas
			   category.includes('lenda') || category.includes('legend');
	};

	const isItemCard = (card) => {
		const category = (card.category || card.categoria || '').toLowerCase();
		const type = (card.type || card.tipo || '').toLowerCase();
		const cardType = (card.cardType || card.card_type || '').toLowerCase();
		
		return category === 'item' || type === 'item' || 
			   category === 'itens' || type === 'itens' ||
			   cardType === 'item' || cardType === 'itens' ||
			   // Outras categorias que podem ser itens
			   category.includes('item') || category.includes('equipamento') ||
			   category.includes('consumivel') || category.includes('artefato');
	};

	// Estatísticas para o deck builder
	const legendsCount = useMemo(() => ownedCards.filter(isLegendCard).length, [ownedCards]);
	const itemsCount = useMemo(() => ownedCards.filter(isItemCard).length, [ownedCards]);
	const canBuildDeck = legendsCount >= 5 && itemsCount >= 20;

	// Handler para salvar deck
	const handleSaveDeck = async (cardIds) => {
		try {
			if (!isAuthenticated() || !user?.id) {
				alert('Você precisa estar logado para salvar decks!');
				return;
			}
			
			const payload = {
				ownerId: Number(user.id),
				name: `Deck da Coleção - ${new Date().toLocaleString('pt-BR')}`,
				cards: cardIds
			};
			
			const response = await fetch('/api/decks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			
			if (response.ok) {
				alert('Deck salvo com sucesso!');
			} else {
				throw new Error('Erro ao salvar deck');
			}
		} catch (error) {
			console.error('Erro ao salvar deck:', error);
			alert('Erro ao salvar deck. Tente novamente.');
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
						<div className="text-2xl font-bold">{totalOwned}/{totalAvailable}</div>
						<div className="text-xs text-gray-500">Progresso da Coleção</div>
					</div>
					<div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30">
						<div className="text-sm text-gray-400">Itens</div>
						<div className="text-2xl font-bold">{allItems.length}</div>
						<div className="text-xs text-gray-500">Equipamentos e Consumíveis</div>
					</div>
					<div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30">
						<div className="text-sm text-gray-400 mb-2">Ações Rápidas</div>
						<div className="text-xs text-gray-400 mb-2 space-y-1">
							<div className="flex justify-between">
								<span>🔮 Lendas:</span>
								<span className={legendsCount >= 5 ? 'text-green-400' : 'text-yellow-400'}>{legendsCount}/5+</span>
							</div>
							<div className="flex justify-between">
								<span>⚔️ Itens:</span>
								<span className={itemsCount >= 20 ? 'text-green-400' : 'text-yellow-400'}>{itemsCount}/20+</span>
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
									{legendsCount < 5 && <div>Precisa de {5 - legendsCount} lendas</div>}
									{itemsCount < 20 && <div>Precisa de {20 - itemsCount} itens</div>}
								</div>
							) : 'Criar deck de 25 cartas'}
						</div>
					</div>
				</div>

				{/* Tabs */}
				<div className="bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600/30 mb-6">
					<div className="flex border-b border-gray-600/30">
						<button
							onClick={() => setActiveTab('cards')}
							className={`flex-1 p-4 font-semibold transition-colors ${
								activeTab === 'cards' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'
							}`}
						>
							🃏 Cartas ({ownedCards.length})
						</button>
						<button
							onClick={() => setActiveTab('items')}
							className={`flex-1 p-4 font-semibold transition-colors ${
								activeTab === 'items' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-300'
							}`}
						>
							📦 Itens ({allItems.length})
						</button>
					</div>

					<div className="p-6">
						{activeTab === 'cards' && (
							<>
								{!isAuthenticated() ? (
									<div className="text-center py-16">
										<div className="text-5xl mb-4">🔒</div>
										<div className="text-lg mb-4 text-gray-300">Faça login para ver sua coleção de cartas</div>
										<Link href="/login" className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold">Ir para Login</Link>
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
													<option key={r} value={r}>{r === 'all' ? 'Todas as Regiões' : r}</option>
												))}
											</select>
											<select 
												value={category} 
												onChange={(e) => setCategory(e.target.value)} 
												className="px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
											>
												{allCategories.map((c) => (
													<option key={c} value={c}>{c === 'all' ? 'Todas as Categorias' : c}</option>
												))}
											</select>
											<select 
												value={rarity} 
												onChange={(e) => setRarity(e.target.value)} 
												className="px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
											>
												{allRarities.map((rr) => (
													<option key={rr} value={rr}>{rr === 'all' ? 'Todas as Raridades' : rr}</option>
												))}
											</select>
											<select 
												value={cardTypeFilter}
												onChange={(e) => setCardTypeFilter(e.target.value)}
												className="px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
											>
												<option value="all">Todos os Tipos</option>
												<option value="lendas">🔮 Apenas Lendas ({legendsCount})</option>
												<option value="itens">⚔️ Apenas Itens ({itemsCount})</option>
											</select>
										</div>

										{(loadingCards || loadingCollection) ? (
											<div className="text-center text-gray-400">Carregando cartas e coleção...</div>
										) : (cardsError) ? (
											<div className="text-center py-12 text-red-400">Erro ao carregar cartas: {cardsError}</div>
										) : collectionError ? (
											<div className="text-center py-12">
												<div className="text-red-400 mb-4">Erro ao carregar coleção: {collectionError}</div>
											</div>
										) : filteredCards.length === 0 ? (
											<div className="text-center py-12 text-gray-400">Nenhuma carta encontrada com os filtros atuais.</div>
										) : (
											<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
												{filteredCards.map((card) => {
													const frame = getRarityFrameClasses(card.raridade || card.rarity);
													const frameText = frame.split(' ')[1] || 'text-gray-400';
													const isLegend = isLegendCard(card);
													const isItem = isItemCard(card);
													
													return (
														<div
															key={card.id}
															onClick={() => setSelectedCard(card)}
															className={`bg-black/30 backdrop-blur-sm rounded-lg p-3 border-2 transition-all hover:scale-105 cursor-pointer ${frame} relative`}
														>
															{/* Badge de tipo de carta */}
															<div className="absolute top-2 right-2">
																{isLegend && (
																	<div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs">🔮</div>
																)}
																{isItem && (
																	<div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs">⚔️</div>
																)}
															</div>
															
															<div className="text-center">
																<div className="mb-3">
																	<CardImage card={card} size="medium" className="mx-auto" />
																</div>
																<h4 className="text-sm font-bold mb-1">{card.nome || card.name}</h4>
																<div className="text-xs text-gray-400 mb-1">{card.regiao || card.region} • {card.categoria || card.category}</div>
																<div className={`text-xs font-semibold mb-2 ${frameText}`}>{card.raridade || card.rarity}</div>
																{(card.ataque != null || card.attack != null || card.defesa != null || card.defense != null || card.vida != null || card.life != null) && (
																	<div className="grid grid-cols-3 gap-1 text-xs">
																		<div className="bg-red-900/40 p-1 rounded">ATQ: {card.ataque ?? card.attack ?? '-'}</div>
																		<div className="bg-blue-900/40 p-1 rounded">DEF: {card.defesa ?? card.defense ?? '-'}</div>
																		<div className="bg-green-900/40 p-1 rounded">VIDA: {card.vida ?? card.life ?? '-'}</div>
																	</div>
																)}
																{/* Badge específica do inventário */}
																<div className="mt-2 flex gap-1 justify-center">
																	<div className="text-[10px] inline-block px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-700/50">Possuída</div>
																	{isLegend && <div className="text-[10px] inline-block px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-700/50">Lenda</div>}
																	{isItem && <div className="text-[10px] inline-block px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/50">Item</div>}
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

						{activeTab === 'items' && (
							<>
								{!isAuthenticated() ? (
									<div className="text-center py-16">
										<div className="text-5xl mb-4">🔒</div>
										<div className="text-lg mb-4 text-gray-300">Faça login para ver sua coleção de itens</div>
										<Link href="/login" className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold">Ir para Login</Link>
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
													setCategory(itemType === 'all' ? 'all' : itemType);
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
											<div className="text-center text-gray-400">Carregando itens...</div>
										) : cardsError ? (
											<div className="text-center py-12 text-red-400">Erro ao carregar itens: {cardsError}</div>
										) : allItems.length === 0 ? (
											<div className="text-center py-12 text-gray-400">Nenhum item encontrado.</div>
										) : (
											<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
												{allItems
													.filter(item => {
														if (search && !item.name?.toLowerCase().includes(search.toLowerCase()) && !item.description?.toLowerCase().includes(search.toLowerCase())) return false;
														if (rarity !== 'all' && item.rarity !== rarity) return false;
														if (category !== 'all' && item.itemType !== category) return false;
														return true;
													})
													.map((item) => (
														<ItemCard
															key={item.id}
															item={item}
															onClick={() => setSelectedCard(item)}
															className="hover:scale-105 transition-transform"
															isOwned={ownedItemIds.includes(item.id)}
														/>
													))
												}
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
