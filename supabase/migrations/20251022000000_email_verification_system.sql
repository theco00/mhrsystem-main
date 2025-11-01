-- =====================================================
-- SISTEMA DE VERIFICAÇÃO DE EMAIL NO PRIMEIRO LOGIN
-- Tiger System - Notificação Pop-up
-- Data: 22/10/2025
-- =====================================================

-- 1. ADICIONAR CAMPOS PARA RASTREAMENTO DE PRIMEIRO LOGIN
-- =====================================================

-- Adicionar campo para rastrear se o usuário já fez o primeiro login
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_login_completed BOOLEAN DEFAULT FALSE;

-- Adicionar campo para rastrear se o email foi verificado
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Adicionar índice para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_profiles_first_login 
ON public.profiles(user_id, first_login_completed);

-- 2. ATUALIZAR FUNÇÃO handle_new_user PARA INCLUIR NOVOS CAMPOS
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, full_name, first_login_completed, email_verified)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    FALSE,
    FALSE
  );
  
  -- Criar role padrão de usuário
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 3. CRIAR FUNÇÃO PARA MARCAR PRIMEIRO LOGIN COMO COMPLETO
-- =====================================================

CREATE OR REPLACE FUNCTION public.mark_first_login_completed(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET first_login_completed = TRUE
  WHERE user_id = user_uuid;
END;
$$;

-- 4. CRIAR FUNÇÃO PARA VERIFICAR SE É PRIMEIRO LOGIN
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_first_login(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_first BOOLEAN;
BEGIN
  SELECT NOT COALESCE(first_login_completed, FALSE)
  INTO is_first
  FROM public.profiles
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(is_first, TRUE);
END;
$$;

-- 5. ADICIONAR COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON COLUMN public.profiles.first_login_completed IS 'Indica se o usuário já completou o primeiro login e viu a notificação de verificação de email';
COMMENT ON COLUMN public.profiles.email_verified IS 'Indica se o email do usuário foi verificado';
COMMENT ON FUNCTION public.mark_first_login_completed(UUID) IS 'Marca o primeiro login como completo para o usuário';
COMMENT ON FUNCTION public.is_first_login(UUID) IS 'Verifica se é o primeiro login do usuário';

-- =====================================================
-- FIM DA IMPLEMENTAÇÃO DO SISTEMA DE VERIFICAÇÃO
-- =====================================================

-- Atualizar estatísticas da tabela profiles
ANALYZE public.profiles;
