-- =====================================================
-- CORREÇÃO AUTENTICAÇÃO TITANJUROS
-- Executar no Supabase SQL Editor
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
