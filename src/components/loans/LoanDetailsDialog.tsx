import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Calendar, 
  User, 
  Percent, 
  Hash,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Loan } from '@/hooks/useSupabaseData';

interface LoanDetailsDialogProps {
  loan: Loan | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LoanDetailsDialog({ loan, isOpen, onClose }: LoanDetailsDialogProps) {
  if (!loan) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'overdue':
        return 'Atrasado';
      case 'paid':
        return 'Quitado';
      default:
        return 'Desconhecido';
    }
  };

  const paidAmount = loan.amount - loan.remaining_amount;
  const paymentProgress = (paidAmount / loan.amount) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Detalhes do Empréstimo
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{formatCurrency(loan.amount)}</h3>
              <p className="text-muted-foreground">Cliente: {loan.clients?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(loan.status)}
              <Badge 
                variant={
                  loan.status === 'active' ? 'default' :
                  loan.status === 'overdue' ? 'destructive' : 'secondary'
                }
              >
                {getStatusText(loan.status)}
              </Badge>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do Pagamento</span>
              <span>{paymentProgress.toFixed(1)}%</span>
            </div>
            <Progress value={paymentProgress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Pago: {formatCurrency(paidAmount)}</span>
              <span>Restante: {formatCurrency(loan.remaining_amount)}</span>
            </div>
          </div>

          <Separator />

          {/* Loan Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações do Empréstimo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Original</p>
                    <p className="font-bold text-lg">{formatCurrency(loan.amount)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Percent className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Juros</p>
                    <p className="font-medium">{loan.interest_rate}% ao mês</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Número de Parcelas</p>
                    <p className="font-medium">{loan.installments}x</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Valor da Parcela</p>
                    <p className="font-medium text-primary">{formatCurrency(loan.installment_value)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datas Importantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Início</p>
                    <p className="font-medium">{formatDate(loan.start_date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Próximo Vencimento</p>
                    <p className="font-medium text-warning">{formatDate(loan.next_payment_date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cadastrado em</p>
                    <p className="font-medium">{formatDate(loan.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{loan.clients?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{loan.clients?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}