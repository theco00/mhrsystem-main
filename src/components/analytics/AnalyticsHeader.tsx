import { Button } from '@/components/ui/button';
import { Download, Filter } from 'lucide-react';

interface AnalyticsHeaderProps {
  onExport: () => void;
  onFilter: () => void;
}

export function AnalyticsHeader({ onExport, onFilter }: AnalyticsHeaderProps) {
  return (
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
}