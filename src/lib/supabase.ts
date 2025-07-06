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
  },
});

// Helper para verificar se o usuário está autenticado
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session?.user;
};

// Helper para obter o usuário atual
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
};

// Helper para logout
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
