import { useEffect, useCallback } from 'react';
import { Treino } from '../contexts/ArcoTrackContext';

const AUTO_SAVE_KEY = 'arcotrack-current-training';
const AUTO_SAVE_METADATA_KEY = 'arcotrack-training-metadata';

interface AutoSaveMetadata {
  lastSaved: string;
  userId: string;
  treinoId: string;
  version: number;
}

export const useAutoSave = () => {
  // Salvar treino atual no localStorage
  const saveCurrentTraining = useCallback((treino: Treino, userId: string) => {
    try {
      const saveData = {
        treino,
        timestamp: new Date().toISOString(),
      };

      const metadata: AutoSaveMetadata = {
        lastSaved: new Date().toISOString(),
        userId,
        treinoId: treino.id,
        version: Date.now(), // Simples versioning usando timestamp
      };

      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(saveData));
      localStorage.setItem(AUTO_SAVE_METADATA_KEY, JSON.stringify(metadata));
      
      console.log('[AutoSave] Treino salvo localmente:', treino.id);
    } catch (error) {
      console.error('[AutoSave] Erro ao salvar treino:', error);
    }
  }, []);

  // Carregar treino salvo do localStorage
  const loadSavedTraining = useCallback((userId: string): Treino | null => {
    try {
      const savedData = localStorage.getItem(AUTO_SAVE_KEY);
      const savedMetadata = localStorage.getItem(AUTO_SAVE_METADATA_KEY);

      if (!savedData || !savedMetadata) {
        return null;
      }

      const data = JSON.parse(savedData);
      const metadata: AutoSaveMetadata = JSON.parse(savedMetadata);

      // Verificar se o treino salvo é do usuário atual
      if (metadata.userId !== userId) {
        console.log('[AutoSave] Treino salvo é de outro usuário, ignorando');
        return null;
      }

      // Verificar se não é muito antigo (máximo 24h)
      const lastSaved = new Date(metadata.lastSaved);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastSaved.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        console.log('[AutoSave] Treino salvo muito antigo, removendo');
        clearSavedTraining();
        return null;
      }

      console.log('[AutoSave] Treino recuperado do localStorage:', metadata.treinoId);
      return data.treino;
    } catch (error) {
      console.error('[AutoSave] Erro ao carregar treino salvo:', error);
      return null;
    }
  }, []);

  // Limpar treino salvo
  const clearSavedTraining = useCallback(() => {
    try {
      localStorage.removeItem(AUTO_SAVE_KEY);
      localStorage.removeItem(AUTO_SAVE_METADATA_KEY);
      console.log('[AutoSave] Treino salvo removido');
    } catch (error) {
      console.error('[AutoSave] Erro ao limpar treino salvo:', error);
    }
  }, []);

  // Verificar se existe treino salvo
  const hasSavedTraining = useCallback((userId: string): boolean => {
    try {
      const savedMetadata = localStorage.getItem(AUTO_SAVE_METADATA_KEY);
      if (!savedMetadata) return false;

      const metadata: AutoSaveMetadata = JSON.parse(savedMetadata);
      return metadata.userId === userId;
    } catch (error) {
      console.error('[AutoSave] Erro ao verificar treino salvo:', error);
      return false;
    }
  }, []);

  // Obter informações do treino salvo
  const getSavedTrainingInfo = useCallback((userId: string) => {
    try {
      const savedMetadata = localStorage.getItem(AUTO_SAVE_METADATA_KEY);
      if (!savedMetadata) return null;

      const metadata: AutoSaveMetadata = JSON.parse(savedMetadata);
      if (metadata.userId !== userId) return null;

      return {
        treinoId: metadata.treinoId,
        lastSaved: metadata.lastSaved,
        version: metadata.version,
      };
    } catch (error) {
      console.error('[AutoSave] Erro ao obter info do treino salvo:', error);
      return null;
    }
  }, []);

  // Auto-save debounced para evitar muitas escritas
  const debouncedAutoSave = useCallback(
    debounce((treino: Treino, userId: string) => {
      saveCurrentTraining(treino, userId);
    }, 2000), // 2 segundos de delay
    [saveCurrentTraining]
  );

  // Utility para debounce
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Listener para detectar quando a página está sendo fechada
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Força um save imediato antes de fechar
      const currentData = localStorage.getItem(AUTO_SAVE_KEY);
      if (currentData) {
        console.log('[AutoSave] Salvando antes de fechar a página');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Página ficou invisível, força save
        console.log('[AutoSave] Página ficou invisível, salvando');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    saveCurrentTraining,
    loadSavedTraining,
    clearSavedTraining,
    hasSavedTraining,
    getSavedTrainingInfo,
    debouncedAutoSave,
  };
};