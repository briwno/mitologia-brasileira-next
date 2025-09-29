"use client";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import Icon from "@/components/UI/Icon";

const SECTIONS = [
  { id: 'hero', label: 'Início' },
  { id: 'classes', label: 'Encantados' },
  { id: 'regioes', label: 'Regiões' },
  { id: 'modo', label: 'Modo' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'download', label: 'Download' }
];

const sampleEncantados = [
  { name: 'Saci', img: '/images/cards/portraits/saci.jpg', role: 'O Travesso' },
  { name: 'Iara', img: '/images/cards/portraits/iara.jpg', role: 'A Rainha das Águas' },
  { name: 'Curupira', img: '/images/cards/portraits/curupira.jpg', role: 'O Guardião da Floresta' },
  { name: 'Boitatá', img: '/images/cards/portraits/boitata.jpg', role: 'A Serpente de Fogo' },
  { name: 'Cuca', img: '/images/cards/portraits/cuca.jpg', role: 'A Feiticeira' },
  { name: 'Boto', img: '/images/cards/portraits/boto.jpg', role: 'O Encantador de Mulheres' },
];

const regioes = [
  { name: 'Amazônia', img: '/images/banners/menumuseu.png', desc: 'Selva densa, mana de vida e venenos.' },
  { name: 'Nordeste', img: '/images/banners/menuranking.png', desc: 'Calor e persistência. Buffs de resistência.' },
  { name: 'Centro-Oeste', img: '/images/banners/menuperfil.png', desc: 'Planícies místicas e equilíbrio.' },
];

const roadmap = [
  { phase: 'Pré-Alfa', status: 'concluído', items: ['Protótipo de cartas', 'Sistema básico de turnos'] },
  { phase: 'Alfa', status: 'ativo', items: ['PvP inicial', 'Museu de Lendas', 'Coleção & Decks'] },
  { phase: 'Beta', status: 'futuro', items: ['Progressão de ranking', 'Eventos Sazonais', 'Mobile otimizado'] },
];

export default function DivulgarPage() {
  const [active, setActive] = useState('hero');
  const observerRef = useRef(null);

  useEffect(() => {
    const options = { root: null, rootMargin: '0px', threshold: 0.5 };
    const cb = (entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    };
    observerRef.current = new IntersectionObserver(cb, options);
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observerRef.current.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <main className="relative text-white">
      {/* Side Nav Dots */}
      <nav className="hidden md:flex flex-col gap-3 wwafixed left-4 top-1/2 -translate-y-1/2 z-40">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })} aria-label={s.label}
            className={`w-4 h-4 rounded-full border transition ${active===s.id? 'bg-emerald-400 border-emerald-300 scale-110':'border-white/40 hover:border-white/70'}`}></button>
        ))}
      </nav>

      {/* Social Bar */}
      <div className="hidden md:flex flex-col gap-4 fixed right-6 top-1/2 -translate-y-1/2 z-40 text-white/70">
        <a href="https://www.instagram.com/kaaguygame/" target="_blank" className="hover:text-white transition"><Icon name="instagram" /></a>
        <a href="https://github.com/briwno" target="_blank" className="hover:text-white transition"><Icon name="github" /></a>
      </div>

      {/* Sections Container */}
      <div className="snap-y snap-mandatory h-screen overflow-y-scroll overflow-x-hidden no-scrollbar scroll-smooth bg-[#0a121a]">
        {/* Hero Section */}
        <section id="hero" className="relative h-screen w-full flex items-center justify-center snap-start">
          <div className="absolute inset-0">
            <Image src="/images/banners/menubatalha.png" alt="Hero BG" fill className="object-cover opacity-40" priority />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
          </div>
          <div className="relative max-w-4xl text-center px-6">
            <div className="mx-auto mb-8 w-[260px] md:w-[340px] select-none">
              <Image src="/logo.svg" alt="Ka’aguy" width={340} height={120} priority className="w-full h-auto drop-shadow-[0_0_12px_rgba(16,255,200,0.25)]" />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-400 text-transparent bg-clip-text sr-only">Ka’aguy</h1>
            <p className="mt-6 text-lg md:text-xl text-white/80">Lendas brasileiras ganham vida em batalhas estratégicas de cartas. Construa seu deck. Domine as regiões. Torne-se uma lenda.</p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <button disabled className="px-10 py-4 rounded-xl font-bold bg-gradient-to-br from-gray-600 to-gray-800 border border-white/20 cursor-not-allowed text-white/80">Disponível em breve</button>
              <a href="https://www.instagram.com/kaaguygame/" target="_blank" className="px-10 py-4 rounded-xl font-bold bg-gradient-to-br from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 transition shadow-lg">Seguir Atualizações</a>
            </div>
          </div>
        </section>

        {/* Encantados */}
        <section id="encantados" className="relative h-screen snap-start flex flex-col">
          <div className="absolute inset-0">
            <Image src="/images/banners/menumuseu.png" alt="BG" fill className="object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
          </div>
          <div className="relative flex flex-col items-center justify-center px-6">
            <h2 className="text-4xl font-extrabold mb-8">Encantados</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 w-full max-w-5xl pb-4">
              {sampleEncantados.map(e => (
                <div key={e.name} className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm p-2 flex flex-col items-center text-center hover:border-emerald-400/60 transition max-w-[280px]">
                  <div className="relative w-full rounded-xl overflow-hidden h-[clamp(180px,28vh,300px)]">
                    <Image src={e.img} alt={e.name} fill className="object-cover group-hover:scale-100 transition duration-500" />
                  </div>
                  <div className="mt-3">
                    <h3 className="font-semibold tracking-wide">{e.name}</h3>
                    <p className="text-xs text-white/60">{e.role}</p>
                  </div>
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition bg-gradient-to-b from-transparent via-emerald-400/10 to-emerald-500/20" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Regiões */}
        <section id="regioes" className="relative h-screen snap-start flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-b from-[#061016] via-[#0a1c25] to-[#061016]" />
          <div className="relative flex-1 max-w-6xl w-full mx-auto flex flex-col justify-center px-6">
            <h2 className="text-4xl font-extrabold mb-10">Regiões</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {regioes.map(r => (
                <div key={r.name} className="relative group rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-sm">
                  <Image src={r.img} alt={r.name} fill className="object-cover opacity-40 group-hover:opacity-60 transition" />
                  <div className="relative p-6 flex flex-col h-full">
                    <h3 className="text-xl font-bold mb-2">{r.name}</h3>
                    <p className="text-sm text-white/70 leading-relaxed">{r.desc}</p>
                    <div className="mt-auto pt-4 text-xs text-emerald-300/70">Bonus temáticos em desenvolvimento</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Modo de Jogo */}
        <section id="modo" className="relative h-screen snap-start flex flex-col">
          <div className="absolute inset-0">
            <Image src="/images/banners/menuranking.png" alt="Modo" fill className="object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
          </div>
          <div className="relative flex-1 flex flex-col items-center justify-center px-6 max-w-5xl mx-auto">
            <h2 className="text-4xl font-extrabold mb-6">Modo de Jogo</h2>
            <p className="text-lg text-white/80 max-w-3xl text-center">Partidas táticas em turnos onde posicionamento, timing de habilidades e sinergias regionais definem a vitória. Planeje combos, utilize bônus sazonais e surpreenda adversários.</p>
            <div className="mt-10 grid sm:grid-cols-3 gap-6 w-full">
              {['Deck Building', 'PvP Rápido', 'Eventos'].map(f => (
                <div key={f} className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
                  <h3 className="font-semibold mb-2 text-emerald-300">{f}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">Experiência em evolução</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* cronograma */}
        <section id="cronograma" className="relative h-screen snap-start flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-b from-[#091520] via-[#0d1e2b] to-[#081118]" />
          <div className="relative flex-1 max-w-5xl w-full mx-auto px-6 flex flex-col justify-center">
            <h2 className="text-4xl font-extrabold mb-10">Cronograma</h2>
            <div className="space-y-6">
              {roadmap.map(stage => (
                <div key={stage.phase} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-2xl font-bold">{stage.phase}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${stage.status==='concluído'?'bg-emerald-600/30 text-emerald-300': stage.status==='ativo'?'bg-cyan-600/30 text-cyan-300':'bg-yellow-600/30 text-yellow-300'}`}>{stage.status}</span>
                  </div>
                  <ul className="grid sm:grid-cols-3 gap-3 text-sm text-white/70">
                    {stage.items.map(it => <li key={it} className="flex items-start gap-2"><span className="text-emerald-400">•</span><span>{it}</span></li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* pré-registro */}
        <section id="pre-registro" className="relative h-screen snap-start flex flex-col items-center justify-center">
          <div className="absolute inset-0">
            <Image src="/images/banners/menuperfil.png" alt="CTA" fill className="object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90" />
          </div>
          <div className="relative text-center px-6 max-w-3xl">
            <h2 className="text-5xl font-extrabold bg-gradient-to-r from-emerald-300 via-cyan-200 to-emerald-400 text-transparent bg-clip-text mb-6">Junte-se à Floresta</h2>
            <p className="text-white/75 text-lg mb-10">Entre na lista para receber novidades, ver artes exclusivas e ser avisado quando o teste fechado abrir.</p>
            <form onSubmit={(e)=>{e.preventDefault(); alert('Em breve');}} className="flex flex-col sm:flex-row gap-4 justify-center">
              <input type="email" required placeholder="seu@email.com" className="px-5 py-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:border-emerald-400 placeholder-white/40 text-sm w-full sm:w-80" />
              <button className="px-8 py-4 rounded-xl font-bold bg-gradient-to-br from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 transition shadow-lg">Quero Receber</button>
            </form>
            <div className="mt-10 flex items-center justify-center gap-6 text-white/60 text-sm">
              <span>Next.js</span><span>Supabase</span><span>TailwindCSS</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
