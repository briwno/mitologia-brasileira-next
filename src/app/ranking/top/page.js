// src/app/ranking/top/page.js
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import LayoutDePagina from '@/components/UI/PageLayout';
import Icon from '@/components/UI/Icon';
import { calcularRankingPorMMR, obterIconeRanking, obterCorRanking } from '@/utils/mmrUtils';

function linhaTabelaClasse(posicao) {
	if (posicao === 1) return 'bg-yellow-500/10 border-yellow-400/40';
	if (posicao === 2) return 'bg-slate-200/10 border-slate-200/40';
	if (posicao === 3) return 'bg-amber-700/10 border-amber-500/40';
	return 'border-white/10 hover:border-emerald-400/40 hover:bg-emerald-500/5';
}

export default function PaginaTopJogadores() {
	const [ranking, definirRanking] = useState([]);
	const [carregando, definirCarregando] = useState(true);
	const [erro, definirErro] = useState(null);
	const [filtro, definirFiltro] = useState('global');

	useEffect(() => {
		let cancelado = false;
		async function carregarRanking() {
			try {
				definirCarregando(true);
				// Busca top 100 jogadores ordenados por MMR
				const resposta = await fetch('/api/players');
				if (!resposta.ok) {
					throw new Error('Não foi possível carregar o ranking');
				}
				const dados = await resposta.json();
				if (!cancelado) {
					// A API /api/players já retorna ordenado por MMR DESC
					definirRanking(dados.players || []);
				}
			} catch (erroCarregamento) {
				if (!cancelado) {
					console.error('Erro ao buscar ranking:', erroCarregamento);
					definirErro('Ocorreu um problema ao carregar o ranking. Tente novamente em instantes.');
				}
			} finally {
				if (!cancelado) {
					definirCarregando(false);
				}
			}
		}

		carregarRanking();
		return () => {
			cancelado = true;
		};
	}, [filtro]);

	const rankingFormatado = useMemo(() => {
		return ranking.map((registro, index) => {
			const mmr = registro.mmr || 0;
			const rank = calcularRankingPorMMR(mmr);
			const icone = obterIconeRanking(rank);
			const cor = obterCorRanking(rank);
			
			return {
				posicao: index + 1,
				nomeUsuario: registro.nickname || 'Anônimo',
				mmr: mmr,
				pontos: mmr,
				faixa: rank,
				icone: icone,
				cor: cor,
				taxaVitoria: registro.winRate || 0,
				regiao: registro.region || 'Nacional',
				level: registro.level || 1,
				avatarUrl: registro.avatar_url
			};
		});
	}, [ranking]);

	return (
		<LayoutDePagina>
			<div className="container mx-auto px-4 py-8">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500">
						🏆 Top Jogadores
					</h1>
					<p className="text-lg text-yellow-200/80">
						Os melhores jogadores da temporada ranqueados por MMR.
					</p>
				</div>

				{/* Navegação entre páginas de ranking */}
				<div className="flex items-center justify-center gap-2 mb-6">
					<Link
						href="/ranking/top"
						className="px-6 py-3 rounded-lg font-semibold bg-yellow-500 text-black"
					>
						<Icon name="trophy" size={18} className="inline mr-2" />
						Top Jogadores
					</Link>
					<Link
						href="/ranking/rewards"
						className="px-6 py-3 rounded-lg font-semibold bg-black/30 text-white/70 hover:text-white border border-white/10 transition-all"
					>
						<Icon name="gift" size={18} className="inline mr-2" />
						Recompensas
					</Link>
				</div>

				<div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-8">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div>
							<h2 className="text-xl font-semibold text-white">Visão Geral</h2>
							<p className="text-sm text-white/60">
								Rankings atualizados em tempo real com base em partidas ranqueadas.
							</p>
						</div>

						<div className="flex items-center gap-2">
							<label htmlFor="filtro" className="text-sm text-white/60">
								Escopo
							</label>
							<select
								id="filtro"
								value={filtro}
								onChange={(evento) => definirFiltro(evento.target.value)}
								className="bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
							>
								<option value="global">Global</option>
								<option value="regional">Regional</option>
								<option value="amigos">Lista de Amigos</option>
							</select>
						</div>
					</div>
				</div>

				<div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden">
					<div className="grid grid-cols-7 gap-4 px-6 py-3 bg-white/5 text-xs font-semibold text-white/70 uppercase tracking-wide">
						<span className="col-span-1">Posição</span>
						<span className="col-span-2">Jogador</span>
						<span className="col-span-1 text-right">MMR</span>
						<span className="col-span-2 text-center">Ranking</span>
						<span className="col-span-1 text-right">Taxa (%)</span>
					</div>

					{carregando ? (
						<div className="px-6 py-10 text-center text-white/60">Carregando ranking...</div>
					) : erro ? (
						<div className="px-6 py-10 text-center text-red-400">{erro}</div>
					) : rankingFormatado.length === 0 ? (
						<div className="px-6 py-10 text-center text-white/50">
							Nenhum jogador ranqueado encontrado para o filtro selecionado.
						</div>
					) : (
						<ul className="divide-y divide-white/5">
							{rankingFormatado.map((registro) => (
								<li
									key={`${registro.posicao}-${registro.nomeUsuario}`}
									className={`grid grid-cols-7 gap-4 px-6 py-4 border-l-4 ${linhaTabelaClasse(registro.posicao)}`}
								>
									<span className="col-span-1 font-bold text-white/90">#{registro.posicao}</span>
									<div className="col-span-2 flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
											{registro.avatarUrl ? (
												<Image
													src={registro.avatarUrl}
													alt={registro.nomeUsuario}
													width={40}
													height={40}
													className="w-full h-full object-cover"
												/>
											) : (
												<span>{registro.nomeUsuario.charAt(0).toUpperCase()}</span>
											)}
										</div>
										<div className="flex flex-col">
											<span className="font-semibold text-white">{registro.nomeUsuario}</span>
											<span className="text-xs text-white/50">Nv. {registro.level} • {registro.regiao}</span>
										</div>
									</div>
									<span className="col-span-1 text-right font-semibold text-blue-300">
										{registro.mmr}
									</span>
									<div className="col-span-2 flex items-center justify-center gap-2">
										<span className="text-lg">{registro.icone}</span>
										<span className={`text-sm font-semibold ${registro.cor}`}>{registro.faixa}</span>
									</div>
									<span className="col-span-1 text-right text-sm text-white/70">
										{registro.taxaVitoria}%
									</span>
								</li>
							))}
						</ul>
					)}
				</div>

				<div className="text-center mt-10 space-y-4">
					<p className="text-sm text-white/60">
						Jogue partidas ranqueadas para ganhar pontos, subir de faixa e desbloquear recompensas exclusivas.
					</p>
					<Link
						href="/"
						className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors font-semibold"
					>
						← Voltar ao menu principal
					</Link>
				</div>
			</div>
		</LayoutDePagina>
	);
}
