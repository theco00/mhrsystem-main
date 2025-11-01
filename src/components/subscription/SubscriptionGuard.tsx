import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

/**
 * Componente que verifica se o usuário tem acesso ativo
 * Redireciona para /subscription-required se trial expirou ou assinatura inativa
 */
export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isActive, isExpired, isLoading, isTrial, daysRemaining } = useSubscriptionStatus();

  useEffect(() => {
    if (isLoading) return;

    // Se trial ou assinatura expirou
    if (isExpired && !isActive) {
      toast({
        title: '⚠️ Acesso Expirado',
        description: isTrial 
          ? 'Seu período de teste gratuito terminou. Assine agora para continuar!'
          : 'Sua assinatura expirou. Renove para continuar usando o sistema.',
        variant: 'destructive',
        duration: 5000,
      });

      // Redirecionar para página de assinatura necessária
      navigate('/subscription-required', { replace: true });
    }
    // Avisos de trial próximo do fim
    else if (isTrial && isActive && daysRemaining <= 2) {
      toast({
        title: '⏰ Trial Expirando',
        description: `Restam apenas ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'} do seu teste grátis!`,
        duration: 7000,
      });
    }
  }, [isActive, isExpired, isLoading, isTrial, daysRemaining, navigate, toast]);

  // Mostrar loading enquanto verifica
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50/20 to-sky-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Se não tem acesso, não renderiza nada (já redirecionou)
  if (isExpired && !isActive) {
    return null;
  }

  // Se tem acesso, renderiza o conteúdo
  return <>{children}</>;
}
