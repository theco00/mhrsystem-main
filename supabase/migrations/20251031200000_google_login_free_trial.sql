-- Migração: Sistema de Teste Grátis com Google Login
-- Data: 2025-10-31
-- Descrição: Implementa controle de teste grátis baseado em login via Google

-- ============================================
-- 1. ATUALIZAR TABELA DE PERFIS (PROFILES)
-- ============================================

-- Adicionar campos de controle de teste grátis na tabela profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS test_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS test_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_test_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_renewed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS test_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';

-- Comentários para documentação
COMMENT ON COLUMN profiles.test_start_date IS 'Data de início do período de teste grátis';
COMMENT ON COLUMN profiles.test_end_date IS 'Data de término do período de teste grátis';
COMMENT ON COLUMN profiles.is_test_active IS 'Indica se o teste grátis está ativo';
COMMENT ON COLUMN profiles.is_renewed IS 'Indica se o teste foi renovado';
COMMENT ON COLUMN profiles.test_days IS 'Número de dias do período de teste (padrão: 7)';
COMMENT ON COLUMN profiles.google_id IS 'ID único do Google do usuário';
COMMENT ON COLUMN profiles.avatar_url IS 'URL da foto de perfil do Google';
COMMENT ON COLUMN profiles.provider IS 'Provedor de autenticação (email, google, etc)';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_test_active ON profiles(is_test_active);
CREATE INDEX IF NOT EXISTS idx_profiles_test_end_date ON profiles(test_end_date);
CREATE INDEX IF NOT EXISTS idx_profiles_google_id ON profiles(google_id);

-- ============================================
-- 2. FUNÇÃO: INICIAR TESTE GRÁTIS
-- ============================================

CREATE OR REPLACE FUNCTION start_free_trial()
RETURNS TRIGGER AS $$
DECLARE
  trial_duration INTEGER := 7; -- Duração padrão do teste em dias
BEGIN
  -- Definir datas do teste grátis
  NEW.test_start_date := NOW();
  NEW.test_end_date := NOW() + (trial_duration || ' days')::INTERVAL;
  NEW.is_test_active := TRUE;
  NEW.is_renewed := FALSE;
  NEW.test_days := trial_duration;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION start_free_trial IS 'Inicia automaticamente o período de teste grátis ao criar perfil';

-- ============================================
-- 3. TRIGGER: CRIAR TESTE GRÁTIS AUTOMATICAMENTE
-- ============================================

DROP TRIGGER IF EXISTS trigger_start_free_trial ON profiles;

CREATE TRIGGER trigger_start_free_trial
  BEFORE INSERT ON profiles
  FOR EACH ROW
  WHEN (NEW.test_start_date IS NULL)
  EXECUTE FUNCTION start_free_trial();

-- ============================================
-- 4. FUNÇÃO: VERIFICAR SE TESTE ESTÁ ATIVO
-- ============================================

CREATE OR REPLACE FUNCTION is_trial_active(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Buscar informações do perfil
  SELECT 
    is_test_active,
    test_end_date
  INTO profile_record
  FROM profiles
  WHERE user_id = user_uuid;
  
  -- Se não encontrou perfil, retorna false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se teste está ativo e não expirou
  IF profile_record.is_test_active = TRUE 
     AND profile_record.test_end_date > NOW() THEN
    RETURN TRUE;
  END IF;
  
  -- Se expirou, atualizar status
  IF profile_record.is_test_active = TRUE 
     AND profile_record.test_end_date <= NOW() THEN
    UPDATE profiles
    SET is_test_active = FALSE
    WHERE user_id = user_uuid;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_trial_active IS 'Verifica se o teste grátis do usuário está ativo e atualiza status se expirou';

-- ============================================
-- 5. FUNÇÃO: OBTER DIAS RESTANTES DO TESTE
-- ============================================

CREATE OR REPLACE FUNCTION get_trial_days_remaining(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  days_left INTEGER;
BEGIN
  SELECT 
    EXTRACT(DAY FROM (test_end_date - NOW()))::INTEGER
  INTO days_left
  FROM profiles
  WHERE user_id = user_uuid
    AND is_test_active = TRUE;
  
  -- Se não encontrou ou já expirou, retorna 0
  IF days_left IS NULL OR days_left < 0 THEN
    RETURN 0;
  END IF;
  
  RETURN days_left;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_trial_days_remaining IS 'Retorna quantos dias restam do período de teste';

-- ============================================
-- 6. FUNÇÃO: RENOVAR TESTE GRÁTIS
-- ============================================

CREATE OR REPLACE FUNCTION renew_free_trial(user_uuid UUID, days INTEGER DEFAULT 7)
RETURNS BOOLEAN AS $$
DECLARE
  can_renew BOOLEAN;
BEGIN
  -- Verificar se usuário existe
  SELECT EXISTS(
    SELECT 1 FROM profiles WHERE user_id = user_uuid
  ) INTO can_renew;
  
  IF NOT can_renew THEN
    RETURN FALSE;
  END IF;
  
  -- Renovar teste
  UPDATE profiles
  SET 
    test_start_date = NOW(),
    test_end_date = NOW() + (days || ' days')::INTERVAL,
    is_test_active = TRUE,
    is_renewed = TRUE,
    test_days = days,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION renew_free_trial IS 'Renova o período de teste grátis do usuário';

-- ============================================
-- 7. FUNÇÃO: SINCRONIZAR DADOS DO GOOGLE
-- ============================================

CREATE OR REPLACE FUNCTION sync_google_profile()
RETURNS TRIGGER AS $$
DECLARE
  google_metadata JSONB;
BEGIN
  -- Extrair metadata do Google
  google_metadata := NEW.raw_user_meta_data;
  
  -- Atualizar perfil com dados do Google
  UPDATE profiles
  SET 
    google_id = google_metadata->>'sub',
    avatar_url = google_metadata->>'avatar_url',
    provider = 'google',
    updated_at = NOW()
  WHERE user_id = NEW.id;
  
  -- Se não existe perfil, criar um
  IF NOT FOUND THEN
    INSERT INTO profiles (
      user_id,
      full_name,
      email,
      google_id,
      avatar_url,
      provider
    ) VALUES (
      NEW.id,
      google_metadata->>'full_name',
      NEW.email,
      google_metadata->>'sub',
      google_metadata->>'avatar_url',
      'google'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION sync_google_profile IS 'Sincroniza dados do perfil do Google após login';

-- ============================================
-- 8. TRIGGER: SINCRONIZAR GOOGLE LOGIN
-- ============================================

DROP TRIGGER IF EXISTS trigger_sync_google_profile ON auth.users;

CREATE TRIGGER trigger_sync_google_profile
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data->>'provider' = 'google')
  EXECUTE FUNCTION sync_google_profile();

-- ============================================
-- 9. FUNÇÃO: VERIFICAR TESTES EXPIRADOS (CRON)
-- ============================================

CREATE OR REPLACE FUNCTION check_expired_trials()
RETURNS void AS $$
BEGIN
  -- Atualizar todos os testes que expiraram
  UPDATE profiles
  SET 
    is_test_active = FALSE,
    updated_at = NOW()
  WHERE is_test_active = TRUE
    AND test_end_date <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_expired_trials IS 'Atualiza status de todos os testes expirados - executar via cron';

-- ============================================
-- 10. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ============================================

-- Usuários podem ver apenas seu próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem atualizar apenas seu próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 11. GRANTS DE PERMISSÕES
-- ============================================

GRANT EXECUTE ON FUNCTION is_trial_active(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trial_days_remaining(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION renew_free_trial(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_expired_trials() TO authenticated;

-- ============================================
-- 12. ATUALIZAR PERFIS EXISTENTES
-- ============================================

-- Adicionar teste grátis para usuários existentes que não têm
UPDATE profiles
SET 
  test_start_date = NOW(),
  test_end_date = NOW() + INTERVAL '7 days',
  is_test_active = TRUE,
  is_renewed = FALSE,
  test_days = 7
WHERE test_start_date IS NULL;

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================
