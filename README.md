# Batalha dos Encantados — Next.js App

Embarque no folclore brasileiro em um card game moderno: PvP dinâmico, exploração cultural e uma interface elegante.

![last commit](https://img.shields.io/github/last-commit/briwno/mitologia-brasileira-next?style=for-the-badge)
![top language](https://img.shields.io/github/languages/top/briwno/mitologia-brasileira-next?style=for-the-badge)
![languages count](https://img.shields.io/github/languages/count/briwno/mitologia-brasileira-next?style=for-the-badge)

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
---

## Sumário

- [Visão geral](#visão-geral)
- [Principais funcionalidades](#principais-funcionalidades)
- [Tech stack](#tech-stack)
- [Arquitetura e organização](#arquitetura-e-organização)
	- [Módulos-chave](#módulos-chave)
	- [Decisões de arquitetura](#decisões-de-arquitetura)
- [Autenticação e coleção](#autenticação-e-coleção)
- [Estilo e UI](#estilo-e-ui)
- [Licença / Créditos](#licença--créditos)

---

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

Projeto educacional para prototipação. As imagens usadas são placeholders/demonstrativas; substitua por assets licenciados para produção.

