-- =====================================================
-- SCRIPT DE VERIFICAÇÃO - Supabase
-- Execute após aplicar a correção
-- =====================================================

-- Verificar se tudo foi criado corretamente
SELECT 
  'Função handle_new_user' as item,
  CASE WHEN EXISTS(
    SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user'
  ) THEN '✅ Existe' ELSE '❌ Não existe' END as status

UNION ALL

SELECT 
  'Trigger on_auth_user_created' as item,
  CASE WHEN EXISTS(
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN '✅ Existe' ELSE '❌ Não existe' END as status

UNION ALL

SELECT 
  'Tabela profiles' as item,
  CASE WHEN EXISTS(
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'profiles' AND table_schema = 'public'
  ) THEN '✅ Existe' ELSE '❌ Não existe' END as status

UNION ALL

SELECT 
  'Tabela user_subscriptions' as item,
  CASE WHEN EXISTS(
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_subscriptions' AND table_schema = 'public'
  ) THEN '✅ Existe' ELSE '❌ Não existe' END as status

UNION ALL

SELECT 
  'Tabela user_roles' as item,
  CASE WHEN EXISTS(
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_roles' AND table_schema = 'public'
  ) THEN '✅ Existe' ELSE '❌ Não existe' END as status;

-- Ver estatísticas
SELECT '============ ESTATÍSTICAS ============' as info;

SELECT 
  'Total de usuários' as metrica,
  COUNT(*)::TEXT as valor
FROM auth.users

UNION ALL

SELECT 
  'Total de perfis' as metrica,
  COUNT(*)::TEXT as valor
FROM public.profiles

UNION ALL

SELECT 
  'Total de subscriptions' as metrica,
  COUNT(*)::TEXT as valor
FROM public.user_subscriptions

UNION ALL

SELECT 
  'Total de roles' as metrica,
  COUNT(*)::TEXT as valor
FROM public.user_roles;
