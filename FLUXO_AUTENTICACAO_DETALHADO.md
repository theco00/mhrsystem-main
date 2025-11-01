# 🔐 FLUXO DE AUTENTICAÇÃO - SISTEMA COMPLETO

## 📊 VISÃO GERAL DO SISTEMA

### **Métodos de Autenticação**
1. ✅ **Login com Google OAuth** (já implementado, mas com problema de redirecionamento)
2. ✅ **Login com Email/Senha** (a implementar)
3. ✅ **Cadastro com Email/Senha** (a implementar)

### **Características Principais**
- ❌ **Sem verificação obrigatória de email** - Usuários podem entrar imediatamente
- ✅ **Notificação pop-up** após cadastro informando que já pode entrar
- ✅ **Período de teste grátis de 7 dias** para todos os novos usuários
- ✅ **Sistema de assinaturas** integrado

---

## 🗺️ FLUXO DETALHADO POR ROTA

### **Rota: `/` (Landing Page)**
**Condição**: Usuário **NÃO** autenticado
- Exibe a landing page do produto
- Botões: "Entrar" (→ `/login`) e "Começar Agora" (→ `/login`)

**Condição**: Usuário **autenticado**
- Redireciona automaticamente para `/dashboard`

---

### **Rota: `/login` (Página de Login)**
**Condição**: Usuário **NÃO** autenticado
- Exibe formulário com 3 opções:
  1. **Login com Google** (botão azul com logo do Google)
  2. **Login com Email/Senha** (formulário tradicional)
  3. **Link para Cadastro** ("Não tem conta? Cadastre-se")

**Condição**: Usuário **autenticado**
- Redireciona automaticamente para `/dashboard`

#### **Fluxo: Login com Google**
```
1. Usuário clica "Continuar com Google"
2. Abre popup de autenticação do Google
3. Usuário autoriza o acesso
4. Google redireciona para: https://wgycuyrkkqwwegazgvcb.supabase.co/auth/v1/callback
5. Supabase processa callback:
   - Cria/atualiza usuário na tabela auth.users
   - Trigger: handle_new_user() → Cria perfil em profiles
   - Trigger: sync_google_profile() → Sincroniza dados do Google
   - Trigger: start_free_trial() → Inicia teste grátis de 7 dias
6. AuthContext detecta SIGNED_IN event
7. Redireciona para /welcome
```

**Problema Atual**: Após callback, usuário é redirecionado de volta para `/login`  
**Causa**: Falta de configuração correta no Google Cloud Console ou no Supabase  
**Solução**: Verificar URLs de callback no Google OAuth Client

#### **Fluxo: Login com Email/Senha**
```
1. Usuário preenche email e senha
2. Clica em "Entrar"
3. Chamada: supabase.auth.signInWithPassword({ email, password })
4. Supabase valida credenciais
5. Se OK:
   - Retorna session e user
   - AuthContext atualiza estado
   - Redireciona para /welcome (se primeiro login) ou /dashboard
6. Se ERRO:
   - Exibe mensagem de erro
   - Mantém na tela de login
```

---

### **Rota: `/cadastro` (Página de Cadastro)**
**Condição**: Usuário **NÃO** autenticado
- Exibe formulário de cadastro:
  - Nome completo
  - Email
  - Senha (mínimo 6 caracteres)
  - Confirmar senha
  - Checkbox: "Li e aceito os Termos de Uso"

**Condição**: Usuário **autenticado**
- Redireciona para `/dashboard`

#### **Fluxo: Cadastro com Email/Senha**
```
1. Usuário preenche formulário
2. Valida campos:
   - Email válido
   - Senha >= 6 caracteres
   - Senhas coincidem
   - Termos aceitos
3. Clica em "Criar Conta"
4. Chamada: supabase.auth.signUp({
     email,
     password,
     options: {
       emailRedirectTo: `${window.location.origin}/welcome`,
       data: { full_name: nome }
     }
   })
5. Supabase cria usuário:
   - Adiciona em auth.users (email_confirmed_at = NOW) ← IMPORTANTE!
   - Trigger: handle_new_user() → Cria perfil
   - Trigger: start_free_trial() → Inicia teste grátis
6. ✅ Exibe NOTIFICAÇÃO POP-UP:
   "Conta criada com sucesso! 🎉
    Você já pode fazer login e começar a usar o sistema.
    Não é necessário confirmar seu email."
7. Aguarda 3 segundos
8. Faz login automático:
   - Chamada: supabase.auth.signInWithPassword({ email, password })
9. Redireciona para /welcome
```

---

### **Rota: `/welcome` (Boas-vindas)**
**Condição**: Usuário **autenticado**
- Exibe página de boas-vindas com seleção de planos
- Mostra informação do teste grátis ativo
- Opções: Escolher plano pago ou continuar com teste grátis

**Condição**: Usuário **NÃO** autenticado
- Redireciona para `/login`

#### **Fluxo na Welcome Page**
```
1. Verifica se é primeiro login (is_first_login())
2. Se SIM: Marca como completo (mark_first_login_completed())
3. Exibe informações do teste grátis:
   - "Você tem X dias de teste grátis restantes"
4. Usuário escolhe:
   OPÇÃO A: Continuar com teste → /dashboard
   OPÇÃO B: Escolher plano pago → Fluxo de pagamento → /thank-you
```

---

### **Rota: `/dashboard` (Dashboard Principal)**
**Condição**: Usuário **autenticado** + **Assinatura ativa** (trial ou paga)
- Exibe dashboard completo do sistema
- Acesso a todas as funcionalidades

**Condição**: Usuário **autenticado** + **Assinatura expirada**
- Redireciona para `/subscription-required`

**Condição**: Usuário **NÃO** autenticado
- Redireciona para `/login`

---

### **Rota: `/subscription-required` (Assinatura Necessária)**
- Exibe mensagem de que o teste grátis expirou
- Opções para escolher plano de assinatura
- Botão "Escolher Plano" → Página de pagamento

---

### **Rota: `/thank-you` (Agradecimento pós-compra)**
- Exibe confirmação de pagamento
- Botão "Ir para Dashboard" → `/dashboard`

---

## 🔄 EVENTOS DE AUTENTICAÇÃO (AuthContext)

### **SIGNED_IN**
```typescript
event: 'SIGNED_IN'
Quando: Usuário faz login (Google ou Email/Senha)
Ação:
  - Atualizar state: user, session
  - Se currentPath === '/login' ou '/':
    - navigate('/welcome')
  - Senão:
    - Manter na página atual
```

### **SIGNED_OUT**
```typescript
event: 'SIGNED_OUT'
Quando: Usuário faz logout
Ação:
  - Limpar state: user = null, session = null
  - Se currentPath !== '/login':
    - navigate('/login')
```

### **TOKEN_REFRESHED**
```typescript
event: 'TOKEN_REFRESHED'
Quando: Token de acesso é renovado automaticamente
Ação: Log para debug
```

### **USER_UPDATED**
```typescript
event: 'USER_UPDATED'
Quando: Dados do usuário são atualizados
Ação: Atualizar state com novos dados
```

---

## 📋 ESTRUTURA DE TABELAS DO BANCO DE DADOS

### **Tabela: `auth.users` (Supabase Auth)**
```sql
- id (UUID, PK)
- email (TEXT, UNIQUE)
- encrypted_password (TEXT)
- email_confirmed_at (TIMESTAMP) ← SEMPRE preenchido no cadastro!
- raw_user_meta_data (JSONB) → { full_name, avatar_url, provider }
- created_at (TIMESTAMP)
```

### **Tabela: `public.profiles`**
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users.id)
- full_name (TEXT)
- email (TEXT)
- avatar_url (TEXT)
- provider (TEXT) → 'email' | 'google'
- google_id (TEXT, UNIQUE)
- first_login_completed (BOOLEAN, DEFAULT FALSE)
- email_verified (BOOLEAN, DEFAULT FALSE)
- test_start_date (TIMESTAMP)
- test_end_date (TIMESTAMP)
- is_test_active (BOOLEAN, DEFAULT TRUE)
- test_days (INTEGER, DEFAULT 7)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### **Tabela: `public.user_subscriptions`**
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users.id)
- status (TEXT) → 'trial' | 'active' | 'inactive' | 'cancelled' | 'expired'
- plan (TEXT) → 'test_7days' | 'monthly' | 'quarterly' | 'semiannual'
- is_trial (BOOLEAN)
- trial_starts_at (TIMESTAMP)
- trial_ends_at (TIMESTAMP)
- trial_days (INTEGER)
- payment_id (TEXT)
- payment_date (TIMESTAMP)
- expiry_date (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

## 🔑 FUNÇÕES DO BANCO DE DADOS

### **handle_new_user() - Trigger AFTER INSERT on auth.users**
```sql
Objetivo: Criar perfil automaticamente quando novo usuário é criado
Ações:
  1. INSERT INTO profiles (id, user_id, full_name, email_verified, first_login_completed)
  2. INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'user')
```

### **sync_google_profile() - Trigger AFTER INSERT/UPDATE on auth.users**
```sql
Objetivo: Sincronizar dados do Google após login OAuth
Condição: raw_user_meta_data->>'provider' = 'google'
Ações:
  1. UPDATE profiles SET google_id, avatar_url, provider WHERE user_id = NEW.id
```

### **start_free_trial() - Trigger BEFORE INSERT on profiles**
```sql
Objetivo: Iniciar teste grátis automaticamente
Ações:
  1. NEW.test_start_date := NOW()
  2. NEW.test_end_date := NOW() + INTERVAL '7 days'
  3. NEW.is_test_active := TRUE
```

### **is_trial_active(user_uuid UUID) RETURNS BOOLEAN**
```sql
Objetivo: Verificar se teste está ativo
Retorna: TRUE se teste ativo e não expirado
```

---

## 🛡️ SEGURANÇA E CONFIGURAÇÕES

### **Supabase Auth Settings**
```
Email Auth: ✅ Enabled
Confirm Email: ❌ DISABLED ← IMPORTANTE!
Enable Signup: ✅ Enabled
Minimum Password Length: 6

Google OAuth: ✅ Enabled
Client ID: [do Google Cloud Console]
Client Secret: [do Google Cloud Console]
Redirect URLs: https://wgycuyrkkqwwegazgvcb.supabase.co/auth/v1/callback
```

### **Google Cloud Console - OAuth 2.0**
```
Application Type: Web application
Authorized redirect URIs:
  - https://wgycuyrkkqwwegazgvcb.supabase.co/auth/v1/callback
  - http://localhost:8087/auth/v1/callback (para desenvolvimento)
```

---

## 🎯 CHECKLIST DE IMPLEMENTAÇÃO

### ✅ **Fase 1: Configuração do Banco**
- [ ] Migration: Desabilitar verificação obrigatória de email
- [ ] Migration: Garantir que email_confirmed_at seja preenchido no cadastro
- [ ] Verificar triggers: handle_new_user, start_free_trial, sync_google_profile

### ✅ **Fase 2: AuthContext**
- [ ] Adicionar função: signUpWithEmail(email, password, fullName)
- [ ] Adicionar função: signInWithEmail(email, password)
- [ ] Melhorar tratamento de eventos SIGNED_IN
- [ ] Adicionar logs detalhados para debug

### ✅ **Fase 3: Página de Login**
- [ ] Adicionar formulário de login com email/senha
- [ ] Adicionar link para página de cadastro
- [ ] Manter botão de Google OAuth
- [ ] Melhorar UX com mensagens de erro claras

### ✅ **Fase 4: Página de Cadastro**
- [ ] Criar nova página /cadastro
- [ ] Formulário: Nome, Email, Senha, Confirmar Senha
- [ ] Validação client-side
- [ ] Integrar com signUpWithEmail
- [ ] Implementar notificação pop-up pós-cadastro

### ✅ **Fase 5: Correção Google OAuth**
- [ ] Verificar configuração no Supabase Dashboard
- [ ] Verificar configuração no Google Cloud Console
- [ ] Testar fluxo completo de login
- [ ] Corrigir redirecionamento após callback

### ✅ **Fase 6: Testes**
- [ ] Teste: Cadastro com email/senha
- [ ] Teste: Login com email/senha
- [ ] Teste: Login com Google
- [ ] Teste: Notificação pop-up aparece
- [ ] Teste: Redirecionamento para /welcome funciona
- [ ] Teste: Sistema de teste grátis inicia automaticamente

---

## 🚀 PRÓXIMOS PASSOS

1. **Configurar Supabase**: Desabilitar confirmação de email obrigatória
2. **Criar migration**: Ajustar banco de dados
3. **Atualizar AuthContext**: Adicionar funções de email/senha
4. **Criar página de cadastro**: Nova rota `/cadastro`
5. **Atualizar página de login**: Adicionar formulário tradicional
6. **Testar Google OAuth**: Corrigir problema de redirecionamento
7. **Implementar notificação**: Toast após cadastro bem-sucedido

---

**Documento criado em**: 01/11/2025  
**Última atualização**: 01/11/2025  
**Status**: 📝 Em implementação
