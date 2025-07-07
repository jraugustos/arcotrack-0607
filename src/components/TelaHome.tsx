import React from 'react';
import { useArcoTrack } from '../contexts/ArcoTrackContext';
import { Plus, Target, Calendar, TrendingUp, Award } from 'lucide-react';

export function TelaHome() {
  const { state, navegarPara } = useArcoTrack();

  const irParaNovoTreino = () => {
    navegarPara('registro');
  };

  const irParaHistorico = () => {
    navegarPara('historico');
  };

  const temTreinos = state.treinos.length > 0;
  const ultimosTreinos = state.treinos.slice(-3).reverse();

  // Calcular estatísticas
  const pontuacaoMedia = temTreinos 
    ? Math.round(state.treinos.reduce((acc, t) => acc + t.pontuacaoTotal, 0) / state.treinos.length)
    : 0;

  const melhorPontuacao = temTreinos 
    ? Math.max(...state.treinos.map(t => t.pontuacaoTotal))
    : 0;

  const treinosEsteMes = state.treinos.filter(t => {
    const dataT = new Date(t.data);
    const agora = new Date();
    return dataT.getMonth() === agora.getMonth() && dataT.getFullYear() === agora.getFullYear();
  }).length;

  return (
    <div className="min-h-screen bg-arco-secondary font-dm-sans">
      {/* Header */}
      <div className="bg-black px-4 py-8 border-b-4" style={{borderImage: 'linear-gradient(to right, #43c6ac, #f8ffae) 1'}}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-arco-secondary">
              Olá, {state.usuario?.nome}! 👋
            </h1>
          </div>
          <div className="w-14 h-14 flex items-center justify-center">
            <img src="/img/logo_arqueiria.jpg" alt="Logo Arqueiria Ibirapuera" className="w-14 h-14 object-cover rounded-full" />
          </div>
        </div>
      </div>

      <div className="px-4 py-8 space-y-8">
        {temTreinos ? (
          <>
            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-accent-gradient rounded-3xl p-4 text-center">
                <div className="w-10 h-10 bg-black rounded-2xl mx-auto mb-3 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="text-xl font-medium text-black">{pontuacaoMedia}</div>
                <div className="text-sm text-black/70 font-light">Média</div>
              </div>
              
              <div className="bg-accent-gradient rounded-3xl p-4 text-center">
                <div className="w-10 h-10 bg-black rounded-2xl mx-auto mb-3 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="text-xl font-medium text-black">{melhorPontuacao}</div>
                <div className="text-sm text-black/70 font-light">Melhor</div>
              </div>
              
              <div className="bg-accent-gradient rounded-3xl p-4 text-center">
                <div className="w-10 h-10 bg-black rounded-2xl mx-auto mb-3 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="text-xl font-medium text-black">{treinosEsteMes}</div>
                <div className="text-sm text-black/70 font-light">Este mês</div>
              </div>
            </div>

            {/* Gráfico simples dos últimos treinos */}
            <div className="bg-white rounded-3xl p-4 border border-arco-gray-300/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-arco-primary">Últimos Treinos</h3>
                <TrendingUp className="w-6 h-6 text-arco-gray-500" />
              </div>
              
              <div className="flex items-end justify-between h-28 space-x-3">
                {ultimosTreinos.map((treino, index) => {
                  const altura = (treino.pontuacaoTotal / melhorPontuacao) * 100;
                  return (
                    <div key={treino.id} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-accent-gradient rounded-t-xl"
                        style={{ height: `${altura}%` }}
                      ></div>
                      <div className="text-xs text-arco-gray-700 font-light mt-2">
                        {new Date(treino.data).getDate()}/{new Date(treino.data).getMonth() + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lista dos últimos treinos */}
            <div className="bg-white rounded-3xl p-4 border border-arco-gray-300/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-arco-primary">Treinos Recentes</h3>
                <button 
                  onClick={irParaHistorico}
                  className="text-black text-sm font-bold transition-colors"
                >
                  Ver todos
                </button>
              </div>
              
              <div className="space-y-4">
                {ultimosTreinos.map((treino) => (
                  <div key={treino.id} className="flex items-center justify-between p-4 bg-arco-gray-100 rounded-2xl hover:bg-arco-gray-300/30 transition-colors">
                    <div>
                      <div className="font-medium text-arco-primary">
                        {new Date(treino.data).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-sm text-arco-gray-700 font-light">
                        {treino.config.series} séries • {treino.config.distancia}m
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-medium text-arco-primary">{treino.pontuacaoTotal}</div>
                      <div className="text-xs text-arco-gray-700 font-light">pontos</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Estado sem treinos */
          <div className="bg-white rounded-3xl p-10 text-center border border-arco-gray-300/30">
            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <img src="/img/logo_arqueiria.jpg" alt="Logo Arqueiria Ibirapuera" className="w-24 h-24 object-cover rounded-full" />
            </div>
            <h3 className="text-2xl font-bold text-arco-primary mb-3">
              Bem-vindo ao ArcoTrack!
            </h3>
            <p className="text-arco-gray-700 text-base mb-8 font-light">
              Registre seu primeiro treino e comece a acompanhar sua evolução no tiro com arco.
            </p>
            <button
              onClick={irParaNovoTreino}
              className="bg-accent-gradient text-arco-primary font-bold py-4 px-8 rounded-2xl hover:opacity-90 transition-all duration-200 shadow-sm"
            >
              Registrar meu primeiro treino
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
