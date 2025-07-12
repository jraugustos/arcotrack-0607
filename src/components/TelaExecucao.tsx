import React, { useState, useRef, useEffect } from 'react';
import { useArcoTrack, Flecha } from '../contexts/ArcoTrackContext';
import { SeriesNavigation } from './SeriesNavigation';
import { ChevronRight, SkipForward, X, Target as TargetIcon, Edit3, RotateCcw } from 'lucide-react';

export function TelaExecucao() {
  const { state, registrarFlecha, editarFlecha, proximaSerie, navegarParaSerie, navegarPara } = useArcoTrack();
  const [flechaSelecionada, setFlechaSelecionada] = useState<number | null>(null);
  const [flechaEditando, setFlechaEditando] = useState<number | null>(null);
  const [zoomAtivo, setZoomAtivo] = useState(false);
  const [autoResetTimer, setAutoResetTimer] = useState<NodeJS.Timeout | null>(null);
  const [escalaZoom, setEscalaZoom] = useState(1);
  const [aguardandoSegundoToque, setAguardandoSegundoToque] = useState(false);
  const [tamanhoAlvo, setTamanhoAlvo] = useState(280);
  const [larguraTela, setLarguraTela] = useState(window.innerWidth);
  const alvoRef = useRef<SVGSVGElement>(null);

  if (!state.treinoAtual) return null;

  const { config } = state.treinoAtual;

  // Calcular tamanho responsivo do alvo
  const calcularTamanhoAlvo = (largura: number) => {
    // Padding responsivo: px-2 (16px), sm:px-4 (32px), md:px-6 (48px)
    const paddingLateral = largura < 640 ? 16 : largura < 768 ? 32 : 48;
    const margemSeguranca = 20; // Margem extra para segurança
    const espacoDisponivel = largura - paddingLateral - margemSeguranca;
    
    // Considerar zoom máximo (1.6x)
    const tamanhoMaximoComZoom = espacoDisponivel / 1.6;
    
    // Tamanho mínimo para usabilidade e máximo original
    const tamanhoMinimo = 200;
    const tamanhoMaximo = 280;
    
    return Math.max(tamanhoMinimo, Math.min(tamanhoMaximo, tamanhoMaximoComZoom));
  };

  // Effect para monitorar mudanças no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      const novaLargura = window.innerWidth;
      setLarguraTela(novaLargura);
      setTamanhoAlvo(calcularTamanhoAlvo(novaLargura));
    };

    // Calcular tamanho inicial
    setTamanhoAlvo(calcularTamanhoAlvo(larguraTela));

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [larguraTela]);
  const serieAtual = state.treinoAtual.series[state.serieAtual] || { flechas: [], pontuacao: 0 };
  const flechasNaSerie = serieAtual.flechas?.length || 0;
  const flechasRestantes = Math.max(0, (config.flechasPorSerie || 0) - flechasNaSerie);
  const serieCompleta = flechasRestantes === 0;
  const isUltimaSerie = state.serieAtual + 1 >= config.series;
  
  // Calcular progresso geral do treino
  const calcularProgressoTreino = () => {
    if (config.series === 0) return 0;
    
    // Contar séries completas
    const seriesCompletas = state.treinoAtual.series.filter(serie => 
      serie.flechas.length >= config.flechasPorSerie
    ).length;
    
    // Progresso da série atual (se não estiver completa)
    const progressoSerieAtual = serieAtual.flechas.length < config.flechasPorSerie 
      ? serieAtual.flechas.length / config.flechasPorSerie 
      : 0;
    
    // Progresso total = (séries completas + progresso da série atual) / total de séries
    const progressoTotal = (seriesCompletas + progressoSerieAtual) / config.series;
    
    return Math.round(progressoTotal * 100);
  };

  const progressoPercentual = calcularProgressoTreino();

  // Calcular quais séries estão completas para navegação
  const seriesCompletas = state.treinoAtual.series.map(serie => 
    serie.flechas.length >= config.flechasPorSerie
  );

  // Função para calcular a pontuação baseada no sistema fixo 280x280
  const calcularPontuacao = (x: number, y: number): number => {
    try {
      if (isNaN(x) || isNaN(y)) return 0;
      
      // Centro fixo do sistema 280x280
      const centerX = 140;
      const centerY = 140;
      const distancia = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      
      if (isNaN(distancia)) return 0;
      
      // Raios fixos do sistema original (280x280)
      if (distancia <= 14) return 10;
      if (distancia <= 27) return 9;
      if (distancia <= 41) return 8;
      if (distancia <= 54) return 7;
      if (distancia <= 68) return 6;
      if (distancia <= 81) return 5;
      if (distancia <= 95) return 4;
      if (distancia <= 108) return 3;
      if (distancia <= 122) return 2;
      if (distancia <= 135) return 1;
      return 0;
    } catch (error) {
      console.error('Erro ao calcular pontuação:', error);
      return 0;
    }
  };

  // Função para ativar zoom (primeiro toque)
  const ativarZoom = () => {
    if (serieCompleta && flechaEditando === null) return;
    if (flechaEditando === null && flechasRestantes <= 0) return;
    
    setZoomAtivo(true);
    setEscalaZoom(1.6);
    setAguardandoSegundoToque(true);
    
    // Auto-reset após 3 segundos
    const timer = setTimeout(() => {
      finalizarZoom();
    }, 3000);
    
    setAutoResetTimer(timer);
  };

  // Função para finalizar zoom
  const finalizarZoom = () => {
    setZoomAtivo(false);
    setEscalaZoom(1);
    setAguardandoSegundoToque(false);
    if (autoResetTimer) {
      clearTimeout(autoResetTimer);
      setAutoResetTimer(null);
    }
  };

  // Função para gerenciar cliques no alvo (duplo toque)
  const handleAlvoClick = (event: React.MouseEvent<SVGSVGElement>) => {
    console.log('Clique no alvo detectado', { zoomAtivo, aguardandoSegundoToque });
    
    // Verificações básicas
    if (serieCompleta && flechaEditando === null) {
      console.log('Série completa, ignorando clique');
      return;
    }
    
    if (flechaEditando === null && flechasRestantes <= 0) {
      console.log('Sem flechas restantes, ignorando clique');
      return;
    }

    // Se não está em zoom ou não está aguardando segundo toque = primeiro toque (ativar zoom)
    if (!zoomAtivo || !aguardandoSegundoToque) {
      console.log('Primeiro toque - ativando zoom');
      ativarZoom();
      return;
    }

    // Se está em zoom e aguardando segundo toque = segundo toque (registrar flecha)
    console.log('Segundo toque - registrando flecha');
    registrarFlechaComCoordenadas(event);
  };

  // Função para registrar flecha com coordenadas precisas
  const registrarFlechaComCoordenadas = async (event: React.MouseEvent<SVGSVGElement>) => {
    console.log('Registrando flecha com coordenadas');

    try {
      const svg = event.currentTarget;
      const rect = svg.getBoundingClientRect();
      
      // Cálculo de coordenadas SEMPRE normalizadas para sistema 280x280
      const escalaAtual = zoomAtivo ? escalaZoom : 1;
      const tamanhoVisual = tamanhoAlvo * escalaAtual; // Tamanho visual atual
      
      // Ajustar coordenadas para o centro do alvo quando há zoom
      const offsetX = zoomAtivo ? (rect.width - tamanhoVisual) / 2 : 0;
      const offsetY = zoomAtivo ? (rect.height - tamanhoVisual) / 2 : 0;
      
      // Converter clique para coordenadas no espaço visual do alvo
      const xVisual = (event.clientX - rect.left - offsetX) / tamanhoVisual;
      const yVisual = (event.clientY - rect.top - offsetY) / tamanhoVisual;
      
      // SEMPRE normalizar para sistema 280x280 (padrão)
      const x = Math.round(xVisual * 280);
      const y = Math.round(yVisual * 280);
      
      console.log('Coordenadas calculadas:', { 
        x, y, 
        xVisual, yVisual,
        tamanhoAlvo, escalaAtual, zoomAtivo 
      });
      
      // Validação no sistema padrão 280x280
      if (x < 0 || x > 280 || y < 0 || y > 280) {
        console.log('Coordenadas fora dos limites');
        return;
      }
      
      const pontos = calcularPontuacao(x, y);
      console.log('Pontos calculados:', pontos);
      
      if (flechaEditando !== null) {
        console.log('Editando flecha existente');
        await editarFlecha(state.serieAtual, flechaEditando, { valor: pontos, x, y });
        setFlechaEditando(null);
      } else {
        console.log('Registrando nova flecha');
        const flecha: Flecha = { valor: pontos, x, y };
        await registrarFlecha(flecha);
      }
      
      // Feedback visual
      setFlechaSelecionada(pontos);
      setTimeout(() => setFlechaSelecionada(null), 300);
      
      // Finalizar zoom após registrar
      finalizarZoom();
      
    } catch (error) {
      console.error('Erro ao registrar flecha:', error);
    }
  };

  const registrarFlechaLocal = async (pontos: number, x?: number, y?: number) => {
    if (serieCompleta) return;

    const flecha: Flecha = { valor: pontos, x, y };
    await registrarFlecha(flecha);
    
    // Feedback visual
    setFlechaSelecionada(pontos);
    setTimeout(() => setFlechaSelecionada(null), 300);
  };

  // Função simplificada para registrar erro
  const registrarErro = async () => {
    if (serieCompleta) return;
    await registrarFlechaLocal(0);
  };

  const handleProximaSerie = async () => {
    await proximaSerie();
  };

  const finalizarTreino = () => {
    navegarPara('finalizacao');
  };

  const cancelarTreino = () => {
    navegarPara('home');
  };

  const iniciarEdicaoFlecha = (index: number) => {
    setFlechaEditando(index);
    // Ativar zoom automaticamente para edição
    setZoomAtivo(true);
    setEscalaZoom(1.6);
    setAguardandoSegundoToque(true);
    
    // Auto-reset após 3 segundos para edição também
    const timer = setTimeout(() => {
      finalizarZoom();
      setFlechaEditando(null);
    }, 3000);
    
    setAutoResetTimer(timer);
  };

  const cancelarEdicao = () => {
    setFlechaEditando(null);
    finalizarZoom();
  };

  // Calcular pontuação total até agora
  const pontuacaoAtual = state.treinoAtual.series.reduce((total, serie) => total + serie.pontuacao, 0);

  // Componente do alvo SVG reutilizável
  const AlvoSVG = ({ 
    size = tamanhoAlvo, 
    escala = 1,
    onTargetClick
  }: { 
    size?: number; 
    escala?: number;
    onTargetClick?: (event: React.MouseEvent<SVGSVGElement>) => void;
  }) => {
    // Calcular raios proporcionais ao tamanho atual
    const fatorEscala = size / 280;
    const centerCoord = size / 2;
    
    return (
    <div 
      className="flex justify-center items-center"
      style={{ 
        transition: 'all 0.3s ease-in-out',
        transform: `scale(${escala})`,
        height: size * 1.2, // Espaço extra para evitar corte do zoom
        width: size * 1.2
      }}
    >
      <svg
        ref={alvoRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={`drop-shadow-lg ${onTargetClick ? 'cursor-crosshair' : ''} select-none`}
        onClick={onTargetClick}
        style={{ transition: 'transform 0.3s ease-in-out' }}
      >
      {/* Círculos do alvo (de fora para dentro) */}
      
      {/* Anel externo (1 ponto) */}
      <circle
        cx={centerCoord}
        cy={centerCoord}
        r={135 * fatorEscala}
        fill={flechaSelecionada === 1 ? "#FFD66B" : "#D9D9D9"}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Anel 2 pontos */}
      <circle
        cx={centerCoord}
        cy={centerCoord}
        r={122 * fatorEscala}
        fill={flechaSelecionada === 2 ? "#FFD66B" : "#D9D9D9"}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Anel 3 pontos */}
      <circle
        cx={centerCoord}
        cy={centerCoord}
        r={108 * fatorEscala}
        fill={flechaSelecionada === 3 ? "#FFD66B" : "#434343"}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Anel 4 pontos */}
      <circle
        cx={centerCoord}
        cy={centerCoord}
        r={95 * fatorEscala}
        fill={flechaSelecionada === 4 ? "#FFD66B" : "#434343"}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Anel 5 pontos */}
      <circle
        cx={centerCoord}
        cy={centerCoord}
        r={81 * fatorEscala}
        fill={flechaSelecionada === 5 ? "#FFD66B" : "#4FA3D9"}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Anel 6 pontos */}
      <circle
        cx={centerCoord}
        cy={centerCoord}
        r={68 * fatorEscala}
        fill={flechaSelecionada === 6 ? "#FFD66B" : "#4FA3D9"}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Anel 7 pontos */}
      <circle
        cx={centerCoord}
        cy={centerCoord}
        r={54 * fatorEscala}
        fill={flechaSelecionada === 7 ? "#FFD66B" : "#F86B4F"}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Anel 8 pontos */}
      <circle
        cx={centerCoord}
        cy={centerCoord}
        r={41 * fatorEscala}
        fill={flechaSelecionada === 8 ? "#FFD66B" : "#F86B4F"}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Anel 9 pontos */}
      <circle
        cx={centerCoord}
        cy={centerCoord}
        r={27 * fatorEscala}
        fill={flechaSelecionada === 9 ? "#F5B041" : "#FFD66B"}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Centro 10 pontos */}
      <circle
        cx={centerCoord}
        cy={centerCoord}
        r={14 * fatorEscala}
        fill={flechaSelecionada === 10 ? "#F5B041" : "#FFD66B"}
        stroke="#000000"
        strokeWidth="1"
      />

      {/* Linhas divisórias principais */}
      <line x1={centerCoord} y1={5 * fatorEscala} x2={centerCoord} y2={size - 5 * fatorEscala} stroke="#000000" strokeWidth="1" />
      <line x1={5 * fatorEscala} y1={centerCoord} x2={size - 5 * fatorEscala} y2={centerCoord} stroke="#000000" strokeWidth="1" />

      {/* Ponto central para mira */}
      <circle cx={centerCoord} cy={centerCoord} r={2 * fatorEscala} fill="#000000" />

      {/* Mostrar flechas marcadas no alvo */}
      {serieAtual.flechas.map((flecha, index) => {
        if (flecha.x !== undefined && flecha.y !== undefined) {
          // Converter coordenadas do sistema original (280) para o tamanho atual
          const flechaX = (flecha.x / 280) * size;
          const flechaY = (flecha.y / 280) * size;
          
          return (
            <g key={index}>
              {/* Seta da flecha */}
              <circle
                cx={flechaX}
                cy={flechaY}
                r={3 * fatorEscala}
                fill="#FF0000"
                stroke="#FFFFFF"
                strokeWidth="1"
                className="cursor-pointer hover:r-5 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  iniciarEdicaoFlecha(index);
                }}
              />
              {/* Número da flecha */}
              <text
                x={flechaX}
                y={flechaY + 12 * fatorEscala}
                textAnchor="middle"
                fontSize={8 * fatorEscala}
                fill="#FF0000"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {index + 1}
              </text>
            </g>
          );
        }
        return null;
      })}
    </svg>
    </div>
  );
  };

  return (
    <div className="min-h-screen bg-arco-light font-dm-sans flex flex-col">
      {/* Header */}
      <div className="bg-black px-4 py-8 border-b-4" style={{borderImage: 'linear-gradient(to right, #43c6ac, #f8ffae) 1'}}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">
              Série {state.serieAtual + 1} de {config.series}
            </h1>
            <p className="text-white">
              {flechaEditando !== null ? 'Editando flecha...' : 
               flechasRestantes > 0 ? `${flechasRestantes} ${flechasRestantes === 1 ? 'flecha restante' : 'flechas restantes'}` : 
               'Série concluída!'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {flechaEditando !== null && (
              <button
                onClick={cancelarEdicao}
                className="w-10 h-10 flex items-center justify-center text-white hover:text-red-400 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={cancelarTreino}
              className="w-10 h-10 flex items-center justify-center text-white hover:text-arco-navy transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progresso */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white">Progresso do treino</span>
            <span className="text-sm font-medium text-white">
              {state.treinoAtual.series.filter(serie => serie.flechas.length >= config.flechasPorSerie).length} de {config.series} séries
            </span>
          </div>
          <div className="w-full bg-arco-light rounded-full h-2">
            <div 
              className="bg-accent-gradient h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressoPercentual}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Informações do treino */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-arco-white rounded-arco p-3 text-center">
            <div className="text-lg font-bold text-arco-navy">{pontuacaoAtual}</div>
            <div className="text-xs text-arco-gray">Pontos</div>
          </div>
          <div className="bg-arco-white rounded-arco p-3 text-center">
            <div className="text-lg font-bold text-arco-navy">{serieAtual.pontuacao}</div>
            <div className="text-xs text-arco-gray">Série atual</div>
          </div>
          <div className="bg-arco-white rounded-arco p-3 text-center">
            <div className="text-lg font-bold text-arco-navy">{config.distancia}m</div>
            <div className="text-xs text-arco-gray">Distância</div>
          </div>
        </div>
      </div>

      {/* Alvo principal */}
      <div className="px-2 sm:px-4 md:px-6 flex-1 flex items-center justify-center">
        <div className="relative">
          {/* Título do alvo */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-arco-navy mb-1">
              {flechaEditando !== null ? 'Reposicione a flecha' : 
               serieCompleta ? 'Série concluída!' : `Flecha ${flechasNaSerie + 1}`}
            </h2>
          </div>

          {/* Alvo com zoom fluido */}
          <div className="relative">
            <AlvoSVG 
              escala={escalaZoom}
              onTargetClick={handleAlvoClick}
            />
          </div>


          {/* Botão para cancelar zoom */}
          {zoomAtivo && aguardandoSegundoToque && (
            <div className="text-center mt-4">
              <button
                onClick={finalizarZoom}
                className="bg-gray-100 border-2 border-gray-300 text-gray-600 px-6 py-3 rounded-arco hover:border-gray-400 transition-colors"
              >
                Cancelar Zoom
              </button>
            </div>
          )}
        </div>
      </div>



      {/* Flechas da série atual */}
      <div className="px-6 py-4">
        <div className="bg-arco-white rounded-arco p-4">
          <h3 className="text-lg font-bold text-arco-navy mb-3">Flechas desta série</h3>
          <div className="flex flex-wrap gap-2">
            {serieAtual.flechas.map((flecha, index) => {
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
                <div key={index} className="relative group">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 border-gray-900 ${
                      flecha.x !== undefined && flecha.y !== undefined ? 'cursor-pointer hover:ring-2 hover:ring-arco-accent' : ''
                    }`}
                    style={{
                      backgroundColor: cores.bg,
                      color: cores.text
                    }}
                    onClick={() => {
                      if (flecha.x !== undefined && flecha.y !== undefined) {
                        iniciarEdicaoFlecha(index);
                      }
                    }}
                  >
                    {flecha.valor}
                  </div>
                  {flecha.x !== undefined && flecha.y !== undefined && (
                    <Edit3 className="w-3 h-3 absolute -top-1 -right-1 text-arco-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              );
            })}
            {/* Indicadores de flechas restantes */}
            {Array.from({ length: flechasRestantes }, (_, index) => (
              <div
                key={`restante-${index}`}
                className="w-10 h-10 rounded-full border-2 border-dashed border-arco-light flex items-center justify-center"
              >
                <TargetIcon className="w-4 h-4 text-arco-light" />
              </div>
            ))}
          </div>
          <div className="mt-3 text-left">
            <span className="text-arco-gray">Pontuação da série: </span>
            <span className="font-bold text-arco-navy">{serieAtual.pontuacao} pontos</span>
          </div>
        </div>
      </div>

      {/* Navegação entre séries */}
      <div className="px-6 pb-4">
        <SeriesNavigation
          totalSeries={config.series}
          serieAtual={state.serieAtual}
          seriesCompletas={seriesCompletas}
          onNavigateToSeries={navegarParaSerie}
        />
      </div>

      {/* Espaço flexível para empurrar botões para baixo */}
      <div className="flex-1"></div>

      {/* Botões de ação fixos no bottom */}
      {serieCompleta && flechaEditando === null && (
        <div className="sticky bottom-0 bg-arco-light px-6 py-4 border-t border-arco-gray-200">
          {isUltimaSerie ? (
            <button
              onClick={finalizarTreino}
              className="w-full bg-accent-gradient text-black font-bold py-4 rounded-2xl hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>Finalizar Treino</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleProximaSerie}
              className="w-full bg-accent-gradient text-black font-bold py-4 rounded-2xl hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
            >
              <SkipForward className="w-5 h-5" />
              <span>Próxima Série</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
}
