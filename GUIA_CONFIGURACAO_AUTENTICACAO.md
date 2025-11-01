# 🔧 GUIA DE CONFIGURAÇÃO - SISTEMA DE AUTENTICAÇÃO

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### ✅ **FASE 1: CÓDIGO (CONCLUÍDA)**
- [x] Migration criada para autenticação sem verificação de email
- [x] AuthContext atualizado com funções de email/senha
- [x] Página de login atualizada com formulário tradicional
- [x] Página de cadastro criada
- [x] Rotas configuradas no App.tsx
- [x] Notificação pop-up implementada após cadastro
- [x] Documentação completa do fluxo criada

### 🔄 **FASE 2: CONFIGURAÇÃO DO SUPABASE (A FAZER)**
- [ ] Aplicar migration no banco de dados
- [ ] Desabilitar confirmação obrigatória de email
- [ ] Configurar Google OAuth Provider
- [ ] Testar triggers e funções

### 🔄 **FASE 3: CONFIGURAÇÃO DO GOOGLE CLOUD (A FAZER)**
- [ ] Criar/Atualizar OAuth 2.0 Client ID
- [ ] Configurar URLs de redirecionamento
- [ ] Copiar credenciais para o Supabase

---

## 📝 PASSO 1: APLICAR MIGRATION NO SUPABASE

### **Opção A: Via Supabase Dashboard (Mais Fácil)**

1. **Acesse o SQL Editor**:
   ```
   https://supabase.com/dashboard/project/wgycuyrkkqwwegazgvcb/sql/new
   ```

2. **Cole o conteúdo do arquivo**:
   ```
   supabase/migrations/20251101000000_email_password_auth_no_verification.sql
   ```

3. **Execute o SQL** clicando em "Run" ou `Ctrl+Enter`

4. **Verifique se foi executado com sucesso**:
   - Não deve aparecer nenhum erro
   - Verifique se as funções foram criadas

### **Opção B: Via Supabase CLI**

```bash
# Se ainda não tiver o CLI instalado
npm install -g supabase

# Fazer login no Supabase
supabase login

# Link do projeto local com o projeto remoto
supabase link --project-ref wgycuyrkkqwwegazgvcb

# Aplicar as migrations
supabase db push
```

---

## ⚙️ PASSO 2: CONFIGURAR AUTENTICAÇÃO NO SUPABASE

### **2.1 - Desabilitar Confirmação de Email**

1. **Acesse Authentication Settings**:
   ```
   https://supabase.com/dashboard/project/wgycuyrkkqwwegazgvcb/auth/settings
   ```

2. **Procure por "Email Auth"** e expanda a seção

3. **Configure os seguintes campos**:
   - ✅ **Enable Email Signup**: `ON` (ativado)
   - ❌ **Confirm Email**: `OFF` (desativado) ← **IMPORTANTE!**
   - **Minimum Password Length**: `6`
   - ✅ **Enable Email Provider**: `ON` (ativado)

4. **Clique em "Save"**

### **2.2 - Configurar Google OAuth**

1. **Acesse Authentication Providers**:
   ```
   https://supabase.com/dashboard/project/wgycuyrkkqwwegazgvcb/auth/providers
   ```

2. **Encontre "Google" na lista** e clique para expandir

3. **Anote a URL de Callback do Supabase** (você precisará dela no Google Cloud):
   ```
   https://wgycuyrkkqwwegazgvcb.supabase.co/auth/v1/callback
   ```

4. **NÃO PREENCHA AINDA** - Você precisará primeiro configurar no Google Cloud Console

---

## 🔐 PASSO 3: CONFIGURAR GOOGLE CLOUD CONSOLE

### **3.1 - Criar OAuth 2.0 Client ID**

1. **Acesse o Google Cloud Console**:
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Se não tiver um projeto, crie um**:
   - Clique em "Select a project" no topo
   - Clique em "NEW PROJECT"
   - Nome: `TitanJuros` (ou outro nome de sua escolha)
   - Clique em "CREATE"

3. **Ative a Google+ API** (necessário para OAuth):
   - Menu lateral → "Library"
   - Busque por "Google+ API"
   - Clique em "ENABLE"

4. **Configure a OAuth Consent Screen** (se ainda não tiver):
   - Menu lateral → "OAuth consent screen"
   - User Type: "External"
   - App name: `TitanJuros`
   - User support email: seu email
   - Developer contact: seu email
   - Clique em "SAVE AND CONTINUE"
   - Scopes: pode pular clicando "SAVE AND CONTINUE"
   - Test users: adicione seu email para testes
   - Clique em "SAVE AND CONTINUE"

5. **Criar Credenciais OAuth 2.0**:
   - Menu lateral → "Credentials"
   - Clique em "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: `Web application`
   - Name: `TitanJuros Web App`

6. **Adicionar URLs de Redirecionamento Autorizadas**:
   ```
   Authorized redirect URIs:
   
   1. https://wgycuyrkkqwwegazgvcb.supabase.co/auth/v1/callback
   2. http://localhost:8087/auth/v1/callback (para desenvolvimento local)
   ```

7. **Clique em "CREATE"**

8. **COPIE AS CREDENCIAIS** que aparecerem:
   - ✅ **Client ID**: (algo como `123456789-abc.apps.googleusercontent.com`)
   - ✅ **Client Secret**: (algo como `GOCSPX-abc123def456`)
   
   **IMPORTANTE**: Guarde estas credenciais em local seguro!

### **3.2 - Configurar Credenciais no Supabase**

1. **Volte para Supabase Authentication Providers**:
   ```
   https://supabase.com/dashboard/project/wgycuyrkkqwwegazgvcb/auth/providers
   ```

2. **Encontre "Google"** e expanda

3. **Preencha os campos**:
   - ✅ **Enable Google Provider**: `ON`
   - **Client ID**: Cole o Client ID que você copiou do Google Cloud
   - **Client Secret**: Cole o Client Secret que você copiou do Google Cloud

4. **Clique em "Save"**

---

## 🧪 PASSO 4: TESTAR O SISTEMA

### **4.1 - Preparar Ambiente de Testes**

1. **Limpar cache do navegador**:
   - Chrome: `Ctrl + Shift + Delete`
   - Selecione "Cached images and files"
   - Clique em "Clear data"

2. **Limpar localStorage** (abra o Console do navegador - F12):
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

3. **Iniciar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

### **4.2 - Teste 1: Cadastro com Email/Senha**

1. Acesse: `http://localhost:8087/cadastro`

2. Preencha o formulário:
   - Nome Completo: `Teste Usuario`
   - Email: `teste@exemplo.com`
   - Senha: `123456`
   - Confirmar Senha: `123456`
   - ✅ Aceitar termos

3. Clique em "Criar Conta Grátis"

4. **Verificar**:
   - ✅ Deve aparecer notificação: "🎉 Conta criada com sucesso!"
   - ✅ Deve aparecer notificação: "Você já pode fazer login..."
   - ✅ Deve fazer login automaticamente
   - ✅ Deve redirecionar para `/welcome`

5. **No Console (F12)**, deve aparecer:
   ```
   📝 Iniciando cadastro com email/senha...
   ✅ Cadastro realizado com sucesso: teste@exemplo.com
   🔄 Fazendo login automático...
   🔐 Iniciando login com email/senha...
   ✅ Login com email realizado com sucesso: teste@exemplo.com
   🔄 Auth state changed: SIGNED_IN teste@exemplo.com
   🎯 Redirecionando para /welcome após login
   ```

### **4.3 - Teste 2: Login com Email/Senha**

1. Fazer logout (se estiver logado)

2. Acesse: `http://localhost:8087/login`

3. Preencha o formulário de login:
   - Email: `teste@exemplo.com`
   - Senha: `123456`

4. Clique em "Entrar"

5. **Verificar**:
   - ✅ Deve fazer login com sucesso
   - ✅ Deve redirecionar para `/welcome` ou `/dashboard`

6. **No Console**, deve aparecer:
   ```
   🔐 Iniciando login com email/senha...
   ✅ Login com email realizado com sucesso: teste@exemplo.com
   🔄 Auth state changed: SIGNED_IN teste@exemplo.com
   ```

### **4.4 - Teste 3: Login com Google OAuth**

1. Fazer logout (se estiver logado)

2. Acesse: `http://localhost:8087/login`

3. Clique em "Continuar com Google"

4. **Verificar**:
   - ✅ Deve abrir popup do Google
   - ✅ Selecione sua conta Google
   - ✅ Autorize o acesso
   - ✅ Deve voltar para a aplicação
   - ✅ Deve estar logado
   - ✅ Deve redirecionar para `/welcome`

5. **No Console**, deve aparecer:
   ```
   🚀 Iniciando login com Google...
   ✅ Login com Google iniciado, aguardando callback...
   📱 URL de OAuth: https://accounts.google.com/o/oauth2/v2/auth?...
   🔄 Auth state changed: SIGNED_IN seuemail@gmail.com
   🎯 Redirecionando para /welcome após login
   ```

6. **Se aparecer erro ou retornar para `/login`**:
   - Verifique se Client ID e Secret estão corretos no Supabase
   - Verifique se as URLs de callback estão corretas no Google Cloud
   - Verifique no Console se há mensagens de erro

### **4.5 - Teste 4: Verificar Teste Grátis**

1. Após fazer login (qualquer método), acesse: `http://localhost:8087/dashboard`

2. Deve mostrar um banner ou indicação de teste grátis ativo

3. **Verificar no banco de dados** (Supabase SQL Editor):
   ```sql
   -- Verificar perfil criado
   SELECT * FROM profiles 
   WHERE email = 'teste@exemplo.com';
   
   -- Verificar assinatura de teste
   SELECT * FROM user_subscriptions 
   WHERE user_id IN (
     SELECT user_id FROM profiles WHERE email = 'teste@exemplo.com'
   );
   ```

4. **Deve retornar**:
   - Profile com `email_verified = true`
   - Subscription com `status = 'trial'`, `is_trial = true`
   - `trial_ends_at` deve ser 7 dias após `trial_starts_at`

---

## 🔍 PASSO 5: TROUBLESHOOTING

### **Problema: Google OAuth retorna para /login**

**Possíveis causas**:
1. Client ID ou Secret incorretos no Supabase
2. URLs de callback não configuradas corretamente no Google Cloud
3. Google+ API não está habilitada

**Solução**:
1. Verifique as credenciais no Supabase Dashboard
2. Verifique as URLs no Google Cloud Console
3. Habilite a Google+ API
4. Aguarde 5 minutos após configurar (propagação das mudanças)

### **Problema: Erro "Email not confirmed" ao fazer login**

**Causa**: A configuração "Confirm Email" ainda está ativada no Supabase

**Solução**:
1. Acesse: `https://supabase.com/dashboard/project/wgycuyrkkqwwegazgvcb/auth/settings`
2. Desative "Confirm Email"
3. Execute a migration para atualizar usuários existentes

### **Problema: Erro ao criar conta**

**Possíveis causas**:
1. Migration não foi aplicada
2. Triggers não foram criados
3. Permissões RLS incorretas

**Solução**:
1. Execute a migration manualmente
2. Verifique se as funções foram criadas:
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_schema = 'public'
   AND routine_name LIKE '%user%';
   ```

### **Problema: Não redireciona para /welcome após login**

**Causa**: AuthContext não está detectando o evento SIGNED_IN

**Solução**:
1. Abra o Console do navegador (F12)
2. Verifique se aparecem os logs do AuthContext
3. Verifique se `navigate` está funcionando corretamente
4. Limpe cache e localStorage

---

## ✅ CHECKLIST FINAL

Antes de considerar tudo configurado, verifique:

- [ ] Migration aplicada com sucesso no Supabase
- [ ] "Confirm Email" desativado no Supabase Auth Settings
- [ ] Google OAuth Client ID criado no Google Cloud
- [ ] URLs de callback configuradas no Google Cloud
- [ ] Client ID e Secret configurados no Supabase
- [ ] Teste de cadastro com email/senha funcionando
- [ ] Teste de login com email/senha funcionando
- [ ] Teste de login com Google funcionando
- [ ] Notificação pop-up aparece após cadastro
- [ ] Redirecionamento para /welcome funciona
- [ ] Teste grátis é criado automaticamente
- [ ] Perfil é criado automaticamente
- [ ] Console sem erros críticos

---

## 📞 SUPORTE

Se encontrar problemas que não consegue resolver:

1. **Verifique os logs do Console** (F12) - eles têm emojis para facilitar
2. **Verifique o Supabase SQL Editor** - execute queries para debug
3. **Limpe cache e localStorage** - muitos problemas são resolvidos assim
4. **Teste em aba anônima** - para garantir que não é cache

---

**Documento criado em**: 01/11/2025  
**Última atualização**: 01/11/2025  
**Status**: ✅ Pronto para configuração
