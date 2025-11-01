-- Criar tabela de assinaturas de usuários
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
  plan_type TEXT NOT NULL DEFAULT 'monthly' CHECK (plan_type IN ('monthly', 'yearly')),
  payment_id TEXT,
  payment_date TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que cada usuário tenha apenas uma assinatura
  UNIQUE(user_id)
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expiry_date ON user_subscriptions(expiry_date);

-- Comentários para documentação
COMMENT ON TABLE user_subscriptions IS 'Tabela de controle de assinaturas dos usuários';
COMMENT ON COLUMN user_subscriptions.status IS 'Status da assinatura: active, inactive, cancelled, expired';
COMMENT ON COLUMN user_subscriptions.plan_type IS 'Tipo de plano: monthly, yearly';
COMMENT ON COLUMN user_subscriptions.payment_id IS 'ID do pagamento no Cakto';
COMMENT ON COLUMN user_subscriptions.expiry_date IS 'Data de expiração da assinatura';

-- Habilitar Row Level Security (RLS)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Admins can update subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Admins can delete subscriptions" ON user_subscriptions;

-- Política: Usuários podem ver apenas sua própria assinatura
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem inserir sua própria assinatura (para testes)
CREATE POLICY "Users can insert own subscription" ON user_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Apenas admins podem atualizar assinaturas
CREATE POLICY "Admins can update subscriptions" ON user_subscriptions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Política: Apenas admins podem deletar assinaturas
CREATE POLICY "Admins can delete subscriptions" ON user_subscriptions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at_trigger ON user_subscriptions;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_subscriptions_updated_at_trigger
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_subscriptions_updated_at();

-- Função para verificar se assinatura está ativa
CREATE OR REPLACE FUNCTION is_subscription_active(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  sub_status TEXT;
  sub_expiry TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT status, expiry_date INTO sub_status, sub_expiry
  FROM user_subscriptions
  WHERE user_id = user_uuid;
  
  -- Se não tem assinatura, retorna false
  IF sub_status IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica se está ativa e não expirou
  IF sub_status = 'active' AND (sub_expiry IS NULL OR sub_expiry > NOW()) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário na função
COMMENT ON FUNCTION is_subscription_active IS 'Verifica se o usuário tem uma assinatura ativa e não expirada';
