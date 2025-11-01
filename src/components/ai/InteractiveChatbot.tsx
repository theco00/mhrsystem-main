import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MessageCircle, TrendingUp, Users, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGroqChat } from '@/hooks/useGroqChat';
// import { useSupabaseChatbot, Client, Loan, Payment, DatabaseStats } from '@/hooks/useSupabaseChatbot';

// Tipos temporários até criar o hook useSupabaseChatbot
interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  cpf?: string;
  status: string;
  created_at: string;
}

interface Loan {
  id: string;
  amount: number;
  interest_rate: number;
  next_payment_date: string;
  remaining_amount: number;
  status: string;
  installments: number;
  client?: Client;
}

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  installment_number: number;
  status: string;
  loan?: {
    client?: Client;
  };
}

interface DatabaseStats {
  totalClients: number;
  activeLoans: number;
  totalLoaned: number;
  overdueLoans: number;
  totalReceived: number;
  currentBalance: number;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  data?: any;
  type?: 'text' | 'clients' | 'loans' | 'payments' | 'stats';
}

interface InteractiveChatbotProps {
  className?: string;
}

const SUGGESTED_COMMANDS = [
  "Quantos clientes temos cadastrados?",
  "Mostrar empréstimos ativos",
  "Qual a receita total?",
  "Pagamentos em atraso",
  "Buscar cliente João",
  "Próximos vencimentos"
];

export function InteractiveChatbot({ className }: InteractiveChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { sendMessage, isLoading: aiLoading, error } = useGroqChat();
  // const { 
  //   isLoading: dbLoading, 
  //   processNaturalLanguageQuery, 
  //   getStatistics 
  // } = useSupabaseChatbot();
  
  // Temporário até implementar useSupabaseChatbot
  const dbLoading = false;
  const processNaturalLanguageQuery = async (query: string) => {
    return { data: null, type: 'text' };
  };

  // Scroll automático para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mensagem de boas-vindas
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        content: 'Olá! Sou o assistente do TitanJuros. Posso ajudá-lo com informações sobre clientes, empréstimos, pagamentos e estatísticas do sistema. Como posso ajudar?',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || aiLoading || dbLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputValue;
    setInputValue('');

    try {
      // Processar consulta no banco de dados real
      const queryResult = await processNaturalLanguageQuery(currentMessage);
      
      // Preparar contexto para a IA
      let context = '';
      if (queryResult && queryResult.data) {
        context = `Dados encontrados: ${JSON.stringify(queryResult.data)}`;
      }

      // Enviar para a IA
      const aiResponse = await sendMessage(currentMessage, context);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'bot',
        timestamp: new Date(),
        data: queryResult?.data,
        type: queryResult?.type as any
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (err) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Desculpe, ocorreu um erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedCommand = (command: string) => {
    setInputValue(command);
  };

  const renderMessageData = (message: ChatMessage) => {
    if (!message.data || message.type === 'text') return null;

    switch (message.type) {
      case 'clients':
        return (
          <div className="mt-3 space-y-2">
            {Array.isArray(message.data) && message.data.map((client: Client) => (
              <Card key={client.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{client.name}</h4>
                    {client.email && <p className="text-sm text-gray-600">{client.email}</p>}
                    {client.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
                    {client.address && <p className="text-sm text-gray-600">{client.address}</p>}
                    {client.cpf && <p className="text-sm text-gray-600">CPF: {client.cpf}</p>}
                  </div>
                  <div className="text-right">
                    <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                      {client.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <p className="text-sm mt-1">ID: {client.id.slice(0, 8)}...</p>
                    <p className="text-sm">Criado: {new Date(client.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );

      case 'loans':
        return (
          <div className="mt-3 space-y-2">
            {Array.isArray(message.data) && message.data.map((loan: Loan) => (
              <Card key={loan.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{loan.client?.name || 'Cliente não encontrado'}</h4>
                    <p className="text-sm text-gray-600">Valor: R$ {loan.amount.toLocaleString('pt-BR')}</p>
                    <p className="text-sm text-gray-600">Taxa: {loan.interest_rate}%</p>
                    <p className="text-sm text-gray-600">Próximo Pagamento: {new Date(loan.next_payment_date).toLocaleDateString('pt-BR')}</p>
                    <p className="text-sm text-gray-600">Restante: R$ {loan.remaining_amount.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      loan.status === 'active' ? 'default' : 
                      loan.status === 'paid' ? 'secondary' : 'destructive'
                    }>
                      {loan.status === 'active' ? 'Ativo' : 
                       loan.status === 'paid' ? 'Pago' : 'Atrasado'}
                    </Badge>
                    <p className="text-sm mt-1">ID: {loan.id.slice(0, 8)}...</p>
                    <p className="text-sm">Parcelas: {loan.installments}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );

      case 'payments':
        return (
          <div className="mt-3 space-y-2">
            {Array.isArray(message.data) && message.data.map((payment: Payment) => (
              <Card key={payment.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{payment.loan?.client?.name || 'Cliente não encontrado'}</h4>
                    <p className="text-sm text-gray-600">Valor: R$ {payment.amount.toLocaleString('pt-BR')}</p>
                    <p className="text-sm text-gray-600">Data: {new Date(payment.payment_date).toLocaleDateString('pt-BR')}</p>
                    <p className="text-sm text-gray-600">Parcela: {payment.installment_number}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      payment.status === 'paid' ? 'secondary' : 
                      payment.status === 'pending' ? 'default' : 'destructive'
                    }>
                      {payment.status === 'paid' ? 'Pago' : 
                       payment.status === 'pending' ? 'Pendente' : 'Atrasado'}
                    </Badge>
                    <p className="text-sm mt-1">ID: {payment.id.slice(0, 8)}...</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );

      case 'stats':
        const stats = message.data as DatabaseStats;
        return (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Clientes</p>
                  <p className="font-semibold">{stats?.totalClients || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Empréstimos Ativos</p>
                  <p className="font-semibold">{stats?.activeLoans || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Emprestado</p>
                  <p className="font-semibold">R$ {(stats?.totalLoaned || 0).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Empréstimos Vencidos</p>
                  <p className="font-semibold">{stats?.overdueLoans || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Recebido</p>
                  <p className="font-semibold">R$ {(stats?.totalReceived || 0).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Saldo Atual</p>
                  <p className="font-semibold">R$ {(stats?.currentBalance || 0).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 safe-bottom safe-right overflow-hidden border-2 border-white"
      >
        <img 
          src="/images/chatbot-avatar.png" 
          alt="Chatbot Avatar" 
          className="w-full h-full object-cover"
        />
      </button>
    );
  }

  return (
    <Card className={`fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-96 h-[100dvh] sm:h-[600px] sm:max-h-[90vh] shadow-2xl border-0 sm:rounded-lg bg-white/95 backdrop-blur-sm z-50 ${className}`}>
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-md">
              <img 
                src="/images/chatbot-avatar.png" 
                alt="Chatbot Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <CardTitle className="text-lg">TitanJuros Assistant</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            ×
          </Button>
        </div>
        <p className="text-sm text-white/90">Assistente inteligente do sistema</p>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-[calc(100dvh-120px)] sm:h-[calc(600px-120px)]">
        {/* Área de mensagens */}
        <ScrollArea className="flex-1 p-3 sm:p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white ml-2'
                      : 'bg-gray-100 text-gray-800 mr-2'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' && (
                      <div className="h-6 w-6 rounded-full overflow-hidden border border-gray-300 flex-shrink-0">
                        <img 
                          src="/images/chatbot-avatar.png" 
                          alt="Bot" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {message.sender === 'user' && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {renderMessageData(message)}
                    </div>
                  </div>
                </div>
                <p className={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {(aiLoading || dbLoading) && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg mr-2">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processando...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Comandos sugeridos */}
        {messages.length <= 1 && (
          <div className="px-3 sm:px-4 pb-2">
            <p className="text-xs text-gray-600 mb-2">Comandos sugeridos:</p>
            <div className="flex flex-wrap gap-1">
              {SUGGESTED_COMMANDS.slice(0, 3).map((command, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestedCommand(command)}
                  className="text-xs h-7 px-2"
                >
                  {command}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Área de input */}
        <div className="p-3 sm:p-4 border-t bg-gray-50 safe-bottom">
          {error && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua pergunta..."
              disabled={aiLoading || dbLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || aiLoading || dbLoading}
              size="icon"
              className="bg-blue-500 hover:bg-blue-600"
            >
              {aiLoading || dbLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
