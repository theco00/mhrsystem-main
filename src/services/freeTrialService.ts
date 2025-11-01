import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  first_login_completed: boolean;
  email_verified: boolean;
  test_start_date: string | null;
  test_end_date: string | null;
  is_test_active: boolean;
  is_renewed: boolean;
  test_days: number;
  google_id: string | null;
  provider: string;
  subscription_status: string;
  subscription_plan: string;
  trial_start_date: string | null;
  trial_end_date: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  cakto_subscription_id: string | null;
  trial_renewed: boolean;
}

export interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  startDate: string | null;
  endDate: string | null;
  isRenewed: boolean;
  canRenew: boolean;
}

class FreeTrialService {
  /**
   * Obtém o perfil do usuário atual
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      return null;
    }
  }

  /**
   * Verifica se o teste grátis está ativo
   */
  async isTrialActive(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .rpc('is_trial_active', { user_uuid: user.id });

      if (error) {
        console.error('Erro ao verificar teste:', error);
        return false;
      }

      return data as boolean;
    } catch (error) {
      console.error('Erro ao verificar teste:', error);
      return false;
    }
  }

  /**
   * Obtém o status completo do teste grátis
   */
  async getTrialStatus(): Promise<TrialStatus | null> {
    try {
      const profile = await this.getCurrentUserProfile();
      
      if (!profile) {
        return null;
      }

      const isActive = await this.isTrialActive();
      let daysRemaining = 0;

      // Calcular dias restantes
      if (profile.is_test_active && profile.test_end_date) {
        const endDate = new Date(profile.test_end_date);
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (daysRemaining < 0) daysRemaining = 0;
      }

      // Verificar se pode renovar (exemplo: apenas uma renovação permitida)
      const canRenew = !profile.is_renewed && !isActive;

      return {
        isActive,
        daysRemaining,
        startDate: profile.test_start_date,
        endDate: profile.test_end_date,
        isRenewed: profile.is_renewed,
        canRenew
      };
    } catch (error) {
      console.error('Erro ao obter status do teste:', error);
      return null;
    }
  }

  /**
   * Renova o teste grátis
   */
  async renewTrial(days: number = 7): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .rpc('renew_free_trial', { 
          user_uuid: user.id,
          days: days
        });

      if (error) {
        console.error('Erro ao renovar teste:', error);
        return false;
      }

      return data as boolean;
    } catch (error) {
      console.error('Erro ao renovar teste:', error);
      return false;
    }
  }

  /**
   * Obtém dias restantes do teste
   */
  async getDaysRemaining(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return 0;
      }

      const { data, error } = await supabase
        .rpc('get_trial_days_remaining', { user_uuid: user.id });

      if (error) {
        console.error('Erro ao obter dias restantes:', error);
        return 0;
      }

      return data as number;
    } catch (error) {
      console.error('Erro ao obter dias restantes:', error);
      return 0;
    }
  }

  /**
   * Login com Google
   */
  async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Não especificar redirectTo aqui para deixar o listener do AuthContext cuidar
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Erro no login com Google:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verifica se usuário está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  /**
   * Faz logout
   */
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  /**
   * Verifica se deve redirecionar para renovação
   */
  async shouldRedirectToRenewal(): Promise<boolean> {
    const status = await this.getTrialStatus();
    
    if (!status) {
      return false;
    }

    // Redirecionar se teste expirou e não está ativo
    return !status.isActive && status.daysRemaining === 0;
  }

  /**
   * Verifica se deve mostrar aviso de expiração
   */
  async shouldShowExpirationWarning(): Promise<boolean> {
    const status = await this.getTrialStatus();
    
    if (!status) {
      return false;
    }

    // Mostrar aviso se faltam 3 dias ou menos
    return status.isActive && status.daysRemaining <= 3 && status.daysRemaining > 0;
  }
}

export const freeTrialService = new FreeTrialService();
