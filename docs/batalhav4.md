# ⚔️ Sistema de Batalha — Ka’aguy (v4)

> **“As lendas lutam, mas é a floresta quem decide o destino.”**

---

## 🌿 Visão Geral

O sistema de batalha de **Ka’aguy** combina estratégia por turnos com elementos narrativos inspirados no **folclore brasileiro**.  
Cada jogador comanda um **time de 5 lendas únicas**, enfrentando o oponente em combates táticos um contra um — enquanto a própria **floresta (Ka’aguy)** interfere através das **Relíquias Místicas**.

O sistema é construído para partidas rápidas, táticas e imprevisíveis, equilibrando planejamento, blefe e sorte espiritual.

---

## 🧬 Estrutura Geral da Partida

| Elemento | Descrição |
|-----------|-----------|
| **Time de Lendas** | 5 lendas por jogador (sem repetição). |
| **Campo** | 1 lenda ativa por jogador, 4 na reserva (banco espiritual). |
| **Relíquias** | 10 relíquias aleatórias concedidas pelo sistema. |
| **Condição de Vitória** | Derrotar as 5 lendas do oponente. |
| **Habilidades** | Cada lenda possui 4 habilidades, 1 ultimate e uma passiva. |
| **Ultimate** | Pode ser usada uma vez por partida, após X turnos ou outra forma de ativação. |

---

## 🔁 Estrutura de Turnos

Cada turno é dividido em quatro fases principais controladas pelo **Motor de Jogo (`gameLogic.js`)**:

| Fase | Descrição | Exemplos |
|------|------------|-----------|
| **1. Início** | Efeitos passivos e de campo são aplicados. Se o jogador não tiver Relíquia guardada, compra uma. | Regenerar energia, ativar buffs contínuos |
| **2. Ação** | O jogador escolhe: usar skill, trocar lenda, usar Relíquia ou passar turno. | Atacar, buffar, curar, usar Relíquia ofensiva |
| **3. Combate** | Cálculo de dano, resistências e efeitos. | Aplicação de dano e status |
| **4. Fim** | Efeitos temporários expiram, verifica-se vitória ou KO. | Envenenamento, relíquias de duração |

---

## 🧝‍♂️ Sistema de Lendas

- Cada lenda representa uma figura do **folclore brasileiro** (ex: Saci, Iara, Boitatá).  
- Possuem atributos base: **ataque, defesa, saúde e elemento**.  
- Habilidades:
  - **Básica** — sem custo, usada livremente.  
  - **Especial** — custo moderado, efeito forte.  
  - **Principal** — ação estratégica, pode alterar o estado do campo.  
  - **Ultimate** — única por partida, desbloqueada após X turnos.

---

## 🎴 Sistema de Relíquias

> *“Nem todas as forças na Ka’aguy obedecem à vontade dos mortais.”*

### ⚙️ Estrutura básica

- Cada jogador recebe **10 Relíquias aleatórias** no início da partida, concedidas pela própria floresta.  
- As Relíquias **não pertencem ao deck do jogador**, são um sistema separado.  
- Cada jogador pode manter **apenas 1 Relíquia guardada** por vez no **espaço de Relíquia**.  
- Quando o monte de 10 acaba e a batalha ainda não terminou, o sistema **concede mais 10 aleatórias** automaticamente.

---

### 🧭 Estados possíveis

| Estado | Descrição |
|---------|-----------|
| 🟤 **Monte de Relíquias** | Lote de 10 relíquias disponíveis. |
| 🟢 **Guardada (Espaço de Relíquia)** | Relíquia pronta para uso, não revelada. |
| 🔵 **Ativa / em campo** | Efeito em execução ou anexado a uma carta. |
| ⚫ **Descartada** | Já usada ou expirada. |

---

### 🪶 Regras de ação

| Ação | Consome ação? | Visível para o oponente? |
|------|----------------|---------------------------|
| Comprar Relíquia | ❌ Não | ⚪ Sim (sabe que você pegou algo) |
| Usar Relíquia (suporte / campo / anexa) | ❌ Não | 🟡 Sim, quando o efeito acontece |
| Usar Relíquia (ofensiva / interage com oponente) | ✅ Sim | 🔴 Sim, revelada ao usar |
| Relíquias passivas ou contínuas | ❌ Não | ⚪ Sim (visível ao entrar) |

---

### 🔒 Sigilo e revelação

- O oponente **sabe que o jogador possui uma Relíquia guardada**,  
  mas **não sabe qual** até ela ser usada.  
- Ao ser ativada, a Relíquia é **revelada e resolvida**.  
- Algumas podem conter **efeitos secretos** (*efeitos ocultos, revelados apenas após resolver*).

---

### 🌩️ Tipos de Relíquias

| Tipo | Descrição | Consome ação |
|------|------------|--------------|
| 🌿 **Campo** | Altera o ambiente ou concede bônus globais. | ❌ |
| 🔥 **Ataque** | Dano direto, selamento, status negativos. | ✅ |
| 🛡️ **Defesa** | Protege, reflete ou nega dano. | ❌ |
| 💫 **Buff / Debuff** | Modifica atributos de lendas. | depende |
| 🪄 **Espiritual** | Efeitos místicos ligados a morte, renascimento, karma. | depende |
| 🕯️ **Oculta** | Efeito secreto até a resolução. | variável |

---

### 🔁 Fluxo das Relíquias em jogo

1. **Início de turno:**  
   - Se o jogador não tiver relíquia guardada → compra 1 aleatória (sem custo).  

2. **Durante o turno:**  
   - Pode usar a Relíquia guardada a qualquer momento.  
   - Se for ofensiva → consome ação.  
   - Se for suporte/campo → não consome.  

3. **Após uso:**  
   - Relíquias instantâneas são descartadas.  
   - As anexadas (a cartas ou ao campo) liberam o espaço de Relíquia.  
   - Jogador pode comprar outra no próximo turno.  

4. **Fim de lote:**  
   - Quando as 10 terminam e o jogo continua, o sistema concede **mais 10 novas aleatórias**.  

---

### 💭 Filosofia de design

> As Relíquias não pertencem aos jogadores.  
> Elas são dádivas e armadilhas da floresta — fragmentos de poder que a **Ka’aguy** concede e retira conforme sua vontade.  
> Saber **quando** e **como** usá-las é o verdadeiro teste do guerreiro espiritual.

---

## 🪵 Exemplos práticos

| Nome | Tipo | Efeito | Consome ação |
|------|------|---------|---------------|
| 🌕 **Amuleto de Jaci** | Suporte | Cura 3 de HP da lenda ativa. | ❌ |
| 🔥 **Raiz de Boitatá** | Ataque | Causa 3 de dano direto ao oponente. | ✅ |
| 🌿 **Coração da Ka’aguy** | Campo | Todas as lendas recuperam 1 HP por turno. | ❌ |
| 💀 **Pó da Pisadeira** | Oculta | Faz o oponente perder 1 turno de ação (efeito secreto). | ✅ |
| 🪞 **Espelho da Iara** | Defesa | Reflete o próximo ataque recebido. | ❌ |

---

## 🧠 Arquitetura e integração

| Arquivo | Função |
|----------|--------|
| `src/utils/gameLogic.js` | Motor principal da batalha e controle de fases. |
| `src/utils/relicSystem.js` | Lógica de compra, uso e reciclagem de Relíquias. |
| `src/hooks/useGameState.js` | Estado global do jogador durante a partida. |
| `src/components/PvP/BattleScreen.js` | Interface da batalha (campo, lendas, Relíquia). |
| `src/components/UI/BattleLog.js` | Exibição dos eventos (ataques, efeitos, Relíquias usadas). |

---

## 🏁 Condição de Vitória

- Um jogador **vence** quando derrota todas as 5 lendas do oponente.  
- Se ambas ficarem sem lendas no mesmo turno → **empate espiritual** (a floresta decide).  

---

## 🔮 Futuras expansões

- [ ] Introduzir **Relíquias regionais** com identidade cultural (Norte, Nordeste, etc).  
- [ ] **Eventos climáticos** permanentes (chuva, seca, eclipse).  
- [ ] **Relíquias sinérgicas com elementos** (Terra, Água, Fogo, Ar, Espírito).  
- [ ] **Sistema de raridade** para as Relíquias (Comum → Mítica).  

---

## ✨ Conclusão

A batalha em **Ka’aguy** é mais que força — é **intuição e respeito à floresta**.  
Cada turno é uma dança entre estratégia e sorte, onde até os deuses dormem…  
e as **Relíquias da Ka’aguy** decidem quem desperta vitorioso.

---

> *“Na Ka’aguy, o poder não é conquistado — é concedido.”*
