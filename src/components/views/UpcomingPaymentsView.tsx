import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Calendar,
  Search,
  Phone,
  Mail,
  ArrowLeft,
  Clock,
  DollarSign
} from 'lucide-react';

/**
 * UpcomingPaymentsView - Visualização de pagamentos próximos
 * 
 * Funcionalidades:
 * - Lista pagamentos próximos do vencimento
 * - Filtros e busca por cliente/empréstimo
 * - Ações rápidas (visualizar, pagar, etc.)
 * - Integração com React Router para navegação
 * - Interface responsiva e acessível
 * 
 * @component
 * @returns {JSX.Element} Componente de pagamentos próximos
 */
export default function UpcomingPaymentsView() {
  const navigate = useNavigate();
  const { loans, payments } = useSupabaseData();
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  // Get all upcoming payments (next 30 days) - exclude loans with current installment already paid
  const upcomingPayments = loans
    .filter(loan => {
      if (loan.status !== 'active') return false;
      
      // Check if current installment is already paid
      const loanPayments = payments.filter(p => p.loan_id === loan.id && p.status === 'paid');
      const paidInstallments = loanPayments.length;
      
      // If all installments are paid, exclude from upcoming
      if (paidInstallments >= loan.installments) return false;
      
      const today = new Date();
      const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      const paymentDate = new Date(loan.next_payment_date);
      return paymentDate >= today && paymentDate <= next30Days;
    })
    .filter(loan => {
      if (!searchTerm) return true;
      const clientName = loan.clients?.name || '';
      return clientName.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
  };

  const getDaysUntilDue = (dateString: string) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyVariant = (days: number) => {
    if (days <= 1) return 'destructive';
    if (days <= 3) return 'outline';
    if (days <= 7) return 'secondary';
    return 'default';
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Próximos Vencimentos</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {upcomingPayments.length} pagamentos nos próximos 30 dias
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome do cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Próximos 7 dias</p>
                <p className="text-xl font-bold text-warning">
                  {upcomingPayments.filter(loan => getDaysUntilDue(loan.next_payment_date) <= 7).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total a Receber</p>
                <p className="text-xl font-bold text-success">
                  {formatCurrency(upcomingPayments.reduce((sum, loan) => sum + loan.installment_value, 0))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgentes (≤3 dias)</p>
                <p className="text-xl font-bold text-destructive">
                  {upcomingPayments.filter(loan => getDaysUntilDue(loan.next_payment_date) <= 3).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      {isMobile ? (
        <div className="space-y-4">
          {upcomingPayments.map((loan) => {
            const daysUntil = getDaysUntilDue(loan.next_payment_date);
            return (
              <Card key={loan.id} className="shadow-sm border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-base truncate">{loan.clients?.name}</h3>
                      <p className="text-sm text-muted-foreground">Empréstimo #{loan.id.slice(0, 8)}</p>
                    </div>
                    <Badge variant={getUrgencyVariant(daysUntil)} className="ml-2 flex-shrink-0">
                      {daysUntil === 0 ? 'Hoje' : 
                       daysUntil === 1 ? 'Amanhã' : 
                       `${daysUntil} dias`}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Vencimento:</span>
                      <span className="text-sm font-medium">{formatDate(loan.next_payment_date)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Valor:</span>
                      <span className="text-sm font-bold text-primary">{formatCurrency(loan.installment_value)}</span>
                    </div>
                    {loan.clients?.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span>{loan.clients.phone}</span>
                      </div>
                    )}
                    {loan.clients?.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{loan.clients.email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Lista de Vencimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Contato</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingPayments.map((loan) => {
                  const daysUntil = getDaysUntilDue(loan.next_payment_date);
                  return (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{loan.clients?.name}</p>
                          <p className="text-sm text-muted-foreground">#{loan.id.slice(0, 8)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{formatDate(loan.next_payment_date)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-primary">{formatCurrency(loan.installment_value)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getUrgencyVariant(daysUntil)}>
                          {daysUntil === 0 ? 'Hoje' : 
                           daysUntil === 1 ? 'Amanhã' : 
                           `${daysUntil} dias`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {loan.clients?.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <span>{loan.clients.phone}</span>
                            </div>
                          )}
                          {loan.clients?.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              <span className="truncate max-w-[150px]">{loan.clients.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {upcomingPayments.length === 0 && (
        <Card className="shadow-sm border-border/50">
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum vencimento encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Tente ajustar os termos de busca" : "Não há pagamentos previstos para os próximos 30 dias"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}