import React, { useState } from 'react';
import { useArcoTrack } from '../contexts/ArcoTrackContext';
import { useAuthContext } from '../contexts/AuthContext';
import { LogOut, User, Loader2 } from 'lucide-react';

export function TelaConfiguracoes() {
  const { state, navegarPara } = useArcoTrack();
  const { signOut } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const fazerLogout = async () => {
    if (confirm('Tem certeza que deseja sair?')) {
      try {
        setLoading(true);
        await signOut();
      } catch (error) {
        console.error('Error during logout:', error);
        alert('Erro ao fazer logout. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const irParaPerfil = () => {
    navegarPara('perfil');
  };

  const opcoes = [
    {
      id: 'perfil',
      nome: 'Perfil do Usuário',
      icone: User,
      acao: irParaPerfil,
    },
  ];

  return (
    <div className="min-h-screen bg-arco-secondary font-dm-sans">
      {/* Header */}
      <div className="bg-black px-4 py-8 border-b-4" style={{borderImage: 'linear-gradient(to right, #43c6ac, #f8ffae) 1'}}>
        <h1 className="text-lg font-bold text-arco-secondary">Ajustes</h1>
      </div>

      <div className="px-4 py-8 space-y-6">
        {/* Informações do usuário */}
        <div className="bg-white rounded-3xl p-6 border border-arco-gray-300/30">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-accent-gradient rounded-3xl flex items-center justify-center">
              <User className="w-8 h-8 text-black" />
            </div>
            <div>
              <h3 className="font-medium text-arco-primary text-lg">{state.usuario?.nome}</h3>
              <p className="text-arco-gray-700 font-light">{state.usuario?.email}</p>
              <p className="text-sm text-arco-gray-500 mt-1">
                {state.treinos.length} {state.treinos.length === 1 ? 'treino registrado' : 'treinos registrados'}
              </p>
            </div>
          </div>
        </div>

        {/* Opções de configuração */}
        <div className="bg-white rounded-3xl overflow-hidden border border-arco-gray-300/30">
          {opcoes.map((opcao, index) => {
            const Icone = opcao.icone;
            return (
              <button
                key={opcao.id}
                onClick={opcao.acao}
                className={`w-full flex items-center justify-between p-4 hover:bg-arco-gray-50 transition-colors ${
                  index < opcoes.length - 1 ? 'border-b border-arco-gray-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icone className="w-5 h-5 text-arco-gray-600" />
                  <span className="text-arco-primary font-medium">{opcao.nome}</span>
                </div>
                <span className="text-arco-gray-400">→</span>
              </button>
            );
          })}
        </div>

        {/* Estatísticas do usuário */}
        {state.treinos.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-arco-gray-300/30">
            <h3 className="font-medium text-arco-primary mb-4">Suas Estatísticas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-medium text-arco-primary">
                  {state.treinos.length}
                </div>
                <div className="text-sm text-arco-gray-700 font-light">Treinos realizados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-medium text-arco-primary">
                  {Math.round(state.treinos.reduce((acc, t) => acc + t.pontuacaoTotal, 0) / state.treinos.length)}
                </div>
                <div className="text-sm text-arco-gray-700 font-light">Pontuação média</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-medium text-arco-primary">
                  {Math.max(...state.treinos.map(t => t.pontuacaoTotal))}
                </div>
                <div className="text-sm text-arco-gray-700 font-light">Melhor pontuação</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-medium text-arco-primary">
                  {state.treinos.reduce((acc, t) => acc + (t.config.series * t.config.flechasPorSerie), 0)}
                </div>
                <div className="text-sm text-arco-gray-700 font-light">Total de flechas</div>
              </div>
            </div>
          </div>
        )}

        {/* Versão do app */}
        <div className="text-center">
          <p className="text-sm text-arco-gray-700">
            ArcoTrack v4.0
          </p>
          <p className="text-xs text-arco-gray-500 mt-1">
            Com autenticação Google e sincronização na nuvem
          </p>
        </div>

        {/* Botão de logout */}
        <div className="pt-4">
          <button
            onClick={fazerLogout}
            disabled={loading}
            className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl hover:bg-red-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogOut className="w-5 h-5" />
            )}
            <span>Sair da Conta</span>
          </button>
        </div>
      </div>
    </div>
  );
}
