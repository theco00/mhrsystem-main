import { useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Calendar,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextClean';
import { useRoles } from '@/contexts/RolesContext';
import { AdminBadge } from '@/components/admin/AdminBadge';
import { cn } from '@/lib/utils';
import titanjurosLogo from '@/assets/titanjuros-logo.svg';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (path: string) => void;
  isMobile?: boolean;
}

/**
 * Sidebar - Componente de navegação lateral
 * 
 * Funcionalidades:
 * - Navegação principal da aplicação
 * - Suporte a colapso/expansão (desktop)
 * - Controle de acesso baseado em roles
 * - Integração com React Router para navegação declarativa
 * - Acessibilidade completa (ARIA, teclado)
 * - Responsividade para dispositivos móveis
 * 
 * @component
 * @param {SidebarProps} props - Props do componente
 * @returns {JSX.Element} Componente de sidebar
 */
export default function Sidebar({ activeSection, onSectionChange, isMobile = false }: SidebarProps) {
  // Estados locais
  const [collapsed, setCollapsed] = useState(false);
  
  // Hooks de contexto e navegação
  const { user, signOut } = useAuth();
  const { isAdmin } = useRoles();
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Configuração dos itens do menu
   * Cada item inclui: id, label, ícone, rota e permissões
   * Preparado para futuras extensões (badges, contadores, etc.)
   */
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/dashboard',
      description: 'Visão geral do sistema'
    },
    { 
      id: 'clients', 
      label: 'Clientes', 
      icon: Users, 
      path: '/clients',
      description: 'Gestão de clientes'
    },
    { 
      id: 'loans', 
      label: 'Empréstimos', 
      icon: CreditCard, 
      path: '/loans',
      description: 'Gestão de empréstimos'
    },
    { 
      id: 'payments', 
      label: 'Pagamentos', 
      icon: Calendar, 
      path: '/payments',
      description: 'Controle de pagamentos'
    },
    { 
      id: 'calculator', 
      label: 'Simulador', 
      icon: Calculator, 
      path: '/calculator',
      description: 'Simulador de empréstimos'
    },
    { 
      id: 'settings', 
      label: 'Configurações', 
      icon: Settings, 
      path: '/settings',
      description: 'Configurações do sistema'
    },
    { 
      id: 'admin', 
      label: 'Admin', 
      icon: Shield, 
      path: '/admin',
      description: 'Painel administrativo',
      adminOnly: true 
    },
  ];

  /**
   * Callbacks otimizados com useCallback para performance
   */
  const handleToggleCollapse = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [signOut, navigate]);

  const handleItemClick = useCallback((item: typeof menuItems[0]) => {
    onSectionChange(item.path);
  }, [onSectionChange]);

  /**
   * Filtra itens do menu baseado em permissões do usuário
   * Preparado para futuras extensões de permissões mais granulares
   */
  const filteredMenuItems = menuItems.filter(item => {
    // Mostra itens administrativos apenas para admins
    if (item.adminOnly) {
      return isAdmin();
    }
    return true;
  });

  /**
   * Determina se um item está ativo baseado na rota atual
   * Suporte para rotas aninhadas e parâmetros
   */
  const isItemActive = useCallback((item: typeof menuItems[0]) => {
    if (item.path === '/dashboard' && location.pathname === '/') {
      return true; // Rota raiz mapeia para dashboard
    }
    return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  }, [location.pathname]);

  return (
    <nav 
      className={cn(
        "bg-gradient-to-b from-white to-blue-50/30 border-r border-blue-100/50 transition-all duration-300 flex flex-col h-full shadow-xl",
        "dark:from-blue-950 dark:to-blue-900/30 dark:border-blue-800/30",
        "safe-top safe-bottom",
        isMobile ? "w-full" : (collapsed ? "w-16" : "w-72")
      )}
      role="navigation"
      aria-label="Menu principal de navegação"
    >
      {/* Header - Brand e controle de colapso */}
      <header className="p-4 sm:p-5 border-b border-blue-100/50 dark:border-blue-800/30 bg-white/50 dark:bg-blue-950/50">
        <div className="flex items-center justify-between">
          {(!collapsed || isMobile) && (
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-sky-500 rounded-2xl shadow-lg shrink-0 transform hover:scale-105 transition-transform duration-300">
                <img 
                  src={titanjurosLogo} 
                  alt="Logo TitanJuros" 
                  className="w-8 h-8 sm:w-9 sm:h-9 object-contain filter brightness-0 invert"
                  loading="lazy"
                />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-600 dark:from-blue-400 dark:to-sky-400 text-base sm:text-lg truncate">
                  TitanJuros
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate">Gestão Financeira Premium</p>
              </div>
            </div>
          )}
          
          {/* Botão de colapso (apenas desktop) */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleCollapse}
              className="ml-auto btn-mobile touch-feedback shrink-0 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded-xl transition-all duration-300"
              aria-label={collapsed ? "Expandir menu" : "Colapsar menu"}
              aria-expanded={!collapsed}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              )}
            </Button>
          )}
        </div>
      </header>

      {/* User Info - Informações do usuário logado */}
      {(!collapsed || isMobile) && user && (
        <section className="p-4 sm:p-5 border-b border-blue-100/50 dark:border-blue-800/30 bg-gradient-to-r from-blue-50/50 to-sky-50/30 dark:from-blue-900/20 dark:to-sky-900/10">
          <div className="flex items-center space-x-3">
            {/* Avatar do usuário */}
            <div 
              className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-sky-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transform hover:scale-105 transition-transform duration-300"
              role="img"
              aria-label={`Avatar do usuário ${user.user_metadata?.full_name || user.email}`}
            >
              <span className="text-white font-bold text-sm">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            
            {/* Informações do usuário */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
                {user.user_metadata?.full_name || user.email}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Usuário Premium</span>
                <AdminBadge />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Navigation - Menu principal */}
      <section className="flex-1 p-4 sm:p-5 space-y-2 overflow-y-auto" aria-label="Navegação principal">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item);
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start transition-all duration-300 group relative overflow-hidden",
                "rounded-xl hover:scale-[1.02] transform-gpu",
                collapsed && !isMobile ? "px-3 py-3" : "px-4 py-3",
                isActive ? (
                  "bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-lg shadow-blue-500/30"
                ) : (
                  "hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300"
                )
              )}
              onClick={() => handleItemClick(item)}
              aria-current={isActive ? "page" : undefined}
              aria-describedby={(!collapsed || isMobile) ? `${item.id}-description` : undefined}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-sky-600 opacity-90" />
              )}
              <Icon 
                className={cn(
                  "w-5 h-5 transition-all duration-300 shrink-0 relative z-10", 
                  (collapsed && !isMobile) ? "" : "mr-3",
                  isActive ? "text-white" : "text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300"
                )} 
                aria-hidden="true"
              />
              {(!collapsed || isMobile) && (
                <>
                  <span className={cn(
                    "text-sm font-semibold relative z-10",
                    isActive ? "text-white" : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                  )}>
                    {item.label}
                  </span>
                  <span id={`${item.id}-description`} className="sr-only">
                    {item.description}
                  </span>
                </>
              )}
            </Button>
          );
        })}
      </section>

      {/* Footer - Logout */}
      <footer className="p-4 sm:p-5 border-t border-blue-100/50 dark:border-blue-800/30 bg-white/50 dark:bg-blue-950/50">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start group relative overflow-hidden rounded-xl",
            "bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100",
            "dark:from-red-950/30 dark:to-orange-950/30 dark:hover:from-red-900/40 dark:hover:to-orange-900/40",
            "transition-all duration-300 hover:scale-[1.02] transform-gpu",
            collapsed && !isMobile ? "px-3 py-3" : "px-4 py-3"
          )}
          onClick={handleSignOut}
          aria-label="Fazer logout da aplicação"
          title={collapsed && !isMobile ? "Sair" : undefined}
        >
          <LogOut 
            className={cn(
              "w-5 h-5 transition-all duration-300 shrink-0", 
              (collapsed && !isMobile) ? "" : "mr-3",
              "text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300"
            )}
            aria-hidden="true"
          />
          {(!collapsed || isMobile) && (
            <span className="text-sm font-semibold text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300">
              Sair
            </span>
          )}
        </Button>
      </footer>
    </nav>
  );
}
