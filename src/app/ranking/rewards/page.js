// src/app/ranking/rewards/page.js
"use client";

import Link from 'next/link';
import LayoutDePagina from '@/components/UI/PageLayout';
import Icon from '@/components/UI/Icon';

export default function PaginaRecompensas() {
	return (
		<LayoutDePagina>
			<div className="container mx-auto px-4 py-8">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500">
						🎁 Recompensas por Ranking
					</h1>
					<p className="text-lg text-yellow-200/80">
						Suba de rank e desbloqueie recompensas exclusivas
					</p>
				</div>

				{/* Navegação entre páginas de ranking */}
				<div className="flex items-center justify-center gap-2 mb-8">
					<Link
						href="/ranking/top"
						className="px-6 py-3 rounded-lg font-semibold bg-black/30 text-white/70 hover:text-white border border-white/10 transition-all"
					>
						<Icon name="trophy" size={18} className="inline mr-2" />
						Top Jogadores
					</Link>
					<Link
						href="/ranking/rewards"
						className="px-6 py-3 rounded-lg font-semibold bg-yellow-500 text-black"
					>
						<Icon name="gift" size={18} className="inline mr-2" />
						Recompensas
					</Link>
				</div>

				<div className="max-w-4xl mx-auto">
					{/* Linha do tempo vertical */}
					<div className="relative">
						{/* Linha vertical conectando os ranks */}
						<div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 via-purple-500 to-red-600"></div>

						{/* Lista de ranks com recompensas */}
						<div className="space-y-8">
							{/* Bronze */}
							<div className="flex items-start gap-6 relative">
								<div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 border-4 border-black flex items-center justify-center text-3xl z-10 shadow-lg">
									🥉
								</div>
								<div className="flex-1 bg-black/40 rounded-xl p-6 border border-amber-700/30">
									<h3 className="text-xl font-bold text-amber-600 mb-2">Bronze</h3>
									<p className="text-sm text-white/60 mb-4">MMR: 0 - 999</p>
									<div className="space-y-2">
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="coins" size={16} className="text-yellow-400" />
											<span>50 moedas por vitória</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="cards" size={16} className="text-blue-400" />
											<span>1 booster comum a cada 5 vitórias</span>
										</div>
									</div>
								</div>
							</div>

							{/* Prata */}
							<div className="flex items-start gap-6 relative">
								<div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 border-4 border-black flex items-center justify-center text-3xl z-10 shadow-lg">
									🥈
								</div>
								<div className="flex-1 bg-black/40 rounded-xl p-6 border border-slate-400/30">
									<h3 className="text-xl font-bold text-slate-300 mb-2">Prata</h3>
									<p className="text-sm text-white/60 mb-4">MMR: 1000 - 1199</p>
									<div className="space-y-2">
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="coins" size={16} className="text-yellow-400" />
											<span>75 moedas por vitória</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="cards" size={16} className="text-blue-400" />
											<span>1 booster incomum a cada 5 vitórias</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="star" size={16} className="text-purple-400" />
											<span>Título: &quot;Guerreiro de Prata&quot;</span>
										</div>
									</div>
								</div>
							</div>

							{/* Ouro */}
							<div className="flex items-start gap-6 relative">
								<div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-black flex items-center justify-center text-3xl z-10 shadow-lg">
									🥇
								</div>
								<div className="flex-1 bg-black/40 rounded-xl p-6 border border-yellow-400/30">
									<h3 className="text-xl font-bold text-yellow-400 mb-2">Ouro</h3>
									<p className="text-sm text-white/60 mb-4">MMR: 1200 - 1399</p>
									<div className="space-y-2">
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="coins" size={16} className="text-yellow-400" />
											<span>100 moedas por vitória</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="cards" size={16} className="text-blue-400" />
											<span>1 booster raro a cada 3 vitórias</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="star" size={16} className="text-purple-400" />
											<span>Título: &quot;Campeão Dourado&quot;</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="coins" size={16} className="text-yellow-400" />
											<span>500 moedas bônus semanal</span>
										</div>
									</div>
								</div>
							</div>

							{/* Platina */}
							<div className="flex items-start gap-6 relative">
								<div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-4 border-black flex items-center justify-center text-3xl z-10 shadow-lg">
									💎
								</div>
								<div className="flex-1 bg-black/40 rounded-xl p-6 border border-cyan-400/30">
									<h3 className="text-xl font-bold text-cyan-400 mb-2">Platina</h3>
									<p className="text-sm text-white/60 mb-4">MMR: 1400 - 1599</p>
									<div className="space-y-2">
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="coins" size={16} className="text-yellow-400" />
											<span>150 moedas por vitória</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="cards" size={16} className="text-blue-400" />
											<span>1 booster épico a cada 3 vitórias</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="star" size={16} className="text-purple-400" />
											<span>Título: &quot;Mestre das Lendas&quot;</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="coins" size={16} className="text-yellow-400" />
											<span>1000 moedas bônus semanal</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="profile" size={16} className="text-pink-400" />
											<span>Borda de avatar exclusiva</span>
										</div>
									</div>
								</div>
							</div>

							{/* Diamante */}
							<div className="flex items-start gap-6 relative">
								<div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-700 border-4 border-black flex items-center justify-center text-3xl z-10 shadow-lg">
									💠
								</div>
								<div className="flex-1 bg-black/40 rounded-xl p-6 border border-purple-400/30">
									<h3 className="text-xl font-bold text-purple-400 mb-2">Diamante</h3>
									<p className="text-sm text-white/60 mb-4">MMR: 1600 - 1799</p>
									<div className="space-y-2">
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="coins" size={16} className="text-yellow-400" />
											<span>200 moedas por vitória</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="cards" size={16} className="text-blue-400" />
											<span>1 booster lendário a cada 3 vitórias</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="star" size={16} className="text-purple-400" />
											<span>Título: &quot;Lenda Viva&quot;</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="coins" size={16} className="text-yellow-400" />
											<span>2000 moedas bônus semanal</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="profile" size={16} className="text-pink-400" />
											<span>Borda de avatar animada</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="trophy" size={16} className="text-orange-400" />
											<span>Acesso a torneios exclusivos</span>
										</div>
									</div>
								</div>
							</div>

							{/* Mestre */}
							<div className="flex items-start gap-6 relative">
								<div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-600 border-4 border-black flex items-center justify-center text-3xl z-10 shadow-[0_0_30px_rgba(239,68,68,0.6)]">
									👑
								</div>
								<div className="flex-1 bg-black/40 rounded-xl p-6 border border-red-500/30 shadow-lg shadow-red-500/20">
									<h3 className="text-xl font-bold text-red-400 mb-2">Mestre</h3>
									<p className="text-sm text-white/60 mb-4">MMR: 1800+</p>
									<div className="space-y-2">
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="coins" size={16} className="text-yellow-400" />
											<span>300 moedas por vitória</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="cards" size={16} className="text-blue-400" />
											<span>1 booster mítico a cada 2 vitórias</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="star" size={16} className="text-purple-400" />
											<span>Título: &quot;Guardião do Folclore&quot;</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="coins" size={16} className="text-yellow-400" />
											<span>5000 moedas bônus semanal</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="profile" size={16} className="text-pink-400" />
											<span>Borda de avatar lendária + efeitos especiais</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="trophy" size={16} className="text-orange-400" />
											<span>Nome destacado no ranking global</span>
										</div>
										<div className="flex items-center gap-2 text-white/80">
											<Icon name="gift" size={16} className="text-pink-400" />
											<span>Carta exclusiva de temporada</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="text-center mt-12">
						<p className="text-white/60 text-sm mb-4">
							As recompensas são distribuídas automaticamente ao atingir cada rank.
						</p>
					</div>
				</div>

				<div className="text-center mt-10 space-y-4">
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
