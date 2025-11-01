import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calculator, TrendingUp, Calendar, DollarSign, RotateCcw } from 'lucide-react';
import { addMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type InterestPeriod = 'daily' | 'weekly' | 'monthly' | 'total';

/**
 * CalculatorView - Simulador de empréstimos
 * 
 * Funcionalidades:
 * - Cálculo de valores de parcelas
 * - Diferentes tipos de juros (diário, semanal, mensal, total)
 * - Simulação de cronograma de pagamentos
 * - Validação de campos de entrada
 * - Interface responsiva e intuitiva
 * 
 * @component
 * @returns {JSX.Element} Componente do simulador de empréstimos
 */
export default function CalculatorView() {
  const [loanAmount, setLoanAmount] = useState('50000');
  const [interestRate, setInterestRate] = useState('2.5');
  const [installments, setInstallments] = useState('24');
  const [days, setDays] = useState(30);
  const [interestPeriod, setInterestPeriod] = useState<InterestPeriod>('monthly');
  const [startDate] = useState(new Date());
  const [calculated, setCalculated] = useState(false);

  const handleReset = () => {
    setLoanAmount('50000');
    setInterestRate('2.5');
    setInstallments('24');
    setDays(30);
    setInterestPeriod('monthly');
    setCalculated(false);
  };

  const handleCalculate = () => {
    setCalculated(true);
  };

  // Calculate loan details with monthly interest logic
  const calculateLoan = (amount: number, rate: number, months: number, period: InterestPeriod, days: number) => {
    if (amount <= 0) {
      return {
        monthlyPayment: 0,
        totalAmount: 0,
        totalInterest: 0,
      };
    }

    let totalInterest = 0;
    const rateDecimal = rate / 100;
    
    switch (period) {
      case 'daily':
        // Daily interest: rate per day * number of days (based on total amount)
        totalInterest = amount * rateDecimal * days;
        const totalAmount = amount + totalInterest;
        return {
          monthlyPayment: 0, // Not applicable for daily
          totalAmount,
          totalInterest,
        };
      case 'weekly':
        // Weekly interest applied monthly (4 weeks per month)
        totalInterest = amount * rateDecimal * 4 * months;
        break;
      case 'monthly':
        // Monthly interest: rate * number of months
        totalInterest = amount * rateDecimal * months;
        break;
      case 'total':
        // Total interest for the entire period
        totalInterest = amount * rateDecimal;
        break;
    }
    
    const totalAmount = amount + totalInterest;
    const monthlyPayment = totalAmount / months;

    return {
      monthlyPayment,
      totalAmount,
      totalInterest,
    };
  };

  const amount = parseFloat(loanAmount) || 0;
  const rate = parseFloat(interestRate) || 0;
  const months = parseInt(installments) || 0;

  const loan = calculateLoan(amount, rate, months, interestPeriod, days);

  // Generate payment table with detailed information
  const generatePaymentTable = () => {
    const table = [];
    let remainingBalance = loan.totalAmount;
    const paymentValue = loan.monthlyPayment;
    
    for (let month = 1; month <= months; month++) {
      const dueDate = addMonths(startDate, month);
      table.push({
        month,
        dueDate: format(dueDate, "dd/MM/yyyy", { locale: ptBR }),
        paymentValue,
        remainingBalance,
      });
      remainingBalance -= paymentValue;
    }
    
    return table;
  };

  const paymentTable = generatePaymentTable();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getPeriodLabel = (period: InterestPeriod) => {
    switch (period) {
      case 'daily': return 'ao dia';
      case 'weekly': return 'por semana';
      case 'monthly': return 'ao mês';
      case 'total': return 'total';
    }
  };

  const installmentOptions = [3, 6, 12, 18, 24, 36, 48, 60];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Simulador de Empréstimos</h1>
        <p className="text-muted-foreground">Calcule parcelas e juros antes de formalizar o contrato</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Form */}
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Parâmetros do Empréstimo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Loan Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Valor do Empréstimo</Label>
              <Input
                id="amount"
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="50000"
                className="text-lg h-12"
              />
              <p className="text-xs text-muted-foreground">
                {amount > 0 && formatCurrency(amount)}
              </p>
            </div>

            {/* Interest Rate */}
            <div className="space-y-2">
              <Label htmlFor="rate">Taxa de Juros (%)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="2.5"
                className="text-lg h-12"
              />
            </div>

            {/* Interest Period */}
            <div className="space-y-2">
              <Label htmlFor="period">Período de Aplicação dos Juros</Label>
              <Select value={interestPeriod} onValueChange={(value) => setInterestPeriod(value as InterestPeriod)}>
                <SelectTrigger id="period" className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diária</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="total">Valor Total</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Taxa aplicada: {rate}% {getPeriodLabel(interestPeriod)}
              </p>
            </div>

            {/* Days input for daily period */}
            {interestPeriod === 'daily' && (
              <div className="space-y-2">
                <Label htmlFor="days">Quantidade de Dias</Label>
                <Input
                  id="days"
                  type="number"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  min="1"
                  max="365"
                  className="text-lg h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Dias para aplicação dos juros
                </p>
              </div>
            )}

            {/* Number of Installments - Hidden for daily */}
            {interestPeriod !== 'daily' && (
              <div className="space-y-2">
                <Label htmlFor="installments">Número de Parcelas</Label>
                <Input
                  id="installments"
                  type="number"
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  min="1"
                  max="120"
                  className="text-lg h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Digite o número de parcelas desejado
                </p>
              </div>
            )}

            {/* Calculate Button */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleCalculate} className="flex-1" size="lg">
                <Calculator className="mr-2 h-4 w-4" />
                Calcular
              </Button>
              <Button onClick={handleReset} variant="outline" className="flex-1" size="lg">
                <RotateCcw className="mr-2 h-4 w-4" />
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results - Only show when calculated */}
        {calculated ? (
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Resultado da Simulação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Metrics */}
              <div className="space-y-4">
                {interestPeriod !== 'daily' && (
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-primary">Valor da Parcela</span>
                    </div>
                    <p className="text-4xl font-bold text-primary">
                      {formatCurrency(loan.monthlyPayment)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {months}x parcelas
                    </p>
                  </div>
                )}

                <div className="bg-gradient-to-br from-success/10 to-success/5 p-6 rounded-xl border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-success" />
                    <span className="text-sm font-medium text-success">
                      {interestPeriod === 'daily' ? `Valor Total (${days} dias)` : 'Total a Pagar'}
                    </span>
                  </div>
                  <p className="text-4xl font-bold text-success">
                    {formatCurrency(loan.totalAmount)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Incluindo juros de {formatCurrency(loan.totalInterest)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button className="w-full" size="lg">
                  Solicitar Este Empréstimo
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm border-border/50">
            <CardContent className="py-20">
              <div className="text-center space-y-4">
                <Calculator className="w-16 h-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Preencha os dados</h3>
                  <p className="text-sm text-muted-foreground">
                    Insira os parâmetros e clique em "Calcular" para ver os resultados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Payment Table - Only show when calculated and not daily */}
      {calculated && interestPeriod !== 'daily' && (
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Cronograma de Pagamentos
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Detalhamento completo das {months} parcelas
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Parcela</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Valor da Parcela</TableHead>
                    <TableHead className="text-right">Saldo Devedor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentTable.map((row, index) => (
                    <TableRow key={row.month} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {row.month}
                            </span>
                          </div>
                          <span className="font-medium text-sm">{row.month}ª</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{row.dueDate}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-success">
                          {formatCurrency(row.paymentValue)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${row.remainingBalance <= 0 ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {row.remainingBalance <= 0 ? 'Quitado' : formatCurrency(Math.max(0, row.remainingBalance))}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Summary Footer */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Valor Emprestado</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total de Juros</p>
                  <p className="text-lg font-bold text-warning">{formatCurrency(loan.totalInterest)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total a Pagar</p>
                  <p className="text-lg font-bold text-success">{formatCurrency(loan.totalAmount)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}