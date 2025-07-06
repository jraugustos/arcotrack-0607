import React from 'react';
import { useArcoTrack } from '../contexts/ArcoTrackContext';
import { Home, Plus, History, Settings } from 'lucide-react';

export function NavegacaoInferior() {
  const { state, navegarPara } = useArcoTrack();

  // Não mostrar navegação em certas telas
  const telasComNavegacao = ['home', 'historico', 'configuracoes'];
  if (!telasComNavegacao.includes(state.telaAtual)) {
    return null;
  }

  const abas = [
    {
      id: 'home',
      nome: 'Home',
      icone: Home,
      ativo: state.telaAtual === 'home',
    },
    {
      id: 'registro',
      nome: 'Novo Treino',
      icone: Plus,
      ativo: false,
    },
    {
      id: 'historico',
      nome: 'Histórico',
      icone: History,
      ativo: state.telaAtual === 'historico',
    },
    {
      id: 'configuracoes',
      nome: 'Ajustes',
      icone: Settings,
      ativo: state.telaAtual === 'configuracoes',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-arco-gray-300/30">
      <div className="max-w-md mx-auto px-6 py-4">
        <div className="flex items-center justify-around">
          {abas.map((aba) => {
            const Icone = aba.icone;
            return (
              <button
                key={aba.id}
                onClick={() => navegarPara(aba.id)}
                className={`flex flex-col items-center space-y-2 py-2 px-3 rounded-2xl transition-all duration-200 ${
                  aba.ativo
                    ? (aba.id === 'home' || aba.id === 'historico' || aba.id === 'configuracoes')
                      ? 'text-black'
                      : 'text-arco-accent'
                    : 'text-arco-gray-500 hover:text-arco-primary'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all duration-200 ${
                  aba.id === 'registro' 
                    ? 'bg-arco-primary text-arco-secondary' 
                    : aba.ativo 
                    ? 'bg-arco-accent/10' 
                    : 'hover:bg-arco-gray-100'
                }`}>
                  <Icone className={`w-6 h-6 ${
                    aba.id === 'registro' ? 'text-arco-secondary' : ''
                  }`} />
                </div>
                <span className="text-xs font-semibold">{aba.nome}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
