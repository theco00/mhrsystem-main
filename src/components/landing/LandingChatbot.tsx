import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// CORREÇÃO DE SEGURANÇA: Usar variável de ambiente
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error('⚠️ VITE_GOOGLE_GEMINI_API_KEY não configurada no .env');
}

function LandingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll para última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mensagem de boas-vindas
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: '👋 Olá! Sou o assistente virtual do TitanJuros.\n\nEstou aqui para responder suas dúvidas sobre:\n\n• Funcionalidades do sistema\n• Planos e preços\n• Segurança e privacidade\n• Como começar a usar\n\nComo posso ajudar você hoje?',
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  // Contexto específico da landing page
  const getLandingContext = () => {
    return `
Você é um assistente de vendas especializado do TitanJuros, um SaaS de gestão de empréstimos e contratos financeiros.

INFORMAÇÕES DO PRODUTO:
- Nome: TitanJuros
- Propósito: Plataforma completa para gerenciamento de empréstimos pessoais e contratos financeiros
- Benefício Principal: Gerencie empréstimos e contratos de forma simples e sem complicação

FUNCIONALIDADES PRINCIPAIS:
1. Alertas de Pagamento Inteligentes - Notificações automáticas no WhatsApp sobre pagamentos pendentes
2. Dashboard em Tempo Real - Visualize todos empréstimos, pagamentos e status em um painel intuitivo
3. Geração de Relatórios Automática - Exporte relatórios em Excel e PDF com um clique
4. Gestão de Contratos Simplificada - Cadastre clientes e contratos em segundos
5. Cobrança Automatizada - Envie lembretes personalizados pelo sistema
6. Acesso de Qualquer Lugar - Sistema 100% online, disponível 24/7

PLANOS E PREÇOS:
- Plano Teste (7 dias): R$ 9,99
- Plano Mensal: R$ 29,99/mês (MAIS POPULAR)
- Plano Semestral (6 meses): R$ 97,99 (Economize 45% - R$ 16,33/mês)

TODOS OS PLANOS INCLUEM:
✓ Acesso ilimitado a dispositivos
✓ Sem limite de empréstimos ou clientes
✓ Privacidade Total e Segurança
✓ Sistema Online 24/7
✓ Suporte no WhatsApp
✓ Atualizações gratuitas
✓ Backup automático diário
✓ Exportação de dados em Excel/PDF

SEGURANÇA:
- SSL Seguro com criptografia de ponta
- LGPD Compliance - 100% em conformidade
- ISO 27001 certificado
- 99.9% Uptime garantido
- Parceiros: Google Cloud, Stripe, WhatsApp Business, Microsoft Azure

BENEFÍCIOS COMPROVADOS:
- Reduza inadimplência em até 70%
- Economize 5 horas por semana
- Setup em menos de 5 minutos
- Recupere pagamentos 40% mais rápido
- Mais de 5.000 clientes ativos
- 98% de satisfação

GARANTIAS:
✓ Garantia de 7 dias
✓ Suporte prioritário
✓ Sem taxa de setup
✓ Cancele quando quiser

INSTRUÇÕES:
- Seja amigável, profissional e prestativo
- Foque nos BENEFÍCIOS, não apenas nas features
- Use emojis moderadamente para tornar a conversa mais amigável
- Se perguntarem sobre preços, destaque o plano mensal como mais popular
- Sempre incentive o teste gratuito ou demonstração
- Se não souber algo específico, seja honesto e ofereça contato com suporte
- Mantenha respostas concisas (máximo 3-4 parágrafos)
- Use bullet points quando listar informações
- Sempre termine oferecendo ajuda adicional

EXEMPLOS DE RESPOSTAS:
- Para "Quanto custa?": Destaque o plano mensal de R$ 29,99 e mencione o teste de 7 dias por R$ 9,99
- Para "É seguro?": Fale sobre SSL, LGPD, ISO 27001 e parceiros confiáveis
- Para "Como funciona?": Explique o processo simples de cadastro e uso intuitivo
- Para "Tem suporte?": Confirme suporte no WhatsApp e disponibilidade 24/7
`;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        }
      });

      const context = getLandingContext();
      const conversationHistory = messages
        .slice(-6)
        .map(m => `${m.role === 'user' ? 'Cliente' : 'Assistente'}: ${m.content}`)
        .join('\n\n');

      const prompt = `${context}

HISTÓRICO DA CONVERSA:
${conversationHistory}

NOVA PERGUNTA DO CLIENTE:
${input}

RESPOSTA (seja direto, útil e incentive a ação):`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const assistantMessage: Message = {
        role: 'assistant',
        content: text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '😅 Desculpe, tive um problema ao processar sua mensagem. Por favor, tente novamente ou entre em contato com nosso suporte pelo WhatsApp.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "Quanto custa o sistema?",
    "Como funciona o teste grátis?",
    "É seguro usar?",
    "Posso cancelar quando quiser?"
  ];

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 group"
          >
            <div className="relative">
              {/* Pulse animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-ping opacity-75" />
              
              {/* Button */}
              <div className="relative h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 shadow-2xl flex items-center justify-center hover:shadow-blue-500/50 transition-all duration-300">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>

              {/* Badge */}
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              Tire suas dúvidas aqui! 💬
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed bottom-4 right-4 w-[calc(100vw-2rem)] sm:w-[420px] h-[calc(100vh-2rem)] sm:h-[650px] max-h-[650px] shadow-2xl z-50 flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border-2 border-blue-500/30"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Assistente TitanJuros</h3>
                  <p className="text-xs opacity-90">Online • Responde em segundos</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-700 rounded-2xl p-3 shadow-md">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  </div>
                </div>
              )}

              {/* Quick Questions */}
              {messages.length === 1 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Perguntas frequentes:</p>
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(question);
                        setTimeout(() => sendMessage(), 100);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors text-sm text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-600"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua pergunta..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-white placeholder-gray-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg"
                >
                  <Send className="h-5 w-5 text-white" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Powered by Gemini AI • Respostas em tempo real
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default LandingChatbot;
