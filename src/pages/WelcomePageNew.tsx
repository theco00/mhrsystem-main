import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, TrendingUp, Shield, Clock, Users, ArrowRight, Zap, CreditCard, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import titanjurosLogo from '@/assets/titanjuros-logo.png';

export default function WelcomePageNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<'trial' | 'monthly' | 'quarterly' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Planos disponíveis
  const plans = [
    {
      id: 'trial' as const,
      name: 'Teste Grátis',
      duration: '7 dias',
      price: 0,
      priceFormatted: 'Grátis',
      badge: 'COMECE AGORA',
      badgeColor: 'from-green-500 to-emerald-600',
      features: [
        'Acesso a 1 dispositivo',
        'Até 5 empréstimos',
        'Até 5 clientes',
        'Suporte WhatsApp',
        'Sem cartão de crédito'
      ],
      buttonText: 'Começar Teste Grátis',
      buttonColor: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
    },
    {
      id: 'monthly' as const,
      name: 'Plano Mensal',
      duration: '1 mês',
      price: 29.99,
      priceFormatted: '29,99',
      badge: 'MAIS POPULAR',
      badgeColor: 'from-yellow-500 to-orange-600',
      features: [
        'Dispositivos ilimitados',
        'Empréstimos ilimitados',
        'Clientes ilimitados',
        'Suporte prioritário',
        'Backup automático'
      ],
      buttonText: 'Assinar Plano Mensal',
      buttonColor: 'from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700'
    },
    {
      id: 'quarterly' as const,
      name: 'Plano Trimestral',
      duration: '3 meses',
      price: 97.99,
      priceFormatted: '97,99',
      badge: 'MELHOR OFERTA',
      badgeColor: 'from-purple-500 to-pink-600',
      monthlyEquivalent: 32.66,
      savings: '45%',
      features: [
        'Dispositivos ilimitados',
        'Empréstimos ilimitados',
        'Clientes ilimitados',
        'Suporte prioritário',
        'Backup automático',
        '+ Economize 45%'
      ],
      buttonText: 'Assinar Plano Trimestral',
      buttonColor: 'from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
    }
  ];

  const handleSelectPlan = async (planId: 'trial' | 'monthly' | 'quarterly') => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para selecionar um plano',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    setSelectedPlan(planId);

    try {
      if (planId === 'trial') {
        // Criar trial automaticamente usando user_subscriptions
        const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
        
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'trial',
            trial_ends_at: trialEndDate.toISOString(),
          })
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: '🎉 Teste Grátis Ativado!',
          description: 'Seu período de teste de 7 dias começou agora!',
        });

        // Redirecionar para dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);

      } else if (planId === 'quarterly') {
        // Redirecionar para Cakto (Trimestral)
        toast({
          title: 'Redirecionando para pagamento...',
          description: 'Você será redirecionado para o checkout seguro',
        });
        window.location.href = 'https://pay.cakto.com.br/u7imesx_631205';

      } else if (planId === 'monthly') {
        // Redirecionar para Cakto (Mensal)
        toast({
          title: 'Redirecionando para pagamento...',
          description: 'Você será redirecionado para o checkout seguro',
        });
        window.location.href = 'https://pay.cakto.com.br/345a25k_618991';
      }
    } catch (error: any) {
      console.error('Erro ao processar plano:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível processar sua escolha',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 py-12 px-4 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
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

          <img src={titanjurosLogo} alt="TitanJuros" className="h-12 mx-auto mb-6" />

          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            🎉 Bem-vindo ao TitanJuros!
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 mb-6 font-medium">
            Escolha o plano ideal para começar
          </p>
        </motion.div>

        {/* Plans Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8 mb-12"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden border-2 transition-all duration-300 ${
                selectedPlan === plan.id ? 'border-blue-500 ring-4 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {/* Badge */}
              <div className={`bg-gradient-to-r ${plan.badgeColor} text-white text-center py-3 px-4 font-bold text-sm`}>
                {plan.badge}
              </div>

              <div className="p-8">
                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.duration}</p>

                {/* Price */}
                <div className="mb-6">
                  {plan.price === 0 ? (
                    <div className="text-5xl font-bold text-green-600">Grátis</div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl text-gray-600">R$</span>
                        <span className="text-5xl font-bold text-gray-900">{plan.priceFormatted}</span>
                      </div>
                      {plan.monthlyEquivalent && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-green-600 font-semibold">
                          <TrendingDown className="w-4 h-4" />
                          Apenas R$ {plan.monthlyEquivalent.toFixed(2)}/mês
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isProcessing}
                  className={`w-full bg-gradient-to-r ${plan.buttonColor} text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2`}
                >
                  {isProcessing && selectedPlan === plan.id ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      {plan.buttonText}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center text-gray-600 text-sm"
        >
          <p className="mb-2">✨ Todos os planos incluem suporte via WhatsApp</p>
          <p>🔒 Pagamento seguro processado pela Cakto</p>
        </motion.div>
      </div>
    </div>
  );
}
