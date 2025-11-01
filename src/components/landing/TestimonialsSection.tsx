import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
  highlight: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Carlos Eduardo Silva',
    role: 'Proprietário',
    company: 'CE Financeira',
    content: 'O TitanJuros revolucionou a forma como gerencio meus contratos de empréstimo. Antes levava horas para organizar pagamentos e prazos, agora tudo é automatizado.',
    highlight: 'Reduzi 80% do tempo gasto com gestão',
    rating: 5,
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Eduardo&background=3b82f6&color=fff&size=200'
  },
  {
    id: '2', 
    name: 'Ana Paula Mendes',
    role: 'Gestora Financeira',
    company: 'AP Consultoria',
    content: 'A plataforma é intuitiva e completa. Os alertas de pagamento me ajudam a manter tudo em dia. Nunca mais perdi um prazo importante desde que comecei a usar.',
    highlight: '100% dos pagamentos em dia',
    rating: 5,
    avatar: 'https://ui-avatars.com/api/?name=Ana+Paula&background=3b82f6&color=fff&size=200'
  },
  {
    id: '3',
    name: 'Roberto Almeida',
    role: 'Diretor',
    company: 'RA Empréstimos',
    content: 'Excelente custo-benefício! Por menos de R$ 30 mensais, tenho um sistema profissional que me permite gerenciar centenas de contratos sem complicação.',
    highlight: '500+ contratos gerenciados',
    rating: 5,
    avatar: 'https://ui-avatars.com/api/?name=Roberto+Almeida&background=3b82f6&color=fff&size=200'
  }
];

interface TestimonialsSectionProps {
  KIVANO_PURCHASE_URL: string;
}

export default function TestimonialsSection({ KIVANO_PURCHASE_URL }: TestimonialsSectionProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="testimonials" className="py-16 sm:py-20 lg:py-32 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-sky-50 dark:from-blue-950/20 dark:via-transparent dark:to-sky-950/20" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-gray-900 dark:text-white">O que nossos </span>
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              clientes dizem
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Mais de 5.000 profissionais já transformaram sua gestão financeira com o TitanJuros
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="relative"
            >
              <div className="h-full bg-white dark:bg-gray-900 rounded-2xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
                {/* Quote icon */}
                <Quote className="absolute top-6 right-6 w-8 h-8 text-blue-100 dark:text-blue-900/30" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Highlight */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {testimonial.highlight}
                  </span>
                </div>

                {/* Content */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full border-2 border-blue-100 dark:border-blue-800"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role} • {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA after testimonials */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-12 lg:mt-16"
        >
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Junte-se a milhares de profissionais que já otimizaram sua gestão financeira
          </p>
          <a href={KIVANO_PURCHASE_URL} target="_blank" rel="noopener noreferrer">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-xl transition-all"
            >
              Testar Agora Gratuitamente
            </motion.button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
