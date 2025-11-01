import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  Filter,
  BarChart4,
  PieChart,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard,
  UserCheck,
  Shield,
  Wallet,
  Percent
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';

// Utility functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

// Types
interface Loan {
  id: string;
  amount: number;
  status: 'active' | 'paid' | 'defaulted' | 'pending';
  created_at: string;
  interest_rate: number;
  installments: number;
}

interface Client {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  credit_score: number;
  created_at: string;
  income: number;
}

interface Payment {
  id: string;
  amount: number;
  status: 'paid' | 'pending';
  payment_date: string;
  created_at: string;
  installment_number: number;
}

// Enhanced Analytics Data Hook
const useAnalyticsData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useState(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Enhanced mock data
      const clients: Client[] = [
        { id: '1', name: 'João Silva', status: 'active', credit_score: 750, created_at: '2024-01-15', income: 5000 },
        { id: '2', name: 'Maria Santos', status: 'active', credit_score: 680, created_at: '2024-02-20', income: 4500 },
        { id: '3', name: 'Pedro Costa', status: 'inactive', credit_score: 720, created_at: '2024-03-10', income: 6000 },
        { id: '4', name: 'Ana Oliveira', status: 'active', credit_score: 810, created_at: '2024-01-20', income: 7000 },
        { id: '5', name: 'Carlos Silva', status: 'active', credit_score: 690, created_at: '2024-02-15', income: 5500 },
        { id: '6', name: 'Fernanda Lima', status: 'active', credit_score: 760, created_at: '2024-03-01', income: 4800 },
      ];
      
      const loans: Loan[] = [
        { id: '1', amount: 5000, status: 'active', created_at: '2024-01-20', interest_rate: 12.5, installments: 12 },
        { id: '2', amount: 3000, status: 'paid', created_at: '2024-02-15', interest_rate: 10.0, installments: 6 },
        { id: '3', amount: 8000, status: 'active', created_at: '2024-03-05', interest_rate: 15.0, installments: 24 },
        { id: '4', amount: 12000, status: 'active', created_at: '2024-01-25', interest_rate: 18.0, installments: 36 },
        { id: '5', amount: 6000, status: 'paid', created_at: '2024-02-20', interest_rate: 11.5, installments: 12 },
        { id: '6', amount: 4000, status: 'defaulted', created_at: '2024-01-10', interest_rate: 14.0, installments: 18 },
      ];
      
      const payments: Payment[] = [
        { id: '1', amount: 500, status: 'paid', payment_date: '2024-01-25', created_at: '2024-01-25', installment_number: 1 },
        { id: '2', amount: 300, status: 'pending', payment_date: '2024-02-20', created_at: '2024-02-20', installment_number: 2 },
        { id: '3', amount: 800, status: 'paid', payment_date: '2024-03-10', created_at: '2024-03-10', installment_number: 1 },
        { id: '4', amount: 1200, status: 'paid', payment_date: '2024-02-15', created_at: '2024-02-15', installment_number: 1 },
        { id: '5', amount: 600, status: 'pending', payment_date: '2024-03-20', created_at: '2024-03-20', installment_number: 3 },
        { id: '6', amount: 450, status: 'paid', payment_date: '2024-01-15', created_at: '2024-01-15', installment_number: 1 },
      ];

      // Enhanced metrics calculations
      const loanMetrics = {
        totalLoans: loans.length,
        activeLoans: loans.filter(loan => loan.status === 'active').length,
        totalAmount: loans.reduce((sum, loan) => sum + loan.amount, 0),
        averageLoan: loans.length > 0 ? loans.reduce((sum, loan) => sum + loan.amount, 0) / loans.length : 0,
        approvalRate: 85.2,
        defaultRate: loans.filter(loan => loan.status === 'defaulted').length / Math.max(loans.length, 1) * 100,
        averageInterestRate: loans.length > 0 ? loans.reduce((sum, loan) => sum + loan.interest_rate, 0) / loans.length : 0,
        totalInstallments: loans.reduce((sum, loan) => sum + loan.installments, 0)
      };

      const clientMetrics = {
        totalClients: clients.length,
        activeClients: clients.filter(client => client.status === 'active').length,
        newClientsThisMonth: clients.filter(client => {
          const createdAt = new Date(client.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return createdAt >= thirtyDaysAgo;
        }).length,
        averageCreditScore: clients.length > 0 ? clients.reduce((sum, client) => sum + client.credit_score, 0) / clients.length : 0,
        averageIncome: clients.length > 0 ? clients.reduce((sum, client) => sum + client.income, 0) / clients.length : 0
      };

      const paymentMetrics = {
        totalReceived: payments.filter(payment => payment.status === 'paid').reduce((sum, payment) => sum + payment.amount, 0),
        pendingPayments: payments.filter(payment => payment.status === 'pending').length,
        overduePayments: payments.filter(payment => {
          const dueDate = new Date(payment.payment_date);
          return payment.status === 'pending' && dueDate < new Date();
        }).length,
        onTimeRate: payments.length > 0 ? (payments.filter(payment => payment.status === 'paid').length / payments.length) * 100 : 0,
        totalPending: payments.filter(payment => payment.status === 'pending').reduce((sum, payment) => sum + payment.amount, 0)
      };

      // Enhanced monthly data
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const currentMonth = new Date().getMonth();
      
      const monthlyData = months.slice(0, currentMonth + 1).map((month, index) => {
        const monthLoans = loans.filter(loan => new Date(loan.created_at).getMonth() === index);
        const monthPayments = payments.filter(payment => new Date(payment.created_at).getMonth() === index);
        
        return {
          month,
          loans: monthLoans.length,
          amount: monthLoans.reduce((sum, loan) => sum + loan.amount, 0),
          clients: clients.filter(client => new Date(client.created_at).getMonth() === index).length,
          payments: monthPayments.filter(p => p.status === 'paid').reduce((sum, payment) => sum + payment.amount, 0),
          pendingPayments: monthPayments.filter(p => p.status === 'pending').reduce((sum, payment) => sum + payment.amount, 0),
          averageLoanValue: monthLoans.length > 0 ? monthLoans.reduce((sum, loan) => sum + loan.amount, 0) / monthLoans.length : 0,
          newClients: clients.filter(client => new Date(client.created_at).getMonth() === index).length
        };
      });

      // Credit score distribution
      const creditScoreDistribution = [
        { range: '300-500', count: clients.filter(c => c.credit_score >= 300 && c.credit_score < 500).length, color: '#ef4444' },
        { range: '500-600', count: clients.filter(c => c.credit_score >= 500 && c.credit_score < 600).length, color: '#f59e0b' },
        { range: '600-700', count: clients.filter(c => c.credit_score >= 600 && c.credit_score < 700).length, color: '#3b82f6' },
        { range: '700-800', count: clients.filter(c => c.credit_score >= 700 && c.credit_score < 800).length, color: '#10b981' },
        { range: '800-900', count: clients.filter(c => c.credit_score >= 800 && c.credit_score <= 900).length, color: '#8b5cf6' },
      ].filter(item => item.count > 0);

      // Loan amount distribution
      const loanAmountDistribution = [
        { range: '0-2k', count: loans.filter(l => l.amount < 2000).length, color: '#3b82f6' },
        { range: '2k-5k', count: loans.filter(l => l.amount >= 2000 && l.amount < 5000).length, color: '#10b981' },
        { range: '5k-10k', count: loans.filter(l => l.amount >= 5000 && l.amount < 10000).length, color: '#f59e0b' },
        { range: '10k+', count: loans.filter(l => l.amount >= 10000).length, color: '#ef4444' },
      ].filter(item => item.count > 0);

      // Performance radar data
      const performanceData = [
        { metric: 'Aprovação', value: loanMetrics.approvalRate, fullMark: 100 },
        { metric: 'Pagamentos', value: paymentMetrics.onTimeRate, fullMark: 100 },
        { metric: 'Score Médio', value: (clientMetrics.averageCreditScore / 900) * 100, fullMark: 100 },
        { metric: 'Clientes Ativos', value: (clientMetrics.activeClients / clientMetrics.totalClients) * 100, fullMark: 100 },
        { metric: 'Empréstimos Ativos', value: (loanMetrics.activeLoans / loanMetrics.totalLoans) * 100, fullMark: 100 },
      ];

      // Status distributions
      const loanStatusData = [
        { name: 'Ativos', value: loanMetrics.activeLoans, color: '#10b981' },
        { name: 'Pagos', value: loans.filter(loan => loan.status === 'paid').length, color: '#3b82f6' },
        { name: 'Inadimplentes', value: loans.filter(loan => loan.status === 'defaulted').length, color: '#ef4444' },
        { name: 'Pendentes', value: loans.filter(loan => loan.status === 'pending').length, color: '#f59e0b' },
      ].filter(item => item.value > 0);

      const paymentStatusData = [
        { name: 'Pagos', value: payments.filter(p => p.status === 'paid').length, color: '#10b981' },
        { name: 'Pendentes', value: payments.filter(p => p.status === 'pending').length, color: '#f59e0b' },
        { name: 'Atrasados', value: paymentMetrics.overduePayments, color: '#ef4444' },
      ].filter(item => item.value > 0);

      setData({
        clients,
        loans,
        payments,
        loanMetrics,
        clientMetrics,
        paymentMetrics,
        monthlyData,
        creditScoreDistribution,
        loanAmountDistribution,
        performanceData,
        loanStatusData,
        paymentStatusData
      });
      setIsLoading(false);
    };

    loadData();
  });

  return { data, isLoading };
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' && entry.name.includes('Valor') ? formatCurrency(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Enhanced Components
const AnalyticsHeader = ({ onExport, onFilter }: { onExport: () => void; onFilter: () => void }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h1 className="text-3xl font-bold">Análises</h1>
      <p className="text-muted-foreground">Visualize o desempenho do seu negócio</p>
    </div>
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={onExport}>
        <Download className="w-4 h-4 mr-2" />
        Exportar
      </Button>
      <Button variant="outline" size="sm" onClick={onFilter}>
        <Filter className="w-4 h-4 mr-2" />
        Filtrar
      </Button>
    </div>
  </div>
);

const TimeRangeSelector = ({ timeRange, onTimeRangeChange }: { 
  timeRange: string; 
  onTimeRangeChange: (range: string) => void 
}) => {
  const ranges = ['7d', '30d', '90d', '1y'];
  
  const getTimeRangeLabel = (range: string): string => {
    switch (range) {
      case '7d': return '7 dias';
      case '30d': return '30 dias';
      case '90d': return '90 dias';
      case '1y': return '1 ano';
      default: return range;
    }
  };

  return (
    <div className="flex gap-2">
      {ranges.map((range) => (
        <Button
          key={range}
          variant={timeRange === range ? "default" : "outline"}
          size="sm"
          onClick={() => onTimeRangeChange(range)}
        >
          {getTimeRangeLabel(range)}
        </Button>
      ))}
    </div>
  );
};

const MetricCard = ({ title, value, change, icon: Icon, color = "primary", subtitle }: any) => (
  <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
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

const KeyMetricsCards = ({ data }: { data: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <MetricCard
      title="Total de Empréstimos"
      value={data.loanMetrics.totalLoans}
      change={12.5}
      icon={DollarSign}
      color="primary"
      subtitle={`${data.loanMetrics.activeLoans} ativos`}
    />
    <MetricCard
      title="Clientes Ativos"
      value={data.clientMetrics.activeClients}
      change={8.2}
      icon={Users}
      color="secondary"
      subtitle={`de ${data.clientMetrics.totalClients} totais`}
    />
    <MetricCard
      title="Taxa de Aprovação"
      value={formatPercentage(data.loanMetrics.approvalRate)}
      change={2.1}
      icon={Target}
      color="success"
    />
    <MetricCard
      title="Pagamentos em Dia"
      value={formatPercentage(data.paymentMetrics.onTimeRate)}
      change={-1.3}
      icon={Activity}
      color="warning"
    />
  </div>
);

const GeneralOverviewTab = ({ data }: { data: any }) => (
  <div className="space-y-6">
    {/* Performance Overview */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Visão Geral de Desempenho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="loans" fill="#3b82f6" name="Empréstimos" />
              <Line yAxisId="right" type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} name="Valor Total" />
              <Line yAxisId="right" type="monotone" dataKey="payments" stroke="#f59e0b" strokeWidth={2} name="Pagamentos" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart4 className="w-5 h-5" />
            Performance Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={data.performanceData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Performance" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    {/* Distribution Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Distribuição de Score de Crédito
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={data.creditScoreDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ range, count, percent }) => `${range}: ${count} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.creditScoreDistribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Distribuição de Valores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={data.loanAmountDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ range, count, percent }) => `${range}: ${count} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.loanAmountDistribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    {/* Additional Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-blue-600" />
            Taxa de Juros Média
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatPercentage(data.loanMetrics.averageInterestRate)}</p>
          <p className="text-sm text-muted-foreground">Ao mês</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-green-600" />
            Renda Média dos Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(data.clientMetrics.averageIncome)}</p>
          <p className="text-sm text-muted-foreground">Mensal</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Total Parcelas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data.loanMetrics.totalInstallments}</p>
          <p className="text-sm text-muted-foreground">Em todos os empréstimos</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

const LoansTab = ({ data }: { data: any }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart4 className="w-5 h-5" />
            Empréstimos por Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="loans" fill="#3b82f6" name="Empréstimos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Status dos Empréstimos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={data.loanStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.loanStatusData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Volume de Empréstimos vs Valor Médio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="loans" fill="#3b82f6" name="Quantidade" />
            <Line yAxisId="right" type="monotone" dataKey="averageLoanValue" stroke="#10b981" strokeWidth={2} name="Valor Médio" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </div>
);

const ClientsTab = ({ data }: { data: any }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Novos Clientes por Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="newClients" stroke="#10b981" strokeWidth={2} name="Novos Clientes" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Métricas de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Total de Clientes</span>
            <Badge variant="secondary">{data.clientMetrics.totalClients}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Clientes Ativos</span>
            <Badge variant="default">{data.clientMetrics.activeClients}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Novos este Mês</span>
            <Badge variant="outline">{data.clientMetrics.newClientsThisMonth}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Score Médio</span>
            <Badge variant="secondary">{data.clientMetrics.averageCreditScore.toFixed(0)}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Renda Média</span>
            <Badge variant="secondary">{formatCurrency(data.clientMetrics.averageIncome)}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Distribuição de Score de Crédito
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.creditScoreDistribution} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="range" type="category" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#3b82f6" name="Quantidade de Clientes">
              {data.creditScoreDistribution.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </div>
);

const PaymentsTab = ({ data }: { data: any }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Recebimentos vs Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="payments" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Recebidos" />
              <Area type="monotone" dataKey="pendingPayments" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Pendentes" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Status dos Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={data.paymentStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.paymentStatusData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Total Recebido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(data.paymentMetrics.totalReceived)}</p>
          <p className="text-sm text-muted-foreground">{data.payments.filter((p: any) => p.status === 'paid').length} pagamentos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Total Pendente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(data.paymentMetrics.totalPending)}</p>
          <p className="text-sm text-muted-foreground">{data.paymentMetrics.pendingPayments} pagamentos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Pagamentos Atrasados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data.paymentMetrics.overduePayments}</p>
          <p className="text-sm text-muted-foreground">Requer atenção</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Main Analytics component
type MetricType = 'general' | 'loans' | 'clients' | 'payments';

export default function Analytics() {
  const { data, isLoading } = useAnalyticsData();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('general');

  const exportData = () => {
    if (!data) return;
    console.log('Exporting data...');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnalyticsHeader 
        onExport={exportData}
        onFilter={() => console.log('Filter clicked')}
      />
      
      <TimeRangeSelector 
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />

      <KeyMetricsCards data={data} />

      <Tabs value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as MetricType)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="loans">Empréstimos</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralOverviewTab data={data} />
        </TabsContent>

        <TabsContent value="loans">
          <LoansTab data={data} />
        </TabsContent>

        <TabsContent value="clients">
          <ClientsTab data={data} />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentsTab data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
