import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Zap, CheckCircle2, Sparkles } from 'lucide-react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { Suspense } from 'react';
import IPhoneMockup from './IPhoneMockup';


interface HeroSectionProps {
  KIVANO_PURCHASE_URL: string;
  scrollToSection: (id: string) => void;
}

export default function HeroSection({ KIVANO_PURCHASE_URL, scrollToSection }: HeroSectionProps) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });


  const stats = [
    { value: 5000, suffix: '+', label: 'Clientes Ativos' },
    { value: 98, suffix: '%', label: 'Satisfação' },
    { value: 24, suffix: '/7', label: 'Suporte' },
  ];

  return (
    <section className="relative min-h-screen lg:min-h-[110vh] flex items-center justify-center overflow-hidden">
      {/* Hero Content */}
      <div className="container mx-auto relative z-10 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16" style={{ color: 'white' }}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-premium mb-6"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Plataforma Completa de Gestão Financeira</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
              <span className="block text-white">Gerencie seus</span>
              <span className="block" style={{
                background: 'linear-gradient(135deg, #3b82f6, #14b8a6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Empréstimos e Contratos
              </span>
              <span className="block text-white">
                de forma simples e sem complicação
              </span>
            </h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-lg lg:text-xl text-gray-300 mb-10 leading-relaxed"
            >
              Controle suas finanças de forma eficiente, acompanhe prazos, pagamentos e contratos de qualquer lugar. A plataforma completa para o gerenciamento de empréstimos pessoais e contratos financeiros.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-start gap-4 mb-8"
            >
              <a href="/welcome" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto group px-8 py-4 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl shadow-green-500/30 rounded-xl font-medium text-white transition-all inline-flex items-center justify-center gap-3"
                >
                  Começar Teste Grátis Agora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection('features')}
                className="w-full sm:w-auto px-8 py-4 text-lg glass-card-premium text-white hover:bg-white/10 rounded-xl font-medium transition-all"
              >
                Conhecer Recursos
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-white">
                    {inView && (
                      <CountUp
                        end={stat.value}
                        duration={2.5}
                        separator=","
                        suffix={stat.suffix}
                      />
                    )}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Visual - iPhone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            style={{ y: y1 }}
            className="relative hidden lg:block"
          >
            <div className="relative h-[700px]">
              <Suspense fallback={null}>
                <IPhoneMockup />
              </Suspense>
                
                {/* Glassmorphic Cards Overlay */}
                <motion.div
                  className="absolute top-10 -left-10 glass-card-premium p-4 rounded-xl"
                  style={{ y: y2 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Pagamento Recebido</p>
                      <p className="text-lg font-bold text-white">R$ 2.450,00</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute bottom-10 -right-10 glass-card-premium p-4 rounded-xl"
                  style={{ y: y1 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Clientes Ativos</p>
                      <p className="text-lg font-bold text-white">+127 hoje</p>
                    </div>
                  </div>
                </motion.div>
              </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ opacity }}
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  );
}
