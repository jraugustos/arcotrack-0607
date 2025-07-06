import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { useTreinos, TreinoCompleto } from '../hooks/useTreinos';
import { Profile } from '../lib/database.types';

// Tipos do aplicativo (mantidos compatíveis)
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  avatar?: string;
}

export interface TreinoConfig {
  data: string;
  series: number;
  flechasPorSerie: number;
  distancia: number;
  objetivo?: number;
  temObjetivo: boolean;
}

export interface Flecha {
  valor: number;
  x?: number;
  y?: number;
}

export interface Serie {
  flechas: Flecha[];
  pontuacao: number;
  id?: string; // Added for Supabase compatibility
}

export interface Autoavaliacao {
  postura: number;
  ancoragem: number;
  alinhamento: number;
  respiracao: number;
  mira: number;
  liberacao: number;
  followThrough: number;
  consistencia: number;
  ritmo: number;
  foco: number;
}

export interface Treino {
  id: string;
  data: string;
  config: TreinoConfig;
  series: Serie[];
  pontuacaoTotal: number;
  melhorSerie: number;
  observacoes?: string;
  autoavaliacao?: Autoavaliacao;
  concluido: boolean;
}

export interface AppState {
  usuario: Usuario | null;
  telaAtual: string;
  treinoAtual: Treino | null;
  treinos: Treino[];
  serieAtual: number;
  flechaAtual: number;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

// Estado inicial
const estadoInicial: AppState = {
  usuario: null,
  telaAtual: 'login',
  treinoAtual: null,
  treinos: [],
  serieAtual: 0,
  flechaAtual: 0,
  isLoggedIn: false,
  loading: false,
  error: null,
};

// Helper functions to convert between DB and App types
const convertTreinoDbToApp = (treinoDb: TreinoCompleto): Treino => {
  // For now, use the series array length as the configured number
  const numeroSeriesConfigurado = treinoDb.series.length;
  
  const series: Serie[] = treinoDb.series.map(serie => {
    const flechas = serie.flechas.map(flecha => ({
      valor: flecha.valor,
      x: flecha.x || undefined,
      y: flecha.y || undefined,
    }));
    
    // Calculate series score from arrows if not present or is 0
    const pontuacaoCalculada = flechas.reduce((total, f) => total + f.valor, 0);
    const pontuacaoFinal = serie.pontuacao || pontuacaoCalculada;
    
    return {
      id: serie.id,
      flechas,
      pontuacao: pontuacaoFinal,
    };
  });

  // Calculate total score and best series from actual data
  const pontuacaoTotalCalculada = series.reduce((total, serie) => total + serie.pontuacao, 0);
  const melhorSerieCalculada = series.length > 0 ? Math.max(...series.map(s => s.pontuacao)) : 0;
  
  return {
    id: treinoDb.id,
    data: treinoDb.data,
    config: {
      data: treinoDb.data,
      series: numeroSeriesConfigurado, // Use calculated number of series
      flechasPorSerie: treinoDb.flechas_por_serie,
      distancia: treinoDb.distancia,
      objetivo: treinoDb.objetivo || undefined,
      temObjetivo: treinoDb.tem_objetivo,
    },
    series,
    pontuacaoTotal: treinoDb.pontuacao_total || pontuacaoTotalCalculada,
    melhorSerie: treinoDb.melhor_serie || melhorSerieCalculada,
    observacoes: treinoDb.observacoes || undefined,
    autoavaliacao: treinoDb.autoavaliacao ? {
      postura: treinoDb.autoavaliacao.postura,
      ancoragem: treinoDb.autoavaliacao.ancoragem,
      alinhamento: treinoDb.autoavaliacao.alinhamento,
      respiracao: treinoDb.autoavaliacao.respiracao,
      mira: treinoDb.autoavaliacao.mira,
      liberacao: treinoDb.autoavaliacao.liberacao,
      followThrough: treinoDb.autoavaliacao.follow_through,
      consistencia: treinoDb.autoavaliacao.consistencia,
      ritmo: treinoDb.autoavaliacao.ritmo,
      foco: treinoDb.autoavaliacao.foco,
    } : undefined,
    concluido: treinoDb.concluido,
  };
};

const convertProfileToUsuario = (profile: Profile): Usuario => ({
  id: profile.id,
  nome: profile.name || profile.email || 'Usuário',
  email: profile.email || '',
  avatar: profile.avatar_url || undefined,
});

// Context interface
interface ArcoTrackContextType {
  state: AppState;
  // Navigation
  navegarPara: (tela: string) => void;
  
  // Training Management
  iniciarTreino: (config: TreinoConfig) => Promise<void>;
  registrarFlecha: (flecha: Flecha) => Promise<void>;
  editarFlecha: (serieIndex: number, flechaIndex: number, novaFlecha: Flecha) => Promise<void>;
  proximaSerie: () => Promise<void>;
  finalizarTreino: (observacoes?: string, autoavaliacao?: Autoavaliacao) => Promise<void>;
  resetTreinoAtual: () => void;
  
  // Data loading
  carregarTreinos: () => Promise<void>;
  getTreinoById: (id: string) => Promise<Treino | null>;
  
  // Error handling
  clearError: () => void;
}

const ArcoTrackContext = createContext<ArcoTrackContextType | null>(null);

// Provider
export function ArcoTrackProvider({ children }: { children: ReactNode }) {
  const { user, profile, isAuthenticated, loading: authLoading } = useAuthContext();
  const treinosHook = useTreinos();
  
  const [state, setState] = useState<AppState>(estadoInicial);
  const [treinoAtualId, setTreinoAtualId] = useState<string | null>(null);

  // Update user state when authentication changes
  useEffect(() => {
    console.log('Auth state change detected:', { isAuthenticated, profile: !!profile, authLoading });
    
    if (authLoading) {
      setState(prev => ({
        ...prev,
        loading: true,
      }));
      return;
    }
    
    if (isAuthenticated && profile) {
      console.log('Setting user as logged in, redirecting to home');
      setState(prev => ({
        ...prev,
        usuario: convertProfileToUsuario(profile),
        isLoggedIn: true,
        telaAtual: prev.telaAtual === 'login' ? 'home' : prev.telaAtual,
        loading: false,
      }));
    } else {
      console.log('Setting user as logged out');
      setState(prev => ({
        ...prev,
        usuario: null,
        isLoggedIn: false,
        telaAtual: 'login',
        treinoAtual: null,
        loading: false,
      }));
      setTreinoAtualId(null);
    }
  }, [isAuthenticated, profile, authLoading]);

  // Update treinos when they change
  useEffect(() => {
    if (treinosHook.treinos) {
      const treinosConvertidos = treinosHook.treinos.map(convertTreinoDbToApp);
      setState(prev => ({
        ...prev,
        treinos: treinosConvertidos,
        loading: treinosHook.loading,
        error: treinosHook.error,
      }));
    }
  }, [treinosHook.treinos, treinosHook.loading, treinosHook.error]);

  // Navigation
  const navegarPara = (tela: string) => {
    setState(prev => ({ ...prev, telaAtual: tela }));
  };

  // Start training
  const iniciarTreino = async (config: TreinoConfig) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const treinoId = await treinosHook.createTreino({
        data: config.data,
        series: config.series,
        flechas_por_serie: config.flechasPorSerie,
        distancia: config.distancia,
        tem_objetivo: config.temObjetivo,
        objetivo: config.objetivo || null,
      });

      setTreinoAtualId(treinoId);

      const novoTreino: Treino = {
        id: treinoId,
        data: config.data,
        config,
        series: [],
        pontuacaoTotal: 0,
        melhorSerie: 0,
        concluido: false,
      };

      setState(prev => ({
        ...prev,
        treinoAtual: novoTreino,
        serieAtual: 0,
        flechaAtual: 0,
        telaAtual: 'execucao',
        loading: false,
      }));
    } catch (error) {
      console.error('Error starting training:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao iniciar treino',
      }));
    }
  };

  // Register arrow
  const registrarFlecha = async (flecha: Flecha) => {
    console.log('🎯 registrarFlecha called with:', flecha);
    
    if (!state.treinoAtual || !treinoAtualId) {
      console.error('❌ No training or training ID available');
      return;
    }

    try {
      console.log('🎯 Creating/getting series...');
      
      // Create series if it doesn't exist
      let serieId: string;
      
      if (!state.treinoAtual.series[state.serieAtual]?.id) {
        console.log('🎯 Creating new series...');
        serieId = await treinosHook.createSerie({
          treino_id: treinoAtualId,
          numero_serie: state.serieAtual + 1,
        });
        console.log('🎯 Series created with ID:', serieId);
      } else {
        serieId = state.treinoAtual.series[state.serieAtual].id!;
        console.log('🎯 Using existing series ID:', serieId);
      }

      console.log('🎯 Creating arrow in database...');
      
      // Create arrow
      await treinosHook.createFlecha({
        serie_id: serieId,
        valor: flecha.valor,
        x: flecha.x || null,
        y: flecha.y || null,
        ordem: state.flechaAtual + 1,
      });
      
      console.log('🎯 Arrow created successfully in database');

      console.log('🎯 Updating local state...');
      
      // Update local state
      const seriesAtualizadas = [...state.treinoAtual.series];
      
      if (!seriesAtualizadas[state.serieAtual]) {
        console.log('🎯 Creating new series in local state');
        seriesAtualizadas[state.serieAtual] = { flechas: [], pontuacao: 0, id: serieId };
      }

      seriesAtualizadas[state.serieAtual].flechas.push(flecha);
      const novaPontuacaoSerie = seriesAtualizadas[state.serieAtual].flechas
        .reduce((total, f) => total + f.valor, 0);
      
      seriesAtualizadas[state.serieAtual].pontuacao = novaPontuacaoSerie;
      
      console.log('🎯 Series updated. Arrows in series:', seriesAtualizadas[state.serieAtual].flechas.length);
      console.log('🎯 Series score:', novaPontuacaoSerie);

      // Recalculate total training score
      const pontuacaoTotalAtualizada = seriesAtualizadas.reduce((total, serie) => total + serie.pontuacao, 0);
      const melhorSerieAtualizada = Math.max(...seriesAtualizadas.map(s => s.pontuacao));

      console.log('🎯 Total training score:', pontuacaoTotalAtualizada);
      console.log('🎯 Best series score:', melhorSerieAtualizada);

      const treinoAtualizado = {
        ...state.treinoAtual,
        series: seriesAtualizadas,
        pontuacaoTotal: pontuacaoTotalAtualizada,
        melhorSerie: melhorSerieAtualizada,
      };

      // TODO: Update database scores only at the end of training to avoid performance issues

      const flechasNaSerie = seriesAtualizadas[state.serieAtual].flechas.length;
      const flechasPorSerie = state.treinoAtual.config.flechasPorSerie;
      
      console.log('🎯 Arrows in current series:', flechasNaSerie, '/', flechasPorSerie);
      
      if (flechasNaSerie >= flechasPorSerie) {
        const totalSeries = state.treinoAtual.config.series;
        console.log('🎯 Series complete. Current series:', state.serieAtual + 1, '/', totalSeries);
        
        if (state.serieAtual + 1 >= totalSeries) {
          console.log('🎯 Training complete! Going to finalization screen');
          setState(prev => ({
            ...prev,
            treinoAtual: treinoAtualizado,
            telaAtual: 'finalizacao',
          }));
          return;
        } else {
          console.log('🎯 Series complete, advancing to next series');
          setState(prev => ({
            ...prev,
            treinoAtual: treinoAtualizado,
            serieAtual: prev.serieAtual + 1,
            flechaAtual: 0, // Reset arrow counter for new series
          }));
          return;
        }
      }

      console.log('🎯 Updating state with new arrow');
      setState(prev => ({
        ...prev,
        treinoAtual: treinoAtualizado,
        flechaAtual: prev.flechaAtual + 1,
      }));
    } catch (error) {
      console.error('Error registering arrow:', error);
      setState(prev => ({
        ...prev,
        error: 'Erro ao registrar flecha',
      }));
    }
  };

  // Edit arrow
  const editarFlecha = async (serieIndex: number, flechaIndex: number, novaFlecha: Flecha) => {
    if (!state.treinoAtual) return;

    try {
      const serie = state.treinoAtual.series[serieIndex];
      if (!serie?.id) return;

      // Find flecha in database and update
      const treinoCompleto = await treinosHook.getTreinoById(state.treinoAtual.id);
      const dbSerie = treinoCompleto?.series.find(s => s.numero_serie === serieIndex + 1);
      const dbFlecha = dbSerie?.flechas.find(f => f.ordem === flechaIndex + 1);

      if (dbFlecha) {
        await treinosHook.updateFlecha(dbFlecha.id, {
          valor: novaFlecha.valor,
          x: novaFlecha.x || null,
          y: novaFlecha.y || null,
        });

        // Update local state
        const seriesAtualizadas = [...state.treinoAtual.series];
        seriesAtualizadas[serieIndex].flechas[flechaIndex] = novaFlecha;
        const novaPontuacaoSerie = seriesAtualizadas[serieIndex].flechas
          .reduce((total, f) => total + f.valor, 0);
        
        seriesAtualizadas[serieIndex].pontuacao = novaPontuacaoSerie;

        // Recalculate training totals
        const pontuacaoTotalAtualizada = seriesAtualizadas.reduce((total, s) => total + s.pontuacao, 0);
        const melhorSerieAtualizada = Math.max(...seriesAtualizadas.map(s => s.pontuacao));

        setState(prev => ({
          ...prev,
          treinoAtual: {
            ...prev.treinoAtual!,
            series: seriesAtualizadas,
            pontuacaoTotal: pontuacaoTotalAtualizada,
            melhorSerie: melhorSerieAtualizada,
          },
        }));
      }
    } catch (error) {
      console.error('Error editing arrow:', error);
      setState(prev => ({
        ...prev,
        error: 'Erro ao editar flecha',
      }));
    }
  };

  // Next series
  const proximaSerie = async () => {
    setState(prev => ({
      ...prev,
      serieAtual: prev.serieAtual + 1,
      flechaAtual: 0,
    }));
  };

  // Finish training
  const finalizarTreino = async (observacoes?: string, autoavaliacao?: Autoavaliacao) => {
    if (!state.treinoAtual || !treinoAtualId) return;

    try {
      setState(prev => ({ ...prev, loading: true }));

      // Calculate final scores
      const pontuacaoTotal = state.treinoAtual.series.reduce((total, serie) => total + serie.pontuacao, 0);
      const melhorSerie = Math.max(...state.treinoAtual.series.map(s => s.pontuacao));

      // Update series scores in database
      for (const serie of state.treinoAtual.series) {
        if (serie.id) {
          await treinosHook.updateSerie(serie.id, {
            pontuacao: serie.pontuacao,
          });
        }
      }

      // Update training in database
      await treinosHook.updateTreino(treinoAtualId, {
        pontuacao_total: pontuacaoTotal,
        melhor_serie: melhorSerie,
        observacoes: observacoes || null,
        concluido: true,
      });

      // Save autoavaliacao if provided
      if (autoavaliacao) {
        await treinosHook.saveAutoavaliacao({
          treino_id: treinoAtualId,
          postura: autoavaliacao.postura,
          ancoragem: autoavaliacao.ancoragem,
          alinhamento: autoavaliacao.alinhamento,
          respiracao: autoavaliacao.respiracao,
          mira: autoavaliacao.mira,
          liberacao: autoavaliacao.liberacao,
          follow_through: autoavaliacao.followThrough,
          consistencia: autoavaliacao.consistencia,
          ritmo: autoavaliacao.ritmo,
          foco: autoavaliacao.foco,
        });
      }

      // Reset current training state
      setState(prev => ({
        ...prev,
        treinoAtual: null,
        serieAtual: 0,
        flechaAtual: 0,
        telaAtual: 'home',
        loading: false,
      }));

      setTreinoAtualId(null);

      // Reload trainings to get updated data
      await treinosHook.loadTreinos();
    } catch (error) {
      console.error('Error finishing training:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao finalizar treino',
      }));
    }
  };

  // Reset current training
  const resetTreinoAtual = () => {
    setState(prev => ({
      ...prev,
      treinoAtual: null,
      serieAtual: 0,
      flechaAtual: 0,
    }));
    setTreinoAtualId(null);
  };

  // Load trainings
  const carregarTreinos = async () => {
    await treinosHook.loadTreinos();
  };

  // Get training by ID
  const getTreinoById = async (id: string): Promise<Treino | null> => {
    try {
      const treinoDb = await treinosHook.getTreinoById(id);
      return treinoDb ? convertTreinoDbToApp(treinoDb) : null;
    } catch (error) {
      console.error('Error getting training by ID:', error);
      return null;
    }
  };

  // Clear error
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const contextValue: ArcoTrackContextType = {
    state: {
      ...state,
      loading: state.loading || authLoading,
    },
    navegarPara,
    iniciarTreino,
    registrarFlecha,
    editarFlecha,
    proximaSerie,
    finalizarTreino,
    resetTreinoAtual,
    carregarTreinos,
    getTreinoById,
    clearError,
  };

  return (
    <ArcoTrackContext.Provider value={contextValue}>
      {children}
    </ArcoTrackContext.Provider>
  );
}

// Hook personalizado
export function useArcoTrack() {
  const context = useContext(ArcoTrackContext);
  if (!context) {
    throw new Error('useArcoTrack deve ser usado dentro de um ArcoTrackProvider');
  }
  return context;
}
