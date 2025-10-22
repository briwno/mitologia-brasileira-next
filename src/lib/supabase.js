// src/lib/supabase.js
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log de diagnóstico (apenas server-side)
if (typeof window === 'undefined') {
  console.log('🔑 [Supabase Config]', {
    hasUrl: !!SUPABASE_URL,
    urlPrefix: SUPABASE_URL?.substring(0, 30),
    hasAnonKey: !!SUPABASE_ANON_KEY,
    hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY,
    serviceKeyPrefix: SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20),
  });
}

let supabase = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

let supabaseAdmin = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { 
    auth: { 
      persistSession: false,
      autoRefreshToken: false,
    } 
  });
}

export { supabase, supabaseAdmin };

export function createClient() {
  if (!supabase) {
    throw new Error('Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return supabase;
}

export function requireSupabaseAdmin() {
  if (!supabaseAdmin) {
    console.error('❌ [Supabase] Service role key não encontrada!');
    throw new Error('Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  }
  return supabaseAdmin;
}
