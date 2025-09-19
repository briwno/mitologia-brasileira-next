"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import LayoutDePagina from '../../components/UI/PageLayout';
import { getRaridades } from '../../utils/constantsAPI';

// Tema visual por raridade (usando strings diretas por enquanto)
const temaDeRaridade = {
	'Mítico': 'border-red-500 text-red-300',
	'Lendário': 'border-yellow-500 text-yellow-300',
	'Épico': 'border-purple-500 text-purple-300',
};

// Auxiliar para escolher uma carta do conjunto, com opção de priorizar destaque
function escolherDoConjunto(conjunto, destaque) {
	if (destaque) return destaque;
	return conjunto[Math.floor(Math.random() * conjunto.length)] || null;
}

// Rola a raridade com base em uma tabela de probabilidades [{rarity, p}]
function rolarRaridade(tabela) {
	const r = Math.random() * 100;
	let acumulado = 0;
	for (const item of tabela) {
		acumulado += item.p;
		if (r < acumulado) return item.rarity;
	}
	// Fallback: retorna a última raridade
		return tabela[tabela.length - 1].rarity;
}

export default function Loja() {
	const [gemas, setGemas] = useState(75);
	const [resultados, setResultados] = useState([]);
	const [mostrarResultados, setMostrarResultados] = useState(false);
	const [ocupado, setOcupado] = useState(false);
	const [cartas, setCartas] = useState([]);
	const [raridades, setRaridades] = useState({});
	const [carregando, setCarregando] = useState(true);
	// Estados de pity por banner
	const [pitySemanal5, setPitySemanal5] = useState(0);
	const [pitySemanal4, setPitySemanal4] = useState(0);
	const [cinquentaPorCentoPerdidoSemanal, setCinquentaPorCentoPerdidoSemanal] = useState(false);
	const [pityPadrao5, setPityPadrao5] = useState(0);
	const [pityPadrao4, setPityPadrao4] = useState(0);

	// Carrega dados da API
	useEffect(() => {
		async function carregarDados() {
			try {
				// Carregar cartas da API
				const resCartas = await fetch('/api/cards');
				const cartasData = await resCartas.json();
				setCartas(cartasData.cards || []);

				// Carregar raridades
				const raridadesData = await getRaridades();
				setRaridades(raridadesData);
			} catch (error) {
				console.error('Erro ao carregar dados:', error);
			} finally {
				setCarregando(false);
			}
		}
		
		carregarDados();
	}, []);

	// Carrega pity do localStorage
	useEffect(() => {
		try {
			const w5 = Number(localStorage.getItem('gacha.weekly.p5') || '0');
			const w4 = Number(localStorage.getItem('gacha.weekly.p4') || '0');
			const wf = localStorage.getItem('gacha.weekly.fifty') === '1';
			const s5 = Number(localStorage.getItem('gacha.standard.p5') || '0');
			const s4 = Number(localStorage.getItem('gacha.standard.p4') || '0');
			setPitySemanal5(isNaN(w5) ? 0 : w5);
			setPitySemanal4(isNaN(w4) ? 0 : w4);
			setCinquentaPorCentoPerdidoSemanal(wf);
			setPityPadrao5(isNaN(s5) ? 0 : s5);
			setPityPadrao4(isNaN(s4) ? 0 : s4);
		} catch {}
	}, []);

	// Persiste pity
	useEffect(() => {
		try {
			localStorage.setItem('gacha.weekly.p5', String(pitySemanal5));
			localStorage.setItem('gacha.weekly.p4', String(pitySemanal4));
			localStorage.setItem('gacha.weekly.fifty', cinquentaPorCentoPerdidoSemanal ? '1' : '0');
			localStorage.setItem('gacha.standard.p5', String(pityPadrao5));
			localStorage.setItem('gacha.standard.p4', String(pityPadrao4));
		} catch {}
	}, [pitySemanal5, pitySemanal4, cinquentaPorCentoPerdidoSemanal, pityPadrao5, pityPadrao4]);

	// Conjuntos por raridade
	const conjuntos = useMemo(() => {
		if (!raridades || !cartas.length) return { 'Mítico': [], 'Lendário': [], 'Épico': [] };
		
		const porRaridade = {
			[raridades.MYTHIC || 'Mítico']: [],
			[raridades.LEGENDARY || 'Lendário']: [],
			[raridades.EPIC || 'Épico']: [],
		};
		
		for (const c of cartas) {
			if (porRaridade[(c.raridade || c.rarity)]) porRaridade[(c.raridade || c.rarity)].push(c);
		}
		return porRaridade;
	}, [cartas, raridades]);

	// Banner semanal: destaque Mítico
	const destaqueSemanal = useMemo(() => {
		// Seleciona o primeiro Mítico como destaque (rotacionar no futuro)
		const miticos = conjuntos[raridades.MYTHIC || 'Mítico'] || [];
		return miticos[0] || null;
	}, [conjuntos, raridades]);

	const probSemanal = [
		{ rarity: 'Mítico', p: 0.8 },
		{ rarity: 'Lendário', p: 9.2 },
		{ rarity: 'Épico', p: 90 },
	];

	// Banner padrão: chance um pouco maior de Lendárias
	const probPadrao = [
		{ rarity: 'Mítico', p: 0.5 },
		{ rarity: 'Lendário', p: 9.5 },
		{ rarity: 'Épico', p: 90 },
	];

    // Custos
    const custoUnico = 8; // gemas
    const custoDez = 75; // gemas

			function realizarInvocacoes(qual, quantidade) {
		const prob = qual === 'weekly' ? probSemanal : probPadrao;
			const invocacoes = [];

			// Referências atuais de pity
			let p5 = qual === 'weekly' ? pitySemanal5 : pityPadrao5;
			let p4 = qual === 'weekly' ? pitySemanal4 : pityPadrao4;
			let cinquentaPerdido = qual === 'weekly' ? cinquentaPorCentoPerdidoSemanal : false;

			for (let i = 0; i < quantidade; i++) {
				// Determina a raridade considerando pity (MYTHIC ~ 5*, EPIC ~ 4*)
				let rarity;
				if (p5 >= 29) {
					// Pity 30 garante Mítico
					rarity = 'Mítico';
				} else if (p4 >= 9) {
					// Pity 10 garante ao menos Lendário (ou Mítico se a rolagem atingir)
					const r = rolarRaridade(prob);
					rarity = r === 'Mítico' ? 'Mítico' : 'Lendário';
				} else {
					rarity = rolarRaridade(prob);
				}

				// Escolhe carta do conjunto da raridade seguindo as regras do banner
				const conjunto = conjuntos[rarity] || [];
				let card = null;
				if (rarity === 'Mítico') {
					if (qual === 'weekly') {
						// 50/50: se perdeu o último, garante a carta em destaque
						if (destaqueSemanal) {
							if (cinquentaPerdido) {
								card = destaqueSemanal;
								cinquentaPerdido = false; // consome a garantia
							} else {
								const roll = Math.random() < 0.5; // 50/50
								if (roll) {
									card = destaqueSemanal;
								} else {
									// Mítico fora do banner (exclui destaque)
									const fora = conjunto.filter(c => !destaqueSemanal || c.id !== destaqueSemanal.id);
									card = fora[Math.floor(Math.random() * fora.length)] || destaqueSemanal;
									// Marca que o próximo 5* é garantido em destaque
									cinquentaPerdido = card && destaqueSemanal && card.id !== destaqueSemanal.id ? true : cinquentaPerdido;
								}
							}
						} else {
							// sem destaque disponível, escolhe do conjunto
							card = conjunto[Math.floor(Math.random() * conjunto.length)] || null;
						}
					} else {
						// padrão: não pode sair o Mítico em destaque do semanal
						const std = conjunto.filter(c => !destaqueSemanal || c.id !== destaqueSemanal.id);
						card = std[Math.floor(Math.random() * std.length)] || null;
					}
				} else {
					// Não-mítico: conjunto padrão
					card = conjunto[Math.floor(Math.random() * conjunto.length)] || null;
				}

				// Atualiza contadores de pity com base no resultado
				if (rarity === 'Mítico') {
					p5 = 0;
					p4 = 0;
				} else if (rarity === 'Lendário') {
					// Lendário reseta pity de 10; mantém de 30
					p5 += 1;
					p4 = 0;
				} else if (rarity === 'Épico') {
					// Épico incrementa ambos
					p5 += 1;
					p4 += 1;
				}

				if (card) invocacoes.push(card);
			}

			// Salva pity de volta no estado
			if (qual === 'weekly') {
				setPitySemanal5(p5);
				setPitySemanal4(p4);
				setCinquentaPorCentoPerdidoSemanal(cinquentaPerdido);
			} else {
				setPityPadrao5(p5);
				setPityPadrao4(p4);
			}

			return invocacoes;
	}

	async function invocar(qual, quantidade) {
		if (ocupado) return;
		const custo = quantidade === 10 ? custoDez : custoUnico;
		if (gemas < custo) return;
		setOcupado(true);
		try {
			setGemas((g) => g - custo);
			const cartas = realizarInvocacoes(qual, quantidade);
			setResultados(cartas);
			setMostrarResultados(true);
		} finally {
			setOcupado(false);
		}
	}

		const CartaoDeBanner = ({ id, titulo, subtitulo, realce, destaque, probabilidades, pity5, pity4 }) => {
		const mapaDeRealce = {
			emerald: { ring: 'ring-emerald-400/40', btn: 'bg-emerald-600 hover:bg-emerald-700', chip: 'bg-emerald-600/30 text-emerald-200 border-emerald-500/40' },
			amber: { ring: 'ring-amber-400/40', btn: 'bg-amber-600 hover:bg-amber-700', chip: 'bg-amber-600/30 text-amber-200 border-amber-500/40' },
		};
		const A = mapaDeRealce[realce];
			return (
				<div className={`relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-0 ring-1 ${A.ring} overflow-hidden`}> 
					{/* Layout vertical do card */}
				<div className="relative w-full h-[420px] md:h-[480px]">
								<Image src={(id === 'weekly' ? (destaque?.imagens?.cheia || destaque?.imagens?.retrato || destaque?.images?.full || destaque?.images?.portrait) : (destaque?.imagens?.retrato || destaque?.imagens?.cheia || destaque?.images?.portrait || destaque?.images?.full)) || '/images/placeholder.svg'} alt={destaque?.nome || destaque?.name || 'Banner'} fill className="object-cover" />
						<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
						<div className="absolute top-3 left-3">
							<span className={`px-2 py-1 rounded text-[10px] border ${A.chip}`}>{id === 'weekly' ? 'ROTAÇÃO DA SEMANA' : 'INVOC. PADRÃO'}</span>
						</div>
						<div className="absolute bottom-3 left-3 right-3">
							<h3 className="text-xl font-extrabold leading-tight">{titulo}</h3>
							<p className="text-gray-300 text-xs">{subtitulo}</p>
							{id === 'weekly' && destaque && (
								<div className="text-xs text-yellow-300 mt-1">Em destaque: <span className="font-semibold">{destaque.nome || destaque.name}</span></div>
							)}
						</div>
					</div>
					<div className="p-4 border-t border-white/10">
									  <div className="text-[11px] text-gray-400 mb-2">Taxas: {probabilidades.map(p => `${p.rarity}: ${p.p}%`).join(' • ')}</div>
									<div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
										<div>Pity Mítico: <span className="text-yellow-300 font-semibold">{pity5}/30</span></div>
											<div>Pity Lendário: <span className="text-yellow-300 font-semibold">{pity4}/10</span></div>
						</div>
						<div className="flex gap-3">
							<button disabled={ocupado || gemas < 8} onClick={() => invocar(id, 1)} className={`flex-1 py-2 rounded-lg font-semibold ${A.btn} disabled:bg-gray-600 disabled:cursor-not-allowed`}>
								Invocar x1 (💎{custoUnico})
							</button>
							<button disabled={ocupado || gemas < 75} onClick={() => invocar(id, 10)} className={`flex-1 py-2 rounded-lg font-semibold ${A.btn} disabled:bg-gray-600 disabled:cursor-not-allowed`}>
								Invocar x10 (💎{custoDez})
							</button>
						</div>
					</div>
				</div>
			);
	};

	if (carregando) {
		return (
			<LayoutDePagina>
				<div className="container mx-auto px-4 py-8">
					<div className="text-center">
						<div className="text-lg">Carregando loja...</div>
					</div>
				</div>
			</LayoutDePagina>
		);
	}

	return (
		<LayoutDePagina>
			<div className="container mx-auto px-4 py-8">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500">
						🧿 Invocações
					</h1>
					<p className="text-xl text-pink-200">Gire os banners para obter novas lendas</p>
				</div>

				{/* Carteira */}
				<div className="flex flex-wrap items-center justify-center gap-4 mb-8">
					<div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 border border-white/10">
						<span>💎</span>
						<span className="font-semibold">{gemas} gemas</span>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
					<CartaoDeBanner
						id="weekly"
						titulo="Rota da Semana • Mítico em destaque"
						subtitulo="Probabilidade aumentada para a carta Mítica da semana"
						realce="amber"
						destaque={destaqueSemanal}
						probabilidades={probSemanal}
					pity5={pitySemanal5}
					pity4={pitySemanal4}
					/>
					<CartaoDeBanner
						id="standard"
					titulo="Invocação Padrão"
					subtitulo="Sempre disponível, inclui Lendárias e Míticas (sem a limitada)"
						realce="emerald"
					destaque={null}
						probabilidades={probPadrao}
					pity5={pityPadrao5}
					pity4={pityPadrao4}
					/>
				</div>

				<div className="text-center mt-8">
					<Link href="/" className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold">
						← Voltar ao Menu Principal
					</Link>
				</div>
			</div>

			{/* Modal de Resultados */}
			{mostrarResultados && (
				<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setMostrarResultados(false)}>
					<div className="bg-black/40 border border-white/10 rounded-2xl p-6 max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-bold">Resultados</h3>
							<button onClick={() => setMostrarResultados(false)} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600">Fechar</button>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
								{resultados.map((card, idx) => (
									  <div key={idx} className={`relative rounded-lg p-2 border ${temaDeRaridade[card.raridade || card.rarity] || 'border-gray-600 text-gray-300'} bg-black/30`}>
									<div className="relative w-full h-28 rounded overflow-hidden mb-2 border border-white/10">
										<Image src={card.imagens?.retrato || card.images?.portrait || '/images/placeholder.svg'} alt={card.nome || card.name} fill className="object-cover" />
									</div>
									  <div className="text-xs font-semibold line-clamp-2">{card.nome || card.name}</div>
									  <div className="text-[10px] text-gray-400">{card.raridade || card.rarity}</div>
								</div>
							))}
						</div>
						<div className="mt-4 text-right text-sm text-gray-400">
								Garantia: a cada x10, pelo menos 1 Lendário (ou Mítico se ativar o pity).
							</div>
					</div>
				</div>
			)}
		</LayoutDePagina>
	);
}

