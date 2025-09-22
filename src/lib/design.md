# Tela de Combate - Layout e Funcionalidades

---

Com base nas especificações e regras do jogo, esta é a descrição completa da tela de combate para a equipe de design.

## Estrutura Geral

A tela de combate é dividida em duas áreas principais, com base na perspectiva do jogador:

1.  **Área do Jogador (Lado Branco)**: Fica na parte inferior da tela e contém todos os elementos interativos e informativos sobre o jogador.
2.  **Área do Adversário (Lado Vermelho)**: Fica na parte superior e mostra o campo do oponente.
3.  **Log de Eventos**: Uma seção lateral que registra todas as ações do jogo.

---

## Seção do Jogador (Parte Inferior)

### 1. Informações do Jogador
* **Posição**: Canto inferior esquerdo.
* **Conteúdo**: Um painel laranja que exibe:
    * **Foto do Jogador**: Imagem de perfil.
    * **Nome de Usuário**.
    * **Ranque**.
    * **Botão "Emote"**: Para comunicação rápida com o adversário.

### 2. Cartas e Banco
* **Banco de Cartas**: Conjunto de 4 cartas azuis à esquerda do centro.
    * **Função**: Representa as **4 criaturas no banco** que o jogador pode colocar em campo.
* **Pilha de Cartas de Itens**: Pilha de cartas verdes no canto inferior direito.
    * **Função**: Representa a **pilha de 20 cartas de itens** do jogo.
* **Cartas de Itens na Mão**: 3 espaços ("ITEM 1", "ITEM 2", "ITEM 3") na parte inferior central.
    * **Função**: O jogador pode ter no máximo **3 cartas de itens na mão** ao mesmo tempo.

### 3. Campo de Batalha do Jogador
* **Carta Ativa**: Um grande espaço roxo no centro da tela.
    * **Função**: Representa a **1 criatura em campo** que está ativa no turno.
* **Item Ativo**: Um espaço menor laranja ao lado da "Carta Ativa".
    * **Função**: Exibe a **carta de item que está ativa**, vinculada à criatura ou a outra carta em campo.

### 4. Botão de Ação
* **"Encerrar Turno"**: Botão oval azul posicionado na parte superior esquerda da área do jogador.
    * **Função**: Sinaliza o fim do turno, passando a vez para o adversário.

---

## Seção do Adversário (Parte Superior)

* **Layout Espelhado**: Esta área deve ter um layout semelhante ao do jogador para facilitar a compreensão.
* **Informações do Adversário**: Painel laranja no canto superior direito, com as mesmas informações (foto, nome e ranque).
* **Banco de Cartas**: Conjunto de cartas azuis no canto superior direito, representando as **4 criaturas no banco** do oponente.
* **Pilha de Cartas do Adversário**: Pilha de cartas verdes no canto superior esquerdo, representando a mão do oponente.

---

## Seção de Registro (Log de Eventos)

* **Posição**: Um painel azul no lado direito da tela, centralizado verticalmente.
* **Função**: Deve registrar em tempo real todas as ações da partida, como:
    * "Jogador X usou 'Ataque Rápido'."
    * "Jogador Y comprou uma carta."
    * "Jogador X ativou 'Poção de Cura'."
* **Objetivo**: Manter o jogador informado sobre o que está acontecendo no campo de batalha.