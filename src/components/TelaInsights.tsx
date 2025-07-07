import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  Award, 
  AlertCircle, 
  CheckCircle, 
  BarChart3,
  Brain,
  Lightbulb,
  Activity,
  ChevronRight,
  Eye,
  Zap
} from 'lucide-react';
import { useArcoTrack } from '../contexts/ArcoTrackContext';
import { 
  gerarInsights, 
  gerarInsightsAvancados, 
  CATEGORIAS_AUTOAVALIACAO, 
  AnaliseInsights 
} from '../lib/analiseInsights';

interface TelaInsightsProps {
  onVoltar: () => void;
}

export default function TelaInsights({ onVoltar }: TelaInsightsProps) {
  const { state } = useArcoTrack();
  const { treinos } = state;
  const [insights, setInsights] = useState<AnaliseInsights | null>(null);
  const [insightsAvancados, setInsightsAvancados] = useState<{
    analiseProcessoTiro: string[];
    pontosChaveMelhoria: string[];
    padroesTecnicos: string[];
  } | null>(null);
  const [abaSelecionada, setAbaSelecionada] = useState<'geral' | 'tecnico' | 'evolucao'>('geral');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const gerarAnalises = async () => {
      setLoading(true);
      try {
        const insightsGerados = gerarInsights(treinos || []);
        const insightsAvancadosGerados = gerarInsightsAvancados(treinos || []);
        
        setInsights(insightsGerados);
        setInsightsAvancados(insightsAvancadosGerados);
      } catch (error) {
        console.error('Erro ao gerar insights:', error);
      } finally {
        setLoading(false);
      }
    };

    gerarAnalises();
  }, [treinos]);

  const getTendenciaIcon = (tendencia: 'melhoria' | 'estavel' | 'declinio') => {
    switch (tendencia) {
      case 'melhoria':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declinio':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getCorrelacaoColor = (correlacao: number) => {
    if (Math.abs(correlacao) > 0.6) return 'text-green-600';
    if (Math.abs(correlacao) > 0.3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const renderGraficoRadar = () => {
    if (!insights?.mediasPorCategoria) return null;

    const categorias = Object.entries(insights.mediasPorCategoria)
      .slice(0, 6) // Mostrar apenas 6 categorias principais
      .map(([key, value]) => ({
        nome: CATEGORIAS_AUTOAVALIACAO[key as keyof typeof CATEGORIAS_AUTOAVALIACAO]?.nome || key,
        valor: value,
        icone: CATEGORIAS_AUTOAVALIACAO[key as keyof typeof CATEGORIAS_AUTOAVALIACAO]?.icone || '📊'
      }));

    return (
      <div className="grid grid-cols-2 gap-3">
        {categorias.map((categoria, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 border border-arco-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{categoria.icone}</span>
              <span className="text-sm font-medium text-arco-gray-700">{categoria.nome}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-arco-gray-100 rounded-full h-2">
                <div 
                  className="bg-accent-gradient h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(categoria.valor / 10) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-arco-primary">
                {categoria.valor.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-arco-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arco-primary mx-auto mb-4"></div>
          <p className="text-arco-gray-600">Analisando seus treinos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-arco-secondary">
      {/* Header */}
      <div className="bg-black border-b-4 px-6 py-4" style={{borderImage: 'linear-gradient(to right, #43c6ac, #f8ffae) 1'}}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onVoltar}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Insights</h1>
              <p className="text-sm text-white/70">
                Análise do seu processo de tiro • {(treinos || []).filter(t => t.autoavaliacao && t.concluido).length} treinos analisados
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-arco-gray-200 px-6">
        <div className="flex justify-center space-x-6">
          {[
            { id: 'geral', label: 'Geral', icon: BarChart3 },
            { id: 'tecnico', label: 'Análise', icon: Target },
            { id: 'evolucao', label: 'Evolução', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setAbaSelecionada(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                abaSelecionada === tab.id
                  ? 'border-arco-accent text-arco-accent'
                  : 'border-transparent text-arco-gray-600 hover:text-arco-primary'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Visão Geral */}
        {abaSelecionada === 'geral' && (
          <>
            {/* Resumo Rápido */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-accent-gradient rounded-3xl p-6 text-center">
                <div className="w-12 h-12 bg-black rounded-2xl mx-auto mb-3 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-black mb-1">
                  {insights?.pontosFortesConsistentes.length || 0}
                </div>
                <div className="text-sm text-black/70 font-medium">Pontos Fortes</div>
              </div>
              
              <div className="bg-accent-gradient rounded-3xl p-6 text-center">
                <div className="w-12 h-12 bg-black rounded-2xl mx-auto mb-3 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-black mb-1">
                  {insights?.areasParaMelhoria.length || 0}
                </div>
                <div className="text-sm text-black/70 font-medium">Áreas p/ Melhoria</div>
              </div>
            </div>

            {/* Mapa de Habilidades */}
            <div className="bg-white rounded-3xl p-6 border border-arco-gray-300/30">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-accent-gradient rounded-2xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-arco-primary">Mapa de Habilidades</h3>
                  <p className="text-sm text-arco-gray-600">Avaliação das suas competências técnicas</p>
                </div>
              </div>
              
              {renderGraficoRadar()}
            </div>

            {/* Pontos Fortes */}
            {insights?.pontosFortesConsistentes && insights.pontosFortesConsistentes.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-arco-gray-300/30">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-arco-primary">Pontos Fortes Consistentes</h3>
                    <p className="text-sm text-arco-gray-600">Áreas onde você demonstra excelência</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {insights.pontosFortesConsistentes.map((ponto, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">{ponto}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Áreas para Melhoria */}
            {insights?.areasParaMelhoria && insights.areasParaMelhoria.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-arco-gray-300/30">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-arco-primary">Áreas para Melhoria</h3>
                    <p className="text-sm text-arco-gray-600">Focos de desenvolvimento identificados</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {insights.areasParaMelhoria.map((area, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recomendações */}
            {insights?.recomendacoes && insights.recomendacoes.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-arco-gray-300/30">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-arco-primary">Recomendações Personalizadas</h3>
                    <p className="text-sm text-arco-gray-600">Sugestões baseadas na sua performance</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {insights.recomendacoes.map((recomendacao, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <span className="text-sm text-blue-800 leading-relaxed">{recomendacao}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Análise Técnica */}
        {abaSelecionada === 'tecnico' && (
          <>
            {/* Correlações com Pontuação */}
            {insights?.correlacoesPontuacao && insights.correlacoesPontuacao.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-arco-gray-300/30">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-arco-primary">Impacto na Pontuação</h3>
                    <p className="text-sm text-arco-gray-600">Correlação entre técnica e resultado</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {insights.correlacoesPontuacao.slice(0, 5).map((correlacao, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-arco-gray-700">{correlacao.categoria}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          correlacao.impacto === 'alto' ? 'bg-red-100 text-red-700' :
                          correlacao.impacto === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {correlacao.impacto}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold ${getCorrelacaoColor(correlacao.correlacao)}`}>
                          {correlacao.correlacao > 0 ? '+' : ''}{(correlacao.correlacao * 100).toFixed(0)}%
                        </span>
                        <ChevronRight className="w-4 h-4 text-arco-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights Avançados */}
            {insightsAvancados && (
              <>
                {/* Análise do Processo de Tiro */}
                {insightsAvancados.analiseProcessoTiro.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 border border-arco-gray-300/30">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                        <Eye className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-arco-primary">Análise do Processo de Tiro</h3>
                        <p className="text-sm text-arco-gray-600">Identificação de padrões técnicos</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {insightsAvancados.analiseProcessoTiro.map((analise, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-xl">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          <span className="text-sm text-red-800 leading-relaxed">{analise}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pontos Chave para Melhoria */}
                {insightsAvancados.pontosChaveMelhoria.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 border border-arco-gray-300/30">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-yellow-100 rounded-2xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-arco-primary">Pontos Chave para Melhoria</h3>
                        <p className="text-sm text-arco-gray-600">Ações específicas para evolução</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {insightsAvancados.pontosChaveMelhoria.map((ponto, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-xl">
                          <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-xs font-bold text-yellow-600">{index + 1}</span>
                          </div>
                          <span className="text-sm text-yellow-800 leading-relaxed">{ponto}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Padrões Técnicos */}
                {insightsAvancados.padroesTecnicos.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 border border-arco-gray-300/30">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-arco-primary">Padrões Técnicos Identificados</h3>
                        <p className="text-sm text-arco-gray-600">Observações sobre sua técnica</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {insightsAvancados.padroesTecnicos.map((padrao, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-xl">
                          <BarChart3 className="w-5 h-5 text-indigo-600 mt-0.5" />
                          <span className="text-sm text-indigo-800 leading-relaxed">{padrao}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Evolução */}
        {abaSelecionada === 'evolucao' && (
          <>
            {/* Tendências Temporais */}
            {insights?.tendenciasTemporais && insights.tendenciasTemporais.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-arco-gray-300/30">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-arco-primary">Tendências de Evolução</h3>
                    <p className="text-sm text-arco-gray-600">Progresso ao longo do tempo</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {insights.tendenciasTemporais.map((tendencia, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        {getTendenciaIcon(tendencia.tendencia)}
                        <span className="text-sm font-medium text-arco-gray-700">{tendencia.categoria}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold ${
                          tendencia.tendencia === 'melhoria' ? 'text-green-600' :
                          tendencia.tendencia === 'declinio' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {tendencia.variacao > 0 ? '+' : ''}{tendencia.variacao.toFixed(1)}
                        </span>
                        <span className="text-xs text-arco-gray-500">
                          {tendencia.tendencia === 'melhoria' ? 'Melhorando' :
                           tendencia.tendencia === 'declinio' ? 'Declínio' : 'Estável'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evolução Temporal Detalhada */}
            {insights?.evolucaoTemporal && insights.evolucaoTemporal.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-arco-gray-300/30">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-arco-primary">Histórico de Performance</h3>
                    <p className="text-sm text-arco-gray-600">Últimos {insights.evolucaoTemporal.length} treinos</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {insights.evolucaoTemporal.reverse().slice(0, 5).map((treino, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-arco-gray-700">
                          {new Date(treino.data).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-xs text-arco-gray-500">
                          {Object.keys(treino.valores).length} categorias avaliadas
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(treino.valores).slice(0, 4).map(([categoria, valor]) => (
                          <div key={categoria} className="flex items-center justify-between text-xs">
                            <span className="text-arco-gray-600">
                              {CATEGORIAS_AUTOAVALIACAO[categoria as keyof typeof CATEGORIAS_AUTOAVALIACAO]?.nome || categoria}
                            </span>
                            <span className="font-medium text-arco-primary">{valor}/10</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Estado vazio */}
        {(!insights || (insights.recomendacoes.length === 1 && insights.recomendacoes[0].includes('mais treinos'))) && (
          <div className="bg-white rounded-3xl p-8 border border-arco-gray-300/30 text-center">
            <div className="w-16 h-16 bg-arco-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Brain className="w-8 h-8 text-arco-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-arco-primary mb-2">Dados Insuficientes</h3>
            <p className="text-sm text-arco-gray-600 mb-6">
              Realize mais treinos com autoavaliação para gerar insights personalizados e análises detalhadas.
            </p>
            <button
              onClick={onVoltar}
              className="bg-accent-gradient text-black font-medium py-3 px-6 rounded-xl hover:opacity-90 transition-opacity"
            >
              Voltar ao Histórico
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 