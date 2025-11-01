import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  BarChart3, 
  FileText, 
  Bell, 
  Wallet, 
  MessageSquare, 
  Smartphone,
  Shield,
  Zap,
  TrendingUp,
  Users,
  Lock,
  Cloud
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';

const features = [
  {
    icon: Bell,
    title: "Alertas de Pagamento Inteligentes",
    description: "Nunca mais perca um prazo! Receba notificações automáticas no WhatsApp sobre pagamentos pendentes, vencimentos e atrasos.",
    color: "from-blue-500 to-cyan-500",
    benefit: "Reduza inadimplência em até 70%",
    delay: 0.1,
  },
  {
    icon: BarChart3,
    title: "Dashboard em Tempo Real",
    description: "Visualize todos seus empréstimos, pagamentos e status em um painel intuitivo. Acompanhe valores recebidos, pendentes e em atraso.",
    color: "from-purple-500 to-pink-500",
    benefit: "Economize 5 horas por semana",
    delay: 0.2,
  },
  {
    icon: FileText,
    title: "Geração de Relatórios Automática",
    description: "Exporte relatórios completos em Excel e PDF com um clique. Análises semanais e mensais prontas para decisões estratégicas.",
    color: "from-green-500 to-emerald-500",
    benefit: "100% de produtividade",
    delay: 0.3,
  },
  {
    icon: Wallet,
    title: "Gestão de Contratos Simplificada",
    description: "Cadastre clientes, contratos e condições de pagamento em segundos. Sistema intuitivo que qualquer pessoa consegue usar.",
    color: "from-orange-500 to-red-500",
    benefit: "Setup em menos de 5 minutos",
    delay: 0.4,
  },
  {
    icon: MessageSquare,
    title: "Cobrança Automatizada",
    description: "Envie lembretes e cobranças personalizadas diretamente pelo sistema. Templates prontos para cada situação.",
    color: "from-indigo-500 to-blue-500",
    benefit: "Recupere 40% mais rápido",
    delay: 0.5,
  },
  {
    icon: Smartphone,
    title: "Acesse de Qualquer Lugar",
    description: "Sistema 100% online e otimizado para celular. Gerencie seus empréstimos de onde estiver, quando quiser.",
    color: "from-teal-500 to-cyan-500",
    benefit: "Disponível 24/7 em qualquer dispositivo",
    delay: 0.6,
  },
];

const additionalFeatures = [
  { icon: Shield, label: "Segurança Máxima", description: "Criptografia de ponta a ponta" },
  { icon: Zap, label: "Ultra Rápido", description: "Performance otimizada" },
  { icon: TrendingUp, label: "Análises Avançadas", description: "Insights em tempo real" },
  { icon: Users, label: "Multi-usuários", description: "Gerencie sua equipe" },
  { icon: Lock, label: "Privacidade Total", description: "Seus dados protegidos" },
  { icon: Cloud, label: "Backup Automático", description: "Nunca perca dados" },
];

function FeatureCard({ feature, index }: { feature: typeof features[0], index: number }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [10, -10]));
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-10, 10]));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: feature.delay, duration: 0.6, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: rotateX,
        rotateY: rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative group"
    >
      <div className="relative h-full p-8 lg:p-10 rounded-2xl backdrop-blur-xl group transition-all duration-500 overflow-hidden"
      style={{
        background: 'rgba(26, 58, 82, 0.3)',
        border: '1px solid rgba(76, 142, 196, 0.3)'
      }}>
        {/* Gradient background on hover */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
        />
        
        {/* Animated border gradient */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: `linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)`,
            backgroundSize: "200% 200%",
          }}
          animate={isHovered ? {
            backgroundPosition: ["0% 0%", "100% 100%"],
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Icon with 3D effect */}
        <motion.div
          className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-2xl`}
          whileHover={{ scale: 1.1, rotate: 360 }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: "preserve-3d", transform: "translateZ(50px)" }}
        >
          <feature.icon className="w-8 h-8 text-white" />
          
          {/* Glow effect */}
          <motion.div
            className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} blur-xl`}
            animate={isHovered ? { scale: 1.5, opacity: 0.5 } : { scale: 1, opacity: 0 }}
          />
        </motion.div>

        {/* Content */}
        <h3 className="text-xl lg:text-2xl font-bold mb-4 text-white">{feature.title}</h3>
        <p className="text-gray-400 leading-relaxed mb-4">
          {feature.description}
        </p>
        
        {/* Benefit Badge */}
        {(feature as any).benefit && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-blue-300">
              {(feature as any).benefit}
            </span>
          </div>
        )}

        {/* Hover indicator */}
        <motion.div
          className="absolute bottom-8 right-8 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={isHovered ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Zap className="w-5 h-5 text-white" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="features" className="py-16 sm:py-20 lg:py-32 xl:py-40 relative overflow-hidden px-4 sm:px-6 lg:px-8" style={{ background: 'transparent' }}>
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent" />
      
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
            className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-4"
            style={{
              background: 'rgba(74, 144, 255, 0.2)',
              border: '2px solid rgba(74, 144, 255, 0.5)',
              color: '#4a90ff',
              boxShadow: '0 0 20px rgba(74, 144, 255, 0.3)'
            }}
          >
            RECURSOS PREMIUM
          </motion.span>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-white">
            Tudo que você precisa para{' '}
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6, #14b8a6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Recursos
            </span>{' '}
            da Ferramenta
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Tudo que você precisa para gerenciar seus empréstimos de forma profissional
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-20">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Additional Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-20"
        >
          <h3 className="text-2xl lg:text-3xl font-bold text-center mb-12 text-white">
            E muito mais...
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                whileHover={{ 
        scale: 1.05, 
        y: -10,
        transition: { duration: 0.3 }
      }}
      onHoverStart={(e) => {
        const target = e.currentTarget as HTMLElement;
        target.style.background = 'rgba(44, 89, 130, 0.5)';
        target.style.border = '2px solid rgba(74, 144, 255, 0.6)';
        target.style.boxShadow = '0 20px 40px rgba(74, 144, 255, 0.3)';
      }}
      onHoverEnd={(e) => {
        const target = e.currentTarget as HTMLElement;
        target.style.background = 'rgba(26, 58, 82, 0.3)';
        target.style.border = '1px solid rgba(76, 142, 196, 0.3)';
        target.style.boxShadow = 'none';
      }}
                className="text-center group cursor-pointer"
              >
                <motion.div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300" 
                  style={{
                    background: 'linear-gradient(135deg, rgba(74, 144, 255, 0.3), rgba(20, 255, 198, 0.3))',
                    boxShadow: '0 0 20px rgba(74, 144, 255, 0.3)'
                  }}
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                >
                  <feature.icon className="w-8 h-8" style={{
                    color: '#4a90ff',
                    filter: 'drop-shadow(0 0 6px rgba(74, 144, 255, 0.8))'
                  }} />
                </motion.div>
                <h4 className="font-semibold text-white mb-1">{feature.label}</h4>
                <p className="text-xs text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
