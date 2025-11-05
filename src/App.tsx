import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { RolesProvider } from "./contexts/RolesContext";
import { ThemeProvider } from "./providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import LoginPage from "./components/auth/LoginPage";
import SignUpPage from "./pages/SignUpPage"; // Página de cadastro
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { SubscriptionRequired } from "./components/subscription/SubscriptionRequired";
import { SubscriptionGuard } from "./components/subscription/SubscriptionGuard";
import MainLayout from "./components/layout/MainLayout";
import NotFound from "./pages/NotFound";
import LandingPage from "./components/landing/LandingPage"; // Nova landing page ultra-moderna integrada
import ThankYouPage from "./components/landing/ThankYouPage"; // Nova página Thank You ultra-moderna
import ProductDelivery from "./pages/ProductDeliveryNew";
import WelcomePage from "./pages/WelcomePageNew"; // Página de boas-vindas após login com seleção de planos
import ProfilePage from "./pages/ProfilePage"; // Página de perfil do usuário
import HelpPage from "./pages/HelpPage"; // Página de ajuda e suporte
import AuthErrorPage from "./pages/AuthErrorPage"; // Página de erro de autenticação

// Import das views/páginas
import DashboardView from "./components/views/DashboardView";
import ClientsView from "./components/views/ClientsView";
import LoansView from "./components/views/LoansView";
import PaymentsView from "./components/views/PaymentsView";
import CalculatorView from "./components/views/CalculatorView";
import SettingsView from "./components/views/SettingsView";
import UpcomingPaymentsView from "./components/views/UpcomingPaymentsView";
import { AdminPanel } from "./components/admin/AdminPanel";

// Configuração do React Query com opções otimizadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
      retry: (failureCount, error: any) => {
        // Não tenta novamente para erros 4xx (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

/**
 * Componente de loading centralizado
 * Reutilizável em toda a aplicação
 */
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    </div>
  );
}

/**
 * Componente principal do conteúdo da aplicação
 * Gerencia autenticação e estrutura de rotas públicas e protegidas
 */
function AppContent() {
  const { user, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Rota Raiz - Landing page pública */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Página de Agradecimento - Após compra */}
      <Route path="/thank-you" element={<ThankYouPage />} />
      
      {/* Página de Boas-Vindas - Após primeiro login */}
      <Route path="/welcome" element={user ? <WelcomePage /> : <Navigate to="/login" replace />} />
      
      {/* Rota de Login - CORREÇÃO: Navegar direto para dashboard após login */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      
      {/* Rota de Cadastro */}
      <Route path="/cadastro" element={user ? <Navigate to="/dashboard" replace /> : <SignUpPage />} />
      
      {/* Página de Entrega do Produto - Protegida */}
      <Route path="/produto" element={user ? <ProductDelivery /> : <Navigate to="/login" replace />} />
      
      {/* Página de Erro de Autenticação */}
      <Route path="/auth-error" element={<AuthErrorPage />} />
      
      {/* Página de Assinatura Necessária */}
      <Route path="/subscription-required" element={<SubscriptionRequired />} />
      
      {/* Rotas Protegidas - Requerem autenticação E assinatura ativa */}
      {user ? (
        <>
          <Route element={<ProtectedRoute><SubscriptionGuard><RolesProvider><MainLayout /></RolesProvider></SubscriptionGuard></ProtectedRoute>}>
            {/* Dashboard */}
            <Route path="dashboard" element={<DashboardView />} />
            
            {/* Gestão de Clientes */}
            <Route path="clients" element={<ClientsView />} />
            
            {/* Gestão de Empréstimos */}
            <Route path="loans" element={<LoansView />} />
            
            {/* Gestão de Pagamentos */}
            <Route path="payments" element={<PaymentsView />} />
            
            {/* Pagamentos Próximos */}
            <Route path="upcoming-payments" element={<UpcomingPaymentsView />} />
            
            {/* Simulador */}
            <Route path="calculator" element={<CalculatorView />} />
            
            {/* Configurações */}
            <Route path="settings" element={<SettingsView />} />
            
            {/* Perfil do Usuário */}
            <Route path="profile" element={<ProfilePage />} />
            
            {/* Ajuda e Suporte */}
            <Route path="help" element={<HelpPage />} />
            
            {/* Admin Panel - Rota protegida por role */}
            <Route path="admin" element={<AdminPanel />} />
          </Route>
        </>
      ) : (
        /* Usuário não autenticado - redireciona para login */
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
      
      {/* Rota 404 - deve estar por último */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

/**
 * Componente principal da aplicação
 * Configura providers globais e estrutura de roteamento
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider 
      attribute="class"
      defaultTheme="light"
      enableSystem
      storageKey="titanjuros-theme"
    >
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
