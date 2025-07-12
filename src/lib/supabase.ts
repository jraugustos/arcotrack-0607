import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Configurações para melhor persistência durante treinos longos
    storageKey: 'arcotrack-auth',
  },
  global: {
    headers: {
      'X-Client-Info': 'arcotrack-web',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper para verificar se o usuário está autenticado COM TIMEOUT
export const isAuthenticated = async (timeoutMs: number = 5000) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const sessionPromise = supabase.auth.getSession();
    const { data: { session } } = await Promise.race([
      sessionPromise,
      new Promise((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error(`Timeout após ${timeoutMs}ms`));
        });
      })
    ]) as any;
    
    clearTimeout(timeoutId);
    return !!session?.user;
  } catch (error) {
    console.error('Erro em isAuthenticated:', error);
    return false;
  }
};

// Helper para obter o usuário atual COM TIMEOUT
export const getCurrentUser = async (timeoutMs: number = 5000) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const sessionPromise = supabase.auth.getSession();
    const { data: { session } } = await Promise.race([
      sessionPromise,
      new Promise((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error(`Timeout após ${timeoutMs}ms`));
        });
      })
    ]) as any;
    
    clearTimeout(timeoutId);
    return session?.user || null;
  } catch (error) {
    console.error('Erro em getCurrentUser:', error);
    return null;
  }
};

// Helper para logout COM TIMEOUT
export const signOut = async (timeoutMs: number = 3000) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const signOutPromise = supabase.auth.signOut();
    await Promise.race([
      signOutPromise,
      new Promise((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error(`Timeout no logout após ${timeoutMs}ms`));
        });
      })
    ]);
    
    clearTimeout(timeoutId);
  } catch (error) {
    console.error('Erro no logout:', error);
    // Mesmo com erro, limpar localStorage como fallback
    try {
      const keys = Object.keys(localStorage).filter(key => key.includes('supabase'));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (storageError) {
      console.error('Erro ao limpar localStorage:', storageError);
    }
    throw error;
  }
};

// Helper para testar conectividade
export const testConnection = async (timeoutMs: number = 3000) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Erro no teste de conectividade:', error);
    return false;
  }
};
