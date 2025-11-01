-- Adicionar campos de assinatura e trial na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cakto_subscription_id TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_end_date ON profiles(trial_end_date);

-- Comentários para documentação
COMMENT ON COLUMN profiles.subscription_status IS 'Status da assinatura: inactive, trial, active, expired, canceled';
COMMENT ON COLUMN profiles.subscription_plan IS 'Tipo do plano: trial, monthly, quarterly';
COMMENT ON COLUMN profiles.trial_start_date IS 'Data de início do período de teste';
COMMENT ON COLUMN profiles.trial_end_date IS 'Data de término do período de teste';
COMMENT ON COLUMN profiles.subscription_start_date IS 'Data de início da assinatura paga';
COMMENT ON COLUMN profiles.subscription_end_date IS 'Data de término da assinatura paga';
COMMENT ON COLUMN profiles.cakto_subscription_id IS 'ID da assinatura no Cakto para referência';
