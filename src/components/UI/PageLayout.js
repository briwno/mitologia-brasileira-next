"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth as usarAutenticacao } from "@/hooks/useAuth";
import { usePlayerData as usarDadosJogador } from "@/hooks/usePlayerData";
import Icon from "@/components/UI/Icon";
import PatchNotesModal from "@/components/UI/PatchNotesModal";
import { useFriends as usarAmigos } from "@/hooks/useFriends";
import { PetWidget } from "@/components/Pet";
import { SITUACOES_MASCOTE } from "@/data/petPhrases";
import { FRASES_MASCOTE } from "@/data/petPhrases";

// Layout de página compartilhado
export default function LayoutDePagina({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mostrarModalConfiguracoes, definirMostrarModalConfiguracoes] =
    useState(false);
  const [mostrarModalInformacoes, definirMostrarModalInformacoes] =
    useState(false);
  const [definirMostrarModalPatchNotes, setDefinirMostrarModalPatchNotes] =
    useState(false);
  const [mostrarModalDuvidas, setMostrarModalDuvidas] = useState(false);

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
    winRate: taxaVitoria,
  } = informacoesJogador || {};

  // Amigos
  const amigosContexto = usarAmigos && usarAmigos();
  const {
    friends = [],
    friendsCount = 0,
    loading: amigosCarregando = false,
  } = amigosContexto || {};
  const [mostrarModalAmigos, setMostrarModalAmigos] = useState(false);

  let estaAutenticado;
  if (typeof verificarAutenticacao === "function") {
    estaAutenticado = verificarAutenticacao();
  } else {
    estaAutenticado = false;
  }

  useEffect(() => setIsLoaded(true), []);
  const pathname = usePathname();

  function renderDuvidasParaTela(path) {
    // Conteúdo simples e orientador por rota
    switch (true) {
      case path === "/" || path === "/home":
        return (
          <div>
            <p className="text-sm text-white/80 mb-3">
              Esta é a tela inicial. Use os cartões para navegar rápido:
            </p>
            <ul className="list-disc list-inside text-sm text-white/80 space-y-1">
              <li>
                <strong>BATALHA</strong> — Inicia duelos e acessa matchmaking.
              </li>
              <li>
                <strong>MUSEU</strong> — Explore as lendas e o quiz cultural.
              </li>
              <li>
                <strong>LOJA</strong> — Abra pacotes e veja ofertas.
              </li>
              <li>
                <strong>PERFIL</strong> — Visualize seu progresso e conquistas.
              </li>
            </ul>
          </div>
        );
      case path?.startsWith("/shop"):
        return (
          <div>
            <p className="text-sm text-white/80 mb-3">
              Loja — aqui você compra e abre boosters.
            </p>
            <ul className="list-disc list-inside text-sm text-white/80 space-y-1">
              <li>
                Escolha um pacote e clique em &quot;Abrir&quot; para ver as
                cartas sorteadas.
              </li>
              <li>As cartas são automaticamente adicionadas à sua coleção.</li>
            </ul>
          </div>
        );
      case path?.startsWith("/pvp"):
        return (
          <div>
            <p className="text-sm text-white/80 mb-3">
              PvP — informações rápidas sobre o fluxo de batalha.
            </p>
            <ul className="list-disc list-inside text-sm text-white/80 space-y-1">
              <li>Pré-batalha: verifique seu deck e habilidades.</li>
              <li>
                Durante a partida: use ações no painel lateral e acompanhe o
                log.
              </li>
            </ul>
          </div>
        );
      case path?.startsWith("/museum"):
        return (
          <div>
            <p className="text-sm text-white/80 mb-3">
              Museu — explore cartas e quizzes.
            </p>
            <ul className="list-disc list-inside text-sm text-white/80 space-y-1">
              <li>Use filtros para encontrar cartas por região ou raridade.</li>
              <li>O quiz testa seu conhecimento sobre as lendas mostradas.</li>
            </ul>
          </div>
        );
      case path?.startsWith("/card_inventory"):
        return (
          <div>
            <p className="text-sm text-white/80 mb-3">
              Seu inventário de cartas — gerencie sua coleção.
            </p>
            <ul className="list-disc list-inside text-sm text-white/80 space-y-1">
              <li>Ordene por raridade, nome ou data de aquisição.</li>
              <li>Use o botão de detalhes para ver habilidades e histórico.</li>
            </ul>
          </div>
        );
      case path?.startsWith("/ranking"):
        return (
          <div>
            <p className="text-sm text-white/80 mb-3">
              Ranking — veja a classificação dos jogadores.
            </p>
            <ul className="list-disc list-inside text-sm text-white/80 space-y-1">
              <li>Os jogadores são classificados por MMR.</li>
              <li>
                MMR: Significa seus pontos de classificação. Quanto maior,
                melhor.
              </li>
              <li>Ganhe MMR vencendo partidas contra outros jogadores.</li>
              <li>Suba no ranking participando de batalhas PvP.</li>
            </ul>
          </div>
        );
      case path?.startsWith("/profile"):
        return (
          <div>
            <p className="text-sm text-white/80 mb-3">
              Perfil — veja seu progresso e amigos.
            </p>
            <ul className="list-disc list-inside text-sm text-white/80 space-y-1">
              <li>Edite avatar, nome e informações públicas aqui.</li>
              <li>Verifique conquistas e estatísticas.</li>
            </ul>
          </div>
        );
      default:
        return (
          <div>
            <p className="text-sm text-white/80 mb-3">
              Ajuda rápida — orientações gerais.
            </p>
            <ul className="list-disc list-inside text-sm text-white/80 space-y-1">
              <li>Procure ações principais no topo ou na lateral.</li>
              <li>
                Se algo não funcionar, abra um issue no repositório ou peça
                suporte.
              </li>
            </ul>
          </div>
        );
    }
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

      <div
        className={`relative z-10 min-h-screen transition-opacity duration-700 ${(() => {
          if (isLoaded) {
            return "opacity-100";
          } else {
            return "opacity-0";
          }
        })()}`}
      >
        {/* Barra superior (compartilhada) */}
        <div className="flex items-center justify-between px-6 pt-4">
          <div className="flex items-center gap-3">
            {/* Selo de marca com logotipo */}
            <div
              className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm cursor-pointer"
              title="Adentre a Ka&#39;aguy. Se for capaz."
              onClick={() => (window.location.href = "/")}
            >
              <Icon name="leaf" size={18} />
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden cursor-pointer" title="Ver perfil">
                {usuario?.avatar_url ? (
                  <Image
                    src={usuario.avatar_url}
                    alt={`Avatar de ${
                      usuario?.nickname || usuario?.name || "Jogador"
                    }`}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML =
                        usuario?.name?.charAt(0)?.toUpperCase() || "BR";
                    }}
                    onClick={() => (window.location.href = "/profile")}
                  />
                ) : (
                  <span>
                    {usuario?.name?.charAt(0)?.toUpperCase() ||
                      usuario?.nickname?.charAt(0)?.toUpperCase() ||
                      "BR"}
                  </span>
                )}
              </div>
              <div className="hidden sm:block">
                <div className="text-white font-bold text-sm flex items-center gap-2">
                  {usuario?.nickname || usuario?.name || "Convidado"}
                  {usuario?.titulo_info && (
                    <span
                      className="text-xs px-2 py-0.5 rounded font-bold bg-black/30 border border-white/10 ml-2 flex items-center gap-1"
                      style={{ color: usuario.titulo_info.cor || "#3B82F6" }}
                    >
                      {usuario.titulo_info.icone} {usuario.titulo_info.nome}
                    </span>
                  )}
                </div>
                <div className="text-cyan-300 text-xs flex items-center gap-1">
                  <span>Nível {usuario?.level || 1}</span>
                </div>
              </div>
            </div>
            {/* Aba amigos do jogador — exibidas apenas se autenticado */}
            {estaAutenticado && (
              <>
                <button
                  type="button"
                  onClick={() => setMostrarModalAmigos(true)}
                  title="Amigos online"
                  className="inline-flex items-center gap-2 px-3 h-10 rounded-lg bg-black/30 border border-white/5 hover:border-white/20 transition text-sm text-white/90 cursor-pointer"
                >
                  <Icon name="friends" size={16} />
                  <span className="hidden sm:inline">{friendsCount}</span>
                  <span className="text-xs text-white/70"> online</span>
                </button>

                {mostrarModalAmigos && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                    onClick={() => setMostrarModalAmigos(false)}
                  >
                    <div
                      className="bg-[#0f1724] rounded-xl shadow-lg p-4 min-w-[300px] max-w-[640px] relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="absolute top-2 right-2 text-white text-xl hover:text-cyan-300"
                        onClick={() => setMostrarModalAmigos(false)}
                        title="Fechar"
                      >
                        ×
                      </button>
                      <h3 className="text-lg font-bold mb-2">Amigos</h3>

                      {amigosCarregando ? (
                        <div className="text-sm text-white/70">
                          Carregando...
                        </div>
                      ) : (
                        <div className="max-h-[50vh] overflow-y-auto space-y-2">
                          {friends && friends.length > 0 ? (
                            friends.map((f, idx) => {
                              // A API retorna o amigo no campo 'friend'
                              const amigo = f.friend || f;
                              const nome =
                                amigo.nickname || amigo.name || "Jogador";
                              const avatar =
                                amigo.avatar_url ||
                                "/images/avatars/default.png";
                              const idAmigo = amigo.id || "";
                              const nivel = amigo.level || 1;
                              const mmr = amigo.mmr || 0;

                              return (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between bg-black/40 rounded-lg p-2"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                                      {avatar ? (
                                        <Image
                                          src={avatar}
                                          alt={nome}
                                          width={32}
                                          height={32}
                                          className="object-cover w-full h-full"
                                        />
                                      ) : (
                                        <span>
                                          {nome?.charAt(0)?.toUpperCase() ||
                                            "J"}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm">
                                      <div className="font-semibold">
                                        {nome}
                                      </div>
                                      <div className="text-xs text-white/60">
                                        Nv. {nivel} • MMR {mmr}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Link
                                      href={`/profile/${idAmigo}`}
                                      className="text-xs px-3 py-1 rounded bg-purple-600/40 border border-purple-400/30 hover:border-purple-400/60 hover:bg-purple-600/60 transition-colors"
                                    >
                                      Ver Perfil
                                    </Link>
                                    <button className="text-xs px-3 py-1 rounded bg-black/20 border border-white/5 text-white/60 cursor-not-allowed">
                                      Desafiar (em breve)
                                    </button>
                                    <button className="text-xs px-3 py-1 rounded bg-black/20 border border-white/5 text-white/60 cursor-not-allowed">
                                      Chat (em breve)
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-sm text-white/70">
                              Nenhum amigo encontrado.
                            </div>
                          )}
                          <Link
                            href="/profile/friends"
                            className="text-xs text-blue-400 hover:underline"
                          >
                            Adicionar amigos
                          </Link>
                        </div>
                      )}

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => setMostrarModalAmigos(false)}
                          className="px-4 py-2 rounded-lg bg-black/40 border border-white/20"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 hover:border-white/30 transition flex items-center justify-center"
              onClick={() => definirMostrarModalConfiguracoes(true)}
            >
              <Icon name="settings" size={20} />
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 hover:border-white/30 transition flex items-center justify-center"
              onClick={() => definirMostrarModalInformacoes(true)}
            >
              <Icon name="scroll" size={20} />
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 hover:border-white/30 transition flex items-center justify-center"
              onClick={() => setDefinirMostrarModalPatchNotes(true)}
              title="Patch Notes"
            >
              <Icon name="notes" size={20} />
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 hover:border-white/30 transition flex items-center justify-center"
              onClick={() => setMostrarModalDuvidas(true)}
              title="Dúvidas"
            >
              <Icon name="question" size={20} />
            </button>
            {/* Login/logout minimalista */}
            {estaAutenticado ? (
              <button
                onClick={realizarLogout}
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

        {/* Conteúdo da página */}
        {children}
        {/* Mascote global agora é renderizado no root (GlobalPetPortal) para evitar problemas de stacking context/mobile nav */}
        {/* Modal de Configurações (renderizado fora do topo para evitar problemas de sobreposição/overflow) */}
        {mostrarModalConfiguracoes && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => definirMostrarModalConfiguracoes(false)}
          >
            <div
              className="bg-[#101c2a] rounded-xl shadow-lg p-8 min-w-[320px] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-2 right-2 text-white text-xl hover:text-cyan-300"
                onClick={() => definirMostrarModalConfiguracoes(false)}
                title="Fechar"
              >
                ×
              </button>
              <h2 className="text-lg font-bold mb-4">Configurações</h2>
              <div className="text-sm text-white/80">
                Aqui vão as opções de configuração…
              </div>
            </div>
          </div>
        )}
        {/* Modal de Termos & Informações */}
        {mostrarModalInformacoes && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => definirMostrarModalInformacoes(false)}
          >
            <div
              className="bg-[#101c2a] rounded-xl shadow-lg p-8 min-w-[340px] max-w-[720px] max-h-[80vh] w-[90vw] relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-2 right-2 text-white text-xl hover:text-cyan-300"
                onClick={() => definirMostrarModalInformacoes(false)}
                title="Fechar"
              >
                ×
              </button>
              <h2 className="text-lg font-bold mb-4">
                Termos de Uso & Informações
              </h2>
              <div
                className="text-sm text-white/80 space-y-4 overflow-y-auto pr-2"
                style={{ maxHeight: "60vh" }}
              >
                <section>
                  <h3 className="font-semibold text-white mb-1">
                    Resumo dos termos
                  </h3>
                  <p>
                    Este é um protótipo educacional de jogo de cartas. Ao usar,
                    você concorda em não abusar do serviço, respeitar outros
                    jogadores e não usar dados reais sensíveis. Dados coletados
                    são mínimos e usados apenas para funcionamento.
                  </p>
                </section>
                <section>
                  <h3 className="font-semibold text-white mb-1">Privacidade</h3>
                  <p>
                    Mantemos dados mínimos de perfil e coleção de cartas para
                    funcionamento do jogo. Não vendemos dados. Em produção,
                    políticas de RLS e autenticação forte serão aplicadas.
                  </p>
                </section>
                <section>
                  <h3 className="font-semibold text-white mb-1">Contato</h3>
                  <p>
                    Encontrou um problema ou tem sugestão? Abra um issue ou
                    envie feedback pelo canal do projeto.
                  </p>
                </section>
                <section className="text-xs text-gray-400 pt-2 border-t border-white/10">
                  Equipe Ka&apos;aguy © 2025.
                </section>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-black/40 border border-white/20 hover:border-white/40"
                  onClick={() => definirMostrarModalInformacoes(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal de Patch Notes */}
        <PatchNotesModal
          isOpen={definirMostrarModalPatchNotes}
          onClose={() => setDefinirMostrarModalPatchNotes(false)}
        />
        {/* Modal de Dúvidas contextuais */}
        {mostrarModalDuvidas && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setMostrarModalDuvidas(false)}
          >
            <div
              className="bg-[#0f1724] rounded-xl shadow-lg p-6 min-w-[320px] max-w-[720px] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-2 right-2 text-white text-xl hover:text-cyan-300"
                onClick={() => setMostrarModalDuvidas(false)}
                title="Fechar"
              >
                ×
              </button>
              <h2 className="text-lg font-bold mb-3">Dúvidas rápidas</h2>
              <div className="text-sm text-white/80 space-y-3">
                {renderDuvidasParaTela(pathname)}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-black/40 border border-white/20 hover:border-white/40"
                  onClick={() => setMostrarModalDuvidas(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
