import { Flecha, Serie, Treino } from '../contexts/ArcoTrackContext';

export interface AnaliseSerieResult {
  tendenciaHorizontal: 'esquerda' | 'direita' | 'centrado';
  tendenciaVertical: 'acima' | 'abaixo' | 'centrado';
  agrupamento: 'excelente' | 'bom' | 'regular' | 'disperso';
  consistencia: number; // 0-100
  insights: string[];
  recomendacoes: string[];
}

export interface AnaliseTreinoResult {
  tendenciaGeral: AnaliseSerieResult;
  melhorSerie: number;
  serieComMaiorConsistencia: number;
  progressao: 'melhorando' | 'estável' | 'declinando';
  insights: string[];
  recomendacoes: string[];
}

// Função para calcular centro de massa das flechas
function calcularCentroMassa(flechas: Flecha[]): { x: number; y: number } {
  const flechasComCoordenadas = flechas.filter(f => f.x !== undefined && f.y !== undefined);
  
  if (flechasComCoordenadas.length === 0) {
    return { x: 140, y: 140 }; // Centro do alvo
  }

  const somaX = flechasComCoordenadas.reduce((soma, flecha) => soma + (flecha.x || 0), 0);
  const somaY = flechasComCoordenadas.reduce((soma, flecha) => soma + (flecha.y || 0), 0);

  return {
    x: somaX / flechasComCoordenadas.length,
    y: somaY / flechasComCoordenadas.length
  };
}

// Função para calcular dispersão (desvio padrão)
function calcularDispersao(flechas: Flecha[], centro: { x: number; y: number }): number {
  const flechasComCoordenadas = flechas.filter(f => f.x !== undefined && f.y !== undefined);
  
  if (flechasComCoordenadas.length <= 1) return 0;

  const somaDistanciasQuadradas = flechasComCoordenadas.reduce((soma, flecha) => {
    const dx = (flecha.x || 0) - centro.x;
    const dy = (flecha.y || 0) - centro.y;
    return soma + (dx * dx + dy * dy);
  }, 0);

  return Math.sqrt(somaDistanciasQuadradas / flechasComCoordenadas.length);
}

// Análise de uma série individual
export function analisarSerie(serie: Serie): AnaliseSerieResult {
  const centroAlvo = { x: 140, y: 140 };
  const centroMassa = calcularCentroMassa(serie.flechas);
  const dispersao = calcularDispersao(serie.flechas, centroMassa);
  
  // Análise de tendência horizontal
  const desvioHorizontal = centroMassa.x - centroAlvo.x;
  let tendenciaHorizontal: 'esquerda' | 'direita' | 'centrado';
  if (Math.abs(desvioHorizontal) < 15) {
    tendenciaHorizontal = 'centrado';
  } else if (desvioHorizontal < 0) {
    tendenciaHorizontal = 'esquerda';
  } else {
    tendenciaHorizontal = 'direita';
  }

  // Análise de tendência vertical
  const desvioVertical = centroMassa.y - centroAlvo.y;
  let tendenciaVertical: 'acima' | 'abaixo' | 'centrado';
  if (Math.abs(desvioVertical) < 15) {
    tendenciaVertical = 'centrado';
  } else if (desvioVertical < 0) {
    tendenciaVertical = 'acima';
  } else {
    tendenciaVertical = 'abaixo';
  }

  // Análise de agrupamento baseado na dispersão
  let agrupamento: 'excelente' | 'bom' | 'regular' | 'disperso';
  if (dispersao < 20) {
    agrupamento = 'excelente';
  } else if (dispersao < 35) {
    agrupamento = 'bom';
  } else if (dispersao < 55) {
    agrupamento = 'regular';
  } else {
    agrupamento = 'disperso';
  }

  // Calcular consistência (inversamente proporcional à dispersão)
  const consistencia = Math.max(0, Math.min(100, 100 - (dispersao / 70) * 100));

  // Gerar insights baseados na análise
  const insights: string[] = [];
  const recomendacoes: string[] = [];

  // Insights de tendência
  if (tendenciaHorizontal === 'esquerda') {
    insights.push('Tendência de mira para a esquerda');
    recomendacoes.push('Ajuste a mira ligeiramente para a direita');
  } else if (tendenciaHorizontal === 'direita') {
    insights.push('Tendência de mira para a direita');
    recomendacoes.push('Ajuste a mira ligeiramente para a esquerda');
  }

  if (tendenciaVertical === 'acima') {
    insights.push('Tendência de mira acima do centro');
    recomendacoes.push('Reduza ligeiramente a elevação da mira');
  } else if (tendenciaVertical === 'abaixo') {
    insights.push('Tendência de mira abaixo do centro');
    recomendacoes.push('Aumente ligeiramente a elevação da mira');
  }

  // Insights de agrupamento
  if (agrupamento === 'excelente') {
    insights.push('Excelente consistência de agrupamento');
  } else if (agrupamento === 'bom') {
    insights.push('Bom agrupamento, com pequenas variações');
    recomendacoes.push('Trabalhe na consistência da ancoragem');
  } else if (agrupamento === 'regular') {
    insights.push('Agrupamento regular, necessita melhoria');
    recomendacoes.push('Foque na respiração e soltura consistente');
  } else {
    insights.push('Agrupamento disperso, revisar técnica');
    recomendacoes.push('Revisar postura e sequência de tiro');
    recomendacoes.push('Praticar tiros mais lentos e controlados');
  }

  // Insights de pontuação
  const pontuacaoMedia = serie.pontuacao / serie.flechas.length;
  if (pontuacaoMedia >= 8.5) {
    insights.push('Excelente desempenho de pontuação');
  } else if (pontuacaoMedia >= 7) {
    insights.push('Bom desempenho de pontuação');
  } else if (pontuacaoMedia >= 5) {
    insights.push('Desempenho moderado de pontuação');
    recomendacoes.push('Trabalhe na precisão da mira');
  } else {
    insights.push('Desempenho de pontuação precisa melhoria');
    recomendacoes.push('Revisar fundamentos básicos do tiro');
  }

  return {
    tendenciaHorizontal,
    tendenciaVertical,
    agrupamento,
    consistencia: Math.round(consistencia),
    insights,
    recomendacoes
  };
}

// Análise completa do treino
export function analisarTreino(treino: Treino): AnaliseTreinoResult {
  const analisesSeries = treino.series.map(serie => analisarSerie(serie));
  
  // Calcular tendência geral (média das séries)
  const totalSeries = analisesSeries.length;
  
  // Contar tendências horizontais
  const contadorHorizontal = analisesSeries.reduce((acc, analise) => {
    acc[analise.tendenciaHorizontal]++;
    return acc;
  }, { esquerda: 0, direita: 0, centrado: 0 });
  
  // Contar tendências verticais
  const contadorVertical = analisesSeries.reduce((acc, analise) => {
    acc[analise.tendenciaVertical]++;
    return acc;
  }, { acima: 0, abaixo: 0, centrado: 0 });

  // Determinar tendência predominante
  const tendenciaHorizontalGeral = Object.keys(contadorHorizontal).reduce((a, b) => 
    contadorHorizontal[a as keyof typeof contadorHorizontal] > contadorHorizontal[b as keyof typeof contadorHorizontal] ? a : b
  ) as 'esquerda' | 'direita' | 'centrado';

  const tendenciaVerticalGeral = Object.keys(contadorVertical).reduce((a, b) => 
    contadorVertical[a as keyof typeof contadorVertical] > contadorVertical[b as keyof typeof contadorVertical] ? a : b
  ) as 'acima' | 'abaixo' | 'centrado';

  // Calcular agrupamento geral
  const consistenciaMedia = analisesSeries.reduce((soma, analise) => soma + analise.consistencia, 0) / totalSeries;
  let agrupamentoGeral: 'excelente' | 'bom' | 'regular' | 'disperso';
  
  if (consistenciaMedia >= 80) {
    agrupamentoGeral = 'excelente';
  } else if (consistenciaMedia >= 65) {
    agrupamentoGeral = 'bom';
  } else if (consistenciaMedia >= 45) {
    agrupamentoGeral = 'regular';
  } else {
    agrupamentoGeral = 'disperso';
  }

  // Encontrar melhor série (maior pontuação)
  const melhorSerie = treino.series.reduce((melhor, serie, index) => 
    serie.pontuacao > treino.series[melhor].pontuacao ? index : melhor, 0);

  // Encontrar série com maior consistência
  const serieComMaiorConsistencia = analisesSeries.reduce((melhor, analise, index) => 
    analise.consistencia > analisesSeries[melhor].consistencia ? index : melhor, 0);

  // Analisar progressão ao longo das séries
  const pontuacoesSeries = treino.series.map(s => s.pontuacao);
  let progressao: 'melhorando' | 'estável' | 'declinando';
  
  if (pontuacoesSeries.length >= 3) {
    const primeiroTerco = pontuacoesSeries.slice(0, Math.floor(pontuacoesSeries.length / 3));
    const ultimoTerco = pontuacoesSeries.slice(-Math.floor(pontuacoesSeries.length / 3));
    
    const mediaPrimeiro = primeiroTerco.reduce((a, b) => a + b, 0) / primeiroTerco.length;
    const mediaUltimo = ultimoTerco.reduce((a, b) => a + b, 0) / ultimoTerco.length;
    
    const diferenca = mediaUltimo - mediaPrimeiro;
    
    if (diferenca > 2) {
      progressao = 'melhorando';
    } else if (diferenca < -2) {
      progressao = 'declinando';
    } else {
      progressao = 'estável';
    }
  } else {
    progressao = 'estável';
  }

  // Gerar insights gerais
  const insights: string[] = [];
  const recomendacoes: string[] = [];

  // Insights de tendência geral
  if (tendenciaHorizontalGeral !== 'centrado' || tendenciaVerticalGeral !== 'centrado') {
    insights.push(`Tendência consistente: ${tendenciaHorizontalGeral} e ${tendenciaVerticalGeral}`);
    recomendacoes.push('Ajustar configuração da mira conforme tendência observada');
  } else {
    insights.push('Mira bem centralizada ao longo do treino');
  }

  // Insights de progressão
  if (progressao === 'melhorando') {
    insights.push('Demonstrou melhoria ao longo do treino');
    insights.push('Boa adaptação e concentração');
  } else if (progressao === 'declinando') {
    insights.push('Queda de desempenho ao longo do treino');
    recomendacoes.push('Considerar pausas mais frequentes');
    recomendacoes.push('Trabalhar resistência física e mental');
  } else {
    insights.push('Desempenho consistente ao longo do treino');
  }

  // Insights de consistência
  if (consistenciaMedia >= 75) {
    insights.push('Excelente consistência geral');
  } else if (consistenciaMedia >= 60) {
    insights.push('Boa consistência com margem para melhoria');
  } else {
    insights.push('Consistência precisa ser trabalhada');
    recomendacoes.push('Foco em rotina de tiro padronizada');
  }

  const tendenciaGeral: AnaliseSerieResult = {
    tendenciaHorizontal: tendenciaHorizontalGeral,
    tendenciaVertical: tendenciaVerticalGeral,
    agrupamento: agrupamentoGeral,
    consistencia: Math.round(consistenciaMedia),
    insights: [],
    recomendacoes: []
  };

  return {
    tendenciaGeral,
    melhorSerie,
    serieComMaiorConsistencia,
    progressao,
    insights,
    recomendacoes
  };
}

// Função para gerar resumo textual da tendência
export function gerarResumoTendencia(analise: AnaliseSerieResult): string {
  const { tendenciaHorizontal, tendenciaVertical, agrupamento, consistencia } = analise;
  
  let resumo = '';
  
  if (tendenciaHorizontal === 'centrado' && tendenciaVertical === 'centrado') {
    resumo = 'Mira bem centrada';
  } else {
    const horizontal = tendenciaHorizontal === 'centrado' ? '' : tendenciaHorizontal;
    const vertical = tendenciaVertical === 'centrado' ? '' : tendenciaVertical;
    
    if (horizontal && vertical) {
      resumo = `Tendência ${vertical} e à ${horizontal}`;
    } else if (horizontal) {
      resumo = `Tendência à ${horizontal}`;
    } else if (vertical) {
      resumo = `Tendência ${vertical}`;
    }
  }
  
  resumo += `. Agrupamento ${agrupamento} (${consistencia}% consistência)`;
  
  return resumo;
}
