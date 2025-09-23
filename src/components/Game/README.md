# Tela de Batalha - Ka'aguy

## Visão Geral
A tela de batalha é o componente principal do jogo, onde ocorrem as partidas entre jogadores. Ela foi construída seguindo o design especificado em `src/lib/design.md` e é completamente reutilizável para diferentes modos de jogo.

## Arquitetura

### Componentes Principais

#### 1. `BattleScreen.js`
Componente principal que gerencia toda a interface de batalha:
- **Layout espelhado**: Área do jogador (inferior) e adversário (superior)
- **Posicionamento absoluto**: Elementos posicionados de forma precisa conforme o design
- **Responsivo**: Adaptável a diferentes tamanhos de tela
- **Reutilizável**: Pode ser usado em diferentes modos (PvP, vs Bot, etc.)

#### 2. `BattleCard.js`
Componente reutilizável para exibir cartas em diferentes contextos:
- **Tamanhos**: small (16x24), medium (20x28), large (32x44)
- **Tipos**: lenda, item, empty
- **Estados**: ativo, clicável, com stats
- **Efeitos visuais**: hover, escala, indicadores

#### 3. `useGameState.js`
Hook personalizado para gerenciar o estado do jogo:
- **Integração com MotorDeJogo**: Conecta a lógica de negócio com a UI
- **Gerenciamento de ações**: Processa ações do jogador
- **Estado reativo**: Atualiza a interface conforme o jogo evolui

### Estrutura de Layout

```
┌─────────────────────────────────────────────────────┐
│                 ÁREA DO ADVERSÁRIO                  │
│  [Info] [Banco] [Carta Ativa] [Item] [Pilha]      │
├─────────────────────────────────────────────────────┤
│                    DIVISÓRIA                        │
├─────────────────────────────────────────────────────┤
│                 ÁREA DO JOGADOR                     │
│  [Info] [Banco] [Mão Itens] [Carta Ativa] [Pilha] │
│              [Botão Encerrar Turno]                 │
└─────────────────────────────────────────────────────┘
                                              [Log]
```

## Funcionalidades Implementadas

### Interface do Jogador
- ✅ **Informações do Jogador**: Avatar, nome, ranking, energia
- ✅ **Banco de Lendas**: 4 slots para cartas de reserva (clicáveis)
- ✅ **Mão de Itens**: 3 slots para itens na mão (clicáveis)
- ✅ **Carta Ativa**: Lenda em campo com stats visíveis
- ✅ **Item Ativo**: Item equipado/ativo no campo
- ✅ **Pilha de Cartas**: Contador de cartas restantes
- ✅ **Botão Encerrar Turno**: Passa a vez para o oponente

### Interface do Adversário
- ✅ **Layout Espelhado**: Mesma estrutura do jogador
- ✅ **Informações Ocultas**: Cartas na mão aparecem como "???"
- ✅ **Estado Visual**: Mostra cartas ativas do oponente

### Sistema de Log
- ✅ **Registro de Ações**: Todas as ações são logadas
- ✅ **Timestamp**: Horário de cada ação
- ✅ **Scroll Automático**: Log mais recente sempre visível

### Integração com Game Logic
- ✅ **MotorDeJogo**: Conectado ao sistema de regras
- ✅ **Zonas de Campo**: Usa constantes definidas (ZONAS_CAMPO)
- ✅ **Fases do Jogo**: Respeita as fases (INICIO, ACAO, etc.)
- ✅ **Ações Válidas**: Valida ações conforme estado do jogo

## Como Usar

### 1. Navegação
Acesse através da modal PvP → "Contra Bots" ou diretamente em `/pvp/game/battle`

### 2. Ações Disponíveis
- **Trocar Lenda**: Clique em uma carta do banco
- **Usar Item**: Clique em um item na mão
- **Usar Habilidade**: Clique na carta ativa
- **Comprar Carta**: Clique na pilha de cartas
- **Encerrar Turno**: Clique no botão azul

### 3. Integração com Outros Modos
```javascript
<BattleScreen
  gameState={gameState}
  currentPlayer={player1}
  opponent={player2}
  onAction={handleAction}
  onEndTurn={handleEndTurn}
  mode="pvp" // ou "bot", "ranked", etc.
/>
```

## Arquivos Relacionados

### Componentes
- `src/components/Game/BattleScreen.js` - Tela principal
- `src/components/Game/BattleCard.js` - Componente de carta
- `src/hooks/useGameState.js` - Hook de estado do jogo

### Páginas
- `src/app/pvp/game/battle/page.js` - Página de exemplo/teste

### Utilitários
- `src/utils/gameLogic.js` - Motor do jogo
- `src/utils/constants.js` - Constantes do jogo

### Design
- `src/lib/design.md` - Especificação visual
- `public/images/playmat.svg` - Fundo do campo

## Próximos Passos

### Melhorias Planejadas
- [ ] **Animações**: Transições suaves entre ações
- [ ] **Efeitos Sonoros**: Feedback audio para ações
- [ ] **Tooltips**: Informações detalhadas ao hover
- [ ] **Mobile**: Otimização para dispositivos móveis
- [ ] **AI**: Integração com sistema de bot
- [ ] **Multiplayer**: Sincronização em tempo real

### Integração Pendente
- [ ] **Sistema de Ranking**: Conectar com ranking real
- [ ] **Coleção**: Usar cartas reais do banco de dados
- [ ] **Achievements**: Conquistas durante a batalha
- [ ] **Replay**: Sistema de gravação/replay

## Tecnologias Utilizadas
- **Next.js 15**: Framework React
- **Tailwind CSS**: Estilização
- **React Hooks**: Gerenciamento de estado
- **Next/Image**: Otimização de imagens
- **JavaScript Classes**: MotorDeJogo para lógica

## Considerações de Performance
- **Imagens Otimizadas**: Uso do Next/Image com sizes apropriados
- **Estados Locais**: Minimiza re-renders desnecessários
- **Memoização**: useCallback para funções de evento
- **Lazy Loading**: Carregamento sob demanda de assets