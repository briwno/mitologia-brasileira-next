# Ka'aguy — Jogo de Cartas de Mitologia Brasileira

![Logo Ka'aguy](./public/images/logo.svg)

> **"Adentre a Ka'aguy. Se for capaz."**

## Sumário

- [O que é Ka'aguy?](#o-que-é-kaaguy)
- [Por que Ka'aguy?](#por-que-kaaguy)
- [Recursos Principais](#recursos-principais)
- [Como Funciona](#como-funciona)
- [Tecnologias e Stack](#tecnologias-e-stack)
- [Arquitetura e Fluxos](#arquitetura-e-fluxos)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Começando](#começando)
- [Roadmap e Próximos Passos](#roadmap-e-próximos-passos)
- [Contribuição](#contribuição)
- [Licença](#licença)

## O que é Ka'aguy?

**Ka'aguy** é um **card game digital competitivo** que celebra o rico folclore brasileiro através de batalhas táticas PvP e exploração cultural interativa. Mais do que um jogo de cartas, Ka'aguy é uma ponte entre entretenimento e educação, onde cada partida é uma oportunidade de conhecer as lendas, mitos e personagens que moldaram a identidade cultural brasileira.

### O Nome

"Ka'aguy" vem do Tupi-Guarani e significa **"floresta"** ou **"mata"** — um lugar místico, cheio de vida e mistérios. Na cultura indígena, a floresta é onde habitam os espíritos, lendas e criaturas fantásticas. Nosso jogo convida você a adentrar essa floresta mítica e descobrir seus segredos.

### A Proposta

Combinamos:
- 🎮 **Mecânicas de jogo competitivas** inspiradas em TCGs clássicos (Magic, Hearthstone, Yu-Gi-Oh!)
- 🇧🇷 **Temática 100% brasileira** com cartas baseadas em Saci, Curupira, Iara, Boitatá, Caipora e dezenas de outras figuras folclóricas
- 📚 **Experiência educativa** através do Museu interativo, Quiz Cultural e Mapa das Lendas
- 🏆 **Progressão competitiva** com ranking, conquistas, eventos sazonais e recompensas

## Por que Ka'aguy?

### 1. Valorização Cultural
O folclore brasileiro é uma das culturas mais ricas e diversas do mundo, mas raramente é explorado em jogos digitais modernos. Ka'aguy traz essas lendas para o centro do palco, apresentando-as de forma envolvente e respeitosa.

### 2. Acessibilidade e Educação
Cada carta conta uma história. Ao jogar, você aprende sobre as origens regionais, significados culturais e contextos históricos de cada lenda. O modo Museu oferece:
- **Catálogo de Cartas**: fichas detalhadas de cada personagem com suas histórias
- **Quiz Cultural**: teste seus conhecimentos sobre o folclore brasileiro
- **Mapa das Lendas**: explore a origem geográfica de cada mito

### 3. Competitividade Estratégica
Sistema de combate baseado em fases, elementos (Terra, Água, Fogo, Ar, Espírito), posicionamento tático e gestão de recursos. Cada partida exige planejamento, adaptação e domínio das mecânicas.

### 4. Comunidade Brasileira
Um jogo feito **por brasileiros, para brasileiros**, totalmente em português.

## Recursos Principais

### 🎮 Modos de Jogo

#### Batalha PvP
- **Contra Bots**: Treine suas estratégias contra IA adaptativa
- **Online Ranqueada**: Suba no ranking e prove suas habilidades
- **Personalizada**: Crie salas privadas para jogar com amigos

#### Museu Cultural
- **Catálogo de Cartas**: Descubra todas as lendas e suas histórias completas
- **Quiz Cultural**: Responda perguntas sobre folclore e ganhe recompensas
- **Mapa das Lendas**: Explore a origem geográfica de cada mito brasileiro

### 🃏 Sistema de Cartas

- **13 Regiões Brasileiras**: cada uma com suas lendas características
- **5 Elementos**: Terra, Água, Fogo, Ar e Espírito
- **4 Raridades**: Comum, Raro, Épico e Lendário
- **Habilidades Únicas**: cada carta possui poderes especiais temáticos
- **Itens Místicos**: poções, artefatos e encantamentos baseados no folclore

### 🏆 Progressão e Economia

- **Sistema MMR**: classificação baseada em habilidade (Bronze → Lendário)
- **Missões Diárias**: complete objetivos para ganhar recompensas
- **Conquistas**: desbloqueie títulos e emblemas especiais
- **Loja e Boosters**: adquira novos pacotes de cartas
- **Moedas e Gemas**: economia dual para recompensas e compras

### 🎨 Experiência do Usuário

- **Navegação Modal**: fluxo fluido sem recarregar páginas
- **Interface Responsiva**: jogue no desktop ou mobile
- **Animações Suaves**: transições e efeitos visuais polidos
- **Design Atmosférico**: paleta escura com destaques em ciano, verde e dourado
- **Feedback Visual**: indicadores claros de estado, progressão e conquistas

## Como Funciona

### Fluxo de uma Partida

1. **Montagem de Deck**: Escolha 30 cartas seguindo as regras de balanceamento
2. **Busca por Oponente**: Sistema matchmaking baseado em MMR
3. **Início da Batalha**: Ambos jogadores começam com 5 cartas e 20 pontos de vida
4. **Fases do Turno**:
   - **Início**: Compre uma carta e ganhe mana
   - **Ação**: Invoque criaturas, use feitiços e itens
   - **Combate**: Ataque o oponente ou suas criaturas
   - **Final**: Efeitos de fim de turno
5. **Vitória**: Reduza a vida do oponente a zero ou force-o a não ter mais cartas

### Mecânicas Especiais

- **Sistema de Elementos**: vantagens e desvantagens entre elementos
- **Posicionamento Tático**: criaturas ocupam zonas no campo de batalha
- **Habilidades Ativadas**: poderes que podem ser usados durante a partida
- **Efeitos de Combo**: cartas que interagem entre si para resultados poderosos
- **Itens Permanentes**: equipamentos e encantamentos que ficam em jogo

## Tecnologias e Stack

### Frontend
- **Framework**: Next.js 15 (App Router) com React 19
- **Estilos**: Tailwind CSS 4 + componentes customizados
- **Estado**: Hooks customizados (`useGameState`, `useAuth`, `usePlayerData`)
- **Carregamento Dinâmico**: Code splitting com `dynamic()` do Next.js
- **Imagens**: Next/Image com otimização automática

### Backend
- **BaaS**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **API Routes**: Next.js API handlers organizados por domínio
- **Validações**: Zod para schemas e validação de dados
- **Autenticação**: Supabase Auth com Row Level Security (RLS)

### Infraestrutura
- **Deploy**: Vercel (CI/CD automático)
- **Banco de Dados**: PostgreSQL via Supabase
- **Storage**: Supabase Storage para assets de cartas e avatares
- **Linguagem**: TypeScript/JavaScript com ESLint

### Diferenciais Técnicos
- **100% Português**: Todo o código em português brasileiro
- **Modal-First**: Navegação contextual sem page reloads
- **SSR + CSR Híbrido**: Otimização de performance e SEO

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
## Roadmap e Próximos Passos

### Em Desenvolvimento

- [ ] Sistema de amizade e convites

### Próximas Features

- [ ] Eventos sazonais temáticos (Festas Juninas, Carnaval, etc.)
- [ ] Modo Campanha solo (história narrativa)
- [ ] Torneios automáticos semanais
- [ ] Sistema de clãs/guildas
- [ ] Marketplace de troca de cartas

### Melhorias Técnicas

- [ ] Internacionalização (EN, ES)
- [ ] Modo escuro/claro customizável

## Contribuição

Adoramos contribuições da comunidade! Seja você desenvolvedor, designer, ilustrador ou simplesmente um entusiasta do folclore brasileiro, há espaço para você no projeto.

### Como Contribuir

1. **Fork** o repositório
2. Crie uma **branch** para sua feature (`git checkout -b feature/nova-lenda`)
3. **Commit** suas alterações com mensagens descritivas em português
4. **Push** para a branch (`git push origin feature/nova-lenda`)
5. Abra um **Pull Request** detalhando:
   - O que foi implementado/corrigido
   - Screenshots ou vídeos (se aplicável)
   - Como testar as mudanças

### Áreas de Contribuição

- **Código**: Novas features, correções de bugs, otimizações
- **Design**: Ilustrações de cartas, backgrounds, UI/UX
- **Conteúdo**: Pesquisa de lendas, textos de cartas, quizzes
- **Documentação**: Tutoriais, guias, traduções
- **Testes**: Encontrar e reportar bugs, sugestões de balanceamento

### Diretrizes

- Todo código deve estar em **português brasileiro**
- Siga os padrões de estilo do projeto (ESLint)
- Componentes devem ser responsivos e acessíveis
- Consulte `src/lib/design.md` para manter consistência visual
- Respeite a temática cultural brasileira com autenticidade

## Licença

Este projeto está sob a **licença MIT** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

<div align="center">

**Ka'aguy** • *Onde as lendas ganham vida*

🌿 Feito com ❤️ no Brasil 🇧🇷

 • [Twitter](https://twitter.com/kaaguygame) • [Instagram](https://instagram.com/kaaguygame)

</div>
