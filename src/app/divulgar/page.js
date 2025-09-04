/* eslint-disable @next/next/no-html-link-for-pages */
// src/app/divulgar/page.js

/**
 * COMO ATUALIZAR PATCH NOTES:
 * 1. Adicione uma nova entrada no início do array 'patchNotes'
 * 2. Use o formato: { version, date, icon, color, changes: [] }
 * 3. Cores disponíveis: 'cyan', 'green', 'purple', 'orange'
 * 4. A primeira entrada sempre terá a badge "Atual"
 */

import Image from 'next/image';

export const metadata = {
	title: "Ka’aguy — Descubra e Compartilhe",
	description:
		"Ka’aguy é um jogo de cartas colecionáveis inspirado nas lendas brasileiras. Monte seu deck, desafie amigos e explore regiões místicas.",
	openGraph: {
		title: "Ka’aguy — Jogo de Cartas",
		description:
			"Monte seu deck com Encantados como Saci, Iara e Curupira. Batalhas rápidas, coleção, museu e modos PvP.",
		url: 'https://mitologia-brasileira.example.com/divulgar',
		type: 'website',
		images: [
			{
				url: '/images/banners/menubatalha.png',
				width: 1200,
				height: 630,
				alt: "Ka’aguy — Batalhas entre Encantados",
			},
		],
	},
};

export default function DivulgarPage() {
	// Patch notes - fácil de atualizar
	const patchNotes = [
		{
			version: '0.8.2',
			date: 'Setembro 2025',
			icon: '✨',
			color: 'cyan',
			changes: [
				'Novo sistema de ranking competitivo',
				'Adicionadas 5 novas cartas da região Sul',
				'Melhorias na interface do museu',
				'Correções de bugs no modo PvP',
				'Otimizações de performance'
			]
		},
		{
			version: '0.8.1',
			date: 'Agosto 2025',
			icon: '🎮',
			color: 'green',
			changes: [
				'Nova região: Pantanal com 8 cartas exclusivas',
				'Sistema de conquistas implementado',
				'Modo tutorial interativo',
				'Balanceamento de cartas da Amazônia'
			]
		},
		{
			version: '0.8.0',
			date: 'Julho 2025',
			icon: '🚀',
			color: 'purple',
			changes: [
				'Lançamento do modo PvP ranqueado',
				'Interface completamente redesenhada',
				'Sistema de coleção aprimorado',
				'Primeira versão do museu interativo',
				'Implementação do sistema de moedas'
			]
		}
	];

	const getColorClasses = (color) => {
		const colors = {
			cyan: 'border-cyan-500/30 text-cyan-400',
			green: 'border-green-500/30 text-green-400',
			purple: 'border-purple-500/30 text-purple-400',
			orange: 'border-orange-500/30 text-orange-400'
		};
		return colors[color] || colors.cyan;
	};

	return (
		<main className="min-h-screen bg-gradient-to-b from-[#0a131d] via-[#0b1c2c] to-[#0a131d] text-white">
			{/* Hero */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 opacity-20">
					<Image
						src="/images/banners/menumuseu.png"
						alt="Ka’aguy — Museu das Lendas"
						fill
						className="object-cover"
						priority
					/>
				</div>
				<div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-28">
					<h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Ka’aguy</h1>
					<p className="mt-4 text-neutral-200 max-w-2xl">
						Um jogo de cartas com Encantados, regiões e lendas do nosso folclore. Acompanhe novidades, artes e eventos nas nossas redes.
					</p>
					<div className="mt-6">
						<a
							href="https://www.instagram.com/mitologia.brasileira.jogo/"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold border border-pink-400 shadow transition"
						>
							📸 Ka’aguy no Instagram
						</a>
					</div>
				</div>
			</section>

						{/* Sobre o jogo */}
						<section className="max-w-6xl mx-auto px-6 py-10">
							<div className="grid md:grid-cols-2 gap-8 items-start">
								<div>
									<h2 className="text-2xl font-extrabold">Sobre o Ka’aguy</h2>
									<p className="mt-3 text-neutral-200 leading-relaxed">
										Ka’aguy é um jogo de cartas colecionáveis inspirado no nosso folclore. Reúna Encantados icônicos,
										explore regiões como Amazônia e Pantanal e batalhe em partidas rápidas e estratégicas.
									</p>
									<ul className="mt-4 space-y-2 text-neutral-200 list-disc list-inside">
										<li>Encantados com habilidades únicas (Saci, Iara, Curupira e mais)</li>
										<li>Modos de jogo com PvP e desafios especiais</li>
										<li>Eventos sazonais que afetam o campo e as cartas</li>
										<li>Museu com histórias e curiosidades das lendas</li>
									</ul>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div className="relative h-36 rounded-xl overflow-hidden bg-black/40">
										<Image src="/images/cards/portraits/saci.jpg" alt="" fill aria-hidden className="object-cover blur-sm scale-110 opacity-40" />
										<Image src="/images/cards/portraits/saci.jpg" alt="Ka’aguy — Saci" fill className="object-contain" />
									</div>
									<div className="relative h-36 rounded-xl overflow-hidden bg-black/40">
										<Image src="/images/cards/portraits/iara.jpg" alt="" fill aria-hidden className="object-cover blur-sm scale-110 opacity-40" />
										<Image src="/images/cards/portraits/iara.jpg" alt="Ka’aguy — Iara" fill className="object-contain" />
									</div>
									<div className="relative h-36 rounded-xl overflow-hidden bg-black/40">
										<Image src="/images/cards/portraits/curupira.jpg" alt="" fill aria-hidden className="object-cover blur-sm scale-110 opacity-40" />
										<Image src="/images/cards/portraits/curupira.jpg" alt="Ka’aguy — Curupira" fill className="object-contain" />
									</div>
									<div className="relative h-36 rounded-xl overflow-hidden bg-black/40">
										<Image src="/images/banners/menubatalha.png" alt="" fill aria-hidden className="object-cover blur-sm scale-110 opacity-40" />
										<Image src="/images/banners/menubatalha.png" alt="Ka’aguy — Batalhas" fill className="object-contain" />
									</div>
								</div>
							</div>
						</section>

						{/* Destaques */}
						<section className="max-w-6xl mx-auto px-6 pb-6 grid md:grid-cols-3 gap-6">
							{[
								{
									title: 'Colecione Encantados',
									desc: 'Descubra lendas do Brasil com arte própria e efeitos especiais.',
									img: '/images/cards/portraits/boitata.jpg',
								},
								{
									title: 'Batalhas Rápidas',
									desc: 'Partidas dinâmicas com habilidades e campos que mudam o ritmo.',
									img: '/images/banners/menubatalha.png',
								},
								{
									title: 'Explore Regiões',
									desc: 'Amazônia, Pantanal, Sertão e mais — cada uma com sua própria identidade.',
									img: '/images/banners/menumuseu.png',
								},
							].map((f) => (
								<div key={f.title} className="bg-black/30 rounded-2xl overflow-hidden">
									<div className="relative h-40 bg-black/40">
										<Image src={f.img} alt="" fill aria-hidden className="object-cover blur-sm scale-110 opacity-40" />
										<Image src={f.img} alt={f.title} fill className="object-contain" />
									</div>
									<div className="p-5">
										<h3 className="text-lg font-bold">{f.title}</h3>
										<p className="text-sm text-neutral-300 mt-1">{f.desc}</p>
									</div>
								</div>
							))}
						</section>

						{/* Botão Jogar Bem Grande */}
						<section className="flex justify-center py-16">
							<a
								href="/"
								className="group relative inline-flex items-center justify-center px-16 py-8 text-4xl font-extrabold text-white bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 rounded-3xl shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-green-500/40 border-2 border-green-500/50 backdrop-blur-sm"
							>
								{/* Efeito de brilho sutil */}
								<div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
								
								{/* Conteúdo do botão */}
								<div className="relative flex items-center gap-4">
									<span className="text-5xl">🌿</span>
									<div className="flex flex-col items-start">
										<span className="text-4xl leading-none">Adentrar</span>
										<span className="text-2xl text-green-200 font-normal">Ka&apos;aguy</span>
									</div>
								</div>
								
								{/* Partículas decorativas */}
								<div className="absolute -inset-2 rounded-3xl opacity-30 bg-gradient-to-r from-green-600/20 to-emerald-600/20 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
							</a>
						</section>

						{/* Patch Notes */}
						<section className="max-w-6xl mx-auto px-6 py-16">
							<div className="text-center mb-12">
								<h2 className="text-3xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
									📝 Histórico de Atualizações
								</h2>
								<p className="text-neutral-300 max-w-2xl mx-auto">
									Acompanhe todas as novidades e melhorias do Ka&apos;aguy
								</p>
							</div>
							
							<div className="space-y-8">
								{patchNotes.map((patch, index) => (
									<div
										key={patch.version}
										className={`bg-black/30 backdrop-blur-sm rounded-2xl p-8 border ${getColorClasses(patch.color).split(' ')[0]}`}
									>
										<div className="flex items-center gap-4 mb-6">
											<div className={`w-14 h-14 bg-gradient-to-br from-${patch.color}-400 to-${patch.color}-600 rounded-xl flex items-center justify-center`}>
												<span className="text-2xl">{patch.icon}</span>
											</div>
											<div>
												<h3 className={`text-2xl font-bold ${getColorClasses(patch.color).split(' ')[1]}`}>
													Versão {patch.version}
												</h3>
												<p className="text-neutral-400">{patch.date}</p>
											</div>
											{index === 0 && (
												<div className="ml-auto">
													<span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm font-semibold">
														Atual
													</span>
												</div>
											)}
										</div>
										
										<div className="grid md:grid-cols-2 gap-4">
											{patch.changes.map((change, changeIndex) => (
												<div key={changeIndex} className="flex items-start gap-3">
													<span className={`${getColorClasses(patch.color).split(' ')[1]} mt-1`}>•</span>
													<span className="text-neutral-300">{change}</span>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</section>

						{/* Seção de Contato */}
						<section className="max-w-6xl mx-auto px-6 py-16">
							<div className="text-center mb-12">
								<h2 className="text-3xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
									💬 Entre em Contato
								</h2>
								<p className="text-neutral-300 max-w-2xl mx-auto">
									Tem sugestões, encontrou bugs ou quer colaborar? Estamos sempre abertos ao diálogo!
								</p>
							</div>

							<div className="grid md:grid-cols-3 gap-8">
								{/* Discord */}
								<div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-indigo-500/30 text-center">
									<div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
										<span className="text-3xl">💬</span>
									</div>
									<h3 className="text-xl font-bold text-indigo-400 mb-3">Discord</h3>
									<p className="text-neutral-300 text-sm mb-6">
										Junte-se à nossa comunidade para discussões, dicas e torneios
									</p>
									<a
										href="#"
										className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
									>
										Entrar no Discord
									</a>
								</div>

								{/* Email */}
								<div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/30 text-center">
									<div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
										<span className="text-3xl">📧</span>
									</div>
									<h3 className="text-xl font-bold text-orange-400 mb-3">Email</h3>
									<p className="text-neutral-300 text-sm mb-6">
										Para parcerias, feedback ou suporte técnico
									</p>
									<a
										href="mailto:contato@kaaguy.com.br"
										className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors"
									>
										Enviar Email
									</a>
								</div>

								{/* GitHub */}
								<div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-500/30 text-center">
									<div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
										<span className="text-3xl">⚙️</span>
									</div>
									<h3 className="text-xl font-bold text-gray-400 mb-3">Contribuir</h3>
									<p className="text-neutral-300 text-sm mb-6">
										Ka&apos;aguy é open-source! Contribua com código ou reporte bugs
									</p>
									<a
										href="#"
										className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
									>
										Ver no GitHub
									</a>
								</div>
							</div>
						</section>

						{/* Galeria */}
						<section className="max-w-6xl mx-auto px-6 pb-14">
							<h2 className="text-xl font-extrabold mb-4">Galeria</h2>
							<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{[
									'/images/banners/menubatalha.png',
									'/images/banners/menuranking.png',
									'/images/banners/menumuseu.png',
									'/images/banners/menuperfil.png',
									'/images/cards/portraits/encourado.jpg',
									'/images/cards/portraits/cuca.jpg',
								].map((src, i) => (
									<div key={i} className="relative h-44 bg-black/30 rounded-xl overflow-hidden">
										<Image src={src} alt="" fill aria-hidden className="object-cover blur-sm scale-110 opacity-40" />
										<Image src={src} alt={`Ka’aguy — Galeria ${i + 1}`} fill className="object-contain" />
									</div>
								))}
							</div>
						</section>

		</main>
	);
}

