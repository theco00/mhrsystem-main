import { motion } from 'framer-motion';
import { ArrowRight, Rocket, Star, Trophy } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';

interface FinalCTAProps {
  MONTHLY_PRICE: string;
  KIVANO_PURCHASE_URL: string;
}

export default function FinalCTA({ MONTHLY_PRICE, KIVANO_PURCHASE_URL }: FinalCTAProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-24 lg:py-40 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600">
      {/* Animated background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>
        
        {/* Floating orbs */}
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 max-w-5xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          {/* Trophy icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={inView ? { scale: 1, rotate: 0 } : {}}
            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-xl mb-8 mx-auto"
          >
            <Trophy className="w-12 h-12 text-yellow-300" />
          </motion.div>

          {/* Main heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-8 leading-tight text-white"
          >
            Pronto para{' '}
            <span className="relative">
              <span className="relative z-10">otimizar</span>
              <motion.svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 20"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ delay: 0.5, duration: 1 }}
              >
                <motion.path
                  d="M5,15 Q150,5 295,15"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              </motion.svg>
            </span>{' '}
            sua gestão financeira?
          </motion.h2>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="text-xl lg:text-2xl text-white/90 mb-12 leading-relaxed max-w-3xl mx-auto"
          >
            Junte-se a mais de{' '}
            <span className="font-bold text-yellow-300">
              {inView && <CountUp start={0} end={5000} duration={2.5} separator="." />}
            </span>{' '}
            profissionais que já simplificaram sua gestão de empréstimos e contratos.
            <br/>Comece agora e veja a diferença em minutos!
          </motion.p>

          {/* Success metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12"
          >
            {[
              { value: 4.9, label: 'Avaliação', suffix: '/5', icon: Star },
              { value: 2, label: 'Horas Economizadas', suffix: 'h/dia', icon: Rocket },
              { value: 300, label: 'Crescimento', suffix: '%', icon: Trophy },
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
                className="text-center"
              >
                <metric.icon className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
                <div className="text-3xl lg:text-4xl font-bold text-white">
                  {inView && <CountUp start={0} end={metric.value} duration={2} decimals={metric.value % 1 !== 0 ? 1 : 0} />}
                  {metric.suffix}
                </div>
                <div className="text-sm text-blue-200">{metric.label}</div>
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
                className="relative group bg-white text-blue-600 hover:bg-gray-50 font-bold py-6 px-12 rounded-2xl text-xl transition-all duration-300 shadow-2xl hover:shadow-white/30 inline-flex items-center gap-3 overflow-hidden"
              >
                {/* Animated gradient background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{ backgroundSize: '200% 100%' }}
                />
                
                <Rocket className="w-6 h-6" />
                <span className="relative z-10">Começar Agora - R$ {MONTHLY_PRICE}/mês</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 1 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8"
          >
            {[
              '✓ Garantia de 7 dias',
              '✓ Suporte prioritário',
              '✓ Sem taxa de setup',
              '✓ Cancele quando quiser',
            ].map((badge, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 1.1 + index * 0.1 }}
                className="text-white/90 text-sm font-medium"
              >
                {badge}
              </motion.span>
            ))}
          </motion.div>

          {/* Urgency indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 1.3, type: "spring" }}
            className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/20 backdrop-blur-xl border border-yellow-400/30"
          >
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-yellow-300 text-sm font-medium">
              Oferta por tempo limitado - Economize R$ 120/ano
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
