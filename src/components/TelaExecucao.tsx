import React, { useState, useRef } from 'react';
import { useArcoTrack, Flecha } from '../contexts/ArcoTrackContext';
import { ChevronRight, SkipForward, X, Target as TargetIcon, Edit3, RotateCcw } from 'lucide-react';

export function TelaExecucao() {
  const { state, registrarFlecha, editarFlecha, proximaSerie, navegarPara } = useArcoTrack();
  const [flechaSelecionada, setFlechaSelecionada] = useState<number | null>(null);
  const [flechaEditando, setFlechaEditando] = useState<number | null>(null);
  const alvoRef = useRef<SVGSVGElement>(null);

  if (!state.treinoAtual) return null;

  const { config } = state.treinoAtual;
  const serieAtual = state.treinoAtual.series[state.serieAtual] || { flechas: [], pontuacao: 0 };
  const flechasNaSerie = serieAtual.flechas.length;
  const flechasRestantes = config.flechasPorSerie - flechasNaSerie;
  const serieCompleta = flechasRestantes === 0;
  const isUltimaSerie = state.serieAtual + 1 >= config.series;

  // Função para calcular a pontuação baseada na distância do centro
  const calcularPontuacao = (x: number, y: number): number => {
    try {
      if (isNaN(x) || isNaN(y)) return 0;
      
      const centerX = 140;
      const centerY = 140;
      const distancia = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      
      if (isNaN(distancia)) return 0;
      
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

  // Função simplificada para registrar flecha com coordenadas precisas
  const registrarFlechaComCoordenadas = async (event: React.MouseEvent<SVGSVGElement>) => {
    console.log('Clique no alvo detectado');
    
    // Verificações básicas
    if (serieCompleta && flechaEditando === null) {
      console.log('Série completa, ignorando clique');
      return;
    }
    
    if (flechaEditando === null && flechasRestantes <= 0) {
      console.log('Sem flechas restantes, ignorando clique');
      return;
    }

    try {
      const svg = event.currentTarget;
      const rect = svg.getBoundingClientRect();
      
      // Cálculo simplificado das coordenadas
      const x = Math.round((event.clientX - rect.left) * (280 / rect.width));
      const y = Math.round((event.clientY - rect.top) * (280 / rect.height));
      
      console.log('Coordenadas calculadas:', { x, y });
      
      // Validação básica
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
  };

  const cancelarEdicao = () => {
    setFlechaEditando(null);
  };

  // Calcular pontuação total até agora
  const pontuacaoAtual = state.treinoAtual.series.reduce((total, serie) => total + serie.pontuacao, 0);

  // Componente do alvo SVG reutilizável
  const AlvoSVG = ({ 
    size = 280, 
    isZoomed = false, 
    onTargetClick 
  }: { 
    size?: number; 
    isZoomed?: boolean; 
    onTargetClick?: (event: React.MouseEvent<SVGSVGElement>) => void 
  }) => (
    <svg
      ref={alvoRef}
      width={size}
      height={size}
      viewBox="0 0 280 280"
      className={`mx-auto drop-shadow-lg ${onTargetClick ? 'cursor-crosshair' : ''}`}
      onClick={onTargetClick}
    >
      {/* Círculos do alvo (de fora para dentro) */}
      
      {/* Anel externo (1 ponto) */}
      <circle
        cx="140"
        cy="140"
        r="135"
        fill={flechaSelecionada === 1 ? "#FFD66B" : "#D9D9D9"}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Anel 2 pontos */}
      <circle
        cx="140"
        cy="140"
        r="122"
        fill={flechaSelecionada === 2 ? "#FFD66B" : "#D9D9D9"}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Anel 3 pontos */}
      <circle
        cx="140"
        cy="140"
        r="108"
        fill={flechaSelecionada === 3 ? "#FFD66B" : "#434343"}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Anel 4 pontos */}
      <circle
        cx="140"
        cy="140"
        r="95"
        fill={flechaSelecionada === 4 ? "#FFD66B" : "#434343"}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Anel 5 pontos */}
      <circle
        cx="140"
        cy="140"
        r="81"
        fill={flechaSelecionada === 5 ? "#FFD66B" : "#4FA3D9"}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Anel 6 pontos */}
      <circle
        cx="140"
        cy="140"
        r="68"
        fill={flechaSelecionada === 6 ? "#FFD66B" : "#4FA3D9"}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Anel 7 pontos */}
      <circle
        cx="140"
        cy="140"
        r="54"
        fill={flechaSelecionada === 7 ? "#FFD66B" : "#F86B4F"}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Anel 8 pontos */}
      <circle
        cx="140"
        cy="140"
        r="41"
        fill={flechaSelecionada === 8 ? "#FFD66B" : "#F86B4F"}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Anel 9 pontos */}
      <circle
        cx="140"
        cy="140"
        r="27"
        fill={flechaSelecionada === 9 ? "#F5B041" : "#FFD66B"}
        stroke="#000000"
        strokeWidth="1"
      />
      
      {/* Centro 10 pontos */}
      <circle
        cx="140"
        cy="140"
        r="14"
        fill={flechaSelecionada === 10 ? "#F5B041" : "#FFD66B"}
        stroke="#000000"
        strokeWidth="1"
      />

      {/* Linhas divisórias principais */}
      <line x1="140" y1="5" x2="140" y2="275" stroke="#000000" strokeWidth="1" />
      <line x1="5" y1="140" x2="275" y2="140" stroke="#000000" strokeWidth="1" />

      {/* Ponto central para mira */}
      <circle cx="140" cy="140" r="2" fill="#000000" />

      {/* Mostrar flechas marcadas no alvo */}
      {serieAtual.flechas.map((flecha, index) => {
        if (flecha.x !== undefined && flecha.y !== undefined) {
          return (
            <g key={index}>
              {/* Seta da flecha */}
              <circle
                cx={flecha.x}
                cy={flecha.y}
                r={isZoomed ? "4" : "3"}
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
                x={flecha.x}
                y={flecha.y + (isZoomed ? 15 : 12)}
                textAnchor="middle"
                fontSize={isZoomed ? "10" : "8"}
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
  );

  return (
    <div className="min-h-screen bg-arco-light font-dm-sans">
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
            <span className="text-sm text-white">Progresso da série</span>
            <span className="text-sm font-medium text-white">
              {flechasNaSerie}/{config.flechasPorSerie}
            </span>
          </div>
          <div className="w-full bg-arco-light rounded-full h-2">
            <div 
              className="bg-arco-yellow h-2 rounded-full transition-all duration-300"
              style={{ width: `${(flechasNaSerie / config.flechasPorSerie) * 100}%` }}
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
      <div className="px-6 flex-1 flex items-center justify-center">
        <div className="relative">
          {/* Título do alvo */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-arco-navy mb-1">
              {flechaEditando !== null ? 'Reposicione a flecha' : 'Toque no alvo'}
            </h2>
            <p className="text-arco-gray">
              {flechaEditando !== null ? `Editando flecha ${flechaEditando + 1}` :
               serieCompleta ? 'Série concluída!' : `Flecha ${flechasNaSerie + 1}`}
            </p>
            <p className="text-sm text-arco-gray mt-1">
              {flechaEditando !== null ? 'Clique para reposicionar' : 'Clique no local exato da flecha'}
            </p>
          </div>

          {/* Alvo */}
          <AlvoSVG 
            onTargetClick={registrarFlechaComCoordenadas}
          />

          {/* Pontuação rápida para erro (0 pontos) */}
          {!serieCompleta && flechaEditando === null && (
            <div className="text-center mt-4">
              <button
                onClick={registrarErro}
                className="bg-arco-white border-2 border-arco-light text-arco-gray px-6 py-3 rounded-arco hover:border-arco-gray transition-colors"
              >
                Erro (0 pontos)
              </button>
            </div>
          )}
        </div>
      </div>



      {/* Flechas da série atual */}
      <div className="px-6 py-4">
        <div className="bg-arco-white rounded-arco p-4">
          <h3 className="font-semibold text-arco-navy mb-3">Flechas desta série</h3>
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
          <div className="mt-3 text-right">
            <span className="text-arco-gray">Pontuação da série: </span>
            <span className="font-bold text-arco-navy">{serieAtual.pontuacao} pontos</span>
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      {serieCompleta && flechaEditando === null && (
        <div className="px-6 pb-6">
          {isUltimaSerie ? (
            <button
              onClick={finalizarTreino}
              className="w-full bg-arco-yellow text-arco-navy font-semibold py-4 rounded-arco hover:bg-arco-orange transition-colors flex items-center justify-center space-x-2"
            >
              <span>Finalizar Treino</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleProximaSerie}
              className="w-full bg-arco-yellow text-arco-navy font-semibold py-4 rounded-arco hover:bg-arco-orange transition-colors flex items-center justify-center space-x-2"
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
