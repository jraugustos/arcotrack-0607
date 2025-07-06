import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export default function TestaConexao() {
  const [testing, setTesting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [clearing, setClearing] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const clearSession = async () => {
    setClearing(true);
    addLog('🧹 Iniciando limpeza AGRESSIVA de sessão...');
    
    try {
      // 1. Limpar localStorage PRIMEIRO (mais importante)
      addLog('💾 Limpando localStorage...');
      const localStorageKeys = Object.keys(localStorage);
      addLog(`📋 Total de chaves no localStorage: ${localStorageKeys.length}`);
      
      localStorageKeys.forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('session') || key.includes('token')) {
          localStorage.removeItem(key);
          addLog(`🗑️ Removido: ${key}`);
        }
      });

      // 2. Limpar sessionStorage
      addLog('💾 Limpando sessionStorage...');
      const sessionStorageKeys = Object.keys(sessionStorage);
      sessionStorageKeys.forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('session') || key.includes('token')) {
          sessionStorage.removeItem(key);
          addLog(`🗑️ Removido: ${key}`);
        }
      });

      // 3. Limpar cookies relacionados ao Supabase
      addLog('🍪 Limpando cookies...');
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });

      // 4. Tentar logout no Supabase COM TIMEOUT
      addLog('🚪 Tentando logout no Supabase (com timeout de 3s)...');
      try {
        const logoutPromise = supabase.auth.signOut();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout no logout')), 3000)
        );
        
        await Promise.race([logoutPromise, timeoutPromise]);
        addLog('✅ Logout realizado com sucesso');
      } catch (logoutError) {
        addLog(`⚠️ Logout falhou ou timeout: ${logoutError.message}`);
        addLog('ℹ️ Continuando mesmo assim...');
      }

      // 5. Verificar limpeza final
      addLog('🔍 Verificação final...');
      const remainingKeys = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('auth')
      );
      
      if (remainingKeys.length > 0) {
        addLog(`⚠️ Ainda restam ${remainingKeys.length} chaves relacionadas ao auth`);
        remainingKeys.forEach(key => addLog(`📋 Restante: ${key}`));
      } else {
        addLog('✅ Limpeza completa - nenhuma chave relacionada ao auth encontrada');
      }

      addLog('🔄 Recarregando página em 2 segundos...');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (error) {
      addLog(`❌ Erro na limpeza: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setClearing(false);
    }
  };

  const forceLogout = () => {
    addLog('⚡ FORÇA BRUTA - Limpeza imediata...');
    
    // Limpar tudo sem verificações
    localStorage.clear();
    sessionStorage.clear();
    
    // Limpar cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    addLog('💥 Tudo limpo! Redirecionando...');
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  const testConnection = async () => {
    setTesting(true);
    setLogs([]);
    
    addLog('🔗 Iniciando teste de conectividade...');
    
    try {
      // Teste 1: Conectividade básica com timeout
      addLog('📡 Testando conectividade básica...');
      const startConn = Date.now();
      
      const connectionPromise = supabase.from('profiles').select('id').limit(1);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na conectividade')), 5000)
      );
      
      try {
        const { data: connData, error: connError } = await Promise.race([
          connectionPromise,
          timeoutPromise
        ]) as any;
        
        const endConn = Date.now();
        
        if (connError) {
          addLog(`❌ Erro de conectividade: ${connError.message}`);
        } else {
          addLog(`✅ Conectividade OK (${endConn - startConn}ms)`);
        }
      } catch (timeoutError) {
        addLog(`⏰ Timeout na conectividade (5s) - ${timeoutError.message}`);
      }

      // Teste 2: Verificação de localStorage
      addLog('💾 Verificando localStorage...');
      const localStorageKeys = Object.keys(localStorage).filter(key => key.includes('supabase'));
      addLog(`📋 Chaves encontradas: ${localStorageKeys.length}`);
      
      localStorageKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const parsed = JSON.parse(value);
            addLog(`📋 ${key}: ${parsed.access_token ? 'Com token' : 'Sem token'} | User: ${parsed.user?.email || 'N/A'}`);
          }
        } catch (e) {
          addLog(`⚠️ Erro ao parsear ${key}: ${e.message}`);
        }
      });

      // Teste 3: Verificação de sessão (primeira vez) com timeout
      addLog('🔍 Testando getSession() - Primeira tentativa...');
      const startSession1 = Date.now();
      
      const sessionPromise1 = supabase.auth.getSession();
      const sessionTimeout1 = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na sessão')), 5000)
      );
      
      let session1: any = null;
      try {
        const { data: { session: sessionData1 }, error: sessionError1 } = await Promise.race([
          sessionPromise1,
          sessionTimeout1
        ]) as any;
        
        session1 = sessionData1;
        const endSession1 = Date.now();
        
        if (sessionError1) {
          addLog(`❌ Erro na sessão (1ª tentativa): ${sessionError1.message}`);
        } else {
          addLog(`✅ getSession() #1 OK (${endSession1 - startSession1}ms)`);
          addLog(`📊 Sessão #1: ${session1 ? `Usuário ${session1.user?.email}` : 'Nenhuma sessão'}`);
          
          if (session1?.expires_at) {
            const expiresAt = new Date(session1.expires_at * 1000);
            const now = new Date();
            const isExpired = expiresAt < now;
            addLog(`⏰ Expira em: ${expiresAt.toLocaleString()} | Expirado: ${isExpired}`);
          }
        }
      } catch (timeoutError) {
        addLog(`⏰ Timeout na sessão #1 (5s) - ${timeoutError.message}`);
      }

      // Teste 4: Simulação de "reabrir aba" - segunda verificação de sessão
      addLog('🔄 Simulando "reabrir aba" - Segunda tentativa...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1 segundo
      
      const startSession2 = Date.now();
      const sessionPromise2 = supabase.auth.getSession();
      const sessionTimeout2 = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na sessão')), 5000)
      );
      
      let session2: any = null;
      try {
        const { data: { session: sessionData2 }, error: sessionError2 } = await Promise.race([
          sessionPromise2,
          sessionTimeout2
        ]) as any;
        
        session2 = sessionData2;
        const endSession2 = Date.now();
        
        if (sessionError2) {
          addLog(`❌ Erro na sessão (2ª tentativa): ${sessionError2.message}`);
        } else {
          addLog(`✅ getSession() #2 OK (${endSession2 - startSession2}ms)`);
          addLog(`📊 Sessão #2: ${session2 ? `Usuário ${session2.user?.email}` : 'Nenhuma sessão'}`);
          
          // Comparar as duas sessões
          const session1Exists = !!session1;
          const session2Exists = !!session2;
          
          if (session1Exists !== session2Exists) {
            addLog(`⚠️ INCONSISTÊNCIA: Sessão #1 ${session1Exists ? 'existe' : 'não existe'}, Sessão #2 ${session2Exists ? 'existe' : 'não existe'}`);
          } else {
            addLog(`✅ Consistência: Ambas as tentativas ${session1Exists ? 'encontraram' : 'não encontraram'} sessão`);
          }
        }
      } catch (timeoutError) {
        addLog(`⏰ Timeout na sessão #2 (5s) - ${timeoutError.message}`);
      }

      // Teste 5: Verificar variáveis de ambiente
      addLog('🔧 Verificando variáveis de ambiente...');
      const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
      const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
      addLog(`📋 SUPABASE_URL: ${hasUrl ? 'OK' : 'FALTANDO'}`);
      addLog(`📋 SUPABASE_KEY: ${hasKey ? 'OK' : 'FALTANDO'}`);
      
      if (hasUrl) {
        addLog(`📋 URL: ${import.meta.env.VITE_SUPABASE_URL}`);
      }

      // Teste 6: Verificar estado do navegador
      addLog('🌐 Verificando estado do navegador...');
      addLog(`📋 Online: ${navigator.onLine}`);
      addLog(`📋 URL: ${window.location.href}`);
      addLog(`📋 localStorage: ${Object.keys(localStorage).length} itens`);
      addLog(`📋 sessionStorage: ${Object.keys(sessionStorage).length} itens`);

      addLog('✅ Testes concluídos!');
      
    } catch (error) {
      addLog(`❌ Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      addLog(`📋 Stack: ${error instanceof Error ? error.stack : 'N/A'}`);
    } finally {
      setTesting(false);
    }
  };

  const quickTest = async () => {
    setTesting(true);
    setLogs([]);
    
    addLog('⚡ TESTE RÁPIDO - Diagnóstico sem getSession()...');
    
    try {
      // Teste 1: Verificar localStorage detalhadamente
      addLog('💾 Análise detalhada do localStorage...');
      const allKeys = Object.keys(localStorage);
      addLog(`📊 Total de chaves: ${allKeys.length}`);
      
      allKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          const size = value ? value.length : 0;
          addLog(`📋 ${key}: ${size} caracteres`);
          
          if (key.includes('supabase')) {
            try {
              const parsed = JSON.parse(value || '{}');
              addLog(`  🔍 Conteúdo: access_token=${!!parsed.access_token}, user=${parsed.user?.email || 'N/A'}`);
              if (parsed.expires_at) {
                const expiresAt = new Date(parsed.expires_at * 1000);
                const isExpired = expiresAt < new Date();
                addLog(`  ⏰ Expira: ${expiresAt.toLocaleString()} (${isExpired ? 'EXPIRADO' : 'VÁLIDO'})`);
              }
            } catch (parseError) {
              addLog(`  ⚠️ Erro ao parsear: ${parseError.message}`);
            }
          }
        } catch (error) {
          addLog(`❌ Erro ao analisar ${key}: ${error.message}`);
        }
      });

      // Teste 2: Conectividade básica com timeout bem curto
      addLog('🌐 Teste de conectividade básica (2s timeout)...');
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch('https://fxsrjukmeelcxiltbkco.supabase.co/rest/v1/', {
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        addLog(`✅ Conectividade OK: ${response.status}`);
      } catch (fetchError) {
        addLog(`❌ Conectividade falhou: ${fetchError.message}`);
      }

      // Teste 3: Verificar se há múltiplas instâncias do Supabase
      addLog('🔍 Verificando instâncias do Supabase...');
      addLog(`📊 window.supabase: ${typeof (window as any).supabase !== 'undefined' ? 'Existe' : 'Não existe'}`);
      addLog(`📊 import supabase: ${typeof supabase !== 'undefined' ? 'Existe' : 'Não existe'}`);

      // Teste 4: Verificar event listeners
      addLog('👂 Verificando event listeners...');
      const listenerCount = (window as any).getEventListeners ? 
        Object.keys((window as any).getEventListeners(window)).length : 'N/A';
      addLog(`📊 Event listeners: ${listenerCount}`);

      // Teste 5: Verificar se há outros tabs/janelas
      addLog('🪟 Verificando estado da janela...');
      addLog(`📊 Document hidden: ${document.hidden}`);
      addLog(`📊 Visibility state: ${document.visibilityState}`);
      addLog(`📊 Page loaded: ${document.readyState}`);

      addLog('✅ Teste rápido concluído!');
      
    } catch (error) {
      addLog(`❌ Erro no teste rápido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setTesting(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const exportLogs = () => {
    const logText = logs.join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arcotrack-debug-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const goToLogin = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔧 Teste de Conexão ArcoTrack
            </CardTitle>
            <CardDescription>
              Ferramenta de diagnóstico para problemas de loading infinito
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4 flex-wrap">
              <Button
                onClick={testConnection}
                disabled={testing}
                variant={testing ? "secondary" : "default"}
              >
                {testing ? 'Testando...' : 'Executar Testes'}
              </Button>

              <Button
                onClick={quickTest}
                disabled={testing}
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                ⚡ Teste Rápido
              </Button>
              
              <Button
                onClick={clearSession}
                disabled={clearing}
                variant="destructive"
              >
                {clearing ? 'Limpando...' : 'Limpar Sessão'}
              </Button>

              <Button
                onClick={forceLogout}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                🔥 Força Bruta
              </Button>

              <Button
                onClick={goToLogin}
                variant="default"
              >
                Ir para Login
              </Button>
              
              <Button
                onClick={clearLogs}
                variant="outline"
              >
                Limpar Logs
              </Button>
              
              {logs.length > 0 && (
                <Button
                  onClick={exportLogs}
                  variant="secondary"
                >
                  Exportar Logs
                </Button>
              )}
            </div>

            <div className="bg-black text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500">Clique em "Executar Testes" para começar...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
              {testing && (
                <div className="animate-pulse">▋</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 