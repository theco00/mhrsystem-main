import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Interface Payment do sistema
export interface Payment {
  id: string;
  user_id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  installment_number: number;
  status: 'paid' | 'pending' | 'overdue';
  created_at: string;
  updated_at: string;
}

/**
 * Hook customizado para controle e registro de pagamentos:
 * - Busca todos os pagamentos do usuário
 * - Permite adicionar pagamentos e renovar parcelas (juros)
 * - Feedback via toasts
 * - Modular e pronto para extensão futura (React Query/Suspense)
 */
export function usePayments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper: Retorna data ISO (yyyy-mm-dd)
  const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Carregar lista de pagamentos do usuário atual
  const fetchPayments = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPayments((data as Payment[]) || []);
    } catch (error: any) {
      toast({ title: 'Erro ao carregar pagamentos', description: error.message, variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (user) {
      fetchPayments().finally(() => setIsLoading(false));
      
      // Setup realtime subscription for payments
      const channel = supabase
        .channel('payments_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payments',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Payment change detected:', payload);
            fetchPayments();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setPayments([]);
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Adiciona pagamento e atualiza saldo da empresa e status/parcelas do empréstimo vinculado
   */
  const addPayment = async (
    paymentData: Omit<Payment, 'id' | 'user_id' | 'created_at' | 'updated_at'>, 
    loan: any, 
    onSuccess?: () => void,
    updateLoanLocally?: (loanId: string, updates: any) => void
  ) => {
    if (!user) {
      console.error('[addPayment] Usuário não autenticado');
      return null;
    }
    
    console.log('[addPayment] Iniciando registro de pagamento:', paymentData);
    console.log('[addPayment] Usando função RPC para processar pagamento de forma atômica');
    
    try {
      // Usar função RPC do Postgres para processar tudo de uma vez
      const { data, error } = await supabase.rpc('process_payment', {
        p_loan_id: paymentData.loan_id,
        p_user_id: user.id,
        p_payment_amount: paymentData.amount,
        p_payment_date: paymentData.payment_date,
        p_installment_number: paymentData.installment_number
      });
      
      if (error) {
        console.error('[addPayment] Erro ao processar pagamento via RPC:', error);
        throw error;
      }
      
      console.log('[addPayment] Pagamento processado com sucesso via RPC:', data);
      
      // Verificar manualmente o status do empréstimo após o pagamento
      console.log('[addPayment] Verificando status do empréstimo após pagamento...');
      const { data: updatedLoan, error: checkError } = await supabase
        .from('loans')
        .select('id, status, remaining_amount, next_payment_date')
        .eq('id', paymentData.loan_id)
        .single();
      
      if (checkError) {
        console.error('[addPayment] Erro ao verificar status do empréstimo:', checkError);
      } else {
        console.log('[addPayment] Status do empréstimo após pagamento:', updatedLoan);
        
        // ATUALIZAÇÃO OTIMISTA: Atualizar o estado local imediatamente
        if (updateLoanLocally && updatedLoan) {
          console.log('[addPayment] Atualizando estado local do empréstimo IMEDIATAMENTE...');
          updateLoanLocally(paymentData.loan_id, {
            status: updatedLoan.status,
            remaining_amount: updatedLoan.remaining_amount,
            next_payment_date: updatedLoan.next_payment_date,
          });
          console.log('[addPayment] Estado local atualizado!');
        }
      }
      
      // Recarregar lista de pagamentos
      await fetchPayments();
      
      // Chamar callback de sucesso para forçar refetch dos loans
      if (onSuccess) {
        console.log('[addPayment] Chamando callback de sucesso para atualizar loans...');
        await onSuccess();
      }
      
      console.log('[addPayment] Pagamento registrado com sucesso!');
      toast({ 
        title: 'Pagamento registrado!', 
        description: `Pagamento de R$ ${paymentData.amount.toFixed(2)} foi registrado com sucesso` 
      });
      
      return data;
    } catch (error: any) {
      console.error('[addPayment] Erro durante registro de pagamento:', error);
      toast({ 
        title: 'Erro ao registrar pagamento', 
        description: error.message || 'Não foi possível registrar o pagamento. Verifique o console para mais detalhes.', 
        variant: 'destructive' 
      });
      return null;
    }
  };

  /**
   * Renova data de vencimento de empréstimo (+juros)
   */
  const renewLoanDate = async (loanId: string, interestAmount: number, loan: any, onSuccess?: () => void) => {
    if (!user) {
      console.error('[renewLoanDate] Usuário não autenticado');
      return null;
    }
    
    console.log('[renewLoanDate] Iniciando renovação de empréstimo:', loanId);
    console.log('[renewLoanDate] Valor dos juros:', interestAmount);
    
    try {
      // 1. Atualizar data de vencimento (próximo mês)
      console.log('[renewLoanDate] Atualizando data de vencimento...');
      const currentDate = new Date(loan.next_payment_date + 'T00:00:00');
      const newPaymentDate = new Date(currentDate);
      newPaymentDate.setMonth(newPaymentDate.getMonth() + 1);
      
      console.log('[renewLoanDate] Nova data:', formatDateToISO(newPaymentDate));
      
      const { error: updateLoanError } = await supabase
        .from('loans')
        .update({ next_payment_date: formatDateToISO(newPaymentDate) })
        .eq('id', loanId)
        .eq('user_id', user.id);
      
      if (updateLoanError) {
        console.error('[renewLoanDate] Erro ao atualizar data:', updateLoanError);
        throw updateLoanError;
      }
      
      console.log('[renewLoanDate] Data atualizada com sucesso');
      
      // 2. Adicionar juros ao saldo
      console.log('[renewLoanDate] Atualizando saldo do caixa...');
      const { data: currentSettings, error: settingsError } = await supabase
        .from('company_settings')
        .select('current_balance')
        .eq('user_id', user.id)
        .single();
      
      if (settingsError) {
        console.error('[renewLoanDate] Erro ao buscar configurações:', settingsError);
        throw settingsError;
      }
      
      if (currentSettings) {
        const newBalance = (currentSettings.current_balance || 0) + interestAmount;
        console.log('[renewLoanDate] Novo saldo:', newBalance);
        
        const { error: updateBalanceError } = await supabase
          .from('company_settings')
          .update({ current_balance: newBalance })
          .eq('user_id', user.id);
        
        if (updateBalanceError) {
          console.error('[renewLoanDate] Erro ao atualizar saldo:', updateBalanceError);
          throw updateBalanceError;
        }
        
        console.log('[renewLoanDate] Saldo atualizado com sucesso');
      }
      
      // 3. Registrar pagamento de juros
      console.log('[renewLoanDate] Registrando pagamento de juros...');
      
      // Buscar o maior installment_number existente para este empréstimo
      const { data: existingPayments } = await supabase
        .from('payments')
        .select('installment_number')
        .eq('loan_id', loanId)
        .order('installment_number', { ascending: false })
        .limit(1);
      
      const nextInstallmentNumber = existingPayments && existingPayments.length > 0 
        ? existingPayments[0].installment_number + 1 
        : 1;
      
      console.log('[renewLoanDate] Número da parcela (juros):', nextInstallmentNumber);
      
      const { data, error } = await supabase
        .from('payments')
        .insert({
          loan_id: loanId,
          amount: interestAmount,
          payment_date: new Date().toISOString().split('T')[0],
          installment_number: nextInstallmentNumber,
          status: 'paid',
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) {
        console.error('[renewLoanDate] Erro ao registrar pagamento:', error);
        throw error;
      }
      
      console.log('[renewLoanDate] Pagamento registrado com sucesso');
      
      // 4. Recarregar pagamentos
      console.log('[renewLoanDate] Recarregando lista de pagamentos...');
      await fetchPayments();
      
      // Chamar callback de sucesso para forçar refetch dos loans
      if (onSuccess) {
        console.log('[renewLoanDate] Chamando callback de sucesso para atualizar loans...');
        await onSuccess();
      }
      
      console.log('[renewLoanDate] Renovação concluída com sucesso!');
      toast({ 
        title: 'Juros pagos!', 
        description: `Pagamento de juros de R$ ${interestAmount.toFixed(2)} registrado. Data renovada para ${newPaymentDate.toLocaleDateString('pt-BR')}` 
      });
      
      return data;
    } catch (error: any) {
      console.error('[renewLoanDate] Erro durante renovação:', error);
      toast({ 
        title: 'Erro ao renovar empréstimo', 
        description: error.message || 'Não foi possível renovar o empréstimo. Verifique o console para mais detalhes.', 
        variant: 'destructive' 
      });
      return null;
    }
  };

  return {
    payments,
    isLoading,
    addPayment,
    renewLoanDate,
    refetchPayments: fetchPayments,
  };
}
