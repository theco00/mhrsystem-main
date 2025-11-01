import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseData, Loan, Client } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { LoanDetailsDialog } from '@/components/loans/LoanDetailsDialog';
import { PaymentActionDialog } from '@/components/payments/PaymentActionDialog';
import { WhatsAppModal } from '@/components/clients/WhatsAppModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { isValidPhone } from '@/lib/whatsapp-utils';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { useTrialLimits } from '@/hooks/useTrialLimits';
import { TrialLimitAlert } from '@/components/trial/TrialLimitAlert';
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageCircle,
  Check,
  CreditCard,
  Trash2
} from 'lucide-react';

/**
 * LoansView - Gestão de empréstimos
 * 
 * Funcionalidades:
 * - Lista todos os empréstimos cadastrados
 * - Busca e filtros por status
 * - Adicionar novos empréstimos
 * - Editar empréstimos existentes
 * - Visualizar detalhes do empréstimo
 * - Processar pagamentos
 * - Interface responsiva e acessível
 * 
 * @component
 * @returns {JSX.Element} Componente de gestão de empréstimos
 */
export default function LoansView() {
  // Hooks e estados
  const { loans, clients, addLoan, updateLoan, deleteLoan, updateLoanStatus, isLoading } = useSupabaseData();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { limits, isLoading: limitsLoading } = useTrialLimits();
  
  // Estados locais
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showLimitAlert, setShowLimitAlert] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<Loan | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [whatsappClient, setWhatsappClient] = useState<Client | null>(null);
  
  const [newLoan, setNewLoan] = useState({
    clientId: '',
    amount: '',
    interestRate: '',
    interestType: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'total',
    installments: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDateOption: 'custom' as '15-days' | '30-days' | 'custom',
    customDueDate: '',
  });

  const [editLoan, setEditLoan] = useState({
    clientId: '',
    amount: '',
    interestRate: '',
    interestType: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'total',
    installments: '',
    startDate: '',
  });

  /**
   * Filtra empréstimos baseado nos critérios de busca e status
   * Otimizado com useMemo para evitar recálculos desnecessários
   */
  const filteredLoans = useMemo(() => {
    const term = searchTerm.toLowerCase();
    
    return loans.filter(loan => {
      const clientName = loan.clients?.name || '';
      const matchesSearch = !searchTerm.trim() || 
                           clientName.toLowerCase().includes(term) ||
                           loan.id.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [loans, searchTerm, statusFilter]);

  const calculateInstallmentValue = (amount: number, rate: number, installments: number, interestType: 'daily' | 'weekly' | 'monthly' | 'total') => {
    if (interestType === 'total') {
      // Juros sobre valor inteiro - soma o percentual ao valor total
      const totalWithInterest = amount + (amount * rate / 100);
      return totalWithInterest / installments;
    }
    
    // Converte taxa para taxa mensal equivalente
    let monthlyRate = rate / 100;
    if (interestType === 'daily') {
      monthlyRate = (Math.pow(1 + rate / 100, 30) - 1); // 30 dias por mês
    } else if (interestType === 'weekly') {
      monthlyRate = (Math.pow(1 + rate / 100, 4.33) - 1); // ~4.33 semanas por mês
    }
    
    if (monthlyRate === 0) return amount / installments;
    
    // Sistema de Amortização Francês (SAC)
    const factor = Math.pow(1 + monthlyRate, installments);
    return (amount * monthlyRate * factor) / (factor - 1);
  };

  const handleAddLoan = async () => {
    // Verificar limite do trial PRIMEIRO
    if (!limits.canAddLoan && !limits.isUnlimited) {
      setShowLimitAlert(true);
      setIsAddDialogOpen(false);
      return;
    }

    if (!newLoan.clientId || !newLoan.amount || !newLoan.interestRate || !newLoan.installments) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos do empréstimo",
        variant: "destructive",
      });
      return;
    }

    const client = clients.find(c => c.id === newLoan.clientId);
    if (!client) {
      toast({
        title: "Cliente não encontrado",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(newLoan.amount);
    const rate = parseFloat(newLoan.interestRate);
    const installments = parseInt(newLoan.installments);
    const installmentValue = calculateInstallmentValue(amount, rate, installments, newLoan.interestType);
    
    const startDate = new Date(newLoan.startDate + 'T00:00:00');
    let nextPaymentDate = new Date(startDate);
    
    // Calculate next payment based on due date option
    if (newLoan.dueDateOption === '15-days') {
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 15);
    } else if (newLoan.dueDateOption === '30-days') {
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);
    } else if (newLoan.dueDateOption === 'custom' && newLoan.customDueDate) {
      nextPaymentDate = new Date(newLoan.customDueDate + 'T00:00:00');
    } else {
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    }

    // Format date without timezone issues
    const formatDateToISO = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const loan = {
      client_id: newLoan.clientId,
      amount,
      interest_rate: rate,
      interest_type: newLoan.interestType,
      installments,
      installment_value: installmentValue,
      start_date: newLoan.startDate,
      status: 'active' as const,
      remaining_amount: amount * (1 + (rate / 100) * (installments / 12)), // Simple calculation
      next_payment_date: formatDateToISO(nextPaymentDate),
    };

    const result = await addLoan(loan);

    if (result) {
      toast({
        title: "Empréstimo criado!",
        description: `Empréstimo para ${client.name} foi registrado com sucesso`,
      });

      setNewLoan({
        clientId: '',
        amount: '',
        interestRate: '',
        interestType: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'total',
        installments: '',
        startDate: new Date().toISOString().split('T')[0],
        dueDateOption: 'custom' as '15-days' | '30-days' | 'custom',
        customDueDate: '',
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditLoan = (loan: Loan) => {
    setEditingLoan(loan);
    setEditLoan({
      clientId: loan.client_id,
      amount: loan.amount.toString(),
      interestRate: loan.interest_rate.toString(),
      interestType: loan.interest_type || 'monthly',
      installments: loan.installments.toString(),
      startDate: loan.start_date,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateLoan = async () => {
    if (!editingLoan || !editLoan.clientId || !editLoan.amount || !editLoan.interestRate || !editLoan.installments) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos do empréstimo",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(editLoan.amount);
    const rate = parseFloat(editLoan.interestRate);
    const installments = parseInt(editLoan.installments);
    const installmentValue = calculateInstallmentValue(amount, rate, installments, editLoan.interestType);
    
    const startDate = new Date(editLoan.startDate);
    const nextPaymentDate = new Date(startDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    const loanData = {
      client_id: editLoan.clientId,
      amount,
      interest_rate: rate,
      interest_type: editLoan.interestType,
      installments,
      installment_value: installmentValue,
      start_date: editLoan.startDate,
      remaining_amount: amount * (1 + (rate / 100) * (installments / 12)), // Simple calculation
      next_payment_date: nextPaymentDate.toISOString().split('T')[0],
    };

    const result = await updateLoan(editingLoan.id, loanData);

    if (result) {
      const client = clients.find(c => c.id === editLoan.clientId);
      toast({
        title: "Empréstimo atualizado!",
        description: `Empréstimo para ${client?.name} foi atualizado com sucesso`,
      });

      setEditLoan({
        clientId: '',
        amount: '',
        interestRate: '',
        interestType: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'total',
        installments: '',
        startDate: '',
      });
      setEditingLoan(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteLoan = async (loan: Loan) => {
    // Confirmação antes de excluir
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o empréstimo de ${loan.clients?.name}?\n\n` +
      `Valor: ${formatCurrency(loan.amount)}\n` +
      `Esta ação não pode ser desfeita.`
    );
    
    if (!confirmed) return;
    
    const success = await deleteLoan(loan.id);
    if (success) {
      toast({
        title: "Empréstimo excluído!",
        description: `Empréstimo para ${loan.clients?.name} foi excluído com sucesso`,
      });
    } else {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o empréstimo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return null;
    }
  };

  const handleViewLoan = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsDetailsDialogOpen(true);
  };

  const handleMarkAsPaid = async (loanId: string) => {
    const success = await updateLoanStatus(loanId, 'paid');
    if (success) {
      toast({
        title: "Empréstimo quitado!",
        description: "O empréstimo foi marcado como pago com sucesso",
      });
    }
  };

  const handleOpenPaymentDialog = (loan: Loan) => {
    setSelectedLoanForPayment(loan);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentConfirmed = async (loanId: string, amount: number) => {
    // Payment is handled in PaymentActionDialog, just refresh data
    toast({
      title: "Pagamento registrado!",
      description: `Pagamento de ${formatCurrency(amount)} foi registrado com sucesso`,
    });
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1 md:mb-2">Gestão de Empréstimos</h1>
          <p className="text-muted-foreground text-sm md:text-base">Gerencie contratos e pagamentos</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="flex items-center gap-2 btn-hover hover-scale min-h-[44px] w-full sm:w-auto"
              disabled={!limits.canAddLoan && !limits.isUnlimited}
            >
              <Plus className="w-4 h-4" />
              Novo Empréstimo
              {!limits.isUnlimited && (
                <span className="ml-2 text-xs opacity-75 bg-white/20 px-2 py-0.5 rounded-full">
                  {limits.currentLoans}/{limits.maxLoans}
                </span>
              )}
              {!limits.canAddLoan && !limits.isUnlimited && (
                <span className="ml-1">🔒</span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Empréstimo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Cliente *</Label>
                <Select 
                  value={newLoan.clientId} 
                  onValueChange={(value) => setNewLoan({...newLoan, clientId: value})}
                >
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.cpf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor do Empréstimo *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="15000"
                    value={newLoan.amount}
                    onChange={(e) => setNewLoan({...newLoan, amount: e.target.value})}
                    className="min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interestType">Tipo de Juros *</Label>
                  <Select 
                    value={newLoan.interestType} 
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'total') => 
                      setNewLoan({...newLoan, interestType: value})}
                  >
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue placeholder="Selecione o tipo de juros" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal (% ao mês)</SelectItem>
                      <SelectItem value="daily">Diário (% ao dia)</SelectItem>
                      <SelectItem value="weekly">Semanal (% por semana)</SelectItem>
                      <SelectItem value="total">Valor Inteiro (% sobre total)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground">
                    {newLoan.interestType === 'daily' && 'Juros aplicados diariamente, compostos mensalmente'}
                    {newLoan.interestType === 'weekly' && 'Juros aplicados semanalmente, compostos mensalmente'}
                    {newLoan.interestType === 'monthly' && 'Juros compostos calculados mensalmente (padrão)'}
                    {newLoan.interestType === 'total' && 'Percentual fixo sobre o valor total, dividido nas parcelas'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interestRate">
                    Taxa de Juros *
                    {newLoan.interestType === 'daily' && ' (% ao dia)'}
                    {newLoan.interestType === 'weekly' && ' (% por semana)'}
                    {newLoan.interestType === 'monthly' && ' (% ao mês)'}
                    {newLoan.interestType === 'total' && ' (% sobre total)'}
                  </Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    placeholder={
                      newLoan.interestType === 'daily' ? "0.1" : 
                      newLoan.interestType === 'weekly' ? "1.0" :
                      newLoan.interestType === 'monthly' ? "2.5" : "20"
                    }
                    value={newLoan.interestRate}
                    onChange={(e) => setNewLoan({...newLoan, interestRate: e.target.value})}
                    className="min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="installments">Número de Parcelas *</Label>
                  <Input
                    id="installments"
                    type="number"
                    placeholder="24"
                    value={newLoan.installments}
                    onChange={(e) => setNewLoan({...newLoan, installments: e.target.value})}
                    className="min-h-[44px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newLoan.startDate}
                  onChange={(e) => setNewLoan({...newLoan, startDate: e.target.value})}
                  className="min-h-[44px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDateOption">Prazo de Vencimento *</Label>
                <Select 
                  value={newLoan.dueDateOption} 
                  onValueChange={(value: '15-days' | '30-days' | 'custom') => 
                    setNewLoan({...newLoan, dueDateOption: value})}
                >
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue placeholder="Selecione o prazo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15-days">15 dias</SelectItem>
                    <SelectItem value="30-days">30 dias</SelectItem>
                    <SelectItem value="custom">Escolher data personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newLoan.dueDateOption === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="customDueDate">Data de Vencimento Personalizada *</Label>
                  <Input
                    id="customDueDate"
                    type="date"
                    value={newLoan.customDueDate}
                    onChange={(e) => setNewLoan({...newLoan, customDueDate: e.target.value})}
                    className="min-h-[44px]"
                    min={newLoan.startDate}
                  />
                </div>
              )}

              {newLoan.amount && newLoan.interestRate && newLoan.installments && (
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Resumo do Empréstimo</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Valor da Parcela:</p>
                      <p className="font-semibold text-primary">
                        {formatCurrency(calculateInstallmentValue(
                          parseFloat(newLoan.amount),
                          parseFloat(newLoan.interestRate),
                          parseInt(newLoan.installments),
                          newLoan.interestType
                        ))}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total a Pagar:</p>
                      <p className="font-semibold text-warning">
                        {formatCurrency(calculateInstallmentValue(
                          parseFloat(newLoan.amount),
                          parseFloat(newLoan.interestRate),
                          parseInt(newLoan.installments),
                          newLoan.interestType
                        ) * parseInt(newLoan.installments))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="min-h-[44px]">
                  Cancelar
                </Button>
                <Button onClick={handleAddLoan} className="min-h-[44px]">
                  Criar Empréstimo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Edit Loan Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Empréstimo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editClientId">Cliente *</Label>
                <Select 
                  value={editLoan.clientId} 
                  onValueChange={(value) => setEditLoan({...editLoan, clientId: value})}
                >
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.cpf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editAmount">Valor do Empréstimo *</Label>
                  <Input
                    id="editAmount"
                    type="number"
                    placeholder="15000"
                    value={editLoan.amount}
                    onChange={(e) => setEditLoan({...editLoan, amount: e.target.value})}
                    className="min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editInterestType">Tipo de Juros *</Label>
                  <Select 
                    value={editLoan.interestType} 
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'total') => 
                      setEditLoan({...editLoan, interestType: value})}
                  >
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue placeholder="Selecione o tipo de juros" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal (% ao mês)</SelectItem>
                      <SelectItem value="daily">Diário (% ao dia)</SelectItem>
                      <SelectItem value="weekly">Semanal (% por semana)</SelectItem>
                      <SelectItem value="total">Valor Inteiro (% sobre total)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground">
                    {editLoan.interestType === 'daily' && 'Juros aplicados diariamente, compostos mensalmente'}
                    {editLoan.interestType === 'weekly' && 'Juros aplicados semanalmente, compostos mensalmente'}
                    {editLoan.interestType === 'monthly' && 'Juros compostos calculados mensalmente (padrão)'}
                    {editLoan.interestType === 'total' && 'Percentual fixo sobre o valor total, dividido nas parcelas'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editInterestRate">
                    Taxa de Juros *
                    {editLoan.interestType === 'daily' && ' (% ao dia)'}
                    {editLoan.interestType === 'weekly' && ' (% por semana)'}
                    {editLoan.interestType === 'monthly' && ' (% ao mês)'}
                    {editLoan.interestType === 'total' && ' (% sobre total)'}
                  </Label>
                  <Input
                    id="editInterestRate"
                    type="number"
                    step="0.1"
                    placeholder={
                      editLoan.interestType === 'daily' ? "0.1" : 
                      editLoan.interestType === 'weekly' ? "1.0" :
                      editLoan.interestType === 'monthly' ? "2.5" : "20"
                    }
                    value={editLoan.interestRate}
                    onChange={(e) => setEditLoan({...editLoan, interestRate: e.target.value})}
                    className="min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editInstallments">Número de Parcelas *</Label>
                  <Input
                    id="editInstallments"
                    type="number"
                    placeholder="24"
                    value={editLoan.installments}
                    onChange={(e) => setEditLoan({...editLoan, installments: e.target.value})}
                    className="min-h-[44px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editStartDate">Data de Início</Label>
                <Input
                  id="editStartDate"
                  type="date"
                  value={editLoan.startDate}
                  onChange={(e) => setEditLoan({...editLoan, startDate: e.target.value})}
                  className="min-h-[44px]"
                />
              </div>

              {editLoan.amount && editLoan.interestRate && editLoan.installments && (
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Resumo do Empréstimo</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Valor da Parcela:</p>
                      <p className="font-semibold text-primary">
                        {formatCurrency(calculateInstallmentValue(
                          parseFloat(editLoan.amount),
                          parseFloat(editLoan.interestRate),
                          parseInt(editLoan.installments),
                          editLoan.interestType
                        ))}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total a Pagar:</p>
                      <p className="font-semibold text-warning">
                        {formatCurrency(calculateInstallmentValue(
                          parseFloat(editLoan.amount),
                          parseFloat(editLoan.interestRate),
                          parseInt(editLoan.installments),
                          editLoan.interestType
                        ) * parseInt(editLoan.installments))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="min-h-[44px]">
                  Cancelar
                </Button>
                {editingLoan && (
                  <Button variant="destructive" onClick={() => handleDeleteLoan(editingLoan)} className="min-h-[44px]">
                    Excluir
                  </Button>
                )}
                <Button onClick={handleUpdateLoan} className="min-h-[44px]">
                  Atualizar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 min-h-[44px]"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 min-h-[44px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="overdue">Atrasados</SelectItem>
            <SelectItem value="paid">Quitados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <Card className="bg-success/5 border-success/20 hover-lift card-interactive stagger-item">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-success">Empréstimos Ativos</p>
                <p className="text-lg md:text-2xl font-bold text-success">
                  {loans.filter(l => l.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-success animate-scale-in" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/20 hover-lift card-interactive stagger-item">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-destructive">Empréstimos Atrasados</p>
                <p className="text-lg md:text-2xl font-bold text-destructive">
                  {loans.filter(l => l.status === 'overdue').length}
                </p>
              </div>
              <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-destructive animate-scale-in" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50 hover-lift card-interactive stagger-item">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Empréstimos Quitados</p>
                <p className="text-lg md:text-2xl font-bold text-muted-foreground">
                  {loans.filter(l => l.status === 'paid').length}
                </p>
              </div>
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground animate-scale-in" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loans List */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg">Lista de Empréstimos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 p-3 md:p-4">
            {filteredLoans.slice(0, 50).map((loan) => (
              <Card key={loan.id} className="border border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-base truncate">
                        {loan.clients?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">ID: {loan.id.slice(0, 8)}</p>
                    </div>
                    <Badge className={
                      loan.status === 'active' ? 'status-paid' :
                      loan.status === 'overdue' ? 'status-overdue' : 'status-pending'
                    }>
                      {loan.status === 'active' ? 'Ativo' : 
                       loan.status === 'overdue' ? 'Atrasado' : 'Quitado'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valor:</span>
                      <span className="font-medium">{formatCurrency(loan.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Parcela:</span>
                      <span className="font-medium">{formatCurrency(loan.installment_value)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Próximo:</span>
                      <span className="font-medium">{formatDate(loan.next_payment_date)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-[44px]"
                      onClick={() => handleViewLoan(loan)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-[44px]"
                      onClick={() => handleEditLoan(loan)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    {loan.status === 'active' && (
                      <Button
                        size="sm"
                        className="col-span-2 min-h-[44px]"
                        onClick={() => handleOpenPaymentDialog(loan)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Pagar Parcela
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Parcelas</TableHead>
                  <TableHead>Próximo Vencimento</TableHead>
                  <TableHead>Saldo Devedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{loan.clients?.name}</p>
                          {loan.clients?.phone && isValidPhone(loan.clients.phone) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-1.5 hover:bg-green-50 rounded-full"
                              onClick={() => setWhatsappClient(loan.clients)}
                              title="Enviar mensagem no WhatsApp"
                            >
                              <WhatsAppIcon size={24} />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">ID: {loan.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-success" />
                        <span className="font-medium">{formatCurrency(loan.amount)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {Math.floor(Math.random() * loan.installments) + 1}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          de {loan.installments}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-warning" />
                        <span className="text-sm">{formatDate(loan.next_payment_date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-warning">
                        {formatCurrency(loan.remaining_amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(loan.status)}
                        <Badge className={
                          loan.status === 'active' ? 'status-paid' :
                          loan.status === 'overdue' ? 'status-overdue' : 'status-pending'
                        }>
                          {loan.status === 'active' ? 'Ativo' : 
                           loan.status === 'overdue' ? 'Atrasado' : 'Quitado'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {loan.clients?.phone && isValidPhone(loan.clients.phone) && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover-scale btn-hover hover:bg-green-50 min-h-[44px] min-w-[44px]" 
                            title="Enviar WhatsApp"
                            onClick={() => setWhatsappClient(loan.clients)}
                          >
                            <WhatsAppIcon size={20} />
                          </Button>
                        )}
                        <Button
                          variant="ghost" 
                          size="sm" 
                          className="hover-scale btn-hover min-h-[44px] min-w-[44px]" 
                          title="Visualizar"
                          onClick={() => handleViewLoan(loan)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover-scale btn-hover min-h-[44px] min-w-[44px]" 
                          title="Editar"
                          onClick={() => handleEditLoan(loan)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover-scale btn-hover text-destructive hover:text-destructive hover:bg-destructive/10 min-h-[44px] min-w-[44px]" 
                          title="Excluir"
                          onClick={() => handleDeleteLoan(loan)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
            
            {filteredLoans.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum empréstimo encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <LoanDetailsDialog 
        loan={selectedLoan}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
      />

      <PaymentActionDialog 
        loan={selectedLoanForPayment}
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        onPaymentConfirmed={handlePaymentConfirmed}
      />

      {/* Modal WhatsApp */}
      {whatsappClient && (
        <WhatsAppModal
          isOpen={!!whatsappClient}
          onClose={() => setWhatsappClient(null)}
          client={whatsappClient}
        />
      )}

      {/* Modal de Limite do Trial */}
      {showLimitAlert && (
        <TrialLimitAlert
          type="loan"
          currentCount={limits.currentLoans}
          maxCount={limits.maxLoans}
          onClose={() => setShowLimitAlert(false)}
        />
      )}
    </div>
  );
}
