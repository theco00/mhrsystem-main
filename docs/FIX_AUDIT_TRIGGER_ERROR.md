# Fix: Erro de Exclusão - Audit Logs User ID NULL

## 🔴 Problema Identificado

Ao tentar excluir um empréstimo, o sistema retorna o erro:
```
Failed to delete table row: null value in column "user_id" of relation "audit_logs" violates not-null constraint
```

## 🔍 Causa Raiz

O trigger de auditoria (`audit_trigger_function`) usa `auth.uid()` para obter o ID do usuário. No entanto, quando a exclusão é feita via DELETE direto (como na linha 217-219 do `useLoans.ts`), o `auth.uid()` retorna `NULL`, causando a violação da constraint NOT NULL na tabela `audit_logs`.

### Código Problemático (useLoans.ts - linha 215-220):
```typescript
const { error: deletePaymentsError } = await supabase
  .from('payments')
  .delete()
  .eq('loan_id', loanId)
  .eq('user_id', user.id);
```

## ✅ Solução Implementada

Criei uma migration que modifica a função `audit_trigger_function()` para:

1. **Tentar usar `auth.uid()`** primeiro (contexto de autenticação)
2. **Fallback para `user_id` do registro** se `auth.uid()` retornar NULL
3. **Evitar inserção no audit_logs** se ambos forem NULL (previne erro)

### Arquivo de Migration
📁 `supabase/migrations/20251022000000_fix_audit_trigger_user_id.sql`

## 🚀 Como Aplicar a Correção

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto: `wgycuyrkkqwwegazgvcb`
3. Vá em **SQL Editor**
4. Copie e cole o conteúdo do arquivo:
   ```
   supabase/migrations/20251022000000_fix_audit_trigger_user_id.sql
   ```
5. Clique em **Run** para executar

### Opção 2: Via Supabase CLI

```bash
cd "c:\Users\mathe\Desktop\TitanJuros\Titan Windsurf\mhrsystem"
npx supabase db push
```

### Opção 3: Executar SQL Diretamente

Execute o seguinte SQL no seu banco de dados:

```sql
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Tentar obter user_id do contexto de autenticação
  v_user_id := auth.uid();
  
  -- Se auth.uid() retornar NULL, usar o user_id do registro
  IF v_user_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      v_user_id := OLD.user_id;
    ELSE
      v_user_id := NEW.user_id;
    END IF;
  END IF;
  
  -- Se ainda for NULL, não criar log de auditoria (evitar erro)
  IF v_user_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;
  
  -- Inserir log de auditoria para operações críticas
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values)
    VALUES (v_user_id, TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (v_user_id, TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (v_user_id, TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;
```

## 🧪 Testando a Correção

Após aplicar a migration:

1. Tente excluir um empréstimo que **não tenha pagamentos registrados**
2. O sistema deve:
   - Excluir os pagamentos pendentes associados
   - Atualizar o saldo da empresa
   - Fazer soft delete do empréstimo (marcar `deleted_at`)
   - **Criar logs de auditoria corretamente**

## 📝 Notas Técnicas

### Comportamento do Trigger Atualizado:

| Cenário | `auth.uid()` | Fallback | Resultado |
|---------|--------------|----------|-----------|
| Usuário autenticado | ✅ Retorna UUID | - | Usa `auth.uid()` |
| DELETE via service role | ❌ NULL | ✅ Usa `OLD.user_id` | Usa user_id do registro |
| Registro sem user_id | ❌ NULL | ❌ NULL | Não cria log (evita erro) |

### Tabelas Afetadas:
- ✅ `clients` (trigger: `audit_clients_trigger`)
- ✅ `loans` (trigger: `audit_loans_trigger`)
- ✅ `payments` (trigger: `audit_payments_trigger`)

## 🎯 Resultado Esperado

Após aplicar a correção, você poderá:
- ✅ Excluir empréstimos sem pagamentos registrados
- ✅ Excluir pagamentos pendentes automaticamente
- ✅ Manter auditoria completa de todas as operações
- ✅ Evitar erros de constraint NOT NULL

## 🔗 Arquivos Relacionados

- Migration: `supabase/migrations/20251022000000_fix_audit_trigger_user_id.sql`
- Hook afetado: `src/hooks/useLoans.ts` (linha 178-254)
- Trigger original: `supabase/migrations/20251014000000_database_restructure.sql` (linha 186-209)
