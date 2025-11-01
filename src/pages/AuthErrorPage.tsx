import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

const AuthErrorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const error = searchParams.get('error');
  const errorCode = searchParams.get('error_code');
  const errorDescription = searchParams.get('error_description');

  const getErrorDetails = () => {
    switch (errorCode) {
      case 'unexpected_failure':
        return {
          title: 'Erro inesperado na autenticação',
          description: 'Ocorreu um erro ao processar seu login. Isso pode ser um problema temporário.',
          solution: 'Tente fazer login novamente. Se o problema persistir, entre em contato com o suporte.'
        };
      case 'provider_not_found':
        return {
          title: 'Provedor não configurado',
          description: 'O login com Google não está configurado corretamente.',
          solution: 'Entre em contato com o suporte técnico para resolver este problema.'
        };
      case 'access_denied':
        return {
          title: 'Acesso negado',
          description: 'Você cancelou o processo de login com Google.',
          solution: 'Se você deseja continuar, tente fazer login novamente.'
        };
      default:
        return {
          title: 'Erro na autenticação',
          description: errorDescription || 'Ocorreu um erro durante o processo de autenticação.',
          solution: 'Tente fazer login novamente. Se o problema continuar, contate o suporte.'
        };
    }
  };

  const errorDetails = getErrorDetails();

  const handleRetry = () => {
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-blue-100">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {errorDetails.title}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {errorDetails.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Detalhes técnicos (em desenvolvimento) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 bg-gray-100 rounded-lg text-xs font-mono">
              <div><strong>Error:</strong> {error}</div>
              <div><strong>Code:</strong> {errorCode}</div>
              <div><strong>Description:</strong> {errorDescription}</div>
            </div>
          )}
          
          {/* Solução sugerida */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">O que fazer?</h4>
            <p className="text-sm text-blue-800">
              {errorDetails.solution}
            </p>
          </div>
          
          {/* Ações */}
          <div className="space-y-2">
            <Button 
              onClick={handleRetry} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleGoHome}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Página Inicial
            </Button>
          </div>
          
          {/* Ajuda adicional */}
          <div className="text-center text-sm text-gray-500">
            <p>Precisa de ajuda? </p>
            <a 
              href="mailto:suporte@titanjuros.com.br" 
              className="text-blue-600 hover:underline"
            >
              Entre em contato com o suporte
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthErrorPage;
