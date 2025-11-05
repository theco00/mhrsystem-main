# 🛠️ GUIA DE CORREÇÃO DO SUPABASE - PASSO A PASSO

## 📋 ANTES DE COMEÇAR

**Tempo Estimado:** 5-10 minutos  
**Dificuldade:** Fácil  
**Requisitos:** Acesso ao Supabase Dashboard

---

## 🎯 O QUE VAMOS FAZER

1. ✅ Criar função `handle_new_user()` que cria perfil automaticamente
2. ✅ Criar trigger que executa a função ao cadastrar usuário
3. ✅ Configurar políticas de segurança (RLS)
4. ✅ Desabilitar confirmação de email (para testes)
5. ✅ Testar se está funcionando

---

## 📍 PASSO 1: ACESSAR O SUPABASE

1. Abra o navegador
2. Acesse: https://supabase.com/dashboard
3. Faça login
4. Selecione seu projeto: **TitanJuros** (ou o nome do seu projeto)

---

## 📍 PASSO 2: ABRIR O SQL EDITOR

1. No menu lateral esquerdo, clique em: **SQL Editor**
2. Clique em: **+ New query**
3. Cole o script abaixo

---

## 📜 SCRIPT SQL PARA EXECUTAR

```sql
-- =====================================================
-- CORREÇÃO AUTENTICAÇÃO TITANJUROS
-- Data: 04/11/2025
-- =====================================================

-- PASSO 1: Criar função handle_new_user
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
  RAISE NOTICE 'handle_new_user: Iniciando para user_id %', NEW.id;
  
  -- Extrair dados
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  
  user_email := COALESCE(NEW.email, '');
  user_avatar := NEW.raw_user_meta_data->>'avatar_url';
  
  -- Determinar provider
  IF NEW.raw_user_meta_data->>'provider' = 'google' OR 
     NEW.raw_user_meta_data->>'iss' LIKE '%google%' THEN
    user_provider := 'google';
  ELSE
    user_provider := 'email';
  END IF;
  
  -- Criar perfil
  BEGIN
    INSERT INTO public.profiles (
      user_id, full_name, email, avatar_url, provider, 
      google_id, first_login_completed, email_verified
    )
    VALUES (
      NEW.id, user_name, user_email, user_avatar, user_provider,
      CASE WHEN user_provider = 'google' THEN 
        COALESCE(NEW.raw_user_meta_data->>'sub', NEW.raw_user_meta_data->>'user_id')
      ELSE NULL END,
      FALSE, TRUE
    )
    ON CONFLICT (user_id) DO UPDATE SET
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      email = COALESCE(EXCLUDED.email, profiles.email),
      updated_at = NOW();
      
    RAISE NOTICE 'Perfil criado para %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'ERRO ao criar perfil: % - %', SQLERRM, SQLSTATE;
  END;
  
  -- Criar role
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
    RAISE NOTICE 'Role criada para %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'ERRO ao criar role: %', SQLERRM;
  END;
  
  -- Criar subscription trial
  BEGIN
    INSERT INTO public.user_subscriptions (
      user_id, status, plan, plan_type, is_trial,
      trial_starts_at, trial_ends_at, trial_days
    )
    VALUES (
      NEW.id, 'trial', 'test_7days', 'monthly', TRUE,
      NOW(), NOW() + INTERVAL '7 days', 7
    )
    ON CONFLICT (user_id) DO NOTHING;
    RAISE NOTICE 'Subscription criada para %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'ERRO ao criar subscription: %', SQLERRM;
  END;
  
  RAISE NOTICE 'handle_new_user: Concluído com sucesso';
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'ERRO GERAL: % - %', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- PASSO 2: Criar trigger (CRÍTICO!)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PASSO 3: Ajustar RLS (permitir INSERT)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Permitir que service_role insira
DROP POLICY IF EXISTS "Allow service role insert" ON profiles;
CREATE POLICY "Allow service role insert" ON profiles
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- PASSO 4: Grants de permissão
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated, anon;
GRANT SELECT ON public.user_subscriptions TO authenticated, anon;
GRANT SELECT ON public.user_roles TO authenticated, anon;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ CORREÇÃO APLICADA COM SUCESSO!';
  RAISE NOTICE 'Total de usuários: %', (SELECT COUNT(*) FROM auth.users);
  RAISE NOTICE 'Total de perfis: %', (SELECT COUNT(*) FROM public.profiles);
END $$;
```

---

## 📍 PASSO 3: EXECUTAR O SCRIPT

1. **Cole o script completo** no SQL Editor
2. Clique no botão: **RUN** (ou pressione `Ctrl+Enter`)
3. Aguarde a execução (deve levar 2-3 segundos)
4. Verifique se apareceu: ✅ **Success. No rows returned**

---

## 📍 PASSO 4: CONFIGURAR AUTENTICAÇÃO

### **4.1 - Desabilitar Confirmação de Email (IMPORTANTE!)**

1. No menu lateral, vá em: **Authentication** → **Settings**
2. Procure por: **Email Confirmations**
3. **DESMARQUE** a opção: "Enable email confirmations"
4. Clique em: **Save**

### **4.2 - Verificar Sign Ups Habilitado**

1. Na mesma página de Settings
2. Procure por: **Sign Ups**
3. Certifique-se que está **MARCADO**: "Enable sign ups"
4. Se não estiver, marque e clique em: **Save**

---

## 📍 PASSO 5: VERIFICAR SE FUNCIONOU

Execute este script de verificação no SQL Editor:

```sql
-- Script de Verificação
SELECT 
  'Função handle_new_user' as item,
  CASE WHEN EXISTS(
    SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user'
  ) THEN '✅ Existe' ELSE '❌ Não existe' END as status

UNION ALL

SELECT 
  'Trigger on_auth_user_created' as item,
  CASE WHEN EXISTS(
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN '✅ Existe' ELSE '❌ Não existe' END as status

UNION ALL

SELECT 
  'Tabela profiles' as item,
  CASE WHEN EXISTS(
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'profiles' AND table_schema = 'public'
  ) THEN '✅ Existe' ELSE '❌ Não existe' END as status

UNION ALL

SELECT 
  'Tabela user_subscriptions' as item,
  CASE WHEN EXISTS(
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_subscriptions' AND table_schema = 'public'
  ) THEN '✅ Existe' ELSE '❌ Não existe' END as status;
```

**Resultado Esperado:**
```
✅ Função handle_new_user - Existe
✅ Trigger on_auth_user_created - Existe
✅ Tabela profiles - Existe
✅ Tabela user_subscriptions - Existe
```

---

## 📍 PASSO 6: TESTAR CADASTRO

Agora volte para o seu sistema e tente criar um usuário:

1. Acesse: http://localhost:8081/cadastro
2. Preencha:
   - **Nome:** Teste Supabase Corrigido
   - **Email:** teste.corrigido@exemplo.com
   - **Senha:** Senha123!@#
3. Clique em: **Criar conta grátis**

### **O que deve acontecer:**

✅ Deve aparecer um toast verde: "Conta criada!"  
✅ Deve redirecionar para página Welcome  
✅ Deve poder fazer login depois

---

## 🔍 TROUBLESHOOTING

### **Problema 1: Erro "permission denied"**

**Solução:**
```sql
-- Execute isto para dar todas as permissões necessárias
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated;
```

### **Problema 2: Trigger não criado**

**Solução:**
O trigger em `auth.users` requer privilégios especiais. Se der erro, execute:

```sql
-- Via SQL Editor com privilégios de admin
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### **Problema 3: RLS bloqueando inserts**

**Solução Temporária (apenas para testes):**
```sql
-- TEMPORÁRIO: Desabilitar RLS para testar
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
```

**⚠️ IMPORTANTE:** Após testar, reative o RLS por segurança:
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

---

## 📊 VERIFICAR LOGS DO SUPABASE

Para ver se o trigger está executando:

1. Vá em: **Database** → **Logs**
2. Filtre por: **Postgres Logs**
3. Ao criar usuário, deve aparecer:
   ```
   handle_new_user: Iniciando para user_id xxx
   Perfil criado para xxx
   Role criada para xxx
   Subscription criada para xxx
   handle_new_user: Concluído com sucesso
   ```

---

## ✅ CHECKLIST FINAL

Antes de testar, confirme:

- [ ] Script SQL principal executado com sucesso
- [ ] Trigger `on_auth_user_created` criado
- [ ] Função `handle_new_user` criada
- [ ] Email confirmations DESABILITADO
- [ ] Sign ups HABILITADO
- [ ] RLS configurado corretamente
- [ ] Permissões concedidas

---

## 🎉 PRÓXIMOS PASSOS

Após executar tudo:

1. **Teste o cadastro** no sistema
2. **Me avise o resultado** (funcionou ou deu erro)
3. Se funcionou: continuamos com testes completos
4. Se não funcionou: analiso os logs e ajusto

---

## 💡 DICAS

- **Mantenha o SQL Editor aberto** para verificações rápidas
- **Copie os logs** se der algum erro
- **Não se preocupe** - nada aqui vai quebrar o banco
- **Backup automático** do Supabase protege seus dados

---

**Criado por:** Cascade AI  
**Data:** 04/11/2025  
**Status:** 🟢 Pronto para executar
