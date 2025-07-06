import React, { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, User, Loader2 } from 'lucide-react';

export function TelaLogin() {
  const { signInWithEmail, signUpWithEmail, loading } = useAuthContext();
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const fazerLogin = async () => {
    if (!email || !senha) {
      setErro('Digite seu e-mail e senha');
      return;
    }
    
    try {
      setCarregando(true);
      setErro('');
      await signInWithEmail(email, senha);
    } catch (error: any) {
      console.error('Error during login:', error);
      setErro(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setCarregando(false);
    }
  };

  const fazerCadastro = async () => {
    if (!email || !senha || !nome) {
      setErro('Preencha todos os campos');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    try {
      setCarregando(true);
      setErro('');
      await signUpWithEmail(email, senha, nome);
      
      // Mensagem dinâmica baseada na configuração
      const disableEmailConfirmation = import.meta.env.VITE_DISABLE_EMAIL_CONFIRMATION === 'true';
      if (disableEmailConfirmation) {
        setErro('Conta criada com sucesso! Você já pode fazer login.');
      } else {
        setErro('Conta criada com sucesso! Verifique seu e-mail para confirmar.');
      }
    } catch (error: any) {
      console.error('Error during signup:', error);
      setErro(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-arco-secondary flex flex-col justify-center px-4 font-dm-sans">
      <div className="max-w-sm mx-auto w-full">
        {/* Logo/Título */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <img src="/img/logo_arqueiria.jpg" alt="Logo Arqueiria Ibirapuera" className="w-24 h-24 object-cover rounded-full" />
          </div>
          <h1 className="text-2xl font-bold text-arco-primary">ArcoTrack</h1>
          <p className="text-arco-gray-700 text-base font-light">Acompanhe seus treinos de tiro com arco</p>
        </div>

        {/* Formulário */}
        <div className="space-y-5">
          {/* Nome (apenas no cadastro) */}
          {mostrarCadastro && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-arco-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full pl-12 pr-4 py-5 bg-white border border-arco-gray-300 rounded-2xl focus:outline-none focus:border-arco-accent focus:ring-2 focus:ring-arco-accent/20 transition-all duration-200 font-medium"
              />
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-arco-gray-500 w-5 h-5" />
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-5 bg-white border border-arco-gray-300 rounded-2xl focus:outline-none focus:border-arco-accent focus:ring-2 focus:ring-arco-accent/20 transition-all duration-200 font-medium"
              />
            </div>
            {mostrarCadastro && (
              <p className="text-xs text-arco-gray-600 px-2">
                💡 Use emails como: seuemail@arcotrack.com ou similar
              </p>
            )}
          </div>

          {/* Senha */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-arco-gray-500 w-5 h-5" />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full pl-12 pr-4 py-5 bg-white border border-arco-gray-300 rounded-2xl focus:outline-none focus:border-arco-accent focus:ring-2 focus:ring-arco-accent/20 transition-all duration-200 font-medium"
            />
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <div className={`${erro.includes('sucesso') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-2xl p-4`}>
              <p className={`${erro.includes('sucesso') ? 'text-green-600' : 'text-red-600'} text-sm font-light text-center`}>{erro}</p>
            </div>
          )}

          {/* Botão principal */}
          <button
            onClick={mostrarCadastro ? fazerCadastro : fazerLogin}
            disabled={carregando || loading}
            className="w-full bg-accent-gradient text-arco-primary font-bold py-5 rounded-2xl hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {carregando || loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span>{mostrarCadastro ? 'Criar Conta' : 'Entrar'}</span>
          </button>

          {/* Toggle cadastro/login */}
          <div className="text-center">
            <button
              onClick={() => {
                setMostrarCadastro(!mostrarCadastro);
                setErro('');
              }}
              className="text-arco-gray-700 hover:text-arco-primary transition-colors text-sm font-light"
            >
              {mostrarCadastro 
                ? 'Já tem uma conta? Fazer login' 
                : 'Não tem conta? Criar uma nova'
              }
            </button>
          </div>



          {/* Informações sobre o app */}
          <div className="text-center mt-8">
            <p className="text-arco-gray-600 text-sm font-light">
              Crie sua conta para sincronizar seus dados entre dispositivos e nunca perder seus treinos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
