import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextClean';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { hasActiveSubscription, isLoading: subLoading } = useSubscription();

  // Aguardar carregamento da autenticação e assinatura
  if (authLoading || subLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            Verificando acesso...
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Aguarde enquanto validamos sua assinatura
          </p>
        </div>
      </div>
    );
  }

  // Usuário não autenticado - redirecionar para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Usuário autenticado mas sem assinatura ativa - redirecionar para página de assinatura
  if (!hasActiveSubscription) {
    return <Navigate to="/subscription-required" replace />;
  }

  // Usuário autenticado E com assinatura ativa - permitir acesso
  return <>{children}</>;
}
