# 📊 Análise Completa do Banco de Dados - Tiger System

## 🔍 Estrutura Atual Identificada

### 📋 Tabelas Principais

#### 1. **clients** (Clientes)
```sql
- id: UUID (PK)
- user_id: UUID (FK -> auth.users)
- name: TEXT
- cpf: TEXT (UNIQUE)
- email: TEXT
- phone: TEXT
- address: TEXT
- income: DECIMAL(12,2)
- credit_score: INTEGER
- status: TEXT ('active', 'inactive')
- deleted_at: TIMESTAMP (soft delete)
- created_at, updated_at: TIMESTAMP
```

#### 2. **loans** (Empréstimos)
```sql
- id: UUID (PK)
- user_id: UUID (FK -> auth.users)
- client_id: UUID (FK -> clients)
- amount: DECIMAL(12,2)
- interest_rate: DECIMAL(5,2)
- installments: INTEGER
- installment_value: DECIMAL(12,2)
- start_date: DATE
- status: TEXT ('active', 'paid', 'overdue')
- remaining_amount: DECIMAL(12,2)
- next_payment_date: DATE
- interest_type: TEXT ('daily', 'weekly', 'monthly', 'total')
- deleted_at: TIMESTAMP (soft delete)
- created_at, updated_at: TIMESTAMP
```

#### 3. **payments** (Pagamentos)
```sql
- id: UUID (PK)
- user_id: UUID (FK -> auth.users)
- loan_id: UUID (FK -> loans)
- amount: DECIMAL(12,2)
- payment_date: DATE
- installment_number: INTEGER
- status: TEXT ('paid', 'pending', 'overdue')
- created_at, updated_at: TIMESTAMP
```

#### 4. **profiles** (Perfis de Usuário)
```sql
- id: UUID (PK)
- user_id: UUID (FK -> auth.users) UNIQUE
- full_name: TEXT
- company_name: TEXT
- phone: TEXT
- avatar_url: TEXT
- created_at, updated_at: TIMESTAMP
```

#### 5. **user_roles** (Roles de Usuário)
```sql
- id: UUID (PK)
- user_id: UUID (FK -> auth.users)
- role: app_role ENUM ('admin', 'user')
- created_at, updated_at: TIMESTAMP
- UNIQUE(user_id, role)
```

#### 6. **company_settings** (Configurações da Empresa)
```sql
- id: UUID (PK)
- user_id: UUID (FK -> auth.users)
- company_name: TEXT
- company_email: TEXT
- company_phone: TEXT
- email_notifications: BOOLEAN
- sms_notifications: BOOLEAN
- whatsapp_notifications: BOOLEAN
- initial_balance: NUMERIC
- current_balance: NUMERIC
- created_at, updated_at: TIMESTAMP
```

#### 7. **audit_logs** (Logs de Auditoria)
```sql
- id: UUID (PK)
- user_id: UUID
- action: TEXT
- table_name: TEXT
- record_id: UUID
- old_values: JSONB
- new_values: JSONB
- created_at: TIMESTAMP
```

### 🔧 Funções e Stored Procedures Identificadas

#### ✅ **Funções Utilizadas e Bem Configuradas**

1. **`update_updated_at_column()`**
   - **Uso**: Trigger para atualizar automaticamente `updated_at`
   - **Status**: ✅ Ativa e utilizada em todas as tabelas
   - **Configuração**: ✅ SECURITY DEFINER com search_path correto

2. **`handle_new_user()`**
   - **Uso**: Criar perfil automaticamente quando usuário se registra
   - **Status**: ✅ Ativa e utilizada
   - **Configuração**: ✅ SECURITY DEFINER com search_path correto

3. **`has_role(_user_id, _role)`**
   - **Uso**: Verificar se usuário tem role específica
   - **Status**: ✅ Ativa e utilizada nas políticas RLS
   - **Configuração**: ✅ SECURITY DEFINER com search_path correto

4. **`get_user_roles(_user_id)`**
   - **Uso**: Obter array de roles do usuário
   - **Status**: ⚠️ Definida mas não utilizada no código frontend
   - **Configuração**: ✅ SECURITY DEFINER com search_path correto

### 🚨 Problemas Identificados

#### 1. **Migrações Duplicadas** ❌
- `20250913171012` e `20250913171028`: Conteúdo idêntico
- `20250913173854` e `20250913174035`: Conteúdo idêntico  
- `20250917003056` e `20250917003113`: Conteúdo idêntico
- **Impacto**: Confusão e possíveis conflitos

#### 2. **Função Não Utilizada** ⚠️
- `get_user_roles()`: Definida mas não chamada no código
- **Recomendação**: Remover ou implementar uso

#### 3. **Falta de Índices Otimizados** ⚠️
- Apenas índices básicos em `audit_logs`
- Faltam índices compostos para consultas frequentes
- **Impacto**: Performance degradada

#### 4. **Inconsistências de Nomenclatura** ⚠️
- Mistura de snake_case e camelCase em alguns campos
- **Exemplo**: `user_id` vs `userId` em interfaces TypeScript

#### 5. **Políticas RLS Inconsistentes** ⚠️
- `payments`: Sem políticas UPDATE/DELETE (por segurança)
- Outras tabelas: Políticas completas
- **Status**: Intencional para compliance financeiro

#### 6. **Edge Functions com Problemas** ❌
- `send-loan-notification`: RESEND_API_KEY não configurada
- `send-whatsapp`: Configuração incompleta
- **Status**: Parcialmente funcionais

### 📈 Uso das Funções no Código

#### **Funções do Supabase Utilizadas**
1. `supabase.functions.invoke('send-loan-notification')` - useCompanySettings.ts
2. `supabase.functions.invoke('send-whatsapp')` - useSupabaseData.ts

#### **Consultas Diretas Mais Frequentes**
1. `supabase.from('clients').select()` - Múltiplos hooks
2. `supabase.from('loans').select()` - Múltiplos hooks  
3. `supabase.from('payments').select()` - Múltiplos hooks
4. `supabase.from('company_settings').select()` - useCompanySettings.ts
5. `supabase.from('user_roles').select()` - useUserRoles.ts

### 🎯 Recomendações de Reestruturação

#### **Alta Prioridade**
1. ❌ Remover migrações duplicadas
2. ❌ Remover função `get_user_roles()` não utilizada
3. ✅ Adicionar índices compostos otimizados
4. ✅ Consolidar estrutura em migração única

#### **Média Prioridade**
1. ⚠️ Padronizar nomenclatura
2. ⚠️ Reorganizar funções por categoria
3. ⚠️ Melhorar documentação das políticas RLS

#### **Baixa Prioridade**
1. 📝 Documentar relacionamentos
2. 📝 Criar views para consultas complexas
3. 📝 Implementar triggers de auditoria automática

---

**Data da Análise**: 14/10/2025  
**Status**: 🔍 Análise Completa - Pronto para Reestruturação