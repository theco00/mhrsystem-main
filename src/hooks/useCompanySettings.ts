import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextClean';
import { useToast } from '@/hooks/use-toast';

// Interface de configuração do sistema e da empresa
export interface CompanySettings {
  id?: string;
  user_id: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  initial_balance?: number;
  current_balance?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Hook customizado para gerenciamento das configurações da empresa:
 * - Busca, update e envio de notificações
 * - Carregamento, feedback e estado isolado
 * - Pronto para ser evoluído para Suspense/React Query/Memo
 */
export function useCompanySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Busca configurações atuais do usuário
  const fetchSettings = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      if (data) {
        setSettings(data as CompanySettings);
      } else {
        // Inicializa com defaults se não existir
        const defaultSettings: Omit<CompanySettings, 'id' | 'created_at' | 'updated_at'> = {
          user_id: user.id,
          company_name: '',
          company_email: '',
          company_phone: '',
          email_notifications: true,
          sms_notifications: false,
          whatsapp_notifications: false,
        };
        setSettings(defaultSettings);
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast({ title: 'Erro ao carregar configurações', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Salva/atualiza configurações da empresa do usuário
   */
  const saveSettings = async (newSettings: Partial<CompanySettings>) => {
    if (!user) return null;
    try {
      const settingsData = { ...settings, ...newSettings, user_id: user.id };
      let result;
      if (settings?.id) {
        // Atualiza config existente
        const { data, error } = await supabase
          .from('company_settings')
          .update(settingsData)
          .eq('id', settings.id)
          .eq('user_id', user.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        // Cria nova config
        const { data, error } = await supabase
          .from('company_settings')
          .insert(settingsData)
          .select()
          .single();
        if (error) throw error;
        result = data;
      }
      setSettings(result as CompanySettings);
      toast({ title: 'Configurações salvas!', description: 'As configurações foram atualizadas com sucesso' });
      return result;
    } catch (error: any) {
      toast({ title: 'Erro ao salvar configurações', description: error.message, variant: 'destructive' });
      return null;
    }
  };

  /**
   * Disparo de notificação de empréstimo via Supabase Functions (email)
   */
  const sendLoanNotification = async (
    clientEmail: string, clientName: string, loanAmount: number, installmentValue: number, dueDate: string
  ) => {
    if (!settings || !settings.email_notifications) {
      console.log('📧 Notificações por email desabilitadas ou configurações não encontradas');
      return;
    }

    console.log('📤 Enviando notificação de empréstimo:', {
      clientName,
      clientEmail,
      loanAmount,
      installmentValue,
      dueDate,
      companyName: settings.company_name,
      companyEmail: settings.company_email
    });

    try {
      const { data, error } = await supabase.functions.invoke('send-loan-notification', {
        body: {
          clientName,
          clientEmail,
          loanAmount,
          installmentValue,
          dueDate,
          companyName: settings.company_name || 'Sua Financeira',
          companyEmail: settings.company_email || 'noreply@example.com',
        }
      });

      if (error) {
        console.error('❌ Erro na invocação da função:', error);
        throw error;
      }

      console.log('✅ Notificação enviada com sucesso:', data);
      toast({ 
        title: 'Notificação enviada!', 
        description: `Email de lembrete enviado para ${clientName}` 
      });
      return data;
    } catch (error: any) {
      console.error('❌ Erro ao enviar notificação:', {
        message: error.message,
        details: error.details || error,
        clientEmail,
        clientName
      });

      // Mensagens de erro mais específicas
      let errorMessage = 'Erro desconhecido ao enviar notificação';
      
      if (error.message?.includes('rate_limit_exceeded')) {
        errorMessage = 'Muitas tentativas. Aguarde alguns segundos e tente novamente.';
      } else if (error.message?.includes('unauthorized') || error.message?.includes('API key')) {
        errorMessage = 'Problema de configuração do serviço de email. Contate o administrador.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Timeout na requisição. Tente novamente.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({ 
        title: 'Erro ao enviar notificação', 
        description: errorMessage, 
        variant: 'destructive' 
      });
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchSettings();
      
      // Setup realtime subscription for company_settings
      const channel = supabase
        .channel('company_settings_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'company_settings',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Company settings change detected:', payload);
            fetchSettings();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setSettings(null);
      setIsLoading(false);
    }
  }, [user]);

  return {
    settings,
    isLoading,
    saveSettings,
    sendLoanNotification,
    refetch: fetchSettings,
  };
}