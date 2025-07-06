# 🔐 Guia de Integração - ArcoTrack v4.0

## Supabase + Autenticação Email/Senha

---

## 📋 **Visão Geral**

O ArcoTrack v4.0 agora possui autenticação simples por email/senha e persistência de dados via Supabase, eliminando a dependência do localStorage e oferecendo sincronização entre dispositivos.

### 🚀 **Funcionalidades Implementadas:**

✅ **Autenticação por Email/Senha**  
✅ **Base de dados Supabase com RLS (Row Level Security)**  
✅ **Sincronização automática de dados**  
✅ **Proteção de rotas e dados por usuário**  
✅ **Backup automático na nuvem**  
✅ **Hooks customizados para CRUD operations**  
✅ **Sistema de cadastro e login integrado**

---

## 🗄️ **1. Configuração do Supabase**

### **1.1 Criar Projeto Supabase**

1. Acesse [Supabase](https://supabase.com/)
2. Clique em **"New Project"**
3. Configure:
   - **Organization**: Sua organização
   - **Name**: `arcotrack-production`
   - **Database Password**: senha segura
   - **Region**: escolha a região mais próxima

### **1.2 Configurar Autenticação por Email**

1. No painel Supabase, vá para **Authentication** → **Settings**
2. Configure:
   - **Enable email confirmations**: Ativado (recomendado)
   - **Minimum password length**: 6 caracteres
   - **Enable sign ups**: Ativado

### **1.3 Executar o Schema SQL**

1. No painel Supabase, vá para **SQL Editor**
2. Execute o conteúdo do arquivo `supabase_schema.sql`
3. Verifique se todas as tabelas foram criadas com sucesso

### **1.4 Obter as Credenciais**

No painel **Settings** → **API**, copie:
- **Project URL**: `https://seu-projeto.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key**: (opcional, para operações administrativas)

---

## 🔧 **2. Configuração das Variáveis de Ambiente**

### **2.1 Arquivo .env**

Crie/edite o arquivo `.env` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (opcional)

# Aplicação
VITE_APP_URL=http://localhost:5173
```

### **2.2 Produção**

Para deploy em produção, configure as mesmas variáveis no seu provedor de hospedagem (Vercel, Netlify, etc.).

---

## 🏗️ **4. Estrutura do Banco de Dados**

### **4.1 Tabelas Criadas**

| Tabela | Descrição | Chaves |
|--------|-----------|--------|
| `profiles` | Perfis dos usuários | `id` (FK para auth.users) |
| `treinos` | Registros de treinos | `id`, `user_id` |
| `series` | Séries dentro de treinos | `id`, `treino_id` |
| `flechas` | Flechas individuais | `id`, `serie_id` |
| `autoavaliacoes` | Autoavaliações técnicas | `id`, `treino_id` |

### **4.2 Row Level Security (RLS)**

Todas as tabelas possuem políticas RLS que garantem:
- ✅ Usuários só acessam seus próprios dados
- ✅ Inserção automática de `user_id`
- ✅ Proteção contra acesso não autorizado

---

## 🧪 **4. Teste da Integração**

### **4.1 Desenvolvimento Local**

```bash
# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm dev

# Acessar http://localhost:5173
```

### **4.2 Fluxo de Teste**

1. **Cadastro**: Clique em "Não tem conta? Criar uma nova"
2. **Criar Conta**: Preencha nome, email e senha (mín. 6 caracteres)
3. **Confirmação**: Verifique email de confirmação (se habilitado)
4. **Login**: Faça login com email e senha
5. **Dados**: Verifique se o perfil do usuário aparece
6. **Treino**: Crie um treino e confirme salvamento no Supabase
7. **Sincronização**: Acesse de outro dispositivo para verificar dados

---

## 🚨 **5. Solução de Problemas**

### **5.1 Erros Comuns**

| Erro | Causa | Solução |
|------|-------|---------|
| `Invalid email or password` | Credenciais incorretas | Verificar email e senha |
| `Email not confirmed` | Email não confirmado | Verificar caixa de entrada |
| `401 Unauthorized` | Supabase keys incorretas | Verificar URL e Anon Key |
| `Row Level Security` | Políticas RLS muito restritivas | Verificar se o SQL foi executado |
| `Password too short` | Senha com menos de 6 caracteres | Usar senha mais longa |

### **6.2 Debug**

Para ativar logs de debug:

```javascript
// No useAuth.ts ou useTreinos.ts
console.log('Auth state:', { user, session });
console.log('Supabase operation:', data, error);
```

---

## 📱 **6. Deploy e Produção**

### **6.1 Build**

```bash
# Build para produção
pnpm build

# Deploy do diretório dist/
```

### **6.2 Configuração de Produção**

1. **Supabase**: Configurar CORS para o domínio de produção
2. **Variáveis de Ambiente**: Configurar no provedor de hospedagem
3. **Email Provider**: Configurar provedor de email no Supabase (opcional)

---

## 🎯 **8. Funcionalidades Avançadas**

### **8.1 Backup Automático**
- ✅ Todos os dados são salvos automaticamente no Supabase
- ✅ Não há dependência do localStorage

### **8.2 Sincronização Multi-Dispositivo**
- ✅ Login em qualquer dispositivo acessa os mesmos dados
- ✅ Atualizações em tempo real (opcional)

### **8.3 Offline Support** (Futuro)
- 🔄 Cache local com sincronização posterior
- 🔄 PWA para uso offline

---

## 📞 **9. Suporte**

### **Recursos Úteis:**

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

### **Contato:**
- **Desenvolvedor**: MiniMax Agent
- **Versão**: ArcoTrack v4.0
- **Data**: 2025-07-02

---

## ✅ **Status da Implementação**

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Autenticação Email/Senha | ✅ Implementado | Login/logout/cadastro funcionais |
| Supabase Client | ✅ Implementado | CRUD completo |
| Hooks customizados | ✅ Implementado | `useAuth`, `useTreinos` |
| Context atualizado | ✅ Implementado | Compatibilidade mantida |
| RLS e segurança | ✅ Implementado | Políticas ativas |
| Migração de dados | ✅ Implementado | localStorage → Supabase |
| Interface atualizada | ✅ Implementado | Login simplificado |
| Documentação | ✅ Implementado | Guia completo |

**🎉 ArcoTrack v4.0 está pronto para produção!**
