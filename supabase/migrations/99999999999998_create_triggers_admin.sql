-- =====================================================
-- CRIAR TRIGGERS NA TABELA auth.users (APENAS ADMIN)
-- Data: 02/11/2025
-- =====================================================
-- ATENÇÃO: Este script SÓ FUNCIONA se você executar via:
-- 1. Dashboard do Supabase (Table Editor) com usuário admin
-- 2. Supabase CLI com credenciais de service_role
-- 
-- NÃO FUNCIONA no SQL Editor comum devido a restrições de segurança

-- ============================================
-- VERIFICAR SE TRIGGERS JÁ EXISTEM
-- ============================================

-- Ver todos os triggers em auth.users
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';

-- ============================================
-- PARTE 1: TRIGGER PRINCIPAL - handle_new_user
-- ============================================

-- Dropar trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger novo
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON TRIGGER on_auth_user_created ON auth.users 
IS 'Cria automaticamente perfil, role e subscription para novos usuários';

-- ============================================
-- PARTE 2: TRIGGER DE CONFIRMAÇÃO DE EMAIL
-- ============================================

-- Dropar trigger antigo se existir
DROP TRIGGER IF EXISTS auto_confirm_user_email ON auth.users;

-- Criar trigger novo
CREATE TRIGGER auto_confirm_user_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_email();

COMMENT ON TRIGGER auto_confirm_user_email ON auth.users 
IS 'Confirma email automaticamente ao criar usuário (sem necessidade de link de verificação)';

-- ============================================
-- PARTE 3: REMOVER TRIGGER DE SYNC DO GOOGLE (SE EXISTIR)
-- ============================================

-- Este trigger pode causar conflito com o handle_new_user
DROP TRIGGER IF EXISTS trigger_sync_google_profile ON auth.users;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Listar triggers ativos após as mudanças
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- Log de sucesso
DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE 'TRIGGERS CRIADOS COM SUCESSO';
  RAISE NOTICE 'Data: %', NOW();
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Triggers ativos em auth.users:';
  RAISE NOTICE '- on_auth_user_created (AFTER INSERT)';
  RAISE NOTICE '- auto_confirm_user_email (BEFORE INSERT)';
  RAISE NOTICE '====================================';
END $$;
