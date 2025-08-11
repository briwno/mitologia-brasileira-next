# Componentes do Jogo - PvP

Este diretório contém os componentes separados para a interface do jogo PvP de mitologia brasileira.

## Componentes

### PlayerInfo
**Arquivo:** `PlayerInfo.js`
**Descrição:** Exibe informações do jogador (avatar, nome, vida) com moldura tribal animada.

**Props:**
- `avatar` (string): Caminho para a imagem do avatar
- `name` (string): Nome do jogador
- `hp` (number): Pontos de vida atual
- `color` (string): Cor do tema (usado para estilização)
- `isActive` (boolean): Se é o turno deste jogador
- `position` (string): Posição no layout ("left" por padrão)

### FieldIndicator
**Arquivo:** `FieldIndicator.js`
**Descrição:** Mostra o campo/terreno atual com ícone, nome e efeito.

**Props:**
- `currentField` (string): ID do campo atual
- `fields` (object): Objeto com dados de todos os campos
- `fieldTransitioning` (boolean): Se está em transição entre campos

### CardInField
**Arquivo:** `CardInField.js`
**Descrição:** Renderiza carta ativa em campo, com diferenças visuais para jogador e oponente.

**Props:**
- `card` (object): Dados da carta
- `position` (string): "player" ou "opponent"
- `bonusGlow` (boolean): Se deve mostrar efeito de bônus
- `isActive` (boolean): Se é o turno do dono da carta
- `onClick` (function): Callback ao clicar na carta
- `showMenu` (boolean): Se deve mostrar menu de habilidades
- `onSkillClick` (function): Callback para usar habilidade
- `onUltimateClick` (function): Callback para usar ultimate
- `onEndTurnClick` (function): Callback para finalizar turno
- `skillCooldown` (number): Turnos restantes de cooldown
- `ultimateCharge` (number): Carga atual do ultimate (0-100)
- `actionUsed` (boolean): Se já usou ação no turno

### Hand
**Arquivo:** `Hand.js`
**Descrição:** Exibe as cartas na mão do jogador com animações de hover e seleção.

**Props:**
- `cards` (array): Array de cartas na mão
- `selectedCard` (object): Carta atualmente selecionada
- `onCardSelect` (function): Callback ao selecionar carta
- `onCardPlay` (function): Callback ao jogar carta (duplo clique)
- `bonusGlow` (boolean): Se deve animar carta recém-comprada
- `newCardIndex` (number): Índice da carta nova (-1 se nenhuma)

### DeckPile
**Arquivo:** `DeckPile.js`
**Descrição:** Representa pilhas de cartas (baralho ou descarte) com contador.

**Props:**
- `count` (number): Número de cartas na pilha
- `type` (string): "deck" ou "discard"
- `position` (string): "right" ou "left"

### SkillButtons
**Arquivo:** `SkillButtons.js`
**Descrição:** Botões para usar habilidades básicas e ultimate.

**Props:**
- `card` (object): Carta com as habilidades
- `onSkillClick` (function): Callback para habilidade básica
- `onUltimateClick` (function): Callback para ultimate
- `skillCooldown` (number): Cooldown da habilidade
- `ultimateCharge` (number): Carga do ultimate
- `actionUsed` (boolean): Se já usou ação no turno
- `layout` (string): "horizontal" ou "vertical"

## Uso

```javascript
import { 
  PlayerInfo, 
  FieldIndicator, 
  CardInField, 
  Hand, 
  DeckPile, 
  SkillButtons 
} from './components/Game';

// Exemplo de uso dos componentes
<PlayerInfo 
  avatar="/images/avatars/player.jpg"
  name="Jogador"
  hp={100}
  isActive={true}
/>
```

## Benefícios da Separação

1. **Reutilização**: Componentes podem ser usados em outras partes do jogo
2. **Manutenibilidade**: Cada componente tem responsabilidade específica
3. **Testabilidade**: Cada componente pode ser testado isoladamente
4. **Legibilidade**: Código principal mais limpo e organizado
5. **Flexibilidade**: Fácil modificação de componentes individuais

## Estrutura de Arquivos

```
src/components/Game/
├── index.js           # Exportações centralizadas
├── PlayerInfo.js      # Info do jogador
├── FieldIndicator.js  # Indicador de campo
├── CardInField.js     # Carta ativa em campo
├── Hand.js           # Mão do jogador
├── DeckPile.js       # Pilhas de cartas
└── SkillButtons.js   # Botões de habilidades
```
