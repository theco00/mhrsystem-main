# 🧪 INSTRUÇÕES: Teste Completo de Autenticação

## 🎯 OBJETIVO
Testar e corrigir o problema onde usuários não conseguem fazer login porque seus dados não são salvos no banco.

---

## 📋 PASSO 1: APLICAR CORREÇÃO NO BANCO (OBRIGATÓRIO)

### 1.1. Acesse o SQL Editor do Supabase
1. Abra: https://supabase.com/dashboard/project/wgycuyrkkqwwegazgvcb/sql/new
2. Cole TODO o conteúdo do arquivo: `supabase/migrations/99999999999999_fix_auth_and_test.sql`
3. Clique em **RUN** (ou pressione Ctrl+Enter)
4. **Aguarde** até aparecer "Success" (pode demorar 10-30 segundos)

### 1.2. Verificar Se Aplicou Corretamente
Execute este comando:

```sql
SELECT * FROM public.diagnose_user_auth('seu-email@gmail.com');
```

**Resultado Esperado**:
```
check_type           | status  | details
---------------------|---------|------------------
user_exists          | OK      | (uuid do usuário)
profile_exists       | OK      | 
subscription_exists  | OK      | trial
```

Se algum mostrar **"MISSING"**, a correção funcionou e vai criar automaticamente no próximo login.

---

## 📋 PASSO 2: TESTE COM GOOGLE (OAuth)

### 2.1. Preparar o Teste
1. **Abra o navegador** em modo anônimo (Ctrl+Shift+N no Chrome)
2. **Abra DevTools** (F12)
3. Vá para a aba **Console**
4. Acesse: `http://localhost:8080/login`

### 2.2. Fazer Login com Google
1. Clique no botão **"Continuar com Google"**
2. **Selecione uma conta Google** (pode ser qualquer uma)
3. **Autorize** o acesso

### 2.3. Observar os Logs no Console

**Logs Esperados** (ordem correta):
```javascript
🚀 Iniciando login com Google...
✅ Redirecionando para Google...
🔐 Auth event: SIGNED_IN
✅ Login bem-sucedido: seu-email@gmail.com
```

### 2.4. Verificar Redirecionamento

**✅ SUCESSO** se:
- Você foi redirecionado para `/dashboard`
- Consegue ver seus dados no dashboard
- Não voltou para `/login`

**❌ FALHA** se:
- Voltou para a tela de login
- Ficou em loop infinito
- Console mostra erro

---

## 📋 PASSO 3: TESTE COM EMAIL/SENHA

### 3.1. Criar Nova Conta
1. Acesse: `http://localhost:8080/login`
2. Clique em **"Criar conta"**
3. Preencha:
   - Nome: `Teste Usuario`
   - Email: `teste-$(date +%s)@example.com` (usar timestamp para evitar duplicatas)
   - Senha: `senha123456`
4. Clique em **"Criar Conta"**

### 3.2. Observar os Logs

**Logs Esperados**:
```javascript
📝 Iniciando cadastro...
✅ Cadastro bem-sucedido: teste-xxx@example.com
🔐 Auth event: SIGNED_IN
✅ Login bem-sucedido: teste-xxx@example.com
```

### 3.3. Verificar Banco de Dados

Execute no SQL Editor:
```sql
SELECT 
  u.email,
  u.created_at,
  p.full_name,
  s.status as subscription_status,
  s.trial_ends_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
LEFT JOIN public.user_subscriptions s ON s.user_id = u.id
WHERE u.email LIKE 'teste-%@example.com'
ORDER BY u.created_at DESC
LIMIT 5;
```

**Resultado Esperado**:
```
email                  | created_at           | full_name      | subscription_status | trial_ends_at
-----------------------|----------------------|----------------|---------------------|-------------------
teste-xxx@example.com  | 2025-11-02 15:30:00 | Teste Usuario  | trial               | 2025-11-09 15:30:00
```

---

## 📋 PASSO 4: TESTE COM CONTA EXISTENTE

### 4.1. Fazer Logout
1. No dashboard, clique no **menu do usuário** (canto superior direito)
2. Clique em **"Sair"**

### 4.2. Fazer Login Novamente
1. Use **a mesma conta** que testou anteriormente
2. Observe se entra sem problemas
3. Verifique se os dados estão preservados

---

## 📋 PASSO 5: DIAGNÓSTICO AVANÇADO

### 5.1. Se Ainda Tiver Problema com Usuário Específico

Execute no SQL Editor:
```sql
-- Substituir 'seu-email@gmail.com' pelo email problemático
SELECT * FROM public.diagnose_user_auth('seu-email@gmail.com');
```

### 5.2. Ver Usuários Sem Perfil

```sql
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.id as profile_id,
  s.id as subscription_id
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
LEFT JOIN public.user_subscriptions s ON s.user_id = u.id
WHERE p.id IS NULL OR s.id IS NULL
ORDER BY u.created_at DESC;
```

Se aparecer algum usuário aqui, execute:

```sql
-- Corrigir manualmente (substituir USER_ID_AQUI pelo ID do usuário)
SELECT public.handle_new_user() -- Isso vai criar perfil + subscription
```

### 5.3. Ver Logs do Trigger

```sql
-- Habilitar logs de NOTICE
SET client_min_messages TO NOTICE;

-- Criar usuário de teste para ver os logs
-- (não precisa executar, apenas para referência)
```

---

## 📋 PASSO 6: TESTES COM PUPPETEER (AUTOMATIZADO)

Se preferir testar automaticamente:

### 6.1. Instalar Dependências
```bash
npm install --save-dev @playwright/test
```

### 6.2. Criar Teste E2E
Arquivo: `tests/e2e/auth.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test('deve fazer login com Google', async ({ page }) => {
  await page.goto('http://localhost:8080/login');
  
  // Clicar no botão do Google
  await page.click('text=Continuar com Google');
  
  // ... seguir fluxo OAuth
});

test('deve criar conta com email/senha', async ({ page }) => {
  await page.goto('http://localhost:8080/login');
  await page.click('text=Criar conta');
  
  const timestamp = Date.now();
  await page.fill('input[name="fullName"]', 'Teste Usuario');
  await page.fill('input[name="email"]', `teste-${timestamp}@example.com`);
  await page.fill('input[name="password"]', 'senha123456');
  
  await page.click('button[type="submit"]');
  
  // Aguardar redirecionamento
  await page.waitForURL('**/dashboard');
  
  expect(page.url()).toContain('/dashboard');
});
```

### 6.3. Rodar Testes
```bash
npx playwright test
```

---

## ✅ CHECKLIST FINAL

Após completar todos os testes, verifique:

- [ ] Migration `99999999999999_fix_auth_and_test.sql` foi aplicada
- [ ] Trigger `on_auth_user_created` existe no banco
- [ ] Login com Google funciona (não entra em loop)
- [ ] Cadastro com email/senha funciona
- [ ] Login com conta existente funciona
- [ ] Perfil é criado automaticamente
- [ ] Subscription é criada automaticamente
- [ ] Dashboard carrega corretamente após login
- [ ] Não há erros no console do navegador
- [ ] Usuários antigos têm perfis criados (via query de correção)

---

## 🆘 SE AINDA TIVER PROBLEMAS

### Execute Este Diagnóstico Completo:

```sql
-- 1. Ver estrutura da tabela profiles
\d+ public.profiles

-- 2. Ver triggers ativos
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND trigger_schema IN ('public', 'auth');

-- 3. Testar função manualmente
SELECT public.handle_new_user();

-- 4. Ver últimos erros (se houver)
SELECT * FROM pg_stat_activity 
WHERE state = 'idle in transaction (aborted)'
ORDER BY backend_start DESC;
```

### Enviar Informações Para Debug:

1. Screenshot do console com erros
2. Resultado das queries de diagnóstico
3. Email da conta que está tentando login
4. Se é Google OAuth ou Email/Senha

---

## 📞 SUPORTE ADICIONAL

**Documentação**:
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Triggers no PostgreSQL](https://www.postgresql.org/docs/current/triggers.html)

**Arquivos Relevantes**:
- `DIAGNOSTICO_AUTENTICACAO.md` - Análise técnica detalhada
- `supabase/migrations/99999999999999_fix_auth_and_test.sql` - Script de correção
- `src/contexts/AuthContext.tsx` - Lógica de autenticação frontend
- `src/hooks/useSubscription.ts` - Verificação de subscription

---

**Última Atualização**: 02/11/2025  
**Versão**: 1.0  
**Status**: Pronto para Teste
