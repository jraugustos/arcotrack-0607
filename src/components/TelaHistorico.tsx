import React, { useState } from 'react';
import { useArcoTrack, Treino } from '../contexts/ArcoTrackContext';
import { Calendar, Target, Filter, ChevronDown, Award, TrendingUp, Eye, Trash2 } from 'lucide-react';

export function TelaHistorico() {
  const { state, navegarPara, deleteTreino } = useArcoTrack();
  const [filtroSelecionado, setFiltroSelecionado] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [treinoSelecionado, setTreinoSelecionado] = useState<Treino | null>(null);

  const { treinos } = state;

  // Aplicar filtros
  const treinosFiltrados = treinos.filter(treino => {
    const agora = new Date();
    const dataTreino = new Date(treino.data);
    
    switch (filtroSelecionado) {
      case 'semana':
        const semanaAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
        return dataTreino >= semanaAtras;
      case 'mes':
        return dataTreino.getMonth() === agora.getMonth() && 
               dataTreino.getFullYear() === agora.getFullYear();
      case 'trimestre':
        const mesesAtras = new Date(agora.getFullYear(), agora.getMonth() - 3, agora.getDate());
        return dataTreino >= mesesAtras;
      case 'alto_desempenho':
        const mediaGeral = treinos.reduce((acc, t) => acc + t.pontuacaoTotal, 0) / treinos.length;
        return treino.pontuacaoTotal >= mediaGeral;
      default:
        return true;
    }
  }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const filtros = [
    { key: 'todos', label: 'Todos os treinos' },
    { key: 'semana', label: 'Última semana' },
    { key: 'mes', label: 'Este mês' },
    { key: 'trimestre', label: 'Últimos 3 meses' },
    { key: 'alto_desempenho', label: 'Alto desempenho' },
  ];

  const verDetalhes = (treino: Treino) => {
    setTreinoSelecionado(treino);
  };

  const voltarParaLista = () => {
    setTreinoSelecionado(null);
  };

  const voltarParaHome = () => {
    navegarPara('home');
  };

  const handleDeleteFromList = async (treinoId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este treino? Essa ação não pode ser desfeita.')) return;
    try {
      await deleteTreino(treinoId);
    } catch (e) {
      alert('Erro ao excluir treino. Tente novamente.');
    }
  };

  // Renderizar detalhes do treino
  if (treinoSelecionado) {
    return <DetalheTreino treino={treinoSelecionado} onVoltar={voltarParaLista} />;
  }

  // Estatísticas gerais
  const estatisticas = treinos.length > 0 ? {
    totalTreinos: treinos.length,
    pontuacaoMedia: Math.round(treinos.reduce((acc, t) => acc + t.pontuacaoTotal, 0) / treinos.length),
    melhorPontuacao: Math.max(...treinos.map(t => t.pontuacaoTotal)),
    consistencia: Math.round(100 - (Math.sqrt(treinos.reduce((acc, t) => {
      const media = treinos.reduce((a, tr) => a + tr.pontuacaoTotal, 0) / treinos.length;
      return acc + Math.pow(t.pontuacaoTotal - media, 2);
    }, 0) / treinos.length) / (treinos.reduce((a, t) => a + t.pontuacaoTotal, 0) / treinos.length) * 100))
  } : null;

  return (
    <div className="min-h-screen bg-arco-light font-dm-sans">
      {/* Header */}
      <div className="bg-black px-4 py-8 border-b-4" style={{borderImage: 'linear-gradient(to right, #43c6ac, #f8ffae) 1'}}>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-arco-secondary">Histórico</h1>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center space-x-2 text-arco-gray hover:text-arco-navy transition-colors"
          >
            <Filter className="w-5 h-5" />
            <ChevronDown className={`w-4 h-4 transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {/* Filtros */}
        {mostrarFiltros && (
          <div className="mt-4 space-y-2">
            {filtros.map(filtro => (
              <button
                key={filtro.key}
                onClick={() => {
                  setFiltroSelecionado(filtro.key);
                  setMostrarFiltros(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-arco transition-colors ${
                  filtroSelecionado === filtro.key
                    ? 'bg-arco-yellow text-arco-navy font-medium'
                    : 'bg-arco-light text-arco-gray hover:bg-arco-yellow hover:text-arco-navy'
                }`}
              >
                {filtro.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Estatísticas gerais */}
        {estatisticas && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-arco-white rounded-arco p-4 text-center">
              <div className="w-8 h-8 bg-arco-yellow rounded-full mx-auto mb-2 flex items-center justify-center">
                <Target className="w-4 h-4 text-arco-navy" />
              </div>
              <div className="text-lg font-bold text-arco-navy">{estatisticas.pontuacaoMedia}</div>
              <div className="text-xs text-arco-gray">Pontuação média</div>
            </div>
            
            <div className="bg-arco-white rounded-arco p-4 text-center">
              <div className="w-8 h-8 bg-arco-orange rounded-full mx-auto mb-2 flex items-center justify-center">
                <Award className="w-4 h-4 text-arco-white" />
              </div>
              <div className="text-lg font-bold text-arco-navy">{estatisticas.melhorPontuacao}</div>
              <div className="text-xs text-arco-gray">Melhor pontuação</div>
            </div>
            
            <div className="bg-arco-white rounded-arco p-4 text-center">
              <div className="w-8 h-8 bg-arco-navy rounded-full mx-auto mb-2 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-arco-white" />
              </div>
              <div className="text-lg font-bold text-arco-navy">{estatisticas.totalTreinos}</div>
              <div className="text-xs text-arco-gray">Total de treinos</div>
            </div>
            
            <div className="bg-arco-white rounded-arco p-4 text-center">
              <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="text-lg font-bold text-arco-navy">{estatisticas.consistencia}%</div>
              <div className="text-xs text-arco-gray">Consistência</div>
            </div>
          </div>
        )}

        {/* Lista de treinos */}
        {treinosFiltrados.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-arco-navy">
                {filtros.find(f => f.key === filtroSelecionado)?.label}
              </h3>
              <span className="text-sm text-arco-gray">
                {treinosFiltrados.length} {treinosFiltrados.length === 1 ? 'treino' : 'treinos'}
              </span>
            </div>

            {treinosFiltrados.map((treino) => (
              <div
                key={treino.id}
                className="bg-arco-white rounded-arco p-6 cursor-pointer hover:bg-arco-light transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1" onClick={() => verDetalhes(treino)}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-arco-yellow rounded-full flex items-center justify-center">
                          <span className="font-bold text-arco-navy">
                            {new Date(treino.data).getDate()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-arco-navy">
                            {new Date(treino.data).toLocaleDateString('pt-BR', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="text-sm text-arco-gray">
                            {treino.config.series} séries • {treino.config.flechasPorSerie} flechas/série • {treino.config.distancia}m
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="w-5 h-5 text-arco-gray cursor-pointer" onClick={(e) => { e.stopPropagation(); verDetalhes(treino); }} />
                        <Trash2 className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700" onClick={(e) => { e.stopPropagation(); handleDeleteFromList(treino.id); }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="text-2xl font-bold text-arco-navy">{treino.pontuacaoTotal}</span>
                          <span className="text-sm text-arco-gray ml-1">pontos</span>
                        </div>
                        <div className="text-sm text-arco-gray">
                          Melhor série: <span className="font-medium text-arco-navy">{treino.melhorSerie}</span>
                        </div>
                      </div>
                      
                      {treino.config.temObjetivo && treino.config.objetivo && (
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          treino.pontuacaoTotal >= treino.config.objetivo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {treino.pontuacaoTotal >= treino.config.objetivo ? '✓ Meta' : 'Meta'}
                        </div>
                      )}
                    </div>

                    {treino.observacoes && (
                      <div className="mt-3 text-sm text-arco-gray italic">
                        "{treino.observacoes.substring(0, 100)}{treino.observacoes.length > 100 ? '...' : ''}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Estado vazio */
          <div className="bg-arco-white rounded-arco p-8 text-center">
            <div className="w-20 h-20 bg-arco-light rounded-full mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-arco-gray" />
            </div>
            <h3 className="text-xl font-bold text-arco-navy mb-2">
              Nenhum treino encontrado
            </h3>
            <p className="text-arco-gray mb-6">
              {filtroSelecionado === 'todos' 
                ? 'Você ainda não registrou nenhum treino.' 
                : 'Não há treinos para o filtro selecionado.'
              }
            </p>
            <button
              onClick={voltarParaHome}
              className="bg-arco-yellow text-arco-navy font-semibold py-3 px-6 rounded-arco hover:bg-arco-orange transition-colors"
            >
              {filtroSelecionado === 'todos' ? 'Registrar primeiro treino' : 'Ver todos os treinos'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de detalhes do treino
function DetalheTreino({ treino, onVoltar }: { treino: Treino; onVoltar: () => void }) {
  const { deleteTreino } = useArcoTrack();
  const [loading, setLoading] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  const pontuacaoMaxima = Math.max(...treino.series.map(s => s.pontuacao));
  const mediaAutoavaliacao = treino.autoavaliacao 
    ? Object.values(treino.autoavaliacao).reduce((acc, val) => acc + val, 0) / 10
    : null;

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este treino? Essa ação não pode ser desfeita.')) return;
    setLoading(true);
    setErro(null);
    try {
      await deleteTreino(treino.id);
      onVoltar();
    } catch (e) {
      setErro('Erro ao excluir treino. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-arco-light font-dm-sans">
      {/* Header */}
      <div className="bg-black px-4 py-8 border-b-4" style={{borderImage: 'linear-gradient(to right, #43c6ac, #f8ffae) 1'}}>
        <div className="flex items-center space-x-4 justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onVoltar}
              className="w-10 h-10 flex items-center justify-center text-white hover:text-arco-accent transition-colors"
            >
              ←
            </button>
            <div>
              <h1 className="text-lg font-bold text-arco-secondary">
                Detalhes do Treino
              </h1>
              <p className="text-arco-secondary">
                {new Date(treino.data).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            disabled={loading}
            title="Excluir treino"
            className="w-10 h-10 flex items-center justify-center text-red-500 hover:text-red-700 transition-colors disabled:opacity-60"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {erro && <div className="text-red-500 text-sm mb-2">{erro}</div>}

        {/* Resumo principal */}
        <div className="bg-arco-white rounded-arco p-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-arco-navy">{treino.pontuacaoTotal}</div>
              <div className="text-sm text-arco-gray">Pontuação total</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-arco-orange">{treino.melhorSerie}</div>
              <div className="text-sm text-arco-gray">Melhor série</div>
            </div>
          </div>
        </div>

        {/* Configuração do treino */}
        <div className="bg-arco-white rounded-arco p-6">
          <h3 className="font-semibold text-arco-navy mb-4">Configuração</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-arco-gray">Séries:</span>
              <span className="font-medium text-arco-navy ml-2">{treino.config.series}</span>
            </div>
            <div>
              <span className="text-arco-gray">Flechas/série:</span>
              <span className="font-medium text-arco-navy ml-2">{treino.config.flechasPorSerie}</span>
            </div>
            <div>
              <span className="text-arco-gray">Distância:</span>
              <span className="font-medium text-arco-navy ml-2">{treino.config.distancia}m</span>
            </div>
            {treino.config.temObjetivo && treino.config.objetivo && (
              <div>
                <span className="text-arco-gray">Objetivo:</span>
                <span className={`font-medium ml-2 ${
                  treino.pontuacaoTotal >= treino.config.objetivo ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {treino.config.objetivo} pts
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico das séries */}
        <div className="bg-arco-white rounded-arco p-6">
          <h3 className="font-semibold text-arco-navy mb-4">Pontuação por Série</h3>
          <div className="flex items-end justify-between h-32 space-x-2">
            {treino.series.map((serie, index) => {
              const altura = (serie.pontuacao / pontuacaoMaxima) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-full rounded-t transition-all ${
                      serie.pontuacao === pontuacaoMaxima ? 'bg-arco-yellow' : 'bg-arco-orange'
                    }`}
                    style={{ height: `${altura}%` }}
                  ></div>
                  <div className="text-xs text-arco-gray mt-2">S{index + 1}</div>
                  <div className="text-xs font-medium text-arco-navy">{serie.pontuacao}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detalhes das séries */}
        <div className="bg-arco-white rounded-arco p-6">
          <h3 className="font-semibold text-arco-navy mb-4">Detalhes das Séries</h3>
          <div className="space-y-3">
            {treino.series.map((serie, index) => (
              <div key={index} className="border-b border-arco-light pb-3 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-arco-navy">Série {index + 1}</span>
                  <span className="font-bold text-arco-navy">{serie.pontuacao} pts</span>
                </div>
                <div className="flex space-x-1">
                  {serie.flechas.map((flecha, fIndex) => {
                    const getCoresFlecha = (valor: number) => {
                      if (valor === 0) return { bg: '#6C757D', text: '#FFFFFF' };
                      if (valor <= 2) return { bg: '#D9D9D9', text: '#000000' };
                      if (valor <= 4) return { bg: '#434343', text: '#FFFFFF' };
                      if (valor <= 6) return { bg: '#4FA3D9', text: '#FFFFFF' };
                      if (valor <= 8) return { bg: '#F86B4F', text: '#FFFFFF' };
                      return { bg: '#FFD66B', text: '#000000' };
                    };
                    
                    const cores = getCoresFlecha(flecha.valor);
                    
                    return (
                      <div
                        key={fIndex}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-gray-900"
                        style={{
                          backgroundColor: cores.bg,
                          color: cores.text
                        }}
                      >
                        {flecha.valor}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Autoavaliação */}
        {treino.autoavaliacao && mediaAutoavaliacao && (
          <div className="bg-arco-white rounded-arco p-6">
            <h3 className="font-semibold text-arco-navy mb-4">Autoavaliação</h3>
            <div className="mb-4 text-center">
              <div className="text-2xl font-bold text-arco-navy">{mediaAutoavaliacao.toFixed(1)}</div>
              <div className="text-sm text-arco-gray">Média geral</div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {Object.entries(treino.autoavaliacao).map(([key, valor]) => {
                const nomes: Record<string, string> = {
                  postura: 'Postura',
                  ancoragem: 'Ancoragem',
                  alinhamento: 'Alinhamento',
                  respiracao: 'Respiração',
                  mira: 'Mira',
                  liberacao: 'Liberação',
                  followThrough: 'Follow-Through',
                  consistencia: 'Consistência',
                  ritmo: 'Ritmo',
                  foco: 'Foco',
                };
                return (
                  <div key={key} className="flex justify-between">
                    <span className="text-arco-gray">{nomes[key]}:</span>
                    <span className={`font-medium ${
                      valor >= 8 ? 'text-green-600' :
                      valor >= 6 ? 'text-arco-yellow' :
                      valor >= 4 ? 'text-orange-500' :
                      'text-red-500'
                    }`}>
                      {valor}/10
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Observações */}
        {treino.observacoes && (
          <div className="bg-arco-white rounded-arco p-6">
            <h3 className="font-semibold text-arco-navy mb-4">Observações</h3>
            <p className="text-arco-gray">{treino.observacoes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
