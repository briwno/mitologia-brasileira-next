"use client";

import { useEffect, useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import LayoutDePagina from '@/components/UI/PageLayout';
import { useAuth } from '@/hooks/useAuth';
import { BOOSTER_CONFIG } from '@/utils/boosterSystem';

// Mapeia classes visuais por raridade
const temaPorRaridade = {
	COMUM: 'border-gray-600',
	INCOMUM: 'border-green-500/60',
	RARO: 'border-blue-500/60',
	EPICO: 'border-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.25)]',
	LENDARIO: 'border-amber-400/80 shadow-[0_0_24px_rgba(251,191,36,0.35)]',
	MITICO: 'border-rose-500/90 shadow-[0_0_28px_rgba(244,63,94,0.4)]',
};

// Imagens simples de "pacote" usando assets existentes (placeholders)
const pacoteArte = {
	PEQUENO: '/images/banners/menumuseu.png',
	MEDIO: '/images/banners/menuranking.png',
	GRANDE: '/images/banners/menubatalha.png',
};

export default function PaginaShopBoosters() {
	const { user, isAuthenticated } = useAuth();
	const [carregando, setCarregando] = useState(true);
	const [processando, setProcessando] = useState(false);
	const [erro, setErro] = useState(null);

	const [saldo, setSaldo] = useState(0); // players.coins

	const [boostersDisponiveis, setBoostersDisponiveis] = useState(0);
	const [pity, setPity] = useState({ epico: 0, lendario: 0, mitico: 0 });

	const [resultadoAbertura, setResultadoAbertura] = useState(null); // { cartas, estatisticas }
	const [mostrarResultado, setMostrarResultado] = useState(false);

	const podeComprar = useMemo(() => ({
		PEQUENO: saldo >= BOOSTER_CONFIG.PRECOS.PEQUENO,
		MEDIO: saldo >= BOOSTER_CONFIG.PRECOS.MEDIO,
		GRANDE: saldo >= BOOSTER_CONFIG.PRECOS.GRANDE,
	}), [saldo]);

		const carregar = useCallback(async () => {
		if (!user?.id || !isAuthenticated()) {
			setCarregando(false);
			return;
		}
		setCarregando(true);
		setErro(null);
		try {
			const r = await fetch(`/api/boosters?playerId=${user.id}`);
			const json = await r.json();
			if (!r.ok) throw new Error(json.error || 'Falha ao carregar dados do shop');
			// API retorna apenas { coins }
			setSaldo(json.coins || 0);
			setBoostersDisponiveis(0); // Temporário até implementar sistema completo
			setPity({ epico: 0, lendario: 0, mitico: 0 }); // Temporário
		} catch (e) {
			console.error('[Shop] load error', e);
			setErro(e.message);
		} finally {
			setCarregando(false);
		}
		}, [user?.id, isAuthenticated]);

		useEffect(() => { carregar(); }, [carregar]);

	// Comprar booster
	const comprar = async (tamanho) => {
		if (!user?.id) return;
		setProcessando(true);
		setErro(null);
		try {
			// TODO: Implementar sistema de compra de boosters
			setErro('Sistema de compra em desenvolvimento');
		} catch (e) {
			setErro(e.message);
		} finally {
			setProcessando(false);
		}
	};

	// Abrir booster (consome 1 do contador, tamanho define qtd de cartas)
	const abrir = async (tamanho) => {
		if (!user?.id) return;
		setProcessando(true);
		setErro(null);
		try {
			// TODO: Implementar sistema de abertura de boosters
			setErro('Sistema de abertura em desenvolvimento');
		} catch (e) {
			setErro(e.message);
		} finally {
			setProcessando(false);
		}
	};

	const BoosterCard = ({ tipo, titulo, descricao }) => {
		const preco = BOOSTER_CONFIG.PRECOS[tipo];
		const tamanho = BOOSTER_CONFIG.TAMANHOS[tipo];
		const pode = podeComprar[tipo];
		return (
			<div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-sm">
				<div className="relative w-full h-64">
					<Image src={pacoteArte[tipo]} alt={`Booster ${tipo}`} fill className="object-cover" />
					<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
					<div className="absolute top-3 left-3 text-[10px] px-2 py-1 rounded bg-emerald-500/20 border border-emerald-400/40">Pacote {tipo.toLowerCase()}</div>
					<div className="absolute bottom-3 left-3 right-3">
						<h3 className="text-xl font-extrabold">{titulo}</h3>
						<p className="text-gray-300 text-xs">{descricao}</p>
					</div>
				</div>
				<div className="p-4 border-t border-white/10">
					<div className="flex items-center justify-between text-sm text-gray-300 mb-3">
						<span>{tamanho} cartas</span>
						<span className="font-semibold">🪙 {preco}</span>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<button
							disabled={processando || !pode}
							onClick={() => comprar(tipo)}
							className="py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed font-semibold"
						>Comprar</button>
						<button
							disabled={processando || boostersDisponiveis < 1}
							onClick={() => abrir(tipo)}
							className="py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed font-semibold"
						>Abrir</button>
					</div>
					<div className="mt-2 text-[11px] text-gray-400">Pity: Épico {pity.epico || 0} • Lendário {pity.lendario || 0} • Mítico {pity.mitico || 0}</div>
				</div>
			</div>
		);
	};

	if (!isAuthenticated()) {
		return (
			<LayoutDePagina>
				<div className="container mx-auto px-4 py-12">
					<div className="mx-auto max-w-xl text-center">
						<h1 className="text-3xl font-bold mb-2">Loja de Boosters</h1>
						<p className="text-gray-300 mb-6">Faça login para comprar e abrir boosters.</p>
						<a href="/login" className="inline-block px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 font-semibold">Entrar</a>
					</div>
				</div>
			</LayoutDePagina>
		);
	}

	if (carregando) {
		return (
			<LayoutDePagina>
				<div className="container mx-auto px-4 py-12 text-center">
					<div className="inline-block w-8 h-8 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
				</div>
			</LayoutDePagina>
		);
	}

	return (
		<LayoutDePagina>
			<div className="container mx-auto px-4 py-8">
				<div className="text-center mb-6">
					<h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">Loja de Boosters</h1>
					<p className="text-gray-300">Compre pacotes e descubra novas lendas do folclore</p>
				</div>

				<div className="flex flex-wrap items-center justify-center gap-3 mb-6">
					<div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10">Saldo: <span className="font-semibold">🪙 {saldo}</span></div>
					<div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10">Boosters: <span className="font-semibold">{boostersDisponiveis}</span></div>
					{erro && <div className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200">{erro}</div>}
				</div>

				{/* Aviso de desenvolvimento */}
				<div className="max-w-4xl mx-auto mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-center">
					<p className="text-yellow-300 font-semibold">⚠️ Sistema de Boosters em Desenvolvimento</p>
					<p className="text-yellow-200 text-sm">As funcionalidades de compra e abertura de pacotes serão implementadas em breve!</p>
				</div>

				{/* Deck de boosters (3 tamanhos) */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
					<BoosterCard tipo="PEQUENO" titulo="Pacote Pequeno" descricao="Entrada rápida — chances equilibradas" />
					<BoosterCard tipo="MEDIO" titulo="Pacote Médio" descricao="Melhor custo-benefício" />
					<BoosterCard tipo="GRANDE" titulo="Pacote Grande" descricao="Para caçadores de raridades" />
				</div>

				{/* Observação */}
				<div className="max-w-4xl mx-auto mt-6 text-center text-xs text-gray-400">
					Um booster consumido permite abrir qualquer tamanho; escolha sabiamente. As taxas seguem o sistema de pity e raridades definido no jogo.
				</div>
			</div>

			{/* Modal de resultado da abertura */}
			{mostrarResultado && resultadoAbertura && (
				<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setMostrarResultado(false)}>
					<div className="bg-black/40 border border-white/10 rounded-2xl p-6 max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-bold">Cartas Obtidas</h3>
							<button onClick={() => setMostrarResultado(false)} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600">Fechar</button>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
							{resultadoAbertura.cartas.map((c, i) => (
								<div key={i} className={`relative rounded-lg p-2 border ${temaPorRaridade[c.raridadeSorteada] || 'border-gray-600'} bg-black/30`}>
									<div className="relative w-full h-32 rounded overflow-hidden mb-2 border border-white/10">
										<Image src={(c.imagens?.retrato || c.images?.portrait || '/images/placeholder.svg')} alt={c.nome || c.name} fill className="object-cover" />
									</div>
									<div className="text-xs font-semibold line-clamp-2">{c.nome || c.name}</div>
									<div className="text-[10px] text-gray-400">{c.raridadeSorteada}</div>
								</div>
							))}
						</div>
						<div className="mt-4 text-right text-sm text-gray-400">Resumo: EP {resultadoAbertura.estatisticas?.EPICO || 0} • LD {resultadoAbertura.estatisticas?.LENDARIO || 0} • MT {resultadoAbertura.estatisticas?.MITICO || 0}</div>
					</div>
				</div>
			)}
		</LayoutDePagina>
	);
}

