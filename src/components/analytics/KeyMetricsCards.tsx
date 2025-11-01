import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Users, 
  Target, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AnalyticsData } from '@/hooks/useAnalyticsData';

interface KeyMetricsCardsProps {
  data: AnalyticsData;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<any>;
  color: string;
}

const MetricCard = ({ title, value, change, icon: Icon, color }: MetricCardProps) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center text-sm ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}/10`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export function KeyMetricsCards({ data }: KeyMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total de Empréstimos"
        value={data.loanMetrics.totalLoans}
        change={12.5}
        icon={DollarSign}
        color="primary"
      />
      <MetricCard
        title="Clientes Ativos"
        value={data.clientMetrics.activeClients}
        change={8.2}
        icon={Users}
        color="secondary"
      />
      <MetricCard
        title="Taxa de Aprovação"
        value={`${data.loanMetrics.approvalRate}%`}
        change={2.1}
        icon={Target}
        color="success"
      />
      <MetricCard
        title="Pagamentos em Dia"
        value={`${data.paymentMetrics.onTimeRate.toFixed(1)}%`}
        change={-1.3}
        icon={Activity}
        color="warning"
      />
    </div>
  );
}