-- Tornar usuário 37f08529-a546-4d05-ad07-69397f80e4dc um administrador

-- 1. Inserir role de admin (se não existir)
INSERT INTO user_roles (user_id, role)
VALUES ('37f08529-a546-4d05-ad07-69397f80e4dc', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Ativar assinatura do admin (acesso total)
INSERT INTO user_subscriptions (
  user_id, 
  status, 
  plan_type, 
  payment_id,
  payment_date,
  expiry_date
)
VALUES (
  '37f08529-a546-4d05-ad07-69397f80e4dc',
  'active',
  'yearly',
  'ADMIN-LIFETIME',
  NOW(),
  '2099-12-31 23:59:59'  -- Expira em 2099 (praticamente vitalício)
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  status = 'active',
  plan_type = 'yearly',
  payment_id = 'ADMIN-LIFETIME',
  expiry_date = '2099-12-31 23:59:59',
  updated_at = NOW();

-- 3. Verificar se foi criado corretamente
SELECT 
  u.email,
  ur.role,
  us.status,
  us.plan_type,
  us.expiry_date
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN user_subscriptions us ON us.user_id = u.id
WHERE u.id = '37f08529-a546-4d05-ad07-69397f80e4dc';
