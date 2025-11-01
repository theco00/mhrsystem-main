import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  test_start_date: string | null;
  test_end_date: string | null;
  is_test_active: boolean;
  is_renewed: boolean;
  test_days: number;
  google_id: string | null;
  avatar_url: string | null;
  provider: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  isTrial: boolean;
  daysRemaining: number;
  status: string;
  plan: string;
  expiryDate: string | null;
}

class SubscriptionService {
  /**
   * Obtém a assinatura do usuário atual
   */
  async getCurrentSubscription(): Promise<Subscription | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar assinatura:', error);
        return null;
      }

      return data as Subscription;
    } catch (error) {
      console.error('Erro ao obter assinatura:', error);
      return null;
    }
  }

  /**
   * Verifica se o usuário tem assinatura ativa (incluindo trial)
   */
  async isSubscriptionActive(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .rpc('is_subscription_active', { user_uuid: user.id });

      if (error) {
        console.error('Erro ao verificar assinatura:', error);
        return false;
      }

      return data as boolean;
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      return false;
    }
  }

  /**
   * Obtém o status completo da assinatura
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
    try {
      const subscription = await this.getCurrentSubscription();
      
      if (!subscription) {
        return null;
      }

      const isActive = await this.isSubscriptionActive();
      let daysRemaining = 0;

      // Calcular dias restantes
      if (subscription.is_trial && subscription.trial_ends_at) {
        const trialEnd = new Date(subscription.trial_ends_at);
        const now = new Date();
        const diffTime = trialEnd.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (daysRemaining < 0) daysRemaining = 0;
      } else if (subscription.expiry_date) {
        const expiryDate = new Date(subscription.expiry_date);
        const now = new Date();
        const diffTime = expiryDate.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (daysRemaining < 0) daysRemaining = 0;
      }

      return {
        isActive,
        isTrial: subscription.is_trial,
        daysRemaining,
        status: subscription.status,
        plan: subscription.plan,
        expiryDate: subscription.is_trial ? subscription.trial_ends_at : subscription.expiry_date
      };
    } catch (error) {
      console.error('Erro ao obter status da assinatura:', error);
      return null;
    }
  }

  /**
   * Cria uma assinatura de teste grátis para o usuário
   * (Normalmente é criada automaticamente pelo trigger, mas pode ser usada manualmente)
   */
  async createFreeTrial(userId: string, trialDays: number = 7): Promise<boolean> {
    try {
      const trialStartsAt = new Date();
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          status: 'trial',
          is_trial: true,
          trial_starts_at: trialStartsAt.toISOString(),
          trial_ends_at: trialEndsAt.toISOString(),
          trial_days: trialDays,
          plan: 'test_7days',
          plan_type: 'monthly'
        });

      if (error) {
        console.error('Erro ao criar trial:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao criar trial:', error);
      return false;
    }
  }

  /**
   * Ativa a assinatura após pagamento aprovado
   */
  async activateSubscription(
    userId: string,
    paymentId: string,
    plan: 'monthly' | 'quarterly' | 'semiannual',
    planType: 'monthly' | 'yearly' = 'monthly'
  ): Promise<boolean> {
    try {
      const paymentDate = new Date();
      const expiryDate = new Date();

      // Calcular data de expiração baseado no plano
      switch (plan) {
        case 'monthly':
          expiryDate.setMonth(expiryDate.getMonth() + 1);
          break;
        case 'quarterly':
          expiryDate.setMonth(expiryDate.getMonth() + 3);
          break;
        case 'semiannual':
          expiryDate.setMonth(expiryDate.getMonth() + 6);
          break;
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'active',
          is_trial: false,
          payment_id: paymentId,
          payment_date: paymentDate.toISOString(),
          expiry_date: expiryDate.toISOString(),
          plan: plan,
          plan_type: planType
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao ativar assinatura:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao ativar assinatura:', error);
      return false;
    }
  }

  /**
   * Cancela a assinatura do usuário
   */
  async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled'
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao cancelar assinatura:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      return false;
    }
  }

  /**
   * Verifica e atualiza trials expirados
   * (Deve ser chamado periodicamente ou via cron job)
   */
  async checkAndUpdateExpiredTrials(): Promise<void> {
    try {
      await supabase.rpc('check_trial_expiration');
    } catch (error) {
      console.error('Erro ao verificar trials expirados:', error);
    }
  }

  /**
   * Gera link de pagamento da Cakto
   */
  generateCaktoPaymentLink(plan: 'test_7days' | 'monthly' | 'quarterly' | 'semiannual'): string {
    // URL base da Cakto
    const CAKTO_BASE_URL = 'https://pay.cakto.com.br/345a25k_618991';
    
    // Adicionar parâmetros do plano se necessário
    // A Cakto pode aceitar parâmetros customizados via query string
    const params = new URLSearchParams({
      plan: plan,
      source: 'titanjuros_landing'
    });

    return `${CAKTO_BASE_URL}?${params.toString()}`;
  }

  /**
   * Processa webhook da Cakto após pagamento aprovado
   */
  async processCaktoWebhook(webhookData: any): Promise<boolean> {
    try {
      const { payment_id, user_id, plan, status } = webhookData;

      if (status === 'approved' || status === 'paid') {
        // Ativar assinatura
        const success = await this.activateSubscription(
          user_id,
          payment_id,
          plan,
          'monthly'
        );

        return success;
      }

      return false;
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return false;
    }
  }
}

export const subscriptionService = new SubscriptionService();
