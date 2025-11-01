import { motion } from 'framer-motion';
import { Shield, Award, Lock, CheckCircle, Building, Star } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const certifications = [
  {
    icon: Shield,
    title: "SSL Seguro",
    description: "Criptografia de ponta",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Lock,
    title: "LGPD Compliance",
    description: "100% em conformidade",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Award,
    title: "ISO 27001",
    description: "Certificado internacional",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: CheckCircle,
    title: "99.9% Uptime",
    description: "Garantia de disponibilidade",
    color: "from-orange-500 to-red-500"
  }
];

const partners = [
  { name: "Google Cloud", type: "Infraestrutura" },
  { name: "Stripe", type: "Pagamentos" },
  { name: "WhatsApp Business", type: "Comunicação" },
  { name: "Microsoft Azure", type: "Backup" }
];

export default function CertificationsSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-gray-900 dark:text-white">Segurança e </span>
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Confiabilidade
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Sua gestão financeira protegida com os mais altos padrões de segurança do mercado
          </p>
        </motion.div>

        {/* Certifications Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {certifications.map((cert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative group"
            >
              <div className="h-full bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${cert.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <cert.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  {cert.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {cert.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Partners Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Parceiros de Tecnologia
          </h3>
          
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-800">
                  <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {partner.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {partner.type}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/30 dark:to-sky-900/30 border border-blue-200 dark:border-blue-800">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-gray-900 dark:text-white font-semibold">
              Mais de 5.000 empresas confiam no TitanJuros
            </span>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
