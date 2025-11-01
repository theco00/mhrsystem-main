-- Add interest_type column to loans table
ALTER TABLE public.loans 
ADD COLUMN interest_type text DEFAULT 'monthly' CHECK (interest_type IN ('daily', 'weekly', 'monthly', 'total'));

-- Update existing loans to have the default interest type
UPDATE public.loans 
SET interest_type = 'monthly' 
WHERE interest_type IS NULL;