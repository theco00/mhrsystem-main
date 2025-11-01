import { motion } from 'framer-motion';
import { MessageCircle, ArrowLeft, Phone, Mail, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HelpPage() {
  const navigate = useNavigate();

  // Número do WhatsApp (mesmo do site)
  const WHATSAPP_NUMBER = '5592984822890'; // Substitua pelo seu número real
  const WHATSAPP_MESSAGE = 'Olá! Preciso de ajuda com o TitanJuros.';

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-sky-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-sky-950/30 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Ajuda & Suporte
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Estamos aqui para ajudar você!
          </p>
        </motion.div>

        {/* Card Principal - WhatsApp */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <Card className="overflow-hidden border-2 border-green-200 dark:border-green-800">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl">Fale Conosco no WhatsApp</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                    Atendimento rápido e personalizado
                  </p>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Descrição */}
                <p className="text-gray-700 dark:text-gray-300">
                  Precisa de ajuda? Nossa equipe está pronta para atender você pelo WhatsApp. 
                  Clique no botão abaixo para iniciar uma conversa conosco!
                </p>

                {/* Botão WhatsApp */}
                <Button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>Abrir WhatsApp</span>
                </Button>

                {/* Informações de Horário */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Horário de Atendimento
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Segunda a Sexta: 9h às 18h<br />
                      Sábado: 9h às 13h
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cards Adicionais */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-sky-600 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  Envie sua dúvida por email
                </p>
                <a
                  href="mailto:suporte@titanjuros.com.br"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  suporte@titanjuros.com.br
                </a>
              </CardContent>
            </Card>
          </motion.div>

          {/* Telefone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  Telefone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  Ligue para nossa central
                </p>
                <a
                  href="tel:+5511999999999"
                  className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  (11) 99999-9999
                </a>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* FAQ Rápido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Perguntas Frequentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Como faço para renovar minha assinatura?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Acesse a seção de preços na página inicial e escolha o plano desejado.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Posso usar em mais de um dispositivo?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sim! Com os planos pagos você tem acesso ilimitado a dispositivos.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Meus dados estão seguros?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sim! Utilizamos criptografia de ponta e seus dados são armazenados com segurança.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
