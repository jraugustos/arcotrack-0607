import React, { useState } from 'react';
import { useArcoTrack } from '../contexts/ArcoTrackContext';
import { useAuthContext } from '../contexts/AuthContext';
import { LogOut, User, Info, HelpCircle, Star, Loader2 } from 'lucide-react';

export function TelaConfiguracoes() {
  const { state } = useArcoTrack();
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

  const opcoes = [
    {
      id: 'perfil',
      nome: 'Perfil do Usuário',
      icone: User,
      acao: () => alert('Funcionalidade em desenvolvimento'),
    },
    {
      id: 'sobre',
      nome: 'Sobre o ArcoTrack',
      icone: Info,
      acao: () => alert('ArcoTrack v4.0 - Com autenticação Google e sincronização na nuvem'),
    },
    {
      id: 'ajuda',
      nome: 'Ajuda e Suporte',
      icone: HelpCircle,
      acao: () => alert('Para suporte, entre em contato conosco'),
    },
    {
      id: 'avaliar',
      nome: 'Avaliar o App',
      icone: Star,
      acao: () => alert('Obrigado pelo seu interesse em avaliar!'),
    },
  ];

  return (
    <div className="min-h-screen bg-arco-light font-dm-sans">
      {/* Header */}
      <div className="bg-black px-4 py-8 border-b-4" style={{borderImage: 'linear-gradient(to right, #43c6ac, #f8ffae) 1'}}>
        <h1 className="text-lg font-bold text-arco-secondary">Ajustes</h1>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Informações do usuário */}
        <div className="bg-arco-white rounded-arco p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-arco-yellow rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h3 className="font-bold text-arco-navy text-lg">{state.usuario?.nome}</h3>
              <p className="text-arco-gray">{state.usuario?.email}</p>
              <p className="text-sm text-arco-gray">
                {state.treinos.length} {state.treinos.length === 1 ? 'treino registrado' : 'treinos registrados'}
              </p>
            </div>
          </div>
        </div>

        {/* Opções de configuração */}
        <div className="bg-arco-white rounded-arco overflow-hidden">
          {opcoes.map((opcao, index) => {
            const Icone = opcao.icone;
            return (
              <button
                key={opcao.id}
                onClick={opcao.acao}
                className={`w-full flex items-center justify-between p-4 hover:bg-arco-light transition-colors ${
                  index < opcoes.length - 1 ? 'border-b border-arco-light' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icone className="w-5 h-5 text-arco-gray" />
                  <span className="text-arco-navy font-medium">{opcao.nome}</span>
                </div>
                <span className="text-arco-gray">→</span>
              </button>
            );
          })}
        </div>

        {/* Estatísticas do usuário */}
        {state.treinos.length > 0 && (
          <div className="bg-arco-white rounded-arco p-6">
            <h3 className="font-bold text-arco-navy mb-4">Suas Estatísticas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-arco-navy">
                  {state.treinos.length}
                </div>
                <div className="text-sm text-arco-gray">Treinos realizados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-arco-navy">
                  {Math.round(state.treinos.reduce((acc, t) => acc + t.pontuacaoTotal, 0) / state.treinos.length)}
                </div>
                <div className="text-sm text-arco-gray">Pontuação média</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-arco-navy">
                  {Math.max(...state.treinos.map(t => t.pontuacaoTotal))}
                </div>
                <div className="text-sm text-arco-gray">Melhor pontuação</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-arco-navy">
                  {state.treinos.reduce((acc, t) => acc + (t.config.series * t.config.flechasPorSerie), 0)}
                </div>
                <div className="text-sm text-arco-gray">Total de flechas</div>
              </div>
            </div>
          </div>
        )}

        {/* Versão do app */}
        <div className="text-center">
          <p className="text-sm text-arco-gray">
            ArcoTrack v4.0
          </p>
          <p className="text-xs text-arco-gray mt-1">
            Com autenticação Google e sincronização na nuvem
          </p>
        </div>

        {/* Botão de logout */}
        <div className="pt-4">
          <button
            onClick={fazerLogout}
            disabled={loading}
            className="w-full bg-target-red text-white font-semibold py-4 rounded-arco hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
