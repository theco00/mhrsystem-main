# 🔧 Guia de Resolução - Erro `net::ERR_ABORTED` na Função `send-loan-notification`

## 📋 Resumo do Problema

O erro `net::ERR_ABORTED https://pdxlmhfvwbdohouspboe.supabase.co/functions/v1/send-loan-notification` indica que a Edge Function do Supabase está falhando ao processar requisições de envio de notificações por email.

## 🔍 Problemas Identificados

### 1. **RESEND_API_KEY Não Configurada** ⚠️
- A variável de ambiente `RESEND_API_KEY` não está configurada no Supabase
- Isso causa falha na inicialização do cliente Resend
- **Status**: ❌ Crítico - Impede o funcionamento da função

### 2. **Rate Limit Exceeded** ⚠️
- Durante os testes, identificamos erro de rate limit (429)
- O Resend API tem limite de 2 requisições por segundo no plano gratuito
- **Status**: ⚠️ Moderado - Afeta uso intensivo

### 3. **Falta de Validações Robustas** ⚠️
- A função original não validava adequadamente os dados de entrada
- Ausência de tratamento específico para diferentes tipos de erro
- **Status**: ✅ Resolvido - Implementadas validações completas

### 4. **Logs Insuficientes** ⚠️
- Dificuldade para diagnosticar problemas devido à falta de logs detalhados
- **Status**: ✅ Resolvido - Implementados logs informativos

## 🛠️ Correções Implementadas

### ✅ 1. Melhorias na Edge Function (`supabase/functions/send-loan-notification/index.ts`)

```typescript
// ✅ Validação da RESEND_API_KEY
const resendApiKey = Deno.env.get('RESEND_API_KEY');
if (!resendApiKey) {
  console.error('❌ RESEND_API_KEY não configurada');
  return new Response(/* erro 500 */);
}

// ✅ Validação de método HTTP
if (req.method === 'OPTIONS') {
  return new Response(null, { status: 200, headers: corsHeaders });
}

if (req.method !== 'POST') {
  return new Response(/* erro 405 */);
}

// ✅ Validações de dados de entrada
const missingFields = Object.entries(requiredFields)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingFields.length > 0) {
  return new Response(/* erro 400 com campos ausentes */);
}

// ✅ Validação de formato de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(clientEmail)) {
  return new Response(/* erro 400 */);
}

// ✅ Timeout para requisições
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 15000);

// ✅ Tratamento específico de erros
if (error.name === 'AbortError') {
  return new Response(/* erro 408 - timeout */);
}

if (error.message?.includes('API key') || error.message?.includes('unauthorized')) {
  return new Response(/* erro 401 - autenticação */);
}
```

### ✅ 2. Melhorias no Hook Cliente (`src/hooks/useCompanySettings.ts`)

```typescript
// ✅ Logs detalhados
console.log('📤 Enviando notificação de empréstimo:', {
  clientName, clientEmail, loanAmount, installmentValue, dueDate
});

// ✅ Tratamento específico de erros
let errorMessage = 'Erro desconhecido ao enviar notificação';

if (error.message?.includes('rate_limit_exceeded')) {
  errorMessage = 'Muitas tentativas. Aguarde alguns segundos e tente novamente.';
} else if (error.message?.includes('unauthorized') || error.message?.includes('API key')) {
  errorMessage = 'Problema de configuração do serviço de email. Contate o administrador.';
} else if (error.message?.includes('timeout')) {
  errorMessage = 'Timeout na requisição. Tente novamente.';
}
```

### ✅ 3. Script de Teste Abrangente (`test-loan-notification.js`)

- Teste com dados válidos
- Teste com dados inválidos (validação)
- Teste de CORS (OPTIONS request)
- Logs detalhados para diagnóstico

## 🚀 Passos para Resolução Completa

### 1. **Configurar RESEND_API_KEY no Supabase** (CRÍTICO)

```bash
# 1. Acesse o Supabase Dashboard
# 2. Vá para: Project Settings > Edge Functions
# 3. Adicione a variável de ambiente:
#    Nome: RESEND_API_KEY
#    Valor: re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. **Instalar e Configurar Supabase CLI**

```bash
# Instalar Supabase CLI
npm install -g @supabase/cli

# Fazer login
supabase login

# Linkar projeto local
supabase link --project-ref pdxlmhfvwbdohouspboe
```

### 3. **Deploy da Função Atualizada**

```bash
# Deploy da função com as melhorias
supabase functions deploy send-loan-notification

# Verificar logs
supabase functions logs send-loan-notification
```

### 4. **Testar a Função**

```bash
# Executar script de teste
node test-loan-notification.js

# Ou testar manualmente via Dashboard
# Supabase Dashboard > Edge Functions > send-loan-notification > Invoke
```

## 📊 Resultados dos Testes

### ✅ CORS Configurado Corretamente
- Status: 200 ✅
- Headers: `access-control-allow-origin: *` ✅
- Métodos: `POST, OPTIONS` ✅

### ⚠️ Rate Limit Identificado
- Erro: `rate_limit_exceeded` (429)
- Limite: 2 requisições/segundo (Resend gratuito)
- **Solução**: Implementar retry com backoff ou upgrade do plano Resend

### ✅ Validações Funcionando
- Campos obrigatórios: ✅ Detectados
- Formato de email: ✅ Validado
- Logs informativos: ✅ Implementados

## 🔄 Monitoramento e Manutenção

### Logs para Acompanhar
```bash
# Logs da Edge Function
supabase functions logs send-loan-notification --follow

# Logs do cliente (browser console)
# Procurar por: 📤, ✅, ❌ nos logs do navegador
```

### Métricas Importantes
- Taxa de sucesso de envios
- Tempo de resposta da função
- Erros de rate limit
- Falhas de autenticação

## 🎯 Próximos Passos Recomendados

1. **Configurar RESEND_API_KEY** (Prioridade Alta)
2. **Fazer deploy da função atualizada**
3. **Testar em ambiente de produção**
4. **Considerar upgrade do plano Resend se necessário**
5. **Implementar retry automático para rate limits**
6. **Configurar alertas para falhas de email**

## 📞 Suporte

Se os problemas persistirem após seguir este guia:

1. Verifique os logs no Supabase Dashboard
2. Execute o script de teste para diagnóstico
3. Verifique se todas as variáveis de ambiente estão configuradas
4. Confirme se a função foi deployada corretamente

---

**Status da Resolução**: 🟡 Parcialmente Resolvido
- ✅ Código melhorado e validações implementadas
- ⚠️ Aguardando configuração do RESEND_API_KEY
- ⚠️ Rate limit identificado (requer atenção)