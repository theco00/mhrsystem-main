import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Users, Clock } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';

interface CTASectionProps {
  KIVANO_PURCHASE_URL: string;
}

export default function CTASection({ KIVANO_PURCHASE_URL }: CTASectionProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0.7, 1], [1, 0.5]);

  const stats = [
    { value: 15000, suffix: '+', label: 'Empréstimos Gerenciados', icon: TrendingUp },
    { value: 500, suffix: '+', label: 'Empresas Confiam', icon: Users },
    { value: 99.9, suffix: '%', label: 'Uptime Garantido', icon: Clock },
  ];

  return (
    <section className="py-24 lg:py-40 relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2C5282]/30 via-transparent to-[#1a3a52]/30" />
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(74, 144, 226, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(91, 159, 227, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 50% 100%, rgba(44, 82, 130, 0.1) 0%, transparent 50%)
            `,
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          style={{ y, opacity }}
          className="max-w-6xl mx-auto"
        >
          {/* Main CTA Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#2C5282]/20 via-[#1a3a52]/20 to-[#2C5282]/20 blur-3xl" />
            
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 p-12 lg:p-20 overflow-hidden">
              {/* Animated particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/20 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [-20, -100],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 5,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 max-w-4xl mx-auto text-center">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 mb-8"
                >
                  <Sparkles className="w-4 h-4 text-[#4A90E2]" />
                  <span className="text-sm font-medium text-[#5B9FE3]">OFERTA LIMITADA</span>
                  <Sparkles className="w-4 h-4 text-[#4A90E2]" />
                </motion.div>

                {/* Heading */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 }}
                  className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-8 text-white leading-tight"
                >
                  Esteja sempre{' '}
                  <span className="relative">
                    <span className="bg-gradient-to-r from-[#4A90E2] via-[#5B9FE3] to-[#4285F4] bg-clip-text text-transparent">
                      atento
                    </span>
                    <motion.svg
                      className="absolute -bottom-2 left-0 w-full"
                      viewBox="0 0 300 10"
                      initial={{ pathLength: 0 }}
                      animate={inView ? { pathLength: 1 } : {}}
                      transition={{ delay: 0.5, duration: 1 }}
                    >
                      <motion.path
                        d="M0,5 Q150,0 300,5"
                        stroke="url(#gradient)"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#4A90E2" />
                          <stop offset="50%" stopColor="#5B9FE3" />
                          <stop offset="100%" stopColor="#4A90E2" />
                        </linearGradient>
                      </defs>
                    </motion.svg>
                  </span>{' '}
                  e facilite suas cobranças
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 }}
                  className="text-xl lg:text-2xl text-gray-300 mb-12 leading-relaxed"
                >
                  Não deixe que suas cobranças passem da data de pagamento com nossos lembretes de recebimentos e envios de alertas automatizados direto no WhatsApp do seu cliente
                </motion.p>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
                >
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#2C5282]/20 to-[#1a3a52]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                      <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                        <stat.icon className="w-8 h-8 text-[#4A90E2] mx-auto mb-3" />
                        <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
                          {inView && (
                            <CountUp
                              end={stat.value}
                              duration={2.5}
                              separator=","
                              suffix={stat.suffix}
                              decimals={stat.value < 100 ? 1 : 0}
                            />
                          )}
                        </div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.8 }}
                >
                  <a href={KIVANO_PURCHASE_URL} target="_blank" rel="noopener noreferrer">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative group bg-gradient-to-r from-[#2C5282] via-[#1a3a52] to-[#2C5282] hover:from-[#1E3A52] hover:via-[#0d2235] hover:to-[#1E3A52] text-white font-bold py-6 px-12 rounded-2xl text-xl transition-all duration-300 shadow-2xl hover:shadow-[#2C5282]/50 inline-flex items-center gap-3 overflow-hidden"
                    >
                      {/* Animated background */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{
                          x: ['-100%', '100%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                      
                      <span className="relative z-10">Começar Agora</span>
                      <ArrowRight className="relative z-10 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </a>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 1 }}
                  className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Sistema Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Suporte Ativo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Atualizações Diárias</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
