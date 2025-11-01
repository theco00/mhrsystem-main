-- =====================================================
-- MIGRAÇÃO COMPLETA E CORRIGIDA DO SISTEMA DE ASSINATURAS
-- Data: 31/10/2024
-- Versão: 2.0.0 - SEM TRIGGERS RECURSIVOS
-- =====================================================

-- PRIMEIRO: LIMPAR TUDO QUE PODE ESTAR CAUSANDO PROBLEMAS
DROP TRIGGER IF EXISTS check_subscription_expiration ON profiles;
DROP FUNCTION IF EXISTS trigger_check_expiration();
DROP FUNCTION IF EXISTS check_expired_subscriptions();

-- 1. Adicionar campos de subscription se não existirem
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cakto_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS trial_renewed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 7;

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_end_date ON profiles(trial_end_date);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_end_date ON profiles(subscription_end_date);

-- 3. Função SIMPLES para verificar se trial está ativo (SEM UPDATES)
CREATE OR REPLACE FUNCTION is_trial_active(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    trial_end TIMESTAMP WITH TIME ZONE;
    sub_status TEXT;
BEGIN
    SELECT trial_end_date, subscription_status 
    INTO trial_end, sub_status
    FROM profiles 
    WHERE user_id = user_uuid;
    
    -- Se for admin, sempre ativo
    IF user_uuid = '37f08529-a546-4d05-ad07-69397f80e4dc'::UUID THEN
        RETURN true;
    END IF;
    
    -- Se status é trial e data não expirou
    IF sub_status = 'trial' AND trial_end IS NOT NULL AND trial_end > NOW() THEN
        RETURN true;
    END IF;
    
    -- Se status é active (assinatura paga)
    IF sub_status = 'active' THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Função para obter dias restantes do trial (SEM UPDATES)
CREATE OR REPLACE FUNCTION get_trial_days_remaining(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    trial_end TIMESTAMP WITH TIME ZONE;
    days_remaining INTEGER;
BEGIN
    SELECT trial_end_date 
    INTO trial_end
    FROM profiles 
    WHERE user_id = user_uuid;
    
    IF trial_end IS NULL THEN
        RETURN 0;
    END IF;
    
    days_remaining := CEIL(EXTRACT(EPOCH FROM (trial_end - NOW())) / 86400);
    
    IF days_remaining < 0 THEN
        RETURN 0;
    END IF;
    
    RETURN days_remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Função para ativar trial para novo usuário
CREATE OR REPLACE FUNCTION activate_trial_for_new_user(user_uuid UUID, days INTEGER DEFAULT 7)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE profiles 
    SET 
        subscription_status = 'trial',
        trial_start_date = NOW(),
        trial_end_date = NOW() + INTERVAL '1 day' * days,
        trial_days = days
    WHERE user_id = user_uuid 
    AND subscription_status = 'inactive';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Função para renovar trial (apenas uma vez)
CREATE OR REPLACE FUNCTION renew_free_trial(user_uuid UUID, days INTEGER DEFAULT 7)
RETURNS BOOLEAN AS $$
DECLARE
    is_renewed BOOLEAN;
BEGIN
    -- Verificar se já foi renovado
    SELECT trial_renewed 
    INTO is_renewed
    FROM profiles 
    WHERE user_id = user_uuid;
    
    IF is_renewed IS TRUE THEN
        RETURN false;
    END IF;
    
    -- Renovar trial
    UPDATE profiles 
    SET 
        trial_end_date = NOW() + INTERVAL '1 day' * days,
        trial_renewed = true,
        subscription_status = 'trial'
    WHERE user_id = user_uuid;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Função para ativar assinatura paga
CREATE OR REPLACE FUNCTION activate_paid_subscription(
    user_uuid UUID, 
    plan_type TEXT, 
    days INTEGER,
    cakto_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE profiles 
    SET 
        subscription_status = 'active',
        subscription_plan = plan_type,
        subscription_start_date = NOW(),
        subscription_end_date = NOW() + INTERVAL '1 day' * days,
        cakto_subscription_id = cakto_id
    WHERE user_id = user_uuid;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para verificar manualmente expiração (CHAMADA MANUAL, NÃO AUTOMÁTICA)
CREATE OR REPLACE FUNCTION manual_check_expired_subscriptions()
RETURNS void AS $$
BEGIN
    -- Marcar trials expirados
    UPDATE profiles 
    SET subscription_status = 'expired'
    WHERE subscription_status = 'trial' 
    AND trial_end_date < NOW();
    
    -- Marcar assinaturas pagas expiradas
    UPDATE profiles 
    SET subscription_status = 'expired'
    WHERE subscription_status = 'active' 
    AND subscription_end_date < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Dar permissões apropriadas
GRANT EXECUTE ON FUNCTION is_trial_active(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_trial_days_remaining(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION activate_trial_for_new_user(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION renew_free_trial(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION activate_paid_subscription(UUID, TEXT, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION manual_check_expired_subscriptions() TO authenticated;

-- 10. Configurar o admin com acesso infinito
UPDATE profiles 
SET 
    subscription_status = 'active',
    subscription_plan = 'admin',
    subscription_start_date = NOW(),
    subscription_end_date = '2099-12-31'::TIMESTAMP WITH TIME ZONE
WHERE user_id = '37f08529-a546-4d05-ad07-69397f80e4dc';

-- 11. Comentários para documentação
COMMENT ON COLUMN profiles.subscription_status IS 'Status: inactive, trial, active, expired, canceled';
COMMENT ON COLUMN profiles.subscription_plan IS 'Plano: trial, monthly, quarterly, admin';
COMMENT ON COLUMN profiles.trial_start_date IS 'Início do período de teste';
COMMENT ON COLUMN profiles.trial_end_date IS 'Fim do período de teste';
COMMENT ON COLUMN profiles.subscription_start_date IS 'Início da assinatura paga';
COMMENT ON COLUMN profiles.subscription_end_date IS 'Fim da assinatura paga';
COMMENT ON COLUMN profiles.cakto_subscription_id IS 'ID da assinatura no Cakto';
COMMENT ON COLUMN profiles.trial_renewed IS 'Se o trial já foi renovado';
COMMENT ON COLUMN profiles.trial_days IS 'Número de dias do trial';

-- =====================================================
-- IMPORTANTE: CONFIGURAR CRON JOB NO SUPABASE
-- =====================================================
-- Para verificar expiração automaticamente, configure um Cron Job no Supabase:
-- 1. Vá em Database > Extensions
-- 2. Ative a extensão pg_cron
-- 3. Execute este comando para criar o job (executar a cada hora):
-- SELECT cron.schedule('check-expired-subscriptions', '0 * * * *', $$SELECT manual_check_expired_subscriptions()$$);

-- =====================================================
-- FIM DA MIGRAÇÃO CORRIGIDA
-- =====================================================
