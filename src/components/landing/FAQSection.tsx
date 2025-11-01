import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';

const faqs = [
  {
    question: "O que é o Titan Juros?",
    answer: "É um sistema completo voltado para profissionais que atuam no ramo de empréstimo financeiro. Com interface moderna e intuitiva, você tem controle total sobre seus clientes e operações.",
    category: "geral",
  },
  {
    question: "Onde posso acessar o sistema?",
    answer: "Você pode acessar através do navegador do celular ou computador. Em breve, teremos aplicativo próprio para Android e iOS.",
    category: "acesso",
  },
  {
    question: "Tem suporte para tirar dúvidas?",
    answer: "Sim! Temos uma equipe especializada para te ajudar via WhatsApp sempre que precisar.",
    category: "suporte",
  },
  {
    question: "Meus dados estão seguros?",
    answer: "Totalmente! Nosso sistema conta com criptografia de ponta, backup automático e está hospedado em infraestrutura de alta segurança. Você pode fazer download dos seus dados a qualquer momento.",
    category: "seguranca",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim! Você tem total liberdade para cancelar sua assinatura quando quiser, sem multas ou burocracias.",
    category: "pagamento",
  },
  {
    question: "Quantos usuários posso cadastrar?",
    answer: "Não há limite! Você pode cadastrar quantos clientes e empréstimos precisar, sem custos adicionais.",
    category: "recursos",
  },
  {
    question: "Como funciona o sistema de alertas?",
    answer: "O sistema envia automaticamente lembretes de pagamento via WhatsApp para seus clientes, além de notificar você sobre pagamentos em atraso e vencimentos próximos.",
    category: "recursos",
  },
  {
    question: "Preciso instalar algum programa?",
    answer: "Não! O Titan Juros funciona 100% online, direto no seu navegador. Basta fazer login e começar a usar.",
    category: "acesso",
  },
];

const categories = [
  { id: "todos", label: "Todos", icon: HelpCircle },
  { id: "geral", label: "Geral", icon: HelpCircle },
  { id: "acesso", label: "Acesso", icon: HelpCircle },
  { id: "recursos", label: "Recursos", icon: HelpCircle },
  { id: "seguranca", label: "Segurança", icon: HelpCircle },
  { id: "pagamento", label: "Pagamento", icon: HelpCircle },
  { id: "suporte", label: "Suporte", icon: MessageCircle },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("todos");
  
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const filteredFaqs = selectedCategory === "todos" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <section id="faq" className="py-24 lg:py-40 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent" />
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 max-w-5xl">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
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
            FAQ
          </motion.span>
          
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 text-white">
            Dúvidas{' '}
            <span style={{
              background: 'linear-gradient(135deg, #4a90ff, #14ffc6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 10px rgba(74, 144, 255, 0.5))'
            }}>
              Frequentes
            </span>
          </h2>
          
          <p className="text-xl text-gray-300">
            Respostas para as perguntas mais comuns
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.4 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id)}
              className="px-4 py-2 rounded-xl font-bold transition-all duration-300 flex items-center gap-2"
              style={selectedCategory === category.id ? {
                background: 'linear-gradient(135deg, #4a90ff, #14ffc6)',
                color: '#ffffff',
                boxShadow: '0 0 30px rgba(74, 144, 255, 0.5)',
                transform: 'scale(1.05)'
              } : {
                background: 'rgba(26, 58, 82, 0.4)',
                border: '1px solid rgba(76, 142, 196, 0.3)',
                color: 'rgba(255, 255, 255, 0.8)'
              }}
            >
              <category.icon className="w-4 h-4" style={{
                filter: selectedCategory === category.id 
                  ? 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))'
                  : 'drop-shadow(0 0 2px currentColor)'
              }} />
              {category.label}
            </motion.button>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <AnimatePresence mode="wait">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={`${selectedCategory}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="relative backdrop-blur-xl rounded-2xl transition-all duration-300 overflow-hidden"
                  style={{
                    background: 'rgba(26, 58, 82, 0.3)',
                    border: '1px solid rgba(76, 142, 196, 0.3)',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(44, 89, 130, 0.4)';
                    e.currentTarget.style.border = '1px solid rgba(74, 144, 255, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(74, 144, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(26, 58, 82, 0.3)';
                    e.currentTarget.style.border = '1px solid rgba(76, 142, 196, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="relative w-full p-6 lg:p-8 text-left flex items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-lg lg:text-xl text-white pr-4 flex items-start gap-3">
                        <span className="text-blue-400 mt-1">
                          {String(index + 1).padStart(2, '0')}.
                        </span>
                        {faq.question}
                      </h3>
                    </div>
                    
                    <motion.div
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="w-6 h-6" style={{
                        color: '#4a90ff',
                        filter: 'drop-shadow(0 0 4px rgba(74, 144, 255, 0.6))'
                      }} />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 lg:px-8 pb-6 lg:pb-8">
                          <div className="border-t border-white/10 pt-6">
                            <motion.p
                              initial={{ y: -10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.1 }}
                              className="text-gray-300 text-base lg:text-lg leading-relaxed pl-9"
                            >
                              {faq.answer}
                            </motion.p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <motion.div 
            className="inline-flex flex-col items-center gap-4 p-10 rounded-3xl backdrop-blur-xl shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(26, 58, 82, 0.6), rgba(44, 89, 130, 0.5))',
              border: '2px solid rgba(74, 144, 255, 0.5)',
              boxShadow: '0 0 40px rgba(74, 144, 255, 0.3)'
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              <MessageCircle className="w-14 h-14" style={{
                color: '#14ffc6',
                filter: 'drop-shadow(0 0 12px rgba(20, 255, 198, 0.8))'
              }} />
            </motion.div>
            <h3 className="text-2xl font-bold text-white">Ainda tem dúvidas?</h3>
            <p className="text-gray-200 max-w-md text-lg">
              Nossa equipe está pronta para te ajudar!
            </p>
            <motion.a
              href="https://wa.me/5592984822890?text=Olá!%20Preciso%20de%20ajuda%20com%20o%20TitanJuros"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 font-bold rounded-xl transition-all duration-300 text-lg"
              style={{
                background: 'linear-gradient(135deg, #25d366, #128c7e)',
                color: '#ffffff',
                boxShadow: '0 0 30px rgba(37, 211, 102, 0.5)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.08)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(37, 211, 102, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(37, 211, 102, 0.5)';
              }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" style={{
                filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))'
              }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.5)' }}>
                  Falar com Suporte
                </span>
              </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
