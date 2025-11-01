import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Subscription {
  id: string;
  user_id: string;
  status: 'trial' | 'active' | 'inactive' | 'cancelled' | 'expired';
  plan: 'test_7days' | 'monthly' | 'quarterly' | 'semiannual';
  plan_type: 'monthly' | 'yearly';
  is_trial: boolean;
  trial_starts_at?: string;
  trial_ends_at?: string;
  trial_days: number;
  payment_id?: string;
  payment_date?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      setHasActiveSubscription(false);
      setIsTrial(false);
      setTrialDaysRemaining(0);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar assinatura:', error);
          setHasActiveSubscription(false);
          setIsTrial(false);
          return;
        }

        if (data) {
          setSubscription(data as any);
          
          // Verificar se está em trial
          const isInTrial = data.status === 'trial' && data.is_trial === true;
          setIsTrial(isInTrial);
          
          // Calcular dias restantes do trial
          if (isInTrial && data.trial_ends_at) {
            const trialEnd = new Date(data.trial_ends_at);
            const now = new Date();
            const diffTime = trialEnd.getTime() - now.getTime();
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setTrialDaysRemaining(daysLeft > 0 ? daysLeft : 0);
          } else {
            setTrialDaysRemaining(0);
          }
          
          // Verificar se está ativa (incluindo trial)
          let isActive = false;
          
          if (data.status === 'trial' && data.is_trial === true) {
            // Trial ativo se não expirou
            const notExpired = !data.trial_ends_at || new Date(data.trial_ends_at) > new Date();
            isActive = notExpired;
          } else if (data.status === 'active') {
            // Assinatura paga ativa se não expirou
            const notExpired = !data.expiry_date || new Date(data.expiry_date) > new Date();
            isActive = notExpired;
          }
          
          setHasActiveSubscription(isActive);
        } else {
          // Usuário não tem registro de assinatura
          setHasActiveSubscription(false);
          setIsTrial(false);
        }
      } catch (error) {
        console.error('Erro ao verificar assinatura:', error);
        setHasActiveSubscription(false);
        setIsTrial(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();

    // Listener para mudanças em tempo real
    const channel = supabase
      .channel('user_subscriptions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  return {
    subscription,
    hasActiveSubscription,
    isTrial,
    trialDaysRemaining,
    isLoading
  };
}
