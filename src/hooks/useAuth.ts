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
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        console.log('[useAuth] 🔍 Iniciando verificação de sessão...');
        console.log('[useAuth] 🌐 Navigator online:', navigator.onLine);
        
        // Check localStorage for any Supabase data
        const localStorageKeys = Object.keys(localStorage).filter(key => key.includes('supabase'));
        console.log('[useAuth] 💾 Chaves do localStorage relacionadas ao Supabase:', localStorageKeys);
        
        localStorageKeys.forEach(key => {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const parsed = JSON.parse(value);
              console.log(`[useAuth] 📋 ${key}:`, {
                hasAccessToken: !!parsed.access_token,
                hasRefreshToken: !!parsed.refresh_token,
                expiresAt: parsed.expires_at,
                user: parsed.user?.email || 'N/A'
              });
            }
          } catch (e) {
            console.log(`[useAuth] ⚠️ Erro ao parsear ${key}:`, e);
          }
        });
        
        // Check if we're online
        if (!navigator.onLine) {
          console.log('[useAuth] ❌ Dispositivo offline, definindo como não autenticado');
          if (!isMounted) return;
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
          });
          return;
        }

        // Test Supabase connection first
        try {
          console.log('[useAuth] 🔗 Testando conexão com Supabase...');
          const { data, error } = await supabase.from('profiles').select('id').limit(1);
          if (error && error.code === 'PGRST116') {
            // Table doesn't exist or no permissions - this is actually OK for testing connection
            console.log('[useAuth] ✅ Conexão com Supabase OK (sem dados)');
          } else if (error) {
            console.warn('[useAuth] ⚠️ Possível problema de conexão com Supabase:', error.message);
          } else {
            console.log('[useAuth] ✅ Conexão com Supabase OK');
          }
        } catch (connectionError) {
          console.error('[useAuth] ❌ Erro de conexão com Supabase:', connectionError);
          // Don't fail completely, just log the error
        }
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.log('[useAuth] ⏰ TIMEOUT na verificação de sessão (10s), definindo como não autenticado');
            setAuthState({
              user: null,
              profile: null,
              session: null,
              loading: false,
            });
          }
        }, 10000); // 10 seconds timeout

        console.log('[useAuth] 📋 Chamando supabase.auth.getSession()...');
        const startTime = Date.now();
        
        // Try to get session with detailed error handling
        let sessionResult;
        try {
          sessionResult = await supabase.auth.getSession();
        } catch (sessionError) {
          console.error('[useAuth] ❌ Erro crítico ao chamar getSession():', sessionError);
          throw sessionError;
        }
        
        let { data: { session }, error } = sessionResult;
        const endTime = Date.now();
        
        console.log('[useAuth] ⏱️ getSession() levou:', endTime - startTime, 'ms');
        
        // Clear timeout if we got a response
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (error) {
          console.error('[useAuth] ❌ Erro ao verificar sessão:', error);
          console.error('[useAuth] 📋 Detalhes do erro:', {
            name: error.name,
            message: error.message,
            status: error.status,
            statusCode: error.statusCode
          });
          
          if (!isMounted) return;
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
          });
          return;
        }

        console.log('[useAuth] 📊 Resultado da sessão:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email || 'N/A',
          expiresAt: session?.expires_at || 'N/A',
          accessToken: session?.access_token ? `${session.access_token.substring(0, 20)}...` : 'N/A',
          refreshToken: session?.refresh_token ? `${session.refresh_token.substring(0, 20)}...` : 'N/A'
        });
        
        // Check if session is expired
        if (session?.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000);
          const now = new Date();
          const isExpired = expiresAt < now;
          console.log('[useAuth] ⏰ Verificação de expiração:', {
            expiresAt: expiresAt.toISOString(),
            now: now.toISOString(),
            isExpired,
            timeUntilExpiry: isExpired ? 'EXPIRADO' : `${Math.round((expiresAt.getTime() - now.getTime()) / 1000 / 60)} minutos`
          });
          
          if (isExpired) {
            console.log('[useAuth] ⚠️ Sessão expirada, tentando refresh...');
            try {
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
              if (refreshError) {
                console.error('[useAuth] ❌ Erro ao fazer refresh da sessão:', refreshError);
              } else {
                console.log('[useAuth] ✅ Sessão refreshed com sucesso');
                // Update session with refreshed data
                session = refreshData.session;
              }
            } catch (refreshErr) {
              console.error('[useAuth] ❌ Erro crítico no refresh:', refreshErr);
            }
          }
        }
        
        if (!isMounted) return;
        
        if (session?.user) {
          console.log('[useAuth] 👤 Usuário encontrado, carregando perfil...');
          try {
            const profileStartTime = Date.now();
            const profile = await getUserProfile(session.user.id);
            const profileEndTime = Date.now();
            
            console.log('[useAuth] ⏱️ getUserProfile() levou:', profileEndTime - profileStartTime, 'ms');
            console.log('[useAuth] 📋 Perfil carregado:', profile ? 'Sucesso' : 'Falhou');
            
            if (!isMounted) return;
            setAuthState({
              user: session.user,
              profile,
              session,
              loading: false,
            });
            console.log('[useAuth] ✅ Estado definido como AUTENTICADO');
          } catch (profileError) {
            console.error('[useAuth] ❌ Erro ao carregar perfil:', profileError);
            if (!isMounted) return;
            setAuthState({
              user: session.user,
              profile: null,
              session,
              loading: false,
            });
            console.log('[useAuth] ⚠️ Estado definido como AUTENTICADO (sem perfil)');
          }
        } else {
          console.log('[useAuth] 🚫 Nenhum usuário encontrado na sessão');
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
          });
          console.log('[useAuth] ✅ Estado definido como NÃO AUTENTICADO');
        }
      } catch (error) {
        console.error('[useAuth] ❌ Erro na verificação inicial de sessão:', error);
        console.error('[useAuth] 📋 Stack trace:', error.stack);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (!isMounted) return;
        setAuthState({
          user: null,
          profile: null,
          session: null,
          loading: false,
        });
        console.log('[useAuth] ✅ Estado definido como NÃO AUTENTICADO (após erro)');
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[useAuth] 🔄 Auth state changed:', event, session?.user?.email || 'No user');
        
        if (!isMounted) return;
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('[useAuth] 🚪 User signed out or no session');
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
          });
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('[useAuth] 🔑 User signed in or token refreshed');
          // Handle profile loading asynchronously without blocking the listener
          getUserProfile(session.user.id)
            .then(profile => {
              if (isMounted) {
                setAuthState({
                  user: session.user,
                  profile,
                  session,
                  loading: false,
                });
              }
            })
            .catch(error => {
              console.error('[useAuth] ❌ Error loading profile after auth change:', error);
              if (isMounted) {
                setAuthState({
                  user: session.user,
                  profile: null,
                  session,
                  loading: false,
                });
              }
            });
        }
      }
    );

    // Handle page visibility changes (tab switching)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[useAuth] 👁️ Página ficou visível, verificando sessão...');
        // When page becomes visible, check if session is still valid
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
              console.error('[useAuth] ❌ Erro ao verificar sessão após página ficar visível:', error);
              return;
            }
            
            console.log('[useAuth] 📊 Sessão após página ficar visível:', {
              hasSession: !!session,
              userEmail: session?.user?.email || 'N/A'
            });
            
            // If we have a different session state, update it
            if (session && !authState.user) {
              console.log('[useAuth] 🔄 Detectada sessão válida após página ficar visível, atualizando estado...');
              getUserProfile(session.user.id).then(profile => {
                if (isMounted) {
                  setAuthState({
                    user: session.user,
                    profile,
                    session,
                    loading: false,
                  });
                }
              }).catch(error => {
                console.error('[useAuth] ❌ Erro ao carregar perfil após visibilidade:', error);
                if (isMounted) {
                  setAuthState({
                    user: session.user,
                    profile: null,
                    session,
                    loading: false,
                  });
                }
              });
            } else if (!session && authState.user) {
              console.log('[useAuth] 🔄 Detectada falta de sessão após página ficar visível, limpando estado...');
              if (isMounted) {
                setAuthState({
                  user: null,
                  profile: null,
                  session: null,
                  loading: false,
                });
              }
            }
          });
        }, 100); // Small delay to ensure page is fully visible
      }
    };

    // Handle online/offline events
    const handleOnline = () => {
      console.log('[useAuth] 🌐 Dispositivo voltou online');
      if (document.visibilityState === 'visible') {
        handleVisibilityChange();
      }
    };

    const handleOffline = () => {
      console.log('[useAuth] 📴 Dispositivo ficou offline');
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial session check
    getInitialSession();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
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