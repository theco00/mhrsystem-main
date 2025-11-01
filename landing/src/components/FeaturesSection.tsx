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
    icon: BarChart3,
    title: "Dashboard Completo",
    description: "Painel financeiro com informações importantes como valores a receber, recebidos, em atraso e gráficos detalhados.",
    color: "from-blue-500 to-cyan-500",
    delay: 0.1,
  },
  {
    icon: FileText,
    title: "Relatórios Inteligentes",
    description: "Tenha acesso a relatórios semanais e mensais com dados de pagamentos para melhor controle de sua operação.",
    color: "from-purple-500 to-pink-500",
    delay: 0.2,
  },
  {
    icon: Bell,
    title: "Alertas Automáticos",
    description: "Receba alertas de pagamentos direto no WhatsApp e nunca perca um prazo importante.",
    color: "from-green-500 to-emerald-500",
    delay: 0.3,
  },
  {
    icon: Wallet,
    title: "Controle Total",
    description: "Cadastre e controle seus clientes e empréstimos com apenas um clique, de forma simples e eficiente.",
    color: "from-orange-500 to-red-500",
    delay: 0.4,
  },
  {
    icon: MessageSquare,
    title: "Cobranças Rápidas",
    description: "Visualize pagamentos em atraso e envie mensagens de cobrança para seus clientes em apenas um clique.",
    color: "from-indigo-500 to-blue-500",
    delay: 0.5,
  },
  {
    icon: Smartphone,
    title: "Total Mobilidade",
    description: "Acesse através de celular ou computador, onde você estiver, quando quiser.",
    color: "from-teal-500 to-cyan-500",
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
      <div className="relative h-full p-8 lg:p-10 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden">
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
        <p className="text-gray-300 leading-relaxed">{feature.description}</p>

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
    <section id="features" className="py-16 sm:py-20 lg:py-32 xl:py-40 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2C5282]/5 to-transparent" />
      
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
            className="inline-block px-4 py-2 rounded-full bg-[#2C5282]/10 border border-[#2C5282]/30 text-[#4A90E2] text-sm font-medium mb-4"
          >
            RECURSOS PREMIUM
          </motion.span>
          
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 text-white">
            <span className="bg-gradient-to-r from-[#4A90E2] via-[#5B9FE3] to-[#4285F4] bg-clip-text text-transparent">
              Recursos
            </span>{' '}
            da Ferramenta
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
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
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center group cursor-pointer"
              >
                <motion.div
                  className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center group-hover:border-[#2C5282]/50 transition-all duration-300"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-10 h-10 text-[#4A90E2] group-hover:text-[#5B9FE3] transition-colors" />
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
