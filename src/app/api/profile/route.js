// src/app/api/profile/route.js
import { NextResponse } from 'next/server';
import { requireSupabaseAdmin } from '@/lib/supabase';

export async function GET(request) {
  try {
    const supabaseAdmin = requireSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar dados do jogador
    const { data: player, error: playerError } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (playerError) {
      console.error('❌ Erro ao buscar jogador:', playerError);
      return NextResponse.json(
        { error: 'Erro ao buscar dados do jogador' },
        { status: 500 }
      );
    }

    // Se o jogador tem um título selecionado, buscar os dados completos
    let tituloSelecionadoInfo = null;
    if (player.titulo_selecionado) {
      const { data: tituloData, error: tituloError } = await supabaseAdmin
        .from('titulos')
        .select('id, nome, icone, cor, raridade')
        .eq('id', player.titulo_selecionado)
        .single();

      if (!tituloError && tituloData) {
        tituloSelecionadoInfo = tituloData;
      }
    }

    // Adicionar informações do título ao player
    player.titulo_info = tituloSelecionadoInfo;

    // Buscar títulos disponíveis
    const { data: titulos, error: titulosError } = await supabaseAdmin
      .from('titulos')
      .select('*')
      .eq('ativo', true)
      .order('ordem_exibicao', { ascending: true });

    if (titulosError) {
      console.error('❌ Erro ao buscar títulos:', titulosError);
    }

    return NextResponse.json({
      player,
      titulos: titulos || [],
      titulosDesbloqueados: player.titulos_desbloqueados || [],
    });

  } catch (error) {
    console.error('❌ Erro no GET /api/profile:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const supabaseAdmin = requireSupabaseAdmin();
    const body = await request.json();
    const { playerId, acao } = body;

    console.log('📝 POST /api/profile - Ação:', acao);

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID é obrigatório' },
        { status: 400 }
      );
    }

    // Atualizar nickname
    if (acao === 'atualizar_nickname') {
      const { nickname } = body;

      if (!nickname || nickname.trim().length < 3) {
        return NextResponse.json(
          { error: 'Nickname deve ter pelo menos 3 caracteres' },
          { status: 400 }
        );
      }

      if (nickname.length > 20) {
        return NextResponse.json(
          { error: 'Nickname deve ter no máximo 20 caracteres' },
          { status: 400 }
        );
      }

      // Verificar se o nickname já está em uso
      const { data: existente, error: checkError } = await supabaseAdmin
        .from('players')
        .select('id')
        .eq('nickname', nickname)
        .neq('id', playerId)
        .single();

      if (existente) {
        return NextResponse.json(
          { error: 'Este nickname já está em uso' },
          { status: 409 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from('players')
        .update({ nickname: nickname.trim() })
        .eq('id', playerId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar nickname:', error);
        return NextResponse.json(
          { error: 'Erro ao atualizar nickname' },
          { status: 500 }
        );
      }

      console.log('✅ Nickname atualizado:', data.nickname);
      return NextResponse.json({ success: true, player: data });
    }

    // Atualizar título
    if (acao === 'atualizar_titulo') {
      const { tituloId } = body;

      // Buscar jogador para verificar títulos desbloqueados
      const { data: player, error: playerError } = await supabaseAdmin
        .from('players')
        .select('titulos_desbloqueados')
        .eq('id', playerId)
        .single();

      if (playerError) {
        console.error('❌ Erro ao buscar jogador:', playerError);
        return NextResponse.json(
          { error: 'Erro ao buscar dados do jogador' },
          { status: 500 }
        );
      }

      // Verificar se o título está desbloqueado (ou se é null para remover)
      if (tituloId !== null) {
        const titulosDesbloqueados = player.titulos_desbloqueados || [];
        if (!titulosDesbloqueados.includes(tituloId)) {
          return NextResponse.json(
            { error: 'Você não possui este título' },
            { status: 403 }
          );
        }
      }

      const { data, error } = await supabaseAdmin
        .from('players')
        .update({ titulo_selecionado: tituloId })
        .eq('id', playerId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar título:', error);
        return NextResponse.json(
          { error: 'Erro ao atualizar título' },
          { status: 500 }
        );
      }

      console.log('✅ Título atualizado:', data.titulo_selecionado);
      return NextResponse.json({ success: true, player: data });
    }

    // Upload de avatar
    if (acao === 'upload_avatar') {
      const { avatar } = body;

      if (!avatar) {
        return NextResponse.json(
          { error: 'Avatar é obrigatório' },
          { status: 400 }
        );
      }

      // Validar formato base64
      if (!avatar.startsWith('data:image/')) {
        return NextResponse.json(
          { error: 'Formato de imagem inválido' },
          { status: 400 }
        );
      }

      // Extrair tipo de imagem e dados base64
      const matches = avatar.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json(
          { error: 'Formato de imagem inválido' },
          { status: 400 }
        );
      }

      const imageType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      // Verificar tamanho (max 2MB)
      if (buffer.length > 2 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Imagem muito grande. Máximo 2MB.' },
          { status: 400 }
        );
      }

      // Nome do arquivo único
      const fileName = `avatar_${playerId}_${Date.now()}.${imageType}`;
      const filePath = `avatars/${fileName}`;

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('images')
        .upload(filePath, buffer, {
          contentType: `image/${imageType}`,
          upsert: true,
        });

      if (uploadError) {
        console.error('❌ Erro ao fazer upload:', uploadError);
        return NextResponse.json(
          { error: 'Erro ao fazer upload da imagem' },
          { status: 500 }
        );
      }

      // Gerar URL pública
      const { data: urlData } = supabaseAdmin
        .storage
        .from('images')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Atualizar no banco
      const { data: playerData, error: updateError } = await supabaseAdmin
        .from('players')
        .update({ avatar_url: avatarUrl })
        .eq('id', playerId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erro ao atualizar avatar no banco:', updateError);
        return NextResponse.json(
          { error: 'Erro ao atualizar avatar' },
          { status: 500 }
        );
      }

      console.log('✅ Avatar atualizado:', avatarUrl);
      return NextResponse.json({ 
        success: true, 
        avatar_url: avatarUrl,
        player: playerData 
      });
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Erro no POST /api/profile:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}
