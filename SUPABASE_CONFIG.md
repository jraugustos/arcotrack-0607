# Configuração do Supabase - Desabilitar Confirmação de Email

## Problema
O Supabase está enviando emails de confirmação para novos usuários, mas esses emails não levam a uma página de confirmação válida.

## Solução Implementada

### 1. Variável de Ambiente (Opção 1)
Foi adicionada a variável `VITE_DISABLE_EMAIL_CONFIRMATION=true` no arquivo `.env`.

### 2. Configuração Manual no Dashboard do Supabase (Opção 2)
Para desabilitar completamente a confirmação de email:

#### Passos:
1. Acesse o dashboard do Supabase: https://supabase.com/dashboard/project/fxsrjukmeelcxiltbkco
2. Vá para **Authentication** → **Settings**
3. Procure pela seção **Email confirmations**
4. **Desabilite** a opção "Enable email confirmations"
5. Salve as alterações

### 3. Service Role Key (Opcional)
Para usar a auto-confirmação via código, você precisa:

1. Acesse: https://supabase.com/dashboard/project/fxsrjukmeelcxiltbkco/settings/api
2. Copie a **service_role** key (não a anon key)
3. Substitua `your_service_role_key_here` no arquivo `.env` pela chave real

⚠️ **IMPORTANTE**: A service role key é sensível e deve ser mantida segura.

## Alternativa Mais Simples

Se você tem acesso ao dashboard do Supabase, a **Opção 2** é a mais simples e recomendada:

1. Desabilite "Enable email confirmations" no dashboard
2. Reinicie o servidor de desenvolvimento
3. Teste a criação de uma nova conta

## Testando a Solução

Após implementar qualquer uma das opções:

1. Execute `pnpm dev` para iniciar o servidor
2. Acesse a aplicação
3. Tente criar uma nova conta
4. Verifique se não há mais emails de confirmação sendo enviados
5. Verifique se o usuário consegue fazer login imediatamente

## Status Atual

✅ Variável de ambiente configurada
⚠️ Service role key precisa ser configurada manualmente
⚠️ Configuração do dashboard precisa ser feita manualmente

## Próximos Passos

1. Configure a service role key OU
2. Desabilite email confirmations no dashboard do Supabase
3. Teste a funcionalidade

Se você escolher a **Opção 2** (dashboard), remova ou comente as linhas relacionadas à service role key no arquivo `.env`.