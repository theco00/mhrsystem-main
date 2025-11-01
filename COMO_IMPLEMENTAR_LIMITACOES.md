# 🔒 Como Implementar Limitações do Teste Grátis

## ✅ Componentes Criados

1. **TrialLimitAlert** - Modal que bloqueia ações quando limite é atingido
2. **useTrialLimits** - Hook que monitora limites em tempo real
3. **useFreeTrial** - Hook que gerencia status do trial

---

## 📋 Implementação por Funcionalidade

### 1. **Bloquear Adição de Empréstimos**

**Arquivo:** Onde você adiciona empréstimos (ex: `src/pages/LoansPage.tsx` ou botão de adicionar)

```typescript
import { useState } from 'react';
import { useTrialLimits } from '@/hooks/useTrialLimits';
import { TrialLimitAlert } from '@/components/trial/TrialLimitAlert';

function AddLoanButton() {
  const { limits, isLoading } = useTrialLimits();
  const [showLimitAlert, setShowLimitAlert] = useState(false);

  const handleAddLoan = () => {
    // Verificar se pode adicionar
    if (!limits.canAddLoan && !limits.isUnlimited) {
      setShowLimitAlert(true);
      return;
    }

    // Continuar com adição normal
    // ... seu código de adicionar empréstimo
  };

  return (
    <>
      <button 
        onClick={handleAddLoan}
        className="btn btn-primary"
        disabled={isLoading}
      >
        Adicionar Empréstimo
        {!limits.isUnlimited && (
          <span className="ml-2 text-xs opacity-75">
            ({limits.currentLoans}/{limits.maxLoans})
          </span>
        )}
      </button>

      {/* Modal de limite */}
      {showLimitAlert && (
        <TrialLimitAlert
          type="loan"
          currentCount={limits.currentLoans}
          maxCount={limits.maxLoans}
          onClose={() => setShowLimitAlert(false)}
        />
      )}
    </>
  );
}
```

### 2. **Bloquear Adição de Clientes**

**Arquivo:** Onde você adiciona clientes (ex: `src/pages/ClientsPage.tsx`)

```typescript
import { useState } from 'react';
import { useTrialLimits } from '@/hooks/useTrialLimits';
import { TrialLimitAlert } from '@/components/trial/TrialLimitAlert';

function AddClientButton() {
  const { limits, isLoading } = useTrialLimits();
  const [showLimitAlert, setShowLimitAlert] = useState(false);

  const handleAddClient = () => {
    // Verificar se pode adicionar
    if (!limits.canAddClient && !limits.isUnlimited) {
      setShowLimitAlert(true);
      return;
    }

    // Continuar com adição normal
    // ... seu código de adicionar cliente
  };

  return (
    <>
      <button 
        onClick={handleAddClient}
        className="btn btn-primary"
        disabled={isLoading}
      >
        Adicionar Cliente
        {!limits.isUnlimited && (
          <span className="ml-2 text-xs opacity-75">
            ({limits.currentClients}/{limits.maxClients})
          </span>
        )}
      </button>

      {/* Modal de limite */}
      {showLimitAlert && (
        <TrialLimitAlert
          type="client"
          currentCount={limits.currentClients}
          maxCount={limits.maxClients}
          onClose={() => setShowLimitAlert(false)}
        />
      )}
    </>
  );
}
```

### 3. **Mostrar Badge de Limite em Cards**

**Exemplo:** Mostrar status do limite em um card

```typescript
import { useTrialLimits } from '@/hooks/useTrialLimits';
import { AlertTriangle } from 'lucide-react';

function LoansList() {
  const { limits } = useTrialLimits();

  return (
    <div>
      {/* Header com badge de limite */}
      {!limits.isUnlimited && (
        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100">
                Teste Grátis - Limite de Empréstimos
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {limits.currentLoans} de {limits.maxLoans} empréstimos utilizados
                {limits.currentLoans >= limits.maxLoans && (
                  <span className="ml-2 font-bold">- Limite atingido!</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de empréstimos */}
      {/* ... */}
    </div>
  );
}
```

### 4. **Desabilitar Botões Quando Limite Atingido**

```typescript
import { useTrialLimits } from '@/hooks/useTrialLimits';

function ActionButtons() {
  const { limits } = useTrialLimits();

  const isLoanLimitReached = !limits.canAddLoan && !limits.isUnlimited;
  const isClientLimitReached = !limits.canAddClient && !limits.isUnlimited;

  return (
    <div className="flex gap-4">
      <button
        disabled={isLoanLimitReached}
        className={`btn ${isLoanLimitReached ? 'btn-disabled' : 'btn-primary'}`}
        title={isLoanLimitReached ? 'Limite de empréstimos atingido' : ''}
      >
        Novo Empréstimo
        {isLoanLimitReached && <span className="ml-2">🔒</span>}
      </button>

      <button
        disabled={isClientLimitReached}
        className={`btn ${isClientLimitReached ? 'btn-disabled' : 'btn-primary'}`}
        title={isClientLimitReached ? 'Limite de clientes atingido' : ''}
      >
        Novo Cliente
        {isClientLimitReached && <span className="ml-2">🔒</span>}
      </button>
    </div>
  );
}
```

### 5. **Mostrar Progresso do Limite no Dashboard**

```typescript
import { useTrialLimits } from '@/hooks/useTrialLimits';
import { useFreeTrial } from '@/hooks/useFreeTrial';

function DashboardStats() {
  const { limits } = useTrialLimits();
  const { daysRemaining, isActive } = useFreeTrial();

  if (limits.isUnlimited) {
    return null; // Não mostrar para planos pagos
  }

  return (
    <div className="grid md:grid-cols-3 gap-4 mb-6">
      {/* Dias Restantes */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Teste Grátis
        </h3>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {daysRemaining} dias
        </p>
        <p className="text-xs text-gray-500 mt-1">restantes</p>
      </div>

      {/* Empréstimos */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Empréstimos
        </h3>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
          {limits.currentLoans}/{limits.maxLoans}
        </p>
        <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${(limits.currentLoans / limits.maxLoans) * 100}%` }}
          />
        </div>
      </div>

      {/* Clientes */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Clientes
        </h3>
        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {limits.currentClients}/{limits.maxClients}
        </p>
        <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${(limits.currentClients / limits.maxClients) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
```

### 6. **Interceptar Formulários de Adição**

```typescript
import { useTrialLimits } from '@/hooks/useTrialLimits';
import { TrialLimitAlert } from '@/components/trial/TrialLimitAlert';

function LoanForm() {
  const { limits } = useTrialLimits();
  const [showLimitAlert, setShowLimitAlert] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar limite ANTES de enviar
    if (!limits.canAddLoan && !limits.isUnlimited) {
      setShowLimitAlert(true);
      return;
    }

    // Continuar com o submit normal
    try {
      // ... seu código de salvar empréstimo
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Campos do formulário */}
        
        <button type="submit" disabled={!limits.canAddLoan && !limits.isUnlimited}>
          Salvar Empréstimo
        </button>
      </form>

      {showLimitAlert && (
        <TrialLimitAlert
          type="loan"
          currentCount={limits.currentLoans}
          maxCount={limits.maxLoans}
          onClose={() => setShowLimitAlert(false)}
        />
      )}
    </>
  );
}
```

---

## 🎯 Checklist de Implementação

### Empréstimos
- [ ] Bloquear botão "Adicionar Empréstimo"
- [ ] Bloquear formulário de novo empréstimo
- [ ] Mostrar contador de limite (X/5)
- [ ] Exibir modal quando limite atingido
- [ ] Desabilitar importação em massa

### Clientes
- [ ] Bloquear botão "Adicionar Cliente"
- [ ] Bloquear formulário de novo cliente
- [ ] Mostrar contador de limite (X/5)
- [ ] Exibir modal quando limite atingido
- [ ] Desabilitar importação de clientes

### Dashboard
- [ ] Mostrar cards com progresso dos limites
- [ ] Exibir dias restantes do trial
- [ ] Banner de upgrade quando próximo do limite

### Outras Funcionalidades (Opcional)
- [ ] Bloquear exportação avançada (deixar apenas básica)
- [ ] Limitar relatórios (apenas últimos 30 dias)
- [ ] Desabilitar integrações premium
- [ ] Limitar acesso a 1 dispositivo (detectar múltiplos logins)

---

## 💡 Dicas Importantes

### 1. **Sempre Verificar no Backend Também**
As limitações no frontend são para UX, mas você DEVE validar no backend:

```sql
-- Exemplo de trigger no Supabase para bloquear inserção
CREATE OR REPLACE FUNCTION check_trial_limits()
RETURNS TRIGGER AS $$
DECLARE
  user_profile RECORD;
  loan_count INTEGER;
BEGIN
  -- Buscar perfil do usuário
  SELECT is_test_active INTO user_profile
  FROM profiles
  WHERE user_id = NEW.user_id;

  -- Se não está em trial, permitir
  IF user_profile.is_test_active = FALSE THEN
    RETURN NEW;
  END IF;

  -- Contar empréstimos
  SELECT COUNT(*) INTO loan_count
  FROM loans
  WHERE user_id = NEW.user_id;

  -- Bloquear se atingiu limite
  IF loan_count >= 5 THEN
    RAISE EXCEPTION 'Limite de empréstimos do teste grátis atingido';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
CREATE TRIGGER enforce_trial_loan_limit
  BEFORE INSERT ON loans
  FOR EACH ROW
  EXECUTE FUNCTION check_trial_limits();
```

### 2. **Feedback Visual Claro**
- Use cores (amarelo/laranja) para avisar quando próximo do limite
- Use vermelho quando limite atingido
- Mostre ícone de cadeado 🔒 em botões desabilitados

### 3. **Mensagens Motivacionais**
Em vez de apenas "Limite atingido", mostre os benefícios do upgrade:
- "Desbloqueie empréstimos ilimitados"
- "Faça upgrade e adicione quantos clientes quiser"
- "Planos a partir de R$ 29,90/mês"

### 4. **Não Seja Muito Restritivo**
Permita que o usuário:
- Visualize todos os dados
- Exporte dados básicos
- Edite registros existentes
- Delete registros

Bloqueie apenas:
- Adicionar novos empréstimos (após 5)
- Adicionar novos clientes (após 5)
- Features premium específicas

---

## 🚀 Próximos Passos

1. **Implementar nos componentes principais:**
   - Página de Empréstimos
   - Página de Clientes
   - Dashboard

2. **Adicionar triggers no Supabase** (validação backend)

3. **Testar fluxo completo:**
   - Criar 5 empréstimos
   - Tentar criar o 6º
   - Verificar se modal aparece
   - Clicar em "Ver Planos"

4. **Monitorar conversão:**
   - Quantos usuários atingem o limite?
   - Quantos fazem upgrade após atingir?

---

**Tudo pronto para implementar!** 🎉
