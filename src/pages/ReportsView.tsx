import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, Users, DollarSign, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { 
  exportClientsToExcel, 
  exportLoansToExcel, 
  exportPaymentsToExcel,
  exportCompleteReport 
} from '@/utils/excelExport';

interface Client {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  created_at: string;
  income: number;
  credit_score: number;
}

interface Loan {
  id: string;
  client_id: string;
  amount: number;
  interest_rate: number;
  installments: number;
  status: 'active' | 'paid' | 'overdue' | 'cancelled';
  start_date: string;
  next_payment_date: string;
  installment_value: number;
  clients?: Client;
}

interface Payment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  status: 'paid' | 'pending' | 'overdue';
  installment_number: number;
  loans?: Loan;
}

interface PaymentReportData {
  id: string;
  clientName: string;
  loanId: string;
  amount: number;
  paymentDate: string;
  status: string;
  installmentNumber: number;
  totalInstallments: number;
}

/**
 * ReportsView - Geração de relatórios
 * 
 * Funcionalidades:
 * - Relatórios de clientes
 * - Relatórios de empréstimos
 * - Relatórios financeiros
 * - Interface responsiva e acessível
 * 
 * @component
 * @returns {JSX.Element} Componente de relatórios
 */
export default function ReportsView() {
  const { clients, loans, payments, isLoading } = useSupabaseData();
  const { toast } = useToast();
  const [isGeneratingReport, setIsGeneratingReport] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
  };

  const generateClientsReport = async () => {
    setIsGeneratingReport('clients');
    
    try {
      // Pequeno delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Exporta para Excel
      exportClientsToExcel(clients);
      
      const totalClients = clients.length;
      const activeClients = clients.filter(c => c.status === 'active').length;
      
      toast({
        title: "✅ Relatório exportado com sucesso!",
        description: `${totalClients} clientes exportados (${activeClients} ativos). O arquivo foi baixado.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um erro ao exportar o relatório de clientes.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(null);
    }
  };

  const generateFinancialReport = async () => {
    setIsGeneratingReport('financial');
    
    try {
      // Pequeno delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Exporta para Excel
      exportLoansToExcel(loans);
      
      const totalLoans = loans.length;
      const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
      const activeLoans = loans.filter(l => l.status === 'active').length;
      
      toast({
        title: "✅ Relatório exportado com sucesso!",
        description: `${totalLoans} empréstimos exportados (${activeLoans} ativos). Valor total: ${formatCurrency(totalAmount)}.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um erro ao exportar o relatório financeiro.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(null);
    }
  };

  const generatePaymentsReport = async () => {
    setIsGeneratingReport('payments');
    
    try {
      // Pequeno delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Exporta para Excel
      exportPaymentsToExcel(payments);
      
      const totalPayments = payments.length;
      const paidPayments = payments.filter(p => p.status === 'paid').length;
      const pendingPayments = payments.filter(p => p.status === 'pending').length;
      
      toast({
        title: "✅ Relatório exportado com sucesso!",
        description: `${totalPayments} pagamentos exportados (${paidPayments} pagos, ${pendingPayments} pendentes).`,
        variant: "default",
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um erro ao exportar o relatório de pagamentos.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6 animate-fade-in">
        <div className="mb-4 md:mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Vencido';
      case 'inactive': return 'Inativo';
      default: return status;
    }
  };

  const generateCompleteReportHandler = async () => {
    setIsGeneratingReport('complete');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      exportCompleteReport(clients, loans, payments);
      
      toast({
        title: "✅ Relatório completo exportado!",
        description: "Arquivo Excel com múltiplas abas (Clientes, Empréstimos, Pagamentos e Resumo) foi baixado.",
        variant: "default",
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um erro ao exportar o relatório completo.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(null);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1 md:mb-2">Relatórios</h1>
        <p className="text-muted-foreground text-sm md:text-base">Gere relatórios detalhados em Excel para análise</p>
      </div>

      {/* Botão de Relatório Completo */}
      <Card className="glass-card-premium border border-white/10 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Relatório Completo</h3>
                <p className="text-sm text-muted-foreground">Exporta todos os dados em um único arquivo Excel com múltiplas abas</p>
              </div>
            </div>
            <Button 
              onClick={generateCompleteReportHandler}
              disabled={isGeneratingReport === 'complete'}
              size="lg"
              className="w-full md:w-auto min-h-[44px]"
            >
              {isGeneratingReport === 'complete' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Tudo
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="glass-card-premium border border-white/10 hover-lift card-interactive stagger-item">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              Relatório de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold">{clients.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ativos</p>
                <p className="font-semibold text-green-600">
                  {clients.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
            <Button 
              onClick={generateClientsReport}
              disabled={isGeneratingReport === 'clients'}
              className="w-full"
            >
              {isGeneratingReport === 'clients' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isGeneratingReport === 'clients' ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card-premium border border-white/10 hover-lift card-interactive stagger-item" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-success/10">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              Relatório Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Empréstimos</p>
                <p className="font-semibold">{loans.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Valor Total</p>
                <p className="font-semibold text-green-600">
                  {formatCurrency(loans.reduce((sum, loan) => sum + loan.amount, 0))}
                </p>
              </div>
            </div>
            <Button 
              onClick={generateFinancialReport}
              disabled={isGeneratingReport === 'financial'}
              className="w-full"
            >
              {isGeneratingReport === 'financial' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isGeneratingReport === 'financial' ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card-premium border border-white/10 hover-lift card-interactive stagger-item" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-warning/10">
                <Calendar className="w-5 h-5 text-warning" />
              </div>
              Relatório de Pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold">{payments.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pagos</p>
                <p className="font-semibold text-green-600">
                  {payments.filter(p => p.status === 'paid').length}
                </p>
              </div>
            </div>
            <Button 
              onClick={generatePaymentsReport}
              disabled={isGeneratingReport === 'payments'}
              className="w-full"
            >
              {isGeneratingReport === 'payments' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isGeneratingReport === 'payments' ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card-premium border border-white/10 hover-lift card-interactive stagger-item" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-accent/10">
                <Users className="w-5 h-5 text-accent" />
              </div>
              Estatísticas Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Clientes Ativos</span>
                <Badge className={getStatusColor('active')}>
                  {getStatusText('active')}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Empréstimos Ativos</span>
                <Badge className={getStatusColor('active')}>
                  {loans.filter(l => l.status === 'active').length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pagamentos Pendentes</span>
                <Badge className={getStatusColor('pending')}>
                  {payments.filter(p => p.status === 'pending').length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-premium border border-white/10 hover-lift card-interactive stagger-item" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receita Total</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(
                    loans.reduce((sum, loan) => sum + (loan.amount * loan.interest_rate / 100), 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Empréstimos Pagos</span>
                <span className="font-semibold">
                  {loans.filter(l => l.status === 'paid').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxa de Inadimplência</span>
                <span className="font-semibold text-red-600">
                  {loans.length > 0 ? 
                    `${((loans.filter(l => l.status === 'overdue').length / loans.length) * 100).toFixed(1)}%` 
                    : '0%'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-premium border border-white/10 hover-lift card-interactive stagger-item" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-destructive/10">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              Alertas e Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Empréstimos Vencidos</span>
                <Badge className={getStatusColor('overdue')}>
                  {loans.filter(l => l.status === 'overdue').length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pagamentos Atrasados</span>
                <Badge className={getStatusColor('overdue')}>
                  {payments.filter(p => p.status === 'overdue').length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Clientes Inativos</span>
                <Badge className={getStatusColor('inactive')}>
                  {clients.filter(c => c.status === 'inactive').length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
