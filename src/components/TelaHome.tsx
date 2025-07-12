import React from 'react';
import { useArcoTrack } from '../contexts/ArcoTrackContext';
import { Plus, Target, Calendar, TrendingUp, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export function TelaHome() {
  const { state, navegarPara } = useArcoTrack();

  const irParaNovoTreino = () => {
    navegarPara('registro');
  };

  const irParaHistorico = () => {
    navegarPara('historico');
  };

  const temTreinos = state.treinos.length > 0;
  const ultimosTreinos = state.treinos.slice(-5).reverse(); // Mostrar últimos 5 treinos

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

  // Preparar dados para o gráfico
  const dadosGrafico = ultimosTreinos.map((treino, index) => ({
    data: new Date(treino.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    pontuacao: treino.pontuacaoTotal,
    series: treino.config.series,
    distancia: treino.config.distancia,
    dataCompleta: new Date(treino.data).toLocaleDateString('pt-BR')
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-arco-primary">{data.dataCompleta}</p>
          <p className="text-sm text-arco-gray-700">
            Pontuação: <span className="font-medium">{data.pontuacao}</span>
          </p>
          <p className="text-xs text-arco-gray-600">
            {data.series} séries • {data.distancia}m
          </p>
        </div>
      );
    }
    return null;
  };

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

            {/* Gráfico dos últimos treinos */}
            <div className="bg-white rounded-3xl p-6 border border-arco-gray-300/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-arco-primary">Evolução dos Últimos Treinos</h3>
                <TrendingUp className="w-6 h-6 text-arco-gray-500" />
              </div>
              
              {dadosGrafico.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosGrafico} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                      <XAxis 
                        dataKey="data" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="pontuacao" 
                        radius={[8, 8, 0, 0]}
                        fill="url(#gradientBar)"
                      />
                      <defs>
                        <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#43c6ac" />
                          <stop offset="100%" stopColor="#f8ffae" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-arco-gray-500">
                  <p>Dados insuficientes para o gráfico</p>
                </div>
              )}
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
                {state.treinos.slice(-3).reverse().map((treino) => (
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
