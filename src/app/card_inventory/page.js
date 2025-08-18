"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageLayout from '@/components/UI/PageLayout';
import { useAuth } from '@/hooks/useAuth';
import { useCollection } from '@/hooks/useCollection';
import { cardsDatabase, CARD_RARITIES, REGIONS, CARD_CATEGORIES } from '@/data/cardsDatabase';
import CardDetail from '@/components/Card/CardDetail';
import CardImage from '@/components/Card/CardImage';

function rarityColor(rarity) {
	switch (rarity) {
		case CARD_RARITIES.MYTHIC:
			return 'text-pink-300';
		case CARD_RARITIES.LEGENDARY:
			return 'text-yellow-300';
		case CARD_RARITIES.EPIC:
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
		case CARD_RARITIES.MYTHIC:
			return 'border-red-500 text-red-400';
		case CARD_RARITIES.LEGENDARY:
			return 'border-yellow-500 text-yellow-400';
		case CARD_RARITIES.EPIC:
			return 'border-purple-500 text-purple-400';
		default:
			return 'border-gray-500 text-gray-400';
	}
}

export default function CardInventoryPage() {
	const { user, isAuthenticated } = useAuth();
	const { cards: ownedIds, loading: loadingCollection } = useCollection();

	const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'boosters'
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

	// Mapear coleção real
	const byId = useMemo(() => new Map(cardsDatabase.map(c => [c.id, c])), []);
	const ownedCards = useMemo(() => {
		if (!isAuthenticated() || !ownedIds?.length) return [];
		return ownedIds.map(id => byId.get(id)).filter(Boolean);
	}, [ownedIds, isAuthenticated, byId]);

	// Filtros derivados
	const allRegions = useMemo(() => ['all', ...Array.from(new Set(cardsDatabase.map(c => c.region).filter(Boolean)))], []);
	const allCategories = useMemo(() => ['all', ...Array.from(new Set(cardsDatabase.map(c => c.category).filter(Boolean)))], []);
	const allRarities = useMemo(() => ['all', CARD_RARITIES.EPIC, CARD_RARITIES.LEGENDARY, CARD_RARITIES.MYTHIC], []);

	const filteredCards = useMemo(() => {
		const pool = ownedCards;
		const term = search.trim().toLowerCase();
		return pool.filter(c => {
			if (region !== 'all' && c.region !== region) return false;
			if (category !== 'all' && c.category !== category) return false;
			if (rarity !== 'all' && c.rarity !== rarity) return false;
			if (term && !(c.name.toLowerCase().includes(term) || (c.lore || '').toLowerCase().includes(term))) return false;
			return true;
		});
	}, [ownedCards, region, category, rarity, search]);

	const totalAvailable = useMemo(() => cardsDatabase.length, []);
	const totalOwned = ownedCards.length;

	const [selectedCard, setSelectedCard] = useState(null);

	return (
		<PageLayout>
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
							🃏 Cartas
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

										{loadingCollection ? (
											<div className="text-center text-gray-400">Carregando sua coleção...</div>
										) : filteredCards.length === 0 ? (
											<div className="text-center py-12 text-gray-400">Nenhuma carta encontrada com os filtros atuais.</div>
										) : (
											<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
												{filteredCards.map((card) => {
													const frame = rarityFrame(card.rarity);
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
																<h4 className="text-sm font-bold mb-1">{card.name}</h4>
																<div className="text-xs text-gray-400 mb-1">{card.region} • {card.category}</div>
																<div className={`text-xs font-semibold mb-2 ${frameText}`}>{card.rarity}</div>
																{(card.attack != null || card.defense != null || card.health != null) && (
																	<div className="grid grid-cols-3 gap-1 text-xs">
																		<div className="bg-red-900/40 p-1 rounded">ATQ: {card.attack ?? '-'}</div>
																		<div className="bg-blue-900/40 p-1 rounded">DEF: {card.defense ?? '-'}</div>
																		<div className="bg-green-900/40 p-1 rounded">VIDA: {card.health ?? '-'}</div>
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
		</PageLayout>
	);
}
