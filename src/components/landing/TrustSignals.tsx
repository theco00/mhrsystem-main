import { motion } from 'framer-motion';
import { Shield, Award, Lock, CheckCircle, Star, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';

export default function TrustSignals() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const guarantees = [
    {
      icon: Shield,
      title: 'Garantia de 30 Dias',
      description: 'Devolução total do valor se não ficar satisfeito',
      highlight: true,
    },
    {
      icon: Lock,
      title: 'Pagamento 100% Seguro',
      description: 'Criptografia SSL e proteção de dados',
      highlight: false,
    },
    {
      icon: Award,
      title: 'Suporte Vitalício',
      description: 'Assistência técnica sem custo adicional',
      highlight: false,
    },
    {
      icon: RefreshCw,
      title: 'Atualizações Gratuitas',
      description: 'Sempre com a versão mais recente',
      highlight: false,
    },
  ];

  const testimonials = [
    {
      name: 'Carlos Eduardo Silva',
      role: 'Empresário - São Paulo',
      rating: 5,
      text: 'O TitanJuros revolucionou meu negócio! Consegui organizar todos os empréstimos e aumentei meu lucro em 40% em apenas 2 meses.',
      revenue: '+R$ 12.000/mês',
      image: 'https://i.pravatar.cc/150?img=7',
    },
    {
      name: 'Ana Paula Oliveira',
      role: 'Autônoma - Rio de Janeiro',
      rating: 5,
      text: 'Sistema incrível! Muito fácil de usar e me ajudou a controlar melhor meus clientes. Já recuperei o investimento no primeiro mês!',
      revenue: '+R$ 8.500/mês',
      image: 'https://i.pravatar.cc/150?img=5',
    },
    {
      name: 'Roberto Mendes',
      role: 'Investidor - Belo Horizonte',
      rating: 5,
      text: 'Finalmente um sistema que funciona de verdade! Interface limpa, relatórios completos. Vale cada centavo investido.',
      revenue: '+R$ 15.000/mês',
      image: 'https://i.pravatar.cc/150?img=8',
    },
  ];

  const stats = [
    { label: 'Clientes Ativos', value: 5847, suffix: '+', icon: Users },
    { label: 'Taxa de Satisfação', value: 98.7, suffix: '%', icon: TrendingUp },
    { label: 'Anos no Mercado', value: 5, suffix: '+', icon: Award },
    { label: 'Transações/Dia', value: 10000, suffix: '+', icon: CheckCircle },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-32 relative overflow-hidden">
      {/* Background com gradiente inspirado na página de login */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f4f1ec] via-[#eef2f7] to-[#dbe5f4]/50 dark:from-[#050b16] dark:via-[#0c1626] dark:to-[#132742]/70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(68,142,208,0.12),transparent_60%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(74,144,226,0.15),transparent_60%)] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Estatísticas impressionantes */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-slate-800 dark:text-slate-100">
            Números que{' '}
            <span className="bg-gradient-to-r from-[#448ed0] to-[#4a90e2] bg-clip-text text-transparent">
              Impressionam
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Junte-se a milhares de empreendedores que já transformaram seus negócios
          </p>
        </motion.div>

        {/* Grid de estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.1 }}
              className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm backdrop-saturate-150 rounded-xl p-6 text-center shadow-xl border border-slate-200/60 dark:border-slate-700/60"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-[#448ed0]" />
              <div className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                {inView && (
                  <CountUp
                    end={stat.value}
                    duration={2.5}
                    separator="."
                    decimals={stat.label.includes('Taxa') ? 1 : 0}
                  />
                )}
                {stat.suffix}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testemunhos */}
        <div className="mb-16">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl font-bold text-center mb-10 text-slate-800 dark:text-slate-100"
          >
            O que nossos clientes dizem
          </motion.h3>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm backdrop-saturate-150 rounded-xl p-6 shadow-xl border border-slate-200/60 dark:border-slate-700/60"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100">{testimonial.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{testimonial.role}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 mb-4">"{testimonial.text}"</p>

                {/* Badge de resultado */}
                <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  {testimonial.revenue}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Garantias */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-white/50 to-white/30 dark:from-slate-800/50 dark:to-slate-800/30 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/40"
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-slate-800 dark:text-slate-100">
            Sua Satisfação Garantida
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {guarantees.map((guarantee, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.7 + index * 0.1 }}
                className={`text-center p-4 rounded-xl ${
                  guarantee.highlight
                    ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30'
                    : ''
                }`}
              >
                <guarantee.icon
                  className={`w-10 h-10 mx-auto mb-3 ${
                    guarantee.highlight ? 'text-green-500' : 'text-[#448ed0]'
                  }`}
                />
                <h4 className="font-semibold mb-2 text-slate-800 dark:text-slate-100">{guarantee.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{guarantee.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Selo de segurança */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" className="h-8 opacity-60" />
            <Shield className="w-10 h-10 text-slate-400" />
            <Lock className="w-10 h-10 text-slate-400" />
            <Award className="w-10 h-10 text-slate-400" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
