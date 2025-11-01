import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const GOOGLE_API_KEY = 'AIzaSyB6YRbA1Nq3ekH7ugtTYiI6Khh1pYDNY-Y';

export function GeminiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { clients, loans, payments } = useSupabaseData();

  // Scroll automático para última mensagem
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
        content: '👋 Olá! Sou o assistente do TitanJuros.\n\nPosso ajudar com:\n• Empréstimos ativos\n• Próximos pagamentos\n• Resumo financeiro',
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  // Preparar contexto dos dados do usuário
  const getUserContext = () => {
    const activeLoans = loans.filter(l => l.status === 'active');
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const totalClients = clients.length;

    return `
CONTEXTO DO USUÁRIO:
- Total de clientes: ${totalClients}
- Empréstimos ativos: ${activeLoans.length}
- Pagamentos pendentes: ${pendingPayments.length}
- Valor total em empréstimos: R$ ${activeLoans.reduce((sum, l) => sum + l.amount, 0).toFixed(2)}

EMPRÉSTIMOS ATIVOS:
${activeLoans.map(loan => `
  • ID: ${loan.id}
  • Cliente: ${loan.clients?.name || 'N/A'}
  • Valor: R$ ${loan.amount.toFixed(2)}
  • Taxa: ${loan.interest_rate}%
  • Parcelas: ${loan.installments}
  • Próximo pagamento: ${loan.next_payment_date}
`).join('\n')}

PAGAMENTOS PENDENTES:
${pendingPayments.slice(0, 5).map(payment => `
  • Valor: R$ ${payment.amount.toFixed(2)}
  • Data: ${payment.payment_date}
  • Parcela: ${payment.installment_number}
`).join('\n')}
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
      // Inicializar Gemini
      const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });

      // Preparar prompt com contexto
      const context = getUserContext();
      const systemPrompt = `Você é um assistente financeiro especializado do sistema TitanJuros.
Seu papel é ajudar o usuário com informações sobre empréstimos, pagamentos e gestão financeira.

INSTRUÇÕES:
- Seja objetivo e profissional
- Use emojis quando apropriado
- Formate valores monetários em R$
- Se não souber algo, seja honesto
- Baseie suas respostas nos dados fornecidos

${context}

Pergunta do usuário: ${input}`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();

      const assistantMessage: Message = {
        role: 'assistant',
        content: text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      
      let errorText = '❌ Desculpe, ocorreu um erro ao processar sua mensagem.';
      
      // Detalhes específicos do erro
      if (error?.message) {
        errorText += `\n\n**Detalhes**: ${error.message}`;
      }
      
      if (error?.status === 400) {
        errorText = '❌ Erro na requisição. Verifique se a API key está correta.';
      } else if (error?.status === 403) {
        errorText = '❌ API key inválida ou sem permissões. Verifique sua chave do Google.';
      } else if (error?.status === 429) {
        errorText = '❌ Limite de requisições atingido. Aguarde alguns minutos.';
      }
      
      const errorMessage: Message = {
        role: 'assistant',
        content: errorText,
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

  // Sugestões de perguntas
  const suggestions = [
    'Quanto falta pagar nos meus empréstimos?',
    'Quais são os próximos pagamentos?',
    'Qual o total de empréstimos ativos?',
    'Mostre meu resumo financeiro'
  ];

  if (!user) return null;

  return (
    <>
      {/* Botão Flutuante */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-primary to-accent hover:scale-110 transition-all duration-300 z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-[calc(100vw-2rem)] sm:w-[400px] h-[calc(100vh-2rem)] sm:h-[600px] max-h-[600px] shadow-2xl z-50 flex flex-col bg-white dark:bg-blue-950 border-2 border-blue-500/30">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gradient-to-r from-primary to-accent text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              <div>
                <h3 className="text-sm sm:text-base font-bold">Assistente TitanJuros</h3>
                <p className="text-[10px] sm:text-xs opacity-90">Powered by Gemini AI</p>
              </div>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-3 sm:p-4" ref={scrollRef}>
            <div className="space-y-3 sm:space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2.5 sm:p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-blue-50 dark:bg-blue-900/50 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p className="text-[10px] sm:text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-blue-50 dark:bg-blue-900/50 rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}

              {/* Sugestões (apenas se não houver mensagens do usuário) */}
              {messages.length === 1 && (
                <div className="space-y-2">
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Perguntas sugeridas:</p>
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start text-[10px] sm:text-xs h-auto py-2"
                      onClick={() => setInput(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t bg-blue-50/50 dark:bg-blue-950/50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta..."
                disabled={isLoading}
                className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-gradient-to-r from-primary to-accent h-9 w-9 sm:h-10 sm:w-10"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
