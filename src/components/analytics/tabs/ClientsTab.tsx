import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { AnalyticsData } from '@/hooks/useAnalyticsData';

interface ClientsTabProps {
  data: AnalyticsData;
}

export function ClientsTab({ data }: ClientsTabProps) {
  return (
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
                <Tooltip formatter={(value) => [value, 'Clientes']} />
                <Line type="monotone" dataKey="clients" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de Clientes</CardTitle>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}