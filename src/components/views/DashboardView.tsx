import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BadgePercent,
  Banknote,
  Calendar,
  CreditCard,
  DollarSign,
  Eye,
  Plus,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Wallet,
} from "lucide-react";
import { differenceInCalendarDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useSupabaseData, Client } from "@/hooks/useSupabaseData";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { ClientListWhatsAppModal } from "@/components/clients/ClientListWhatsAppModal";
import { PaymentActionDialog } from "@/components/payments/PaymentActionDialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type UpcomingEntry = {
  id: string;
  loanId: string;
  clientName: string;
  dueDate: Date;
  dueKey: string;
  amount: number;
  status: "active" | "paid" | "overdue";
  phone?: string | null;
  email?: string | null;
};

const normalizeDate = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);

const formatDate = (date: Date) =>
  format(date, "dd/MM/yyyy", {
    locale: ptBR,
  });

export default function DashboardView() {
  const navigate = useNavigate();
  const { metrics, loans, payments, clients, isLoading, refetch } = useSupabaseData();
  const { toast } = useToast();
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<{ loanId: string } | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const handleOpenPaymentDialog = (loanId: string) => {
    setSelectedPayment({ loanId });
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentConfirmed = () => {
    refetch();
    toast({
      title: "Pagamento registrado!",
      description: "O pagamento foi registrado com sucesso.",
    });
  };

  const monthlyReceivableData = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const data = Array.from({ length: daysInMonth }, (_, index) => ({
      day: index + 1,
      amount: 0,
    }));

    loans.forEach((loan) => {
      if (loan.status !== "active") return;
      const paymentDate = new Date(loan.next_payment_date);
      if (
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear
      ) {
        const day = paymentDate.getDate();
        if (day >= 1 && day <= daysInMonth) {
          data[day - 1].amount += loan.installment_value;
        }
      }
    });

    return data;
  }, [loans]);

  const upcomingEntries = useMemo<UpcomingEntry[]>(() => {
    if (!loans.length) return [];
    const today = normalizeDate(new Date());
    const rangeEnd = new Date(today);
    rangeEnd.setDate(rangeEnd.getDate() + 60);
    const overdueLimit = new Date(today);
    overdueLimit.setDate(overdueLimit.getDate() - 7);

    return loans
      .filter(
        (loan) =>
          (loan.status === "active" || loan.status === "overdue") &&
          loan.next_payment_date,
      )
      .map((loan) => {
        const dueDateRaw = new Date(`${loan.next_payment_date}T00:00:00`);
        if (Number.isNaN(dueDateRaw.getTime())) {
          return undefined;
        }
        const dueDate = normalizeDate(dueDateRaw);
        return {
          id: `${loan.id}-${loan.next_payment_date}`,
          loanId: loan.id,
          clientName: loan.clients?.name ?? "Cliente",
          dueDate,
          dueKey: dateKey(dueDate),
          amount: loan.installment_value,
          status: loan.status,
          phone: loan.clients?.phone,
          email: loan.clients?.email,
        } satisfies UpcomingEntry;
      })
      .filter((entry) => {
        if (!entry) return false;
        if (entry.dueDate < overdueLimit) return false;
        return entry.dueDate <= rangeEnd;
      })
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [loans]);

  const today = normalizeDate(new Date());

  const upcomingTotals = useMemo(() => {
    const nextSeven = upcomingEntries.filter((entry) => {
      const diff = differenceInCalendarDays(entry.dueDate, today);
      return diff >= 0 && diff <= 7;
    });

    const urgent = upcomingEntries.filter((entry) => {
      const diff = differenceInCalendarDays(entry.dueDate, today);
      return diff >= 0 && diff <= 3;
    });

    const nextSevenTotal = nextSeven.reduce(
      (acc, entry) => acc + entry.amount,
      0,
    );
    const overallTotal = upcomingEntries.reduce(
      (acc, entry) => acc + entry.amount,
      0,
    );

    return {
      nextSevenCount: nextSeven.length,
      nextSevenTotal,
      urgentCount: urgent.length,
      upcomingTotal: overallTotal,
    };
  }, [upcomingEntries, today]);

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    [],
  );

  // MELHORIA 2: Resumo de Recebimentos (7/30/60 dias)
  const receivablesSummary = useMemo(() => {
    const now = new Date();
    const next7Days = new Date(now);
    next7Days.setDate(next7Days.getDate() + 7);
    const next30Days = new Date(now);
    next30Days.setDate(next30Days.getDate() + 30);
    const next60Days = new Date(now);
    next60Days.setDate(next60Days.getDate() + 60);

    const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'overdue');
    
    let amount7Days = 0, count7Days = 0;
    let amount30Days = 0, count30Days = 0;
    let amount60Days = 0, count60Days = 0;

    activeLoans.forEach(loan => {
      const nextPayment = new Date(loan.next_payment_date + 'T00:00:00');
      
      if (nextPayment <= next7Days) {
        amount7Days += loan.installment_value;
        count7Days++;
      }
      if (nextPayment <= next30Days) {
        amount30Days += loan.installment_value;
        count30Days++;
      }
      if (nextPayment <= next60Days) {
        amount60Days += loan.installment_value;
        count60Days++;
      }
    });

    return {
      next7: { amount: amount7Days, count: count7Days },
      next30: { amount: amount30Days, count: count30Days },
      next60: { amount: amount60Days, count: count60Days },
    };
  }, [loans]);

  // MELHORIA 1: Taxa de Inadimplência
  const defaultRate = useMemo(() => {
    const totalActive = loans.filter(l => l.status === 'active' || l.status === 'overdue').length;
    const totalOverdue = loans.filter(l => l.status === 'overdue').length;
    
    if (totalActive === 0) return 0;
    return (totalOverdue / totalActive) * 100;
  }, [loans]);

  // MELHORIA 4: Alertas de Ação Urgente
  const urgentAlerts = useMemo(() => {
    const now = normalizeDate(new Date());
    
    const dueTodayCount = upcomingEntries.filter(e => 
      differenceInCalendarDays(e.dueDate, now) === 0
    ).length;
    
    const overdueCount = loans.filter(l => l.status === 'overdue').length;
    
    const overdueMoreThan7Days = loans.filter(l => {
      if (l.status !== 'overdue') return false;
      const nextPayment = new Date(l.next_payment_date + 'T00:00:00');
      return differenceInCalendarDays(now, nextPayment) > 7;
    }).length;

    return {
      dueToday: dueTodayCount,
      overdue: overdueCount,
      overdueMoreThan7: overdueMoreThan7Days,
      total: dueTodayCount + overdueCount + overdueMoreThan7Days,
    };
  }, [loans, upcomingEntries]);

  const financialSnapshot = [
    {
      id: "current-balance",
      title: "Saldo Disponível",
      value: formatCurrency(metrics.currentBalance ?? 0),
      icon: Banknote,
      tone: "text-primary",
      background: "bg-primary/10",
    },
    {
      id: "total-loaned",
      title: "Total Emprestado",
      value: formatCurrency(metrics.totalLoaned ?? 0),
      icon: CreditCard,
      tone: "text-warning",
      background: "bg-warning/10",
    },
    {
      id: "interest-earned",
      title: "Juros Recebidos",
      value: formatCurrency(metrics.totalInterest ?? 0),
      icon: BadgePercent,
      tone: "text-success",
      background: "bg-success/10",
    },
    {
      id: "default-rate",
      title: "Taxa de Inadimplência",
      value: `${defaultRate.toFixed(1)}%`,
      icon: AlertTriangle,
      tone: defaultRate > 10 ? "text-destructive" : defaultRate > 5 ? "text-warning" : "text-success",
      background: defaultRate > 10 ? "bg-destructive/10" : defaultRate > 5 ? "bg-warning/10" : "bg-success/10",
    },
  ];

  const getDeadlinePill = (dueDate: Date) => {
    const diff = differenceInCalendarDays(dueDate, today);

    if (diff < 0) {
      return {
        label: `Vencido há ${Math.abs(diff)} dias`,
        className:
          "bg-destructive/15 text-destructive border border-destructive/30",
      };
    }

    if (diff === 0) {
      return {
        label: "Hoje",
        className: "bg-destructive text-destructive-foreground border border-destructive/80",
      };
    }

    if (diff === 1) {
      return {
        label: "Amanhã",
        className: "bg-warning/20 text-warning border border-warning/40",
      };
    }

    if (diff <= 7) {
      return {
        label: `${diff} dias`,
        className: "bg-warning/15 text-warning border border-warning/30",
      };
    }

    return {
      label: `${diff} dias`,
      className: "bg-muted/60 text-muted-foreground border border-transparent",
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="grid-mobile-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="glass-card border shadow-soft">
              <CardContent className="p-4 sm:p-6">
                <Skeleton className="h-20 w-full rounded-xl sm:h-24 sm:rounded-2xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* MELHORIA 10: Botões de Ação Rápida */}
      <section className="flex flex-wrap gap-2 sm:gap-3">
        <Button
          onClick={() => navigate("/loans")}
          className="flex-1 sm:flex-none rounded-full"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Empréstimo
        </Button>
        <Button
          onClick={() => navigate("/payments")}
          variant="outline"
          className="flex-1 sm:flex-none rounded-full"
          size="sm"
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Registrar Pagamento
        </Button>
        <Button
          onClick={() => navigate("/clients")}
          variant="outline"
          className="flex-1 sm:flex-none rounded-full"
          size="sm"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
        <Button
          onClick={() => setIsWhatsAppModalOpen(true)}
          variant="outline"
          className="flex-1 sm:flex-none rounded-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          size="sm"
        >
          <WhatsAppIcon size={16} className="mr-2" />
          Enviar WhatsApp Cliente
        </Button>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {financialSnapshot.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.id}
              tabIndex={-1}
              className={cn(
                "group glass-card-premium border border-white/10 shadow-soft backdrop-blur hover-lift card-interactive",
                "overflow-hidden stagger-item",
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="flex h-full flex-col justify-between gap-4 p-4 sm:p-6">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 sm:text-sm">
                    {card.title}
                  </p>
                  <h3 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl lg:text-4xl">
                    {card.value}
                  </h3>
                </div>
                <div
                  className={cn(
                    "inline-flex h-12 w-12 items-center justify-center rounded-xl transition duration-300 group-hover:scale-110 sm:h-14 sm:w-14 sm:rounded-2xl",
                    card.background,
                    card.tone,
                  )}
                >
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* MELHORIA 2: Resumo de Recebimentos */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="glass-card border shadow-soft">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Próximos 7 dias
                </p>
                <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                  {formatCurrency(receivablesSummary.next7.amount)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {receivablesSummary.next7.count} {receivablesSummary.next7.count === 1 ? 'parcela' : 'parcelas'}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border shadow-soft">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Próximos 30 dias
                </p>
                <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                  {formatCurrency(receivablesSummary.next30.amount)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {receivablesSummary.next30.count} {receivablesSummary.next30.count === 1 ? 'parcela' : 'parcelas'}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <Wallet className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border shadow-soft">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Próximos 60 dias
                </p>
                <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                  {formatCurrency(receivablesSummary.next60.amount)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {receivablesSummary.next60.count} {receivablesSummary.next60.count === 1 ? 'parcela' : 'parcelas'}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* MELHORIA 4: Alertas de Ação Urgente */}
      {urgentAlerts.total > 0 && (
        <Card className="glass-card border-2 border-warning/40 bg-warning/5 shadow-soft">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle className="text-base font-semibold text-foreground sm:text-lg">
                ⚠️ Atenção Necessária
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {urgentAlerts.dueToday > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-3">
                  <span className="text-sm font-medium text-foreground">
                    Parcelas vencem hoje
                  </span>
                  <Badge variant="destructive" className="rounded-full">
                    {urgentAlerts.dueToday}
                  </Badge>
                </div>
              )}
              {urgentAlerts.overdue > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-3">
                  <span className="text-sm font-medium text-foreground">
                    Parcelas atrasadas
                  </span>
                  <Badge variant="destructive" className="rounded-full">
                    {urgentAlerts.overdue}
                  </Badge>
                </div>
              )}
              {urgentAlerts.overdueMoreThan7 > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-3">
                  <span className="text-sm font-medium text-foreground">
                    Atrasadas há mais de 7 dias
                  </span>
                  <Badge variant="destructive" className="rounded-full">
                    {urgentAlerts.overdueMoreThan7}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card border shadow-soft">
        <CardHeader className="flex flex-col gap-2 border-b border-border/60 pb-3 sm:flex-row sm:items-center sm:justify-between sm:pb-4">
          <CardTitle className="text-base font-semibold text-foreground sm:text-lg">
            Próximos Vencimentos
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-full px-4 text-xs sm:w-auto sm:text-sm"
            onClick={() => navigate("/upcoming-payments")}
          >
            <Eye className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Ver todos
          </Button>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6">
          {upcomingEntries.length ? (
            <div className="space-y-3">
              {/* Lista Simplificada */}
              <div className="space-y-2">
                {upcomingEntries.slice(0, 5).map((entry) => {
                  const deadline = getDeadlinePill(entry.dueDate);
                  const isUrgent = differenceInCalendarDays(entry.dueDate, today) <= 3 && 
                                   differenceInCalendarDays(entry.dueDate, today) >= 0;
                  
                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        "rounded-xl border p-3 transition-all hover:shadow-md sm:p-4",
                        isUrgent ? "border-warning/40 bg-warning/5" : "border-border/60 bg-card"
                      )}
                    >
                      {/* Header com nome e badge */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-foreground truncate sm:text-base flex-1">
                          {entry.clientName}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 sm:text-xs",
                            deadline.className,
                          )}
                        >
                          {deadline.label}
                        </Badge>
                      </div>

                      {/* Valor e botão */}
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-lg font-bold text-primary sm:text-xl">
                          {formatCurrency(entry.amount)}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleOpenPaymentDialog(entry.loanId)}
                          className="bg-success hover:bg-success/90 text-white font-medium px-2 h-7 text-xs whitespace-nowrap"
                        >
                          <DollarSign className="w-3 h-3 mr-1" />
                          Registrar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum vencimento previsto no período analisado.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card border shadow-soft">
        <CardHeader className="flex items-center gap-2 border-b border-border/60 pb-3 sm:pb-4">
          <TrendingUp className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
          <CardTitle className="text-base font-semibold sm:text-lg">
            Recebimentos do Mês
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6">
          <div className="h-56 sm:h-64 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyReceivableData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  style={{ fontSize: '10px' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  style={{ fontSize: '10px' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  width={35}
                />
                <Tooltip
                  cursor={{ stroke: "hsl(var(--primary) / 0.25)" }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow: "var(--shadow-soft)",
                  }}
                  labelFormatter={(label) => `Dia ${label}`}
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Valor previsto",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "hsl(var(--primary))",
                    stroke: "hsl(var(--primary-foreground))",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Modal de WhatsApp */}
      <ClientListWhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        clients={clients}
      />

      {/* Dialog de Pagamento */}
      {selectedPayment && (
        <PaymentActionDialog
          loan={loans.find(l => l.id === selectedPayment.loanId) || null}
          isOpen={isPaymentDialogOpen}
          onClose={() => {
            setSelectedPayment(null);
            setIsPaymentDialogOpen(false);
          }}
          onPaymentConfirmed={handlePaymentConfirmed}
        />
      )}
    </div>
  );
}

