import { useEffect } from 'react';
import { useSupabaseData } from './useSupabaseData';
import { useCompanySettings } from './useCompanySettings';

export function useLoanNotifications() {
  const { loans } = useSupabaseData();
  const { sendLoanNotification, settings } = useCompanySettings();

  useEffect(() => {
    if (!settings?.email_notifications || !loans.length) return;

    const checkForDueLoans = () => {
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      
      // Find loans due tomorrow
      const dueTomorrow = loans.filter(loan => {
        if (loan.status !== 'active' || !loan.clients?.email) return false;
        
        const paymentDate = new Date(loan.next_payment_date);
        const paymentDateOnly = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), paymentDate.getDate());
        const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
        
        return paymentDateOnly.getTime() === tomorrowOnly.getTime();
      });

      // Send notifications for loans due tomorrow
      dueTomorrow.forEach(loan => {
        if (loan.clients?.email) {
          sendLoanNotification(
            loan.clients.email,
            loan.clients.name,
            loan.amount,
            loan.installment_value,
            loan.next_payment_date
          );
        }
      });
    };

    // Check immediately
    checkForDueLoans();

    // Set up interval to check every hour
    const interval = setInterval(checkForDueLoans, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loans, settings, sendLoanNotification]);

  return null;
}