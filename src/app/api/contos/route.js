// src/app/api/contos/route.js
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin, supabaseAdmin, supabase } from '@/lib/supabase';

function formatStory(row) {
  return {
    id: row.id,
    slug: row.slug,
    cardId: row.card_id,
    title: row.titulo,
    subtitle: row.subtitulo,
    summary: row.resumo,
    body: row.corpo,
    region: row.regiao,
    category: row.categoria,
    tags: row.tags || [],
    theme: row.tema,
    source: row.fonte,
    sourceUrl: row.fonte_url,
    coverImage: row.imagem_capa,
    readTime: row.estimated_read_time,
    version: row.versao,
    featured: row.is_featured,
    active: row.is_active,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const debug = searchParams.get('debug');
    
    // Endpoint temporário de contorno enquanto permissions não funcionam
    if (debug === 'mock') {
      const cardId = searchParams.get('cardId');
      const mockStories = [
        {
          id: 1,
          slug: 'curupira-vigilia-das-trilhas',
          cardId: 'curupira',
          title: 'A Vigília de Curupira',
          subtitle: 'Guardião dos Passos Trocados',
          summary: 'O Curupira confunde caçadores para proteger a mata.',
          body: 'O Curupira, de pés virados, acompanha silenciosamente quem invade a mata sem respeito. Dizem que ele ouve o estalar de cada galho e sente o hálito de cada caçador.\n\nQuando o abuso começa, ele reverte trilhas, confunde bússolas e sopra um vento quente que entorpece o julgamento. Muitos retornam acreditando ter caminhado dias. Outros, simplesmente, não encontram o caminho de volta.\n\nEste conto lembra: a floresta não é vazia — ela observa.',
          region: 'Amazônia',
          category: 'Guardiões da Floresta',
          tags: ['curupira','floresta','proteção'],
          active: true,
          readTime: 4
        },
        {
          id: 2,
          slug: 'boitata-serpente-de-fogo',
          cardId: 'boitata',
          title: 'Boitatá, Serpente de Fogo',
          subtitle: 'O Olho Incandescente',
          summary: 'A guardiã flamejante das noites sem lua.',
          body: 'Quando a noite engole a mata e o breu ameaça, a Boitatá serpenteia como brasa viva. Alimenta-se de fogo injusto: tochas que devastam, queimadas sem propósito.\n\nQuem a encara diretamente diz perder o sono por semanas, vendo faíscas dançando sob as pálpebras.\n\nAgricultores prudentes deixam um vaso de água na beira do roçado — oferenda humilde para que a guardiã siga adiante.\n\nSua presença lembra: luz pode proteger ou destruir.',
          region: 'Amazônia',  
          category: 'Espíritos do Fogo',
          tags: ['boitata','fogo','proteção'],
          active: true,
          readTime: 4
        }
      ];
      
      const filtered = cardId ? mockStories.filter(s => s.cardId === cardId) : mockStories;
      return NextResponse.json({ stories: filtered });
    }
    
    // Tenta admin; se ausente, usa client público com RLS (apenas ativos)
    let client = supabaseAdmin;
    if (!client) {
      if (!supabase) {
        console.error('[contos API] Nenhum client Supabase disponível (faltam variáveis de ambiente).');
        return NextResponse.json({ error: 'Configuração Supabase ausente' }, { status: 500 });
      }
      client = supabase;
    }
    
    const cardId = searchParams.get('cardId');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const active = searchParams.get('active');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    let query = client.from('contos').select('*');

    if (cardId) query = query.eq('card_id', cardId);
    if (active === 'true') {
      query = query.eq('is_active', true);
    } else if (active === 'false') {
      query = query.eq('is_active', false);
    } else {
      // RLS só permite is_active=true para anon/authenticated conforme policy
      query = query.eq('is_active', true);
    }
    if (search) {
      query = query.or(`titulo.ilike.%${search}%,corpo.ilike.%${search}%,resumo.ilike.%${search}%`);
    }
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    query = query.order('published_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ stories: (data || []).map(formatStory) });
  } catch (e) {
    console.error('Contos GET error', e);
    if (e && e.code === '42501') {
      return NextResponse.json({ error: 'Permissão negada: verifique RLS/policies ou use chave service role no backend.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Erro ao carregar contos' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = requireSupabaseAdmin();
    const body = await request.json();
    const required = ['slug', 'titulo', 'corpo'];
    for (const r of required) {
      if (!body[r]) return NextResponse.json({ error: `Campo obrigatório: ${r}` }, { status: 400 });
    }

    const insertPayload = {
      slug: body.slug,
      card_id: body.cardId || null,
      titulo: body.titulo,
      subtitulo: body.subtitulo || null,
      resumo: body.resumo || null,
      corpo: body.corpo,
      regiao: body.regiao || null,
      categoria: body.categoria || null,
      tags: body.tags || [],
      tema: body.tema || null,
      fonte: body.fonte || null,
      fonte_url: body.fonteUrl || null,
      imagem_capa: body.imagemCapa || null,
      estimated_read_time: body.readTime || null,
      versao: body.versao || 1,
      is_active: body.isActive ?? true,
      is_featured: body.isFeatured ?? false,
      published_at: body.publishedAt || null,
      author_id: body.authorId || null
    };

    const { data, error } = await supabase.from('contos').insert(insertPayload).select('*').single();
    if (error) throw error;
    return NextResponse.json({ story: formatStory(data) }, { status: 201 });
  } catch (e) {
    console.error('Contos POST error', e);
    return NextResponse.json({ error: 'Erro ao criar conto' }, { status: 500 });
  }
}
