import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  TreinoDb, 
  SerieDb, 
  FlechaDb, 
  AutoavaliacaoDb,
  TreinoInsert,
  SerieInsert,
  FlechaInsert,
  AutoavaliacaoInsert
} from '../lib/database.types';
import { useAuth } from './useAuth';

// Types for complete training data
export interface TreinoCompleto extends Omit<TreinoDb, 'series'> {
  series: (SerieDb & {
    flechas: FlechaDb[];
  })[];
  autoavaliacao?: AutoavaliacaoDb;
}

export const useTreinos = () => {
  const { user } = useAuth();
  const [treinos, setTreinos] = useState<TreinoCompleto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all treinos for current user
  const loadTreinos = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('treinos')
        .select(`
          *,
          series (
            *,
            flechas (*)
          ),
          autoavaliacoes (*)
        `)
        .eq('user_id', user.id)
        .order('data', { ascending: false });

      if (error) {
        console.error('Error loading treinos:', error);
        setError(error.message);
        return;
      }

      const treinosCompletos: TreinoCompleto[] = data?.map(treino => ({
        ...treino,
        series: treino.series || [],
        autoavaliacao: treino.autoavaliacoes?.[0] || undefined,
      })) || [];

      setTreinos(treinosCompletos);
    } catch (err) {
      console.error('Error loading treinos:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar treinos');
    } finally {
      setLoading(false);
    }
  };

  // Create new treino
  const createTreino = async (treinoData: Omit<TreinoInsert, 'user_id'>): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('treinos')
        .insert({
          ...treinoData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating treino:', error);
        throw error;
      }

      await loadTreinos(); // Reload to get updated data
      return data.id;
    } catch (err) {
      console.error('Error creating treino:', err);
      throw err;
    }
  };

  // Update treino
  const updateTreino = async (treinoId: string, updates: Partial<TreinoDb>) => {
    try {
      const { error } = await supabase
        .from('treinos')
        .update(updates)
        .eq('id', treinoId);

      if (error) throw error;

      await loadTreinos();
    } catch (err) {
      console.error('Error updating treino:', err);
      throw err;
    }
  };

  // Delete treino
  const deleteTreino = async (treinoId: string) => {
    try {
      const { error } = await supabase
        .from('treinos')
        .delete()
        .eq('id', treinoId);

      if (error) throw error;

      await loadTreinos();
    } catch (err) {
      console.error('Error deleting treino:', err);
      throw err;
    }
  };

  // Create serie
  const createSerie = async (serieData: SerieInsert): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('series')
        .insert(serieData)
        .select()
        .single();

      if (error) {
        console.error('Error creating serie:', error);
        throw error;
      }

      await loadTreinos();
      return data.id;
    } catch (err) {
      console.error('Error creating serie:', err);
      throw err;
    }
  };

  // Update serie
  const updateSerie = async (serieId: string, updates: Partial<SerieDb>) => {
    try {
      const { error } = await supabase
        .from('series')
        .update(updates)
        .eq('id', serieId);

      if (error) throw error;

      await loadTreinos();
    } catch (err) {
      console.error('Error updating serie:', err);
      throw err;
    }
  };

  // Create flecha
  const createFlecha = async (flechaData: FlechaInsert): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('flechas')
        .insert(flechaData)
        .select()
        .single();

      if (error) {
        console.error('Error creating flecha:', error);
        throw error;
      }

      await loadTreinos();
      return data.id;
    } catch (err) {
      console.error('Error creating flecha:', err);
      throw err;
    }
  };

  // Batch create flechas
  const createFlechas = async (flechasData: FlechaInsert[]) => {
    try {
      const { error } = await supabase
        .from('flechas')
        .insert(flechasData);

      if (error) throw error;

      await loadTreinos();
    } catch (err) {
      console.error('Error creating flechas:', err);
      throw err;
    }
  };

  // Update flecha
  const updateFlecha = async (flechaId: string, updates: Partial<FlechaDb>) => {
    try {
      const { error } = await supabase
        .from('flechas')
        .update(updates)
        .eq('id', flechaId);

      if (error) throw error;

      await loadTreinos();
    } catch (err) {
      console.error('Error updating flecha:', err);
      throw err;
    }
  };

  // Create or update autoavaliacao
  const saveAutoavaliacao = async (avaliacaoData: AutoavaliacaoInsert) => {
    try {
      // Check if autoavaliacao already exists
      const { data: existing, error: existingError } = await supabase
        .from('autoavaliacoes')
        .select('id')
        .eq('treino_id', avaliacaoData.treino_id)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('autoavaliacoes')
          .update(avaliacaoData)
          .eq('id', existing.id);

        if (error) {
          console.error('Error updating autoavaliacao:', error);
          throw error;
        }
      } else {
        // Create new
        const { error } = await supabase
          .from('autoavaliacoes')
          .insert(avaliacaoData);

        if (error) {
          console.error('Error creating autoavaliacao:', error);
          throw error;
        }
      }

      await loadTreinos();
    } catch (err) {
      console.error('Error saving autoavaliacao:', err);
      throw err;
    }
  };

  // Get treino by ID
  const getTreinoById = async (treinoId: string): Promise<TreinoCompleto | null> => {
    try {
      const { data, error } = await supabase
        .from('treinos')
        .select(`
          *,
          series (
            *,
            flechas (*)
          ),
          autoavaliacoes (*)
        `)
        .eq('id', treinoId)
        .single();

      if (error) throw error;

      return {
        ...data,
        series: data.series || [],
        autoavaliacao: data.autoavaliacoes?.[0] || undefined,
      };
    } catch (err) {
      console.error('Error getting treino by ID:', err);
      throw err;
    }
  };

  // Load treinos when user changes
  useEffect(() => {
    if (user) {
      loadTreinos();
    } else {
      setTreinos([]);
    }
  }, [user]);

  return {
    treinos,
    loading,
    error,
    loadTreinos,
    createTreino,
    updateTreino,
    deleteTreino,
    createSerie,
    updateSerie,
    createFlecha,
    createFlechas,
    updateFlecha,
    saveAutoavaliacao,
    getTreinoById,
  };
};