import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Zap, CheckCircle2, Sparkles, Star, User } from 'lucide-react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, RoundedBox, Html } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';

// Componente de avaliação dentro do iPhone
function TestimonialCard({ position, delay }: { position: [number, number, number], delay: number }) {
  return (
    <Html
      position={position}
      transform
      occlude
      style={{
        width: '180px',
        pointerEvents: 'none',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.8 }}
        className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2C5282] to-[#1a3a52] flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">Carlos Silva</p>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-600 leading-tight">
          "Excelente sistema! Facilitou muito a gestão dos meus empréstimos."
        </p>
      </motion.div>
    </Html>
  );
}

function TestimonialCard2({ position, delay }: { position: [number, number, number], delay: number }) {
  return (
    <Html
      position={position}
      transform
      occlude
      style={{
        width: '180px',
        pointerEvents: 'none',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.8 }}
        className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4A90E2] to-[#5B9FE3] flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">Maria Santos</p>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-600 leading-tight">
          "Melhor investimento! Controle total e alertas automáticos."
        </p>
      </motion.div>
    </Html>
  );
}

function TestimonialCard3({ position, delay }: { position: [number, number, number], delay: number }) {
  return (
    <Html
      position={position}
      transform
      occlude
      style={{
        width: '180px',
        pointerEvents: 'none',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.8 }}
        className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E3A52] to-[#0d2235] flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">João Oliveira</p>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-600 leading-tight">
          "Interface intuitiva e relatórios completos. Recomendo!"
        </p>
      </motion.div>
    </Html>
  );
}

// Modelo 3D do iPhone
function FloatingPhone() {
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
      <group>
        {/* Corpo do iPhone */}
        <RoundedBox
          args={[2, 4, 0.2]}
          radius={0.2}
          smoothness={4}
          position={[0, 0, 0]}
        >
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.9}
            roughness={0.1}
          />
        </RoundedBox>
        
        {/* Tela do iPhone */}
        <RoundedBox
          args={[1.85, 3.8, 0.05]}
          radius={0.15}
          smoothness={4}
          position={[0, 0, 0.13]}
        >
          <meshStandardMaterial
            color="#0a0a0a"
            metalness={0.3}
            roughness={0.2}
            emissive="#2C5282"
            emissiveIntensity={0.3}
          />
        </RoundedBox>

        {/* Notch (entalhe superior) */}
        <RoundedBox
          args={[0.6, 0.15, 0.06]}
          radius={0.05}
          smoothness={4}
          position={[0, 1.7, 0.14]}
        >
          <meshStandardMaterial
            color="#000000"
            metalness={0.8}
            roughness={0.2}
          />
        </RoundedBox>

        {/* Câmera */}
        <mesh position={[-0.15, 1.7, 0.15]}>
          <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Botão lateral */}
        <RoundedBox
          args={[0.05, 0.4, 0.08]}
          radius={0.02}
          smoothness={4}
          position={[-1.05, 0.5, 0]}
        >
          <meshStandardMaterial
            color="#2a2a2a"
            metalness={0.8}
            roughness={0.2}
          />
        </RoundedBox>

        {/* Cards de avaliação flutuantes */}
        <TestimonialCard position={[-2.5, 1.2, 0]} delay={0.5} />
        <TestimonialCard2 position={[2.5, 0, 0]} delay={0.7} />
        <TestimonialCard3 position={[-2.5, -1.2, 0]} delay={0.9} />
      </group>
    </Float>
  );
}

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

  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setIsWebGLSupported(!!gl);

    // Check if mobile
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const stats = [
    { value: 5000, suffix: '+', label: 'Clientes Ativos' },
    { value: 98, suffix: '%', label: 'Satisfação' },
    { value: 24, suffix: '/7', label: 'Suporte' },
  ];

  return (
    <section className="relative min-h-screen lg:min-h-[110vh] flex items-center justify-center overflow-hidden">
      {/* Hero Content */}
      <div className="container mx-auto relative z-10 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 xl:gap-16 items-center">
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
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card-premium mb-4 sm:mb-6"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#4A90E2] flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-[#5B9FE3]">Sistema Profissional de Gestão</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-[1.1] text-white"
            >
              Tenha{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-[#4A90E2] via-[#5B9FE3] to-[#4285F4] bg-clip-text text-transparent">
                  total controle
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#4A90E2] to-[#5B9FE3] rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={inView ? { scaleX: 1 } : {}}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </span>{' '}
              sobre seus Empréstimos
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 lg:mb-10 leading-relaxed"
            >
              Acesse informações importantes de qualquer lugar e receba alertas que vão facilitar sua gestão de valores e clientes
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4 mb-6 sm:mb-8"
            >
              <a href={KIVANO_PURCHASE_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto group px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg bg-gradient-to-r from-[#2C5282] to-[#1a3a52] hover:from-[#1E3A52] hover:to-[#0d2235] shadow-xl shadow-[#2C5282]/30 rounded-xl font-medium text-white transition-all inline-flex items-center justify-center gap-2 sm:gap-3 touch-manipulation"
                >
                  Adquirir o Sistema
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection('features')}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg glass-card-premium text-white hover:bg-white/10 rounded-xl font-medium transition-all touch-manipulation"
              >
                Conhecer Recursos
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    {inView && (
                      <CountUp
                        end={stat.value}
                        duration={2.5}
                        separator=","
                        suffix={stat.suffix}
                      />
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Visual - 3D Phone or Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            style={{ y: y1 }}
            className="relative hidden lg:block"
          >
            {isWebGLSupported && !isMobile ? (
              <div className="relative h-[500px]">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                  <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <FloatingPhone />
                    <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
                  </Suspense>
                </Canvas>
                
                {/* Glassmorphic Cards Overlay */}
                <motion.div
                  className="absolute top-10 -left-10 glass-card-premium p-4 rounded-xl"
                  style={{ y: y2 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#5B9FE3] to-[#4A90E2] flex items-center justify-center">
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
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2C5282] to-[#1a3a52] flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Clientes Ativos</p>
                      <p className="text-lg font-bold text-white">+127 hoje</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              /* Fallback for mobile/no WebGL */
              <div className="relative">
                <motion.div
                  className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.6 }}
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2C5282] to-[#1a3a52] flex items-center justify-center">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-300">Total a Receber</p>
                          <p className="text-2xl font-bold text-white">R$ 45.280,00</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-500/20 rounded-xl p-4">
                        <p className="text-xs text-green-300 mb-1">Recebido</p>
                        <p className="text-lg font-bold text-white">R$ 28.450</p>
                      </div>
                      <div className="bg-orange-500/20 rounded-xl p-4">
                        <p className="text-xs text-orange-300 mb-1">Pendente</p>
                        <p className="text-lg font-bold text-white">R$ 16.830</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
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
