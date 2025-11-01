import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, TrendingUp, Shield, Clock, Users, ArrowRight, Zap } from 'lucide-react';
import { useFreeTrial } from '@/hooks/useFreeTrial';
import { Button } from '@/components/ui/button';
import titanjurosLogo from '@/assets/titanjuros-logo.png';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { trialStatus, isLoading } = useFreeTrial();

  const features = [
    {
      icon: CheckCircle2,
      title: 'Gestão Completa',
      description: 'Controle total de empréstimos, clientes e pagamentos em um só lugar',
      color: 'from-blue-500 to-sky-500'
    },
    {
      icon: TrendingUp,
      title: 'Relatórios Inteligentes',
      description: 'Acompanhe seu crescimento com gráficos e análises em tempo real',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Seus dados protegidos com criptografia de ponta a ponta',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Clock,
      title: 'Acesso 24/7',
      description: 'Sistema online disponível a qualquer hora, em qualquer lugar',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Users,
      title: 'Suporte Dedicado',
      description: 'Nossa equipe pronta para ajudar você via WhatsApp',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Sparkles,
      title: 'Atualizações Grátis',
      description: 'Novos recursos e melhorias sem custo adicional',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl w-full relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                <CheckCircle2 className="w-14 h-14 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <img src={titanjurosLogo} alt="TitanJuros" className="h-12 mx-auto mb-4" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 bg-clip-text text-transparent mb-4"
          >
            🎉 Bem-vindo ao TitanJuros!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-700 mb-3 font-medium"
          >
            Seu teste grátis de <span className="font-bold text-blue-600">7 dias</span> começou agora!
          </motion.p>

          {!isLoading && trialStatus && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-sky-500 text-white px-6 py-3 rounded-full text-base font-bold shadow-lg"
            >
              <Clock className="w-5 h-5" />
              {trialStatus.daysRemaining} dias restantes
            </motion.div>
          )}
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trial Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 rounded-3xl p-8 md:p-10 text-white mb-10 shadow-2xl relative overflow-hidden"
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-8 h-8" />
              <h2 className="text-3xl font-bold">Durante seu teste grátis você terá:</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <span className="font-medium">Acesso a 1 dispositivo</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <span className="font-medium">Até 5 empréstimos ou clientes</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <span className="font-medium">Privacidade Total e Segurança</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <span className="font-medium">Sistema Online 24/7</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <span className="font-medium">Suporte no WhatsApp</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <span className="font-medium">Sem cartão de crédito</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="text-center"
        >
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 px-16 rounded-2xl text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3"
          >
            Acessar Dashboard
            <ArrowRight className="w-6 h-6" />
          </Button>
          <p className="text-sm text-gray-600 mt-6 font-medium">
            Comece a explorar todas as funcionalidades agora mesmo! 🚀
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
