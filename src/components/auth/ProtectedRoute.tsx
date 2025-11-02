import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { hasActiveSubscription, isLoading: subLoading } = useSubscription();

  // CORREÇÃO: Aguardar AMBOS os carregamentos completarem
  // Isso evita redirecionamentos prematuros para /subscription-required
  const isLoadingComplete = !authLoading && !subLoading;

  // Mostrar loading enquanto verifica autenticação E assinatura
  if (!isLoadingComplete) {
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

  // Apenas após loading completo: verificar autenticação
  if (!user) {
    console.log('🔒 ProtectedRoute: Usuário não autenticado, redirecionando para /login');
    return <Navigate to="/login" replace />;
  }

  // Apenas após loading completo: verificar assinatura
  if (!hasActiveSubscription) {
    console.log('⚠️ ProtectedRoute: Sem assinatura ativa, redirecionando para /subscription-required');
    return <Navigate to="/subscription-required" replace />;
  }

  // Usuário autenticado E com assinatura ativa - permitir acesso
  console.log('✅ ProtectedRoute: Acesso permitido');
  return <>{children}</>;
}
