-- Add initial_balance and current_balance columns to company_settings
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS initial_balance NUMERIC DEFAULT 1000,
ADD COLUMN IF NOT EXISTS current_balance NUMERIC DEFAULT 2500;

-- Update existing records to have the default values
UPDATE public.company_settings 
SET initial_balance = 1000, current_balance = 2500 
WHERE initial_balance IS NULL OR current_balance IS NULL;