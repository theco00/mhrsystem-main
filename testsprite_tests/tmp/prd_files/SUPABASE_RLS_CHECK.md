# Verificação de Políticas RLS do Supabase - TitanJuros

## ⚠️ PROBLEMA IDENTIFICADO
O empréstimo não está sendo excluído mesmo após confirmação. Isso pode ser causado por políticas RLS (Row Level Security) bloqueando a operação de UPDATE/DELETE.

## 🔍 PASSOS PARA VERIFICAR NO SUPABASE

### 1. Acesse o Painel do Supabase
- Vá para: https://supabase.com/dashboard
- Faça login na sua conta
- Selecione o projeto **TitanJuros**

### 2. Verifique as Políticas RLS da Tabela `loans`

#### 2.1 Navegue até a tabela
1. No menu lateral, clique em **"Table Editor"**
2. Selecione a tabela **`loans`**
3. Clique na aba **"Policies"** (ou "RLS")

#### 2.2 Verifique se existe política de UPDATE
Você deve ter uma política similar a esta:

```sql
-- Política para UPDATE (incluindo soft delete)
CREATE POLICY "Users can update their own loans"
ON loans
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

#### 2.3 Se a política NÃO existir, crie uma nova:

```sql
-- Habilitar RLS (se ainda não estiver habilitado)
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- Política para SELECT
CREATE POLICY "Users can view their own loans"
ON loans
FOR SELECT
USING (auth.uid() = user_id);

-- Política para INSERT
CREATE POLICY "Users can insert their own loans"
ON loans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE (IMPORTANTE para exclusão)
CREATE POLICY "Users can update their own loans"
ON loans
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política para DELETE (caso queira permitir exclusão permanente)
CREATE POLICY "Users can delete their own loans"
ON loans
FOR DELETE
USING (auth.uid() = user_id);
```

### 3. Verifique as Políticas da Tabela `payments`

A exclusão de empréstimos também exclui pagamentos pendentes, então verifique:

```sql
-- Política para DELETE de pagamentos
CREATE POLICY "Users can delete their own payments"
ON payments
FOR DELETE
USING (auth.uid() = user_id);
```

### 4. Verifique as Políticas da Tabela `company_settings`

O saldo é atualizado ao excluir empréstimos:

```sql
-- Política para UPDATE de configurações
CREATE POLICY "Users can update their own settings"
ON company_settings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

## 🛠️ COMO APLICAR AS POLÍTICAS

### Opção 1: Via Interface do Supabase
1. Vá em **"SQL Editor"** no menu lateral
2. Cole o SQL acima
3. Clique em **"Run"**

### Opção 2: Via Linha de Comando (se tiver acesso)
```bash
supabase db push
```

## 📊 TESTE APÓS APLICAR

1. Abra o **Console do Navegador** (F12)
2. Vá na aba **"Console"**
3. Tente excluir um empréstimo
4. Observe os logs que começam com `[deleteLoan]`

### Logs Esperados (Sucesso):
```
[deleteLoan] Iniciando exclusão do empréstimo: xxx-xxx-xxx
[deleteLoan] Buscando empréstimo...
[deleteLoan] Empréstimo encontrado: {...}
[deleteLoan] Verificando pagamentos...
[deleteLoan] Pagamentos encontrados: 0
[deleteLoan] Atualizando saldo do caixa...
[deleteLoan] Novo saldo: 10000
[deleteLoan] Saldo atualizado com sucesso
[deleteLoan] Marcando empréstimo como excluído...
[deleteLoan] Empréstimo marcado como excluído com sucesso
[deleteLoan] Recarregando lista de empréstimos...
[deleteLoan] Exclusão concluída com sucesso!
```

### Logs de Erro (Problema RLS):
```
[deleteLoan] Erro ao marcar como excluído: {
  code: "42501",
  message: "new row violates row-level security policy"
}
```

## 🔧 CORREÇÕES APLICADAS NO CÓDIGO

1. ✅ Adicionados logs detalhados em cada etapa
2. ✅ Corrigidos caracteres corrompidos nas mensagens
3. ✅ Melhor tratamento de erros
4. ✅ Validação de cada operação no Supabase

## 📝 NOTAS IMPORTANTES

- O sistema usa **soft delete** (marca `deleted_at` ao invés de excluir permanentemente)
- Empréstimos com pagamentos realizados **não podem** ser excluídos
- O saldo do caixa é **devolvido** ao excluir um empréstimo
- Pagamentos pendentes são **excluídos automaticamente**

## 🆘 SE O PROBLEMA PERSISTIR

1. Copie todos os logs do console
2. Verifique se há mensagens de erro específicas
3. Compartilhe os logs para análise mais detalhada
4. Verifique se o usuário está autenticado corretamente
