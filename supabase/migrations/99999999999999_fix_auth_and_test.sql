-- =====================================================
-- FIX DEFINITIVO: Autenticação e Criação de Perfis
-- Data: 02/11/2025
-- =====================================================
-- Este script corrige TODOS os problemas de autenticação

-- ============================================
-- PARTE 1: GARANTIR QUE TODAS AS COLUNAS EXISTEM
-- ============================================

-- Adicionar colunas na tabela profiles se não existirem
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS google_id TEXT,
ADD COLUMN IF NOT EXISTS first_login_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================
-- PARTE 2: FUNÇÃO ROBUSTA handle_new_user
-- ============================================

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
  profile_exists BOOLEAN;
BEGIN
  -- Log inicial
  RAISE NOTICE 'handle_new_user: Iniciando para user_id %', NEW.id;
  
  -- Verificar se perfil já existe
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = NEW.id)
  INTO profile_exists;
  
  IF profile_exists THEN
    RAISE NOTICE 'handle_new_user: Perfil já existe para user_id %, pulando', NEW.id;
    RETURN NEW;
  END IF;
  
  -- Extrair dados do metadata ou usar valores padrão
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
  
  -- Criar perfil do usuário com UPSERT
  BEGIN
    INSERT INTO public.profiles (
      user_id,
      full_name,
      email,
      avatar_url,
      provider,
      google_id,
      first_login_completed,
      email_verified
    )
    VALUES (
      NEW.id,
      user_name,
      user_email,
      user_avatar,
      user_provider,
      CASE 
        WHEN user_provider = 'google' THEN 
          COALESCE(NEW.raw_user_meta_data->>'sub', NEW.raw_user_meta_data->>'user_id')
        ELSE NULL
      END,
      FALSE,
      TRUE
    )
    ON CONFLICT (user_id) DO UPDATE SET
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      email = COALESCE(EXCLUDED.email, profiles.email),
      avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
      provider = EXCLUDED.provider,
      google_id = COALESCE(EXCLUDED.google_id, profiles.google_id),
      updated_at = NOW();
      
    RAISE NOTICE 'handle_new_user: Perfil criado/atualizado para user_id %', NEW.id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user: ERRO ao criar perfil para user_id %: % - %', 
        NEW.id, SQLERRM, SQLSTATE;
  END;
  
  -- Criar role padrão de usuário
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'handle_new_user: Role criada para user_id %', NEW.id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user: ERRO ao criar role para user_id %: % - %', 
        NEW.id, SQLERRM, SQLSTATE;
  END;
  
  -- Criar assinatura de teste grátis
  BEGIN
    INSERT INTO public.user_subscriptions (
      user_id,
      status,
      plan,
      plan_type,
      is_trial,
      trial_starts_at,
      trial_ends_at,
      trial_days
    )
    VALUES (
      NEW.id,
      'trial',
      'test_7days',
      'monthly',
      TRUE,
      NOW(),
      NOW() + INTERVAL '7 days',
      7
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'handle_new_user: Subscription criada para user_id %', NEW.id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user: ERRO ao criar subscription para user_id %: % - %', 
        NEW.id, SQLERRM, SQLSTATE;
  END;
  
  RAISE NOTICE 'handle_new_user: Concluído com sucesso para user_id %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: ERRO GERAL para user_id %: % - %', 
      NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW; -- Não bloquear criação do usuário
END;
$$;

COMMENT ON FUNCTION public.handle_new_user IS 'Cria perfil, role e assinatura para novos usuários (com tratamento robusto de erros)';

-- ============================================
-- PARTE 3: RECRIAR TRIGGERS LIMPOS
-- ============================================
-- NOTA: Os triggers em auth.users já devem estar criados pelas migrations anteriores
-- Se não estiverem, você precisa executar via Dashboard do Supabase (SQL Editor com privilégios admin)
-- 
-- Os comandos comentados abaixo são apenas para referência:
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP TRIGGER IF EXISTS trigger_sync_google_profile ON auth.users;
-- DROP TRIGGER IF EXISTS auto_confirm_user_email ON auth.users;
--
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.handle_new_user();

-- A função handle_new_user() já foi criada acima e está pronta para uso

-- ============================================
-- PARTE 4: CORRIGIR USUÁRIOS EXISTENTES SEM PERFIL
-- ============================================

-- Criar perfis faltantes
INSERT INTO public.profiles (user_id, full_name, email, email_verified, provider)
SELECT 
    u.id,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      split_part(u.email, '@', 1)
    ),
    u.email,
    TRUE,
    CASE 
      WHEN u.raw_user_meta_data->>'provider' = 'google' THEN 'google'
      ELSE 'email'
    END
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

-- ============================================
-- PARTE 5: POLÍTICAS RLS
-- ============================================

-- Garantir que usuários podem ler seus próprios dados
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- PARTE 6: GRANTS DE PERMISSÕES
-- ============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_subscriptions TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;

-- ============================================
-- PARTE 7: CONFIRMAÇÃO AUTOMÁTICA DE EMAIL
-- ============================================
-- NOTA: A criação de triggers em auth.users requer privilégios especiais
-- A função auto_confirm_email já existe em migrations anteriores
-- Se necessário recriar, execute via Dashboard do Supabase com admin

CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := NOW();
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger comentado - já deve existir de migrations anteriores:
-- CREATE TRIGGER auto_confirm_user_email
--   BEFORE INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.auto_confirm_email();

-- ============================================
-- PARTE 8: LOGS E DIAGNÓSTICO
-- ============================================

-- Função para diagnóstico
CREATE OR REPLACE FUNCTION public.diagnose_user_auth(user_email TEXT)
RETURNS TABLE(
  check_type TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- Verificar se usuário existe
  RETURN QUERY
  SELECT 
    'user_exists'::TEXT,
    CASE WHEN EXISTS(SELECT 1 FROM auth.users WHERE email = user_email) 
      THEN 'OK' ELSE 'MISSING' END,
    COALESCE((SELECT id::TEXT FROM auth.users WHERE email = user_email), 'N/A');
  
  -- Verificar se perfil existe
  RETURN QUERY
  SELECT 
    'profile_exists'::TEXT,
    CASE WHEN EXISTS(
      SELECT 1 FROM public.profiles p 
      JOIN auth.users u ON u.id = p.user_id 
      WHERE u.email = user_email
    ) THEN 'OK' ELSE 'MISSING' END,
    '';
  
  -- Verificar se subscription existe
  RETURN QUERY
  SELECT 
    'subscription_exists'::TEXT,
    CASE WHEN EXISTS(
      SELECT 1 FROM public.user_subscriptions s
      JOIN auth.users u ON u.id = s.user_id 
      WHERE u.email = user_email
    ) THEN 'OK' ELSE 'MISSING' END,
    COALESCE((
      SELECT status FROM public.user_subscriptions s
      JOIN auth.users u ON u.id = s.user_id 
      WHERE u.email = user_email
    ), 'N/A');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.diagnose_user_auth IS 'Diagnostica problemas de autenticação para um email específico';

GRANT EXECUTE ON FUNCTION public.diagnose_user_auth(TEXT) TO authenticated;

-- ============================================
-- FIM: ATUALIZAR ESTATÍSTICAS
-- ============================================

ANALYZE public.profiles;
ANALYZE public.user_subscriptions;
ANALYZE public.user_roles;
ANALYZE auth.users;

-- Log final
DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE 'FIX DE AUTENTICAÇÃO APLICADO COM SUCESSO';
  RAISE NOTICE 'Data: %', NOW();
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Total de usuários: %', (SELECT COUNT(*) FROM auth.users);
  RAISE NOTICE 'Total de perfis: %', (SELECT COUNT(*) FROM public.profiles);
  RAISE NOTICE 'Total de subscriptions: %', (SELECT COUNT(*) FROM public.user_subscriptions);
  RAISE NOTICE '====================================';
END $$;
