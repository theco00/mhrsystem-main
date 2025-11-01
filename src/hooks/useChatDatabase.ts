import { useState, useCallback } from 'react';

// Interfaces para os dados simulados
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: string;
  registrationDate: string;
  status: 'active' | 'inactive';
  totalLoans: number;
  totalDebt: number;
}

export interface Loan {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  interestRate: number;
  installments: number;
  paidInstallments: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'paid' | 'overdue';
  monthlyPayment: number;
  remainingAmount: number;
}

export interface Payment {
  id: string;
  loanId: string;
  clientName: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  installmentNumber: number;
}

export interface DatabaseStats {
  totalClients: number;
  activeLoans: number;
  totalRevenue: number;
  overduePayments: number;
  monthlyProjection: number;
}

// Dados simulados
const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'João Silva Santos',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-1234',
    cpf: '123.456.789-01',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    registrationDate: '2024-01-15',
    status: 'active',
    totalLoans: 2,
    totalDebt: 15000
  },
  {
    id: '2',
    name: 'Maria Oliveira Costa',
    email: 'maria.costa@email.com',
    phone: '(11) 98888-5678',
    cpf: '987.654.321-09',
    address: 'Av. Paulista, 456 - São Paulo/SP',
    registrationDate: '2024-02-20',
    status: 'active',
    totalLoans: 1,
    totalDebt: 8500
  },
  {
    id: '3',
    name: 'Carlos Eduardo Lima',
    email: 'carlos.lima@email.com',
    phone: '(11) 97777-9012',
    cpf: '456.789.123-45',
    address: 'Rua Augusta, 789 - São Paulo/SP',
    registrationDate: '2024-03-10',
    status: 'active',
    totalLoans: 3,
    totalDebt: 22000
  },
  {
    id: '4',
    name: 'Ana Paula Ferreira',
    email: 'ana.ferreira@email.com',
    phone: '(11) 96666-3456',
    cpf: '789.123.456-78',
    address: 'Rua Oscar Freire, 321 - São Paulo/SP',
    registrationDate: '2024-01-05',
    status: 'inactive',
    totalLoans: 1,
    totalDebt: 0
  }
];

const MOCK_LOANS: Loan[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'João Silva Santos',
    amount: 10000,
    interestRate: 2.5,
    installments: 12,
    paidInstallments: 8,
    startDate: '2024-01-15',
    endDate: '2025-01-15',
    status: 'active',
    monthlyPayment: 925,
    remainingAmount: 3700
  },
  {
    id: '2',
    clientId: '1',
    clientName: 'João Silva Santos',
    amount: 15000,
    interestRate: 3.0,
    installments: 18,
    paidInstallments: 6,
    startDate: '2024-06-01',
    endDate: '2025-12-01',
    status: 'active',
    monthlyPayment: 1050,
    remainingAmount: 12600
  },
  {
    id: '3',
    clientId: '2',
    clientName: 'Maria Oliveira Costa',
    amount: 8500,
    interestRate: 2.8,
    installments: 10,
    paidInstallments: 10,
    startDate: '2024-02-20',
    endDate: '2024-12-20',
    status: 'paid',
    monthlyPayment: 950,
    remainingAmount: 0
  },
  {
    id: '4',
    clientId: '3',
    clientName: 'Carlos Eduardo Lima',
    amount: 20000,
    interestRate: 3.2,
    installments: 24,
    paidInstallments: 10,
    startDate: '2024-03-10',
    endDate: '2026-03-10',
    status: 'active',
    monthlyPayment: 1150,
    remainingAmount: 16100
  }
];

const MOCK_PAYMENTS: Payment[] = [
  {
    id: '1',
    loanId: '1',
    clientName: 'João Silva Santos',
    amount: 925,
    paymentDate: '2024-12-15',
    dueDate: '2024-12-15',
    status: 'paid',
    installmentNumber: 8
  },
  {
    id: '2',
    loanId: '2',
    clientName: 'João Silva Santos',
    amount: 1050,
    paymentDate: '',
    dueDate: '2025-01-01',
    status: 'pending',
    installmentNumber: 7
  },
  {
    id: '3',
    loanId: '4',
    clientName: 'Carlos Eduardo Lima',
    amount: 1150,
    paymentDate: '',
    dueDate: '2024-12-10',
    status: 'overdue',
    installmentNumber: 11
  }
];

export function useChatDatabase() {
  const [clients] = useState<Client[]>(MOCK_CLIENTS);
  const [loans] = useState<Loan[]>(MOCK_LOANS);
  const [payments] = useState<Payment[]>(MOCK_PAYMENTS);

  // Buscar cliente por nome ou CPF
  const searchClient = useCallback((query: string): Client[] => {
    const searchTerm = query.toLowerCase();
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchTerm) ||
      client.cpf.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm)
    );
  }, [clients]);

  // Buscar empréstimos por cliente
  const getLoansByClient = useCallback((clientId: string): Loan[] => {
    return loans.filter(loan => loan.clientId === clientId);
  }, [loans]);

  // Buscar pagamentos por empréstimo
  const getPaymentsByLoan = useCallback((loanId: string): Payment[] => {
    return payments.filter(payment => payment.loanId === loanId);
  }, [payments]);

  // Obter estatísticas gerais
  const getDatabaseStats = useCallback((): DatabaseStats => {
    const totalClients = clients.length;
    const activeLoans = loans.filter(loan => loan.status === 'active').length;
    const totalRevenue = loans
      .filter(loan => loan.status === 'paid')
      .reduce((sum, loan) => sum + loan.amount, 0);
    const overduePayments = payments.filter(payment => payment.status === 'overdue').length;
    const monthlyProjection = loans
      .filter(loan => loan.status === 'active')
      .reduce((sum, loan) => sum + loan.monthlyPayment, 0);

    return {
      totalClients,
      activeLoans,
      totalRevenue,
      overduePayments,
      monthlyProjection
    };
  }, [clients, loans, payments]);

  // Buscar empréstimos em atraso
  const getOverdueLoans = useCallback((): Loan[] => {
    return loans.filter(loan => loan.status === 'overdue');
  }, [loans]);

  // Buscar próximos vencimentos
  const getUpcomingPayments = useCallback((): Payment[] => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return payments.filter(payment => {
      if (payment.status !== 'pending') return false;
      const dueDate = new Date(payment.dueDate);
      return dueDate >= today && dueDate <= nextWeek;
    });
  }, [payments]);

  // Processar consultas em linguagem natural
  const processQuery = useCallback((query: string): any => {
    const queryLower = query.toLowerCase();

    // Consultas sobre clientes
    if (queryLower.includes('cliente') || queryLower.includes('clientes')) {
      if (queryLower.includes('quantos') || queryLower.includes('total')) {
        return {
          type: 'stats',
          data: { totalClients: clients.length },
          message: `Temos ${clients.length} clientes cadastrados no sistema.`
        };
      }
      if (queryLower.includes('ativo') || queryLower.includes('ativos')) {
        const activeClients = clients.filter(c => c.status === 'active');
        return {
          type: 'clients',
          data: activeClients,
          message: `Encontrei ${activeClients.length} clientes ativos.`
        };
      }
    }

    // Consultas sobre empréstimos
    if (queryLower.includes('empréstimo') || queryLower.includes('emprestimo') || queryLower.includes('loan')) {
      if (queryLower.includes('ativo') || queryLower.includes('ativos')) {
        const activeLoans = loans.filter(l => l.status === 'active');
        return {
          type: 'loans',
          data: activeLoans,
          message: `Há ${activeLoans.length} empréstimos ativos no sistema.`
        };
      }
      if (queryLower.includes('atraso') || queryLower.includes('vencido')) {
        const overdueLoans = getOverdueLoans();
        return {
          type: 'loans',
          data: overdueLoans,
          message: `Encontrei ${overdueLoans.length} empréstimos em atraso.`
        };
      }
    }

    // Consultas sobre receita
    if (queryLower.includes('receita') || queryLower.includes('faturamento') || queryLower.includes('ganho')) {
      const stats = getDatabaseStats();
      return {
        type: 'stats',
        data: stats,
        message: `A receita total é de R$ ${stats.totalRevenue.toLocaleString('pt-BR')}, com projeção mensal de R$ ${stats.monthlyProjection.toLocaleString('pt-BR')}.`
      };
    }

    // Consultas sobre pagamentos
    if (queryLower.includes('pagamento') || queryLower.includes('vencimento')) {
      const upcoming = getUpcomingPayments();
      return {
        type: 'payments',
        data: upcoming,
        message: `Há ${upcoming.length} pagamentos com vencimento nos próximos 7 dias.`
      };
    }

    // Busca por nome específico
    const clientResults = searchClient(query);
    if (clientResults.length > 0) {
      return {
        type: 'clients',
        data: clientResults,
        message: `Encontrei ${clientResults.length} cliente(s) relacionado(s) à sua busca.`
      };
    }

    return {
      type: 'unknown',
      data: null,
      message: 'Não consegui entender sua consulta. Tente perguntar sobre clientes, empréstimos, pagamentos ou receita.'
    };
  }, [clients, loans, searchClient, getOverdueLoans, getDatabaseStats, getUpcomingPayments]);

  return {
    clients,
    loans,
    payments,
    searchClient,
    getLoansByClient,
    getPaymentsByLoan,
    getDatabaseStats,
    getOverdueLoans,
    getUpcomingPayments,
    processQuery
  };
}