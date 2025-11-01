-- Clear payments data to clean the platform
DELETE FROM public.payments WHERE status IN ('pending', 'overdue');

-- Reset loan remaining amounts to original amount to clean the platform
UPDATE public.loans SET remaining_amount = amount WHERE status = 'active';