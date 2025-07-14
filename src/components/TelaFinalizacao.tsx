import React from 'react';
import { useArcoTrack } from '../contexts/ArcoTrackContext';
import { Target, Award, TrendingUp, Star, ChevronRight } from 'lucide-react';
import { analisarTreino, gerarResumoTendencia } from '../lib/analiseTendencia';

export function TelaFinalizacao() {
  const { state, navegarPara } = useArcoTrack();

  if (!state.treinoAtual) return null;

  const { config, series } = state.treinoAtual;
  
  // Calcular estatísticas
  const pontuacaoTotal = series.reduce((total, serie) => total + serie.pontuacao, 0);
  const melhorSerie = Math.max(...series.map(s => s.pontuacao));
  const piorSerie = Math.min(...series.map(s => s.pontuacao));
  const pontuacaoMedia = Math.round(pontuacaoTotal / series.length);
  const pontuacaoMaximaPossivel = config.series * config.flechasPorSerie * 10;
  const percentualAcerto = Math.round((pontuacaoTotal / pontuacaoMaximaPossivel) * 100);
  
  // Verificar se atingiu o objetivo
  const atingiuObjetivo = config.temObjetivo && config.objetivo ? pontuacaoTotal >= config.objetivo : false;

  // Análise de tendência inteligente
  const analiseTreino = analisarTreino(state.treinoAtual);
  const tendencia = gerarResumoTendencia(analiseTreino.tendenciaGeral);

  const irParaAutoavaliacao = () => {
    navegarPara('autoavaliacao');
  };

  const finalizarSemAutoavaliacao = async () => {
    // For now, just go to home - the training data is already saved
    navegarPara('home');
  };

  return (
    <div className="min-h-screen bg-arco-light font-dm-sans">
      {/* Header */}
      <div className="bg-black px-4 py-8 border-b-4" style={{borderImage: 'linear-gradient(to right, #43c6ac, #f8ffae) 1'}}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-arco-yellow rounded-full flex items-center justify-center mr-4">
              {atingiuObjetivo ? (
                <Award className="w-7 h-7 text-arco-secondary" />
              ) : (
                <Target className="w-7 h-7 text-arco-secondary" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-arco-secondary">
                {atingiuObjetivo ? 'Objetivo Atingido!' : 'Treino Concluído!'}
              </h1>
              <p className="text-arco-secondary text-sm">
                {new Date(config.data).toLocaleDateString('pt-BR')} • {config.distancia}m
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 pb-32 space-y-6">
        {/* Pontuação principal */}
        <div className="bg-arco-white rounded-arco p-6 text-center">
          <div className="text-4xl font-bold text-arco-navy mb-2">{pontuacaoTotal}</div>
          <div className="text-arco-gray mb-4">pontos totais</div>
          
          {config.temObjetivo && config.objetivo && (
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              atingiuObjetivo 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {atingiuObjetivo ? '✓ Objetivo atingido!' : `Meta: ${config.objetivo} pts`}
            </div>
          )}
        </div>

        {/* Estatísticas detalhadas */}
        <div className="bg-arco-white rounded-arco p-6">
          <h3 className="font-semibold text-arco-navy mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Destaques de Desempenho
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-arco-light rounded-arco">
              <div className="text-xl font-bold text-arco-navy">{melhorSerie}</div>
              <div className="text-xs text-arco-gray">Melhor série</div>
            </div>
            <div className="text-center p-3 bg-arco-light rounded-arco">
              <div className="text-xl font-bold text-arco-navy">{pontuacaoMedia}</div>
              <div className="text-xs text-arco-gray">Média por série</div>
            </div>
            <div className="text-center p-3 bg-arco-light rounded-arco">
              <div className="text-xl font-bold text-arco-navy">{percentualAcerto}%</div>
              <div className="text-xs text-arco-gray">Eficiência</div>
            </div>
            <div className="text-center p-3 bg-arco-light rounded-arco">
              <div className="text-xl font-bold text-arco-navy">{config.series * config.flechasPorSerie}</div>
              <div className="text-xs text-arco-gray">Total de flechas</div>
            </div>
          </div>
        </div>

        {/* Análise de tendência */}
        <div className="bg-arco-white rounded-arco p-6">
          <h3 className="font-semibold text-arco-navy mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Tendência de Mira
          </h3>
          <p className="text-arco-gray">{tendencia}</p>
          
          {/* Gráfico simples das séries */}
          <div className="mt-4">
            <div className="flex items-end justify-between h-16 space-x-1">
              {series.map((serie, index) => {
                const altura = (serie.pontuacao / melhorSerie) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className={`w-full rounded-t transition-all ${
                        serie.pontuacao === melhorSerie ? 'bg-arco-yellow' : 'bg-arco-orange'
                      }`}
                      style={{ height: `${altura}%` }}
                    ></div>
                    <div className="text-xs text-arco-gray mt-1">S{index + 1}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>



        {/* Análise das séries */}
        <div className="bg-arco-white rounded-arco p-6">
          <h3 className="font-semibold text-arco-navy mb-4">Detalhes por Série</h3>
          <div className="space-y-3">
            {series.map((serie, index) => (
              <div key={index} className="flex items-center justify-between p-3 border-b border-arco-light last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-arco-light rounded-full flex items-center justify-center text-sm font-medium text-arco-navy">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-arco-navy">Série {index + 1}</div>
                    <div className="text-sm text-arco-gray">
                      Flechas: {serie.flechas.map(f => f.valor).join(', ')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${
                    serie.pontuacao === melhorSerie ? 'text-arco-yellow' : 
                    serie.pontuacao === piorSerie ? 'text-arco-gray' : 'text-arco-navy'
                  }`}>
                    {serie.pontuacao}
                  </div>
                  <div className="text-xs text-arco-gray">pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botões de ação fixos no bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-arco-gray-200 p-4 space-y-3">
        <button
          onClick={irParaAutoavaliacao}
          className="w-full bg-arco-yellow text-arco-navy font-semibold py-4 rounded-arco hover:bg-arco-orange transition-colors flex items-center justify-center space-x-2"
        >
          <span>Autoavaliar Processo</span>
          <ChevronRight className="w-5 h-5" />
        </button>
        
        <button
          onClick={finalizarSemAutoavaliacao}
          className="w-full bg-accent-gradient text-black font-bold py-4 rounded-2xl hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
        >
          <span>Salvar e Concluir</span>
        </button>
      </div>
    </div>
  );
}
