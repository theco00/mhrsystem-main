# 🔧 Guia de Configuração - MAILERSEND_API_KEY no Supabase Dashboard

## 📋 Passo a Passo para Configurar a API Key

### **1. Acessar o Supabase Dashboard**
1. Acesse: https://supabase.com/dashboard
2. Faça login com suas credenciais
3. Selecione o projeto: `pdxlmhfvwbdohouspboe`

### **2. Navegar para Edge Functions Settings**
1. No menu lateral, clique em **"Edge Functions"**
2. Clique no botão **"Settings"** ou **"Manage secrets"**
3. Ou navegue diretamente para: https://supabase.com/dashboard/project/pdxlmhfvwbdohouspboe/settings/functions

### **3. Adicionar a Variável de Ambiente**
1. Procure pela seção **"Environment Variables"** ou **"Secrets"**
2. Clique em **"Add new secret"** ou **"New variable"**
3. Configure:
   - **Name/Key**: `MAILERSEND_API_KEY`
   - **Value**: Sua chave da API do MailerSend (formato: `mlsn.xxxxxxxxxxxxxxxxxxxxxxx`)

### **4. Obter a API Key do MailerSend**
Se você ainda não tem uma API key do MailerSend:

1. Acesse: https://app.mailersend.com/
2. Faça login ou crie uma conta
3. Vá para **"Settings"** > **"API Tokens"**
4. Clique em **"Generate new token"**
5. Configure as permissões necessárias (Email sending)
6. Copie a chave gerada (formato: `mlsn.xxxxxxxxxxxxxxxxxxxxxxx`)

### **5. Verificar Domínio (Importante)**
Para que os emails sejam enviados com sucesso:

1. No MailerSend, vá para **"Domains"**
2. Adicione e verifique o domínio `tigerfinance.com`
3. Ou use um domínio já verificado
4. Configure os registros DNS conforme instruído

## ✅ **Verificação da Configuração**

### **Após configurar a API key:**
1. A função `send-loan-notification` deve funcionar corretamente
2. Os emails serão enviados via MailerSend
3. Você pode monitorar os logs no Supabase Dashboard

### **Para testar:**
```bash
# Execute o script de teste
node test-mailersend-notification.js
```

## 🔍 **Monitoramento**

### **Logs no Supabase:**
1. Vá para **Edge Functions** > **send-loan-notification**
2. Clique na aba **"Logs"**
3. Monitore as execuções e possíveis erros

### **Logs no MailerSend:**
1. Acesse o dashboard do MailerSend
2. Vá para **"Activity"** para ver os emails enviados
3. Monitore entregas, aberturas e cliques

## 🚨 **Possíveis Problemas**

### **1. Domínio não verificado**
- **Erro**: "The domain is not verified"
- **Solução**: Verificar o domínio no MailerSend

### **2. API Key inválida**
- **Erro**: "Unauthorized" ou "Invalid API key"
- **Solução**: Verificar se a chave foi copiada corretamente

### **3. Rate Limit**
- **Erro**: "Too many requests"
- **Solução**: Aguardar ou fazer upgrade do plano

## 📊 **Status Atual**

- ✅ **Supabase CLI**: Instalado e configurado
- ✅ **Função deployada**: send-loan-notification está no ar
- ⚠️ **API Key**: Aguardando configuração manual
- ⚠️ **Domínio**: Precisa ser verificado no MailerSend

## 🎯 **Próximos Passos**

1. **Configure a MAILERSEND_API_KEY** (manual no dashboard)
2. **Verifique o domínio** no MailerSend
3. **Teste a função** com dados reais
4. **Monitore os logs** para garantir funcionamento

---

**Observação**: A configuração da API key deve ser feita manualmente no Supabase Dashboard por questões de segurança.