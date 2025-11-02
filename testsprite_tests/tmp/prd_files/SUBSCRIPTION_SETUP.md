# 🔐 Sistema de Controle de Acesso por Assinatura

## 📋 Visão Geral

Sistema implementado para controlar acesso ao dashboard baseado em pagamento/assinatura ativa.

---

## 🗄️ Passo 1: Criar Tabela no Supabase

### **Acesse o Supabase:**
1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto: **TitanJuros**
3. Clique em **SQL Editor** no menu lateral

### **Execute o SQL:**
1. Clique em **"New Query"**
2. Copie todo o conteúdo do arquivo: `supabase/migrations/create_user_subscriptions.sql`
3. Cole no editor
4. Clique em **"Run"** (ou pressione Ctrl+Enter)
5. Aguarde confirmação: ✅ **Success. No rows returned**

### **Verificar se criou:**
1. Vá em **Table Editor**
2. Procure pela tabela: `user_subscriptions`
3. Deve aparecer com as colunas:
   - id
   - user_id
   - status
   - plan_type
   - payment_id
   - payment_date
   - expiry_date
   - created_at
   - updated_at

---

## 🧪 Passo 2: Testar o Sistema

### **Teste 1: Usuário SEM Assinatura**

1. **Faça logout** (se estiver logado)
2. **Faça login** com Google
3. **Resultado esperado:**
   - ✅ Redireciona para `/subscription-required`
   - ✅ Mostra página de assinatura
   - ✅ Botão "Assinar Agora"
   - ❌ NÃO acessa dashboard

### **Teste 2: Criar Assinatura Manualmente (Para Teste)**

1. Vá no **Supabase** → **Table Editor** → `user_subscriptions`
2. Clique em **"Insert"** → **"Insert row"**
3. Preencha:
   ```
   user_id: [SEU_USER_ID] (copie do auth.users)
   status: active
   plan_type: monthly
   expiry_date: 2025-12-31 23:59:59 (data futura)
   ```
4. Clique em **"Save"**

### **Teste 3: Usuário COM Assinatura**

1. **Recarregue a página** (F5)
2. **Resultado esperado:**
   - ✅ Redireciona para `/dashboard`
   - ✅ Acessa dashboard normalmente
   - ✅ Todas as funcionalidades disponíveis

---

## 🔄 Passo 3: Integrar com Cakto (Webhook)

### **Configurar Webhook no Cakto:**

1. **Acesse o painel do Cakto**
2. **Vá em Configurações** → **Webhooks**
3. **Adicione novo webhook:**
   ```
   URL: https://[SEU_PROJETO].supabase.co/functions/v1/handle-payment-webhook
   Eventos: payment.approved
   ```

### **Criar Edge Function no Supabase:**

1. **Instale Supabase CLI** (se não tiver):
   ```bash
   npm install -g supabase
   ```

2. **Faça login:**
   ```bash
   supabase login
   ```

3. **Crie a função:**
   ```bash
   supabase functions new handle-payment-webhook
   ```

4. **Cole o código** (vou criar o arquivo)

5. **Deploy:**
   ```bash
   supabase functions deploy handle-payment-webhook
   ```

---

## 📊 Fluxo Completo

```
┌─────────────────────────────────────────────┐
│ 1. Usuário faz login com Google            │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 2. ProtectedRoute verifica assinatura      │
│    - Hook useSubscription consulta DB      │
│    - Verifica status e expiry_date         │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌───────────────┐   ┌──────────────────┐
│ TEM ASSINATURA│   │ NÃO TEM ASSINATURA│
│   ATIVA       │   │                  │
└───────┬───────┘   └────────┬─────────┘
        │                    │
        ▼                    ▼
┌───────────────┐   ┌──────────────────┐
│ ✅ ACESSA     │   │ ❌ BLOQUEIA      │
│   /dashboard  │   │   /dashboard     │
│               │   │                  │
│ Todas as      │   │ Redireciona para │
│ funcionalidades│   │ /subscription-   │
│               │   │   required       │
└───────────────┘   └──────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Página de        │
                  │ Assinatura       │
                  │                  │
                  │ [Assinar Agora]  │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Redireciona para │
                  │ Cakto            │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Usuário paga     │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Webhook do Cakto │
                  │ notifica Supabase│
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Edge Function    │
                  │ atualiza DB      │
                  │ status: active   │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Usuário recarrega│
                  │ página           │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ ✅ ACESSA        │
                  │   Dashboard      │
                  └──────────────────┘
```

---

## 🛡️ Segurança Implementada

### **Row Level Security (RLS):**
- ✅ Usuário só vê sua própria assinatura
- ✅ Apenas admins podem modificar assinaturas
- ✅ Proteção contra acesso não autorizado

### **Verificação em Tempo Real:**
- ✅ Listener do Supabase detecta mudanças
- ✅ Atualização automática quando assinatura muda
- ✅ Não precisa recarregar página manualmente

### **Validação de Expiração:**
- ✅ Verifica data de expiração automaticamente
- ✅ Bloqueia acesso se expirou
- ✅ Função SQL `is_subscription_active()`

---

## 📝 Estrutura de Arquivos Criados

```
src/
├── hooks/
│   └── useSubscription.ts              ✅ Hook para verificar assinatura
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx          ✅ Componente de proteção de rotas
│   └── subscription/
│       └── SubscriptionRequired.tsx    ✅ Página de assinatura necessária
├── App.tsx                             ✅ Atualizado com rotas protegidas
└── supabase/
    └── migrations/
        └── create_user_subscriptions.sql ✅ SQL para criar tabela
```

---

## 🎯 Casos de Uso

### **Caso 1: Novo Usuário (Primeira Vez)**
```
1. Faz login com Google
2. Sistema verifica: SEM assinatura
3. Redireciona para /subscription-required
4. Vê página com preço e benefícios
5. Clica "Assinar Agora"
6. Vai para Cakto
7. Paga R$ 29,99
8. Webhook atualiza assinatura
9. Volta para sistema
10. Recarrega página
11. ✅ Acessa dashboard
```

### **Caso 2: Usuário Existente com Assinatura Ativa**
```
1. Faz login com Google
2. Sistema verifica: TEM assinatura ativa
3. ✅ Acessa dashboard diretamente
```

### **Caso 3: Assinatura Expirada**
```
1. Faz login com Google
2. Sistema verifica: Assinatura EXPIRADA
3. Redireciona para /subscription-required
4. Precisa renovar
```

### **Caso 4: Admin Ativa Assinatura Manualmente**
```
1. Admin acessa Supabase
2. Vai em user_subscriptions
3. Insere/atualiza registro
4. Define status: active
5. Define expiry_date: data futura
6. Usuário recarrega página
7. ✅ Acessa dashboard
```

---

## 🔧 Comandos Úteis

### **Verificar Assinatura de um Usuário:**
```sql
SELECT * FROM user_subscriptions 
WHERE user_id = 'USER_ID_AQUI';
```

### **Ativar Assinatura Manualmente:**
```sql
INSERT INTO user_subscriptions (user_id, status, plan_type, expiry_date)
VALUES (
  'USER_ID_AQUI',
  'active',
  'monthly',
  '2025-12-31 23:59:59'
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  status = 'active',
  expiry_date = '2025-12-31 23:59:59',
  updated_at = NOW();
```

### **Desativar Assinatura:**
```sql
UPDATE user_subscriptions 
SET status = 'inactive', updated_at = NOW()
WHERE user_id = 'USER_ID_AQUI';
```

### **Ver Todas as Assinaturas Ativas:**
```sql
SELECT 
  u.email,
  s.status,
  s.plan_type,
  s.expiry_date,
  s.created_at
FROM user_subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE s.status = 'active'
ORDER BY s.created_at DESC;
```

---

## ✅ Checklist de Implementação

- [x] Hook `useSubscription` criado
- [x] Componente `SubscriptionRequired` criado
- [x] Componente `ProtectedRoute` criado
- [x] `App.tsx` atualizado com rotas protegidas
- [x] SQL para criar tabela criado
- [ ] **VOCÊ PRECISA**: Executar SQL no Supabase
- [ ] **VOCÊ PRECISA**: Testar fluxo completo
- [ ] **OPCIONAL**: Configurar webhook do Cakto
- [ ] **OPCIONAL**: Criar Edge Function

---

## 🆘 Troubleshooting

### **Erro: "user_subscriptions does not exist"**
**Solução**: Execute o SQL no Supabase (Passo 1)

### **Usuário não consegue acessar dashboard mesmo com assinatura**
**Solução**: 
1. Verifique no Supabase se o registro existe
2. Verifique se `status = 'active'`
3. Verifique se `expiry_date` é futura
4. Recarregue a página (F5)

### **Página fica em loop de carregamento**
**Solução**:
1. Abra console (F12)
2. Veja erros
3. Provavelmente tabela não existe
4. Execute SQL

---

## 📞 Próximos Passos

1. ✅ **Execute o SQL** no Supabase
2. ✅ **Teste** com seu usuário
3. ✅ **Crie assinatura manual** para testar
4. ✅ **Configure webhook** do Cakto (opcional)
5. ✅ **Implemente Edge Function** (opcional)

---

**Última atualização:** 23/10/2025
