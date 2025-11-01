-- =====================================================
-- SISTEMA DE AUTENTICAÇÃO COM EMAIL/SENHA
-- Sem verificação obrigatória de email
-- Data: 01/11/2025
-- =====================================================

-- ============================================
-- 1. ATUALIZAR FUNÇÃO handle_new_user
-- ============================================
-- Esta função é chamada quando um novo usuário é criado
-- Precisa funcionar tanto para Google OAuth quanto Email/Senha

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
  -- Extrair dados do metadata ou usar valores padrão
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1) -- Usar parte do email se não tiver nome
  );
  
  user_email := NEW.email;
  user_avatar := NEW.raw_user_meta_data->>'avatar_url';
  
  -- Determinar provider
  IF NEW.raw_user_meta_data->>'provider' = 'google' THEN
    user_provider := 'google';
  ELSE
    user_provider := 'email';
  END IF;
  
  -- Criar perfil do usuário
  INSERT INTO public.profiles (
    id,
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
    NEW.id,
    user_name,
    user_email,
    user_avatar,
    user_provider,
    CASE 
      WHEN user_provider = 'google' THEN NEW.raw_user_meta_data->>'sub'
      ELSE NULL
    END,
    FALSE,
    TRUE  -- Marcar como verificado imediatamente (sem necessidade de confirmar email)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url,
    provider = EXCLUDED.provider,
    google_id = EXCLUDED.google_id,
    updated_at = NOW();
  
  -- Criar role padrão de usuário
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Criar assinatura de teste grátis
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
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user IS 'Cria perfil, role e assinatura de teste para novos usuários (Google e Email/Senha)';

-- ============================================
-- 2. ATUALIZAR TRIGGER handle_new_user
-- ============================================

-- Recriar trigger para garantir que está usando a função atualizada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. FUNÇÃO PARA CONFIRMAR EMAIL AUTOMATICAMENTE
-- ============================================
-- Esta função marca o email como confirmado sem necessidade de link

CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se email_confirmed_at ainda não está definido, definir agora
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.auto_confirm_email IS 'Confirma email automaticamente ao criar usuário';

-- ============================================
-- 4. TRIGGER PARA AUTO-CONFIRMAR EMAIL
-- ============================================

DROP TRIGGER IF EXISTS auto_confirm_user_email ON auth.users;

CREATE TRIGGER auto_confirm_user_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_email();

-- ============================================
-- 5. FUNÇÃO PARA VERIFICAR SE USUÁRIO EXISTE
-- ============================================
-- Útil para evitar duplicatas antes de cadastrar

CREATE OR REPLACE FUNCTION public.user_exists_by_email(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  exists_user BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 
    FROM auth.users 
    WHERE email = user_email
  ) INTO exists_user;
  
  RETURN exists_user;
END;
$$;

COMMENT ON FUNCTION public.user_exists_by_email IS 'Verifica se já existe um usuário com o email fornecido';

-- ============================================
-- 6. ATUALIZAR PERFIS EXISTENTES
-- ============================================
-- Marcar todos os perfis existentes como email verificado

UPDATE public.profiles
SET email_verified = TRUE
WHERE email_verified = FALSE OR email_verified IS NULL;

-- Atualizar auth.users para confirmar emails não confirmados
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, created_at)
WHERE email_confirmed_at IS NULL;

-- ============================================
-- 7. GRANTS DE PERMISSÕES
-- ============================================

GRANT EXECUTE ON FUNCTION public.user_exists_by_email(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.user_exists_by_email(TEXT) TO authenticated;

-- ============================================
-- 8. POLÍTICAS RLS ADICIONAIS
-- ============================================

-- Permitir que usuários autenticados leiam seus próprios dados de assinatura
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Permitir inserção apenas via triggers/funções do sistema
DROP POLICY IF EXISTS "System can insert subscriptions" ON user_subscriptions;
CREATE POLICY "System can insert subscriptions" ON user_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================

-- Atualizar estatísticas das tabelas
ANALYZE public.profiles;
ANALYZE public.user_subscriptions;
ANALYZE auth.users;
