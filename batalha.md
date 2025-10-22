# ⚔️ Sistema de Batalha — Ka’aguy PvP

> Documento técnico e funcional do sistema de batalha em tempo real do jogo **Ka’aguy — Mitologia Brasileira Card Game**.

---

## 📜 Sumário

- [🎮 Modos de Batalha](#-modos-de-batalha)
- [🧩 Estrutura do Deck](#-estrutura-do-deck)
- [🃏 Estrutura das Cartas (Lendas)](#-estrutura-das-cartas-lendas)
- [🎒 Estrutura dos Itens](#-estrutura-dos-itens)
- [🧭 Estrutura da Partida](#-estrutura-da-partida)
- [⏱️ Sistema de Turnos e Tempo](#️-sistema-de-turnos-e-tempo)
- [📜 Sistema de Log](#-sistema-de-log)
- [⚙️ Estrutura Técnica](#️-estrutura-técnica)
- [🧠 Fluxo Resumido da Partida](#-fluxo-resumido-da-partida)
- [🧩 Condições de Vitória](#-condições-de-vitória)
- [💾 Salvamento de Dados](#-salvamento-de-dados)
- [🧱 Exemplo de Estado no Banco](#-exemplo-de-estado-no-banco-matchesstate)
- [🔮 Próximos Passos Técnicos](#-próximos-passos-técnicos)

---

## 🎮 Modos de Batalha

Ao abrir o **PvP Modal**, o jogador escolhe o modo desejado.  
Após selecionar o **deck**, o sistema gera automaticamente um **código de sala** com prefixo conforme o modo escolhido:

| Modo | Descrição | Código gerado |
|------|------------|----------------|
| 🤖 **Contra Bot** | Batalha offline contra IA local (sem Supabase Realtime) | `bot_xxx` |
| 🧍‍♂️ **PvP Ranqueada** | Enfrenta outro jogador via matchmaking (MMR) | `pvp_xxx` |
| 🫱 **Partida Personalizada** | Cria ou entra com código de sala compartilhado | `custom_xxx` |

---

## 🧩 Estrutura do Deck

Cada jogador deve montar um deck respeitando as seguintes regras:

- **5 Lendas** (cartas principais)
- **20 Itens**
- Nenhuma carta ou item pode ser repetido.
- O deck deve estar salvo e validado antes de iniciar qualquer modo PvP.

---

## 🃏 Estrutura das Cartas (Lendas)

Cada **carta de Lenda** possui:

- **4 Skills** (habilidades principais)
- **1 Ultimate**
- **1 Passiva**

| Tipo | Descrição |
|------|------------|
| ⚔️ **Skill** | Pode ser usada normalmente durante a vez do jogador. |
| 🌪️ **Ultimate** | Desbloqueada apenas após um número definido de turnos. Possui **1 PP (uso único)**. |
| 🌱 **Passiva** | Habilidade sempre ativa ou que se ativa em condições específicas de turno. |

---

## 🎒 Estrutura dos Itens

- Cada deck possui 20 itens possíveis.  
- No **início da partida**, o jogador compra **5 itens** e escolhe **3** para manter na mão.
- A **mão de itens** tem **limite máximo de 3**.

### 🧷 Atribuição de Itens
- Um item pode ser **vinculado a uma Lenda ativa**.
- Essa ação **não consome o turno**.
- O item permanece até:
  - A derrota da carta.
  - O uso máximo do item.
  - Efeitos que destroem ou removem o item.

---

## 🧭 Estrutura da Partida

### 🩸 Início — Turno 0

1. Cada jogador escolhe **qual Lenda vai iniciar** (as outras 4 ficam no banco).
2. São comprados **5 itens do baralho** → o jogador escolhe **3** para manter.
3. O jogo entra em estado de “início de combate”.

---

### 🔁 Turnos (1 em diante)

#### 📜 Ordem de execução
1. **Leitura de passivas:**  
   Ativam efeitos contínuos, cura, buffs ou penalidades automáticas.

2. **Ações do jogador:**  
   O jogador escolhe **UMA ação por turno**:
   - Usar uma skill da Lenda ativa.
   - Usar um item.
   - Trocar de Lenda.

   ➜ Todas as opções **consomem a vez do jogador.**

3. **Encerramento da vez:**  
   - Ao realizar a ação, o turno **é automaticamente encerrado após 3 segundos.**
   - O controle passa para o outro jogador.

4. **Encerramento do turno (global):**
   - O sistema registra no log as ações realizadas.
   - Lê novamente as passivas que se ativam “no início do turno”.
   - Caso haja espaço na mão (menos de 3 itens), um **novo item aleatório** é adicionado.

---

## ⏱️ Sistema de Turnos e Tempo

- Cada jogador possui **1 ação por turno**.
- A vez é encerrada **automaticamente após 3 segundos** da ação.
- O sistema não aguarda o outro jogador para processar o log —  
  tudo ocorre **de forma assíncrona e imediata**.

---

## 📜 Sistema de Log

Toda ação (uso de item, skill, ultimate, troca, passiva ativada) é registrada:

```json
{
  "turn": 3,
  "player": "jogador_a",
  "action": "usar_skill",
  "skill_id": "vento_das_matintas",
  "target": "curupira",
  "result": "causou 30 de dano",
  "timestamp": "2025-10-22T12:45:00Z"
}
🧠 Análise do Layout da Batalha

A imagem mostra uma estrutura clara e funcional de campo PvP:

Área	Função	Sugestão de componente
🧍‍♂️ Topo (Oponente)	Exibe nome, rank e emotes do adversário	<PlayerHUD side="top" />
💬 Itens do Oponente	Slots de itens ativos / equipados	<ItemSlot owner="opponent" />
🔥 Campo de Batalha (Centro)	Mostra a Lenda ativa de cada lado	<BattleField /> com <LegendCard />
🎴 Banco de Lendas (Inferior)	4 cartas reservas do jogador	<Bench />
💎 Itens do Jogador (Inferior)	Slots de mão de itens (máx 3)	<ItemHand />
👤 HUD do Jogador	Avatar, rank e botão de emotes	<PlayerHUD side="bottom" />
⏱️ Controle de Turno	Botão “Encerrar Turno” e status do turno	<TurnController />
📜 Log de Eventos (Direita)	Histórico das ações com timestamp	<BattleLog />