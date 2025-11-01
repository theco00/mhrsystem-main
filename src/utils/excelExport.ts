import * as XLSX from 'xlsx';

interface Client {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  created_at: string;
  income: number;
  credit_score: number;
}

interface Loan {
  id: string;
  client_id: string;
  amount: number;
  interest_rate: number;
  installments: number;
  status: 'active' | 'paid' | 'overdue' | 'cancelled';
  start_date: string;
  next_payment_date: string;
  installment_value: number;
  clients?: Client;
}

interface Payment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  status: 'paid' | 'pending' | 'overdue';
  installment_number: number;
  loans?: Loan;
}

/**
 * Formata data para o padrão brasileiro
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

/**
 * Formata valor monetário
 */
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Exporta relatório de clientes para Excel
 */
export const exportClientsToExcel = (clients: Client[]) => {
  // Prepara os dados
  const data = clients.map(client => ({
    'Nome': client.name,
    'CPF': client.cpf,
    'Email': client.email,
    'Telefone': client.phone,
    'Endereço': client.address,
    'Status': client.status === 'active' ? 'Ativo' : 'Inativo',
    'Renda': formatCurrency(client.income || 0),
    'Score de Crédito': client.credit_score || 0,
    'Data de Cadastro': formatDate(client.created_at),
  }));

  // Cria a planilha
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');

  // Define largura das colunas
  const columnWidths = [
    { wch: 30 }, // Nome
    { wch: 15 }, // CPF
    { wch: 30 }, // Email
    { wch: 15 }, // Telefone
    { wch: 40 }, // Endereço
    { wch: 10 }, // Status
    { wch: 15 }, // Renda
    { wch: 15 }, // Score
    { wch: 15 }, // Data
  ];
  worksheet['!cols'] = columnWidths;

  // Gera o arquivo
  const fileName = `relatorio-clientes-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

/**
 * Exporta relatório financeiro (empréstimos) para Excel
 */
export const exportLoansToExcel = (loans: Loan[]) => {
  // Prepara os dados
  const data = loans.map(loan => ({
    'ID': loan.id.substring(0, 8),
    'Cliente': loan.clients?.name || 'N/A',
    'Valor': formatCurrency(loan.amount),
    'Taxa de Juros': `${loan.interest_rate}%`,
    'Parcelas': loan.installments,
    'Valor da Parcela': formatCurrency(loan.installment_value),
    'Status': loan.status === 'active' ? 'Ativo' : 
              loan.status === 'paid' ? 'Pago' : 
              loan.status === 'overdue' ? 'Vencido' : 'Cancelado',
    'Data de Início': formatDate(loan.start_date),
    'Próximo Pagamento': formatDate(loan.next_payment_date),
  }));

  // Cria a planilha
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Empréstimos');

  // Define largura das colunas
  const columnWidths = [
    { wch: 10 }, // ID
    { wch: 30 }, // Cliente
    { wch: 15 }, // Valor
    { wch: 12 }, // Taxa
    { wch: 10 }, // Parcelas
    { wch: 15 }, // Valor Parcela
    { wch: 12 }, // Status
    { wch: 15 }, // Data Início
    { wch: 18 }, // Próximo Pagamento
  ];
  worksheet['!cols'] = columnWidths;

  // Adiciona totais no final
  const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const activeLoans = loans.filter(l => l.status === 'active').length;
  const paidLoans = loans.filter(l => l.status === 'paid').length;

  const summaryData = [
    {},
    { 'ID': 'RESUMO' },
    { 'ID': 'Total Emprestado:', 'Cliente': formatCurrency(totalAmount) },
    { 'ID': 'Empréstimos Ativos:', 'Cliente': activeLoans },
    { 'ID': 'Empréstimos Pagos:', 'Cliente': paidLoans },
  ];

  XLSX.utils.sheet_add_json(worksheet, summaryData, { 
    skipHeader: true, 
    origin: -1 
  });

  // Gera o arquivo
  const fileName = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

/**
 * Exporta relatório de pagamentos para Excel
 */
export const exportPaymentsToExcel = (payments: Payment[]) => {
  // Prepara os dados
  const data = payments.map(payment => ({
    'ID': payment.id.substring(0, 8),
    'Cliente': payment.loans?.clients?.name || 'N/A',
    'Valor': formatCurrency(payment.amount),
    'Parcela': `${payment.installment_number}/${payment.loans?.installments || 0}`,
    'Status': payment.status === 'paid' ? 'Pago' : 
              payment.status === 'pending' ? 'Pendente' : 'Vencido',
    'Data de Pagamento': formatDate(payment.payment_date),
  }));

  // Cria a planilha
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagamentos');

  // Define largura das colunas
  const columnWidths = [
    { wch: 10 }, // ID
    { wch: 30 }, // Cliente
    { wch: 15 }, // Valor
    { wch: 10 }, // Parcela
    { wch: 12 }, // Status
    { wch: 18 }, // Data
  ];
  worksheet['!cols'] = columnWidths;

  // Adiciona totais
  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const summaryData = [
    {},
    { 'ID': 'RESUMO' },
    { 'ID': 'Total Pago:', 'Cliente': formatCurrency(totalPaid) },
    { 'ID': 'Total Pendente:', 'Cliente': formatCurrency(totalPending) },
    { 'ID': 'Pagamentos Realizados:', 'Cliente': payments.filter(p => p.status === 'paid').length },
    { 'ID': 'Pagamentos Pendentes:', 'Cliente': payments.filter(p => p.status === 'pending').length },
  ];

  XLSX.utils.sheet_add_json(worksheet, summaryData, { 
    skipHeader: true, 
    origin: -1 
  });

  // Gera o arquivo
  const fileName = `relatorio-pagamentos-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

/**
 * Exporta relatório completo com múltiplas abas
 */
export const exportCompleteReport = (
  clients: Client[],
  loans: Loan[],
  payments: Payment[]
) => {
  const workbook = XLSX.utils.book_new();

  // Aba de Clientes
  const clientsData = clients.map(client => ({
    'Nome': client.name,
    'CPF': client.cpf,
    'Email': client.email,
    'Telefone': client.phone,
    'Status': client.status === 'active' ? 'Ativo' : 'Inativo',
    'Renda': formatCurrency(client.income || 0),
    'Score': client.credit_score || 0,
  }));
  const clientsSheet = XLSX.utils.json_to_sheet(clientsData);
  XLSX.utils.book_append_sheet(workbook, clientsSheet, 'Clientes');

  // Aba de Empréstimos
  const loansData = loans.map(loan => ({
    'Cliente': loan.clients?.name || 'N/A',
    'Valor': formatCurrency(loan.amount),
    'Taxa': `${loan.interest_rate}%`,
    'Parcelas': loan.installments,
    'Status': loan.status === 'active' ? 'Ativo' : 
              loan.status === 'paid' ? 'Pago' : 'Vencido',
    'Data Início': formatDate(loan.start_date),
  }));
  const loansSheet = XLSX.utils.json_to_sheet(loansData);
  XLSX.utils.book_append_sheet(workbook, loansSheet, 'Empréstimos');

  // Aba de Pagamentos
  const paymentsData = payments.map(payment => ({
    'Cliente': payment.loans?.clients?.name || 'N/A',
    'Valor': formatCurrency(payment.amount),
    'Status': payment.status === 'paid' ? 'Pago' : 
              payment.status === 'pending' ? 'Pendente' : 'Vencido',
    'Data': formatDate(payment.payment_date),
  }));
  const paymentsSheet = XLSX.utils.json_to_sheet(paymentsData);
  XLSX.utils.book_append_sheet(workbook, paymentsSheet, 'Pagamentos');

  // Aba de Resumo
  const summaryData = [
    { 'Métrica': 'Total de Clientes', 'Valor': clients.length },
    { 'Métrica': 'Clientes Ativos', 'Valor': clients.filter(c => c.status === 'active').length },
    { 'Métrica': '', 'Valor': '' },
    { 'Métrica': 'Total de Empréstimos', 'Valor': loans.length },
    { 'Métrica': 'Empréstimos Ativos', 'Valor': loans.filter(l => l.status === 'active').length },
    { 'Métrica': 'Valor Total Emprestado', 'Valor': formatCurrency(loans.reduce((sum, l) => sum + l.amount, 0)) },
    { 'Métrica': '', 'Valor': '' },
    { 'Métrica': 'Total de Pagamentos', 'Valor': payments.length },
    { 'Métrica': 'Pagamentos Realizados', 'Valor': payments.filter(p => p.status === 'paid').length },
    { 'Métrica': 'Valor Total Recebido', 'Valor': formatCurrency(payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)) },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

  // Gera o arquivo
  const fileName = `relatorio-completo-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
