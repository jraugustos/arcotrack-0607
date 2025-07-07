import { Treino, Autoavaliacao } from '../contexts/ArcoTrackContext';

export interface InsightData {
  categoria: string;
  valor: number;
  tendencia: 'melhoria' | 'estavel' | 'declinio';
  impacto: 'alto' | 'medio' | 'baixo';
}

export interface AnaliseInsights {
  pontosFortesConsistentes: string[];
  areasParaMelhoria: string[];
  tendenciasTemporais: {
    categoria: string;
    tendencia: 'melhoria' | 'estavel' | 'declinio';
    variacao: number;
  }[];
  correlacoesPontuacao: {
    categoria: string;
    correlacao: number;
    impacto: string;
  }[];
  recomendacoes: string[];
  mediasPorCategoria: Record<string, number>;
  evolucaoTemporal: {
    data: string;
    valores: Record<string, number>;
  }[];
}

// Mapeamento das categorias de autoavaliação
export const CATEGORIAS_AUTOAVALIACAO = {
  postura: { nome: 'Postura', icone: '🧍', descricao: 'Estabilidade e posicionamento corporal' },
  ancoragem: { nome: 'Ancoragem', icone: '⚓', descricao: 'Consistência do ponto de ancoragem' },
  alinhamento: { nome: 'Alinhamento', icone: '📐', descricao: 'Alinhamento corporal e do equipamento' },
  respiracao: { nome: 'Respiração', icone: '🫁', descricao: 'Controle respiratório durante o tiro' },
  mira: { nome: 'Mira', icone: '🎯', descricao: 'Precisão e estabilidade da mira' },
  liberacao: { nome: 'Liberação', icone: '👐', descricao: 'Qualidade da soltura da corda' },
  followThrough: { nome: 'Follow-Through', icone: '⏳', descricao: 'Manutenção da posição pós-tiro' },
  consistencia: { nome: 'Consistência', icone: '🔄', descricao: 'Repetibilidade dos movimentos' },
  ritmo: { nome: 'Ritmo', icone: '⏰', descricao: 'Cadência e timing do processo' },
  foco: { nome: 'Foco', icone: '🧠', descricao: 'Concentração e controle mental' },
};

// Função principal para gerar insights
export function gerarInsights(treinos: Treino[]): AnaliseInsights {
  // Filtrar apenas treinos com autoavaliação
  const treinosComAutoavaliacao = treinos.filter(t => t.autoavaliacao && t.concluido);
  
  if (treinosComAutoavaliacao.length < 2) {
    return {
      pontosFortesConsistentes: [],
      areasParaMelhoria: [],
      tendenciasTemporais: [],
      correlacoesPontuacao: [],
      recomendacoes: ['Realize mais treinos com autoavaliação para gerar insights personalizados'],
      mediasPorCategoria: {},
      evolucaoTemporal: [],
    };
  }

  // Calcular médias por categoria
  const mediasPorCategoria = calcularMediasPorCategoria(treinosComAutoavaliacao);
  
  // Identificar pontos fortes e fracos
  const pontosFortesConsistentes = identificarPontosFortes(treinosComAutoavaliacao);
  const areasParaMelhoria = identificarAreasParaMelhoria(treinosComAutoavaliacao);
  
  // Analisar tendências temporais
  const tendenciasTemporais = analisarTendenciasTemporais(treinosComAutoavaliacao);
  
  // Calcular correlações com pontuação
  const correlacoesPontuacao = calcularCorrelacoesPontuacao(treinosComAutoavaliacao);
  
  // Gerar recomendações personalizadas
  const recomendacoes = gerarRecomendacoes(mediasPorCategoria, tendenciasTemporais, correlacoesPontuacao);
  
  // Preparar dados de evolução temporal
  const evolucaoTemporal = prepararEvolucaoTemporal(treinosComAutoavaliacao);

  return {
    pontosFortesConsistentes,
    areasParaMelhoria,
    tendenciasTemporais,
    correlacoesPontuacao,
    recomendacoes,
    mediasPorCategoria,
    evolucaoTemporal,
  };
}

function calcularMediasPorCategoria(treinos: Treino[]): Record<string, number> {
  const medias: Record<string, number> = {};
  
  Object.keys(CATEGORIAS_AUTOAVALIACAO).forEach(categoria => {
    const valores = treinos
      .map(t => t.autoavaliacao?.[categoria as keyof Autoavaliacao])
      .filter(v => v !== undefined) as number[];
    
    if (valores.length > 0) {
      medias[categoria] = valores.reduce((sum, val) => sum + val, 0) / valores.length;
    }
  });
  
  return medias;
}

function identificarPontosFortes(treinos: Treino[]): string[] {
  const medias = calcularMediasPorCategoria(treinos);
  
  return Object.entries(medias)
    .filter(([_, media]) => media >= 7.5)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3)
    .map(([categoria, _]) => CATEGORIAS_AUTOAVALIACAO[categoria as keyof typeof CATEGORIAS_AUTOAVALIACAO].nome);
}

function identificarAreasParaMelhoria(treinos: Treino[]): string[] {
  const medias = calcularMediasPorCategoria(treinos);
  
  return Object.entries(medias)
    .filter(([_, media]) => media <= 6.0)
    .sort(([_, a], [__, b]) => a - b)
    .slice(0, 3)
    .map(([categoria, _]) => CATEGORIAS_AUTOAVALIACAO[categoria as keyof typeof CATEGORIAS_AUTOAVALIACAO].nome);
}

function analisarTendenciasTemporais(treinos: Treino[]): AnaliseInsights['tendenciasTemporais'] {
  if (treinos.length < 3) return [];
  
  const tendencias: AnaliseInsights['tendenciasTemporais'] = [];
  
  Object.keys(CATEGORIAS_AUTOAVALIACAO).forEach(categoria => {
    const valores = treinos.map(t => ({
      data: new Date(t.data),
      valor: t.autoavaliacao?.[categoria as keyof Autoavaliacao] || 5
    })).sort((a, b) => a.data.getTime() - b.data.getTime());
    
    if (valores.length >= 3) {
      // Calcular tendência usando regressão linear simples
      const n = valores.length;
      const x = valores.map((_, i) => i);
      const y = valores.map(v => v.valor);
      
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      
      let tendencia: 'melhoria' | 'estavel' | 'declinio' = 'estavel';
      if (slope > 0.1) tendencia = 'melhoria';
      else if (slope < -0.1) tendencia = 'declinio';
      
      tendencias.push({
        categoria: CATEGORIAS_AUTOAVALIACAO[categoria as keyof typeof CATEGORIAS_AUTOAVALIACAO].nome,
        tendencia,
        variacao: Math.round(slope * 100) / 100
      });
    }
  });
  
  return tendencias;
}

function calcularCorrelacoesPontuacao(treinos: Treino[]): AnaliseInsights['correlacoesPontuacao'] {
  const correlacoes: AnaliseInsights['correlacoesPontuacao'] = [];
  
  Object.keys(CATEGORIAS_AUTOAVALIACAO).forEach(categoria => {
    const dados = treinos.map(t => ({
      autoavaliacao: t.autoavaliacao?.[categoria as keyof Autoavaliacao] || 5,
      pontuacao: t.pontuacaoTotal / (t.config.series * t.config.flechasPorSerie * 10) // Normalizar por pontuação máxima
    }));
    
    if (dados.length >= 3) {
      const correlacao = calcularCorrelacao(
        dados.map(d => d.autoavaliacao),
        dados.map(d => d.pontuacao)
      );
      
      let impacto = 'baixo';
      if (Math.abs(correlacao) > 0.6) impacto = 'alto';
      else if (Math.abs(correlacao) > 0.3) impacto = 'medio';
      
      correlacoes.push({
        categoria: CATEGORIAS_AUTOAVALIACAO[categoria as keyof typeof CATEGORIAS_AUTOAVALIACAO].nome,
        correlacao: Math.round(correlacao * 100) / 100,
        impacto
      });
    }
  });
  
  return correlacoes.sort((a, b) => Math.abs(b.correlacao) - Math.abs(a.correlacao));
}

function calcularCorrelacao(x: number[], y: number[]): number {
  const n = x.length;
  if (n !== y.length || n < 2) return 0;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

function gerarRecomendacoes(
  medias: Record<string, number>,
  tendencias: AnaliseInsights['tendenciasTemporais'],
  correlacoes: AnaliseInsights['correlacoesPontuacao']
): string[] {
  const recomendacoes: string[] = [];
  
  // Recomendações baseadas em correlações altas
  const correlacaoAlta = correlacoes.find(c => c.impacto === 'alto' && c.correlacao > 0.5);
  if (correlacaoAlta) {
    recomendacoes.push(`${correlacaoAlta.categoria} tem forte impacto na sua pontuação. Foque nesta área para melhorar rapidamente.`);
  }
  
  // Recomendações baseadas em tendências negativas
  const tendenciaNegativa = tendencias.find(t => t.tendencia === 'declinio');
  if (tendenciaNegativa) {
    recomendacoes.push(`${tendenciaNegativa.categoria} está em declínio. Revise sua técnica nesta área.`);
  }
  
  // Recomendações baseadas em pontos fracos
  const pontoMaisFraco = Object.entries(medias)
    .sort(([_, a], [__, b]) => a - b)[0];
  
  if (pontoMaisFraco && pontoMaisFraco[1] < 6) {
    const categoria = CATEGORIAS_AUTOAVALIACAO[pontoMaisFraco[0] as keyof typeof CATEGORIAS_AUTOAVALIACAO];
    recomendacoes.push(`Trabalhe especificamente em ${categoria.nome}: ${categoria.descricao.toLowerCase()}.`);
  }
  
  // Recomendações específicas por categoria
  Object.entries(medias).forEach(([categoria, media]) => {
    if (media < 5) {
      switch (categoria) {
        case 'postura':
          recomendacoes.push('Pratique exercícios de equilíbrio e fortalecimento do core para melhorar a postura.');
          break;
        case 'respiracao':
          recomendacoes.push('Incorpore técnicas de respiração controlada em seus treinos.');
          break;
        case 'mira':
          recomendacoes.push('Dedique mais tempo ao alinhamento da mira antes de cada tiro.');
          break;
        case 'liberacao':
          recomendacoes.push('Pratique a liberação com exercícios de corda seca (sem flecha).');
          break;
        case 'foco':
          recomendacoes.push('Implemente rotinas de concentração e mindfulness antes dos treinos.');
          break;
      }
    }
  });
  
  // Recomendações gerais se não houver específicas
  if (recomendacoes.length === 0) {
    recomendacoes.push('Continue mantendo a consistência em seus treinos.');
    recomendacoes.push('Considere variar as distâncias de tiro para desafiar diferentes habilidades.');
  }
  
  return recomendacoes.slice(0, 5); // Limitar a 5 recomendações
}

function prepararEvolucaoTemporal(treinos: Treino[]): AnaliseInsights['evolucaoTemporal'] {
  return treinos
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(-10) // Últimos 10 treinos
    .map(treino => ({
      data: treino.data,
      valores: treino.autoavaliacao ? {
        postura: treino.autoavaliacao.postura,
        ancoragem: treino.autoavaliacao.ancoragem,
        alinhamento: treino.autoavaliacao.alinhamento,
        respiracao: treino.autoavaliacao.respiracao,
        mira: treino.autoavaliacao.mira,
        liberacao: treino.autoavaliacao.liberacao,
        followThrough: treino.autoavaliacao.followThrough,
        consistencia: treino.autoavaliacao.consistencia,
        ritmo: treino.autoavaliacao.ritmo,
        foco: treino.autoavaliacao.foco,
      } : {}
    }));
}

// Função para gerar insights específicos baseados no vídeo de referência
export function gerarInsightsAvancados(treinos: Treino[]): {
  analiseProcessoTiro: string[];
  pontosChaveMelhoria: string[];
  padroesTecnicos: string[];
} {
  const treinosComAutoavaliacao = treinos.filter(t => t.autoavaliacao && t.concluido);
  
  if (treinosComAutoavaliacao.length < 3) {
    return {
      analiseProcessoTiro: ['Dados insuficientes para análise avançada'],
      pontosChaveMelhoria: ['Realize mais treinos com autoavaliação'],
      padroesTecnicos: ['Aguarde mais dados para identificar padrões'],
    };
  }
  
  const medias = calcularMediasPorCategoria(treinosComAutoavaliacao);
  
  const analiseProcessoTiro: string[] = [];
  const pontosChaveMelhoria: string[] = [];
  const padroesTecnicos: string[] = [];
  
  // Análise baseada no processo de tiro
  if (medias.postura < 6) {
    analiseProcessoTiro.push('Base instável: postura comprometendo todo o processo de tiro');
    pontosChaveMelhoria.push('Trabalhar fortalecimento do core e posicionamento dos pés');
  }
  
  if (medias.ancoragem < 6) {
    analiseProcessoTiro.push('Inconsistência na ancoragem afetando precisão');
    pontosChaveMelhoria.push('Estabelecer ponto de ancoragem fixo e reproduzível');
  }
  
  if (medias.respiracao < 6) {
    analiseProcessoTiro.push('Controle respiratório inadequado durante o ciclo de tiro');
    pontosChaveMelhoria.push('Implementar técnica de respiração: inspirar-expirar-pausar-atirar');
  }
  
  // Padrões técnicos baseados em correlações
  const correlacoes = calcularCorrelacoesPontuacao(treinosComAutoavaliacao);
  const correlacaoMira = correlacoes.find(c => c.categoria === 'Mira');
  const correlacaoLiberacao = correlacoes.find(c => c.categoria === 'Liberação');
  
  if (correlacaoMira && correlacaoMira.correlacao > 0.5) {
    padroesTecnicos.push('Qualidade da mira tem impacto direto na pontuação');
  }
  
  if (correlacaoLiberacao && correlacaoLiberacao.correlacao > 0.5) {
    padroesTecnicos.push('Liberação consistente é chave para agrupamentos precisos');
  }
  
  // Análise de sequência técnica
  if (medias.alinhamento > 7 && medias.liberacao < 6) {
    padroesTecnicos.push('Bom alinhamento comprometido por liberação inconsistente');
  }
  
  if (medias.foco < 6) {
    analiseProcessoTiro.push('Concentração mental insuficiente durante o processo');
    pontosChaveMelhoria.push('Desenvolver rotina mental pré-tiro para manter foco');
  }
  
  return {
    analiseProcessoTiro,
    pontosChaveMelhoria,
    padroesTecnicos,
  };
} 