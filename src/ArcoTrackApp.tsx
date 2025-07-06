import React from 'react';
import { ArcoTrackProvider, useArcoTrack } from './contexts/ArcoTrackContext';
import { TelaLogin } from './components/TelaLogin';
import { TelaHome } from './components/TelaHome';
import { TelaRegistro } from './components/TelaRegistro';
import { TelaExecucao } from './components/TelaExecucao';
import { TelaFinalizacao } from './components/TelaFinalizacao';
import { TelaAutoavaliacao } from './components/TelaAutoavaliacao';
import { TelaHistorico } from './components/TelaHistorico';
import { TelaConfiguracoes } from './components/TelaConfiguracoes';
import { NavegacaoInferior } from './components/NavegacaoInferior';

function AppContent() {
  const { state } = useArcoTrack();

  const renderizarTela = () => {
    // Show loading screen while authentication is being determined
    if (state.loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-arco-light">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-arco-accent mx-auto mb-4"></div>
            <p className="text-arco-text-secondary">Carregando...</p>
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
