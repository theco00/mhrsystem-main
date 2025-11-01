import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, CreditCard, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import titanjurosLogo from '@/assets/titanjuros-logo.svg';

const CAKTO_PAYMENT_URL = "https://pay.cakto.com.br/345a25k_618991";

export function SubscriptionRequired() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handlePayment = () => {
    // Redirecionar para Cakto com email do usuário
    const paymentUrl = user?.email 
      ? `${CAKTO_PAYMENT_URL}?email=${encodeURIComponent(user.email)}`
      : CAKTO_PAYMENT_URL;
    window.location.href = paymentUrl;
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Botão de Voltar */}
      <Button
        onClick={handleLogout}
        variant="ghost"
        className="absolute top-4 left-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Sair
      </Button>

      <Card className="max-w-2xl w-full shadow-2xl border-2">
        <CardHeader className="text-center pb-4">
          {/* Logo */}
          <div className="mx-auto w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <img src={titanjurosLogo} alt="TitanJuros" className="w-14 h-14" />
          </div>

          {/* Ícone de Bloqueio */}
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>

          <CardTitle className="text-3xl font-bold">
            Assinatura Necessária
          </CardTitle>
          <p className="text-muted-foreground mt-2 text-lg">
            Para acessar o dashboard e todas as funcionalidades do TitanJuros, você precisa de uma assinatura ativa.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Benefícios */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-6 border">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Check className="h-6 w-6 text-green-500" />
              O que você terá acesso:
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'Gestão completa de empréstimos',
                'Controle de clientes e pagamentos',
                'Relatórios e análises financeiras',
                'Calculadora de juros avançada',
                'Notificações automáticas',
                'Chatbot com IA para suporte',
                'Suporte prioritário',
                'Atualizações constantes'
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preço */}
          <div className="text-center py-8 border-y bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Apenas</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-muted-foreground line-through">R$ 49,99</span>
              <span className="text-6xl font-bold text-primary">R$ 29,99</span>
            </div>
            <p className="text-muted-foreground mt-2 text-lg">por mês</p>
            <p className="text-sm text-green-600 dark:text-green-400 font-semibold mt-2">
              🎉 Oferta de Lançamento - 40% OFF
            </p>
          </div>

          {/* Botão de Pagamento */}
          <Button
            onClick={handlePayment}
            size="lg"
            className="w-full h-16 text-xl font-bold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          >
            <CreditCard className="mr-2 h-6 w-6" />
            Assinar Agora
          </Button>

          {/* Informações de Segurança */}
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="space-y-1">
              <div className="text-2xl">✅</div>
              <p className="font-semibold">Pagamento Seguro</p>
              <p className="text-xs text-muted-foreground">Via Cakto</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">🔄</div>
              <p className="font-semibold">Cancele Quando Quiser</p>
              <p className="text-xs text-muted-foreground">Sem multas</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">⚡</div>
              <p className="font-semibold">Acesso Imediato</p>
              <p className="text-xs text-muted-foreground">Após pagamento</p>
            </div>
          </div>

          {/* Garantia */}
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="font-semibold text-green-700 dark:text-green-300">
              🛡️ Garantia de 7 dias
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Se não gostar, devolvemos seu dinheiro sem perguntas
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
