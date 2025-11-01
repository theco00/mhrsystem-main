import { createClient } from '@supabase/supabase-js';
import type { SupabaseAuthStorageAdapter } from '@supabase/supabase-js';
import type { Database } from '../../src/integrations/supabase/types';

// Fallbacks to repo constants if env is not provided
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pdxlmhfvwbdohouspboe.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkeGxtaGZ2d2Jkb2hvdXNwYm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3ODEwODUsImV4cCI6MjA3MzM1NzA4NX0.WuvfDokPCEp83zAtq51LDqEqF39CUp1MuSa85n2ZmTk';

// Minimal in-memory storage to avoid localStorage in Node
const storageMap = new Map<string, string>();
const memoryStorage: SupabaseAuthStorageAdapter = {
  getItem: (key: string) => (storageMap.has(key) ? storageMap.get(key)! : null),
  setItem: (key: string, value: string) => { storageMap.set(key, value); },
  removeItem: (key: string) => { storageMap.delete(key); },
};

export const supabaseTest = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: memoryStorage,
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const functionsBaseUrl = `${SUPABASE_URL}/functions/v1`;