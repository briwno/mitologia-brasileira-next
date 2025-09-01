// src/app/divulgar/page.js
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

