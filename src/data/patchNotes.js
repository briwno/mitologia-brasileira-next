// src/data/patchNotes.js
// Dados estruturados dos Patch Notes do jogo

export const VERSAO_ATUAL = '0.2.0';

export const patchNotes = [
  {
    versao: '0.2.0',
    titulo: 'Sistema Simplificado',
    data: '24 de Outubro, 2025',
    atual: true,
    secoes: [
      {
        tipo: 'removido',
        icone: '🗑️',
        titulo: 'Sistema Removido',
        cor: 'red',
        itens: [
          {
            destaque: 'Itens desativados:',
            descricao: 'Sistema de cartas de itens completamente removido do jogo'
          },
          {
            descricao: 'Decks agora usam apenas 5 lendas únicas (antes eram 5 lendas + 20 itens)'
          }
        ]
      },
      {
        tipo: 'balanceamento',
        icone: '🔮',
        titulo: 'Balanceamento',
        cor: 'purple',
        itens: [
          {
            descricao: 'Combates mais rápidos e estratégicos focados nas lendas'
          },
          {
            descricao: 'Cada carta de lenda agora tem maior impacto na partida'
          }
        ]
      },
      {
        tipo: 'em_desenvolvimento',
        icone: '🚧',
        titulo: 'Em desenvolvimento',
        cor: 'orange',
        itens: [
          {
            destaque: 'Batalha (PvP):',
            descricao: 'A tela e fluxo de batalha ainda estão em desenvolvimento e não estão finalizados para lançamento. Continuamos trabalhando para estabilizar e balancear a experiência.'
          },
          {
            destaque: 'Sistema de Amizade:',
            descricao: 'Sistema de amizade adicionado — permite adicionar/gerenciar amigos. Integração social será ampliada nas próximas atualizações.'
          },
          {
            destaque: 'Pets:',
            descricao: 'Sistema básico de pets incluído; pets serão integrados de forma mais interativa ao combate e à UI em atualizações futuras.'
          }
        ]
      },
      {
        tipo: 'interface',
        icone: '🔧',
        titulo: 'Interface',
        cor: 'blue',
        itens: [
          {
            descricao: 'Editor de deck atualizado para o novo formato simplificado'
          },
          {
            descricao: 'Inventário reorganizado - aba de itens marcada como "Em breve"'
          },
          {
            descricao: 'Museu atualizado com sistema de itens desativado temporariamente'
          }
        ]
      }
    ]
  },
  {
    versao: '0.1.0',
    titulo: 'Lançamento Beta',
    data: 'Outubro, 2025',
    atual: false,
    secoes: [
      {
        tipo: 'novidades',
        icone: '✨',
        titulo: 'Novidades',
        cor: 'green',
        itens: [
          {
            descricao: 'Sistema de batalha PvP em tempo real'
          },
          {
            descricao: 'Coleção de cartas baseadas no folclore brasileiro'
          },
          {
            descricao: 'Museu cultural com quiz educativo'
          },
          {
            descricao: 'Sistema de ranking e recompensas'
          },
          {
            descricao: 'Mapa das lendas brasileiras por região'
          }
        ]
      }
    ]
  }
];

export const proximasAtualizacoes = [
  {
    titulo: 'Sistema de Itens v2:',
    descricao: 'Reimplementação com novo design de gameplay'
  },
  {
    titulo: 'Torneios Sazonais:',
    descricao: 'Eventos competitivos com recompensas exclusivas'
  },
  {
    titulo: 'Mais Lendas:',
    descricao: 'Expansão do catálogo de cartas brasileiras'
  },
];

export const notaDesenvolvedor = {
  titulo: 'Nota do Desenvolvedor',
  mensagem: 'Obrigado por jogar Ka\'aguy!'
};
