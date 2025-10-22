# Estrutura do Projeto - Mitologia Brasileira Card Game

## 📁 Estrutura de Diretórios

```
mitologia-brasileira-next/
│
├── 📄 Arquivos de Configuração
│   ├── eslint.config.mjs          # Configuração ESLint
│   ├── jsconfig.json              # Configuração JavaScript
│   ├── next.config.mjs            # Configuração Next.js
│   ├── package.json               # Dependências do projeto
│   ├── postcss.config.mjs         # Configuração PostCSS
│   └── vercel.json                # Configuração Vercel
│
├── 📝 Documentação
│   ├── README.md                  # Documentação principal
│   ├── SISTEMA_BATALHA.md         # Documentação do sistema de batalha
│   ├── TESTES_BATALHA.md          # Testes do sistema de batalha
│   └── WARP.md                    # Documentação adicional
│
├── 🌐 public/
│   └── images/
│       ├── README.md              # Guia de recursos visuais
│       ├── avatars/               # Avatares de jogadores
│       ├── banners/               # Banners e imagens promocionais
│       └── cards/
│           └── portraits/         # Retratos das cartas
│
└── 💻 src/
    │
    ├── 📱 app/                    # Páginas e rotas (Next.js App Router)
    │   ├── globals.css            # Estilos globais
    │   ├── layout.js              # Layout principal
    │   ├── loading.js             # Componente de loading
    │   ├── page.js                # Página inicial
    │   ├── providers.js           # Provedores de contexto
    │   │
    │   ├── adm/                   # Área administrativa
    │   │   └── page.js
    │   │
    │   ├── api/                   # API Routes
    │   │   ├── auth/              # Autenticação
    │   │   ├── boosters/          # Sistema de boosters
    │   │   ├── cards/             # Gerenciamento de cartas
    │   │   ├── collection/        # Coleção de cartas
    │   │   │   └── inventory/     # Inventário
    │   │   ├── constants/         # Constantes da API
    │   │   ├── contos/            # Histórias/Contos
    │   │   ├── decks/             # Gerenciamento de decks
    │   │   ├── friends/           # Sistema de amigos
    │   │   ├── item-cards/        # Cartas de itens
    │   │   ├── matchmaking/       # Sistema de matchmaking
    │   │   │   ├── accept/        # Aceitar partida
    │   │   │   ├── join/          # Entrar em partida
    │   │   │   └── leave/         # Sair da partida
    │   │   ├── players/           # Dados de jogadores
    │   │   ├── profile/           # Perfil do jogador
    │   │   └── quizzes/           # Sistema de quiz
    │   │
    │   ├── card_inventory/        # Inventário de cartas
    │   │   └── page.js
    │   │
    │   ├── divulgar/              # Página de divulgação
    │   │   └── page.js
    │   │
    │   ├── login/                 # Página de login
    │   │   └── page.js
    │   │
    │   ├── museum/                # Museu de cultura
    │   │   ├── page.js
    │   │   ├── cards/             # Exposição de cartas
    │   │   ├── map/               # Mapa das lendas
    │   │   └── quiz/              # Quiz cultural
    │   │
    │   ├── profile/               # Perfil do jogador
    │   │   ├── page.js
    │   │   ├── friends/           # Lista de amigos
    │   │   └── pet/               # Sistema de pet
    │   │
    │   ├── pvp/                   # Modo PvP
    │   │   ├── page.js
    │   │   └── deck/              # Seleção de deck
    │   │
    │   ├── ranking/               # Sistema de ranking
    │   │   ├── page.js
    │   │   ├── rewards/           # Recompensas
    │   │   └── top/               # Top jogadores
    │   │
    │   └── shop/                  # Loja do jogo
    │       └── page.js
    │
    ├── 🧩 components/             # Componentes React
    │   ├── Admin/                 # Componentes administrativos
    │   │   ├── AdminLayout.js
    │   │   ├── adminSections.js
    │   │   └── CrudSection.js
    │   │
    │   ├── Auth/                  # Componentes de autenticação
    │   │
    │   ├── Board/                 # Componentes do tabuleiro
    │   │   └── BoardBackground.js
    │   │
    │   ├── Card/                  # Componentes de cartas
    │   │   ├── CardDetail.js
    │   │   ├── CardImage.js
    │   │   ├── CardList.js
    │   │   ├── CardModal.js
    │   │   └── ItemCard.js
    │   │
    │   ├── Deck/                  # Componentes de deck
    │   │   └── DeckBuilder.js
    │   │
    │   ├── Matchmaking/           # Componentes de matchmaking
    │   │
    │   ├── Museum/                # Componentes do museu
    │   │   ├── BrazilMap.js
    │   │   └── MuseumModal.js
    │   │
    │   ├── Pet/                   # Componentes do pet
    │   │   ├── index.js
    │   │   ├── PetAvatar.js
    │   │   ├── PetBubble.js
    │   │   └── PetWidget.js
    │   │
    │   ├── Player/                # Componentes do jogador
    │   │   ├── PlayerCoins.js
    │   │   └── PlayerProfile.js
    │   │
    │   ├── Profile/               # Componentes de perfil
    │   │   ├── EditProfileModal.js
    │   │   └── ProfileModal.js
    │   │
    │   ├── PvP/                   # Componentes PvP
    │   │   └── PvPModal.js
    │   │
    │   ├── Ranking/               # Componentes de ranking
    │   │   └── RankingModal.js
    │   │
    │   └── UI/                    # Componentes de interface
    │       ├── GlobalNav.js
    │       ├── Icon.js
    │       ├── ItemTooltip.js
    │       ├── LoadingSpinner.js
    │       └── PageLayout.js
    │
    ├── 📊 data/                   # Dados do jogo
    │   ├── correcaorlcs.sql       # Scripts SQL
    │   ├── petPhrases.js          # Frases do pet
    │   ├── supabase_v2.sql        # Schema do banco
    │   ├── importado_banco/       # Dados importados (CSV)
    │   │   ├── cards.csv
    │   │   └── collections.csv
    │   └── localData/             # Dados locais
    │
    ├── 🎣 hooks/                  # React Hooks customizados
    │   ├── useAuth.js             # Hook de autenticação
    │   ├── useCollection.js       # Hook de coleção
    │   ├── useFriends.js          # Hook de amigos
    │   ├── useMMR.js              # Hook de MMR/ranking
    │   ├── usePet.js              # Hook do pet
    │   └── usePlayerData.js       # Hook de dados do jogador
    │
    ├── 📚 lib/                    # Bibliotecas e configurações
    │   ├── design.md              # Guia de design
    │   └── supabase.js            # Cliente Supabase
    │
    ├── 🔧 services/               # Serviços
    │   └── cartasServico.js       # Serviço de cartas
    │
    └── 🛠️ utils/                  # Utilitários
        ├── api.js                 # Helpers de API
        ├── boosterSystem.js       # Sistema de boosters
        ├── cardUtils.js           # Utilitários de cartas
        ├── constants.js           # Constantes do jogo
        ├── constantsAPI.js        # Constantes de API
        ├── deckValidation.js      # Validação de deck
        ├── gameDataSeeder.js      # Populador de dados
        ├── mmrUtils.js            # Utilitários de MMR
        ├── normalizadores.js      # Funções de normalização
        ├── seasonalEvents.js      # Eventos sazonais
        └── valores.js             # Valores do jogo
```

## 📋 Descrição dos Principais Módulos

### 🎮 Sistema de Jogo
- **PvP**: Modo jogador vs jogador (em desenvolvimento após remoção do sistema anterior)
- **Matchmaking**: Sistema de emparelhamento de jogadores
- **Deck Builder**: Construção e gerenciamento de decks
- **Ranking**: Sistema de classificação e MMR

### 🏛️ Museu Cultural
- **Cards**: Exposição de cartas e lendas
- **Map**: Mapa interativo do Brasil com lendas regionais
- **Quiz**: Sistema de quiz sobre mitologia brasileira

### 👤 Sistema de Jogador
- **Profile**: Perfil do jogador com estatísticas
- **Friends**: Sistema de amizades
- **Pet**: Mascote personalizado do jogador
- **Collection**: Gerenciamento de coleção de cartas

### 🛒 Economia do Jogo
- **Shop**: Loja de boosters e itens
- **Boosters**: Sistema de pacotes de cartas
- **Coins**: Moeda do jogo

### 🔐 Infraestrutura
- **Auth**: Sistema de autenticação com Supabase
- **API Routes**: Backend serverless com Next.js
- **Database**: PostgreSQL via Supabase

## 🚀 Tecnologias Utilizadas

- **Framework**: Next.js 15
- **UI**: React + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Deploy**: Vercel

## 📝 Notas

- O sistema de batalha foi removido e está em fase de reconstrução
- A estrutura segue o padrão App Router do Next.js 13+
- Todos os componentes são Client Components devido à natureza interativa do jogo
