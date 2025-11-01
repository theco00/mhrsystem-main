import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, Users, DollarSign } from 'lucide-react';

/**
 * ReportsView - Geração de relatórios
 * 
 * Funcionalidades:
 * - Relatórios de clientes
 * - Relatórios de empréstimos
 * - Relatórios financeiros
 * - Exportação de dados
 * - Interface responsiva e acessível
 * 
 * @component
 * @returns {JSX.Element} Componente de relatórios
 */
export default function ReportsView() {
  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1 md:mb-2">Relatórios</h1>
        <p className="text-muted-foreground text-sm md:text-base">Gere relatórios detalhados para análise</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Relatório de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Relatório completo com dados dos clientes cadastrados
            </p>
            <Button className="w-full min-h-[44px] touch-target">
              <Download className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-success" />
              Relatório Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Análise financeira detalhada dos empréstimos
            </p>
            <Button className="w-full min-h-[44px] touch-target">
              <Download className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-warning" />
              Relatório de Pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Cronograma e histórico de pagamentos
            </p>
            <Button className="w-full min-h-[44px] touch-target">
              <Download className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}