# Batalha dos Encantados — Next.js App

Projeto web de um card game temático de mitologia brasileira, com PvP, Museu (enciclopédia/quiz/mapa), perfis e ranking. Construído com Next.js (App Router), Tailwind CSS e integrações simples via API routes e Supabase.

## Visão geral

Experiência focada em dois eixos: combate PvP rápido e exploração cultural. O projeto prioriza fluidez de navegação (modais contextuais), identidade visual consistente e arquitetura simples para iteração rápida.

## Principais funcionalidades

- Home com cards de navegação e ambientação temática.
- PvP como modal de seleção de modo (Normal, Ranqueada, Personalizada) com editor de deck embutido e criação de sala.
- Museu como modal com três seções: Catálogo de Cartas, Quiz Cultural e Mapa das Lendas.
- Barra de navegação global:
	- Mobile: tab bar fixa no rodapé em todas as páginas.
	- Desktop: barra flutuante central inferior para alternar entre páginas.
	- Oculta automaticamente na tela de partida (`/pvp/game/[roomId]`).
- Editor de deck simples (limite 30 cartas, 1 cópia por carta neste protótipo) com salvamento em `/api/decks` (Supabase).

## Tech stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- Supabase JS SDK (@supabase/supabase-js)
  
## Arquitetura e organização

- App Router (src/app): páginas e API routes no mesmo espaço, favorecendo DX e prototipagem.
- Componentes reutilizáveis (src/components): UI, PvP e Museu em modais para reduzir navegação e manter contexto.
- Dados locais (src/data) e hooks (src/hooks) para autenticação e coleção.
- Integração leve com Supabase (src/lib/supabase) para persistência de decks.

### Módulos-chave

- GlobalNav: barra global (mobile tab + desktop flutuante), oculta em `/pvp/game/*` para foco total durante a partida.
- PvPModal: seleção de modo (Normal/Ranqueada/Personalizada) + editor de deck.
- MuseumModal: entrada às seções Catálogo, Quiz e Mapa.
- LoadingSpinner + app/loading: experiência de loading consistente globalmente e em imports dinâmicos.

### Decisões de arquitetura

- Modais para navegação rápida sem troca de página, mantendo o “flow” do usuário.
- Estado local simples e hooks dedicados para evitar complexidade prematura.
- APIs em memória para simulação rápida de salas/partidas, com caminho claro para evolução.

## Autenticação e coleção

- Hook `useAuth` gerencia estado básico de sessão no client.
- Hook `useCollection` carrega IDs de cartas do jogador via `/api/collection` (protótipo).
- `PvPModal` deriva visualização de coleção a partir de `cardsDatabase` + IDs do usuário.

## Estilo e UI

- Tailwind classes para molduras, gradientes e efeitos (e.g., moldura dourada e “diamond emblem”).
- `next/image` para imagens de fundo responsivas nos cards.
- Modais com `dynamic()` e fallback de loading usando `LoadingSpinner`.

## Licença / Créditos

Projeto educacional para prototipação. As imagens usadas são placeholders/demonstrativas, incluindo imagens geradas por IA;

