-- Verificar e recriar a função process_payment para garantir que está atualizando corretamente

-- Primeiro, dropar a função se existir
DROP FUNCTION IF EXISTS process_payment;

-- Criar a função process_payment atualizada
CREATE OR REPLACE FUNCTION process_payment(
  p_loan_id UUID,
  p_user_id UUID,
  p_payment_amount DECIMAL,
  p_payment_date DATE,
  p_installment_number INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_loan RECORD;
  v_payment_id UUID;
  v_new_remaining_amount DECIMAL;
  v_new_status TEXT;
  v_next_payment_date DATE;
  v_company_settings RECORD;
BEGIN
  -- 1. Buscar o empréstimo
  SELECT * INTO v_loan
  FROM loans
  WHERE id = p_loan_id 
    AND user_id = p_user_id
    AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Empréstimo não encontrado';
  END IF;
  
  -- 2. Calcular novo saldo devedor
  v_new_remaining_amount := GREATEST(0, v_loan.remaining_amount - p_payment_amount);
  
  -- 3. Determinar novo status
  IF v_new_remaining_amount = 0 THEN
    v_new_status := 'paid';
    v_next_payment_date := v_loan.next_payment_date; -- Mantém a data atual se quitado
  ELSE
    v_new_status := 'active';
    -- Calcular próxima data de pagamento (adiciona 1 mês)
    v_next_payment_date := v_loan.next_payment_date + INTERVAL '1 month';
  END IF;
  
  -- 4. Inserir o pagamento
  INSERT INTO payments (
    loan_id,
    user_id,
    amount,
    payment_date,
    installment_number,
    status
  ) VALUES (
    p_loan_id,
    p_user_id,
    p_payment_amount,
    p_payment_date,
    p_installment_number,
    'paid'
  ) RETURNING id INTO v_payment_id;
  
  -- 5. Atualizar o empréstimo
  UPDATE loans
  SET 
    remaining_amount = v_new_remaining_amount,
    status = v_new_status,
    next_payment_date = v_next_payment_date,
    updated_at = NOW()
  WHERE id = p_loan_id
    AND user_id = p_user_id;
  
  -- 6. Atualizar saldo da empresa (adiciona o valor recebido)
  SELECT * INTO v_company_settings
  FROM company_settings
  WHERE user_id = p_user_id;
  
  IF FOUND THEN
    UPDATE company_settings
    SET 
      current_balance = COALESCE(current_balance, 0) + p_payment_amount,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  -- 7. Retornar resultado
  RETURN jsonb_build_object(
    'success', true,
    'payment_id', v_payment_id,
    'new_remaining_amount', v_new_remaining_amount,
    'new_status', v_new_status,
    'next_payment_date', v_next_payment_date
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao processar pagamento: %', SQLERRM;
END;
$$;

-- Conceder permissões necessárias
GRANT EXECUTE ON FUNCTION process_payment TO authenticated;
GRANT EXECUTE ON FUNCTION process_payment TO anon;
