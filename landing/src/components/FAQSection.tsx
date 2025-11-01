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
    <section id="faq" className="py-16 sm:py-20 lg:py-32 xl:py-40 relative overflow-hidden px-4 sm:px-6 lg:px-8">
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
            className="inline-block px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium mb-4"
          >
            FAQ
          </motion.span>
          
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 text-white">
            Dúvidas{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
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
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/5 backdrop-blur-xl border border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              <category.icon className="w-4 h-4" />
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
                  className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 overflow-hidden"
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
                      <ChevronDown className="w-6 h-6 text-blue-400" />
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
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-white/10">
            <MessageCircle className="w-12 h-12 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Ainda tem dúvidas?</h3>
            <p className="text-gray-300 max-w-md">
              Nossa equipe está pronta para ajudar você. Entre em contato pelo WhatsApp e responderemos rapidamente.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300"
            >
              Falar com Suporte
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
