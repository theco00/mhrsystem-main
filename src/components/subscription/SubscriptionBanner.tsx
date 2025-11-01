import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, AlertTriangle, CheckCircle, CreditCard, Sparkles } from 'lucide-react';
import { useFreeTrial } from '@/hooks/useFreeTrial';
import { Button } from '@/components/ui/button';

export function SubscriptionBanner() {
  const { trialStatus, isLoading, isActive, daysRemaining } = useFreeTrial();
  const [isVisible, setIsVisible] = useState(true);

  // Não mostrar se estiver carregando
  if (isLoading) {
    return null;
  }

  // Não mostrar se não tem trial status
  if (!trialStatus) {
    return null;
  }

  // Não mostrar se já fechou o banner (apenas para trials ativos com mais de 3 dias)
  if (!isVisible && isActive && daysRemaining > 3) {
    return null;
  }

  // Determinar tipo de banner
  const getBannerType = () => {
    if (!isActive) {
      return 'expired'; // Trial expirado
    }
    
    if (daysRemaining <= 1) {
      return 'urgent'; // Trial expirando em 1 dia ou menos
    } else if (daysRemaining <= 3) {
      return 'warning'; // Trial expirando em 3 dias ou menos
    } else {
      return 'info'; // Trial ativo
    }
  };

  const bannerType = getBannerType();

  // Configurações por tipo de banner
  const bannerConfig = {
    expired: {
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      bgColor: 'from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30',
      borderColor: 'border-red-200 dark:border-red-800',
      title: '⚠️ Período de teste expirado',
      message: 'Seu período de teste gratuito terminou. Assine agora para continuar usando todas as funcionalidades.',
      ctaText: 'Assinar Agora',
      ctaColor: 'bg-red-600 hover:bg-red-700',
      showClose: false
    },
    urgent: {
      icon: Clock,
      iconColor: 'text-orange-500',
      bgColor: 'from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-900/30',
      borderColor: 'border-orange-200 dark:border-orange-800',
      title: `⏰ Último dia de teste grátis!`,
      message: `Seu período de teste termina ${daysRemaining === 0 ? 'hoje' : 'amanhã'}. Assine agora e não perca o acesso!`,
      ctaText: 'Garantir Acesso',
      ctaColor: 'bg-orange-600 hover:bg-orange-700',
      showClose: false
    },
    warning: {
      icon: Clock,
      iconColor: 'text-yellow-500',
      bgColor: 'from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-900/30',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      title: `⏳ ${daysRemaining} dias restantes do teste grátis`,
      message: 'Aproveite para explorar todas as funcionalidades antes do período de teste terminar.',
      ctaText: 'Ver Planos',
      ctaColor: 'bg-yellow-600 hover:bg-yellow-700',
      showClose: true
    },
    info: {
      icon: Sparkles,
      iconColor: 'text-blue-500',
      bgColor: 'from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-900/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      title: `✨ Teste grátis ativo - ${daysRemaining} dias restantes`,
      message: 'Você está aproveitando o período de teste gratuito. Explore todas as funcionalidades!',
      ctaText: 'Ver Planos',
      ctaColor: 'bg-blue-600 hover:bg-blue-700',
      showClose: true
    },
    active: {
      icon: CheckCircle,
      iconColor: 'text-green-500',
      bgColor: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-900/30',
      borderColor: 'border-green-200 dark:border-green-800',
      title: '✅ Teste grátis ativo',
      message: `Aproveite seu período de teste! ${daysRemaining} dias restantes.`,
      ctaText: 'Ver Planos',
      ctaColor: 'bg-green-600 hover:bg-green-700',
      showClose: true
    }
  };

  const config = bannerConfig[bannerType];
  const Icon = config.icon;

  const handleCTA = () => {
    // Redirecionar para seção de preços na landing page
    window.location.href = '/#pricing';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div className={`relative overflow-hidden rounded-xl border-2 ${config.borderColor} bg-gradient-to-r ${config.bgColor} p-4 shadow-lg`}>
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }} />
            </div>

            <div className="relative flex items-start gap-4">
              {/* Icon */}
              <div className={`flex-shrink-0 ${config.iconColor}`}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  {config.title}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {config.message}
                </p>
              </div>

              {/* CTA Button */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <Button
                  onClick={handleCTA}
                  className={`${config.ctaColor} text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg`}
                >
                  <CreditCard className="w-4 h-4" />
                  {config.ctaText}
                </Button>

                {/* Close button */}
                {config.showClose && (
                  <button
                    onClick={() => setIsVisible(false)}
                    className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    aria-label="Fechar"
                  >
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar for trial */}
            {isActive && (
              <div className="mt-3 relative">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(daysRemaining / 7) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full ${
                      daysRemaining <= 1 
                        ? 'bg-red-500' 
                        : daysRemaining <= 3 
                        ? 'bg-yellow-500' 
                        : 'bg-blue-500'
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {daysRemaining} de 7 dias restantes
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
