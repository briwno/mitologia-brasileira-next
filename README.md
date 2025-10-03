# Ka'aguy — Jogo de Cartas de Mitologia Brasileira

![Logo Ka'aguy](./public/images/logo.svg)

## Sumário

- [Visão Geral](#visão-geral)
- [Recursos Principais](#recursos-principais)
- [Tecnologias e Stack](#tecnologias-e-stack)
- [Arquitetura e Fluxos](#arquitetura-e-fluxos)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Começando](#começando)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Banco de Dados Supabase](#banco-de-dados-supabase)
- [UI, Design e Identidade](#ui-design-e-identidade)
- [Testes e Garantia de Qualidade](#testes-e-garantia-de-qualidade)
- [Roadmap e Próximos Passos](#roadmap-e-próximos-passos)
- [Contribuição](#contribuição)
- [Licença](#licença)

## Visão Geral

Ka'aguy é um card game digital focado na cultura folclórica brasileira. O projeto combina batalhas PvP rápidas, exploração cultural (Museu, Quiz e Mapa das Lendas) e progressão competitiva. A aplicação foi construída em **Next.js 15**, priorizando navegação fluida sem recarregar páginas, persistência com **Supabase** e estilização com **Tailwind CSS**.

## Recursos Principais

- **Batalhas PvP assíncronas e ranqueadas** com fases, turnos e itens inspirados em lendas brasileiras.
- **Museu interativo** com cards, contos, mapa regional e quizzes educativos.
- **Sistema de progressão** com conquistas, ranking, moedas e missão diárias.
- **Coleção de cartas e itens** com raridades, elementos, habilidades e histórias.
- **Modais contextuais** (PvP, Museu, Perfil, Ranking) para manter o jogador no fluxo.
- **API Routes** organizadas para cards, decks, batalhas, conquistas, ranking e profile.

## Tecnologias e Stack

- **Framework**: Next.js 15 (App Router) com React 19.
- **Estilos**: Tailwind CSS 4 + componentes customizados.
- **Backend-as-a-Service**: Supabase (autenticação, banco Postgres e storage).
- **ORM utilitário**: Drizzle ORM (planos futuros de persistência tipada).
- **Validações**: Zod em rotas e formulários.
- **Infraestrutura Vercel**: deploy automatizado, KV/Postgres opcionais.
- **Linguagem**: Projeto 100% em português brasileiro (código e UI).

## Arquitetura e Fluxos

- **Modal-First Navigation**: modais dinâmicos carregados com fallback (`LoadingSpinner`) mantendo o contexto do usuário (`src/app/page.js`).
- **Estado do Jogo**: `useGameState` orquestra o `MotorDeJogo` (`src/utils/gameLogic.js`), respeitando as fases (`INICIO → COMPRA → ACAO → COMBATE → FINAL`) e zonas (`ZONAS_CAMPO`).
- **Hooks Personalizados**: `useAuth`, `usePlayerData`, `useCollection` encapsulam autenticação, dados do jogador e inventário.
- **API Routes**: organização por domínio em `src/app/api/*` seguindo padrão com `requireSupabaseAdmin()` e respostas padronizadas.
- **Dados Estáticos**: cartas, quizzes, contos e seeding em `src/data/` e `src/utils/gameDataSeeder.js`.
- **Design System**: especificado em `src/lib/design.md`, garantindo consistência entre telas.

### Fluxo de Jogo (resumo)

1. Jogador acessa a tela inicial e abre o modal PvP.
2. Modal cria/entra em sala (`/api/battle-rooms`) e inicializa `MotorDeJogo`.
3. Jogadores alternam turnos acionando ações via UI (`BattleScreen` → hooks → `MotorDeJogo`).
4. Logs, conquistas e estatísticas são persistidos via Supabase.

## Estrutura de Pastas

```text
src/
  app/              # Páginas, modais e rotas API (App Router)
  components/       # Componentes modulares (Game, UI, Museum, PvP, etc.)
  hooks/            # Hooks customizados para auth, estado, coleção
  utils/            # Motor de jogo, constantes, AI de bot e helpers
  lib/              # Configurações (Supabase), design system, assets
  data/             # Scripts SQL, seeds e dados estáticos
public/
  images/           # Logos, cartas, banners, avatares e playmat
```

## Contribuição

1. Faça um fork do projeto.
2. Commit suas alterações com mensagens descritivas.
3. Abra um pull request descrevendo o contexto, screenshots e passos de teste.

## Licença

Licença em definição. Até lá, uso autorizado apenas para fins de prototipagem e avaliação interna da equipe Ka'aguy.
