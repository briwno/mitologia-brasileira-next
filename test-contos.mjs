// Teste direto: verificar se tabela contos existe
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ebsjwcxutgubeligobai.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVic2p3Y3h1dGd1YmVsaWdvYmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUyODc1MiwiZXhwIjoyMDcxMTA0NzUyfQ.nve9DQ-Tb2HvqJxT9jdJf4ANYYESmg5C8OxAUACdrV4';

const client = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function testContos() {
  console.log('Testando acesso direto à tabela contos...');
  
  try {
    // Teste 1: tentar acesso direto à tabela contos
    console.log('Tentando acesso direto à tabela contos...');
    
    // Teste 2: tentar select em contos
    const { data: contos, error: contosError } = await client
      .from('contos')
      .select('id, slug, card_id, is_active')
      .limit(5);
    
    if (contosError) {
      console.error('Erro ao acessar contos:', contosError);
    } else {
      console.log('Contos encontrados:', contos?.length || 0);
      console.log('Dados:', contos);
    }
    
  } catch (err) {
    console.error('Erro geral:', err);
  }
}

testContos();
