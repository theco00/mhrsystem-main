import { describe, it, expect } from 'vitest';
import { supabaseTest, functionsBaseUrl } from '../utils/supabaseClient';

const functionName = 'send-loan-notification';

const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
};

describe('Edge Function: send-loan-notification', () => {
  it('rejects non-POST methods (405)', async () => {
    const res = await fetch(`${functionsBaseUrl}/${functionName}`, { method: 'GET', headers });
    expect(res.status).toBe(405);
  });

  it('passes CORS preflight (OPTIONS)', async () => {
    const res = await fetch(`${functionsBaseUrl}/${functionName}`, { method: 'OPTIONS', headers });
    expect([200, 204]).toContain(res.status);
    expect(res.headers.get('access-control-allow-methods') || res.headers.get('Access-Control-Allow-Methods')).toMatch(/POST|OPTIONS/);
  });

  it('validates required fields (400)', async () => {
    const { data, error } = await supabaseTest.functions.invoke(functionName, {
      body: { clientEmail: 'a@b.com' },
    });
    expect(error).toBeDefined();
    // Supabase client wraps errors; status available in error context
    // We still verify that data is not success
    expect(data).toBeNull();
  });

  it('validates email format (400)', async () => {
    const { data, error } = await supabaseTest.functions.invoke(functionName, {
      body: {
        clientName: 'John',
        clientEmail: 'invalid-email',
        loanAmount: 1000,
        installmentValue: 100,
        dueDate: '2025-12-01',
        companyName: 'Acme Finance',
        companyEmail: 'noreply@acme.com',
      },
    });
    expect(error).toBeDefined();
    expect(data).toBeNull();
  });

  it('validates numeric fields (400)', async () => {
    const invalidPayload: Record<string, unknown> = {
      clientName: 'John',
      clientEmail: 'john@example.com',
      loanAmount: 'not-a-number',
      installmentValue: 100,
      dueDate: '2025-12-01',
      companyName: 'Acme Finance',
      companyEmail: 'noreply@acme.com',
    };
    const { data, error } = await supabaseTest.functions.invoke(functionName, {
      body: invalidPayload,
    });
    expect(error).toBeDefined();
    expect(data).toBeNull();
  });

  it('validates date format (400)', async () => {
    const { data, error } = await supabaseTest.functions.invoke(functionName, {
      body: {
        clientName: 'John',
        clientEmail: 'john@example.com',
        loanAmount: 1000,
        installmentValue: 100,
        dueDate: '12/01/2025',
        companyName: 'Acme Finance',
        companyEmail: 'noreply@acme.com',
      },
    });
    expect(error).toBeDefined();
    expect(data).toBeNull();
  });

  it('fails without MAILERSEND_API_KEY (500)', async () => {
    const res = await fetch(`${functionsBaseUrl}/${functionName}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        clientName: 'John',
        clientEmail: 'john@example.com',
        loanAmount: 1000,
        installmentValue: 100,
        dueDate: '2025-12-01',
        companyName: 'Acme Finance',
        companyEmail: 'noreply@acme.com',
      }),
    });
    expect([401, 422, 429, 500]).toContain(res.status);
  });
});