import React, { useState, useEffect } from 'react';
import { useArcoTrack, Treino, Flecha } from '../contexts/ArcoTrackContext';
import { ChevronLeft, Save, X, Edit3, Trash2, Target as TargetIcon } from 'lucide-react';

interface TelaEdicaoTreinoProps {
  treinoId: string;
  onVoltar: () => void;
}

export function TelaEdicaoTreino({ treinoId, onVoltar }: TelaEdicaoTreinoProps) {
  const { getTreinoById } = useArcoTrack();
  const [treino, setTreino] = useState<Treino | null>(null);
  const [loading, setLoading] = useState(true);
  const [editandoFlecha, setEditandoFlecha] = useState<{serieIndex: number, flechaIndex: number} | null>(null);
  const [novoValorFlecha, setNovoValorFlecha] = useState<string>('');
  
  // Estados editáveis
  const [observacoes, setObservacoes] = useState('');
  const [objetivo, setObjetivo] = useState<number | undefined>();
  const [distancia, setDistancia] = useState(30);

  useEffect(() => {
    const carregarTreino = async () => {
      try {
        setLoading(true);
        const treinoData = await getTreinoById(treinoId);
        if (treinoData) {
          setTreino(treinoData);
          setObservacoes(treinoData.observacoes || '');
          setObjetivo(treinoData.config.objetivo);
          setDistancia(treinoData.config.distancia);
        }
      } catch (error) {
        console.error('Erro ao carregar treino:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarTreino();
  }, [treinoId, getTreinoById]);

  const iniciarEdicaoFlecha = (serieIndex: number, flechaIndex: number) => {
    const flecha = treino?.series[serieIndex]?.flechas[flechaIndex];
    if (flecha) {
      setEditandoFlecha({ serieIndex, flechaIndex });
      setNovoValorFlecha(flecha.valor.toString());
    }
  };

  const salvarEdicaoFlecha = () => {
    if (!editandoFlecha || !treino) return;
    
    const novoValor = parseInt(novoValorFlecha);
    if (isNaN(novoValor) || novoValor < 0 || novoValor > 10) {
      alert('Valor deve ser entre 0 e 10');
      return;
    }

    // Criar cópia do treino com a flecha editada
    const treinoAtualizado = { ...treino };
    treinoAtualizado.series[editandoFlecha.serieIndex].flechas[editandoFlecha.flechaIndex].valor = novoValor;
    
    // Recalcular pontuação da série
    const serie = treinoAtualizado.series[editandoFlecha.serieIndex];
    serie.pontuacao = serie.flechas.reduce((total, f) => total + f.valor, 0);
    
    // Recalcular pontuação total e melhor série
    treinoAtualizado.pontuacaoTotal = treinoAtualizado.series.reduce((total, s) => total + s.pontuacao, 0);
    treinoAtualizado.melhorSerie = Math.max(...treinoAtualizado.series.map(s => s.pontuacao));
    
    setTreino(treinoAtualizado);
    setEditandoFlecha(null);
    setNovoValorFlecha('');
  };

  const cancelarEdicaoFlecha = () => {
    setEditandoFlecha(null);
    setNovoValorFlecha('');
  };

  const excluirFlecha = (serieIndex: number, flechaIndex: number) => {
    if (!treino) return;
    
    if (!confirm('Tem certeza que deseja excluir esta flecha?')) return;
    
    const treinoAtualizado = { ...treino };
    treinoAtualizado.series[serieIndex].flechas.splice(flechaIndex, 1);
    
    // Recalcular pontuações
    const serie = treinoAtualizado.series[serieIndex];
    serie.pontuacao = serie.flechas.reduce((total, f) => total + f.valor, 0);
    treinoAtualizado.pontuacaoTotal = treinoAtualizado.series.reduce((total, s) => total + s.pontuacao, 0);
    treinoAtualizado.melhorSerie = Math.max(...treinoAtualizado.series.map(s => s.pontuacao));
    
    setTreino(treinoAtualizado);
  };

  const salvarTreino = async () => {
    if (!treino) return;
    
    try {
      setLoading(true);
      
      // TODO: Implementar salvamento no backend
      // await updateTreino(treino.id, {
      //   observacoes,
      //   config: { ...treino.config, objetivo, distancia },
      //   series: treino.series,
      //   pontuacaoTotal: treino.pontuacaoTotal,
      //   melhorSerie: treino.melhorSerie
      // });
      
      alert('Treino salvo com sucesso!\n(Funcionalidade de persistência será implementada)');
      onVoltar();
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
      alert('Erro ao salvar treino. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getCoresFlecha = (valor: number) => {
    if (valor === 0) return { bg: '#6C757D', text: '#FFFFFF' };
    if (valor <= 2) return { bg: '#D9D9D9', text: '#000000' };
    if (valor <= 4) return { bg: '#434343', text: '#FFFFFF' };
    if (valor <= 6) return { bg: '#4FA3D9', text: '#FFFFFF' };
    if (valor <= 8) return { bg: '#F86B4F', text: '#FFFFFF' };
    return { bg: '#FFD66B', text: '#000000' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-arco-light font-dm-sans flex items-center justify-center">
        <div className="text-arco-navy">Carregando treino...</div>
      </div>
    );
  }

  if (!treino) {
    return (
      <div className="min-h-screen bg-arco-light font-dm-sans flex items-center justify-center">
        <div className="text-center">
          <div className="text-arco-navy mb-4">Treino não encontrado</div>
          <button
            onClick={onVoltar}
            className="bg-accent-gradient text-black px-6 py-3 rounded-2xl"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-arco-light font-dm-sans">
      {/* Header */}
      <div className="bg-black px-4 py-8 border-b-4" style={{borderImage: 'linear-gradient(to right, #43c6ac, #f8ffae) 1'}}>
        <div className="flex items-center space-x-4">
          <button
            onClick={onVoltar}
            className="w-10 h-10 flex items-center justify-center text-white hover:text-arco-accent transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-arco-secondary">
              Editar Treino
            </h1>
            <p className="text-arco-secondary">
              {new Date(treino.data).toLocaleDateString('pt-BR')} • {treino.pontuacaoTotal} pontos
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Configurações básicas */}
        <div className="bg-arco-white rounded-arco p-6">
          <h3 className="font-semibold text-arco-navy mb-4">Configurações</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-arco-gray mb-2">
                Distância (metros)
              </label>
              <input
                type="number"
                value={distancia}
                onChange={(e) => setDistancia(parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 border border-arco-gray-300 rounded-lg focus:ring-2 focus:ring-arco-accent focus:border-transparent"
                min="10"
                max="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-arco-gray mb-2">
                Objetivo (pontos)
              </label>
              <input
                type="number"
                value={objetivo || ''}
                onChange={(e) => setObjetivo(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Opcional"
                className="w-full px-3 py-2 border border-arco-gray-300 rounded-lg focus:ring-2 focus:ring-arco-accent focus:border-transparent"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Séries e flechas */}
        <div className="bg-arco-white rounded-arco p-6">
          <h3 className="font-semibold text-arco-navy mb-4">Séries e Flechas</h3>
          <div className="space-y-4">
            {treino.series.map((serie, serieIndex) => (
              <div key={serieIndex} className="border border-arco-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-arco-navy">
                    Série {serieIndex + 1}
                  </h4>
                  <span className="text-sm font-bold text-arco-navy">
                    {serie.pontuacao} pontos
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {serie.flechas.map((flecha, flechaIndex) => {
                    const cores = getCoresFlecha(flecha.valor);
                    const editando = editandoFlecha?.serieIndex === serieIndex && 
                                   editandoFlecha?.flechaIndex === flechaIndex;
                    
                    return (
                      <div key={flechaIndex} className="relative group">
                        {editando ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={novoValorFlecha}
                              onChange={(e) => setNovoValorFlecha(e.target.value)}
                              className="w-16 h-10 text-center border border-arco-accent rounded"
                              min="0"
                              max="10"
                              autoFocus
                            />
                            <button
                              onClick={salvarEdicaoFlecha}
                              className="w-8 h-8 bg-green-500 text-white rounded flex items-center justify-center"
                            >
                              ✓
                            </button>
                            <button
                              onClick={cancelarEdicaoFlecha}
                              className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 border-gray-900 cursor-pointer hover:ring-2 hover:ring-arco-accent transition-all"
                              style={{
                                backgroundColor: cores.bg,
                                color: cores.text
                              }}
                              onClick={() => iniciarEdicaoFlecha(serieIndex, flechaIndex)}
                            >
                              {flecha.valor}
                            </div>
                            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => iniciarEdicaoFlecha(serieIndex, flechaIndex)}
                                  className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs"
                                  title="Editar"
                                >
                                  <Edit3 className="w-2 h-2" />
                                </button>
                                <button
                                  onClick={() => excluirFlecha(serieIndex, flechaIndex)}
                                  className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-2 h-2" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Observações */}
        <div className="bg-arco-white rounded-arco p-6">
          <h3 className="font-semibold text-arco-navy mb-4">Observações</h3>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Adicione observações sobre este treino..."
            className="w-full px-3 py-2 border border-arco-gray-300 rounded-lg focus:ring-2 focus:ring-arco-accent focus:border-transparent"
            rows={4}
          />
        </div>

        {/* Botões de ação */}
        <div className="flex space-x-4">
          <button
            onClick={onVoltar}
            disabled={loading}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            <X className="w-5 h-5 inline mr-2" />
            Cancelar
          </button>
          <button
            onClick={salvarTreino}
            disabled={loading}
            className="flex-1 bg-accent-gradient text-black py-3 rounded-2xl font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            <Save className="w-5 h-5 inline mr-2" />
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}