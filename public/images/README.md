# 🖼️ Estrutura de Imagens - Mitologia Brasileira

## 📁 Organização dos Diretórios

```
public/images/
├── cards/
│   ├── portraits/          # Imagens quadradas para cartas (512x640px)
│   └── full/              # Imagens completas de alta resolução (1024x1280px)
└── backgrounds/           # Fundos para regiões e interfaces
```

## 🎨 Especificações das Imagens

### Retratos de Cartas (`/portraits/`)
- **Formato**: JPG ou PNG
- **Dimensões**: 512x640px (4:5 aspect ratio)
- **Uso**: Interface de jogo, catálogo, mão do jogador
- **Estilo**: Foco no personagem/criatura, fundo simples

### Imagens Completas (`/full/`)
- **Formato**: JPG ou PNG
- **Dimensões**: 1024x1280px (4:5 aspect ratio)
- **Uso**: Visualização detalhada, modal de carta
- **Estilo**: Arte completa com ambientação

## 📋 Lista de Cartas para Criação

### ✅ Criaturas Descobertas (Prioridade Alta)
1. **curupira.jpg** - Protetor da floresta, pés virados
2. **iara.jpg** - Sereia dos rios amazônicos
3. **saci.jpg** - Moleque travesso de uma perna
4. **boto.jpg** - Golfinho cor-de-rosa transformado em homem
5. **mula.jpg** - Criatura sem cabeça galopando
6. **fulozinha.jpg** - Mulher pequena da caatinga

### 🔒 Criaturas Não Descobertas (Prioridade Média)
7. **boitata.jpg** - Serpente gigante de fogo
8. **cuca.jpg** - Bruxa jacaré assombração
9. **caboclo.jpg** - Espírito protetor das águas nordestinas

### ✨ Feitiços e Artefatos (Prioridade Baixa)
10. **protecao_floresta.jpg** - Ritual de cura da natureza
11. **ritual_paje.jpg** - Cerimônia ancestral

## 🎨 Diretrizes de Arte

### Estilo Visual
- **Tema**: Realismo fantástico brasileiro
- **Paleta**: Cores vibrantes da natureza brasileira
- **Atmosfera**: Mística, ancestral, respeitosa

### Por Região

#### 🌳 Amazônia
- Verde exuberante, rios, floresta densa
- Tons: Verde, azul, marrom terra

#### 🌵 Nordeste  
- Caatinga, sertão, cores quentes
- Tons: Amarelo, laranja, vermelho terra

#### 🏙️ Sudeste/Sul
- Ambiente urbano/rural misto
- Tons: Cinza, verde escuro, azul noturno

### Elementos Culturais
- Respeitar a tradição e folclore
- Evitar estereótipos ofensivos
- Valorizar a riqueza cultural brasileira

## 📝 Convenção de Nomenclatura

```
{nome_criatura}.jpg
```

Exemplos:
- `curupira.jpg`
- `iara.jpg` 
- `saci.jpg`
- `boto.jpg`
- `protecao_floresta.jpg`

## 🔄 Implementação no Código

As imagens serão automaticamente carregadas usando:

```javascript
// Para retrato
card.images.portrait = '/images/cards/portraits/curupira.jpg'

// Para imagem completa  
card.images.full = '/images/cards/full/curupira.jpg'
```

## 📱 Responsividade

As imagens serão otimizadas para:
- **Mobile**: Portraits 256x320px
- **Tablet**: Portraits 384x480px  
- **Desktop**: Portraits 512x640px
- **Modal**: Full 1024x1280px

## 🚀 Próximos Passos

1. Criar imagens das 6 criaturas descobertas primeiro
2. Testar no catálogo e gameplay
3. Criar imagens das criaturas não descobertas
4. Adicionar feitiços e artefatos
5. Criar fundos temáticos por região

## 💡 Dicas para Criação

- Use IA (Midjourney, DALL-E, Stable Diffusion)
- Prompts sugeridos: "Brazilian folklore creature, mystical, detailed art, fantasy style"
- Mantenha consistência visual entre as cartas
- Considere a legibilidade em tamanhos pequenos
