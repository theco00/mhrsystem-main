-- =====================================================
-- REESTRUTURAÇÃO COMPLETA DO BANCO DE DADOS
-- Tiger System - Migração de Otimização e Limpeza
-- Data: 14/10/2025
-- =====================================================

-- 1. REMOÇÃO DE FUNÇÕES NÃO UTILIZADAS
-- =====================================================

-- Remover função get_user_roles que não está sendo utilizada no código
DROP FUNCTION IF EXISTS public.get_user_roles(uuid);

-- 2. OTIMIZAÇÃO DE ÍNDICES
-- =====================================================

-- Índices compostos para melhorar performance das consultas mais frequentes

-- Clientes: Busca por usuário e status (excluindo soft delete)
CREATE INDEX IF NOT EXISTS idx_clients_user_status_active 
ON public.clients(user_id, status) 
WHERE deleted_at IS NULL;

-- Clientes: Busca por CPF (consultas de validação)
CREATE INDEX IF NOT EXISTS idx_clients_cpf 
ON public.clients(cpf) 
WHERE deleted_at IS NULL;

-- Empréstimos: Busca por usuário e status
CREATE INDEX IF NOT EXISTS idx_loans_user_status 
ON public.loans(user_id, status) 
WHERE deleted_at IS NULL;

-- Empréstimos: Busca por cliente
CREATE INDEX IF NOT EXISTS idx_loans_client_id 
ON public.loans(client_id) 
WHERE deleted_at IS NULL;

-- Empréstimos: Busca por data de próximo pagamento (para notificações)
CREATE INDEX IF NOT EXISTS idx_loans_next_payment_date 
ON public.loans(next_payment_date, status) 
WHERE deleted_at IS NULL AND status = 'active';

-- Pagamentos: Busca por empréstimo e status
CREATE INDEX IF NOT EXISTS idx_payments_loan_status 
ON public.payments(loan_id, status);

-- Pagamentos: Busca por usuário e data (relatórios)
CREATE INDEX IF NOT EXISTS idx_payments_user_date 
ON public.payments(user_id, payment_date);

-- Configurações da empresa: Busca por usuário (única por usuário)
CREATE UNIQUE INDEX IF NOT EXISTS idx_company_settings_user_unique 
ON public.company_settings(user_id);

-- Audit logs: Otimização para consultas por usuário e data
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_table_date 
ON public.audit_logs(user_id, table_name, created_at);

-- 3. OTIMIZAÇÃO DE CONSTRAINTS
-- =====================================================

-- Adicionar constraint para garantir que installment_value seja positivo
ALTER TABLE public.loans 
ADD CONSTRAINT check_loans_installment_value_positive 
CHECK (installment_value > 0);

-- Adicionar constraint para garantir que amount seja positivo
ALTER TABLE public.loans 
ADD CONSTRAINT check_loans_amount_positive 
CHECK (amount > 0);

-- Adicionar constraint para garantir que remaining_amount não seja negativo
ALTER TABLE public.loans 
ADD CONSTRAINT check_loans_remaining_amount_non_negative 
CHECK (remaining_amount >= 0);

-- Adicionar constraint para garantir que installments seja positivo
ALTER TABLE public.loans 
ADD CONSTRAINT check_loans_installments_positive 
CHECK (installments > 0);

-- Adicionar constraint para garantir que interest_rate não seja negativo
ALTER TABLE public.loans 
ADD CONSTRAINT check_loans_interest_rate_non_negative 
CHECK (interest_rate >= 0);

-- Adicionar constraint para pagamentos com valor positivo
ALTER TABLE public.payments 
ADD CONSTRAINT check_payments_amount_positive 
CHECK (amount > 0);

-- Adicionar constraint para installment_number positivo
ALTER TABLE public.payments 
ADD CONSTRAINT check_payments_installment_number_positive 
CHECK (installment_number > 0);

-- Adicionar constraint para credit_score válido (0-1000)
ALTER TABLE public.clients 
ADD CONSTRAINT check_clients_credit_score_range 
CHECK (credit_score >= 0 AND credit_score <= 1000);

-- Adicionar constraint para income não negativo
ALTER TABLE public.clients 
ADD CONSTRAINT check_clients_income_non_negative 
CHECK (income >= 0);

-- 4. MELHORIAS NAS POLÍTICAS RLS
-- =====================================================

-- Atualizar política de visualização de empréstimos para incluir dados do cliente
DROP POLICY IF EXISTS "Users can view their own loans" ON public.loans;
CREATE POLICY "Users can view their own loans"
ON public.loans
FOR SELECT
USING (
  auth.uid() = user_id 
  AND deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.id = loans.client_id 
    AND c.user_id = auth.uid() 
    AND c.deleted_at IS NULL
  )
);

-- 5. FUNÇÕES UTILITÁRIAS OTIMIZADAS
-- =====================================================

-- Função para calcular próxima data de pagamento
CREATE OR REPLACE FUNCTION public.calculate_next_payment_date(
  start_date DATE,
  installment_number INTEGER,
  interest_type TEXT DEFAULT 'monthly'
)
RETURNS DATE
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CASE interest_type
    WHEN 'daily' THEN
      RETURN start_date + (installment_number * INTERVAL '1 day');
    WHEN 'weekly' THEN
      RETURN start_date + (installment_number * INTERVAL '1 week');
    WHEN 'monthly' THEN
      RETURN start_date + (installment_number * INTERVAL '1 month');
    ELSE
      RETURN start_date + (installment_number * INTERVAL '1 month');
  END CASE;
END;
$$;

-- Função para obter estatísticas do usuário (otimizada)
CREATE OR REPLACE FUNCTION public.get_user_statistics(user_uuid UUID)
RETURNS TABLE(
  total_clients BIGINT,
  active_loans BIGINT,
  overdue_loans BIGINT,
  total_loaned NUMERIC,
  total_received NUMERIC,
  current_balance NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.clients WHERE user_id = user_uuid AND deleted_at IS NULL),
    (SELECT COUNT(*) FROM public.loans WHERE user_id = user_uuid AND status = 'active' AND deleted_at IS NULL),
    (SELECT COUNT(*) FROM public.loans WHERE user_id = user_uuid AND status = 'overdue' AND deleted_at IS NULL),
    (SELECT COALESCE(SUM(amount), 0) FROM public.loans WHERE user_id = user_uuid AND deleted_at IS NULL),
    (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE user_id = user_uuid AND status = 'paid'),
    (SELECT COALESCE(current_balance, 0) FROM public.company_settings WHERE user_id = user_uuid LIMIT 1);
END;
$$;

-- 6. TRIGGERS DE AUDITORIA AUTOMÁTICA
-- =====================================================

-- Função para auditoria automática
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir log de auditoria para operações críticas
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Aplicar triggers de auditoria nas tabelas críticas
CREATE TRIGGER audit_clients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_loans_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_payments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- 7. VIEWS PARA CONSULTAS COMPLEXAS
-- =====================================================

-- View para empréstimos com dados do cliente
CREATE OR REPLACE VIEW public.loans_with_client AS
SELECT 
  l.*,
  c.name as client_name,
  c.email as client_email,
  c.phone as client_phone,
  c.cpf as client_cpf
FROM public.loans l
JOIN public.clients c ON l.client_id = c.id
WHERE l.deleted_at IS NULL AND c.deleted_at IS NULL;

-- View para estatísticas por usuário
CREATE OR REPLACE VIEW public.user_dashboard_stats AS
SELECT 
  l.user_id,
  COUNT(DISTINCT c.id) as total_clients,
  COUNT(DISTINCT CASE WHEN l.status = 'active' THEN l.id END) as active_loans,
  COUNT(DISTINCT CASE WHEN l.status = 'overdue' THEN l.id END) as overdue_loans,
  COALESCE(SUM(DISTINCT l.amount), 0) as total_loaned,
  COALESCE(SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END), 0) as total_received
FROM public.loans l
LEFT JOIN public.clients c ON l.client_id = c.id AND c.deleted_at IS NULL
LEFT JOIN public.payments p ON l.id = p.loan_id
WHERE l.deleted_at IS NULL
GROUP BY l.user_id;

-- 8. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.clients IS 'Tabela de clientes do sistema financeiro';
COMMENT ON TABLE public.loans IS 'Tabela de empréstimos com relacionamento para clientes';
COMMENT ON TABLE public.payments IS 'Tabela de pagamentos vinculados aos empréstimos';
COMMENT ON TABLE public.company_settings IS 'Configurações da empresa por usuário';
COMMENT ON TABLE public.user_roles IS 'Sistema de roles e permissões';
COMMENT ON TABLE public.audit_logs IS 'Logs de auditoria para operações críticas';

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Função trigger para atualizar automaticamente updated_at';
COMMENT ON FUNCTION public.handle_new_user() IS 'Função trigger para criar perfil automaticamente';
COMMENT ON FUNCTION public.has_role(uuid, app_role) IS 'Função para verificar se usuário possui role específica';
COMMENT ON FUNCTION public.calculate_next_payment_date(DATE, INTEGER, TEXT) IS 'Calcula próxima data de pagamento baseada no tipo de juros';
COMMENT ON FUNCTION public.get_user_statistics(UUID) IS 'Retorna estatísticas consolidadas do usuário';

-- =====================================================
-- FIM DA REESTRUTURAÇÃO
-- =====================================================

-- Atualizar estatísticas das tabelas para otimização do query planner
ANALYZE public.clients;
ANALYZE public.loans;
ANALYZE public.payments;
ANALYZE public.company_settings;
ANALYZE public.user_roles;
ANALYZE public.audit_logs;