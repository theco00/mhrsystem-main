import { useState, useEffect } from 'react';

export interface Client {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  address: string;
  income: number;
  creditScore: number;
  registeredAt: Date;
  status: 'active' | 'inactive';
}

export interface Loan {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  interestRate: number;
  installments: number;
  installmentValue: number;
  startDate: Date;
  status: 'active' | 'paid' | 'overdue';
  remainingAmount: number;
  nextPaymentDate: Date;
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: Date;
  installmentNumber: number;
  status: 'paid' | 'pending' | 'overdue';
}

// Clean data - no mock data
const MOCK_CLIENTS: Client[] = [];

const MOCK_LOANS: Loan[] = [];

export function useLoanData() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setClients(MOCK_CLIENTS);
      setLoans(MOCK_LOANS);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const addClient = (client: Omit<Client, 'id' | 'registeredAt'>) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      registeredAt: new Date(),
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const addLoan = (loan: Omit<Loan, 'id'>) => {
    const newLoan: Loan = {
      ...loan,
      id: Date.now().toString(),
    };
    setLoans(prev => [...prev, newLoan]);
    return newLoan;
  };

  const updateLoanStatus = (loanId: string, status: Loan['status']) => {
    setLoans(prev => prev.map(loan => 
      loan.id === loanId ? { ...loan, status } : loan
    ));
  };

  // Dashboard metrics
  const metrics = {
    totalClients: clients.length,
    activeLoans: loans.filter(loan => loan.status === 'active').length,
    overdueLoans: loans.filter(loan => loan.status === 'overdue').length,
    totalLoaned: loans.reduce((sum, loan) => sum + loan.amount, 0),
    totalOutstanding: loans.reduce((sum, loan) => sum + loan.remainingAmount, 0),
    upcomingPayments: loans.filter(loan => {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return loan.nextPaymentDate <= nextWeek && loan.status === 'active';
    }).length,
  };

  return {
    clients,
    loans,
    isLoading,
    addClient,
    addLoan,
    updateLoanStatus,
    metrics,
  };
}