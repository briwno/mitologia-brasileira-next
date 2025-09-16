"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import LayoutDePagina from '@/components/UI/PageLayout';
import { useAuth } from '@/hooks/useAuth';
import { useCollection } from '@/hooks/useCollection';
import { RARIDADES_CARTAS } from '@/data/cardsDatabase';
import ItemCard from '@/components/Card/ItemCard';

// Mapas de tradução (API -> PT-BR)
const MAP_RARITY = { EPIC: 'Épico', LEGENDARY: 'Lendário', MYTHIC: 'Mítico' };
const MAP_REGION = { AMAZONIA: 'Amazônia', NORTHEAST: 'Nordeste', SOUTHEAST: 'Sudeste', SOUTH: 'Sul', MIDWEST: 'Centro-Oeste', NATIONAL: 'Nacional' };
const MAP_CATEGORY = { GUARDIANS: 'Guardiões da Floresta', SPIRITS: 'Espíritos das Águas', HAUNTS: 'Assombrações', PROTECTORS: 'Protetores Humanos', MYSTICAL: 'Entidades Místicas' };
const MAP_ELEMENT = { EARTH: 'Terra', WATER: 'Água', FIRE: 'Fogo', AIR: 'Ar', SPIRIT: 'Espírito' };
const MAP_SEASON = { CARNIVAL: 'Carnaval', SAO_JOAO: 'São João', FESTA_JUNINA: 'Festa Junina', CHRISTMAS: 'Natal' };
const translate = (val, map) => map?.[val] || val;
const formatEnumLabel = (val) => (typeof val === 'string' ? val.toLowerCase().split('_').map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(' ') : val);
import CardDetail from '@/components/Card/CardDetail';
import CardImage from '@/components/Card/CardImage';

function rarityColor(rarity) {
	switch (rarity) {
		case RARIDADES_CARTAS.MYTHIC:
			return 'text-pink-300';
		case RARIDADES_CARTAS.LEGENDARY:
			return 'text-yellow-300';
		case RARIDADES_CARTAS.EPIC:
			return 'text-purple-300';
		default:
			return 'text-gray-300';
	}
}

function ensureImage(src) {
	return src || '/window.svg';
}

function rarityFrame(rarity) {
	switch (rarity) {
		case RARIDADES_CARTAS.MYTHIC:
			return 'border-red-500 text-red-400';
		case RARIDADES_CARTAS.LEGENDARY:
			return 'border-yellow-500 text-yellow-400';
		case RARIDADES_CARTAS.EPIC:
			return 'border-purple-500 text-purple-400';
		default:
			return 'border-gray-500 text-gray-400';
	}
}

export default function PaginaInventarioDeCartas() {
	const { user, isAuthenticated } = useAuth();
	const { cards: ownedIds, loading: loadingCollection, error: collectionError } = useCollection();

	const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'items' | 'boosters'
	const [search, setSearch] = useState('');
	const [region, setRegion] = useState('all');
	const [category, setCategory] = useState('all');
	const [rarity, setRarity] = useState('all');

	// Booster and currencies stored per-user in localStorage
	const invKey = useMemo(() => `inv:${user?.email || 'guest'}`, [user]);
	const [inv, setInv] = useState({ boosters: { standard: 0, mythic: 0 }, coins: 0, gems: 0 });
	useEffect(() => {
		try {
			const raw = localStorage.getItem(invKey);
			if (raw) {
				setInv(JSON.parse(raw));
			} else {
				// seed de exemplo para experimentar
				const seed = { boosters: { standard: 3, mythic: 1 }, coins: 1500, gems: 50 };
				localStorage.setItem(invKey, JSON.stringify(seed));
				setInv(seed);
			}
		} catch {}
	}, [invKey]);

	const saveInv = (next) => {
		setInv(next);
		try { localStorage.setItem(invKey, JSON.stringify(next)); } catch {}
	};

	const openBooster = (type) => {
		if (inv.boosters[type] <= 0) return;
		const next = { ...inv, boosters: { ...inv.boosters, [type]: inv.boosters[type] - 1 } };
		saveInv(next);
		// Redirecionar para loja/gacha por enquanto
		window.location.href = '/shop';
	};

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
				
				// Fetch cards
				const cardsRes = await fetch('/api/cards');
				if (!cardsRes.ok) throw new Error('Falha ao carregar cartas');
				const cardsData = await cardsRes.json();
				
				// Fetch items
				const itemsRes = await fetch('/api/item-cards');
				if (!itemsRes.ok) throw new Error('Falha ao carregar itens');
				const itemsData = await itemsRes.json();
				
				const mappedCards = (cardsData.cards || []).map(c => {
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
						ataque: c.attack,
						defesa: c.defense,
						vida: c.life,
						custo: c.cost,
						raridade: translate(c.rarity, MAP_RARITY),
						historia: c.history,
						elemento: translate(c.element, MAP_ELEMENT),
						imagem: c.image,
						imagens: c.images,
						tags: c.tags,
						tipo: c.cardType,
						habilidades: c.abilities || {},
						condicaoDesbloqueio: c.unlockCondition,
						bonusSazonal,
						// descoberta removido: controle agora unicamente por posse no banco
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
			if (region !== 'all' && c.regiao !== region) return false;
			if (category !== 'all' && c.categoria !== category) return false;
			if (rarity !== 'all' && c.raridade !== rarity) return false;
			if (term && !(c.nome.toLowerCase().includes(term) || (c.historia || '').toLowerCase().includes(term))) return false;
			return true;
		});
	}, [ownedCards, region, category, rarity, search]);

	const totalAvailable = allCards.length;
	const totalOwned = ownedCards.length;

	const [selectedCard, setSelectedCard] = useState(null);

	return (
		<LayoutDePagina>
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
						🎒 Inventário
					</h1>
					<p className="text-xl text-purple-300">Suas cartas, boosters e recursos</p>
				</div>

				{/* Resumo Rápido */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30">
						<div className="text-sm text-gray-400">Cartas</div>
						<div className="text-2xl font-bold">{totalOwned}/{totalAvailable}</div>
						<div className="text-xs text-gray-500">Coleção</div>
					</div>
					<div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30">
						<div className="text-sm text-gray-400">Boosters Standard</div>
						<div className="text-2xl font-bold">{inv.boosters.standard}</div>
						<div className="text-xs text-gray-500">Inclui Épicos e Lendários</div>
					</div>
					<div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30">
						<div className="text-sm text-gray-400">Boosters Míticos</div>
						<div className="text-2xl font-bold">{inv.boosters.mythic}</div>
						<div className="text-xs text-gray-500">Banner Mítico semanal</div>
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
						<button
							onClick={() => setActiveTab('boosters')}
							className={`flex-1 p-4 font-semibold transition-colors ${
								activeTab === 'boosters' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-gray-300'
							}`}
						>
							🎁 Boosters
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
										<div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
											<input
												type="text"
												placeholder="Buscar por nome ou lore..."
												value={search}
												onChange={(e) => setSearch(e.target.value)}
												className="px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
											/>
											<select value={region} onChange={(e) => setRegion(e.target.value)} className="px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none">
												{allRegions.map((r) => (
													<option key={r} value={r}>{r === 'all' ? 'Todas as Regiões' : r}</option>
												))}
											</select>
											<select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none">
												{allCategories.map((c) => (
													<option key={c} value={c}>{c === 'all' ? 'Todas as Categorias' : c}</option>
												))}
											</select>
											<select value={rarity} onChange={(e) => setRarity(e.target.value)} className="px-3 py-2 bg-black/50 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none">
												{allRarities.map((rr) => (
													<option key={rr} value={rr}>{rr === 'all' ? 'Todas as Raridades' : rr}</option>
												))}
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
													const frame = rarityFrame(card.raridade || card.rarity);
													const frameText = frame.split(' ')[1] || 'text-gray-400';
													return (
														<div
															key={card.id}
															onClick={() => setSelectedCard(card)}
															className={`bg-black/30 backdrop-blur-sm rounded-lg p-3 border-2 transition-all hover:scale-105 cursor-pointer ${frame}`}
														>
															<div className="text-center">
																<div className="mb-3">
																	<CardImage card={card} size="medium" className="mx-auto" />
																</div>
																<h4 className="text-sm font-bold mb-1">{card.nome}</h4>
																<div className="text-xs text-gray-400 mb-1">{card.regiao} • {card.categoria}</div>
																<div className={`text-xs font-semibold mb-2 ${frameText}`}>{card.raridade || card.rarity}</div>
																{(card.ataque != null || card.attack != null || card.defesa != null || card.defense != null || card.vida != null) && (
																	<div className="grid grid-cols-3 gap-1 text-xs">
																		<div className="bg-red-900/40 p-1 rounded">ATQ: {card.ataque ?? card.attack ?? '-'}</div>
																		<div className="bg-blue-900/40 p-1 rounded">DEF: {card.defesa ?? card.defense ?? '-'}</div>
																		<div className="bg-green-900/40 p-1 rounded">VIDA: {card.vida ?? '-'}</div>
																	</div>
																)}
																{/* Badge específica do inventário */}
																<div className="mt-2 text-[10px] inline-block px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-700/50">No inventário</div>
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
														/>
													))
												}
											</div>
										)}
									</>
								)}
							</>
						)}

						{activeTab === 'boosters' && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Standard Booster */}
								<div className="bg-black/30 p-6 rounded-lg border border-gray-600/30">
									<div className="flex items-center justify-between mb-4">
										<div>
											<h3 className="text-xl font-bold text-blue-400">🎁 Booster Standard</h3>
											<div className="text-sm text-gray-400">Inclui Épicos e Lendários (sem Mítico limitado)</div>
										</div>
										<div className="text-3xl font-bold">{inv.boosters.standard}</div>
									</div>
									<div className="flex gap-3">
										<button
											disabled={inv.boosters.standard <= 0}
											onClick={() => openBooster('standard')}
											className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded"
										>
											Abrir 1
										</button>
										<Link href="/shop" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">Comprar</Link>
									</div>
								</div>

								{/* Mythic Booster */}
								<div className="bg-black/30 p-6 rounded-lg border border-gray-600/30">
									<div className="flex items-center justify-between mb-4">
										<div>
											<h3 className="text-xl font-bold text-pink-400">🌟 Booster Mítico</h3>
											<div className="text-sm text-gray-400">50/50 com garantias (pities) semanais</div>
										</div>
										<div className="text-3xl font-bold">{inv.boosters.mythic}</div>
									</div>
									<div className="flex gap-3">
										<button
											disabled={inv.boosters.mythic <= 0}
											onClick={() => openBooster('mythic')}
											className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded"
										>
											Abrir 1
										</button>
										<Link href="/shop" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">Comprar</Link>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Modal de Detalhes da Carta */}
				{selectedCard && (
					<div 
						className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
						onClick={() => setSelectedCard(null)}
					>
						<div onClick={(e) => e.stopPropagation()}>
							<CardDetail 
								card={selectedCard} 
								onClose={() => setSelectedCard(null)} 
							/>
						</div>
					</div>
				)}

				<div className="text-center mt-8">
					<Link href="/" className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold">
						← Voltar ao Menu
					</Link>
				</div>
			</div>
		</LayoutDePagina>
	);
}
