import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // ==========================================================================
  // MONITORAR AUTENTICAÇÃO
  // ==========================================================================
  useEffect(() => {
    let isSubscribed = true;
    
    // Buscar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isSubscribed) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });

    // Listener de mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isSubscribed) return;
      
      console.log('🔐 Auth event:', event);
      setSession(session);
      setUser(session?.user ?? null);

      // CORREÇÃO: Implementar lógica de redirecionamento inteligente
      // Apenas redirecionar em eventos específicos para evitar loops
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ Login bem-sucedido:', session.user.email);
        
        // Aguardar um pouco para garantir que o banco está atualizado
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verificar se é um novo usuário ou existente
        try {
          const { data: subscriptionData, error } = await supabase
            .from('user_subscriptions')
            .select('status, trial_ends_at')
            .eq('user_id', session.user.id)
            .single();

          if (error) {
            console.log('👤 Novo usuário detectado - redirecionando para welcome');
            navigate('/welcome', { replace: true });
            return;
          }

          // Verificar se usuário já tem assinatura ativa ou trial ativo
          const hasActiveSubscription = subscriptionData?.status && subscriptionData.status !== 'inactive';
          const hasActiveTrial = subscriptionData?.status === 'trial' && 
                                subscriptionData?.trial_ends_at && 
                                new Date(subscriptionData.trial_ends_at) > new Date();
          
          if (hasActiveSubscription || hasActiveTrial) {
            console.log('🏠 Usuário existente - redirecionando para dashboard');
            navigate('/dashboard', { replace: true });
          } else {
            console.log('👤 Novo usuário ou sem plano - redirecionando para welcome');
            navigate('/welcome', { replace: true });
          }
        } catch (error) {
          console.log('👤 Erro ao verificar perfil, redirecionando para welcome');
          navigate('/welcome', { replace: true });
        }
      }

      if (event === 'SIGNED_OUT') {
        console.log('👋 Logout realizado');
        navigate('/login', { replace: true });
      }
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  // ==========================================================================
  // LOGIN COM EMAIL E SENHA
  // ==========================================================================
  const signInWithEmail = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        
        // Mensagens de erro personalizadas
        let errorMessage = 'Erro ao fazer login';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor, confirme seu email';
        } else {
          errorMessage = error.message;
        }

        toast({
          title: 'Erro no login',
          description: errorMessage,
          variant: 'destructive',
        });

        return { error: errorMessage };
      }

      if (data.user) {
        console.log('✅ Login bem-sucedido:', data.user.email);
        toast({
          title: 'Login realizado!',
          description: 'Bem-vindo de volta!',
        });
      }

      return {};
    } catch (error: any) {
      console.error('💥 Erro inesperado:', error);
      const errorMessage = 'Erro inesperado ao fazer login';
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });

      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // LOGIN COM GOOGLE
  // ==========================================================================
  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    try {
      setIsLoading(true);
      console.log('🚀 Iniciando login com Google...');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ Erro no login Google:', error);
        
        toast({
          title: 'Erro no login',
          description: 'Não foi possível fazer login com Google',
          variant: 'destructive',
        });

        return { error: error.message };
      }

      // OAuth abre uma nova janela - não fazemos nada aqui
      console.log('✅ Redirecionando para Google...');
      return {};
    } catch (error: any) {
      console.error('💥 Erro inesperado no Google login:', error);
      const errorMessage = 'Erro inesperado ao fazer login com Google';
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });

      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // CADASTRO COM EMAIL E SENHA
  // ==========================================================================
  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error?: string }> => {
    try {
      setIsLoading(true);
      console.log('📝 Iniciando cadastro...');

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('❌ Erro no cadastro:', error);
        
        // Mensagens de erro personalizadas
        let errorMessage = 'Erro ao criar conta';
        
        if (error.message.includes('already registered')) {
          errorMessage = 'Este email já está cadastrado';
        } else if (error.message.includes('Password should be')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres';
        } else {
          errorMessage = error.message;
        }

        toast({
          title: 'Erro no cadastro',
          description: errorMessage,
          variant: 'destructive',
        });

        return { error: errorMessage };
      }

      if (data.user) {
        console.log('✅ Cadastro bem-sucedido:', data.user.email);
        
        toast({
          title: 'Conta criada!',
          description: 'Bem-vindo ao TitanJuros!',
        });
      }

      return {};
    } catch (error: any) {
      console.error('💥 Erro inesperado no cadastro:', error);
      const errorMessage = 'Erro inesperado ao criar conta';
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });

      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // LOGOUT
  // ==========================================================================
  const signOut = async () => {
    try {
      setIsLoading(true);
      console.log('👋 Fazendo logout...');
      
      await supabase.auth.signOut();
      
      toast({
        title: 'Logout realizado',
        description: 'Até logo!',
      });
    } catch (error: any) {
      console.error('❌ Erro no logout:', error);
      
      toast({
        title: 'Erro',
        description: 'Erro ao fazer logout',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // VALOR DO CONTEXTO
  // ==========================================================================
  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signInWithEmail,
    signInWithGoogle,
    signUpWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// HOOK PERSONALIZADO
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}
