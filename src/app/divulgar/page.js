/* eslint-disable @next/next/no-html-link-for-pages */
// src/app/divulgar/page.js

/**
 * COMO ATUALIZAR PATCH NOTES:
 * 1. Adicione uma               <Image
                <Image
                src="/images/cards/portraits/mula.jpg"
                alt=""
                fill
                aria-hidden
                className="object-cover blur-sm scale-110 opacity-40"
              />
              <Image
                src="/images/cards/portraits/mula.jpg"
                alt="Ka'aguy — Mula Sem Cabeça"    src="/images/cards/portraits/curupira.jpg"
                alt=""
                fill
                aria-hidden
                className="object-cover blur-sm scale-110 opacity-40"
              />
              <Image
                src="/images/cards/portraits/curupira.jpg"
                alt="Ka'aguy — Curupira"da no início do array 'patchNotes'
 * 2. Use o formato: { version, date, icon, color, changes: [] }
 * 3. Cores disponíveis: 'cyan', 'green', 'purple', 'orange'
 * 4. A primeira entrada sempre terá a badge "Atual"
 */

import Image from "next/image";
import Icon from "@/components/UI/Icon";

export const metadata = {
  title: "Ka’aguy — Descubra e Compartilhe",
  description:
    "Ka’aguy é um jogo de cartas colecionáveis inspirado nas lendas brasileiras. Monte seu deck, desafie amigos e explore regiões místicas.",
  openGraph: {
    title: "Ka’aguy — Jogo de Cartas",
    description:
      "Monte seu deck com Encantados como Saci, Iara e Curupira. Batalhas rápidas, coleção, museu e modos PvP.",
    url: "https://mitologia-brasileira.example.com/divulgar",
    type: "website",
    images: [
      {
        url: "/images/banners/menubatalha.png",
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
      version: "0.1.0",
      date: "Setembro 2025",
      icon: "✨",
      color: "cyan",
      changes: ["Em Alfa", "Projeto inicial do Ka’aguy"],
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      cyan: "border-cyan-500/30 text-cyan-400",
      green: "border-green-500/30 text-green-400",
      purple: "border-purple-500/30 text-purple-400",
      orange: "border-orange-500/30 text-orange-400",
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
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ka’aguy
          </h1>
          <p className="mt-4 text-neutral-200 max-w-2xl">
            Um jogo de cartas com Encantados, regiões e lendas do nosso
            folclore. Acompanhe novidades, artes e eventos nas nossas redes.
          </p>
          <div className="mt-6">
            <a
              href="https://www.instagram.com/mitologia.brasileira.jogo/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold border border-pink-400 shadow transition"
            >
              <Icon name="instagram" size={24} className="text-white" />
              Ka’aguy no Instagram
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
              Ka’aguy é um jogo de cartas colecionáveis inspirado no nosso
              folclore. Reúna Encantados icônicos, explore regiões como Amazônia
              e Pantanal e batalhe em partidas rápidas e estratégicas.
            </p>
            <ul className="mt-4 space-y-2 text-neutral-200 list-disc list-inside">
              <li>
                Encantados com habilidades únicas (Saci, Iara, Curupira e mais)
              </li>
              <li>Modos de jogo com PvP e desafios especiais</li>
              <li>Eventos sazonais que afetam o campo e as cartas</li>
              <li>Museu com histórias e curiosidades das lendas</li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative h-36 rounded-xl overflow-hidden bg-black/40">
              <Image
                src="/images/cards/portraits/saci.jpg"
                alt=""
                fill
                aria-hidden
                className="object-cover blur-sm scale-110 opacity-40"
              />
              <Image
                src="/images/cards/portraits/saci.jpg"
                alt="Ka’aguy — Saci"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative h-36 rounded-xl overflow-hidden bg-black/40">
              <Image
                src="/images/cards/portraits/iara.jpg"
                alt=""
                fill
                aria-hidden
                className="object-cover blur-sm scale-110 opacity-40"
              />
              <Image
                src="/images/cards/portraits/iara.jpg"
                alt="Ka’aguy — Iara"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative h-36 rounded-xl overflow-hidden bg-black/40">
              <Image
                src="/images/cards/portraits/boto.jpg"
                alt=""
                fill
                aria-hidden
                className="object-cover blur-sm scale-110 opacity-40"
              />
              <Image
                src="/images/cards/portraits/boto.jpg"
                alt="Ka’aguy — Curupira"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative h-36 rounded-xl overflow-hidden bg-black/40">
              <Image
                src="/images/banners/menubatalha.png"
                alt=""
                fill
                aria-hidden
                className="object-cover blur-sm scale-110 opacity-40"
              />
              <Image
                src="/images/banners/menubatalha.png"
                alt="Ka’aguy — Batalhas"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-6 pb-6 grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Colecione Encantados",
            desc: "Descubra lendas do Brasil com efeitos especiais.",
            img: "/images/cards/portraits/boitata.jpg",
          },
          {
            title: "Batalhas Rápidas",
            desc: "Partidas de turno com habilidades e campos que mudam o ritmo.",
            img: "/images/banners/menuranking.png",
          },
          {
            title: "Explore Regiões",
            desc: "Amazônia, Pantanal, Sertão e mais — cada uma com sua própria identidade.",
            img: "/images/banners/menuperfil.png",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-black/30 rounded-2xl overflow-hidden"
          >
            <div className="relative h-40 bg-black/40">
              <Image
                src={f.img}
                alt=""
                fill
                aria-hidden
                className="object-cover blur-sm scale-110 opacity-40"
              />
              <Image
                src={f.img}
                alt={f.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold">{f.title}</h3>
              <p className="text-sm text-neutral-300 mt-1">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Botão Jogar Bem Grande (desabilitado, cinza, "Em breve") */}
      <section className="flex justify-center py-16">
        <button
          disabled
          className="group relative inline-flex items-center justify-center px-16 py-8 text-4xl font-extrabold text-white bg-gradient-to-br from-gray-500 via-gray-600 to-gray-800 rounded-3xl shadow-2xl border-2 border-gray-400/50 backdrop-blur-sm opacity-80 cursor-not-allowed"
        >
          {/* Efeito de brilho sutil */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-400/20 to-gray-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Conteúdo do botão */}
          <div className="relative flex items-center gap-4">
            <span className="text-5xl">🌿</span>
            <div className="flex flex-col items-start">
              <span className="text-4xl leading-none">Em breve</span>
              <span className="text-2xl text-gray-200 font-normal">
                Adentre a Ka&apos;aguy
              </span>
            </div>
          </div>

          {/* Partículas decorativas */}
          <div className="absolute -inset-2 rounded-3xl opacity-30 bg-gradient-to-r from-gray-600/20 to-gray-800/20 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        </button>
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
              className={`bg-black/30 backdrop-blur-sm rounded-2xl p-8 border ${
                getColorClasses(patch.color).split(" ")[0]
              }`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-14 h-14 bg-gradient-to-br from-${patch.color}-400 to-${patch.color}-600 rounded-xl flex items-center justify-center`}
                >
                  <span className="text-2xl">{patch.icon}</span>
                </div>
                <div>
                  <h3
                    className={`text-2xl font-bold ${
                      getColorClasses(patch.color).split(" ")[1]
                    }`}
                  >
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
                    <span
                      className={`${
                        getColorClasses(patch.color).split(" ")[1]
                      } mt-1`}
                    >
                      •
                    </span>
                    <span className="text-neutral-300">{change}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seção Sobre o Desenvolvedor */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            👨‍💻 Sobre o Desenvolvedor
          </h2>
          <p className="text-neutral-300 max-w-2xl mx-auto">
            Conheça quem está por trás do Ka&apos;aguy
          </p>
        </div>

        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Foto/Avatar do Desenvolvedor */}
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full p-1 mx-auto mb-4">
                <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-4xl">👨‍💻</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-purple-400 mb-2">
                Bruno Alves
              </h3>
              <p className="text-sm text-gray-400">
                Desenvolvedor Em Aprendizado
              </p>
            </div>

            {/* Informações sobre o projeto */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-bold text-white mb-4">
                Um projeto solo apaixonado
              </h4>
              <p className="text-neutral-300 leading-relaxed mb-4">
                O Ka&apos;aguy é desenvolvido inteiramente por mim, Bruno, como
                um projeto educacional da faculdade para celebrar a rica
                mitologia brasileira através de um jogo de cartas moderno e
                acessível.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-black/40 p-4 rounded-lg">
                  <h5 className="text-purple-400 font-semibold mb-2">
                    🎯 Objetivo do projeto
                  </h5>
                  <p className="text-sm text-neutral-300">
                    Criar um jogo que valorize nossa cultura folclórica de forma
                    divertida e educativa
                  </p>
                </div>
                <div className="bg-black/40 p-4 rounded-lg">
                  <h5 className="text-purple-400 font-semibold mb-2">
                    ⚡ Stack do projeto
                  </h5>
                  <p className="text-sm text-neutral-300">
                    Next.js, Supabase, TailwindCSS, JavaScript
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="https://github.com/briwno"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <span>🐙</span> GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Contato */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
            💬 Entre em Contato
          </h2>
          <p className="text-neutral-300 max-w-2xl mx-auto">
            Tem sugestões, encontrou bugs ou quer colaborar? Entre em contato!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulário de Email */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📧</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-orange-400">
                  Entre em Contato
                </h3>
                <p className="text-neutral-300">
                  Envie sua mensagem, sugestão ou reporte de bug
                </p>
              </div>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="nome"
                    className="block text-sm font-medium text-neutral-300 mb-2"
                  >
                    Nome
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    className="w-full px-4 py-3 bg-black/40 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    placeholder="Seu nome"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-neutral-300 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 bg-black/40 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="assunto"
                  className="block text-sm font-medium text-neutral-300 mb-2"
                >
                  Assunto
                </label>
                <select
                  id="assunto"
                  name="assunto"
                  className="w-full px-4 py-3 bg-black/40 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  required
                >
                  <option value="">Selecione um assunto</option>
                  <option value="sugestao">💡 Sugestão</option>
                  <option value="bug">🐛 Reportar Bug</option>
                  <option value="parceria">🤝 Parceria</option>
                  <option value="feedback">📝 Feedback</option>
                  <option value="outros">❓ Outros</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="mensagem"
                  className="block text-sm font-medium text-neutral-300 mb-2"
                >
                  Mensagem
                </label>
                <textarea
                  id="mensagem"
                  name="mensagem"
                  rows={6}
                  className="w-full px-4 py-3 bg-black/40 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
                  placeholder="Escreva sua mensagem aqui..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg"
              >
                📨 Enviar Mensagem
              </button>
            </form>
          </div>

          {/* GitHub - Card de Contribuição */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-500/30">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚙️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-400 mb-2">
                Contribuir
              </h3>
              <p className="text-neutral-300 text-sm">
                Ka&apos;aguy é open-source! Ajude no desenvolvimento
              </p>
            </div>

            {/* Estatísticas do Projeto */}
            <div className="space-y-3 mb-4">
              <div className="bg-black/40 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">
                    📊 Linguagem Principal
                  </span>
                  <span className="text-yellow-400 font-semibold">
                    JavaScript
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">🚀 Framework</span>
                  <span className="text-blue-400 font-semibold">Next.js</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">📦 Estado</span>
                  <span className="text-green-400 font-semibold">
                    Em Desenvolvimento
                  </span>
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded-lg">
                <h4 className="text-gray-300 font-semibold mb-3">
                  🛠️ Como Contribuir:
                </h4>
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Reporte bugs via Issues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Sugira novas funcionalidades</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Envie pull requests com melhorias</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-3">
              <a
                href="https://github.com/briwno/mitologia-brasileira-next"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
              >
                <span>📂</span> Ver Repositório
              </a>
              <a
                href="https://github.com/briwno/mitologia-brasileira-next/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-700 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
              >
                <span>🐛</span> Reportar Bug
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Galeria */}
      <section className="max-w-6xl mx-auto px-6 pb-14">
        <h2 className="text-xl font-extrabold mb-4">Galeria</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            "/images/banners/menubatalha.png",
            "/images/cards/portraits/boto.jpg",
            "/images/banners/menumuseu.png",
            "/images/cards/portraits/tupa.png",
            "/images/cards/portraits/encourado.jpg",
            "/images/cards/portraits/cuca.jpg",
          ].map((src, i) => (
            <div
              key={i}
              className="relative h-44 bg-black/30 rounded-xl overflow-hidden"
            >
              <Image
                src={src}
                alt=""
                fill
                aria-hidden
                className="object-cover blur-sm scale-110 opacity-40"
              />
              <Image
                src={src}
                alt={`Ka’aguy — Galeria ${i + 1}`}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
