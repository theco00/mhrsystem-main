import { AnalyticsData } from './useAnalyticsData';

export const useExportData = (data: AnalyticsData | null) => {
  const exportData = () => {
    if (!data) return;

    const exportData = {
      loanMetrics: data.loanMetrics,
      clientMetrics: data.clientMetrics,
      paymentMetrics: data.paymentMetrics,
      monthlyData: data.monthlyData,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    if (!data) return;

    // Create CSV content
    const headers = ['Mês', 'Empréstimos', 'Valor Total', 'Novos Clientes', 'Pagamentos Recebidos'];
    const rows = data.monthlyData.map(item => [
      item.month,
      item.loans.toString(),
      item.amount.toString(),
      item.clients.toString(),
      item.payments.toString()
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    exportData,
    exportCSV
  };
};