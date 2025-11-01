import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Sparkles, Mail, Lock, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * ThankYouPage Ultra-Moderna
 * Página de agradecimento pós-compra com animações e instruções claras
 */
export default function ThankYouPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Countdown para redirecionamento automático
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a3d2e] via-[#1a5f4a] to-[#0984e3] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(29,209,161,0.3),transparent_50%)]" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(29, 209, 161, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(9, 132, 227, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(29, 209, 161, 0.2) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl w-full"
        >
          {/* Success Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2 
              }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-50 animate-pulse" />
                <div className="relative bg-green-500 rounded-full p-6">
                  <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-5xl font-bold text-center text-white mb-4"
            >
              Pagamento Confirmado! 🎉
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-center text-white/80 mb-8"
            >
              Bem-vindo ao <span className="font-bold text-[#1dd1a1]">Titan Juros</span>
            </motion.p>

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-6 mb-8"
            >
              {/* Step 1 */}
              <div className="flex items-start gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="bg-[#1dd1a1] rounded-full p-3 flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    1. Verifique seu e-mail
                  </h3>
                  <p className="text-white/70 text-sm">
                    Enviamos suas credenciais de acesso para o e-mail cadastrado na compra.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="bg-[#0984e3] rounded-full p-3 flex-shrink-0">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    2. Faça login no sistema
                  </h3>
                  <p className="text-white/70 text-sm">
                    Use o e-mail e senha enviados para acessar sua conta.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="bg-[#ff6b6b] rounded-full p-3 flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    3. Comece a usar
                  </h3>
                  <p className="text-white/70 text-sm">
                    Explore todas as funcionalidades e gerencie seus empréstimos com facilidade.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Email Input (Optional) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-8"
            >
              <label className="block text-white/80 text-sm font-medium mb-2">
                Não recebeu o e-mail? Digite aqui para reenviar:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#1dd1a1] focus:border-transparent"
                />
                <button className="px-6 py-3 bg-[#1dd1a1] hover:bg-[#1dd1a1]/90 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105">
                  Reenviar
                </button>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={handleGoToLogin}
              className="w-full bg-gradient-to-r from-[#1dd1a1] to-[#0984e3] hover:from-[#1dd1a1]/90 hover:to-[#0984e3]/90 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-2 group"
            >
              <span>Acessar o Sistema Agora</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Auto Redirect Info */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center text-white/60 text-sm mt-4"
            >
              Redirecionando automaticamente em <span className="font-bold text-[#1dd1a1]">{countdown}s</span>
            </motion.p>

            {/* Sparkles */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex justify-center gap-2 mt-6"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  <Sparkles className="w-5 h-5 text-[#1dd1a1]" />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Support Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-8 text-center"
          >
            <p className="text-white/60 text-sm">
              Precisa de ajuda? Entre em contato com nosso suporte:{' '}
              <a 
                href="mailto:suporte@titanjuros.com" 
                className="text-[#1dd1a1] hover:underline font-semibold"
              >
                suporte@titanjuros.com
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
