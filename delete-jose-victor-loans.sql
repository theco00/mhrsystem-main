-- Script para excluir empréstimos do cliente José Victor
-- Execute este SQL no Supabase SQL Editor

-- 1. Primeiro, vamos verificar os empréstimos do José Victor
SELECT 
  l.id as loan_id,
  c.name as client_name,
  l.amount,
  l.status,
  l.remaining_amount,
  (SELECT COUNT(*) FROM payments WHERE loan_id = l.id) as payment_count
FROM loans l
JOIN clients c ON l.client_id = c.id
WHERE c.name ILIKE '%José Victor%'
  AND l.deleted_at IS NULL;

-- 2. Excluir pagamentos associados aos empréstimos do José Victor
DELETE FROM payments
WHERE loan_id IN (
  SELECT l.id
  FROM loans l
  JOIN clients c ON l.client_id = c.id
  WHERE c.name ILIKE '%José Victor%'
    AND l.deleted_at IS NULL
);

-- 3. Fazer soft delete dos empréstimos (marcar como excluído)
UPDATE loans
SET deleted_at = NOW()
WHERE client_id IN (
  SELECT id FROM clients WHERE name ILIKE '%José Victor%'
)
AND deleted_at IS NULL;

-- 4. Verificar se foi excluído com sucesso
SELECT 
  l.id as loan_id,
  c.name as client_name,
  l.deleted_at
FROM loans l
JOIN clients c ON l.client_id = c.id
WHERE c.name ILIKE '%José Victor%';

-- NOTA: Se quiser DELETAR PERMANENTEMENTE (não recomendado), use:
-- DELETE FROM loans WHERE client_id IN (SELECT id FROM clients WHERE name ILIKE '%José Victor%');
