import React, { useState, useEffect } from 'react';
import { ArcoTrackProvider, useArcoTrack } from './contexts/ArcoTrackContext';
import { useAuthContext } from './contexts/AuthContext';
import { TelaLogin } from './components/TelaLogin';
import { TelaHome } from './components/TelaHome';
import { TelaRegistro } from './components/TelaRegistro';
import { TelaExecucao } from './components/TelaExecucao';
import { TelaFinalizacao } from './components/TelaFinalizacao';
import { TelaAutoavaliacao } from './components/TelaAutoavaliacao';
import { TelaHistorico } from './components/TelaHistorico';
import { TelaConfiguracoes } from './components/TelaConfiguracoes';
import { TelaPerfil } from './components/TelaPerfil';
import { NavegacaoInferior } from './components/NavegacaoInferior';
import TestaConexao from './components/TestaConexao';

function AppContent() {
  const { state } = useArcoTrack();
  const authContext = useAuthContext();
  const [showRetry, setShowRetry] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [loadingStartTime] = useState(Date.now());

  // Check if we're in debug mode
  const isDebugMode = window.location.pathname === '/debug' || window.location.search.includes('debug=true');

  if (isDebugMode) {
    return <TestaConexao />;
  }

  // Show retry button after 8 seconds of loading
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (state.loading) {
      timeoutId = setTimeout(() => {
        setShowRetry(true);
      }, 8000);

      // Update debug info
      const interval = setInterval(() => {
        const loadingTime = Math.round((Date.now() - loadingStartTime) / 1000);
        const info = `
🔍 DIAGNÓSTICO DE LOADING:
⏰ Tempo de loading: ${loadingTime}s
📊 Estado ArcoTrack:
  - Loading: ${state.loading}
  - IsLoggedIn: ${state.isLoggedIn}
  - Usuario: ${state.usuario?.nome || 'null'}
  - Tela Atual: ${state.telaAtual}

🔐 Estado Auth:
  - Auth Loading: ${authContext.loading}
  - Is Authenticated: ${authContext.isAuthenticated}
  - User Email: ${authContext.user?.email || 'null'}
  - Profile: ${authContext.profile?.name || 'null'}
  - Session: ${authContext.session ? 'Ativa' : 'Inativa'}

🌐 Conectividade:
  - Online: ${navigator.onLine}
  - URL: ${window.location.href}
  - Timestamp: ${new Date().toLocaleTimeString()}

🔧 Variáveis de Ambiente:
  - SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL ? 'Configurada' : 'FALTANDO'}
  - SUPABASE_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurada' : 'FALTANDO'}

🔗 Link para debug: ${window.location.origin}/debug
        `;
        setDebugInfo(info);
      }, 1000);

      return () => {
        clearInterval(interval);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    } else {
      setShowRetry(false);
      setDebugInfo('');
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [state.loading, state.isLoggedIn, state.usuario, authContext.loading, authContext.isAuthenticated, authContext.user, authContext.profile, authContext.session, loadingStartTime]);

  const handleRetry = () => {
    console.log('[AppContent] 🔄 Usuário clicou em tentar novamente');
    window.location.reload();
  };

  const handleForceLogin = () => {
    console.log('[AppContent] 🔄 Usuário clicou em forçar tela de login');
    // Force set to login screen
    window.localStorage.clear();
    window.location.reload();
  };

  const handleDebug = () => {
    console.log('[AppContent] 🔧 Usuário clicou em debug');
    window.open('/debug', '_blank');
  };

  const renderizarTela = () => {
    // Show loading screen while authentication is being determined
    if (state.loading) {
      const loadingTime = Math.round((Date.now() - loadingStartTime) / 1000);
      
      return (
        <div className="flex items-center justify-center min-h-screen bg-arco-light">
          <div className="text-center max-w-lg mx-auto px-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-arco-accent mx-auto mb-4"></div>
            <p className="text-arco-text-secondary mb-4">
              {showRetry ? `Verificando conexão... (${loadingTime}s)` : 'Carregando...'}
            </p>
            
            {showRetry && (
              <div className="space-y-4">
                <p className="text-sm text-arco-gray-600">
                  A verificação está demorando mais que o esperado.
                </p>
                
                <div className="flex gap-2 justify-center flex-wrap">
                  <button
                    onClick={handleRetry}
                    className="bg-arco-accent hover:bg-arco-accent/90 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Recarregar Página
                  </button>
                  <button
                    onClick={handleForceLogin}
                    className="bg-arco-gray-600 hover:bg-arco-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Forçar Login
                  </button>
                  <button
                    onClick={handleDebug}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    🔧 Debug
                  </button>
                </div>
                
                {import.meta.env.DEV && debugInfo && (
                  <details className="mt-4 text-left">
                    <summary className="text-xs text-arco-gray-500 cursor-pointer hover:text-arco-gray-700">
                      🔍 Debug Info (Clique para expandir)
                    </summary>
                    <pre className="text-xs text-arco-gray-600 mt-2 whitespace-pre-wrap bg-gray-100 p-3 rounded max-h-64 overflow-y-auto">
                      {debugInfo}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (!state.isLoggedIn) {
      return <TelaLogin />;
    }

    switch (state.telaAtual) {
      case 'home':
        return <TelaHome />;
      case 'registro':
        return <TelaRegistro />;
      case 'execucao':
        return <TelaExecucao />;
      case 'finalizacao':
        return <TelaFinalizacao />;
      case 'autoavaliacao':
        return <TelaAutoavaliacao />;
      case 'historico':
        return <TelaHistorico />;
      case 'configuracoes':
        return <TelaConfiguracoes />;
      case 'perfil':
        return <TelaPerfil />;
      default:
        return <TelaHome />;
    }
  };

  return (
    <div className="relative min-h-screen bg-arco-light font-dm-sans">
      {/* Conteúdo principal */}
      <div className={`${state.isLoggedIn ? 'pb-20' : ''}`}>
        {renderizarTela()}
      </div>

      {/* Navegação inferior (apenas quando logado) */}
      {state.isLoggedIn && <NavegacaoInferior />}
    </div>
  );
}

export function ArcoTrackApp() {
  return (
    <ArcoTrackProvider>
      <AppContent />
    </ArcoTrackProvider>
  );
}
