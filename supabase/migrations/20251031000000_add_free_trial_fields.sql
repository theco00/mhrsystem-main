-- Adicionar campos para controle de Free Trial
-- Migração criada em: 2025-10-31

-- Adicionar novos status para incluir 'trial'
ALTER TABLE user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_status_check;

ALTER TABLE user_subscriptions 
ADD CONSTRAINT user_subscriptions_status_check 
CHECK (status IN ('trial', 'active', 'inactive', 'cancelled', 'expired'));

-- Adicionar campos de trial
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS trial_starts_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 7;

-- Adicionar campo para armazenar o plano escolhido
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'monthly' CHECK (plan IN ('test_7days', 'monthly', 'quarterly', 'semiannual'));

-- Comentários para documentação
COMMENT ON COLUMN user_subscriptions.trial_starts_at IS 'Data de início do período de teste grátis';
COMMENT ON COLUMN user_subscriptions.trial_ends_at IS 'Data de término do período de teste grátis';
COMMENT ON COLUMN user_subscriptions.is_trial IS 'Indica se o usuário está em período de teste';
COMMENT ON COLUMN user_subscriptions.trial_days IS 'Número de dias do período de teste (padrão: 7)';
COMMENT ON COLUMN user_subscriptions.plan IS 'Plano escolhido: test_7days, monthly, quarterly, semiannual';

-- Função para criar assinatura de teste grátis automaticamente
CREATE OR REPLACE FUNCTION create_free_trial_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar assinatura de teste grátis para novo usuário
  INSERT INTO user_subscriptions (
    user_id,
    status,
    is_trial,
    trial_starts_at,
    trial_ends_at,
    trial_days,
    plan,
    plan_type
  ) VALUES (
    NEW.id,
    'trial',
    TRUE,
    NOW(),
    NOW() + INTERVAL '7 days',
    7,
    'test_7days',
    'monthly'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS create_free_trial_on_signup ON auth.users;

-- Trigger para criar trial automaticamente quando usuário se cadastra
CREATE TRIGGER create_free_trial_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_free_trial_subscription();

-- Função para verificar se o trial expirou
CREATE OR REPLACE FUNCTION check_trial_expiration()
RETURNS void AS $$
BEGIN
  -- Atualizar status de assinaturas trial que expiraram
  UPDATE user_subscriptions
  SET status = 'expired',
      is_trial = FALSE
  WHERE status = 'trial'
    AND trial_ends_at IS NOT NULL
    AND trial_ends_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário na função
COMMENT ON FUNCTION check_trial_expiration IS 'Atualiza status de trials expirados para expired';

-- Função melhorada para verificar se assinatura está ativa (incluindo trial)
CREATE OR REPLACE FUNCTION is_subscription_active(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  sub_status TEXT;
  sub_expiry TIMESTAMP WITH TIME ZONE;
  sub_trial_end TIMESTAMP WITH TIME ZONE;
  sub_is_trial BOOLEAN;
BEGIN
  SELECT status, expiry_date, trial_ends_at, is_trial 
  INTO sub_status, sub_expiry, sub_trial_end, sub_is_trial
  FROM user_subscriptions
  WHERE user_id = user_uuid;
  
  -- Se não tem assinatura, retorna false
  IF sub_status IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Se está em trial e não expirou
  IF sub_status = 'trial' AND sub_is_trial = TRUE THEN
    IF sub_trial_end IS NULL OR sub_trial_end > NOW() THEN
      RETURN TRUE;
    ELSE
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Se está ativa e não expirou
  IF sub_status = 'active' AND (sub_expiry IS NULL OR sub_expiry > NOW()) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter dias restantes do trial
CREATE OR REPLACE FUNCTION get_trial_days_remaining(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  trial_end TIMESTAMP WITH TIME ZONE;
  days_remaining INTEGER;
BEGIN
  SELECT trial_ends_at INTO trial_end
  FROM user_subscriptions
  WHERE user_id = user_uuid
    AND status = 'trial'
    AND is_trial = TRUE;
  
  IF trial_end IS NULL THEN
    RETURN 0;
  END IF;
  
  days_remaining := EXTRACT(DAY FROM (trial_end - NOW()));
  
  IF days_remaining < 0 THEN
    RETURN 0;
  END IF;
  
  RETURN days_remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário na função
COMMENT ON FUNCTION get_trial_days_remaining IS 'Retorna quantos dias restam do período de teste';

-- Criar índice para buscas por trial
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_trial ON user_subscriptions(is_trial, trial_ends_at) WHERE is_trial = TRUE;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_free_trial_subscription() TO authenticated;
GRANT EXECUTE ON FUNCTION check_trial_expiration() TO authenticated;
GRANT EXECUTE ON FUNCTION is_subscription_active(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trial_days_remaining(UUID) TO authenticated;
