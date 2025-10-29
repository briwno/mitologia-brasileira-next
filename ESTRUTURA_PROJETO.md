 # Estrutura do Projeto — Mitologia Brasileira (card game)

 Este documento descreve a estrutura atual do repositório e os principais pontos de entrada.

 ## Visão rápida

 - Nome: mitologia-brasileira-next
 - Next.js: 15.4.5
 - React: 19.1.0
 - Estilização: Tailwind CSS (v4)
 - Backend leve: Next.js API Routes + Supabase (Postgres)
 - Deploy alvo: Vercel

 ## Estrutura de diretórios (resumo)

 ```
 mitologia-brasileira-next/
 ├─ package.json
 ├─ next.config.mjs
 ├─ eslint.config.mjs
 ├─ postcss.config.mjs
 ├─ vercel.json
 ├─ public/
 │  └─ images/ (avatars, banners, cards/, portraits/)
 └─ src/
        ├─ app/                   # Páginas (Next App Router)
        │  ├─ layout.js
        │  ├─ globals.css
        │  ├─ page.js
        │  ├─ loading.js
        │  ├─ providers.js
        │  ├─ adm/
        │  ├─ login/
        │  ├─ museum/ (cards/, map/, quiz/)
        │  ├─ profile/ (friends/, pet/)
        │  ├─ pvp/ (battle/, deck/, teste/)
        │  ├─ ranking/ (top/, rewards/)
        │  ├─ shop/
        │  └─ api/ (auth/, cards/, decks/, boosters/, matchmaking/, friends/, players/, profile/, quizzes/, contos/, item-cards/, constants/)
        ├─ components/             # Componentes React (UI, Card, PvP, Pet, Admin, etc.)
        │  ├─ PvP/                 # componentes de batalha (BattleScreen.jsx, BenchSlots.jsx, TurnController.jsx, etc.)
        │  ├─ Card/                # CardDetail, CardImage, CardList, CardModal, ItemCard
        │  ├─ Deck/                # DeckBuilder.js
        │  ├─ Museum/              # BrazilMap.js, MuseumModal.js
        │  ├─ Pet/                 # PetWidget, PetAvatar, PetBubble, GlobalPetPortal
        │  ├─ Player/              # PlayerProfile, PlayerCoins
        │  ├─ Admin/               # AdminLayout, adminSections, CrudSection
        │  └─ UI/                  # GlobalNav, Icon, LoadingSpinner, PageLayout, PatchNotesModal
        ├─ data/                   # SQL e dados locais (supabase_v2.sql, correcaorlcs.sql, petPhrases.js, patchNotes.js)
        ├─ hooks/                  # Hooks customizados (useAuth, useGameState, useCollection, usePlayerData, usePet, useFriends, useMMR)
        ├─ lib/                    # utilitários de infra (supabase.js, design.md)
        ├─ services/               # Serviços (cardService.js, cartasServico.js, etc.)
        └─ utils/                  # Lógica de jogo e utilitários (battleSystem.js, cardUtils.js, deckValidation.js, boosterSystem.js, mmrUtils, valores, etc.)
 ```

 ## Pontos relevantes / Módulos principais

 - Sistema de PvP e batalha
     - Componentes de batalha estão em `src/components/PvP` e telas em `src/app/pvp` (ex.: `BattleScreen.jsx`, `TurnController.jsx`, `pvp/battle/page.js`).
     - Lógica utilitária relacionada a combate está em `src/utils/battleSystem.js`.

 - Matchmaking
     - Endpoints em `src/app/api/matchmaking/*` e componentes em `src/components/Matchmaking`.

 - Deck / Coleção
     - Validação e construção de decks em `src/utils/deckValidation.js` e `src/components/Deck/DeckBuilder.js`.

 - Museu (conteúdo cultural)
     - Páginas em `src/app/museum/*` e componentes relacionados em `src/components/Museum`.

 - Perfil, Amigos e Pet
     - Páginas em `src/app/profile/*` e componentes em `src/components/Profile` e `src/components/Pet`.

 - API Routes
     - Rotas serverless organizadas sob `src/app/api` (autenticação, cards, decks, players, quizzes, boosters, friends, etc.).

 ## Tecnologias e dependências principais

 - Next.js 15.4.5
 - React 19.1.0
 - Tailwind CSS v4
 - Supabase (@supabase/supabase-js v2)
 - Drizzle ORM (opcional para integrações)

 ## Como rodar localmente (rápido)

 Em PowerShell (Windows):

 ```powershell
 npm install
 npm run dev
 ```

 ## Convenções e observações

 - O projeto utiliza o App Router do Next.js (páginas dentro de `src/app`).
 - Componentes interativos do jogo ficam em `src/components` (muitos são Client Components). Siga a convenção existente ao adicionar novos componentes.
 - Dados e scripts SQL usados pelo Supabase estão em `src/data`.
 - Prefira centralizar regras de jogo em `src/utils` para evitar duplicação.

 ## Notas finais

 - Este documento foi atualizado para refletir a estrutura atual do repositório e as dependências presentes em `package.json`.
 - Se quiser, posso gerar uma versão mais detalhada (lista completa de arquivos) ou incluir diagramas simples das dependências entre módulos.

