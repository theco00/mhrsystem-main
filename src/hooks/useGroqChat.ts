import { useState } from 'react';

interface GroqConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface UseGroqChatReturn {
  sendMessage: (message: string, context?: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
  setApiKey: (key: string) => void;
}

const DEFAULT_CONFIG: GroqConfig = {
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  model: import.meta.env.VITE_GROQ_MODEL || 'qwen/qwen3-32b',
  baseUrl: import.meta.env.VITE_GROQ_BASE_URL || 'https://api.groq.com/openai/v1'
};

export function useGroqChat(): UseGroqChatReturn {
  const [config, setConfig] = useState<GroqConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setApiKey = (key: string) => {
    setConfig(prev => ({ ...prev, apiKey: key }));
  };

  const sendMessage = async (message: string, context?: string): Promise<string> => {
    if (!config.apiKey) {
      throw new Error('API Key do Groq não configurada');
    }

    setIsLoading(true);
    setError(null);

    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `Você é um assistente inteligente do TitanJuros, um sistema de gestão de empréstimos e clientes. 
          
          IMPORTANTE: Você DEVE responder SEMPRE e EXCLUSIVAMENTE em português brasileiro (PTBR). Nunca responda em inglês ou outro idioma.
          
          Suas principais funções são:
          - Responder perguntas sobre clientes, empréstimos e pagamentos
          - Fornecer estatísticas e relatórios do sistema
          - Ajudar com consultas específicas sobre dados financeiros
          - Orientar sobre funcionalidades do sistema
          
          Características importantes:
          - Seja sempre prestativo, preciso e profissional
          - Use linguagem clara e amigável em português brasileiro
          - OBRIGATÓRIO: Todas as suas respostas devem ser em português brasileiro
          - Use termos financeiros apropriados para o contexto brasileiro
          - Forneça informações detalhadas quando solicitado
          - Se não souber algo específico, seja honesto sobre isso
          - Use formatação em português (datas, números, moeda em real brasileiro)
          
          ${context ? `Contexto adicional dos dados: ${context}` : ''}`
        },
        {
          role: 'user',
          content: message
        }
      ];

      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 1,
          stream: false,
          // Forçar resposta em português brasileiro
          response_format: { type: "text" },
          // Instruções adicionais para garantir português
          stop: null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `Erro na API: ${response.status}`;
        
        // Tratamento específico para problemas de API Key
        if (response.status === 401 || errorMessage.includes('Unauthorized')) {
          throw new Error(
            'Chave da API inválida. Verifique sua chave do Groq nas configurações.'
          );
        }
        
        // Tratamento para rate limit
        if (response.status === 429) {
          throw new Error(
            'Limite de requisições excedido. Aguarde alguns segundos e tente novamente.'
          );
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Resposta inválida da API');
      }

      return data.choices[0].message.content;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
    error,
    setApiKey
  };
}
