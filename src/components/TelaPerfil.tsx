import React, { useState } from 'react';
import { useArcoTrack } from '../contexts/ArcoTrackContext';
import { useAuthContext } from '../contexts/AuthContext';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function TelaPerfil() {
  const { state, navegarPara } = useArcoTrack();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: state.usuario?.nome || '',
    email: state.usuario?.email || '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const voltarParaConfiguracoes = () => {
    navegarPara('configuracoes');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validarFormulario = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    // Validação de senha (apenas se estiver tentando alterar)
    if (formData.novaSenha || formData.confirmarSenha || formData.senhaAtual) {
      if (!formData.senhaAtual) {
        newErrors.senhaAtual = 'Senha atual é obrigatória para alterar a senha';
      }
      
      if (!formData.novaSenha) {
        newErrors.novaSenha = 'Nova senha é obrigatória';
      } else if (formData.novaSenha.length < 6) {
        newErrors.novaSenha = 'Nova senha deve ter pelo menos 6 caracteres';
      }

      if (formData.novaSenha !== formData.confirmarSenha) {
        newErrors.confirmarSenha = 'Senhas não coincidem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const salvarPerfil = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      // Atualizar perfil básico
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nome: formData.nome,
          email: formData.email
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Atualizar senha se fornecida
      if (formData.novaSenha) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.novaSenha
        });

        if (passwordError) throw passwordError;
      }

      // Limpar campos de senha
      setFormData(prev => ({
        ...prev,
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
      }));

      alert('Perfil atualizado com sucesso!');
      
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-arco-secondary font-dm-sans">
      {/* Header */}
      <div className="bg-black px-4 py-8 border-b-4" style={{borderImage: 'linear-gradient(to right, #43c6ac, #f8ffae) 1'}}>
        <div className="flex items-center space-x-4">
          <button
            onClick={voltarParaConfiguracoes}
            className="text-arco-secondary hover:text-arco-gray transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-arco-secondary">Perfil do Usuário</h1>
        </div>
      </div>

      <div className="px-4 py-8 space-y-6">
        {/* Avatar e informações básicas */}
        <div className="bg-white rounded-3xl p-6 border border-arco-gray-300/30">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-accent-gradient rounded-3xl flex items-center justify-center">
              <User className="w-10 h-10 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-arco-primary">{state.usuario?.nome}</h2>
              <p className="text-arco-gray-700 font-light">{state.usuario?.email}</p>
              <p className="text-sm text-arco-gray-500 mt-1">
                {state.treinos.length} {state.treinos.length === 1 ? 'treino registrado' : 'treinos registrados'}
              </p>
            </div>
          </div>
        </div>

        {/* Formulário de edição */}
        <div className="bg-white rounded-3xl p-6 border border-arco-gray-300/30">
          <h3 className="text-lg font-medium text-arco-primary mb-6">Informações Pessoais</h3>
          
          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-arco-gray-700 mb-2">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-arco-gray-400" />
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-gradient/20 ${
                    errors.nome ? 'border-red-300' : 'border-arco-gray-300'
                  }`}
                  placeholder="Seu nome completo"
                />
              </div>
              {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-sm font-medium text-arco-gray-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-arco-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-gradient/20 ${
                    errors.email ? 'border-red-300' : 'border-arco-gray-300'
                  }`}
                  placeholder="seu@email.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Alteração de senha */}
        <div className="bg-white rounded-3xl p-6 border border-arco-gray-300/30">
          <h3 className="text-lg font-medium text-arco-primary mb-6">Alterar Senha</h3>
          
          <div className="space-y-4">
            {/* Senha atual */}
            <div>
              <label className="block text-sm font-medium text-arco-gray-700 mb-2">
                Senha atual
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-arco-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.senhaAtual}
                  onChange={(e) => handleInputChange('senhaAtual', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-gradient/20 ${
                    errors.senhaAtual ? 'border-red-300' : 'border-arco-gray-300'
                  }`}
                  placeholder="Sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-arco-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-arco-gray-400" />
                  )}
                </button>
              </div>
              {errors.senhaAtual && <p className="text-red-500 text-sm mt-1">{errors.senhaAtual}</p>}
            </div>

            {/* Nova senha */}
            <div>
              <label className="block text-sm font-medium text-arco-gray-700 mb-2">
                Nova senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-arco-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.novaSenha}
                  onChange={(e) => handleInputChange('novaSenha', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-gradient/20 ${
                    errors.novaSenha ? 'border-red-300' : 'border-arco-gray-300'
                  }`}
                  placeholder="Nova senha (mínimo 6 caracteres)"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5 text-arco-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-arco-gray-400" />
                  )}
                </button>
              </div>
              {errors.novaSenha && <p className="text-red-500 text-sm mt-1">{errors.novaSenha}</p>}
            </div>

            {/* Confirmar nova senha */}
            <div>
              <label className="block text-sm font-medium text-arco-gray-700 mb-2">
                Confirmar nova senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-arco-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmarSenha}
                  onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-gradient/20 ${
                    errors.confirmarSenha ? 'border-red-300' : 'border-arco-gray-300'
                  }`}
                  placeholder="Confirme a nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-arco-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-arco-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmarSenha && <p className="text-red-500 text-sm mt-1">{errors.confirmarSenha}</p>}
            </div>
          </div>
        </div>

        {/* Botão salvar */}
        <button
          onClick={salvarPerfil}
          disabled={loading}
          className="w-full bg-accent-gradient text-black font-bold py-4 rounded-2xl hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>Salvar Alterações</span>
        </button>
      </div>
    </div>
  );
} 