import { useState, useCallback, Suspense, lazy } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { ProfileDropdown } from "@/components/profile/ProfileDropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLoanNotifications } from "@/hooks/useLoanNotifications";
import { Button } from "@/components/ui/button";
import { Menu, Home } from "lucide-react";
import { GeminiChatbot } from "@/components/ai/GeminiChatbot";
import { SubscriptionBanner } from "@/components/subscription/SubscriptionBanner";

import Sidebar from "./Sidebar";
import { PageContainer } from "./PageContainer";

const AnimatedBackground = lazy(() => import("@/components/ui/AnimatedBackground"));

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  useLoanNotifications();

  const handleSidebarClose = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleNavigation = useCallback(
    (path: string) => {
      navigate(path);
      handleSidebarClose();
    },
    [navigate, handleSidebarClose],
  );

  const activeSection = location.pathname.replace("/", "") || "dashboard";

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="relative flex h-screen overflow-hidden bg-gradient-to-br from-white via-blue-50/20 to-sky-50/30 dark:from-blue-950 dark:via-blue-900/20 dark:to-sky-900/30 text-foreground safe-top safe-bottom">
      {/* Animated Background */}
      {!prefersReducedMotion && (
        <Suspense fallback={null}>
          <AnimatedBackground />
        </Suspense>
      )}
      
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-tr from-blue-100/20 via-transparent to-sky-100/20 dark:from-blue-900/10 dark:to-sky-900/10 opacity-70 animate-gradient"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent dark:from-blue-800/20 opacity-50"
        aria-hidden="true"
      />

      {/* Mobile Overlay com backdrop blur */}
      {isMobile && sidebarOpen ? (
        <div
          className="overlay-mobile animate-fade-in lg:hidden"
          onClick={handleSidebarClose}
          role="button"
          tabIndex={0}
          aria-label="Fechar menu lateral"
          onKeyDown={(event) => {
            if (event.key === "Escape" || event.key === "Enter") {
              handleSidebarClose();
            }
          }}
        />
      ) : null}

      {/* Sidebar com animação suave */}
      <aside
        className={`${
          isMobile
            ? "fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm transform transition-transform duration-300 ease-out"
            : "relative"
        } ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}`}
        role="navigation"
        aria-label="Menu principal de navegacao"
      >
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleNavigation}
          isMobile={isMobile}
        />
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Header mobile-optimized com novo tema azul */}
        <header className="sticky top-0 z-30 px-3 py-2 sm:px-6 sm:py-3 animate-fade-in backdrop-blur-xl" role="banner">
          <div className="bg-white/80 dark:bg-blue-950/80 backdrop-blur-xl flex h-14 items-center justify-between gap-2 rounded-2xl border border-blue-100/50 dark:border-blue-800/30 px-2.5 shadow-xl shadow-blue-500/5 dark:shadow-blue-400/5 transition-all duration-300 hover:shadow-2xl sm:h-16 sm:gap-3 sm:px-4">
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
              {isMobile ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="btn-mobile touch-feedback shrink-0"
                  onClick={handleSidebarToggle}
                  aria-label="Abrir menu lateral"
                  aria-expanded={sidebarOpen}
                  aria-controls="main-navigation"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              ) : null}

              <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 text-white shadow-lg transform hover:scale-110 transition-transform duration-300 sm:h-11 sm:w-11">
                  <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 hidden sm:block">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                    Sistema Premium
                  </p>
                  <h1 className="text-sm font-bold leading-tight bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent truncate sm:text-base lg:text-lg dark:from-blue-400 dark:to-sky-400">
                    TitanJuros • Gestao Financeira
                  </h1>
                </div>
              </div>
            </div>

            <div
              className="flex items-center gap-1 sm:gap-2.5 shrink-0"
              role="toolbar"
              aria-label="Acoes do cabecalho"
            >
              <ThemeToggle />
              <NotificationDropdown />
              <ProfileDropdown />
            </div>
          </div>
        </header>

        <main
          className="relative flex-1 overflow-hidden"
          role="main"
          aria-label="Conteudo principal da aplicacao"
        >
          <ScrollArea className="h-full">
            <PageContainer>
              {/* Subscription Banner */}
              <div className="mb-6">
                <SubscriptionBanner />
              </div>
              
              <Outlet />
            </PageContainer>
          </ScrollArea>
        </main>
      </div>
      
      {/* Chatbot Gemini AI */}
      <GeminiChatbot />
    </div>
  );
}

