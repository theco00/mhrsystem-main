import { useState, useEffect } from 'react';
import { freeTrialService, TrialStatus } from '@/services/freeTrialService';
import { useAuth } from '@/contexts/AuthContextClean';

export function useFreeTrial() {
  const { user } = useAuth();
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      setTrialStatus(null);
      return;
    }

    const fetchTrialStatus = async () => {
      try {
        const status = await freeTrialService.getTrialStatus();
        setTrialStatus(status);
      } catch (error) {
        console.error('Erro ao buscar status do trial:', error);
        setTrialStatus(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrialStatus();

    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchTrialStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const renewTrial = async () => {
    try {
      const success = await freeTrialService.renewTrial();
      if (success) {
        const status = await freeTrialService.getTrialStatus();
        setTrialStatus(status);
      }
      return success;
    } catch (error) {
      console.error('Erro ao renovar trial:', error);
      return false;
    }
  };

  return {
    trialStatus,
    isLoading,
    renewTrial,
    isActive: trialStatus?.isActive ?? false,
    daysRemaining: trialStatus?.daysRemaining ?? 0,
    canRenew: trialStatus?.canRenew ?? false,
    isRenewed: trialStatus?.isRenewed ?? false,
  };
}
