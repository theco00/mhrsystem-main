import { ReactNode, useMemo, useState } from "react";

import {
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Search,
  MessageCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { AnimatedList } from "@/components/layout/AnimatedList";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaymentActionDialog } from "@/components/payments/PaymentActionDialog";
import { WhatsAppModal } from "@/components/clients/WhatsAppModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSupabaseData, Client } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { isValidPhone } from "@/lib/whatsapp-utils";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

type PaymentScheduleItem = {
  id: string;
  loanId: string;
  clientName: string;
  amount: number;
  dueDate: Date;
  status: "paid" | "pending" | "overdue";
  installmentNumber: number;
  totalInstallments: number;
};

type StatusFilter = "all" | "pending" | "overdue" | "paid";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);

const formatDay = (date: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);

const statusConfig: Record<
  PaymentScheduleItem["status"],
  { label: string; badgeClass: string; icon: ReactNode }
> = {
  paid: {
    label: "Pago",
    badgeClass: "bg-success/10 text-success border-success/30",
    icon: <CheckCircle2 className="h-4 w-4 text-success" />,
  },
  pending: {
    label: "Pendente",
    badgeClass: "bg-warning/10 text-warning border-warning/30",
    icon: <Clock className="h-4 w-4 text-warning" />,
  },
  overdue: {
    label: "Atrasado",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/30",
    icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
  },
};

export default function PaymentsView() {
  const { loans, payments, refetch, clients } = useSupabaseData();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [selectedPayment, setSelectedPayment] = useState<{
    payment: PaymentScheduleItem;
    loan: (typeof loans)[number];
  } | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [whatsappClient, setWhatsappClient] = useState<Client | null>(null);

  const paymentSchedule = useMemo<PaymentScheduleItem[]>(() => {
    console.log('[PaymentsView] Recalculando paymentSchedule...');
    console.log('[PaymentsView] Total de loans:', loans.length);
    console.log('[PaymentsView] Total de payments no banco:', payments.length);
    
    const schedule: PaymentScheduleItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Adicionar todos os pagamentos PAGOS do banco de dados
    payments.forEach((payment) => {
      const loan = loans.find(l => l.id === payment.loan_id);
      if (!loan) return;

      schedule.push({
        id: payment.id,
        loanId: loan.id,
        clientName: loan.clients?.name ?? "Cliente",
        amount: payment.amount,
        dueDate: new Date(payment.payment_date + 'T00:00:00'),
        status: "paid",
        installmentNumber: payment.installment_number,
        totalInstallments: loan.installments,
      });
    });

    console.log('[PaymentsView] Pagamentos PAGOS adicionados:', schedule.filter(s => s.status === 'paid').length);

    // 2. Adicionar TODAS as parcelas PENDENTES para empréstimos ativos
    loans.forEach((loan) => {
      if (loan.status !== 'active' && loan.status !== 'overdue') {
        console.log(`[PaymentsView] Ignorando loan ${loan.id} - status: ${loan.status}`);
        return;
      }
      
      // Contar quantos pagamentos já foram feitos
      const paidCount = payments.filter(p => p.loan_id === loan.id && p.status === 'paid').length;
      
      console.log(`[PaymentsView] Loan ${loan.id}: ${paidCount}/${loan.installments} parcelas pagas`);
      
      // Adicionar TODAS as parcelas restantes (não apenas a próxima)
      const remainingInstallments = loan.installments - paidCount;
      
      for (let i = 0; i < remainingInstallments; i++) {
        const installmentNumber = paidCount + i + 1;
        
        // Calcular data de vencimento para cada parcela
        const dueDate = new Date(loan.next_payment_date + 'T00:00:00');
        dueDate.setMonth(dueDate.getMonth() + i);
        
        // Verificar se está atrasado
        const isOverdue = dueDate < today;
        
        schedule.push({
          id: `pending-${loan.id}-${installmentNumber}`,
          loanId: loan.id,
          clientName: loan.clients?.name ?? "Cliente",
          amount: loan.installment_value,
          dueDate,
          status: isOverdue ? "overdue" : "pending",
          installmentNumber: installmentNumber,
          totalInstallments: loan.installments,
        });
        
        console.log(`[PaymentsView] Adicionado parcela ${installmentNumber}/${loan.installments} - ${isOverdue ? 'ATRASADO' : 'PENDENTE'} para ${loan.clients?.name}`);
      }
    });

    console.log('[PaymentsView] Total de itens no schedule:', schedule.length);
    console.log('[PaymentsView] Breakdown: Pagos:', schedule.filter(s => s.status === 'paid').length, 
                'Pendentes:', schedule.filter(s => s.status === 'pending').length,
                'Atrasados:', schedule.filter(s => s.status === 'overdue').length);

    return schedule.sort(
      (first, second) => first.dueDate.getTime() - second.dueDate.getTime(),
    );
  }, [loans, payments]);

  const filteredPayments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return paymentSchedule.filter((payment) => {
      const matchesSearch =
        term.length === 0 ||
        payment.clientName.toLowerCase().includes(term) ||
        payment.loanId.includes(term);

      const matchesDate =
        !selectedDate ||
        format(payment.dueDate, "yyyy-MM-dd") ===
          format(selectedDate, "yyyy-MM-dd");

      const matchesStatus =
        statusFilter === "all" || payment.status === statusFilter;

      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [paymentSchedule, searchTerm, selectedDate, statusFilter]);

  const stats = useMemo(() => {
    const aggregate = paymentSchedule.reduce(
      (acc, payment) => {
        const key =
          payment.status === "overdue"
            ? "overdue"
            : payment.status === "paid"
            ? "paid"
            : "pending";

        acc[key].total += payment.amount;
        acc[key].count += 1;
        return acc;
      },
      {
        paid: { total: 0, count: 0 },
        pending: { total: 0, count: 0 },
        overdue: { total: 0, count: 0 },
      },
    );

    return aggregate;
  }, [paymentSchedule]);

  const handleExport = () => {
    toast({
      title: "Exportacao em breve",
      description: "Estamos finalizando o relatorio de pagamentos.",
    });
  };

  const handleMarkAsPaid = (paymentId: string, loanId: string) => {
    const payment = paymentSchedule.find((item) => item.id === paymentId);
    const loan = loans.find((item) => item.id === loanId);

    if (!payment || !loan) {
      toast({
        title: "Erro",
        description: "Pagamento ou emprestimo nao encontrado.",
        variant: "destructive",
      });
      return;
    }

    setSelectedPayment({ payment, loan });
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentConfirmed = async () => {
    console.log('[PaymentsView] Pagamento confirmado, atualizando lista...');
    
    // Forçar refetch imediato
    await refetch();
    
    // Limpar seleção e fechar diálogo
    setSelectedPayment(null);
    setIsPaymentDialogOpen(false);
    
    console.log('[PaymentsView] Lista de pagamentos atualizada');
  };

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="rounded-full px-4"
        onClick={handleExport}
      >
        <Download className="mr-2 h-4 w-4" />
        Exportar
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-full px-4">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "dd MMM", { locale: ptBR }) : "Filtrar por data"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={ptBR}
            initialFocus
          />
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setSelectedDate(undefined)}
            >
              Limpar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );

  const breadcrumbs = [
    { label: "Financeiro", href: "/dashboard" },
    { label: "Pagamentos" },
  ];

  const summaryCards = [
    {
      id: "paid",
      title: "Pagos",
      total: stats.paid.total,
      count: stats.paid.count,
      tone: "text-success",
      bg: "bg-success/10",
      icon: <CheckCircle2 className="h-5 w-5 text-success" />,
    },
    {
      id: "pending",
      title: "Pendentes",
      total: stats.pending.total,
      count: stats.pending.count,
      tone: "text-warning",
      bg: "bg-warning/10",
      icon: <Clock className="h-5 w-5 text-warning" />,
    },
    {
      id: "overdue",
      title: "Atrasados",
      total: stats.overdue.total,
      count: stats.overdue.count,
      tone: "text-destructive",
      bg: "bg-destructive/10",
      icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
    },
  ];

  const statusButtons: { label: string; value: StatusFilter }[] = [
    { label: "Todos", value: "all" },
    { label: "Pendentes", value: "pending" },
    { label: "Atrasados", value: "overdue" },
    { label: "Pagos", value: "paid" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gestao de pagamentos"
        description="Acompanhe cronogramas, quite parcelas e renove contratos com agilidade."
        breadcrumbs={breadcrumbs}
        actions={headerActions}
        metadata={
          <span className="text-xs text-muted-foreground sm:text-sm">
            {paymentSchedule.length} parcelas monitoradas
          </span>
        }
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {summaryCards.map((card, index) => (
          <Card
            key={card.id}
            className="glass-card border shadow-soft transition duration-300 ease-in-out-soft hover:-translate-y-1"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="flex items-center justify-between gap-4 p-5 sm:p-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
                  {card.title}
                </p>
                <p className="text-xl font-semibold text-foreground sm:text-2xl">
                  {formatCurrency(card.total)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {card.count} {card.count === 1 ? "parcela" : "parcelas"}
                </p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg}`}>
                {card.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="glass-card border shadow-soft">
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 pb-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Filtrar pagamentos
          </CardTitle>
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por cliente ou codigo"
                className="h-10 rounded-full bg-muted/60 pl-9 pr-4"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              {statusButtons.map((button) => (
                <Button
                  key={button.value}
                  size="sm"
                  variant={statusFilter === button.value ? "default" : "outline"}
                  className="rounded-full px-4"
                  onClick={() => setStatusFilter(button.value)}
                >
                  {button.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredPayments.length ? (
            <div className="divide-y divide-border/60">
              <AnimatedList itemClassName="px-4 py-4 md:px-6 md:py-5">
                {filteredPayments.map((payment) => {
                  const config = statusConfig[payment.status];
                  return (
                    <div
                      key={payment.id}
                      className="glass-card flex flex-col gap-4 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between md:p-5"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "border px-3 py-1 text-xs font-medium",
                              config.badgeClass,
                            )}
                          >
                            <span className="mr-2 inline-flex items-center gap-1">
                              {config.icon}
                              {config.label}
                            </span>
                            Parcela {payment.installmentNumber}/
                            {payment.totalInstallments}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Cod. {payment.loanId.slice(0, 6)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                            {payment.clientName}
                          </h3>
                          {(() => {
                            const loan = loans.find(l => l.id === payment.loanId);
                            const client = loan?.clients;
                            return client?.phone && isValidPhone(client.phone) ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-1.5 hover:bg-green-50 rounded-full"
                                onClick={() => setWhatsappClient(client)}
                                title="Enviar mensagem no WhatsApp"
                              >
                                <WhatsAppIcon size={24} />
                              </Button>
                            ) : null;
                          })()}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Vencimento em {formatDay(payment.dueDate)}
                        </p>
                      </div>

                      <div className="flex flex-col items-start gap-3 md:items-end">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Valor</p>
                          <p className="text-xl font-semibold text-foreground">
                            {formatCurrency(payment.amount)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {payment.status !== "paid" ? (
                            <Button
                              size="sm"
                              className="rounded-full px-4"
                              onClick={() =>
                                handleMarkAsPaid(payment.id, payment.loanId)
                              }
                            >
                              Registrar pagamento
                            </Button>
                          ) : (
                            <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                              Pago
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </AnimatedList>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <Filter className="h-12 w-12 text-muted-foreground/40" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">
                  Nenhum pagamento encontrado
                </p>
                <p className="text-sm text-muted-foreground">
                  Ajuste filtros ou selecione outra data para visualizar os registros.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPayment ? (
        <PaymentActionDialog
          loan={selectedPayment.loan}
          isOpen={isPaymentDialogOpen}
          onClose={() => {
            setSelectedPayment(null);
            setIsPaymentDialogOpen(false);
          }}
          onPaymentConfirmed={handlePaymentConfirmed}
        />
      ) : null}

      {/* Modal WhatsApp */}
      {whatsappClient && (
        <WhatsAppModal
          isOpen={!!whatsappClient}
          onClose={() => setWhatsappClient(null)}
          client={whatsappClient}
        />
      )}
    </div>
  );
}
