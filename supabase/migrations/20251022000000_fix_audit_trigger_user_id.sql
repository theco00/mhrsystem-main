-- =====================================================
-- FIX: Audit Trigger - Resolver erro de user_id NULL
-- Data: 22/10/2025
-- =====================================================
-- 
-- PROBLEMA: O trigger de auditoria falha quando auth.uid() retorna NULL
-- durante operações de DELETE, causando erro:
-- "null value in column user_id of relation audit_logs violates not-null constraint"
--
-- SOLUÇÃO: Usar o user_id do registro sendo deletado como fallback
-- =====================================================

-- Recriar função de auditoria com fallback para user_id
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Tentar obter user_id do contexto de autenticação
  v_user_id := auth.uid();
  
  -- Se auth.uid() retornar NULL, usar o user_id do registro
  IF v_user_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      v_user_id := OLD.user_id;
    ELSE
      v_user_id := NEW.user_id;
    END IF;
  END IF;
  
  -- Se ainda for NULL, não criar log de auditoria (evitar erro)
  IF v_user_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;
  
  -- Inserir log de auditoria para operações críticas
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values)
    VALUES (v_user_id, TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (v_user_id, TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (v_user_id, TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION public.audit_trigger_function() IS 
'Função de trigger para auditoria automática. Usa auth.uid() quando disponível, 
caso contrário usa o user_id do registro. Evita erros de NOT NULL constraint.';
