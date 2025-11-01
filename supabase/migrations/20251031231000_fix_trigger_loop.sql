-- =====================================================
-- CORREÇÃO URGENTE: REMOVER TRIGGER COM LOOP INFINITO
-- Data: 31/10/2024
-- =====================================================

-- 1. REMOVER O TRIGGER PROBLEMÁTICO
DROP TRIGGER IF EXISTS check_subscription_expiration ON profiles;

-- 2. REMOVER A FUNÇÃO DO TRIGGER (não é mais necessária)
DROP FUNCTION IF EXISTS trigger_check_expiration();

-- 3. MANTER A FUNÇÃO check_expired_subscriptions() mas SEM TRIGGER
-- Ela pode ser chamada manualmente ou por um cron job

-- 4. OPCIONAL: Criar uma versão segura do trigger que não causa loop
-- Removido por segurança - melhor usar cron job ou verificação manual

-- =====================================================
-- FIM DA CORREÇÃO
-- =====================================================
