import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(req) {
  try {
    const hasSupabase = !!supabase;
    const hasAdmin = !!supabaseAdmin;

    // Testa conexão com supabaseAdmin
    let adminTest = null;
    let adminError = null;
    
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('matches')
        .select('id, room_id')
        .limit(1);
      
      adminTest = { hasData: !!data, count: data?.length || 0 };
      adminError = error?.message || null;
    }

    return NextResponse.json({
      status: 'ok',
      environment: {
        hasSupabase,
        hasAdmin,
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
        SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
      },
      adminTest,
      adminError,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
