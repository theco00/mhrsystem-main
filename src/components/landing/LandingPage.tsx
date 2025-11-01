import { User, LogOut } from "lucide-react";
import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContextClean";
import { UserMenu } from "@/components/auth/UserMenu";
import titanjurosLogo from '@/assets/titanjuros-logo.png';
import './landing.css';

// Lazy load components for better performance
const AnimatedBackground = lazy(() => import('./AnimatedBackground'));
const HeroSection = lazy(() => import('./HeroSection'));
const FeaturesSection = lazy(() => import('./FeaturesSection'));
const CTASection = lazy(() => import('./CTASection'));
const PricingSection = lazy(() => import('./PricingSection'));
const FAQSection = lazy(() => import('./FAQSection'));
const FinalCTA = lazy(() => import('./FinalCTA'));
const UrgencyBanner = lazy(() => import('./UrgencyBanner'));
const TrustSignals = lazy(() => import('./TrustSignals'));
const TestimonialsSection = lazy(() => import('./TestimonialsSection'));
const CertificationsSection = lazy(() => import('./CertificationsSection'));
const LandingChatbot = lazy(() => import('./LandingChatbot'));
const ExitIntentPopup = lazy(() => import('./ExitIntentPopup'));

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
    <div className="landing-page min-h-screen relative overflow-x-hidden" style={{
      background: 'linear-gradient(135deg, #0a1628 0%, #1a3a52 50%, #2c5982 100%)'
    }}>
      {/* Navy gradient overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at top right, rgba(44, 89, 130, 0.2), transparent 60%)',
        mixBlendMode: 'screen'
      }} />
      
      {/* Landing Chatbot - Chat ao Vivo com Gemini AI */}
      <Suspense fallback={null}>
        <LandingChatbot />
      </Suspense>

      {/* Exit Intent Popup - Oferta Especial */}
      <Suspense fallback={null}>
        <ExitIntentPopup KIVANO_PURCHASE_URL={CAKTO_PAYMENT_URL} />
      </Suspense>

      {/* Urgency Banner - Minimalista */}
      <Suspense fallback={null}>
        <UrgencyBanner />
      </Suspense>
      {/* Animated Background */}
      {!prefersReducedMotion && (
        <Suspense fallback={null}>
          <AnimatedBackground />
        </Suspense>
      )}
      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50" style={{
        background: 'rgba(10, 22, 40, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(76, 142, 196, 0.2)'
      }}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg p-1">
                <img src={titanjurosLogo} alt="TitanJuros Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl lg:text-2xl font-bold" style={{
                background: 'linear-gradient(135deg, #3b82f6, #14b8a6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Titan Juros
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-3">
              <button 
                onClick={() => scrollToSection('features')} 
                className="px-5 py-2.5 rounded-xl font-bold transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(74, 144, 255, 0.15), rgba(20, 255, 198, 0.15))',
                  border: '2px solid rgba(74, 144, 255, 0.4)',
                  color: '#14ffc6',
                  textShadow: '0 0 10px rgba(20, 255, 198, 0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(74, 144, 255, 0.3), rgba(20, 255, 198, 0.3))';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(74, 144, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(74, 144, 255, 0.15), rgba(20, 255, 198, 0.15))';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Recursos
              </button>
              <button 
                onClick={() => scrollToSection('pricing')} 
                className="px-5 py-2.5 rounded-xl font-bold transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(74, 144, 255, 0.15), rgba(20, 255, 198, 0.15))',
                  border: '2px solid rgba(74, 144, 255, 0.4)',
                  color: '#14ffc6',
                  textShadow: '0 0 10px rgba(20, 255, 198, 0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(74, 144, 255, 0.3), rgba(20, 255, 198, 0.3))';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(74, 144, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(74, 144, 255, 0.15), rgba(20, 255, 198, 0.15))';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Planos
              </button>
              <button 
                onClick={() => scrollToSection('faq')} 
                className="px-5 py-2.5 rounded-xl font-bold transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(74, 144, 255, 0.15), rgba(20, 255, 198, 0.15))',
                  border: '2px solid rgba(74, 144, 255, 0.4)',
                  color: '#14ffc6',
                  textShadow: '0 0 10px rgba(20, 255, 198, 0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(74, 144, 255, 0.3), rgba(20, 255, 198, 0.3))';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(74, 144, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(74, 144, 255, 0.15), rgba(20, 255, 198, 0.15))';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                FAQ
              </button>
              
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span>Minha Conta</span>
                  </button>
                  
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl overflow-hidden">
                      <UserMenu user={user} />
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2.5 rounded-xl font-bold transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #14b8a6)',
                    color: '#ffffff',
                    boxShadow: '0 0 20px rgba(74, 144, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(74, 144, 255, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(74, 144, 255, 0.3)';
                  }}
                >
                  Login
                </button>
              )}
            </nav>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 text-white"
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
                      className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2"
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

      {/* Trust Signals - Social Proof */}
      <Suspense fallback={<LoadingSpinner />}>
        <TrustSignals />
      </Suspense>

      {/* Testimonials Section - Depoimentos de Clientes */}
      <Suspense fallback={<LoadingSpinner />}>
        <TestimonialsSection 
          KIVANO_PURCHASE_URL={CAKTO_PAYMENT_URL}
        />
      </Suspense>

      {/* Certifications Section - Segurança e Confiabilidade */}
      <Suspense fallback={<LoadingSpinner />}>
        <CertificationsSection />
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
      <footer className="py-12 px-4 lg:px-8" style={{
        background: 'rgba(10, 22, 40, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(76, 142, 196, 0.2)'
      }}>
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg p-1.5">
                <img src={titanjurosLogo} alt="TitanJuros Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl text-white">Titan Juros</span>
            </div>
            <p className="text-white/70">
              © 2025 Titan Juros. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
