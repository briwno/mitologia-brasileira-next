// src/app/page.js
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth as usarAutenticacao } from '@/hooks/useAuth';
import { usePlayerData as usarDadosJogador } from '@/hooks/usePlayerData';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import Icon from '@/components/UI/Icon';
import LayoutDePagina from '@/components/UI/PageLayout';

// Carregamento dinâmico dos modais com fallback de carregamento
const ModalPvP = dynamic(() => import('@/components/PvP/PvPModal'), { 
  loading: () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
      <LoadingSpinner text="Abrindo Batalha..." />
    </div>
  )
});
const ModalMuseu = dynamic(() => import('@/components/Museum/MuseumModal'), { 
  loading: () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
      <LoadingSpinner text="Abrindo Museu..." />
    </div>
  )
});
const ModalRanking = dynamic(() => import('@/components/Ranking/RankingModal'), { 
  loading: () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
      <LoadingSpinner text="Abrindo Ranking..." />
    </div>
  )
});
const ModalPerfil = dynamic(() => import('@/components/Profile/ProfileModal'), { 
  loading: () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
      <LoadingSpinner text="Abrindo Perfil..." />
    </div>
  )
});


//verificar se é level1


// Cartão clicável para cada modo da página inicial
function CartaoModo({ destino, titulo,  disponivel = true, subtitulo, destaque = false, caminhoImagem }) {
  const [erroAoCarregarImagem, definirErroAoCarregarImagem] = useState(false);

  // Verificação de segurança para props obrigatórias
  if (!titulo) {
    console.warn('CartaoModo: propriedade titulo é obrigatória');
    return null;
  }
  
  const conteudo = (
    <div
      className={`relative h-80 md:h-[26rem] rounded-2xl border-2 overflow-hidden transition-all select-none
        ${(() => {
          if (disponivel) {
            if (destaque) {
              return 'border-cyan-300 shadow-[0_20px_60px_-20px_rgba(0,255,255,0.35)]';
            } else {
              return 'border-neutral-600 hover:border-cyan-400';
            }
          } else {
            return 'border-neutral-700 opacity-70 grayscale';
          }
        })()}
        bg-gradient-to-b from-black/60 to-black/30 backdrop-blur-sm`}
    >
      {/* Imagem de fundo (placeholder por padrão) */}
      <Image
        src={(() => {
          if (!caminhoImagem || erroAoCarregarImagem) {
            return '/images/placeholder.svg';
          } else {
            return caminhoImagem;
          }
        })()}
        alt={`${titulo} banner`}
        fill
  className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.03] group-hover:brightness-110 group-hover:saturate-150 group-hover:contrast-110"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        priority={destaque}
        onError={() => definirErroAoCarregarImagem(true)}
      />
      {/* Overlay e moldura decorativa */}
      <div className="absolute inset-0 pointer-events-none">
  <div className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/20" />
  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.35),transparent_60%)] mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_55%)]" />
        {destaque && <div className="absolute inset-0 animate-pulse bg-cyan-200/5" />}
      </div>
      <div className="absolute top-4 right-4">
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 border-t border-white/10 p-4">
        <div className={`text-center font-extrabold ${(() => {
          if (disponivel) {
            return 'text-white';
          } else {
            return 'text-neutral-400';
          }
        })()} text-xl md:text-2xl tracking-wide`}>{titulo}</div>
        {subtitulo && <div className="text-center text-neutral-300 text-xs md:text-sm mt-1">{subtitulo}</div>}
        {!disponivel && (
          <div className="text-center text-red-300/90 text-xs md:text-sm mt-1">Requer Nível 20</div>
        )}
      </div>
      {destaque && (
        <div className="absolute inset-x-0 -bottom-3 mx-auto w-11/12 h-1 rounded-full bg-cyan-400/30 blur" />
      )}
    </div>
  );

  return disponivel ? (
    <Link href={destino} className="block group transform transition will-change-transform hover:scale-[1.01]">{conteudo}</Link>
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
  
  const contextoAutenticacao = usarAutenticacao();
  const {
    user: usuario,
    isAuthenticated: verificarAutenticacao,
    logout: realizarLogout,
  } = contextoAutenticacao || {};

  // Dados do jogador obtidos via hook dedicado
  const informacoesJogador = usarDadosJogador();
  const {
    currencies: moedas,
    stats: estatisticas,
    quests: missoes,
    winRate: taxaVitoria,
    levelProgress: progressoNivel,
  } = informacoesJogador || {};

  let estaAutenticado;
  if (typeof verificarAutenticacao === 'function') {
    estaAutenticado = verificarAutenticacao();
  } else {
    estaAutenticado = false;
  }

  // Verificação de segurança para auth
  if (!contextoAutenticacao) {
    console.warn('useAuth retornou um valor inválido');
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
    <LayoutDePagina>
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
            <CartaoModo destino="#" titulo="BATALHA" subtitulo="Duelar contra outros jogadores" caminhoImagem="/images/banners/menubatalha.png" />
          </div>
          <div onClick={() => setMostrarMuseuModal(true)}>
            <CartaoModo destino="#" titulo="MUSEU" subtitulo="Explore as lendas" caminhoImagem="/images/banners/menumuseu.png" />
          </div>
          <div onClick={() => setMostrarRankingModal(true)}>
            <CartaoModo destino="#" titulo="RANKING" subtitulo="Top jogadores" caminhoImagem="/images/banners/menuranking.png" />
          </div>
          <div onClick={() => setMostrarPerfilModal(true)}>
            <CartaoModo destino="#" titulo="PERFIL"  subtitulo="Suas conquistas" caminhoImagem="/images/banners/menuperfil.png" />
          </div>
        </div>
      </div>

      {/* Ações compactas inferiores */}
      <div className="mx-auto mt-6 max-w-5xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/card_inventory" className="group">
            <div className="relative rounded-xl border border-emerald-500/30 bg-black/40 p-4 backdrop-blur-sm hover:border-emerald-400/60 transition">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <Icon name="cards" size={24} />
                </div>
                <div className="flex-1">
                  <div className="font-bold">SUAS CARTAS</div>
                  <div className="text-emerald-200 text-sm">Ver e gerenciar sua coleção</div>
                </div>
                <div className="text-emerald-300 text-2xl group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </div>
          </Link>
          <Link href="/shop" className="group">
            <div className="relative rounded-xl border border-pink-500/30 bg-black/40 p-4 backdrop-blur-sm hover:border-pink-400/60 transition">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <Icon name="shop" size={24} />
                </div>
                <div className="flex-1">
                  <div className="font-bold">LOJA</div>
                  <div className="text-pink-200 text-sm">Pacotes e ofertas especiais</div>
                </div>
                <div className="text-pink-300 text-2xl group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </div>
          </Link>
          <div className="w-12 h-20"/>
        </div>
      </div>

      {/* Missões diárias — exibidas apenas quando autenticado */}
      {estaAutenticado && missoes?.active?.length > 0 && (
        <div className="mx-auto mt-6 max-w-5xl px-6">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="scroll" size={20} className="text-cyan-400" />
              <h3 className="font-bold text-white">Missões Diárias</h3>
              <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">
                {missoes.active.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {missoes.active.slice(0, 4).map((missaoJogador) => {
                const missao = missaoJogador.quests;
                const objetivoPrincipal = missao.objectives[0];
                const progressoAtual = missaoJogador.progress[objetivoPrincipal.type] || 0;
                const percentualProgresso = Math.min(100, (progressoAtual / objetivoPrincipal.target) * 100);
                
                return (
                  <div key={missao.id} className="bg-black/30 rounded-lg p-3 border border-white/5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-white">{missao.name}</div>
                        <div className="text-xs text-gray-300">{missao.description}</div>
                      </div>
                      <div className="ml-2 flex items-center gap-1 text-xs">
                        {missao.rewards.gold && (
                          <>
                            <Icon name="coins" size={12} className="text-yellow-400" />
                            <span className="text-yellow-300">{missao.rewards.gold}</span>
                          </>
                        )}
                        {missao.rewards.xp && (
                          <>
                            <span className="text-gray-400 mx-1">•</span>
                            <span className="text-blue-300">{missao.rewards.xp} XP</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Progresso</span>
                        <span className="text-white">{progressoAtual}/{objetivoPrincipal.target}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-cyan-400 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${percentualProgresso}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
        <ModalPvP onClose={() => setMostrarPvPModal(false)} />
      )}
      {carregado && mostrarMuseuModal && (
        <ModalMuseu onClose={() => setMostrarMuseuModal(false)} />
      )}
      {carregado && mostrarRankingModal && (
        <ModalRanking onClose={() => setMostrarRankingModal(false)} />
      )}
      {carregado && mostrarPerfilModal && (
        <ModalPerfil onClose={() => setMostrarPerfilModal(false)} />
      )}
    </LayoutDePagina>
  );
}