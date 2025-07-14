import React, { useState } from 'react';
import { useArcoTrack, Autoavaliacao } from '../contexts/ArcoTrackContext';
import { CheckCircle, RotateCcw, Save, MessageSquare, Loader2 } from 'lucide-react';

export function TelaAutoavaliacao() {
  const { state, finalizarTreino } = useArcoTrack();
  const [avaliacao, setAvaliacao] = useState<Autoavaliacao>({
    postura: 5,
    ancoragem: 5,
    alinhamento: 5,
    respiracao: 5,
    mira: 5,
    liberacao: 5,
    followThrough: 5,
    consistencia: 5,
    ritmo: 5,
    foco: 5,
  });
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);

  const etapas = [
    {
      key: 'postura' as keyof Autoavaliacao,
      nome: 'Postura',
      descricao: 'Posicionamento do corpo e estabilidade',
      icone: '🧍'
    },
    {
      key: 'ancoragem' as keyof Autoavaliacao,
      nome: 'Ancoragem',
      descricao: 'Ponto de ancoragem da corda no rosto',
      icone: '⚓'
    },
    {
      key: 'alinhamento' as keyof Autoavaliacao,
      nome: 'Alinhamento',
      descricao: 'Alinhamento do corpo e equipamento',
      icone: '📐'
    },
    {
      key: 'respiracao' as keyof Autoavaliacao,
      nome: 'Respiração',
      descricao: 'Controle da respiração durante o tiro',
      icone: '🫁'
    },
    {
      key: 'mira' as keyof Autoavaliacao,
      nome: 'Mira',
      descricao: 'Precisão e consistência da mira',
      icone: '🎯'
    },
    {
      key: 'liberacao' as keyof Autoavaliacao,
      nome: 'Liberação',
      descricao: 'Soltura da corda de forma suave',
      icone: '👐'
    },
    {
      key: 'followThrough' as keyof Autoavaliacao,
      nome: 'Follow-Through',
      descricao: 'Manutenção da posição após o tiro',
      icone: '⏳'
    },
    {
      key: 'consistencia' as keyof Autoavaliacao,
      nome: 'Consistência',
      descricao: 'Repetibilidade dos movimentos',
      icone: '🔄'
    },
    {
      key: 'ritmo' as keyof Autoavaliacao,
      nome: 'Ritmo',
      descricao: 'Tempo e cadência do processo de tiro',
      icone: '⏰'
    },
    {
      key: 'foco' as keyof Autoavaliacao,
      nome: 'Foco',
      descricao: 'Concentração e atenção mental',
      icone: '🧠'
    },
  ];

  const atualizarNota = (etapa: keyof Autoavaliacao, nota: number) => {
    setAvaliacao(prev => ({
      ...prev,
      [etapa]: nota,
    }));
  };

  const resetarAvaliacao = () => {
    setAvaliacao({
      postura: 5,
      ancoragem: 5,
      alinhamento: 5,
      respiracao: 5,
      mira: 5,
      liberacao: 5,
      followThrough: 5,
      consistencia: 5,
      ritmo: 5,
      foco: 5,
    });
  };

  const salvarEConcluir = async () => {
    try {
      setLoading(true);
      await finalizarTreino(observacoes, avaliacao);
    } catch (error) {
      console.error('Error finishing training:', error);
      // Handle error here if needed
    } finally {
      setLoading(false);
    }
  };

  // Calcular progresso e estatísticas
  const etapasAvaliadas = etapas.filter(etapa => avaliacao[etapa.key] !== 5).length;
  const progressoPercent = Math.round((etapasAvaliadas / etapas.length) * 100);
  const mediaGeral = Math.round(Object.values(avaliacao).reduce((acc, val) => acc + val, 0) / etapas.length * 10) / 10;
  
  const pontosFortesEFracos = () => {
    const valores = Object.entries(avaliacao);
    const melhores = valores.filter(([_, nota]) => nota >= 8).map(([key, _]) => 
      etapas.find(e => e.key === key)?.nome
    ).filter(Boolean);
    
    const melhorar = valores.filter(([_, nota]) => nota <= 4).map(([key, _]) => 
      etapas.find(e => e.key === key)?.nome
    ).filter(Boolean);
    
    return { melhores, melhorar };
  };

  const { melhores, melhorar } = pontosFortesEFracos();

  return (
    <div className="min-h-screen bg-arco-light font-dm-sans">
      {/* Header */}
      <div className="bg-black px-4 py-8 border-b-4" style={{borderImage: 'linear-gradient(to right, #43c6ac, #f8ffae) 1'}}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-arco-secondary">Autoavaliação</h1>
            <p className="text-arco-secondary">Avalie seu processo de tiro (0-10)</p>
          </div>
          <button
            onClick={resetarAvaliacao}
            className="w-10 h-10 flex items-center justify-center text-arco-gray hover:text-arco-navy transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Progresso */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-arco-gray">Progresso da avaliação</span>
            <span className="text-sm font-medium text-arco-navy">
              {etapasAvaliadas}/10 modificadas
            </span>
          </div>
          <div className="w-full bg-arco-light rounded-full h-2">
            <div 
              className="bg-arco-yellow h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressoPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 pb-32 space-y-6">
        {/* Resumo da avaliação */}
        <div className="bg-arco-white rounded-arco p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-arco-navy">{mediaGeral}</div>
              <div className="text-sm text-arco-gray">Média geral</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{melhores.length}</div>
              <div className="text-sm text-arco-gray">Pontos fortes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{melhorar.length}</div>
              <div className="text-sm text-arco-gray">A melhorar</div>
            </div>
          </div>
        </div>

        {/* Lista de etapas para avaliação */}
        <div className="space-y-4">
          {etapas.map((etapa) => {
            const nota = avaliacao[etapa.key];
            return (
              <div key={etapa.key} className="bg-arco-white rounded-arco p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{etapa.icone}</span>
                    <div>
                      <h3 className="font-semibold text-arco-navy">{etapa.nome}</h3>
                      <p className="text-sm text-arco-gray">{etapa.descricao}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      nota >= 8 ? 'text-green-600' :
                      nota >= 6 ? 'text-arco-yellow' :
                      nota >= 4 ? 'text-orange-500' :
                      'text-red-500'
                    }`}>
                      {nota}
                    </div>
                    <div className="text-xs text-arco-gray">
                      {nota >= 8 ? 'Excelente' :
                       nota >= 6 ? 'Bom' :
                       nota >= 4 ? 'Regular' :
                       'Precisa melhorar'}
                    </div>
                  </div>
                </div>

                {/* Slider de avaliação */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-arco-gray">
                    <span>0 - Muito ruim</span>
                    <span>5 - Neutro</span>
                    <span>10 - Excelente</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={nota}
                    onChange={(e) => atualizarNota(etapa.key, parseInt(e.target.value))}
                    className="w-full h-2 bg-arco-light rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, 
                        #EF4444 0%, #F59E0B 40%, #FFD66B 60%, #10B981 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-arco-gray">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <button
                        key={num}
                        onClick={() => atualizarNota(etapa.key, num)}
                        className={`w-6 h-6 rounded-full text-xs flex items-center justify-center transition-colors ${
                          nota === num 
                            ? 'bg-arco-yellow text-arco-navy font-bold' 
                            : 'text-arco-gray hover:bg-arco-light'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Análise automática */}
        {(melhores.length > 0 || melhorar.length > 0) && (
          <div className="bg-arco-white rounded-arco p-6">
            <h3 className="font-semibold text-arco-navy mb-4">Análise do Seu Processo</h3>
            
            {melhores.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-green-600 mb-2">✓ Pontos Fortes:</h4>
                <p className="text-sm text-arco-gray">
                  Você demonstrou excelência em: {melhores.join(', ')}. 
                  Continue mantendo estes aspectos em seus próximos treinos!
                </p>
              </div>
            )}
            
            {melhorar.length > 0 && (
              <div>
                <h4 className="font-medium text-orange-600 mb-2">⚠ Áreas para Melhoria:</h4>
                <p className="text-sm text-arco-gray">
                  Concentre-se em aprimorar: {melhorar.join(', ')}. 
                  Considere exercícios específicos para essas áreas.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Observações */}
        <div className="bg-arco-white rounded-arco p-6">
          <h3 className="font-semibold text-arco-navy mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Como você se sentiu?
          </h3>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Descreva como foi seu treino, dificuldades enfrentadas, sensações, pontos que notou durante a prática..."
            className="w-full p-4 border border-arco-light rounded-arco resize-none focus:outline-none focus:border-arco-yellow transition-colors"
            rows={4}
          />
        </div>
      </div>

      {/* Botão de salvar fixo no bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-arco-gray-200 p-4">
        <button
          onClick={salvarEConcluir}
          disabled={loading}
          className="w-full bg-accent-gradient text-black font-bold py-4 rounded-2xl hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>Salvar e Concluir</span>
        </button>
      </div>
    </div>
  );
}
