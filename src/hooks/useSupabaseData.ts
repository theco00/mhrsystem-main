import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useClients } from './useClients';
import { useLoans } from './useLoans';
import { usePayments } from './usePayments';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type { Client } from './useClients';
export type { Loan } from './useLoans';
export type { Payment } from './usePayments';

export function useSupabaseData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings: companySettings } = useCompanySettings();
  
  // Use the refactored hooks
  const {
    clients,
    isLoading: isLoadingClients,
    addClient,
    deleteClient: deleteClientBase,
    refetchClients,
  } = useClients();

  const {
    loans,
    isLoading: isLoadingLoans,
    addLoan,
    updateLoan,
    updateLoanStatus,
    deleteLoan: deleteLoanBase,
    refetchLoans,
    updateLoanLocally,
  } = useLoans();

  const {
    payments,
    isLoading: isLoadingPayments,
    addPayment: addPaymentBase,
    renewLoanDate: renewLoanDateBase,
    refetchPayments,
  } = usePayments();

  const isLoading = isLoadingClients || isLoadingLoans || isLoadingPayments;

  // Wrapper functions to pass additional context
  const deleteClient = (clientId: string) => deleteClientBase(clientId, loans);
  const deleteLoan = async (loanId: string) => {
    const result = await deleteLoanBase(loanId);
    if (result) {
      await refetchPayments();
    }
    return result;
  };
  const addPayment = async (paymentData: any) => {
    const loan = loans.find(l => l.id === paymentData.loan_id);
    console.log('[useSupabaseData.addPayment] Empréstimo encontrado para pagamento:', loan);
    const result = await addPaymentBase(
      paymentData, 
      loan, 
      async () => {
      // Adicionar pequeno delay para garantir que o DB foi atualizado
      console.log('[useSupabaseData.addPayment] Aguardando 500ms antes do refetch...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Forçar múltiplos refetch para garantir atualização
      console.log('[useSupabaseData.addPayment] Iniciando refetch dos loans (tentativa 1)...');
      await refetchLoans();
      
      console.log('[useSupabaseData.addPayment] Aguardando mais 300ms...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('[useSupabaseData.addPayment] Iniciando refetch dos loans (tentativa 2)...');
      await refetchLoans();
      
      console.log('[useSupabaseData.addPayment] Iniciando refetch dos pagamentos...');
      await refetchPayments();
      
      console.log('[useSupabaseData.addPayment] Aguardando mais 300ms...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('[useSupabaseData.addPayment] Iniciando refetch dos clients...');
      await refetchClients();
      
      console.log('[useSupabaseData.addPayment] Todos os refetch concluídos');
    },
    updateLoanLocally // Passar função de atualização local
    );
    console.log('[useSupabaseData.addPayment] Resultado do pagamento:', result);
    return result;
  };
  const renewLoanDate = async (loanId: string, interestAmount: number) => {
    const loan = loans.find(l => l.id === loanId);
    const result = await renewLoanDateBase(loanId, interestAmount, loan, async () => {
      // Forçar refetch dos loans após renovação bem-sucedida
      await refetchLoans();
    });
    return result;
  };

  // Dashboard metrics
  const totalLoaned = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalReceived = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const metrics = {
    initialBalance: companySettings?.initial_balance || 0,
    currentBalance: companySettings?.current_balance || 0,
    totalClients: clients.length,
    activeLoans: loans.filter(loan => loan.status === 'active').length,
    overdueLoans: loans.filter(loan => loan.status === 'overdue').length,
    totalLoaned,
    totalOutstanding: loans.reduce((sum, loan) => sum + loan.remaining_amount, 0),
    totalInterest: loans.reduce((sum, loan) => {
      const paidAmount = loan.amount - loan.remaining_amount;
      const interestAmount = (loan.amount * loan.interest_rate / 100) * (loan.installments / 12);
      const totalExpected = loan.amount + interestAmount;
      const paidInterest = Math.max(0, paidAmount - loan.amount);
      return sum + paidInterest;
    }, 0),
    upcomingPayments: loans.filter(loan => {
      if (loan.status !== 'active') return false;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(today.getDate() + 7);
      
      const paymentDate = new Date(loan.next_payment_date + 'T00:00:00');
      
      return paymentDate >= today && paymentDate <= sevenDaysFromNow;
    }).length,
  };

  return {
    clients,
    loans,
    payments,
    isLoading,
    addClient,
    deleteClient,
    addLoan,
    updateLoan,
    deleteLoan,
    addPayment,
    renewLoanDate,
    updateLoanStatus,
    metrics,
    refetch: async () => {
      await Promise.all([refetchClients(), refetchLoans(), refetchPayments()]);
    }
  };
}
