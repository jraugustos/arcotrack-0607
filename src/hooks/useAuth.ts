import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../lib/database.types';
import { createClient } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        setAuthState({
          user: session.user,
          profile,
          session,
          loading: false,
        });
      } else {
        setAuthState({
          user: null,
          profile: null,
          session: null,
          loading: false,
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          const profile = await getUserProfile(session.user.id);
          setAuthState({
            user: session.user,
            profile,
            session,
            loading: false,
          });
        } else {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      // Buscar perfil na tabela profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        return data;
      }

      // Se não encontrou perfil, tentar criar um novo
      console.log('Perfil não encontrado, criando novo perfil...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const newProfile = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
          avatar_url: user.user_metadata?.avatar_url || null,
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createdProfile && !createError) {
          console.log('Perfil criado com sucesso');
          return createdProfile;
        }

        console.log('Erro ao criar perfil:', createError);
        return null;
      }

      return null;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error during email sign in:', error);
        
        // Se o erro for de email não confirmado, tentar confirmar automaticamente
        if (error.message.includes('Email not confirmed') || error.message.includes('not confirmed')) {
          console.log('Email não confirmado, tentando confirmar automaticamente...');
          
          try {
            const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
            if (serviceRoleKey) {
              const adminClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                serviceRoleKey
              );

              // Buscar usuário por email
              const { data: users } = await adminClient.auth.admin.listUsers();
              const user = users?.users?.find((u: any) => u.email === email);
              
              if (user) {
                // Confirmar o usuário
                const { error: confirmError } = await adminClient.auth.admin.updateUserById(
                  user.id,
                  { email_confirm: true }
                );

                if (!confirmError) {
                  console.log('Usuário confirmado, tentando login novamente...');
                  // Aguardar um momento e tentar login novamente
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  
                  const { error: retryError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                  });
                  
                  if (retryError) {
                    throw retryError;
                  }
                  
                  return; // Login bem-sucedido após confirmação
                }
              }
            }
          } catch (confirmError) {
            console.log('Erro na confirmação automática:', confirmError);
          }
        }
        
        throw error;
      }
    } catch (error) {
      console.error('SignInWithEmail error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      // Verificar se deve desabilitar confirmação de email
      const disableEmailConfirmation = import.meta.env.VITE_DISABLE_EMAIL_CONFIRMATION === 'true';
      
      // Primeira tentativa: criar conta
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          // Esta opção tenta não exigir confirmação de email
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        console.error('Error during email sign up:', error);
        throw error;
      }

      // Se a configuração para desabilitar confirmação estiver ativa e o usuário foi criado
      if (disableEmailConfirmation && data.user) {
        console.log('Conta criada, confirmando automaticamente...');
        
        try {
          // Criar cliente com service role para confirmar usuário
          const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
          if (serviceRoleKey) {
            const adminClient = createClient(
              import.meta.env.VITE_SUPABASE_URL,
              serviceRoleKey
            );

            // Aguardar um pouco para garantir que o usuário foi processado
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Confirmar o usuário automaticamente
            const { error: confirmError } = await adminClient.auth.admin.updateUserById(
              data.user.id,
              { email_confirm: true }
            );

            if (confirmError) {
              console.log('Erro na confirmação automática:', confirmError);
            } else {
              console.log('Usuário confirmado automaticamente com sucesso');
            }
          }
        } catch (confirmError) {
          console.log('Erro na confirmação automática:', confirmError);
        }
      }

    } catch (error) {
      console.error('SignUpWithEmail error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during sign out:', error);
        throw error;
      }
    } catch (error) {
      console.error('SignOut error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!authState.user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authState.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      setAuthState(prev => ({
        ...prev,
        profile: data,
      }));

      return data;
    } catch (error) {
      console.error('UpdateProfile error:', error);
      throw error;
    }
  };

  return {
    ...authState,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
    isAuthenticated: !!authState.user,
  };
};