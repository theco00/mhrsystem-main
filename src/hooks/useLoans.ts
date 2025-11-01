import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextClean';
import { useToast } from '@/hooks/use-toast';
import type { Client } from './useClients';

// Interface do empréstimo do sistema
export interface Loan {
  id: string;
  user_id: string;
  client_id: string;
  amount: number;
  interest_rate: number;
  interest_type: 'daily' | 'weekly' | 'monthly' | 'total';
  installments: number;
  installment_value: number;
  start_date: string;
  status: 'active' | 'paid' | 'overdue';
  remaining_amount: number;
  next_payment_date: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  clients?: Client;
}

/**
 * Hook customizado para gerenciamento de empréstimos:
 * - Busca, cadastro, atualização, exclusão (soft), alteração de status
 * - Fornece feedback via toasts e integra supabase
 * - Pronto para futuras integrações com React Query/Suspense
 */
export function useLoans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper para formatar datas ISO (sem fuso horário)
  const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Busca lista de empréstimos do usuário logado
  const fetchLoans = async () => {
    console.log('[fetchLoans] Iniciando busca de empréstimos...');
    if (!user) {
      console.log('[fetchLoans] Usuário não autenticado, abortando');
      return;
    }
    try {
      // Primeiro buscar TODOS os empréstimos para debug
      const { data: allLoans, error: allError } = await supabase
        .from('loans')
        .select(`*,clients(id,name,phone,email)`)
        .eq('user_id', user.id);
      
      if (!allError) {
        console.log('[fetchLoans] TODOS os empréstimos (sem filtros):', allLoans?.length, 'empréstimos');
        const targetLoan = allLoans?.find((l: any) => l.id === 'dda6039b-6635-4dab-8bff-330a10c472be');
        if (targetLoan) {
          console.log('[fetchLoans] Empréstimo alvo encontrado:', targetLoan);
        }
      }
      
      const { data, error } = await supabase
        .from('loans')
        .select(`*,clients(id,name,phone,email)`) // join simplificado
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      console.log('[fetchLoans] Empréstimos carregados (com filtros):', data?.length, 'empréstimos');
      console.log('[fetchLoans] Dados dos empréstimos:', data);
      setLoans((data as Loan[]) || []);
    } catch (error: any) {
      console.error('[fetchLoans] Erro ao carregar empréstimos:', error);
      toast({ title: 'Erro ao carregar empréstimos', description: error.message, variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (user) {
      fetchLoans().finally(() => setIsLoading(false));
      
      // Setup realtime subscription for loans
      const channel = supabase
        .channel('loans_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'loans',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('[useLoans] Loan change detected via realtime:', payload);
            console.log('[useLoans] Forçando refetch devido a mudança no banco...');
            fetchLoans();
          }
        )
        .subscribe((status) => {
          console.log('[useLoans] Realtime subscription status:', status);
        });
      
      return () => {
        console.log('[useLoans] Removendo canal realtime');
        supabase.removeChannel(channel);
      };
    } else {
      setLoans([]);
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Criação de um novo empréstimo para o usuário corrente
   */
  const addLoan = async (loanData: Omit<Loan, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'clients' | 'deleted_at'>) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('loans')
        .insert({ ...loanData, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      // Abate valor no saldo do caixa
      const { data: currentSettings } = await supabase
        .from('company_settings')
        .select('current_balance')
        .eq('user_id', user.id)
        .single();
      if (currentSettings) {
        const newBalance = (currentSettings.current_balance || 0) - loanData.amount;
        await supabase
          .from('company_settings')
          .update({ current_balance: newBalance })
          .eq('user_id', user.id);
      }
      await fetchLoans();
      toast({ title: 'Empréstimo criado!', description: `Empréstimo foi registrado com sucesso` });
      return data;
    } catch (error: any) {
      toast({ title: 'Erro ao criar empréstimo', description: error.message, variant: 'destructive' });
      return null;
    }
  };

  /**
   * Atualização de dados do empréstimo
   */
  const updateLoan = async (loanId: string, loanData: Partial<Omit<Loan, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'clients' | 'deleted_at'>>) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('loans')
        .update(loanData)
        .eq('id', loanId)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      await fetchLoans();
      toast({ title: 'Empréstimo atualizado!', description: `Empréstimo foi atualizado com sucesso` });
      return data;
    } catch (error: any) {
      toast({ title: 'Erro ao atualizar empréstimo', description: error.message, variant: 'destructive' });
      return null;
    }
  };

  /**
   * Atualiza apenas o status do empréstimo
   */
  const updateLoanStatus = async (loanId: string, status: Loan['status']) => {
    try {
      const { error } = await supabase
        .from('loans')
        .update({ status })
        .eq('id', loanId)
        .eq('user_id', user?.id);
      if (error) throw error;
      await fetchLoans();
      toast({
        title: 'Status atualizado!',
        description: `Empréstimo marcado como ${status}`,
      });
      return true;
    } catch (error: any) {
      toast({ title: 'Erro ao atualizar status', description: error.message, variant: 'destructive' });
      return false;
    }
  };

  /**
   * Soft delete (marca deleted_at) com limpeza de pagamentos pendentes
   */
  const deleteLoan = async (loanId: string) => {
    if (!user) {
      console.error('[deleteLoan] Usuário não autenticado');
      return false;
    }
    
    console.log('[deleteLoan] Iniciando exclusão do empréstimo:', loanId);
    
    try {
      // 1. Buscar o empréstimo
      console.log('[deleteLoan] Buscando empréstimo...');
      const { data: loan, error: loanError } = await supabase
        .from('loans')
        .select('id, amount, status')
        .eq('id', loanId)
        .eq('user_id', user.id)
        .single();
      
      if (loanError) {
        console.error('[deleteLoan] Erro ao buscar empréstimo:', loanError);
        throw loanError;
      }
      
      if (!loan) {
        console.error('[deleteLoan] Empréstimo não encontrado');
        toast({
          title: 'Empréstimo não encontrado',
          description: 'O empréstimo que você tentou excluir não existe mais.',
          variant: 'destructive',
        });
        return false;
      }
      
      console.log('[deleteLoan] Empréstimo encontrado:', loan);

      // 2. Verificar pagamentos
      console.log('[deleteLoan] Verificando pagamentos...');
      const { data: loanPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('id, amount, status')
        .eq('loan_id', loanId)
        .eq('user_id', user.id);
      
      if (paymentsError) {
        console.error('[deleteLoan] Erro ao buscar pagamentos:', paymentsError);
        throw paymentsError;
      }
      
      console.log('[deleteLoan] Pagamentos encontrados:', loanPayments?.length || 0);

      const paidPayments = (loanPayments || []).filter(payment => payment.status === "paid");
      if (paidPayments.length > 0) {
        console.warn('[deleteLoan] Empréstimo possui pagamentos realizados');
        toast({
          title: 'Não é possível excluir',
          description: 'Este empréstimo já possui pagamentos registrados e não pode ser removido para manter o histórico financeiro.',
          variant: 'destructive',
        });
        return false;
      }

      // 3. Excluir pagamentos pendentes
      if (loanPayments && loanPayments.length > 0) {
        console.log('[deleteLoan] Excluindo pagamentos pendentes...');
        const { error: deletePaymentsError } = await supabase
          .from('payments')
          .delete()
          .eq('loan_id', loanId)
          .eq('user_id', user.id);
        
        if (deletePaymentsError) {
          console.error('[deleteLoan] Erro ao excluir pagamentos:', deletePaymentsError);
          throw deletePaymentsError;
        }
        console.log('[deleteLoan] Pagamentos pendentes excluídos com sucesso');
      }

      // 4. Atualizar saldo do caixa (devolver o valor emprestado)
      console.log('[deleteLoan] Atualizando saldo do caixa...');
      const { data: currentSettings, error: settingsError } = await supabase
        .from('company_settings')
        .select('id, current_balance')
        .eq('user_id', user.id)
        .single();
      
      if (!settingsError && currentSettings?.id) {
        const updatedBalance = (currentSettings.current_balance || 0) + Number(loan.amount || 0);
        console.log('[deleteLoan] Novo saldo:', updatedBalance);
        
        const { error: updateBalanceError } = await supabase
          .from('company_settings')
          .update({ current_balance: updatedBalance })
          .eq('id', currentSettings.id);
        
        if (updateBalanceError) {
          console.error('[deleteLoan] Erro ao atualizar saldo:', updateBalanceError);
          throw updateBalanceError;
        }
        console.log('[deleteLoan] Saldo atualizado com sucesso');
      }

      // 5. Marcar empréstimo como excluído (soft delete)
      console.log('[deleteLoan] Marcando empréstimo como excluído...');
      const { error: deleteError } = await supabase
        .from('loans')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', loanId)
        .eq('user_id', user.id);
      
      if (deleteError) {
        console.error('[deleteLoan] Erro ao marcar como excluído:', deleteError);
        throw deleteError;
      }
      
      console.log('[deleteLoan] Empréstimo marcado como excluído com sucesso');

      // 6. Recarregar lista de empréstimos
      console.log('[deleteLoan] Recarregando lista de empréstimos...');
      await fetchLoans();
      
      console.log('[deleteLoan] Exclusão concluída com sucesso!');
      return true;
    } catch (error: any) {
      console.error('[deleteLoan] Erro durante exclusão:', error);
      toast({
        title: 'Erro ao excluir empréstimo',
        description: error?.message || 'Não foi possível excluir o empréstimo. Verifique o console para mais detalhes.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Sugestão para evolução: abstrair para React Query e padronizar loaders/global via Suspense/Boundary futuramente

  // Função para atualizar um empréstimo localmente (otimistic update)
  const updateLoanLocally = (loanId: string, updates: Partial<Loan>) => {
    console.log('[updateLoanLocally] Atualizando empréstimo localmente:', loanId, updates);
    setLoans(prevLoans => 
      prevLoans.map(loan => 
        loan.id === loanId 
          ? { ...loan, ...updates, updated_at: new Date().toISOString() }
          : loan
      )
    );
  };

  return {
    loans,
    isLoading,
    addLoan,
    updateLoan,
    updateLoanStatus,
    deleteLoan,
    refetchLoans: fetchLoans,
    formatDateToISO,
    updateLoanLocally,
  };
}
