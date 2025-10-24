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
	EPIC: 'border-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.25)]',
	EPICO: 'border-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.25)]',
	LEGENDARY: 'border-amber-400/80 shadow-[0_0_24px_rgba(251,191,36,0.35)]',
	LENDARIO: 'border-amber-400/80 shadow-[0_0_24px_rgba(251,191,36,0.35)]',
	MYTHIC: 'border-rose-500/90 shadow-[0_0_28px_rgba(244,63,94,0.4)]',
	MITICO: 'border-rose-500/90 shadow-[0_0_28px_rgba(244,63,94,0.4)]',
};

// Tradução de raridades (inglês -> português)
const traduzirRaridade = (rarity) => {
	const mapa = {
		'MYTHIC': 'Mítico',
		'LEGENDARY': 'Lendário',
		'EPIC': 'Épico',
		'RARE': 'Raro',
		'UNCOMMON': 'Incomum',
		'COMMON': 'Comum',
		'MITICO': 'Mítico',
		'LENDARIO': 'Lendário',
		'EPICO': 'Épico',
		'RARO': 'Raro',
		'INCOMUM': 'Incomum',
		'COMUM': 'Comum',
	};
	return mapa[rarity?.toUpperCase()] || rarity;
};

// Cores das badges de raridade
const coresBadgeRaridade = (rarity) => {
	const key = rarity?.toUpperCase();
	if (key === 'MYTHIC' || key === 'MITICO') {
		return 'bg-rose-500/30 text-rose-300 border border-rose-500/50';
	}
	if (key === 'LEGENDARY' || key === 'LENDARIO') {
		return 'bg-amber-500/30 text-amber-300 border border-amber-500/50';
	}
	if (key === 'EPIC' || key === 'EPICO') {
		return 'bg-purple-500/30 text-purple-300 border border-purple-500/50';
	}
	if (key === 'RARE' || key === 'RARO') {
		return 'bg-blue-500/30 text-blue-300 border border-blue-500/50';
	}
	if (key === 'UNCOMMON' || key === 'INCOMUM') {
		return 'bg-green-500/30 text-green-300 border border-green-500/50';
	}
	return 'bg-gray-500/30 text-gray-300 border border-gray-500/50';
};

// Função para extrair URL da imagem de forma segura
const getImageUrl = (carta, tipo = 'lenda') => {
	if (!carta) return '/images/placeholder.svg';
	
	const images = carta.images || carta.imagens || {};
	
	// Log para debug
	console.log('[Shop] Processando imagem:', {
		nome: carta.name || carta.nome,
		tipo,
		images: JSON.stringify(images)
	});
	
	// Tentar diferentes campos de imagem
	const possiveisUrls = [
		images.retrato,
		images.portrait,
		images.completa,
		images.full,
		images.card,
	].filter(Boolean);
	
	if (possiveisUrls.length > 0) {
		return possiveisUrls[0];
	}
	
	return '/images/placeholder.svg';
};

export default function PaginaShopBoosters() {
	const { user, isAuthenticated } = useAuth();
	const [carregando, setCarregando] = useState(true);
	const [processando, setProcessando] = useState(false);
	const [erro, setErro] = useState(null);

	const [saldo, setSaldo] = useState(0);
	const [boostersDisponiveis, setBoostersDisponiveis] = useState(0);
	const [boosterInicialAberto, setBoosterInicialAberto] = useState(false);
	const [pityMitico, setPityMitico] = useState(0);
	const [avisoSistema, setAvisoSistema] = useState(null);

	const [resultadoAbertura, setResultadoAbertura] = useState(null);
	const [mostrarResultado, setMostrarResultado] = useState(false);

	const podeComprar = useMemo(() => {
		return saldo >= BOOSTER_CONFIG.PRECO_BOOSTER;
	}, [saldo]);

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
			
			setSaldo(json.coins || 0);
			setBoostersDisponiveis(json.boostersDisponiveis || 0);
			setBoosterInicialAberto(json.boosterInicialAberto || false);
			setPityMitico(json.pityMitico || 0);
			
			// Verificar se há aviso do sistema
			if (json.aviso) {
				setAvisoSistema(json.aviso);
			}
		} catch (e) {
			console.error('[Shop] load error', e);
			setErro(e.message);
		} finally {
			setCarregando(false);
		}
	}, [user?.id, isAuthenticated]);

	useEffect(() => { carregar(); }, [carregar]);

	// Comprar booster
	const comprar = async () => {
		if (!user?.id) return;
		setProcessando(true);
		setErro(null);
		try {
			const r = await fetch('/api/boosters', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ playerId: user.id, acao: 'comprar' }),
			});
			const json = await r.json();
			if (!r.ok) throw new Error(json.error || 'Falha ao comprar booster');
			
			setSaldo(json.novoSaldo);
			setBoostersDisponiveis(json.boostersDisponiveis);
		} catch (e) {
			setErro(e.message);
		} finally {
			setProcessando(false);
		}
	};

	// Abrir booster
	const abrir = async (boosterInicial = false) => {
		if (!user?.id) return;
		setProcessando(true);
		setErro(null);
		try {
			const r = await fetch('/api/boosters', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					playerId: user.id, 
					acao: 'abrir',
					boosterInicial,
				}),
			});
			const json = await r.json();
			if (!r.ok) throw new Error(json.error || 'Falha ao abrir booster');
			
			setResultadoAbertura({
				cartas: json.cartas,
				estatisticas: json.estatisticas,
			});
			setMostrarResultado(true);
			setPityMitico(json.novoPityMitico);
			setBoostersDisponiveis(json.boostersRestantes);
			if (boosterInicial) {
				setBoosterInicialAberto(true);
			}
		} catch (e) {
			setErro(e.message);
		} finally {
			setProcessando(false);
		}
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
					<p className="text-gray-300">Descubra novas lendas do folclore brasileiro</p>
					<p className="text-sm text-gray-400 mt-2">Cada booster contém 5 lendas (épicas, lendárias ou míticas)</p>
				</div>

				<div className="flex flex-wrap items-center justify-center gap-3 mb-6">
					<div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10">
						Saldo: <span className="font-semibold">🪙 {saldo}</span>
					</div>
					<div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10">
						Boosters: <span className="font-semibold">{boostersDisponiveis}</span>
					</div>
					<div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10">
						Pity: <span className="font-semibold text-rose-400">{pityMitico}/20</span>
					</div>
					{erro && <div className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200">{erro}</div>}
				</div>

				{/* Aviso do Sistema */}
				{avisoSistema && (
					<div className="max-w-4xl mx-auto mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
						<p className="text-yellow-300 font-semibold text-center">⚠️ {avisoSistema}</p>
						<p className="text-yellow-200 text-sm text-center mt-2">
							Consulte o arquivo <code className="bg-black/30 px-2 py-1 rounded">src/data/GUIA_CORRECAO_BOOSTERS.md</code> para instruções.
						</p>
					</div>
				)}

				{/* Booster Inicial Gratuito */}
				{!boosterInicialAberto && (
					<div className="max-w-2xl mx-auto mb-8 p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-400/50">
						<div className="text-center">
							<h2 className="text-2xl font-bold text-amber-300 mb-2">🎁 Booster Inicial Gratuito!</h2>
							<p className="text-gray-300 mb-4">Bem-vindo! Abra seu primeiro booster gratuitamente e comece sua coleção.</p>
							<button
								disabled={processando}
								onClick={() => abrir(true)}
								className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
							>
								Abrir Booster Inicial
							</button>
						</div>
					</div>
				)}

				{/* Sistema de Boosters */}
				<div className="max-w-2xl mx-auto">
					<div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-sm">
						<div className="relative w-full h-64">
							<Image src="/images/banners/menubatalha.png" alt="Booster" fill className="object-cover" />
							<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
							<div className="absolute top-3 left-3 text-[10px] px-2 py-1 rounded bg-emerald-500/20 border border-emerald-400/40">
								Booster Padrão
							</div>
							<div className="absolute bottom-3 left-3 right-3">
								<h3 className="text-xl font-extrabold">Pacote de Cartas</h3>
								<p className="text-gray-300 text-xs">5 lendas (épicas, lendárias ou míticas)</p>
							</div>
						</div>
						<div className="p-4 border-t border-white/10">
							<div className="flex items-center justify-between text-sm text-gray-300 mb-3">
								<span>5 cartas</span>
								<span className="font-semibold">🪙 {BOOSTER_CONFIG.PRECO_BOOSTER}</span>
							</div>
							<div className="grid grid-cols-2 gap-2">
								<button
									disabled={processando || !podeComprar}
									onClick={comprar}
									className="py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed font-semibold"
								>
									{podeComprar ? 'Comprar' : 'Moedas insuficientes'}
								</button>
								<button
									disabled={processando || boostersDisponiveis < 1}
									onClick={() => abrir(false)}
									className="py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed font-semibold"
								>
									Abrir Booster
								</button>
							</div>
							<div className="mt-3 p-3 rounded-lg bg-black/30 border border-white/5">
								<p className="text-xs text-gray-400 mb-1">
									<strong className="text-gray-300">Sistema de Pity:</strong> Garantia de carta mítica no 20º booster!
								</p>
								<p className="text-xs text-gray-400">
									Soft pity começa em 15 boosters. Todas as lendas são épicas ou superiores.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Info adicional */}
				<div className="max-w-4xl mx-auto mt-6 text-center text-xs text-gray-400">
					<p>As cartas podem vir repetidas e são adicionadas à sua coleção.</p>
					<p>As taxas seguem o sistema de pity e raridades definido no jogo.</p>
				</div>
			</div>

			{/* Modal de resultado da abertura */}
			{mostrarResultado && resultadoAbertura && (
				<div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setMostrarResultado(false)}>
					<div className="bg-gradient-to-b from-black/60 to-black/80 border border-amber-500/30 rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-rose-300">🎉 Cartas Obtidas</h3>
							<button onClick={() => setMostrarResultado(false)} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 font-semibold">Fechar</button>
						</div>

						{/* Layout: Todas as cartas são lendas agora */}
						<div className="flex flex-col items-center gap-6">
							{/* Todas as 5 cartas de lendas */}
							<div className="w-full">
								<p className="text-center text-amber-400 text-lg font-bold mb-4">⚡ Cartas Obtidas</p>
								<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
									{resultadoAbertura.cartas.map((lenda, i) => {
										const imagem = getImageUrl(lenda, 'lenda');
										const raridade = lenda.rarity || lenda.raridade || 'EPIC';
										const raridadeTraduzida = traduzirRaridade(raridade);
										return (
											<div key={`lenda-${i}`} className={`relative rounded-xl p-3 border-2 ${temaPorRaridade[raridade?.toUpperCase()] || temaPorRaridade['EPIC']} bg-black/40 hover:scale-105 transition-transform duration-300`}>
												<div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden mb-2 border-2 border-white/20">
													<Image 
														src={imagem}
														alt={lenda.name || lenda.nome || 'Lenda'} 
														fill 
														className="object-cover" 
														unoptimized
														onError={(e) => {
															console.error('[Shop] Erro ao carregar imagem da lenda:', imagem);
															e.currentTarget.src = '/images/placeholder.svg';
														}}
													/>
												</div>
												<div className="text-center">
													<h4 className="text-sm font-bold text-white mb-1 line-clamp-1">{lenda.name || lenda.nome}</h4>
													<div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${coresBadgeRaridade(raridade)}`}>
														{raridadeTraduzida}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>

						{/* Resumo das Raridades */}
						<div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/10">
							<p className="text-sm text-gray-300 mb-2 text-center font-semibold">📊 Resumo das Raridades</p>
							<div className="flex flex-wrap justify-center gap-2">
								{(resultadoAbertura.estatisticas.MITICO > 0 || resultadoAbertura.estatisticas.MYTHIC > 0) && (
									<div className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 text-sm font-semibold">
										✨ Mítico: {resultadoAbertura.estatisticas.MITICO || resultadoAbertura.estatisticas.MYTHIC || 0}
									</div>
								)}
								{(resultadoAbertura.estatisticas.LENDARIO > 0 || resultadoAbertura.estatisticas.LEGENDARY > 0) && (
									<div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-sm font-semibold">
										⭐ Lendário: {resultadoAbertura.estatisticas.LENDARIO || resultadoAbertura.estatisticas.LEGENDARY || 0}
									</div>
								)}
								{(resultadoAbertura.estatisticas.EPICO > 0 || resultadoAbertura.estatisticas.EPIC > 0) && (
									<div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/50 text-purple-300 text-sm font-semibold">
										💜 Épico: {resultadoAbertura.estatisticas.EPICO || resultadoAbertura.estatisticas.EPIC || 0}
									</div>
								)}
								{(resultadoAbertura.estatisticas.RARO > 0 || resultadoAbertura.estatisticas.RARE > 0) && (
									<div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-300 text-sm font-semibold">
										💎 Raro: {resultadoAbertura.estatisticas.RARO || resultadoAbertura.estatisticas.RARE || 0}
									</div>
								)}
								{(resultadoAbertura.estatisticas.INCOMUM > 0 || resultadoAbertura.estatisticas.UNCOMMON > 0) && (
									<div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50 text-green-300 text-sm font-semibold">
										🟢 Incomum: {resultadoAbertura.estatisticas.INCOMUM || resultadoAbertura.estatisticas.UNCOMMON || 0}
									</div>
								)}
								{(resultadoAbertura.estatisticas.COMUM > 0 || resultadoAbertura.estatisticas.COMMON > 0) && (
									<div className="px-3 py-1 rounded-full bg-gray-500/20 border border-gray-500/50 text-gray-300 text-sm font-semibold">
										⚪ Comum: {resultadoAbertura.estatisticas.COMUM || resultadoAbertura.estatisticas.COMMON || 0}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</LayoutDePagina>
	);
}

