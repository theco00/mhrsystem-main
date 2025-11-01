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
    monthlyEquivalent: 42.81,
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
    monthlyEquivalent: 16.33,
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
    <section id="pricing" className="py-24 lg:py-40 relative overflow-hidden">
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

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
            style={{ scale }}
            className="relative"
          >
            {/* Best Value Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 z-20"
            >
              <div className="relative">
                <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white px-8 py-3 rounded-full text-sm font-bold shadow-2xl flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  OFERTA ESPECIAL
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full blur-xl opacity-50 animate-pulse" />
              </div>
            </motion.div>

            {/* Main Card */}
            <div className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 lg:p-12 overflow-hidden">
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

              <div className="relative z-10">
                {/* Plan name */}
                <div className="text-center mb-8">
                  <p className="text-gray-300 text-sm font-semibold mb-2 uppercase tracking-wider">
                    Para Profissionais
                  </p>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="text-center mb-10">
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-gray-400 text-2xl">R$</span>
                    <motion.span
                      className="text-6xl lg:text-7xl font-bold text-white"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.6, type: "spring", bounce: 0.5 }}
                    >
                      {inView && (
                        <CountUp
                          end={parseInt(priceMain)}
                          duration={2}
                          separator=""
                        />
                      )}
                    </motion.span>
                    <span className="text-3xl font-bold text-white">,{priceDecimal}</span>
                  </div>
                  <p className="text-gray-400 text-lg">por mês</p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.8 }}
                    className="text-green-400 text-sm mt-2"
                  >
                    Economize R$ 359,88/ano comparado à concorrência
                  </motion.p>
                </div>

                {/* Benefits */}
                <div className="space-y-4 mb-10">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className={`flex items-start gap-3 ${
                        benefit.highlight ? 'scale-105' : ''
                      }`}
                    >
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        benefit.highlight 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                          : 'bg-blue-500/20'
                      }`}>
                        <benefit.icon className={`w-4 h-4 ${
                          benefit.highlight ? 'text-white' : 'text-blue-400'
                        }`} />
                      </div>
                      <span className={`${
                        benefit.highlight 
                          ? 'text-white font-semibold' 
                          : 'text-gray-300'
                      }`}>
                        {benefit.text}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.a
                  href={KIVANO_PURCHASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button className="relative w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white font-bold py-5 px-8 rounded-2xl text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center gap-3 group overflow-hidden">
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Button content */}
                    <span className="relative z-10">Assinar Agora</span>
                    <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.7) 50%, transparent 60%)',
                        backgroundSize: '200% 200%',
                      }}
                      animate={{
                        backgroundPosition: ['200% 0%', '-200% 0%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </button>
                </motion.a>

                {/* Guarantees */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 1.2 }}
                  className="mt-8 pt-8 border-t border-white/10 space-y-3"
                >
                  {[
                    { icon: Zap, text: "Acesso imediato após a compra" },
                    { icon: CheckCircle2, text: "Garantia de 7 dias" },
                    { icon: CheckCircle2, text: "Cancele quando quiser" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-gray-400">
                      <item.icon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Decorative elements */}
            <motion.div
              className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"
              style={{ rotate }}
            />
            <motion.div
              className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl"
              style={{ rotate }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
