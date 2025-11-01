import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextClean';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStatus {
  isActive: boolean;
  isTrial: boolean;
  isExpired: boolean;
  daysRemaining: number;
  subscriptionStatus: string;
  trialEndDate: string | null;
}

export function useSubscriptionStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isActive: false,
    isTrial: false,
    isExpired: true,
    daysRemaining: 0,
    subscriptionStatus: 'inactive',
    trialEndDate: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const checkSubscription = async () => {
      try {
        // SEU USER ID - Admin com acesso infinito
        const ADMIN_USER_ID = '37f08529-a546-4d05-ad07-69397f80e4dc';
        
        // Se for admin, dar acesso total
        if (user.id === ADMIN_USER_ID) {
          setStatus({
            isActive: true,
            isTrial: false,
            isExpired: false,
            daysRemaining: 999,
            subscriptionStatus: 'active',
            trialEndDate: null
          });
          setIsLoading(false);
          return;
        }

        // @ts-ignore - Campos serão adicionados após migração
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('subscription_status, trial_end_date, subscription_end_date')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar profile:', error);
          // Se não encontrar profile, permitir acesso (novo usuário)
          setStatus({
            isActive: true,
            isTrial: false,
            isExpired: false,
            daysRemaining: 0,
            subscriptionStatus: 'inactive',
            trialEndDate: null
          });
          setIsLoading(false);
          return;
        }

        const now = new Date();
        let isActive = false;
        let isTrial = false;
        let isExpired = true;
        let daysRemaining = 0;

        // @ts-ignore - Campos serão adicionados após migração SQL
        // Verificar se é trial
        if (profile?.subscription_status === 'trial' && profile?.trial_end_date) {
          const trialEnd = new Date(profile.trial_end_date);
          const diffTime = trialEnd.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          isTrial = true;
          daysRemaining = diffDays > 0 ? diffDays : 0;
          isActive = diffDays > 0;
          isExpired = diffDays <= 0;
        }
        // Verificar se é assinatura paga ativa
        else if (profile?.subscription_status === 'active' && profile?.subscription_end_date) {
          const subEnd = new Date(profile.subscription_end_date);
          const diffTime = subEnd.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          isActive = diffDays > 0;
          isExpired = diffDays <= 0;
          daysRemaining = diffDays > 0 ? diffDays : 0;
        }
        // Se não tem status definido, permitir acesso (novo usuário)
        else if (!profile?.subscription_status || profile?.subscription_status === 'inactive') {
          isActive = true; // Permitir acesso para escolher plano
          isExpired = false;
        }

        setStatus({
          isActive,
          isTrial,
          isExpired,
          daysRemaining,
          subscriptionStatus: profile?.subscription_status || 'inactive',
          trialEndDate: profile?.trial_end_date || null
        });
      } catch (error) {
        console.error('Erro ao verificar assinatura:', error);
        // Em caso de erro, permitir acesso
        setStatus({
          isActive: true,
          isTrial: false,
          isExpired: false,
          daysRemaining: 0,
          subscriptionStatus: 'inactive',
          trialEndDate: null
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();

    // Verificar a cada 5 minutos
    const interval = setInterval(checkSubscription, 5 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  return { ...status, isLoading };
}
