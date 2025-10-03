"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import LayoutDePagina from '@/components/UI/PageLayout';
import { obterRaridades } from '@/utils/constantsAPI';

// Tema visual por raridade (usando strings diretas por enquanto)
const temaDeRaridade = {
  Mítico: 'border-red-500 text-red-300',
  Lendário: 'border-yellow-500 text-yellow-300',
  Épico: 'border-purple-500 text-purple-300',
};

// Rola a raridade com base em uma tabela de probabilidades [{raridade, p}]
function rolarRaridade(tabela) {
	const r = Math.random() * 100;
	let acumulado = 0;
	for (const item of tabela) {
		acumulado += item.p;
		if (r < acumulado) return item.raridade;
	}
	// Garantia: retorna a última raridade disponível
	return tabela[tabela.length - 1].raridade;
}

export default function Loja() {
	const [gemas, definirGemas] = useState(75);
	const [resultados, definirResultados] = useState([]);
	const [mostrarResultados, definirMostrarResultados] = useState(false);
	const [ocupado, definirOcupado] = useState(false);
	const [cartas, definirCartas] = useState([]);
	const [raridades, definirRaridades] = useState({});
	const [carregando, definirCarregando] = useState(true);
	// Estados de pity por banner
	const [pitySemanal5, definirPitySemanal5] = useState(0);
	const [pitySemanal4, definirPitySemanal4] = useState(0);
	const [cinquentaPorCentoPerdidoSemanal, definirCinquentaPorCentoPerdidoSemanal] = useState(false);
	const [pityPadrao5, definirPityPadrao5] = useState(0);
	const [pityPadrao4, definirPityPadrao4] = useState(0);

	// Carrega dados da API
	useEffect(() => {
		async function carregarDados() {
			try {
				// Carregar cartas da API
				const respostaCartas = await fetch('/api/cards');
				const dadosCartas = await respostaCartas.json();
				definirCartas(dadosCartas.cards || []);

				// Carregar raridades
				const dadosRaridades = await obterRaridades();
				definirRaridades(dadosRaridades);
			} catch (erroCarregamento) {
				console.error('Erro ao carregar dados:', erroCarregamento);
			} finally {
				definirCarregando(false);
			}
		}
		
		carregarDados();
	}, []);

	// Carrega pity do localStorage
	useEffect(() => {
		try {
			const w5 = Number(localStorage.getItem('gacha.semanal.p5') ?? localStorage.getItem('gacha.weekly.p5') ?? '0');
			const w4 = Number(localStorage.getItem('gacha.semanal.p4') ?? localStorage.getItem('gacha.weekly.p4') ?? '0');
			const wf = (localStorage.getItem('gacha.semanal.perdeu50') ?? localStorage.getItem('gacha.weekly.fifty')) === '1';
			const s5 = Number(localStorage.getItem('gacha.padrao.p5') ?? localStorage.getItem('gacha.standard.p5') ?? '0');
			const s4 = Number(localStorage.getItem('gacha.padrao.p4') ?? localStorage.getItem('gacha.standard.p4') ?? '0');
			definirPitySemanal5(isNaN(w5) ? 0 : w5);
			definirPitySemanal4(isNaN(w4) ? 0 : w4);
			definirCinquentaPorCentoPerdidoSemanal(wf);
			definirPityPadrao5(isNaN(s5) ? 0 : s5);
			definirPityPadrao4(isNaN(s4) ? 0 : s4);
		} catch {}
	}, []);

	// Persiste pity
	useEffect(() => {
		try {
			localStorage.setItem('gacha.semanal.p5', String(pitySemanal5));
			localStorage.setItem('gacha.semanal.p4', String(pitySemanal4));
			localStorage.setItem('gacha.semanal.perdeu50', cinquentaPorCentoPerdidoSemanal ? '1' : '0');
			localStorage.setItem('gacha.padrao.p5', String(pityPadrao5));
			localStorage.setItem('gacha.padrao.p4', String(pityPadrao4));
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

	const probabilidadesSemanais = [
		{ raridade: 'Mítico', p: 0.8 },
		{ raridade: 'Lendário', p: 9.2 },
		{ raridade: 'Épico', p: 90 },
	];

	// Banner padrão: chance um pouco maior de Lendárias
	const probabilidadesPadrao = [
		{ raridade: 'Mítico', p: 0.5 },
		{ raridade: 'Lendário', p: 9.5 },
		{ raridade: 'Épico', p: 90 },
	];

	// Custos
	const custoUnico = 8; // gemas
	const custoDez = 75; // gemas

	function realizarInvocacoes(tipoBanner, quantidade) {
		const probabilidades = tipoBanner === 'semanal' ? probabilidadesSemanais : probabilidadesPadrao;
		const cartasObtidas = [];

		let contadorPityMitico = tipoBanner === 'semanal' ? pitySemanal5 : pityPadrao5;
		let contadorPityLendario = tipoBanner === 'semanal' ? pitySemanal4 : pityPadrao4;
		let perdeuGarantiaSemanal = tipoBanner === 'semanal' ? cinquentaPorCentoPerdidoSemanal : false;

		for (let indice = 0; indice < quantidade; indice += 1) {
			let raridadeAtual;
			if (contadorPityMitico >= 29) {
				raridadeAtual = 'Mítico';
			} else if (contadorPityLendario >= 9) {
				const tentativa = rolarRaridade(probabilidades);
				raridadeAtual = tentativa === 'Mítico' ? 'Mítico' : 'Lendário';
			} else {
				raridadeAtual = rolarRaridade(probabilidades);
			}

			const conjuntoPorRaridade = conjuntos[raridadeAtual] || [];
			let cartaObtida = null;

			if (raridadeAtual === 'Mítico') {
				if (tipoBanner === 'semanal') {
					if (destaqueSemanal) {
						if (perdeuGarantiaSemanal) {
							cartaObtida = destaqueSemanal;
							perdeuGarantiaSemanal = false;
						} else {
							const caiuDestaque = Math.random() < 0.5;
							if (caiuDestaque) {
								cartaObtida = destaqueSemanal;
							} else {
								const opcoesForaDoBanner = conjuntoPorRaridade.filter((carta) => !destaqueSemanal || carta.id !== destaqueSemanal.id);
								cartaObtida = opcoesForaDoBanner[Math.floor(Math.random() * opcoesForaDoBanner.length)] || destaqueSemanal;
								if (cartaObtida && destaqueSemanal && cartaObtida.id !== destaqueSemanal.id) {
									perdeuGarantiaSemanal = true;
								}
							}
						}
					} else {
						cartaObtida = conjuntoPorRaridade[Math.floor(Math.random() * conjuntoPorRaridade.length)] || null;
					}
				} else {
					const opcoesPadrao = conjuntoPorRaridade.filter((carta) => !destaqueSemanal || carta.id !== destaqueSemanal.id);
					cartaObtida = opcoesPadrao[Math.floor(Math.random() * opcoesPadrao.length)] || null;
				}
			} else {
				cartaObtida = conjuntoPorRaridade[Math.floor(Math.random() * conjuntoPorRaridade.length)] || null;
			}

			if (raridadeAtual === 'Mítico') {
				contadorPityMitico = 0;
				contadorPityLendario = 0;
			} else if (raridadeAtual === 'Lendário') {
				contadorPityMitico += 1;
				contadorPityLendario = 0;
			} else {
				contadorPityMitico += 1;
				contadorPityLendario += 1;
			}

			if (cartaObtida) {
				cartasObtidas.push(cartaObtida);
			}
		}

		if (tipoBanner === 'semanal') {
			definirPitySemanal5(contadorPityMitico);
			definirPitySemanal4(contadorPityLendario);
			definirCinquentaPorCentoPerdidoSemanal(perdeuGarantiaSemanal);
		} else {
			definirPityPadrao5(contadorPityMitico);
			definirPityPadrao4(contadorPityLendario);
		}

		return cartasObtidas;
	}

	async function invocar(tipoBanner, quantidade) {
		if (ocupado) return;
		const custo = quantidade === 10 ? custoDez : custoUnico;
		if (gemas < custo) return;
		definirOcupado(true);
		try {
			definirGemas((quantidadeAtual) => quantidadeAtual - custo);
			const cartasInvocadas = realizarInvocacoes(tipoBanner, quantidade);
			definirResultados(cartasInvocadas);
			definirMostrarResultados(true);
		} finally {
			definirOcupado(false);
		}
	}

		const CartaoDeBanner = ({ id, titulo, subtitulo, realce, destaque, probabilidades, pity5, pity4 }) => {
			const mapaDeRealce = {
				emerald: {
					borda: 'ring-emerald-400/40',
					botao: 'bg-emerald-600 hover:bg-emerald-700',
					chip: 'bg-emerald-600/30 text-emerald-200 border-emerald-500/40',
				},
				amber: {
					borda: 'ring-amber-400/40',
					botao: 'bg-amber-600 hover:bg-amber-700',
					chip: 'bg-amber-600/30 text-amber-200 border-amber-500/40',
				},
			};

			const temaSelecionado = mapaDeRealce[realce] || mapaDeRealce.amber;

			return (
				<div className={`relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm ring-1 ${temaSelecionado.borda} overflow-hidden`}>
					<div className="relative w-full h-[420px] md:h-[480px]">
						<Image
							src={
								(id === 'semanal'
									? destaque?.imagens?.cheia || destaque?.imagens?.retrato || destaque?.images?.full || destaque?.images?.portrait
									: destaque?.imagens?.retrato || destaque?.imagens?.cheia || destaque?.images?.portrait || destaque?.images?.full) ||
								'/images/placeholder.svg'
							} 
							alt={destaque?.nome || destaque?.name || 'Banner'}
							fill
							className="object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
						<div className="absolute top-3 left-3">
							<span className={`px-2 py-1 rounded text-[10px] border ${temaSelecionado.chip}`}>
								{id === 'semanal' ? 'ROTAÇÃO DA SEMANA' : 'INVOC. PADRÃO'}
							</span>
						</div>
						<div className="absolute bottom-3 left-3 right-3">
							<h3 className="text-xl font-extrabold leading-tight">{titulo}</h3>
							<p className="text-gray-300 text-xs">{subtitulo}</p>
							{id === 'semanal' && destaque && (
								<div className="text-xs text-yellow-300 mt-1">
									Em destaque: <span className="font-semibold">{destaque.nome || destaque.name}</span>
								</div>
							)}
						</div>
					</div>
					<div className="p-4 border-t border-white/10">
						<div className="text-[11px] text-gray-400 mb-2">
							Taxas: {probabilidades.map((probabilidade) => `${probabilidade.raridade}: ${probabilidade.p}%`).join(' • ')}
						</div>
						<div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
							<div>
								Pity Mítico: <span className="text-yellow-300 font-semibold">{pity5}/30</span>
							</div>
							<div>
								Pity Lendário: <span className="text-yellow-300 font-semibold">{pity4}/10</span>
							</div>
						</div>
						<div className="flex gap-3">
							<button
								disabled={ocupado || gemas < custoUnico}
								onClick={() => invocar(id, 1)}
								className={`flex-1 py-2 rounded-lg font-semibold ${temaSelecionado.botao} disabled:bg-gray-600 disabled:cursor-not-allowed`}
							>
								Invocar x1 (💎{custoUnico})
							</button>
							<button
								disabled={ocupado || gemas < custoDez}
								onClick={() => invocar(id, 10)}
								className={`flex-1 py-2 rounded-lg font-semibold ${temaSelecionado.botao} disabled:bg-gray-600 disabled:cursor-not-allowed`}
							>
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
						id="semanal"
						titulo="Rota da Semana • Mítico em destaque"
						subtitulo="Probabilidade aumentada para a carta Mítica da semana"
						realce="amber"
						destaque={destaqueSemanal}
						probabilidades={probabilidadesSemanais}
						pity5={pitySemanal5}
						pity4={pitySemanal4}
					/>
					<CartaoDeBanner
						id="padrao"
						titulo="Invocação Padrão"
						subtitulo="Sempre disponível, inclui Lendárias e Míticas (sem a limitada)"
						realce="emerald"
						destaque={null}
						probabilidades={probabilidadesPadrao}
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
				<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => definirMostrarResultados(false)}>
					<div className="bg-black/40 border border-white/10 rounded-2xl p-6 max-w-3xl w-full" onClick={(evento) => evento.stopPropagation()}>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-bold">Resultados</h3>
							<button onClick={() => definirMostrarResultados(false)} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600">Fechar</button>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
							{resultados.map((carta, indice) => (
								<div
									key={indice}
									className={`relative rounded-lg p-2 border ${temaDeRaridade[carta.raridade || carta.rarity] || 'border-gray-600 text-gray-300'} bg-black/30`}
								>
									<div className="relative w-full h-28 rounded overflow-hidden mb-2 border border-white/10">
										<Image
											src={carta.imagens?.retrato || carta.images?.portrait || '/images/placeholder.svg'}
											alt={carta.nome || carta.name}
											fill
											className="object-cover"
										/>
									</div>
									<div className="text-xs font-semibold line-clamp-2">{carta.nome || carta.name}</div>
									<div className="text-[10px] text-gray-400">{carta.raridade || carta.rarity}</div>
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

