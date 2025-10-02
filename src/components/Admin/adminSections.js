import Image from 'next/image';

const REGION_OPTIONS = ['Amazônia', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul', 'Nacional'].map((value) => ({
  value,
  label: value,
}));

const CARD_CATEGORY_OPTIONS = [
  'Guardiões da Floresta',
  'Espíritos das Águas',
  'Assombrações',
  'Protetores Humanos',
  'Entidades Místicas',
].map((value) => ({ value, label: value }));

const CARD_RARITY_OPTIONS = ['comum', 'raro', 'épico', 'lendário', 'mítico'].map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const CARD_ELEMENT_OPTIONS = ['Fogo', 'Água', 'Terra', 'Ar', 'Sombra', 'Espírito'].map((value) => ({
  value,
  label: value,
}));

const CARD_TAG_SUGGESTIONS = ['floresta', 'proteção', 'mito', 'apoio', 'fogo', 'água', 'raro'];

const ITEM_TYPE_OPTIONS = ['consumível', 'equipamento', 'artefato', 'relíquia', 'pergaminho'].map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const SEASON_SUGGESTIONS = ['Carnaval', 'São João', 'Festa Junina', 'Natal'];

let cachedCardOptions = null;

async function fetchCardOptions() {
  if (cachedCardOptions) return cachedCardOptions;

  const response = await fetch('/api/cards?limit=500', { cache: 'no-store' });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.error || 'Não foi possível carregar as cartas disponíveis.');
  }

  const cards = Array.isArray(json?.cards) ? json.cards : Array.isArray(json) ? json : [];
  const collator = new Intl.Collator('pt-BR');

  cachedCardOptions = cards
    .map((card) => ({
      value: card.id,
      label: card.name ? `${card.name} (${card.id})` : card.id,
      description: [card.region, card.rarity].filter(Boolean).join(' • ') || undefined,
    }))
    .sort((a, b) => collator.compare(a.label, b.label));

  return cachedCardOptions;
}

const CARD_COLUMNS = [
  { key: 'image', label: 'Prévia', render: (_, item) => item.image ? (
    <div className="relative h-16 w-12 overflow-hidden rounded-lg border border-slate-700/70">
      <Image
        src={item.image}
        alt={`Carta ${item.name}`}
        fill
        className="object-cover"
      />
    </div>
  ) : '—' },
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Nome' },
  { key: 'region', label: 'Região' },
  { key: 'rarity', label: 'Raridade' },
  { key: 'element', label: 'Elemento' },
  { key: 'ability', label: 'Habilidade inicial' },
];

const ITEM_CARD_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Nome' },
  { key: 'itemType', label: 'Tipo' },
  { key: 'rarity', label: 'Raridade' },
  { key: 'isTradeable', label: 'Negociável' },
];

const STORY_COLUMNS = [
  { key: 'slug', label: 'Slug' },
  { key: 'title', label: 'Título' },
  { key: 'region', label: 'Região' },
  { key: 'category', label: 'Categoria' },
  { key: 'featured', label: 'Em destaque' },
];

const PLAYER_COLUMNS = [
  { key: 'uid', label: 'UID' },
  { key: 'name', label: 'Nome' },
  { key: 'mmr', label: 'MMR' },
  { key: 'level', label: 'Nível' },
  { key: 'banned', label: 'Banido' },
];

const QUIZ_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Título' },
  { key: 'description', label: 'Descrição' },
  { key: 'created_at', label: 'Criado em' },
];

const CONTOS_FORM_FIELDS = [
  { name: 'slug', label: 'Slug', type: 'text', required: true },
  { name: 'cardId', label: 'Carta relacionada', type: 'text', helperText: 'Opcional: ID da carta vinculada.' },
  { name: 'titulo', label: 'Título', type: 'text', required: true },
  { name: 'subtitulo', label: 'Subtítulo', type: 'text' },
  { name: 'resumo', label: 'Resumo', type: 'textarea', rows: 3 },
  { name: 'corpo', label: 'Corpo do conto', type: 'textarea', rows: 8, required: true },
  { name: 'regiao', label: 'Região', type: 'select', options: REGION_OPTIONS },
  { name: 'categoria', label: 'Categoria', type: 'select', options: CARD_CATEGORY_OPTIONS },
  {
    name: 'tags',
    label: 'Marcadores do conto',
    type: 'multi-select',
    options: CARD_TAG_SUGGESTIONS.map((value) => ({ value, label: value })),
    allowCustomOptions: true,
    helperText: 'Marque os temas do conto ou adicione novos marcadores.',
  },
  { name: 'tema', label: 'Tema', type: 'text' },
  { name: 'fonte', label: 'Fonte', type: 'text' },
  { name: 'fonteUrl', label: 'URL da Fonte', type: 'text' },
  { name: 'imagemCapa', label: 'Imagem de capa (URL)', type: 'text' },
  { name: 'readTime', label: 'Tempo de leitura (min)', type: 'number' },
  { name: 'versao', label: 'Versão', type: 'number', defaultValue: 1 },
  { name: 'isActive', label: 'Publicado', type: 'boolean', defaultValue: true, switchLabel: 'Publicado' },
  { name: 'isFeatured', label: 'Em destaque', type: 'boolean', defaultValue: false, switchLabel: 'Em destaque' },
  { name: 'publishedAt', label: 'Publicado em (ISO)', type: 'text', placeholder: '2024-05-20T12:00:00Z' },
];

const CARD_FORM_FIELDS = [
  { name: 'id', label: 'ID', type: 'text', required: true, helperText: 'Identificador único (ex: curupira).' },
  { name: 'name', label: 'Nome', type: 'text', required: true },
  { name: 'region', label: 'Região', type: 'select', options: REGION_OPTIONS },
  { name: 'category', label: 'Categoria', type: 'select', options: CARD_CATEGORY_OPTIONS },
  {
    name: 'cardType',
    label: 'Tipo de carta',
    type: 'text',
    placeholder: 'lenda',
    suggestions: ['lenda', 'chefão', 'apoio'],
  },
  { name: 'rarity', label: 'Raridade', type: 'select', options: CARD_RARITY_OPTIONS },
  { name: 'element', label: 'Elemento', type: 'select', options: CARD_ELEMENT_OPTIONS },
  { name: 'attack', label: 'Ataque', type: 'number', defaultValue: 0 },
  { name: 'defense', label: 'Defesa', type: 'number', defaultValue: 0 },
  { name: 'health', label: 'Vida', type: 'number', defaultValue: 1 },
  { name: 'history', label: 'História / Lore', type: 'textarea', rows: 4 },
  {
    name: 'images',
    label: 'Imagens',
    type: 'object',
    helperText: 'Informe as URLs nas variações utilizadas no jogo (opcional).',
    fields: [
      { name: 'retrato', label: 'Retrato (vertical)', type: 'text', placeholder: '/images/cards/curupira-retrato.png' },
      { name: 'completa', label: 'Arte completa (horizontal)', type: 'text', placeholder: '/images/cards/curupira-completa.png' },
      { name: 'icone', label: 'Ícone (opcional)', type: 'text', placeholder: '/images/cards/curupira-icone.png' },
    ],
  },
  {
    name: 'tags',
    label: 'Marcadores',
    type: 'multi-select',
    options: CARD_TAG_SUGGESTIONS.map((value) => ({ value, label: value })),
    allowCustomOptions: true,
    helperText: 'Selecione marcadores sugeridos ou adicione novos termos.',
  },
  {
    name: 'abilities',
    label: 'Habilidades',
    type: 'abilities',
    helperText: 'Preencha as habilidades ativas e passiva. Campos vazios não serão salvos.',
    skillKeys: ['skill1', 'skill2', 'skill3', 'skill4', 'skill5'],
    kindOptions: [
      { value: 'damage', label: 'Dano' },
      { value: 'heal', label: 'Cura' },
      { value: 'buff', label: 'Buff' },
      { value: 'debuff', label: 'Debuff' },
      { value: 'stun', label: 'Atordoamento' },
      { value: 'support', label: 'Suporte' },
      { value: 'utility', label: 'Utilitário' },
    ],
  },
  { name: 'unlockCondition', label: 'Condição de desbloqueio', type: 'textarea', rows: 2 },
  {
    name: 'seasonalBonus',
    label: 'Bônus sazonal',
    type: 'object',
    helperText: 'Configure bônus aplicados em eventos especiais (opcional).',
    fields: [
      { name: 'season', label: 'Evento', type: 'text', suggestions: SEASON_SUGGESTIONS },
      { name: 'description', label: 'Descrição', type: 'textarea', rows: 2 },
      { name: 'multiplier', label: 'Multiplicador', type: 'number', helperText: 'Use 1.0 para neutro, 1.2 para +20% de força.' },
    ],
  },
  { name: 'isStarter', label: 'Carta inicial', type: 'boolean', defaultValue: false },
];

const ITEM_CARD_FORM_FIELDS = [
  { name: 'id', label: 'ID', type: 'text', required: true },
  { name: 'name', label: 'Nome', type: 'text', required: true },
  { name: 'description', label: 'Descrição', type: 'textarea', rows: 3 },
  { name: 'itemType', label: 'Tipo de item', type: 'select', options: ITEM_TYPE_OPTIONS },
  { name: 'rarity', label: 'Raridade', type: 'select', options: CARD_RARITY_OPTIONS },
  { name: 'effects', label: 'Efeitos (JSON)', type: 'json', helperText: 'Estrutura de efeitos aplicados.' },
  { name: 'lore', label: 'Lore', type: 'textarea', rows: 3 },
  {
    name: 'images',
    label: 'Imagens',
    type: 'object',
    helperText: 'Defina imagens específicas do item (opcional).',
    fields: [
      { name: 'retrato', label: 'Retrato', type: 'text' },
      { name: 'completa', label: 'Arte completa', type: 'text' },
      { name: 'icone', label: 'Ícone', type: 'text' },
    ],
  },
  { name: 'unlockCondition', label: 'Condição de desbloqueio', type: 'textarea', rows: 2 },
  { name: 'isTradeable', label: 'Pode ser negociado', type: 'boolean', defaultValue: true },
];

const PLAYER_FORM_FIELDS = [
  { name: 'uid', label: 'UID', type: 'text', required: true, helperText: 'Identificador único (auth).' },
  { name: 'name', label: 'Nome', type: 'text', required: true },
  { name: 'avatarUrl', label: 'Avatar (URL)', type: 'text' },
  { name: 'mmr', label: 'MMR', type: 'number', helperText: 'Pontuação ranqueada.' },
  { name: 'level', label: 'Nível', type: 'number' },
  { name: 'xp', label: 'XP', type: 'number' },
  { name: 'title', label: 'Título', type: 'text' },
  { name: 'banned', label: 'Banido', type: 'boolean', defaultValue: false },
  {
    name: 'collectionCards',
    label: 'Cartas desbloqueadas',
    type: 'multi-select',
    helperText: 'Marque quais cartas fazem parte da coleção do jogador.',
    optionsFetcher: fetchCardOptions,
  },
];

const QUIZ_FORM_FIELDS = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'description', label: 'Descrição', type: 'textarea', rows: 3 },
  { name: 'questions', label: 'Perguntas (JSON)', type: 'json', required: true, helperText: 'Lista de perguntas com alternativas.' },
];

export const ADMIN_SECTIONS = [
  {
    id: 'cards',
    groupLabel: 'Coleção',
    label: 'Cartas de Lenda',
    description: 'Gerencie os atributos das lendas jogáveis.',
    apiPath: '/api/cards',
    responseKey: 'cards',
    primaryKey: 'id',
    columns: CARD_COLUMNS,
    formFields: CARD_FORM_FIELDS,
    transformBeforeSubmit: (payload) => {
      const next = {
        ...payload,
        attack: payload.attack ?? 0,
        defense: payload.defense ?? 0,
        health: payload.health ?? 1,
      };

      if (!next.abilities) {
        delete next.abilities;
      }

      return next;
    },
    buildUpdateBody: (payload, current) => ({
      ...payload,
      id: current.id,
    }),
  },
  {
    id: 'itemCards',
    groupLabel: 'Coleção',
    label: 'Cartas de Item',
    description: 'Cadastre itens e equipamentos.',
    apiPath: '/api/item-cards',
    responseKey: 'itemCards',
    primaryKey: 'id',
    columns: ITEM_CARD_COLUMNS,
    formFields: ITEM_CARD_FORM_FIELDS,
    buildUpdateBody: (payload, current) => ({
      ...payload,
      id: current.id,
    }),
  },
  {
    id: 'stories',
    groupLabel: 'Museu',
    label: 'Contos e Narrativas',
    description: 'Organize o conteúdo editorial do museu.',
    apiPath: '/api/contos',
    responseKey: 'stories',
    primaryKey: 'id',
    columns: STORY_COLUMNS,
    formFields: CONTOS_FORM_FIELDS,
    mapItemToForm: (item) => ({
      id: item.id,
      slug: item.slug,
      cardId: item.cardId,
      titulo: item.title,
      subtitulo: item.subtitle,
      resumo: item.summary,
      corpo: item.body,
      regiao: item.region,
      categoria: item.category,
      tags: item.tags,
      tema: item.theme,
      fonte: item.source,
      fonteUrl: item.sourceUrl,
      imagemCapa: item.coverImage,
      readTime: item.readTime,
      versao: item.version,
      isActive: item.active,
      isFeatured: item.featured,
      publishedAt: item.publishedAt,
    }),
    buildCreateBody: (payload) => ({
      ...payload,
    }),
    buildUpdateBody: (payload, current) => ({
      id: current.id,
      ...payload,
    }),
  },
  {
    id: 'players',
    groupLabel: 'Comunidade',
    label: 'Jogadores',
    description: 'Administre perfis e atributos dos jogadores.',
    apiPath: '/api/players',
    responseKey: 'players',
    primaryKey: 'uid',
    deleteParam: 'uid',
    columns: PLAYER_COLUMNS,
    formFields: PLAYER_FORM_FIELDS,
    mapItemToForm: (item) => ({
      uid: item.uid,
      name: item.name,
      avatarUrl: item.avatarUrl || '',
      mmr: item.mmr,
      level: item.level,
      xp: item.xp,
      title: item.title,
      banned: item.banned,
      collectionCards: item.collectionCards || [],
    }),
    transformBeforeSubmit: (payload, current, mode) => {
      const { collectionCards = [], ...playerPayload } = payload;

      const base = {
        name: playerPayload.name,
        avatarUrl: playerPayload.avatarUrl || null,
        mmr: playerPayload.mmr ?? undefined,
        level: playerPayload.level ?? undefined,
        xp: playerPayload.xp ?? undefined,
        title: playerPayload.title ?? undefined,
        banned: playerPayload.banned ?? undefined,
      };

      if (mode === 'create') {
        const data = {
          uid: playerPayload.uid,
          name: playerPayload.name,
          avatarUrl: playerPayload.avatarUrl || null,
        };

        return {
          data,
          sideEffects: {
            collectionCards,
            uid: playerPayload.uid,
          },
        };
      }

      const filteredData = Object.fromEntries(
        Object.entries(base).filter(([, value]) => value !== undefined)
      );

      return {
        data: filteredData,
        sideEffects: {
          collectionCards,
          uid: current?.uid,
        },
      };
    },
    buildCreateBody: (payload) => payload,
    buildUpdateBody: (payload, current) => ({
      uid: current.uid,
      data: payload,
    }),
    handleSideEffects: async ({ sideEffects, selectedItem, response }) => {
      const collectionCards = Array.isArray(sideEffects?.collectionCards)
        ? sideEffects.collectionCards
        : [];
      const targetUid = sideEffects?.uid || response?.player?.uid || selectedItem?.uid;

      if (!targetUid) return;

      const request = await fetch('/api/collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: targetUid, cards: collectionCards }),
      });

      const json = await request.json();
      if (!request.ok) {
        throw new Error(json?.error || 'Não foi possível atualizar a coleção do jogador.');
      }
    },
    loadItemDetails: async (player) => {
      if (!player?.uid) return player;

      const response = await fetch(`/api/collection?uid=${encodeURIComponent(player.uid)}`, {
        cache: 'no-store',
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof json?.error === 'string'
            ? json.error
            : `Falha ao carregar a coleção do jogador (${player.uid}).`
        );
      }

      return {
        ...player,
        collectionCards: Array.isArray(json?.cards) ? json.cards : [],
      };
    },
  },
  {
    id: 'quizzes',
    groupLabel: 'Museu',
    label: 'Quizzes culturais',
    description: 'Mantenha os quizzes com perguntas e alternativas.',
    apiPath: '/api/quizzes',
    responseKey: 'quizzes',
    primaryKey: 'id',
    columns: QUIZ_COLUMNS,
    formFields: QUIZ_FORM_FIELDS,
    buildUpdateBody: (payload, current) => ({
      id: current.id,
      ...payload,
    }),
  },
];
