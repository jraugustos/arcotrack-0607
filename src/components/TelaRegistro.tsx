import React, { useState } from 'react';
import { useArcoTrack, TreinoConfig } from '../contexts/ArcoTrackContext';
import { Calendar, Target, Users, Ruler, CheckSquare, Play, X, Loader2 } from 'lucide-react';

export function TelaRegistro() {
  const { iniciarTreino, navegarPara, state } = useArcoTrack();
  const [config, setConfig] = useState<TreinoConfig>({
    data: new Date().toISOString().split('T')[0],
    series: 20,
    flechasPorSerie: 3,
    distancia: 30,
    temObjetivo: false,
    objetivo: undefined,
  });

  const [erro, setErro] = useState('');

  const atualizarConfig = (campo: keyof TreinoConfig, valor: any) => {
    setConfig(prev => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const toggleObjetivo = () => {
    const novoTemObjetivo = !config.temObjetivo;
    setConfig(prev => ({
      ...prev,
      temObjetivo: novoTemObjetivo,
      objetivo: novoTemObjetivo ? 300 : undefined,
    }));
  };

  const handleIniciarTreino = async () => {
    // Validações
    if (config.series <= 0) {
      setErro('Número de séries deve ser maior que 0');
      return;
    }
    if (config.flechasPorSerie <= 0) {
      setErro('Flechas por série deve ser maior que 0');
      return;
    }
    if (config.distancia <= 0) {
      setErro('Distância deve ser maior que 0');
      return;
    }

    try {
      setErro('');
      await iniciarTreino(config);
    } catch (error) {
      console.error('Error starting training:', error);
      setErro('Erro ao iniciar treino. Tente novamente.');
    }
  };

  const cancelar = () => {
    navegarPara('home');
  };

  // Calcular pontuação máxima possível
  const pontuacaoMaxima = config.series * config.flechasPorSerie * 10;

  return (
    <div className="min-h-screen bg-arco-secondary font-dm-sans flex flex-col">
      {/* Header */}
      <div className="bg-black px-4 py-8 border-b-4" style={{borderImage: 'linear-gradient(to right, #43c6ac, #f8ffae) 1'}}>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-arco-secondary">Novo Treino</h1>
          <button
            onClick={cancelar}
            className="w-12 h-12 bg-arco-secondary/10 rounded-2xl flex items-center justify-center text-arco-secondary hover:bg-arco-secondary/20 transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Conteúdo scrollável */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-4 py-8">
        <div className="bg-white rounded-3xl p-8 border border-arco-gray-300/30 space-y-8">
          {/* Data do treino */}
          <div>
            <label className="flex items-center space-x-3 text-arco-primary font-medium mb-4 text-lg">
              <Calendar className="w-6 h-6" />
              <span>Data do treino</span>
            </label>
            <input
              type="date"
              value={config.data}
              onChange={(e) => atualizarConfig('data', e.target.value)}
              className="w-full p-5 border border-arco-gray-300 rounded-2xl focus:outline-none focus:border-arco-accent focus:ring-2 focus:ring-arco-accent/20 transition-all duration-200 font-medium bg-arco-gray-100"
            />
          </div>

          {/* Número de séries */}
          <div>
            <label className="flex items-center space-x-3 text-arco-primary font-medium mb-4 text-lg">
              <Users className="w-6 h-6" />
              <span>Número de séries</span>
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="20"
                value={config.series}
                onChange={e => atualizarConfig('series', parseInt(e.target.value))}
                className="flex-1 accent-arco-accent slider-gradient"
              />
              <span className="w-10 text-center font-medium text-xl">{config.series}</span>
            </div>
          </div>

          {/* Flechas por série */}
          <div>
            <label className="flex items-center space-x-3 text-arco-primary font-medium mb-4 text-lg">
              <Target className="w-6 h-6" />
              <span>Flechas por série</span>
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="6"
                value={config.flechasPorSerie}
                onChange={e => atualizarConfig('flechasPorSerie', parseInt(e.target.value))}
                className="flex-1 accent-arco-accent slider-gradient"
              />
              <span className="w-10 text-center font-medium text-xl">{config.flechasPorSerie}</span>
            </div>
          </div>

          {/* Distância */}
          <div>
            <label className="flex items-center space-x-3 text-arco-primary font-medium mb-4 text-lg">
              <Ruler className="w-6 h-6" />
              <span>Distância (metros)</span>
            </label>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[10, 18, 30, 50, 70, 90].map((dist) => (
                <button
                  key={dist}
                  onClick={() => atualizarConfig('distancia', dist)}
                  className={`p-4 rounded-2xl border-2 font-medium transition-all duration-200 ${
                    config.distancia === dist
                      ? 'bg-accent-gradient border-arco-accent text-arco-primary'
                      : 'bg-white border-arco-gray-300 text-arco-gray-700 hover:border-arco-accent hover:bg-arco-accent/10'
                  }`}
                >
                  {dist}m
                </button>
              ))}
            </div>
            <input
              type="number"
              value={config.distancia}
              onChange={(e) => atualizarConfig('distancia', parseInt(e.target.value) || 18)}
              placeholder="Distância personalizada"
              className="w-full p-5 border border-arco-gray-300 rounded-2xl focus:outline-none focus:border-arco-accent focus:ring-2 focus:ring-arco-accent/20 transition-all duration-200 font-medium bg-arco-gray-100"
              min="1"
            />
          </div>

          {/* Objetivo */}
          <div>
            <button
              onClick={toggleObjetivo}
              className="flex items-center space-x-3 text-arco-primary font-medium mb-4 hover:text-arco-accent transition-colors text-lg"
            >
              <CheckSquare className={`w-6 h-6 ${config.temObjetivo ? 'text-arco-accent' : 'text-arco-gray-500'}`} />
              <span>Deseja adicionar um objetivo?</span>
            </button>
            
            {config.temObjetivo && (
              <div className="ml-8">
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    value={config.objetivo || ''}
                    onChange={(e) => atualizarConfig('objetivo', parseInt(e.target.value) || undefined)}
                    placeholder="Pontuação objetivo"
                    className="flex-1 p-5 border border-arco-gray-300 rounded-2xl focus:outline-none focus:border-arco-accent focus:ring-2 focus:ring-arco-accent/20 transition-all duration-200 font-medium bg-arco-gray-100"
                    min="1"
                    max={pontuacaoMaxima}
                  />
                  <span className="text-arco-gray-700 font-medium">de {pontuacaoMaxima}</span>
                </div>
                <p className="text-sm text-arco-gray-700 mt-3 font-medium">
                  Pontuação máxima possível: {pontuacaoMaxima} pontos
                </p>
              </div>
            )}
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-red-600 text-sm font-medium">{erro}</p>
            </div>
          )}
        </div>

        {/* Resumo do treino */}
        <div className="bg-white rounded-3xl p-8 border border-arco-gray-300/30 mt-8">
          <h3 className="text-xl font-bold text-arco-primary mb-6">Resumo do Treino</h3>
          <div className="flex flex-col gap-6 text-base">
            <div>
              <span className="text-arco-gray-700 font-medium">Total de flechas:</span>
              <span className="font-bold text-arco-primary ml-2 text-lg">
                {config.series * config.flechasPorSerie}
              </span>
            </div>
            <div>
              <span className="text-arco-gray-700 font-medium">Duração estimada:</span>
              <span className="font-bold text-arco-primary ml-2 text-lg">
                {Math.round((config.series * config.flechasPorSerie * 0.5))} min
              </span>
            </div>
            <div>
              <span className="text-arco-gray-700 font-medium">Pontuação máxima:</span>
              <span className="font-bold text-arco-primary ml-2 text-lg">
                {pontuacaoMaxima} pontos
              </span>
            </div>
            {config.temObjetivo && config.objetivo && (
              <div>
                <span className="text-arco-gray-700 font-medium">Objetivo:</span>
                <span className="font-bold text-arco-accent ml-2 text-lg">
                  {config.objetivo} pontos
                </span>
              </div>
            )}
          </div>
        </div>

        </div>
      </div>

      {/* Botão fixo no rodapé */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-arco-gray-200 p-4 safe-area-pb">
        <button
          onClick={handleIniciarTreino}
          disabled={state.loading}
          className="w-full bg-accent-gradient text-black font-bold py-4 rounded-2xl hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          <span>Iniciar Treino</span>
        </button>
      </div>
    </div>
  );
}
