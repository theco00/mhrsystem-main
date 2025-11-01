import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Interface para o valor do contexto de autenticação
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider do contexto de autenticação
 * Apenas login com Google - sem verificação de email
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Proteção contra loops de redirecionamento
  const MAX_REDIRECT_ATTEMPTS = 3;
  const REDIRECT_RESET_TIME = 60000; // 1 minuto
  
  // Função para verificar se podemos redirecionar (proteção contra loops)
  const canRedirect = (): boolean => {
    try {
      const redirectData = sessionStorage.getItem('redirect_attempts');
      if (!redirectData) return true;
      
      const { count, timestamp } = JSON.parse(redirectData);
      const now = Date.now();
      
      // Reset se passou mais de 1 minuto
      if (now - timestamp > REDIRECT_RESET_TIME) {
        sessionStorage.removeItem('redirect_attempts');
        return true;
      }
      
      // Bloquear se excedeu tentativas
      if (count >= MAX_REDIRECT_ATTEMPTS) {
        console.warn('🚫 Muitas tentativas de redirecionamento. Bloqueando para evitar loop.');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao verificar redirecionamento:', error);
      return true;
    }
  };
  
  // Função para registrar tentativa de redirecionamento
  const registerRedirect = (): void => {
    try {
      const redirectData = sessionStorage.getItem('redirect_attempts');
      const now = Date.now();
      
      if (!redirectData) {
        sessionStorage.setItem('redirect_attempts', JSON.stringify({ count: 1, timestamp: now }));
      } else {
        const { count, timestamp } = JSON.parse(redirectData);
        
        // Reset se passou tempo
        if (now - timestamp > REDIRECT_RESET_TIME) {
          sessionStorage.setItem('redirect_attempts', JSON.stringify({ count: 1, timestamp: now }));
        } else {
          sessionStorage.setItem('redirect_attempts', JSON.stringify({ count: count + 1, timestamp }));
        }
      }
    } catch (error) {
      console.error('Erro ao registrar redirecionamento:', error);
    }
  };

  // Efeito para monitorar status de autenticação do Supabase
  useEffect(() => {
    // Listener de mudanças no auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        try {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Tratar diferentes eventos de autenticação
          switch (event) {
            case 'SIGNED_IN':
              console.log('✅ Usuário autenticado com sucesso:', session?.user?.email);
              
              // Verificação inteligente de redirecionamento
              if (session?.user) {
                const currentPath = window.location.pathname;
                
                // Só redirecionar se estiver em página de login ou raiz
                if (currentPath === '/login' || currentPath === '/') {
                  // Verificar proteção contra loops
                  if (!canRedirect()) {
                    console.error('🚫 Bloqueado por proteção contra loops. Permanecendo na página atual.');
                    toast({
                      title: 'Atenção',
                      description: 'Detectamos múltiplas tentativas de redirecionamento. Por favor, atualize a página.',
                      variant: 'destructive'
                    });
                    return;
                  }
                  
                  console.log('🔍 Verificando perfil do usuário para redirecionamento inteligente...');
                  
                  // Buscar perfil do usuário para verificar status
                  const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('subscription_status, trial_start_date, trial_end_date, first_login_completed')
                    .eq('user_id', session.user.id)
                    .single();
                  
                  if (profileError) {
                    console.warn('⚠️ Erro ao buscar perfil, redirecionando para welcome:', profileError);
                    registerRedirect();
                    navigate('/welcome');
                    return;
                  }
                  
                  // Type assertion: as colunas existem no banco mas o tipo do Supabase não está atualizado
                  const userProfile = profile as any;
                  
                  // Verificar se usuário já tem plano ativo
                  const hasActivePlan = userProfile?.subscription_status === 'active' || 
                                       userProfile?.subscription_status === 'trial' ||
                                       userProfile?.subscription_status === 'trialing';
                  
                  // Verificar se trial está ativo
                  const hasActiveTrial = userProfile?.trial_start_date && userProfile?.trial_end_date &&
                                        new Date(userProfile.trial_end_date) > new Date();
                  
                  // Registrar e redirecionar
                  registerRedirect();
                  
                  if (hasActivePlan || hasActiveTrial) {
                    console.log('✅ Usuário tem plano ativo, redirecionando para /dashboard');
                    navigate('/dashboard');
                  } else {
                    console.log('🎯 Usuário sem plano, redirecionando para /welcome');
                    navigate('/welcome');
                  }
                }
              }
              break;
              
            case 'SIGNED_OUT':
              console.log('👋 Usuário deslogado');
              // Redirecionar para login se não estiver na página de login
              if (window.location.pathname !== '/login') {
                navigate('/login');
              }
              break;
              
            case 'TOKEN_REFRESHED':
              console.log('🔄 Token atualizado');
              break;
              
            case 'USER_UPDATED':
              console.log('👤 Usuário atualizado');
              break;
              
            default:
              console.log('❓ Evento não tratado:', event);
          }
        } catch (error) {
          console.error('💥 Erro ao processar mudança de autenticação:', error);
          toast({ 
            title: 'Erro na autenticação', 
            description: 'Ocorreu um erro ao processar sua autenticação. Tente novamente.', 
            variant: 'destructive' 
          });
        }
      }
    );
    
    // Inicializa sessão do usuário
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Login com Google
  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      console.log('🚀 Iniciando login com Google...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Redirecionar explicitamente para a origem após callback
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      
      if (error) {
        console.error('❌ Erro no login com Google:', error);
        
        // Tratamento específico para diferentes erros
        let errorMessage = error.message;
        let errorTitle = 'Erro no login com Google';
        
        if (error.message.includes('provider')) {
          errorTitle = 'Provedor não configurado';
          errorMessage = 'O login com Google não está configurado corretamente. Contate o suporte.';
        } else if (error.message.includes('redirect')) {
          errorTitle = 'Erro de redirecionamento';
          errorMessage = 'Problema na configuração de redirecionamento. Tente novamente.';
        } else if (error.message.includes('access_denied')) {
          errorTitle = 'Acesso negado';
          errorMessage = 'Você cancelou o login com Google.';
        } else if (error.message.includes('database')) {
          errorTitle = 'Erro no banco de dados';
          errorMessage = 'Erro ao salvar seu perfil. Tente novamente em alguns instantes.';
        }
        
        toast({ 
          title: errorTitle, 
          description: errorMessage, 
          variant: 'destructive' 
        });
        
        return { error: errorMessage };
      }
      
      console.log('✅ Login com Google iniciado, aguardando callback...');
      console.log('📱 URL de OAuth:', data?.url);
      
      return {};
    } catch (error: any) {
      console.error('💥 Erro inesperado no login com Google:', error);
      
      toast({ 
        title: 'Erro inesperado', 
        description: 'Ocorreu um erro inesperado. Tente novamente mais tarde.', 
        variant: 'destructive' 
      });
      
      return { error: error.message || 'Erro inesperado' };
    } finally {
      setIsLoading(false);
    }
  };

  // Login com Email e Senha
  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔐 Iniciando login com email/senha...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Erro no login com email:', error);
        
        let errorMessage = error.message;
        let errorTitle = 'Erro no login';
        
        if (error.message.includes('Invalid login credentials')) {
          errorTitle = 'Credenciais inválidas';
          errorMessage = 'Email ou senha incorretos. Verifique seus dados e tente novamente.';
        } else if (error.message.includes('Email not confirmed')) {
          errorTitle = 'Email não confirmado';
          errorMessage = 'Por favor, confirme seu email antes de fazer login.';
        } else if (error.message.includes('User not found')) {
          errorTitle = 'Usuário não encontrado';
          errorMessage = 'Não encontramos uma conta com este email. Crie uma conta primeiro.';
        }
        
        toast({ 
          title: errorTitle, 
          description: errorMessage, 
          variant: 'destructive' 
        });
        
        return { error: errorMessage };
      }
      
      console.log('✅ Login com email realizado com sucesso:', data.user?.email);
      return {};
    } catch (error: any) {
      console.error('💥 Erro inesperado no login com email:', error);
      
      toast({ 
        title: 'Erro inesperado', 
        description: 'Ocorreu um erro inesperado. Tente novamente mais tarde.', 
        variant: 'destructive' 
      });
      
      return { error: error.message || 'Erro inesperado' };
    } finally {
      setIsLoading(false);
    }
  };

  // Cadastro com Email e Senha
  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      console.log('📝 Iniciando cadastro com email/senha...');
      
      // Criar novo usuário (Supabase valida duplicatas automaticamente)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        }
      });
      
      if (error) {
        console.error('❌ Erro no cadastro:', error);
        
        let errorMessage = error.message;
        let errorTitle = 'Erro no cadastro';
        
        if (error.message.includes('already registered')) {
          errorTitle = 'Email já cadastrado';
          errorMessage = 'Este email já está cadastrado. Faça login ou use a recuperação de senha.';
        } else if (error.message.includes('Password')) {
          errorTitle = 'Senha inválida';
          errorMessage = 'A senha deve ter no mínimo 6 caracteres.';
        } else if (error.message.includes('valid email')) {
          errorTitle = 'Email inválido';
          errorMessage = 'Por favor, insira um email válido.';
        }
        
        toast({ 
          title: errorTitle, 
          description: errorMessage, 
          variant: 'destructive' 
        });
        
        return { error: errorMessage };
      }
      
      console.log('✅ Cadastro realizado com sucesso:', data.user?.email);
      
      // Exibir notificação de sucesso
      toast({ 
        title: '🎉 Conta criada com sucesso!', 
        description: 'Você já pode fazer login e começar a usar o sistema. Não é necessário confirmar seu email.',
        duration: 5000,
      });
      
      // Fazer login automático após cadastro
      console.log('🔄 Fazendo login automático...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1 segundo
      
      const loginResult = await signInWithEmail(email, password);
      if (loginResult.error) {
        console.warn('⚠️ Erro no login automático, usuário pode fazer login manualmente');
      }
      
      return {};
    } catch (error: any) {
      console.error('💥 Erro inesperado no cadastro:', error);
      
      toast({ 
        title: 'Erro inesperado', 
        description: 'Ocorreu um erro ao criar sua conta. Tente novamente mais tarde.', 
        variant: 'destructive' 
      });
      
      return { error: error.message || 'Erro inesperado' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: 'Erro ao deslogar', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para consumir contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
