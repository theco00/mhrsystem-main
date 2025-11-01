import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart, PieChart } from 'lucide-react';

/**
 * AnalyticsView - Análises e insights
 * 
 * Funcionalidades:
 * - Análise de tendências
 * - Métricas de performance
 * - Gráficos e visualizações
 * - Dashboards analíticos
 * - Interface responsiva e acessível
 * 
 * @component
 * @returns {JSX.Element} Componente de análises
 */
export default function AnalyticsView() {
  const cards = [
    {
      id: 'trends',
      icon: TrendingUp,
      title: 'Análise de Tendências',
      description: 'Análise de tendências de empréstimos e pagamentos ao longo do tempo',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      id: 'performance',
      icon: BarChart,
      title: 'Performance Mensal',
      description: 'Comparativo de performance mensal de empréstimos e recebimentos',
      color: 'text-success',
      bg: 'bg-success/10'
    },
    {
      id: 'risks',
      icon: PieChart,
      title: 'Distribuição de Riscos',
      description: 'Análise da distribuição de empréstimos por faixa de risco',
      color: 'text-warning',
      bg: 'bg-warning/10'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="scroll-reveal revealed">
        <h1 className="text-3xl font-bold text-foreground mb-2">Análises</h1>
        <p className="text-muted-foreground">Insights e análises de desempenho</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card 
              key={card.id}
              className="glass-card-premium border border-white/10 hover-lift card-interactive stagger-item"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${card.bg}`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}