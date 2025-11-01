import { Wallet, User, LogOut } from "lucide-react";
import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/landing.css';

// Lazy load components for better performance
const AnimatedBackground = lazy(() => import('./AnimatedBackground'));
const HeroSection = lazy(() => import('./HeroSection'));
const FeaturesSection = lazy(() => import('./FeaturesSection'));
const CTASection = lazy(() => import('./CTASection'));
const PricingSection = lazy(() => import('./PricingSection'));
const FAQSection = lazy(() => import('./FAQSection'));
const FinalCTA = lazy(() => import('./FinalCTA'));

// Mock auth hook - will be replaced with real one when moved to src/
const useAuth = () => {
  // This is a placeholder - will use real auth context after moving files
  return { user: null, signOut: () => {} };
};

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/**
 * LandingPage Ultra-Moderna - Sistema Titan Juros
 * Landing page com animações 3D, responsividade avançada e micro-interações
 */
export default function LandingPage() {
  // URL da Cakto - Link de pagamento
  const CAKTO_PAYMENT_URL = "https://pay.cakto.com.br/345a25k_618991";
  const MONTHLY_PRICE = "29,99";
  
  // Auth and navigation
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isLoading) {
    return <LoadingSpinner />;
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d2235] to-[#1a3a52] relative overflow-x-hidden">
      {/* Animated Background */}
      {!prefersReducedMotion && (
        <Suspense fallback={null}>
          <AnimatedBackground />
        </Suspense>
      )}
      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card-premium border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/titanjuros-logo.svg" 
                alt="TitanJuros Logo" 
                className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
                loading="eager"
              />
              <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#4A90E2] to-[#5B9FE3] bg-clip-text text-transparent whitespace-nowrap">
                Titan Juros
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8">
              <button onClick={() => scrollToSection('features')} className="text-sm lg:text-base text-gray-300 hover:text-white transition-colors whitespace-nowrap">
                Recursos
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-sm lg:text-base text-gray-300 hover:text-white transition-colors whitespace-nowrap">
                Planos
              </button>
              <button onClick={() => scrollToSection('faq')} className="text-sm lg:text-base text-gray-300 hover:text-white transition-colors whitespace-nowrap">
                FAQ
              </button>
              
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg bg-gradient-to-r from-[#2C5282] to-[#1a3a52] text-white hover:from-[#1E3A52] hover:to-[#0d2235] transition-all text-sm lg:text-base whitespace-nowrap"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">Minha Conta</span>
                    <span className="lg:hidden">Conta</span>
                  </button>
                  
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl overflow-hidden">
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Acessar Sistema
                      </button>
                      <button
                        onClick={() => signOut()}
                        className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-2 border-t border-white/10"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 lg:px-4 py-2 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all text-sm lg:text-base whitespace-nowrap"
                >
                  Login
                </button>
              )}
            </nav>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 text-white touch-manipulation"
              aria-label="Menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`block h-0.5 bg-white transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block h-0.5 bg-white transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-white transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
          
          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10 px-2">
              <div className="flex flex-col gap-4">
                <button onClick={() => scrollToSection('features')} className="text-gray-300 hover:text-white transition-colors text-left">
                  Recursos
                </button>
                <button onClick={() => scrollToSection('pricing')} className="text-gray-300 hover:text-white transition-colors text-left">
                  Planos
                </button>
                <button onClick={() => scrollToSection('faq')} className="text-gray-300 hover:text-white transition-colors text-left">
                  FAQ
                </button>
                
                {user ? (
                  <>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-[#2C5282] to-[#1a3a52] text-white hover:from-[#1E3A52] hover:to-[#0d2235] transition-all flex items-center justify-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Acessar Sistema
                    </button>
                    <button
                      onClick={() => signOut()}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <HeroSection 
          KIVANO_PURCHASE_URL={CAKTO_PAYMENT_URL}
          scrollToSection={scrollToSection}
        />
      </Suspense>

      {/* Features Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <FeaturesSection />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <CTASection KIVANO_PURCHASE_URL={CAKTO_PAYMENT_URL} />
      </Suspense>

      {/* Pricing Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <PricingSection 
          MONTHLY_PRICE={MONTHLY_PRICE}
          KIVANO_PURCHASE_URL={CAKTO_PAYMENT_URL}
        />
      </Suspense>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <FAQSection />
      </Suspense>

      {/* Final CTA */}
      <Suspense fallback={<LoadingSpinner />}>
        <FinalCTA 
          MONTHLY_PRICE={MONTHLY_PRICE}
          KIVANO_PURCHASE_URL={CAKTO_PAYMENT_URL}
        />
      </Suspense>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-xl border-t border-white/10 py-8 sm:py-10 lg:py-12">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/titanjuros-logo.svg" 
                alt="TitanJuros Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10"
                loading="lazy"
              />
              <span className="font-bold text-lg sm:text-xl text-white">Titan Juros</span>
            </div>
            <p className="text-gray-400 text-sm sm:text-base text-center md:text-left">
              © 2025 Titan Juros. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
