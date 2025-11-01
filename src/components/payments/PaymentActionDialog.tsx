import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  DollarSign, 
  Calendar, 
  User, 
  Check,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Loan, useSupabaseData } from '@/hooks/useSupabaseData';

interface PaymentActionDialogProps {
  loan: Loan | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentConfirmed: (loanId: string, amount: number) => void;
}

export function PaymentActionDialog({ 
  loan, 
  isOpen, 
  onClose, 
  onPaymentConfirmed 
}: PaymentActionDialogProps) {
  const { addPayment, renewLoanDate, payments, refetch } = useSupabaseData();
  const [paymentType, setPaymentType] = useState<'full' | 'minimum'>('full');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!loan) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  // Calculate interest amount based on loan type
  const calculateInterestAmount = () => {
    const { interest_rate, remaining_amount, interest_type } = loan;
    
    switch (interest_type) {
      case 'daily':
        return (remaining_amount * interest_rate / 100);
      case 'weekly':
        return (remaining_amount * interest_rate / 100);
      case 'monthly':
        return (remaining_amount * interest_rate / 100);
      case 'total':
        return (remaining_amount * interest_rate / 100) / loan.installments;
      default:
        return (remaining_amount * interest_rate / 100);
    }
  };

  const interestAmount = calculateInterestAmount();
  const paymentAmount = paymentType === 'minimum' ? interestAmount : 
                       paymentType === 'full' && customAmount ? parseFloat(customAmount) : 
                       loan.installment_value;

  const handleConfirmPayment = async () => {
    if (paymentType === 'full' && (!customAmount || parseFloat(customAmount) <= 0)) return;
    
    setIsProcessing(true);
    
    try {
      if (paymentType === 'minimum') {
        // Renew loan date with interest payment
        const result = await renewLoanDate(loan.id, interestAmount);
        if (result) {
          onPaymentConfirmed(loan.id, interestAmount);
        }
      } else {
        // Full payment
        const loanPayments = payments.filter(p => p.loan_id === loan.id);
        const nextInstallmentNumber = loanPayments.length + 1;
        
        const paymentResult = await addPayment({
          loan_id: loan.id,
          amount: parseFloat(customAmount),
          payment_date: new Date().toISOString().split('T')[0],
          installment_number: nextInstallmentNumber,
          status: 'paid',
        });

        if (paymentResult) {
          console.log('[PaymentActionDialog] Pagamento confirmado, chamando callbacks...');
          
          // Aguardar um pouco para garantir que o banco foi atualizado
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Forçar refetch completo
          console.log('[PaymentActionDialog] Forçando refetch completo...');
          await refetch();
          console.log('[PaymentActionDialog] Refetch concluído');
          
          // Chamar callback do componente pai
          onPaymentConfirmed(loan.id, parseFloat(customAmount));
        }
      }
      
      // Reset form
      setCustomAmount('');
      setPaymentNotes('');
      setPaymentType('full');
      onClose();
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isFullPayment = paymentType === 'full' && parseFloat(customAmount) >= loan.remaining_amount;
  const remainingAfterPayment = paymentType === 'full' ? 
    loan.remaining_amount - (parseFloat(customAmount) || 0) : 
    loan.remaining_amount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Registrar Pagamento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {/* Loan Info */}
          <div className="bg-secondary/20 p-2 rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                {loan.clients?.name}
              </h3>
              <Badge variant={loan.status === 'active' ? 'default' : 'secondary'}>
                {loan.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Valor Original</p>
                <p className="font-semibold">{formatCurrency(loan.amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Saldo Devedor</p>
                <p className="font-semibold text-warning">{formatCurrency(loan.remaining_amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Valor da Parcela</p>
                <p className="font-semibold">{formatCurrency(loan.installment_value)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Próximo Vencimento</p>
                <p className="font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(loan.next_payment_date)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Options */}
          <div className="space-y-2">
            <Label className="text-sm">Tipo de Pagamento</Label>
            <RadioGroup value={paymentType} onValueChange={(value: 'full' | 'minimum') => setPaymentType(value)}>
              <div className="flex items-center space-x-2 p-1.5 border rounded hover:bg-secondary/50">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="flex-1 cursor-pointer">
                  <div className="font-medium text-sm">Pagamento Total</div>
                  <div className="text-xs text-muted-foreground">
                    Pagar valor da parcela ou valor personalizado
                  </div>
                </Label>
                <Check className="w-4 h-4 text-success" />
              </div>
              
              <div className="flex items-center space-x-2 p-1.5 border rounded hover:bg-secondary/50">
                <RadioGroupItem value="minimum" id="minimum" />
                <Label htmlFor="minimum" className="flex-1 cursor-pointer">
                  <div className="font-medium text-sm">Pagamento Mínimo (Juros)</div>
                  <div className="text-xs text-muted-foreground">
                    Pagar apenas os juros: {formatCurrency(interestAmount)}
                  </div>
                </Label>
                <RefreshCw className="w-4 h-4 text-warning" />
              </div>
            </RadioGroup>
          </div>

          {paymentType === 'full' && (
            <div className="space-y-2">
                <div className="space-y-1">
                <Label htmlFor="customAmount" className="text-sm">Valor do Pagamento *</Label>
                <Input
                  id="customAmount"
                  type="number"
                  placeholder="0.00"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  step="0.01"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomAmount(loan.installment_value.toString())}
                  >
                    Parcela ({formatCurrency(loan.installment_value)})
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomAmount(loan.remaining_amount.toString())}
                  >
                    Quitação ({formatCurrency(loan.remaining_amount)})
                  </Button>
                </div>
              </div>

                {customAmount && (
                <div className="bg-primary/5 p-2 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    {isFullPayment ? (
                      <>
                        <Check className="w-4 h-4 text-success" />
                        <span className="font-medium text-success text-sm">Quitação Total</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        <span className="font-medium text-warning text-sm">Pagamento Parcial</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs space-y-0.5">
                    <p>Valor a pagar: <span className="font-semibold">{formatCurrency(parseFloat(customAmount))}</span></p>
                    {!isFullPayment && (
                      <p>Saldo restante: <span className="font-semibold text-warning">{formatCurrency(remainingAfterPayment)}</span></p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {paymentType === 'minimum' && (
            <div className="bg-warning/5 border border-warning/20 p-2 rounded">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="w-4 h-4 text-warning" />
                <span className="font-medium text-warning text-sm">Renovação do Empréstimo</span>
              </div>
              <div className="text-xs space-y-1">
                <p>• Valor dos juros: <span className="font-semibold">{formatCurrency(interestAmount)}</span></p>
                <p>• A data de vencimento será renovada para o próximo mês</p>
                <p>• O saldo devedor permanecerá: <span className="font-semibold">{formatCurrency(loan.remaining_amount)}</span></p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="paymentNotes" className="text-sm">Observações (opcional)</Label>
            <Textarea
              id="paymentNotes"
              placeholder="Observações sobre o pagamento..."
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              rows={1}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-1">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmPayment}
              disabled={
                (paymentType === 'full' && (!customAmount || parseFloat(customAmount) <= 0)) || 
                isProcessing
              }
              className="min-w-[120px]"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Processando...
                </div>
              ) : (
                <>
                  {paymentType === 'minimum' ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Renovar Empréstimo
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Confirmar Pagamento
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}