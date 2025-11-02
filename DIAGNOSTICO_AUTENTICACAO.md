# 🔍 DIAGNÓSTICO: Problema de Autenticação

## ❌ Problema Reportado
Quando faz login com conta diferente, os dados do usuário NÃO são salvos no banco de dados, causando loop de login infinito.

## 🎯 Análise Técnica

### 1. Trigger de Criação de Usuário

**Arquivo**: `supabase/migrations/20251101000000_email_password_auth_no_verification.sql`

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Função**: `handle_new_user()`
- Deveria criar registro em `profiles`
- Deveria criar registro em `user_roles`
- Deveria criar registro em `user_subscriptions`

### 2. Possíveis Causas do Problema

#### ❌ Causa 1: Constraint Conflict
```sql
INSERT INTO public.profiles (
    id,        -- ← Problema: id já existe como PRIMARY KEY?
    user_id,   -- ← user_id UNIQUE constraint?
    ...
)
```

#### ❌ Causa 2: Colunas Inexistentes
A função assume que existem:
- `email_verified`
- `google_id`  
- `provider`
- `first_login_completed`

Se essas colunas não existem na tabela `profiles`, a inserção falhará.

#### ❌ Causa 3: Trigger Não Dispara
- Múltiplas migrations podem ter sobrescrito o trigger
- Trigger pode não ter permissões corretas

### 3. Fluxo de Autenticação Atual

```
1. Usuário faz login (Google ou Email)
   ↓
2. Supabase Auth cria registro em auth.users
   ↓
3. Trigger on_auth_user_created DEVE disparar
   ↓
4. Função handle_new_user() DEVE:
   - Criar profiles
   - Criar user_roles
   - Criar user_subscriptions
   ↓
5. Se FALHAR: usuário não tem perfil
   ↓
6. useSubscription.ts não encontra subscription
   ↓
7. ProtectedRoute redireciona para /login
   ↓
8. LOOP INFINITO
```

## 🔧 SOLUÇÕES PROPOSTAS

### Solução 1: Verificar Estrutura do Banco (PRIORITÁRIO)

Execute no SQL Editor do Supabase:

```sql
-- 1. Verificar se tabela profiles tem as colunas necessárias
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Verificar se trigger existe
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  OR event_object_table = 'users';

-- 3. Verificar usuários sem perfil
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.id IS NULL;

-- 4. Testar se função está ativa
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'handle_new_user';
```

### Solução 2: Criar Perfil Manualmente (TEMPORÁRIO)

Para usuários já criados sem perfil:

```sql
-- Criar perfis faltantes
INSERT INTO public.profiles (id, user_id, full_name, email, email_verified)
SELECT 
    u.id,
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
    u.email,
    TRUE
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Criar roles faltantes
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE r.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Criar subscriptions faltantes
INSERT INTO public.user_subscriptions (
    user_id, status, plan, plan_type, is_trial,
    trial_starts_at, trial_ends_at, trial_days
)
SELECT 
    u.id,
    'trial',
    'test_7days',
    'monthly',
    TRUE,
    NOW(),
    NOW() + INTERVAL '7 days',
    7
FROM auth.users u
LEFT JOIN public.user_subscriptions s ON s.user_id = u.id
WHERE s.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
```

### Solução 3: Recriar Trigger (SE NECESSÁRIO)

```sql
-- 1. Dropar triggers existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trigger_sync_google_profile ON auth.users;

-- 2. Recriar trigger principal
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Solução 4: Adicionar Logging ao Trigger (DEBUG)

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_name TEXT;
  user_email TEXT;
  user_avatar TEXT;
  user_provider TEXT;
BEGIN
  -- DEBUG: Log entrada na função
  RAISE NOTICE 'handle_new_user iniciado para user_id: %', NEW.id;
  
  -- ... resto do código ...
  
  -- DEBUG: Log sucesso
  RAISE NOTICE 'handle_new_user concluído com sucesso para user_id: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- DEBUG: Log erro
    RAISE WARNING 'ERRO em handle_new_user para user_id %: % - %', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW; -- Não bloquear criação do usuário mesmo com erro
END;
$$;
```

## 🧪 TESTE PASSO A PASSO

### Teste 1: Verificar se Trigger Funciona

1. Criar usuário de teste via SQL:
```sql
-- Inserir usuário de teste
INSERT INTO auth.users (
    instance_id, id, aud, role, email, 
    encrypted_password, email_confirmed_at, 
    raw_user_meta_data, created_at, updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'teste@example.com',
    crypt('senha123', gen_salt('bf')),
    NOW(),
    '{"full_name": "Usuário Teste"}'::jsonb,
    NOW(),
    NOW()
);

-- Verificar se perfil foi criado
SELECT * FROM profiles WHERE email = 'teste@example.com';
SELECT * FROM user_subscriptions WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'teste@example.com'
);
```

### Teste 2: Login via Frontend

1. Abrir DevTools (F12) > Console
2. Fazer login com conta de teste
3. Observar logs:
   - `🔐 Auth event: SIGNED_IN`
   - Verificar se `user` existe
   - Verificar se `subscription` carrega

### Teste 3: Verificar RLS

```sql
-- Testar se usuário consegue ler seu próprio perfil
SELECT * FROM profiles WHERE user_id = auth.uid();

-- Testar se usuário consegue ler sua subscription
SELECT * FROM user_subscriptions WHERE user_id = auth.uid();
```

## 📋 CHECKLIST DE VERIFICAÇÃO

- [ ] Tabela `profiles` tem todas as colunas necessárias
- [ ] Tabela `user_roles` existe
- [ ] Tabela `user_subscriptions` existe
- [ ] Trigger `on_auth_user_created` existe e está ativo
- [ ] Função `handle_new_user()` não tem erros de sintaxe
- [ ] RLS policies permitem SELECT para authenticated users
- [ ] Usuários existentes têm registro em `profiles`
- [ ] Usuários existentes têm registro em `user_subscriptions`

## 🚨 PRÓXIMOS PASSOS IMEDIATOS

1. **EXECUTAR queries de diagnóstico** no SQL Editor do Supabase
2. **SE encontrar usuários sem perfil**: Executar queries de correção
3. **SE trigger não existe**: Recriar trigger
4. **TESTAR** login com conta nova
5. **MONITORAR** logs do console durante o login

---

**Criado em**: 02/11/2025  
**Status**: Aguardando execução dos diagnósticos
