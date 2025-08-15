"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import PageLayout from '../../components/UI/PageLayout';
import { cardsDatabase, CARD_RARITIES } from '../../data/cardsDatabase';

const rarityTheme = {
	[CARD_RARITIES.MYTHIC]: 'border-red-500 text-red-300',
	[CARD_RARITIES.LEGENDARY]: 'border-yellow-500 text-yellow-300',
	[CARD_RARITIES.EPIC]: 'border-purple-500 text-purple-300',
};

// Helper to pick a card by rarity, with optional featured override
function pickFromPool(pool, featured) {
	if (featured) return featured;
	return pool[Math.floor(Math.random() * pool.length)] || null;
}

// Roll with probability table like [{rarity, p}]
function rollRarity(probTable) {
	const r = Math.random() * 100;
	let acc = 0;
	for (const item of probTable) {
		acc += item.p;
		if (r < acc) return item.rarity;
	}
	// Fallback to last rarity
	return probTable[probTable.length - 1].rarity;
}

export default function Shop() {
	const [gems, setGems] = useState(75);
	const [results, setResults] = useState([]);
	const [showResults, setShowResults] = useState(false);
	const [busy, setBusy] = useState(false);
	// Pity states per banner
	const [weeklyPity5, setWeeklyPity5] = useState(0);
	const [weeklyPity4, setWeeklyPity4] = useState(0);
	const [weeklyFiftyLost, setWeeklyFiftyLost] = useState(false);
	const [standardPity5, setStandardPity5] = useState(0);
	const [standardPity4, setStandardPity4] = useState(0);

	// Load pity from localStorage
	useEffect(() => {
		try {
			const w5 = Number(localStorage.getItem('gacha.weekly.p5') || '0');
			const w4 = Number(localStorage.getItem('gacha.weekly.p4') || '0');
			const wf = localStorage.getItem('gacha.weekly.fifty') === '1';
			const s5 = Number(localStorage.getItem('gacha.standard.p5') || '0');
			const s4 = Number(localStorage.getItem('gacha.standard.p4') || '0');
			setWeeklyPity5(isNaN(w5) ? 0 : w5);
			setWeeklyPity4(isNaN(w4) ? 0 : w4);
			setWeeklyFiftyLost(wf);
			setStandardPity5(isNaN(s5) ? 0 : s5);
			setStandardPity4(isNaN(s4) ? 0 : s4);
		} catch {}
	}, []);

	// Persist pity
	useEffect(() => {
		try {
			localStorage.setItem('gacha.weekly.p5', String(weeklyPity5));
			localStorage.setItem('gacha.weekly.p4', String(weeklyPity4));
			localStorage.setItem('gacha.weekly.fifty', weeklyFiftyLost ? '1' : '0');
			localStorage.setItem('gacha.standard.p5', String(standardPity5));
			localStorage.setItem('gacha.standard.p4', String(standardPity4));
		} catch {}
	}, [weeklyPity5, weeklyPity4, weeklyFiftyLost, standardPity5, standardPity4]);

	// Pools by rarity
	const pools = useMemo(() => {
	    const byRarity = {
				[CARD_RARITIES.MYTHIC]: [],
				[CARD_RARITIES.LEGENDARY]: [],
				[CARD_RARITIES.EPIC]: [],
			};
		for (const c of cardsDatabase) {
			if (byRarity[c.rarity]) byRarity[c.rarity].push(c);
		}
		return byRarity;
	}, []);

	// Weekly banner: Mythic rate-up
	const weeklyFeatured = useMemo(() => {
		// Pick first mythic as featured (rotate in future)
		return pools[CARD_RARITIES.MYTHIC][0] || null;
	}, [pools]);

	  const weeklyProb = [
			{ rarity: CARD_RARITIES.MYTHIC, p: 0.8 },
			{ rarity: CARD_RARITIES.LEGENDARY, p: 9.2 },
			{ rarity: CARD_RARITIES.EPIC, p: 90 },
		];

	// Standard banner: slightly higher Legendary
	  const standardProb = [
			{ rarity: CARD_RARITIES.MYTHIC, p: 0.5 },
			{ rarity: CARD_RARITIES.LEGENDARY, p: 9.5 },
			{ rarity: CARD_RARITIES.EPIC, p: 90 },
		];

	// Costs
	const costSingle = 8; // gems
	const costTen = 75; // gems

			function doPulls(which, count) {
		const prob = which === 'weekly' ? weeklyProb : standardProb;
			const pulls = [];

			// Current pity refs
			let p5 = which === 'weekly' ? weeklyPity5 : standardPity5;
			let p4 = which === 'weekly' ? weeklyPity4 : standardPity4;
			let fiftyLost = which === 'weekly' ? weeklyFiftyLost : false;

			for (let i = 0; i < count; i++) {
				// Determine rarity with pity (MYTHIC ~ 5*, EPIC ~ 4*)
				let rarity;
				if (p5 >= 29) {
					// Pity 30 garante Mítico
					rarity = CARD_RARITIES.MYTHIC;
				} else if (p4 >= 9) {
					// Pity 10 garante ao menos Lendário (ou Mítico se a rolagem atingir)
					const r = rollRarity(prob);
					rarity = r === CARD_RARITIES.MYTHIC ? CARD_RARITIES.MYTHIC : CARD_RARITIES.LEGENDARY;
				} else {
					rarity = rollRarity(prob);
				}

				// Pick card from rarity pool with banner rules
				const pool = pools[rarity] || [];
				let card = null;
				if (rarity === CARD_RARITIES.MYTHIC) {
					if (which === 'weekly') {
						// Genshin-like 50/50: if lost last time, guarantee featured
						if (weeklyFeatured) {
							if (fiftyLost) {
								card = weeklyFeatured;
								fiftyLost = false; // consume guarantee
							} else {
								const roll = Math.random() < 0.5; // 50/50
								if (roll) {
									card = weeklyFeatured;
								} else {
									// off-banner mythic (exclude featured)
									const off = pool.filter(c => !weeklyFeatured || c.id !== weeklyFeatured.id);
									card = off[Math.floor(Math.random() * off.length)] || weeklyFeatured;
									// Mark that next 5* is guaranteed featured
									fiftyLost = card && weeklyFeatured && card.id !== weeklyFeatured.id ? true : fiftyLost;
								}
							}
						} else {
							// no featured available, pick from pool
							card = pool[Math.floor(Math.random() * pool.length)] || null;
						}
					} else {
						// standard: cannot drop weekly featured mythic
						const std = pool.filter(c => !weeklyFeatured || c.id !== weeklyFeatured.id);
						card = std[Math.floor(Math.random() * std.length)] || null;
					}
				} else {
					// Non-mythic: standard pool
					card = pool[Math.floor(Math.random() * pool.length)] || null;
				}

				// Update pity counters based on result
				if (rarity === CARD_RARITIES.MYTHIC) {
					p5 = 0;
					p4 = 0;
				} else if (rarity === CARD_RARITIES.LEGENDARY) {
					// Lendário reseta pity de 10; mantém de 30
					p5 += 1;
					p4 = 0;
				} else if (rarity === CARD_RARITIES.EPIC) {
					// Épico incrementa ambos
					p5 += 1;
					p4 += 1;
				}

				if (card) pulls.push(card);
			}

			// Save pity back to state
			if (which === 'weekly') {
				setWeeklyPity5(p5);
				setWeeklyPity4(p4);
				setWeeklyFiftyLost(fiftyLost);
			} else {
				setStandardPity5(p5);
				setStandardPity4(p4);
			}

			return pulls;
	}

	async function pull(which, count) {
		if (busy) return;
		const cost = count === 10 ? costTen : costSingle;
		if (gems < cost) return;
		setBusy(true);
		try {
			setGems((g) => g - cost);
			const cards = doPulls(which, count);
			setResults(cards);
			setShowResults(true);
		} finally {
			setBusy(false);
		}
	}

		const BannerCard = ({ id, title, subtitle, accent, featured, prob, pity5, pity4 }) => {
		const accentMap = {
			emerald: { ring: 'ring-emerald-400/40', btn: 'bg-emerald-600 hover:bg-emerald-700', chip: 'bg-emerald-600/30 text-emerald-200 border-emerald-500/40' },
			amber: { ring: 'ring-amber-400/40', btn: 'bg-amber-600 hover:bg-amber-700', chip: 'bg-amber-600/30 text-amber-200 border-amber-500/40' },
		};
		const A = accentMap[accent];
			return (
				<div className={`relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-0 ring-1 ${A.ring} overflow-hidden`}> 
					{/* Vertical card layout */}
				<div className="relative w-full h-[420px] md:h-[480px]">
								<Image src={(id === 'weekly' ? (featured?.images?.full || featured?.images?.portrait) : (featured?.images?.portrait || featured?.images?.full)) || '/images/placeholder.svg'} alt={featured?.name || 'Banner'} fill className="object-cover" />
						<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
						<div className="absolute top-3 left-3">
							<span className={`px-2 py-1 rounded text-[10px] border ${A.chip}`}>{id === 'weekly' ? 'ROTAÇÃO DA SEMANA' : 'INVOC. PADRÃO'}</span>
						</div>
						<div className="absolute bottom-3 left-3 right-3">
							<h3 className="text-xl font-extrabold leading-tight">{title}</h3>
							<p className="text-gray-300 text-xs">{subtitle}</p>
							{id === 'weekly' && featured && (
								<div className="text-xs text-yellow-300 mt-1">Em destaque: <span className="font-semibold">{featured.name}</span></div>
							)}
						</div>
					</div>
					<div className="p-4 border-t border-white/10">
									<div className="text-[11px] text-gray-400 mb-2">Taxas: {prob.map(p => `${p.rarity}: ${p.p}%`).join(' • ')}</div>
									<div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
										<div>Pity Mítico: <span className="text-yellow-300 font-semibold">{pity5}/30</span></div>
											<div>Pity Lendário: <span className="text-yellow-300 font-semibold">{pity4}/10</span></div>
						</div>
						<div className="flex gap-3">
							<button disabled={busy || gems < 8} onClick={() => pull(id, 1)} className={`flex-1 py-2 rounded-lg font-semibold ${A.btn} disabled:bg-gray-600 disabled:cursor-not-allowed`}>
								Invocar x1 (💎{costSingle})
							</button>
							<button disabled={busy || gems < 75} onClick={() => pull(id, 10)} className={`flex-1 py-2 rounded-lg font-semibold ${A.btn} disabled:bg-gray-600 disabled:cursor-not-allowed`}>
								Invocar x10 (💎{costTen})
							</button>
						</div>
					</div>
				</div>
			);
	};

	return (
		<PageLayout>
			<div className="container mx-auto px-4 py-8">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500">
						🧿 Invocações
					</h1>
					<p className="text-xl text-pink-200">Gire os banners para obter novas lendas</p>
				</div>

				{/* Wallet */}
				<div className="flex flex-wrap items-center justify-center gap-4 mb-8">
					<div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 border border-white/10">
						<span>�</span>
						<span className="font-semibold">{gems} gemas</span>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
					<BannerCard
						id="weekly"
						title="Rota da Semana • Mítico em destaque"
						subtitle="Probabilidade aumentada para a carta Mítica da semana"
						accent="amber"
						featured={weeklyFeatured}
						prob={weeklyProb}
					pity5={weeklyPity5}
					pity4={weeklyPity4}
					/>
					<BannerCard
						id="standard"
					title="Invocação Padrão"
					subtitle="Sempre disponível, inclui Lendárias e Míticas (sem a limitada)"
						accent="emerald"
					featured={null}
						prob={standardProb}
					pity5={standardPity5}
					pity4={standardPity4}
					/>
				</div>

				<div className="text-center mt-8">
					<Link href="/" className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold">
						← Voltar ao Menu Principal
					</Link>
				</div>
			</div>

			{/* Results Modal */}
			{showResults && (
				<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowResults(false)}>
					<div className="bg-black/40 border border-white/10 rounded-2xl p-6 max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-bold">Resultados</h3>
							<button onClick={() => setShowResults(false)} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600">Fechar</button>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
									{results.map((card, idx) => (
										<div key={idx} className={`relative rounded-lg p-2 border ${rarityTheme[card.rarity] || 'border-gray-600 text-gray-300'} bg-black/30`}>
									<div className="relative w-full h-28 rounded overflow-hidden mb-2 border border-white/10">
										<Image src={card.images?.portrait || '/images/placeholder.svg'} alt={card.name} fill className="object-cover" />
									</div>
									<div className="text-xs font-semibold line-clamp-2">{card.name}</div>
									<div className="text-[10px] text-gray-400">{card.rarity}</div>
								</div>
							))}
						</div>
						<div className="mt-4 text-right text-sm text-gray-400">
								Garantia: a cada x10, pelo menos 1 Lendário (ou Mítico se ativar o pity).
							</div>
					</div>
				</div>
			)}
		</PageLayout>
	);
}

