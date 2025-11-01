import { motion, useScroll, useTransform } from 'framer-motion';
import { CheckCircle2, ArrowRight, Sparkles, Zap, Star, TrendingDown } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';

interface PricingSectionProps {
  MONTHLY_PRICE: string;
  KIVANO_PURCHASE_URL: string;
}

const benefits = [
  {
    icon: CheckCircle2,
    text: "Acesse de quantos dispositivos quiser",
    highlight: true,
  },
  {
    icon: CheckCircle2,
    text: "Sem limite de empréstimos ou clientes",
    highlight: true,
  },
  {
    icon: CheckCircle2,
    text: "Privacidade Total e Segurança",
    highlight: false,
  },
  {
    icon: CheckCircle2,
    text: "Sistema Online 24/7",
    highlight: false,
  },
  {
    icon: CheckCircle2,
    text: "Suporte no WhatsApp",
    highlight: false,
  },
  {
    icon: CheckCircle2,
    text: "Atualizações gratuitas incluídas",
    highlight: false,
  },
  {
    icon: CheckCircle2,
    text: "Backup automático diário",
    highlight: false,
  },
  {
    icon: CheckCircle2,
    text: "Exportação de dados em Excel/PDF",
    highlight: false,
  },
];

// Definir os planos - 3 opções de assinatura
const pricingPlans = [
  {
    id: 'trial',
    name: 'Teste',
    duration: '7 dias',
    price: 9.99,
    priceFormatted: '9,99',
    period: 'por 7 dias',
    badge: null,
    popular: false,
    savings: 0,
    savingsText: null,
    monthlyEquivalent: 42.81, // (9.99 / 7) * 30
  },
  {
    id: 'monthly',
    name: 'Mensal',
    duration: '1 mês',
    price: 29.99,
    priceFormatted: '29,99',
    period: 'por mês',
    badge: 'MAIS POPULAR',
    popular: true,
    savings: 30,
    savingsText: 'Economize 30% vs plano semanal',
    monthlyEquivalent: 29.99,
  },
  {
    id: 'semester',
    name: 'Semestral',
    duration: '6 meses',
    price: 97.99,
    priceFormatted: '97,99',
    period: 'por 6 meses',
    badge: 'MELHOR OFERTA',
    popular: false,
    savings: 45,
    savingsText: 'Economize 45% - Apenas R$ 16,33/mês',
    monthlyEquivalent: 16.33, // 97.99 / 6
  },
];

export default function PricingSection({ MONTHLY_PRICE, KIVANO_PURCHASE_URL }: PricingSectionProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  return (
    <section id="pricing" className="py-16 sm:py-20 lg:py-32 xl:py-40 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2C5282]/20 via-transparent to-[#1a3a52]/20" />
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-[#2C5282]/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-[#1a3a52]/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[#2C5282]/20 to-[#1a3a52]/20 border border-[#2C5282]/30 text-[#4A90E2] text-xs sm:text-sm font-medium mb-3 sm:mb-4"
          >
            💰 ESCOLHA SEU PLANO
          </motion.span>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-white">
            Planos{' '}
            <span className="bg-gradient-to-r from-[#4A90E2] via-[#5B9FE3] to-[#4285F4] bg-clip-text text-transparent">
              Flexíveis
            </span>
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-4">
            Todos os planos incluem acesso completo a todos os recursos
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan, index) => {
            const [priceMain, priceDecimal] = plan.priceFormatted.split(',');
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                className="relative"
              >
                {/* Badge */}
                {plan.badge && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.4 + index * 0.1, type: "spring", bounce: 0.5 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 z-20"
                  >
                    <div className={`${
                      plan.popular 
                        ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-600'
                    } text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-1.5`}>
                      <Sparkles className="w-3 h-3" />
                      {plan.badge}
                    </div>
                  </motion.div>
                )}

                {/* Main Card */}
                <div className={`relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl rounded-2xl border ${
                  plan.popular ? 'border-yellow-500/50 shadow-xl shadow-yellow-500/20' : 'border-white/20'
                } p-6 sm:p-8 overflow-hidden h-full flex flex-col ${
                  plan.popular ? 'scale-105' : ''
                }`}>
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2C5282]/20 via-transparent to-[#1a3a52]/20" />
              </div>

              {/* Floating particles */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-[#4A90E2]/30 rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${10 + i * 20}%`,
                  }}
                  animate={{
                    y: [-20, 20, -20],
                    x: [-10, 10, -10],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  }}
                />
              ))}

              <div className="relative z-10 flex flex-col h-full">
                {/* Plan name */}
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-gray-400 text-sm">{plan.duration}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1 mb-1">
                    <span className="text-gray-400 text-lg">R$</span>
                    <motion.span
                      className="text-4xl sm:text-5xl font-bold text-white"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.5 + index * 0.1, type: "spring", bounce: 0.5 }}
                    >
                      {inView && (
                        <CountUp
                          end={parseInt(priceMain)}
                          duration={1.5}
                          separator=""
                        />
                      )}
                    </motion.span>
                    <span className="text-xl sm:text-2xl font-bold text-white">,{priceDecimal}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{plan.period}</p>
                  
                  {/* Savings Badge */}
                  {plan.savings > 0 && plan.savingsText && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full text-xs font-semibold border border-green-500/30"
                    >
                      <TrendingDown className="w-3 h-3" />
                      {plan.savingsText}
                    </motion.div>
                  )}
                </div>

                {/* Benefits - Versão compacta */}
                <div className="space-y-2 mb-6 flex-grow">
                  {benefits.slice(0, 5).map((benefit, benefitIndex) => (
                    <div
                      key={benefitIndex}
                      className="flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-gray-300">
                        {benefit.text}
                      </span>
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 italic mt-3">+ Todos os recursos inclusos</p>
                </div>

                {/* CTA Button */}
                <motion.a
                  href={KIVANO_PURCHASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button className={`relative w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500' 
                      : 'bg-gradient-to-r from-[#2C5282] to-[#1a3a52]'
                  } text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl text-sm sm:text-base transition-all duration-300 hover:shadow-2xl flex items-center justify-center gap-2 group overflow-hidden touch-manipulation`}>
                    <span className="relative z-10">Assinar {plan.name}</span>
                    <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.a>

                {/* Guarantees */}
                <div className="mt-4 pt-4 border-t border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Zap className="w-3 h-3 text-[#4A90E2] flex-shrink-0" />
                    <span className="text-xs">Acesso imediato</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <CheckCircle2 className="w-3 h-3 text-[#4A90E2] flex-shrink-0" />
                    <span className="text-xs">Cancele quando quiser</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
