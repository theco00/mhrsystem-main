# Troubleshooting - Problema de Pagamento TitanJuros

## ⚠️ PROBLEMA IDENTIFICADO
O pagamento não está sendo registrado. O diálogo não fecha e o pagamento não é computado.

## 🔍 CORREÇÕES APLICADAS

### 1. Logs Detalhados Adicionados
Agora todas as etapas do processo de pagamento são logadas no console:

#### Para Pagamento Total (`addPayment`):
- ✅ Inserção do pagamento no banco
- ✅ Atualização do saldo do caixa
- ✅ Atualização do empréstimo (saldo restante, status, próxima data)
- ✅ Recarregamento da lista de pagamentos

#### Para Pagamento de Juros (`renewLoanDate`):
- ✅ Atualização da data de vencimento
- ✅ Adição dos juros ao saldo
- ✅ Registro do pagamento de juros
- ✅ Recarregamento da lista de pagamentos

### 2. Políticas RLS Verificadas
Todas as políticas necessárias estão ativas:

```sql
✅ Users can insert their own payments (INSERT)
✅ Users can view their own payments (SELECT)
✅ Users can update their own payments (UPDATE)
✅ Users can delete their own payments (DELETE)
```

## 🧪 COMO TESTAR

### Passo 1: Abrir o Console
1. Pressione **F12** no navegador
2. Vá na aba **Console**
3. Limpe o console (ícone 🚫 ou Ctrl+L)

### Passo 2: Tentar Fazer um Pagamento
1. Clique em **"Pagar"** em um empréstimo
2. Escolha o tipo de pagamento:
   - **Pagamento Total**: Digite o valor e clique em "Confirmar Pagamento"
   - **Pagamento Mínimo (Juros)**: Clique em "Renovar Empréstimo"

### Passo 3: Observar os Logs

#### ✅ Logs de Sucesso (Pagamento Total):
```
[addPayment] Iniciando registro de pagamento: {loan_id: "...", amount: 1000, ...}
[addPayment] Dados do empréstimo: {id: "...", amount: 5000, ...}
[addPayment] Inserindo pagamento no banco...
[addPayment] Pagamento inserido com sucesso: {id: "...", amount: 1000}
[addPayment] Atualizando saldo do caixa...
[addPayment] Novo saldo: 15000
[addPayment] Saldo atualizado com sucesso
[addPayment] Atualizando dados do empréstimo...
[addPayment] Saldo restante: 4000
[addPayment] Total de parcelas pagas: 1
[addPayment] Novo status do empréstimo: active
[addPayment] Empréstimo atualizado com sucesso
[addPayment] Recarregando lista de pagamentos...
[addPayment] Pagamento registrado com sucesso!
```

#### ✅ Logs de Sucesso (Pagamento de Juros):
```
[renewLoanDate] Iniciando renovação de empréstimo: xxx-xxx-xxx
[renewLoanDate] Valor dos juros: 150
[renewLoanDate] Atualizando data de vencimento...
[renewLoanDate] Nova data: 2025-11-25
[renewLoanDate] Data atualizada com sucesso
[renewLoanDate] Atualizando saldo do caixa...
[renewLoanDate] Novo saldo: 15150
[renewLoanDate] Saldo atualizado com sucesso
[renewLoanDate] Registrando pagamento de juros...
[renewLoanDate] Pagamento registrado com sucesso
[renewLoanDate] Recarregando lista de pagamentos...
[renewLoanDate] Renovação concluída com sucesso!
```

#### ❌ Logs de Erro (Exemplo):
```
[addPayment] Erro ao inserir pagamento: {
  code: "42501",
  message: "new row violates row-level security policy"
}
```

## 🔧 POSSÍVEIS CAUSAS E SOLUÇÕES

### Causa 1: Erro de Política RLS
**Sintoma:** Log mostra erro `42501` ou "violates row-level security policy"

**Solução:** As políticas já foram aplicadas, mas verifique se o usuário está autenticado:
```javascript
// No console, execute:
console.log('User:', await supabase.auth.getUser());
```

### Causa 2: Erro de Validação
**Sintoma:** Diálogo não fecha, mas não há erro no console

**Solução:** Verifique se:
- O valor do pagamento é maior que 0
- O campo de valor está preenchido (para pagamento total)
- O empréstimo existe e está ativo

### Causa 3: Erro de Conexão
**Sintoma:** Log mostra erro de rede ou timeout

**Solução:** 
- Verifique sua conexão com a internet
- Verifique se o Supabase está online
- Tente recarregar a página

### Causa 4: Erro no Cálculo
**Sintoma:** Pagamento é registrado mas valores estão errados

**Solução:** Verifique os logs para ver:
- `[addPayment] Saldo restante:` - deve ser correto
- `[addPayment] Total de parcelas pagas:` - deve incrementar
- `[addPayment] Novo status do empréstimo:` - deve ser 'paid' se quitado

## 📊 VERIFICAÇÃO MANUAL NO SUPABASE

Se o problema persistir, verifique diretamente no banco:

### 1. Verificar se o pagamento foi inserido
```sql
SELECT * FROM payments 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC 
LIMIT 5;
```

### 2. Verificar se o empréstimo foi atualizado
```sql
SELECT id, remaining_amount, status, next_payment_date 
FROM loans 
WHERE user_id = auth.uid() 
AND id = 'SEU_LOAN_ID';
```

### 3. Verificar se o saldo foi atualizado
```sql
SELECT current_balance 
FROM company_settings 
WHERE user_id = auth.uid();
```

## 🆘 SE O PROBLEMA PERSISTIR

1. **Copie TODOS os logs do console** (desde `[addPayment]` ou `[renewLoanDate]`)
2. **Tire um print da tela** mostrando o diálogo de pagamento
3. **Verifique se há mensagens de erro** em vermelho no console
4. **Compartilhe as informações** para análise detalhada

## 📝 INFORMAÇÕES TÉCNICAS

### Fluxo de Pagamento Total:
1. Inserir registro na tabela `payments`
2. Atualizar `current_balance` em `company_settings` (+ valor pago)
3. Atualizar `remaining_amount`, `status` e `next_payment_date` em `loans`
4. Recarregar lista de pagamentos
5. Fechar diálogo

### Fluxo de Pagamento de Juros:
1. Atualizar `next_payment_date` em `loans` (+ 1 mês)
2. Atualizar `current_balance` em `company_settings` (+ juros)
3. Inserir registro na tabela `payments` (installment_number = 0)
4. Recarregar lista de pagamentos
5. Fechar diálogo

## ✅ CHECKLIST DE VERIFICAÇÃO

- [ ] Console aberto e limpo
- [ ] Tentativa de pagamento realizada
- [ ] Logs aparecem no console
- [ ] Mensagem de sucesso ou erro aparece
- [ ] Diálogo fecha automaticamente (se sucesso)
- [ ] Empréstimo atualizado na lista
- [ ] Saldo do caixa atualizado
