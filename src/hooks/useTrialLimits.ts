import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextClean';
import { useFreeTrial } from './useFreeTrial';

export interface TrialLimits {
  maxLoans: number;
  maxClients: number;
  maxDevices: number;
  currentLoans: number;
  currentClients: number;
  canAddLoan: boolean;
  canAddClient: boolean;
  isUnlimited: boolean;
}

export function useTrialLimits() {
  const { user } = useAuth();
  const { isActive } = useFreeTrial();
  const [limits, setLimits] = useState<TrialLimits>({
    maxLoans: 5,
    maxClients: 5,
    maxDevices: 1,
    currentLoans: 0,
    currentClients: 0,
    canAddLoan: true,
    canAddClient: true,
    isUnlimited: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchLimits = async () => {
      try {
        // Se não está em trial ativo, sem limitações
        if (!isActive) {
          setLimits(prev => ({
            ...prev,
            isUnlimited: true,
            canAddLoan: true,
            canAddClient: true
          }));
          setIsLoading(false);
          return;
        }

        // Contar empréstimos
        const { count: loansCount, error: loansError } = await supabase
          .from('loans')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (loansError) {
          console.error('Erro ao contar empréstimos:', loansError);
        }

        // Contar clientes
        const { count: clientsCount, error: clientsError } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (clientsError) {
          console.error('Erro ao contar clientes:', clientsError);
        }

        const currentLoans = loansCount || 0;
        const currentClients = clientsCount || 0;
        const maxLoans = 5;
        const maxClients = 5;

        setLimits({
          maxLoans,
          maxClients,
          maxDevices: 1,
          currentLoans,
          currentClients,
          canAddLoan: currentLoans < maxLoans,
          canAddClient: currentClients < maxClients,
          isUnlimited: false
        });
      } catch (error) {
        console.error('Erro ao buscar limites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLimits();

    // Atualizar quando houver mudanças
    const loansSubscription = supabase
      .channel('loans_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'loans', filter: `user_id=eq.${user.id}` },
        () => fetchLimits()
      )
      .subscribe();

    const clientsSubscription = supabase
      .channel('clients_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'clients', filter: `user_id=eq.${user.id}` },
        () => fetchLimits()
      )
      .subscribe();

    return () => {
      loansSubscription.unsubscribe();
      clientsSubscription.unsubscribe();
    };
  }, [user, isActive]);

  return { limits, isLoading };
}
