// Script para testar sessão do Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fxsrjukmeelcxiltbkco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4c3JqdWttZWVsY3hpbHRia2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MjI2OTEsImV4cCI6MjA2Njk5ODY5MX0.s-cG52TXcy28wW4tDyUUucmHWYrFAInEYjLj-3vla_w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSession() {
  console.log('🔍 Testando sessão do Supabase...');
  
  try {
    const startTime = Date.now();
    const { data: { session }, error } = await supabase.auth.getSession();
    const endTime = Date.now();
    
    console.log(`⏱️ getSession() levou: ${endTime - startTime}ms`);
    
    if (error) {
      console.error('❌ Erro ao obter sessão:', error);
      return;
    }
    
    console.log('📊 Resultado da sessão:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email || 'N/A',
      expiresAt: session?.expires_at || 'N/A'
    });
    
    if (session?.user) {
      console.log('👤 Testando busca de perfil...');
      const profileStart = Date.now();
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      const profileEnd = Date.now();
      
      console.log(`⏱️ Profile query levou: ${profileEnd - profileStart}ms`);
      
      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
      } else {
        console.log('✅ Perfil encontrado:', profile);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Teste de conectividade básica
async function testConnection() {
  console.log('🔗 Testando conectividade básica...');
  
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    const endTime = Date.now();
    
    console.log(`⏱️ Conectividade levou: ${endTime - startTime}ms`);
    
    if (error) {
      console.error('❌ Erro de conectividade:', error);
    } else {
      console.log('✅ Conectividade OK');
    }
  } catch (error) {
    console.error('❌ Erro de rede:', error);
  }
}

// Executar testes
testConnection().then(() => testSession()); 