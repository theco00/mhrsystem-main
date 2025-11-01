import { useState, useEffect } from 'react';

export interface Loan {
  id: string;
  amount: number;
  status: 'active' | 'paid' | 'defaulted' | 'pending';
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  credit_score: number;
  created_at: string;
}

export interface Payment {
  id: string;
  amount: number;
  status: 'paid' | 'pending';
  payment_date: string;
  created_at: string;
}

export interface LoanMetrics {
  totalLoans: number;
  activeLoans: number;
  totalAmount: number;
  averageLoan: number;
  approvalRate: number;
  defaultRate: number;
}

export interface ClientMetrics {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  averageCreditScore: number;
}

export interface PaymentMetrics {
  totalReceived: number;
  pendingPayments: number;
  overduePayments: number;
  onTimeRate: number;
}

export interface MonthlyData {
  month: string;
  loans: number;
  amount: number;
  clients: number;
  payments: number;
}

export interface AnalyticsData {
  clients: Client[];
  loans: Loan[];
  payments: Payment[];
  loanMetrics: LoanMetrics;
  clientMetrics: ClientMetrics;
  paymentMetrics: PaymentMetrics;
  monthlyData: MonthlyData[];
  loanStatusData: Array<{ name: string; value: number; color: string }>;
  paymentStatusData: Array<{ name: string; value: number; color: string }>;
}

const useAnalyticsData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const clients: Client[] = [
        { id: '1', name: 'João Silva', status: 'active', credit_score: 750, created_at: '2024-01-15' },
        { id: '2', name: 'Maria Santos', status: 'active', credit_score: 680, created_at: '2024-02-20' },
        { id: '3', name: 'Pedro Costa', status: 'inactive', credit_score: 720, created_at: '2024-03-10' },
        { id: '4', name: 'Ana Oliveira', status: 'active', credit_score: 810, created_at: '2024-01-20' },
        { id: '5', name: 'Carlos Silva', status: 'active', credit_score: 690, created_at: '2024-02-15' },
      ];
      
      const loans: Loan[] = [
        { id: '1', amount: 5000, status: 'active', created_at: '2024-01-20' },
        { id: '2', amount: 3000, status: 'paid', created_at: '2024-02-15' },
        { id: '3', amount: 8000, status: 'active', created_at: '2024-03-05' },
        { id: '4', amount: 12000, status: 'active', created_at: '2024-01-25' },
        { id: '5', amount: 6000, status: 'paid', created_at: '2024-02-20' },
      ];
      
      const payments: Payment[] = [
        { id: '1', amount: 500, status: 'paid', payment_date: '2024-01-25', created_at: '2024-01-25' },
        { id: '2', amount: 300, status: 'pending', payment_date: '2024-02-20', created_at: '2024-02-20' },
        { id: '3', amount: 800, status: 'paid', payment_date: '2024-03-10', created_at: '2024-03-10' },
        { id: '4', amount: 1200, status: 'paid', payment_date: '2024-02-15', created_at: '2024-02-15' },
        { id: '5', amount: 600, status: 'pending', payment_date: '2024-03-20', created_at: '2024-03-20' },
      ];

      const processedData = processAnalyticsData(clients, loans, payments);
      setData(processedData);
      setIsLoading(false);
    };

    loadData();
  }, []);

  return { data, isLoading };
};

const processAnalyticsData = (
  clients: Client[], 
  loans: Loan[], 
  payments: Payment[]
): AnalyticsData => {
  // Calculate metrics
  const loanMetrics: LoanMetrics = {
    totalLoans: loans.length,
    activeLoans: loans.filter(loan => loan.status === 'active').length,
    totalAmount: loans.reduce((sum, loan) => sum + loan.amount, 0),
    averageLoan: loans.length > 0 ? loans.reduce((sum, loan) => sum + loan.amount, 0) / loans.length : 0,
    approvalRate: 85.2,
    defaultRate: loans.filter(loan => loan.status === 'defaulted').length / Math.max(loans.length, 1) * 100
  };

  const clientMetrics: ClientMetrics = {
    totalClients: clients.length,
    activeClients: clients.filter(client => client.status === 'active').length,
    newClientsThisMonth: clients.filter(client => {
      const createdAt = new Date(client.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdAt >= thirtyDaysAgo;
    }).length,
    averageCreditScore: clients.length > 0 
      ? clients.reduce((sum, client) => sum + client.credit_score, 0) / clients.length 
      : 0
  };

  const paymentMetrics: PaymentMetrics = {
    totalReceived: payments
      .filter(payment => payment.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0),
    pendingPayments: payments.filter(payment => payment.status === 'pending').length,
    overduePayments: payments.filter(payment => {
      const dueDate = new Date(payment.payment_date);
      return payment.status === 'pending' && dueDate < new Date();
    }).length,
    onTimeRate: payments.length > 0 
      ? (payments.filter(payment => payment.status === 'paid').length / payments.length) * 100 
      : 0
  };

  // Generate monthly data
  const monthlyData = generateMonthlyData(clients, loans, payments);

  // Generate status distributions
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

  return {
    clients,
    loans,
    payments,
    loanMetrics,
    clientMetrics,
    paymentMetrics,
    monthlyData,
    loanStatusData,
    paymentStatusData
  };
};

const generateMonthlyData = (
  clients: Client[], 
  loans: Loan[], 
  payments: Payment[]
): MonthlyData[] => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonth = new Date().getMonth();
  
  return months.slice(0, currentMonth + 1).map((month, index) => {
    const monthLoans = loans.filter(loan => {
      const loanDate = new Date(loan.created_at);
      return loanDate.getMonth() === index;
    });
    
    return {
      month,
      loans: monthLoans.length,
      amount: monthLoans.reduce((sum, loan) => sum + loan.amount, 0),
      clients: clients.filter(client => {
        const clientDate = new Date(client.created_at);
        return clientDate.getMonth() === index;
      }).length,
      payments: payments.filter(payment => {
        const paymentDate = new Date(payment.created_at);
        return paymentDate.getMonth() === index && payment.status === 'paid';
      }).reduce((sum, payment) => sum + payment.amount, 0),
    };
  });
};

export { useAnalyticsData };