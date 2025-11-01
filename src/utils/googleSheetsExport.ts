/**
 * Utilitário para exportação de dados para Google Sheets
 * Usa a abordagem de criar um CSV e abrir no Google Sheets via URL
 */

// Tipos base (ajustar conforme os tipos reais do projeto)
interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email?: string;
  address?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  notes?: string;
}

interface Loan {
  id: string;
  clientName?: string;
  amount: number;
  interestRate: number;
  installments: number;
  installmentAmount: number;
  totalAmount: number;
  totalInterest: number;
  startDate: string;
  dueDate: string;
  status: 'active' | 'paid' | 'overdue';
  paidInstallments?: number;
  totalPaid?: number;
  remainingAmount: number;
}

interface Payment {
  id: string;
  loanId: string;
  clientName?: string;
  installmentNumber: number;
  totalInstallments?: number;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status: 'paid' | 'pending' | 'overdue';
  daysLate?: number;
  lateFee?: number;
  totalWithFees?: number;
}

/**
 * Converte dados para CSV
 */
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';
  
  // Pega as colunas do primeiro objeto
  const headers = Object.keys(data[0]);
  
  // Cria o header CSV
  const csvHeaders = headers.join(',');
  
  // Cria as linhas CSV
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escapa valores que contêm vírgulas ou aspas
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Cria um Blob CSV e baixa o arquivo
 */
function downloadCSV(content: string, filename: string) {
  const BOM = '\uFEFF'; // Adiciona BOM para suportar caracteres UTF-8
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Limpa o URL
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Abre dados no Google Sheets (via importação manual)
 * Retorna instruções para o usuário
 */
export function getGoogleSheetsInstructions(): string {
  return `
    Para importar no Google Sheets:
    1. Faça o download do arquivo CSV
    2. Abra o Google Sheets (sheets.google.com)
    3. Clique em "Arquivo" → "Importar"
    4. Faça upload do arquivo CSV baixado
    5. Selecione as opções de importação desejadas
    6. Clique em "Importar dados"
  `;
}

/**
 * Exporta clientes para CSV (compatível com Google Sheets)
 */
export function exportClientsToGoogleSheets(clients: Client[]) {
  const data = clients.map(client => ({
    'Nome': client.name,
    'CPF': client.cpf,
    'Telefone': client.phone,
    'Email': client.email || 'Não informado',
    'Endereço': client.address || 'Não informado',
    'Status': client.status === 'active' ? 'Ativo' : 'Inativo',
    'Data de Cadastro': new Date(client.createdAt).toLocaleDateString('pt-BR'),
    'Observações': client.notes || 'Sem observações'
  }));
  
  const csv = convertToCSV(data);
  const filename = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
  
  return {
    success: true,
    filename,
    instructions: getGoogleSheetsInstructions()
  };
}

/**
 * Exporta empréstimos para CSV (compatível com Google Sheets)
 */
export function exportLoansToGoogleSheets(loans: Loan[]) {
  const data = loans.map(loan => ({
    'ID': loan.id.substring(0, 8),
    'Cliente': loan.clientName || 'Cliente não identificado',
    'Valor': `R$ ${loan.amount.toFixed(2).replace('.', ',')}`,
    'Taxa de Juros': `${(loan.interestRate * 100).toFixed(2)}%`,
    'Parcelas': loan.installments,
    'Valor da Parcela': `R$ ${loan.installmentAmount.toFixed(2).replace('.', ',')}`,
    'Total a Pagar': `R$ ${loan.totalAmount.toFixed(2).replace('.', ',')}`,
    'Total de Juros': `R$ ${loan.totalInterest.toFixed(2).replace('.', ',')}`,
    'Data de Início': new Date(loan.startDate).toLocaleDateString('pt-BR'),
    'Data de Vencimento': new Date(loan.dueDate).toLocaleDateString('pt-BR'),
    'Status': loan.status === 'active' ? 'Ativo' : loan.status === 'paid' ? 'Pago' : 'Em atraso',
    'Parcelas Pagas': loan.paidInstallments || 0,
    'Valor Pago': `R$ ${(loan.totalPaid || 0).toFixed(2).replace('.', ',')}`,
    'Valor Restante': `R$ ${loan.remainingAmount.toFixed(2).replace('.', ',')}`
  }));
  
  const csv = convertToCSV(data);
  const filename = `emprestimos_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
  
  return {
    success: true,
    filename,
    instructions: getGoogleSheetsInstructions()
  };
}

/**
 * Exporta pagamentos para CSV (compatível com Google Sheets)
 */
export function exportPaymentsToGoogleSheets(payments: Payment[]) {
  const data = payments.map(payment => ({
    'ID': payment.id.substring(0, 8),
    'Empréstimo': payment.loanId.substring(0, 8),
    'Cliente': payment.clientName || 'Cliente não identificado',
    'Parcela': `${payment.installmentNumber}/${payment.totalInstallments || '?'}`,
    'Valor': `R$ ${payment.amount.toFixed(2).replace('.', ',')}`,
    'Data de Vencimento': new Date(payment.dueDate).toLocaleDateString('pt-BR'),
    'Data de Pagamento': payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('pt-BR') : 'Não pago',
    'Status': payment.status === 'paid' ? 'Pago' : payment.status === 'pending' ? 'Pendente' : 'Em atraso',
    'Dias de Atraso': payment.daysLate || 0,
    'Multa': payment.lateFee ? `R$ ${payment.lateFee.toFixed(2).replace('.', ',')}` : 'R$ 0,00',
    'Total com Multa': payment.totalWithFees ? `R$ ${payment.totalWithFees.toFixed(2).replace('.', ',')}` : `R$ ${payment.amount.toFixed(2).replace('.', ',')}`
  }));
  
  const csv = convertToCSV(data);
  const filename = `pagamentos_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
  
  return {
    success: true,
    filename,
    instructions: getGoogleSheetsInstructions()
  };
}

/**
 * Exporta relatório completo para CSV
 */
export function exportCompleteReportToGoogleSheets(
  clients: Client[],
  loans: Loan[],
  payments: Payment[]
) {
  // Cria um relatório resumido
  const summary = {
    'Total de Clientes': clients.length,
    'Clientes Ativos': clients.filter(c => c.status === 'active').length,
    'Total de Empréstimos': loans.length,
    'Empréstimos Ativos': loans.filter(l => l.status === 'active').length,
    'Valor Total Emprestado': loans.reduce((sum, l) => sum + l.amount, 0),
    'Total de Pagamentos': payments.length,
    'Pagamentos Realizados': payments.filter(p => p.status === 'paid').length,
    'Valor Total Recebido': payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  };
  
  // Formata os dados do resumo
  const summaryData = Object.entries(summary).map(([key, value]) => ({
    'Métrica': key,
    'Valor': typeof value === 'number' && key.includes('Valor') 
      ? `R$ ${value.toFixed(2).replace('.', ',')}`
      : value.toString()
  }));
  
  const csv = convertToCSV(summaryData);
  const filename = `relatorio_completo_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
  
  return {
    success: true,
    filename,
    instructions: getGoogleSheetsInstructions()
  };
}
