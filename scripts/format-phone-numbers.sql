-- Script SQL para formatar números de telefone existentes no banco de dados
-- Remove caracteres especiais e mantém apenas números

-- ============================================
-- FORMATAÇÃO DE TELEFONES NA TABELA CLIENTS
-- ============================================

-- Ver telefones antes da formatação
SELECT 
  id,
  name,
  phone as phone_before,
  regexp_replace(phone, '[^0-9]', '', 'g') as phone_after,
  length(regexp_replace(phone, '[^0-9]', '', 'g')) as digits_count
FROM clients
WHERE phone IS NOT NULL AND phone != ''
ORDER BY name;

-- Atualizar telefones - REMOVER CARACTERES ESPECIAIS
UPDATE clients
SET phone = regexp_replace(phone, '[^0-9]', '', 'g')
WHERE phone IS NOT NULL 
  AND phone != ''
  AND phone ~ '[^0-9]'; -- Só atualiza se tiver caracteres especiais

-- Verificar resultados
SELECT 
  id,
  name,
  phone,
  length(phone) as digits,
  CASE 
    WHEN length(phone) >= 10 AND length(phone) <= 11 THEN '✅ Válido'
    WHEN length(phone) < 10 THEN '❌ Muito curto'
    WHEN length(phone) > 11 THEN '❌ Muito longo'
    ELSE '❌ Inválido'
  END as status
FROM clients
WHERE phone IS NOT NULL AND phone != ''
ORDER BY status, name;

-- Estatísticas
SELECT 
  CASE 
    WHEN length(phone) >= 10 AND length(phone) <= 11 THEN 'Válidos'
    WHEN length(phone) < 10 THEN 'Muito curtos'
    WHEN length(phone) > 11 THEN 'Muito longos'
    ELSE 'Vazios'
  END as categoria,
  COUNT(*) as quantidade
FROM clients
WHERE phone IS NOT NULL AND phone != ''
GROUP BY categoria
ORDER BY quantidade DESC;

-- ============================================
-- OPCIONAL: LIMPAR TELEFONES INVÁLIDOS
-- ============================================

-- Ver telefones que serão limpos (muito curtos ou muito longos)
SELECT 
  id,
  name,
  phone,
  length(phone) as digits
FROM clients
WHERE phone IS NOT NULL 
  AND phone != ''
  AND (length(phone) < 10 OR length(phone) > 11);

-- CUIDADO: Isso vai limpar telefones inválidos
-- Descomente apenas se tiver certeza
-- UPDATE clients
-- SET phone = NULL
-- WHERE phone IS NOT NULL 
--   AND phone != ''
--   AND (length(phone) < 10 OR length(phone) > 11);

-- ============================================
-- RELATÓRIO FINAL
-- ============================================

SELECT 
  'Total de clientes' as metrica,
  COUNT(*) as valor
FROM clients
UNION ALL
SELECT 
  'Com telefone cadastrado',
  COUNT(*)
FROM clients
WHERE phone IS NOT NULL AND phone != ''
UNION ALL
SELECT 
  'Telefones válidos (10-11 dígitos)',
  COUNT(*)
FROM clients
WHERE phone IS NOT NULL 
  AND phone != ''
  AND length(phone) >= 10 
  AND length(phone) <= 11
UNION ALL
SELECT 
  'Telefones inválidos',
  COUNT(*)
FROM clients
WHERE phone IS NOT NULL 
  AND phone != ''
  AND (length(phone) < 10 OR length(phone) > 11);
