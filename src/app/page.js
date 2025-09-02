// src/app/page.js
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../hooks/useAuth';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

// Carregamento dinâmico dos modais com fallback de carregamento
const PvPModal = dynamic(() => import('@/components/PvP/PvPModal'), { 
  ssr: false, 
  loading: () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
      <LoadingSpinner text="Abrindo Batalha..." />
    </div>
  )
});
const MuseumModal = dynamic(() => import('@/components/Museum/MuseumModal'), { 
  ssr: false, 
  loading: () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
      <LoadingSpinner text="Abrindo Museu..." />
    </div>
  )
});
const RankingModal = dynamic(() => import('@/components/Ranking/RankingModal'), { 
  ssr: false, 
  loading: () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
      <LoadingSpinner text="Abrindo Ranking..." />
    </div>
  )
});
const ProfileModal = dynamic(() => import('@/components/Profile/ProfileModal'), { 
  ssr: false, 
  loading: () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
      <LoadingSpinner text="Abrindo Perfil..." />
    </div>
  )
});

// Cartão clicável para cada modo da página inicial
function CartaoDeModo({ href, title, emoji, available = true, subtitle, highlight = false, imageSrc }) {
  const [erroImagem, setErroImagem] = useState(false);
  
  // Verificação de segurança para props obrigatórias
  if (!title || !emoji) {
    console.warn('CartaoDeModo: title and emoji are required props');
    return null;
  }
  
  const conteudo = (
    <div
      className={`relative h-80 md:h-[26rem] rounded-2xl border-2 overflow-hidden transition-all select-none
        ${available ? (highlight ? 'border-cyan-300 shadow-[0_20px_60px_-20px_rgba(0,255,255,0.35)]' : 'border-neutral-600 hover:border-cyan-400') : 'border-neutral-700 opacity-70 grayscale'}
        bg-gradient-to-b from-black/60 to-black/30 backdrop-blur-sm`}
    >
      {/* Imagem de fundo (placeholder por padrão) */}
      <Image
        src={!imageSrc || erroImagem ? '/images/placeholder.svg' : imageSrc}
        alt={`${title} banner`}
        fill
  className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.03] group-hover:brightness-110 group-hover:saturate-150 group-hover:contrast-110"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        priority={highlight}
        onError={() => setErroImagem(true)}
      />
      {/* Overlay e moldura decorativa */}
      <div className="absolute inset-0 pointer-events-none">
  <div className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/20" />
  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.35),transparent_60%)] mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_55%)]" />
        {highlight && <div className="absolute inset-0 animate-pulse bg-cyan-200/5" />}
      </div>
      <div className="absolute top-4 right-4 text-2xl">{emoji}</div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 border-t border-white/10 p-4">
        <div className={`text-center font-extrabold ${available ? 'text-white' : 'text-neutral-400'} text-xl md:text-2xl tracking-wide`}>{title}</div>
        {subtitle && <div className="text-center text-neutral-300 text-xs md:text-sm mt-1">{subtitle}</div>}
        {!available && (
          <div className="text-center text-red-300/90 text-xs md:text-sm mt-1">Requer Nível 20</div>
        )}
      </div>
      {highlight && (
        <div className="absolute inset-x-0 -bottom-3 mx-auto w-11/12 h-1 rounded-full bg-cyan-400/30 blur" />
      )}
    </div>
  );

  return available ? (
    <Link href={href} className="block group transform transition will-change-transform hover:scale-[1.01]">{conteudo}</Link>
  ) : (
    <div className="cursor-not-allowed">{conteudo}</div>
  );
}

// Página inicial
export default function Inicio() {
  const [carregado, setCarregado] = useState(false);
  const [mostrarConfigModal, setMostrarConfigModal] = useState(false);
  const [mostrarInfoModal, setMostrarInfoModal] = useState(false);
  const [mostrarPvPModal, setMostrarPvPModal] = useState(false);
  const [mostrarMuseuModal, setMostrarMuseuModal] = useState(false);
  const [mostrarRankingModal, setMostrarRankingModal] = useState(false);
  const [mostrarPerfilModal, setMostrarPerfilModal] = useState(false);
  
  useEffect(() => {
    setCarregado(true);
  }, []);
  
  const authData = useAuth();
  const { user, isAuthenticated, logout } = authData || {};

  // Verificação de segurança para auth
  if (!authData) {
    console.warn('useAuth hook returned null/undefined');
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1420] via-[#0b1d2e] to-[#07131f] flex items-center justify-center">
        <div className="text-white text-center">
          <p>Erro ao carregar autenticação...</p>
        </div>
      </div>
    );
  }

  // Evita renderização no servidor para componentes dinâmicos
  if (!carregado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1420] via-[#0b1d2e] to-[#07131f] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a1420] via-[#0b1d2e] to-[#07131f] text-white">
      {/* Fundo ambiente com gradientes e efeitos */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-cyan-900/20 via-transparent to-transparent blur-2xl" />
        <div className="absolute inset-y-0 right-0 w-64 bg-gradient-to-l from-emerald-900/20 via-transparent to-transparent blur-2xl" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(120,119,198,0.25)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(74,222,128,0.25)_0%,transparent_50%)]" />
        </div>
      </div>

      <div className={`relative z-10 min-h-screen transition-opacity duration-700 ${carregado ? 'opacity-100' : 'opacity-0'}`}>
        {/* Barra superior */}
        <div className="flex items-center justify-between px-6 pt-4">
          <div className="flex items-center gap-3">
            {/* Selo de marca com logotipo */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm" title="Adentre a Ka&#39;aguy. Se for capaz.">
              <span className="text-lg">🌿</span>
              <Image
                src="/images/logo.svg"
                alt="Ka'aguy"
                width={90}
                height={24}
                className="opacity-90"
                priority
              />
            </div>
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">BR</div>
            <div className="hidden sm:block">
              <div className="text-white font-bold text-sm">{user?.username || 'Convidado'}</div>
              <div className="text-cyan-300 text-xs">{isAuthenticated() ? 'Conectado' : 'Não conectado'}</div>
            </div>
          </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 hover:border-white/30 transition flex items-center justify-center"
              onClick={() => setMostrarConfigModal(true)}
            >
              ⚙️
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 hover:border-white/30 transition flex items-center justify-center"
              onClick={() => setMostrarInfoModal(true)}
            >
              📜
            </button>
            {/* Login/logout minimalista */}
            {isAuthenticated() ? (
              <button
                onClick={logout}
                title="Sair"
                className="px-3 h-10 rounded-lg bg-black/40 border border-green-400/30 hover:border-green-400/60 text-green-300 text-sm font-semibold"
              >
                Sair
              </button>
            ) : (
              <Link
                href="/login"
                title="Entrar"
                className="px-3 h-10 inline-flex items-center rounded-lg bg-black/40 border border-cyan-400/30 hover:border-cyan-400/60 text-cyan-300 text-sm font-semibold"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>

        {/* Faixa central com título */}
        <div className="mt-6 flex items-center justify-center">
          <div className="px-6 py-2 rounded-xl border border-white/15 bg-gradient-to-b from-black/50 to-black/30 backdrop-blur-sm shadow-[0_12px_40px_-18px_rgba(0,0,0,0.9)]">
            <div className="text-xs md:text-sm tracking-widest text-cyan-200 text-center">JOGAR</div>
            <div className="flex items-center justify-center">
              <Image
                src="/images/logo.svg"
                alt="Ka'aguy logo"
                width={170}
                height={50}
                className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
                priority
              />
            </div>
            <div className="mt-1 text-[11px] md:text-sm text-neutral-300 text-center italic">Adentre a Ka&#39;aguy. Se for capaz.</div>
          </div>
        </div>

        {/* Linha de cartões altos */}
        <div className="mx-auto mt-6 max-w-7xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div onClick={() => setMostrarPvPModal(true)}>
              <CartaoDeModo href="#" title="BATALHA" emoji="⚔️" subtitle="Duelar contra outros jogadores" imageSrc="/images/banners/menubatalha.png" />
            </div>
            <div onClick={() => setMostrarMuseuModal(true)}>
              <CartaoDeModo href="#" title="MUSEU" emoji="🏛️" subtitle="Explore as lendas" imageSrc="/images/banners/menumuseu.png" />
            </div>
            <div onClick={() => setMostrarRankingModal(true)}>
              <CartaoDeModo href="#" title="RANKING" emoji="🏆" subtitle="Top jogadores" imageSrc="/images/banners/menuranking.png" />
            </div>
            <div onClick={() => setMostrarPerfilModal(true)}>
              <CartaoDeModo href="#" title="PERFIL" emoji="👤" subtitle="Suas conquistas" imageSrc="/images/banners/menuperfil.png" />
            </div>
          </div>
        </div>

        {/* Ações compactas inferiores */}
        <div className="mx-auto mt-6 max-w-5xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/card_inventory" className="group">
              <div className="relative rounded-xl border border-emerald-500/30 bg-black/40 p-4 backdrop-blur-sm hover:border-emerald-400/60 transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-2xl">🎴</div>
                  <div className="flex-1">
                    <div className="font-bold">SUAS CARTAS</div>
                    <div className="text-emerald-200 text-sm">47/60 cartas coletadas</div>
                  </div>
                  <div className="text-emerald-300 text-2xl group-hover:translate-x-1 transition-transform">→</div>
                </div>
              </div>
            </Link>
            <Link href="/shop" className="group">
              <div className="relative rounded-xl border border-pink-500/30 bg-black/40 p-4 backdrop-blur-sm hover:border-pink-400/60 transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-2xl">🛒</div>
                  <div className="flex-1">
                    <div className="font-bold">LOJA</div>
                    <div className="text-pink-200 text-sm">Pacotes e ofertas especiais</div>
                  </div>
                  <div className="text-pink-300 text-2xl group-hover:translate-x-1 transition-transform">→</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

  {/* Mobile tab bar moved to GlobalNav */}
        {/* Modal de Configuração (Home) */}
        {mostrarConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setMostrarConfigModal(false)}>
            <div className="bg-[#101c2a] rounded-xl shadow-lg p-8 min-w-[320px] relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="absolute top-2 right-2 text-white text-xl hover:text-cyan-300"
                onClick={() => setMostrarConfigModal(false)}
                title="Fechar"
              >
                ×
              </button>
              <h2 className="text-lg font-bold mb-4">Configurações</h2>
              <div className="text-sm text-white/80">Aqui vão as opções de configuração...</div>
            </div>
          </div>
        )}
        {/* Modal de Termos & Informações (Home) */}
        {mostrarInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setMostrarInfoModal(false)}>
            <div className="bg-[#101c2a] rounded-xl shadow-lg p-8 min-w-[340px] max-w-[720px] max-h-[80vh] w-[90vw] relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="absolute top-2 right-2 text-white text-xl hover:text-cyan-300"
                onClick={() => setMostrarInfoModal(false)}
                title="Fechar"
              >
                ×
              </button>
              <h2 className="text-lg font-bold mb-4">Termos de Uso & Informações</h2>
              <div className="text-sm text-white/80 space-y-4 overflow-y-auto pr-2" style={{ maxHeight: '60vh' }}>
                <section>
                  <h3 className="font-semibold text-white mb-1">Resumo dos Termos</h3>
                  <p>
                    Este é um protótipo educacional de jogo de cartas. Ao usar, você concorda em não abusar do serviço,
                    respeitar outros jogadores e reconhecer que o progresso pode ser apagado durante o desenvolvimento.
                  </p>
                </section>
                <section>
                  <h3 className="font-semibold text-white mb-1">Privacidade</h3>
                  <p>
                    Mantemos dados mínimos de perfil e coleção de cartas para funcionamento do jogo. Não vendemos dados.
                    Em produção, políticas de RLS e autenticação forte serão aplicadas.
                  </p>
                </section>
                <section>
                  <h3 className="font-semibold text-white mb-1">Contato</h3>
                  <p>
                    Encontrou um problema ou tem sugestão? Abra um issue ou envie feedback pelo canal do projeto.
                  </p>
                </section>
                <section className="text-xs text-gray-400 pt-2 border-t border-white/10">
                  Versão: 0.1.0 • Build preview
                </section>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-black/40 border border-white/20 hover:border-white/40"
                  onClick={() => setMostrarInfoModal(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modais - Renderizados apenas após carregamento completo */}
        {carregado && mostrarPvPModal && (
          <PvPModal onClose={() => setMostrarPvPModal(false)} />
        )}
        {carregado && mostrarMuseuModal && (
          <MuseumModal onClose={() => setMostrarMuseuModal(false)} />
        )}
        {carregado && mostrarRankingModal && (
          <RankingModal onClose={() => setMostrarRankingModal(false)} />
        )}
        {carregado && mostrarPerfilModal && (
          <ProfileModal onClose={() => setMostrarPerfilModal(false)} />
        )}
      </div>
    </main>
  );
}