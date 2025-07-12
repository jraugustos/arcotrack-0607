import React from 'react';
import { CheckCircle, Circle, Dot } from 'lucide-react';

interface SeriesNavigationProps {
  totalSeries: number;
  serieAtual: number;
  seriesCompletas: boolean[];
  onNavigateToSeries: (numeroSerie: number) => void;
  className?: string;
}

export function SeriesNavigation({ 
  totalSeries, 
  serieAtual, 
  seriesCompletas, 
  onNavigateToSeries,
  className = '' 
}: SeriesNavigationProps) {
  
  const getSerieStatus = (indice: number) => {
    if (indice >= seriesCompletas.length) {
      return 'not-started'; // Série ainda não iniciada
    }
    if (seriesCompletas[indice]) {
      return 'completed'; // Série completa
    }
    if (indice === serieAtual) {
      return 'current'; // Série atual
    }
    return 'started'; // Série iniciada mas não completa
  };

  const getStatusIcon = (status: string, numeroSerie: number) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'current':
        return <Dot className="w-6 h-6 text-arco-accent animate-pulse" />;
      case 'started':
        return <Circle className="w-4 h-4 text-arco-accent" />;
      case 'not-started':
        return <Circle className="w-4 h-4 text-gray-300" />;
      default:
        return <Circle className="w-4 h-4 text-gray-300" />;
    }
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
      case 'current':
        return 'bg-arco-accent text-white border-arco-accent ring-2 ring-arco-accent ring-opacity-50';
      case 'started':
        return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200';
      case 'not-started':
        return 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed';
      default:
        return 'bg-gray-100 text-gray-400 border-gray-300';
    }
  };

  const canNavigateToSeries = (indice: number) => {
    // Pode navegar apenas para séries que já foram iniciadas
    return indice < seriesCompletas.length;
  };

  const handleSeriesClick = (numeroSerie: number) => {
    const indice = numeroSerie - 1;
    if (canNavigateToSeries(indice)) {
      onNavigateToSeries(numeroSerie);
    }
  };

  return (
    <div className={`${className}`}>
      <div className="px-4 py-3 bg-arco-white rounded-arco">
        <h3 className="text-lg font-bold text-arco-navy mb-3">Navegação das Séries</h3>
        
        {/* Grid de séries */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: totalSeries }, (_, index) => {
            const numeroSerie = index + 1;
            const status = getSerieStatus(index);
            const canNavigate = canNavigateToSeries(index);
            
            return (
              <button
                key={numeroSerie}
                onClick={() => handleSeriesClick(numeroSerie)}
                disabled={!canNavigate}
                className={`
                  relative flex items-center justify-center min-w-10 h-10 px-2 py-1 
                  border rounded-lg font-medium text-sm transition-all duration-200
                  ${getStatusColors(status)}
                  ${canNavigate ? 'transform hover:scale-105 active:scale-95' : ''}
                `}
                title={
                  status === 'completed' ? `Série ${numeroSerie} - Completa` :
                  status === 'current' ? `Série ${numeroSerie} - Atual` :
                  status === 'started' ? `Série ${numeroSerie} - Em andamento` :
                  `Série ${numeroSerie} - Não iniciada`
                }
              >
                {/* Ícone de status */}
                <div className="absolute -top-1 -right-1">
                  {getStatusIcon(status, numeroSerie)}
                </div>
                
                {/* Número da série */}
                <span>{numeroSerie}</span>
              </button>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-arco-gray">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span>Completa</span>
          </div>
          <div className="flex items-center space-x-1">
            <Dot className="w-4 h-4 text-arco-accent" />
            <span>Atual</span>
          </div>
          <div className="flex items-center space-x-1">
            <Circle className="w-3 h-3 text-arco-accent" />
            <span>Iniciada</span>
          </div>
          <div className="flex items-center space-x-1">
            <Circle className="w-3 h-3 text-gray-300" />
            <span>Não iniciada</span>
          </div>
        </div>
      </div>
    </div>
  );
}