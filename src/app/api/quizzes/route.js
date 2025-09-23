import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

// GET: retorna todos os quizzes
export async function GET(request) {
  try {
    const supabase = requireSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar quizzes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ quizzes: data || [] });
  } catch (error) {
    console.error('Erro interno ao buscar quizzes:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST: cria um novo quiz
export async function POST(request) {
  try {
    const supabase = requireSupabaseAdmin();
    
    const { title, description, questions } = await request.json();
    
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ 
        error: 'Título e perguntas são obrigatórios (mínimo 1 pergunta)' 
      }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('quizzes')
      .insert({ 
        title: title.trim(), 
        description: description?.trim() || null, 
        questions 
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar quiz:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ quiz: data }, { status: 201 });
  } catch (error) {
    console.error('Erro interno ao criar quiz:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT: atualiza um quiz existente
export async function PUT(request) {
  try {
    const supabase = requireSupabaseAdmin();
    
    const { id, title, description, questions } = await request.json();
    
    if (!id || !title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ 
        error: 'ID, título e perguntas são obrigatórios' 
      }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('quizzes')
      .update({ 
        title: title.trim(), 
        description: description?.trim() || null, 
        questions,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar quiz:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ quiz: data });
  } catch (error) {
    console.error('Erro interno ao atualizar quiz:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE: remove um quiz
export async function DELETE(request) {
  try {
    const supabase = requireSupabaseAdmin();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao deletar quiz:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Quiz deletado com sucesso', quiz: data });
  } catch (error) {
    console.error('Erro interno ao deletar quiz:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}