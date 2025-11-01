import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';

export default function DashboardMetrics() {
  const { metrics, isLoading } = useSupabaseData();

  if (isLoading) return <div>Carregando...</div>;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const cards = [
    {
      title: 'Saldo Inicial',
      value: formatCurrency(metrics.initialBalance),
      icon: DollarSign,
      description: 'Capital inicial disponível',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Saldo Atual',
      value: formatCurrency(metrics.currentBalance),
      icon: CreditCard,
      description: 'Capital disponível para empréstimo',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Emprestado',
      value: formatCurrency(metrics.totalLoaned),
      icon: TrendingUp,
      description: 'Valor total liberado',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Total de Juros',
      value: formatCurrency(metrics.totalInterest),
      icon: Calendar,
      description: 'Juros recebidos',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="shadow-sm border-border/50 hover-lift card-interactive animate-fade-in stagger-item">
              <CardContent className="p-3 md:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-muted-foreground text-xs font-medium truncate">
                      {card.title}
                    </p>
                    <p className="text-base md:text-lg lg:text-2xl font-bold text-foreground truncate">
                      {card.value}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${card.bgColor} animate-scale-in flex-shrink-0`}>
                    <Icon className={`w-4 h-4 md:w-5 md:h-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}