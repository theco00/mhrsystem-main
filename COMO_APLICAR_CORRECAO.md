# 🔧 COMO APLICAR A CORREÇÃO DE AUTENTICAÇÃO

## ⚠️ PROBLEMA RESOLVIDO
O erro `ERROR: 42501: must be owner of relation users` foi corrigido!

---

## 📋 PASSO 1: APLICAR CORREÇÃO PRINCIPAL (OBRIGATÓRIO)

### 1.1. Abra o SQL Editor
```
https://supabase.com/dashboard/project/wgycuyrkkqwwegazgvcb/sql/new
```

### 1.2. Cole o Script Principal
Copie TODO o conteúdo do arquivo:
```
supabase/migrations/99999999999999_fix_auth_and_test.sql
```

### 1.3. Execute
- Clique em **RUN** (ou Ctrl+Enter)
- Aguarde até ver "Success"

**O que esse script faz**:
- ✅ Cria/atualiza função `handle_new_user()`
- ✅ Cria perfis para usuários sem perfil
- ✅ Cria subscriptions para usuários sem subscription
- ✅ Adiciona função de diagnóstico
- ✅ Configura políticas RLS

**O que NÃO faz** (por questões de segurança):
- ❌ Não cria triggers em `auth.users` (requer admin)

---

## 📋 PASSO 2: VERIFICAR SE TRIGGERS EXISTEM

Execute no SQL Editor:
```sql
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';
```

### ✅ Resultado Esperado (IDEAL):
```
trigger_name              | event_manipulation | action_statement
--------------------------|--------------------|-----------------
on_auth_user_created      | INSERT             | EXECUTE FUNCTION public.handle_new_user()
auto_confirm_user_email   | INSERT             | EXECUTE FUNCTION public.auto_confirm_email()
```

### ❌ Se NÃO aparecer nenhum trigger:
**Você precisa criar os triggers manualmente** → Ir para PASSO 3

### ✅ Se aparecer `on_auth_user_created`:
**Ótimo! Os triggers já existem** → Ir para PASSO 4 (TESTAR)

---

## 📋 PASSO 3: CRIAR TRIGGERS (SE NECESSÁRIO)

### Opção A: Via Supabase CLI (RECOMENDADO)

Se você tem o Supabase CLI instalado:

```bash
# 1. Login
supabase login

# 2. Link ao projeto
supabase link --project-ref wgycuyrkkqwwegazgvcb

# 3. Executar migration de triggers
supabase db push
```

### Opção B: Via SQL Editor com Service Role

1. Vá para: **Database** → **Roles** → **postgres**
2. Abra SQL Editor como **postgres** role
3. Cole o conteúdo de:
   ```
   supabase/migrations/99999999999998_create_triggers_admin.sql
   ```
4. Execute

### Opção C: Via Dashboard do Supabase

1. Vá para: **Authentication** → **Triggers**
2. Clique em **New Trigger**
3. Configure:
   - **Name**: `on_auth_user_created`
   - **Table**: `auth.users`
   - **Events**: `Insert`
   - **Type**: `After`
   - **Function**: `public.handle_new_user()`

---

## 📋 PASSO 4: TESTAR A CORREÇÃO

### 4.1. Verificar Usuários Existentes

Execute no SQL Editor:
```sql
-- Ver usuários e seus perfis
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.id as profile_id,
  s.status as subscription_status
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
LEFT JOIN public.user_subscriptions s ON s.user_id = u.id
ORDER BY u.created_at DESC
LIMIT 10;
```

**✅ Resultado Esperado**: Todos os usuários devem ter `profile_id` e `subscription_status` preenchidos.

**❌ Se algum usuário NÃO tem perfil**:
Execute a correção manual:
```sql
-- Criar perfis faltantes
INSERT INTO public.profiles (user_id, full_name, email, email_verified, provider)
SELECT 
    u.id,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      split_part(u.email, '@', 1)
    ),
    u.email,
    TRUE,
    'email'
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Criar subscriptions faltantes
INSERT INTO public.user_subscriptions (
    user_id, status, plan, plan_type, is_trial,
    trial_starts_at, trial_ends_at, trial_days
)
SELECT 
    u.id, 'trial', 'test_7days', 'monthly', TRUE,
    NOW(), NOW() + INTERVAL '7 days', 7
FROM auth.users u
LEFT JOIN public.user_subscriptions s ON s.user_id = u.id
WHERE s.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
```

### 4.2. Testar Login com Novo Usuário

1. Abra o navegador em: `http://localhost:8080/login`
2. Clique em **"Criar conta"**
3. Preencha dados de teste:
   - Nome: `Teste Novo`
   - Email: `teste-novo-$(date +%s)@example.com`
   - Senha: `senha123456`
4. Clique em **"Criar Conta"**

**✅ Sucesso se**:
- Redireciona para `/dashboard`
- Consegue ver o dashboard
- Não volta para `/login`

**❌ Falha se**:
- Entra em loop de login
- Console mostra erro

### 4.3. Verificar no Banco

Execute após criar a conta de teste:
```sql
SELECT * FROM public.diagnose_user_auth('teste-novo-XXX@example.com');
```

**✅ Resultado Esperado**:
```
check_type           | status | details
---------------------|--------|----------
user_exists          | OK     | (uuid)
profile_exists       | OK     | 
subscription_exists  | OK     | trial
```

---

## 📋 PASSO 5: TESTAR LOGIN COM GOOGLE

1. Abra navegador em modo anônimo
2. Acesse: `http://localhost:8080/login`
3. Clique em **"Continuar com Google"**
4. Autorize com uma conta Google

**✅ Sucesso se**:
- Entra no dashboard
- Perfil é criado automaticamente

**❌ Falha se**:
- Loop de login
- Erro no console

---

## 🐛 TROUBLESHOOTING

### Erro: "Trigger does not exist"

**Solução**: Triggers não foram criados. Volte para PASSO 3.

### Erro: "Cannot read properties of null (subscription)"

**Causa**: Subscription não foi criada.

**Solução**: Execute a query de correção manual no PASSO 4.1.

### Erro: "RLS policy violation"

**Causa**: Políticas RLS não estão corretas.

**Solução**: Execute:
```sql
-- Recriar políticas
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
```

### Ainda tem loop de login?

Execute diagnóstico completo:
```sql
-- 1. Ver usuários sem perfil
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.id IS NULL;

-- 2. Ver triggers ativos
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'users';

-- 3. Diagnosticar usuário específico
SELECT * FROM public.diagnose_user_auth('seu-email@gmail.com');
```

---

## ✅ CHECKLIST FINAL

Após completar todos os passos:

- [ ] Script `99999999999999_fix_auth_and_test.sql` foi executado com sucesso
- [ ] Trigger `on_auth_user_created` existe (verificado no PASSO 2)
- [ ] Todos os usuários existentes têm perfil (verificado no PASSO 4.1)
- [ ] Login com novo usuário funciona (testado no PASSO 4.2)
- [ ] Login com Google funciona (testado no PASSO 5)
- [ ] Console do navegador não mostra erros
- [ ] Dashboard carrega corretamente

---

## 📞 SE AINDA TIVER PROBLEMAS

**Me envie**:
1. Screenshot do erro no console (F12)
2. Resultado de:
   ```sql
   SELECT * FROM public.diagnose_user_auth('seu-email@gmail.com');
   ```
3. Resultado de:
   ```sql
   SELECT trigger_name FROM information_schema.triggers 
   WHERE event_object_table = 'users';
   ```

---

**Última Atualização**: 02/11/2025  
**Status**: Script corrigido para não requerer privilégios de owner
