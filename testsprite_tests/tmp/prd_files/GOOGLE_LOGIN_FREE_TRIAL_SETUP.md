# 🚀 Sistema de Teste Grátis com Google Login - Guia Completo

## ✅ Status: IMPLEMENTAÇÃO EM ANDAMENTO

Sistema de teste grátis de 7 dias com login via Google, sem necessidade de webhook externo.

---

## 📦 Arquivos Criados

### ✅ 1. Migração SQL
**Arquivo:** `supabase/migrations/20251031200000_google_login_free_trial.sql`

**O que faz:**
- Adiciona campos de teste grátis na tabela `profiles`
- Cria funções SQL para gerenciar teste
- Configura triggers automáticos
- Sincroniza dados do Google automaticamente

### ✅ 2. Serviço de Teste Grátis
**Arquivo:** `src/services/freeTrialService.ts`

**Métodos disponíveis:**
- `getCurrentUserProfile()` - Busca perfil do usuário
- `isTrialActive()` - Verifica se teste está ativo
- `getTrialStatus()` - Status completo do teste
- `renewTrial()` - Renova o teste
- `signInWithGoogle()` - Login com Google
- `shouldRedirectToRenewal()` - Verifica se deve redirecionar

---

## 🔧 Próximos Passos (Para Implementar)

### Passo 1: Aplicar Migração no Supabase ⏳

**Via Dashboard:**
1. Acesse: https://supabase.com/dashboard/project/wgycuyrkkqwwegazgvcb
2. Vá em **SQL Editor**
3. Cole o conteúdo de `20251031200000_google_login_free_trial.sql`
4. Execute

### Passo 2: Configurar Google OAuth no Supabase ⏳

1. Acesse: https://supabase.com/dashboard/project/wgycuyrkkqwwegazgvcb/auth/providers
2. Clique em **Google**
3. Ative o provedor
4. Configure:
   - **Client ID**: (do Google Cloud Console)
   - **Client Secret**: (do Google Cloud Console)
   - **Redirect URL**: `https://wgycuyrkkqwwegazgvcb.supabase.co/auth/v1/callback`

**Como obter Client ID e Secret:**
1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou use existente
3. Vá em **APIs & Services** → **Credentials**
4. Clique em **Create Credentials** → **OAuth 2.0 Client ID**
5. Tipo: **Web application**
6. **Authorized redirect URIs**: 
   - `https://wgycuyrkkqwwegazgvcb.supabase.co/auth/v1/callback`
   - `http://localhost:5173/auth/callback` (para desenvolvimento)
7. Copie Client ID e Client Secret

### Passo 3: Atualizar Hook useSubscription ⏳

Criar novo arquivo: `src/hooks/useFreeTrial.ts`

```typescript
import { useState, useEffect } from 'react';
import { freeTrialService, TrialStatus } from '@/services/freeTrialService';
import { useAuth } from '@/contexts/AuthContextClean';

export function useFreeTrial() {
  const { user } = useAuth();
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchTrialStatus = async () => {
      const status = await freeTrialService.getTrialStatus();
      setTrialStatus(status);
      setIsLoading(false);
    };

    fetchTrialStatus();
  }, [user]);

  const renewTrial = async () => {
    const success = await freeTrialService.renewTrial();
    if (success) {
      const status = await freeTrialService.getTrialStatus();
      setTrialStatus(status);
    }
    return success;
  };

  return {
    trialStatus,
    isLoading,
    renewTrial,
    isActive: trialStatus?.isActive ?? false,
    daysRemaining: trialStatus?.daysRemaining ?? 0,
    canRenew: trialStatus?.canRenew ?? false
  };
}
```

### Passo 4: Criar Componente de Login com Google ⏳

Criar: `src/components/auth/GoogleLoginButton.tsx`

```typescript
import { Button } from '@/components/ui/button';
import { freeTrialService } from '@/services/freeTrialService';
import { useState } from 'react';

export function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const result = await freeTrialService.signInWithGoogle();
    
    if (!result.success) {
      console.error('Erro no login:', result.error);
      alert('Erro ao fazer login com Google. Tente novamente.');
    }
    
    setIsLoading(false);
  };

  return (
    <Button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {isLoading ? 'Conectando...' : 'Continuar com Google'}
    </Button>
  );
}
```

### Passo 5: Atualizar Banner de Assinatura ⏳

Atualizar `src/components/subscription/SubscriptionBanner.tsx` para usar `useFreeTrial`:

```typescript
import { useFreeTrial } from '@/hooks/useFreeTrial';

export function SubscriptionBanner() {
  const { trialStatus, isLoading, isActive, daysRemaining } = useFreeTrial();
  
  // ... resto do código adaptado
}
```

### Passo 6: Criar Página de Login ⏳

Atualizar `src/pages/LoginPage.tsx` para incluir botão do Google:

```typescript
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';

// Adicionar antes ou depois do formulário de login:
<GoogleLoginButton />
```

### Passo 7: Criar Guard de Rota ⏳

Criar: `src/components/guards/TrialGuard.tsx`

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFreeTrial } from '@/hooks/useFreeTrial';

export function TrialGuard({ children }: { children: React.ReactNode }) {
  const { isActive, isLoading } = useFreeTrial();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isActive) {
      navigate('/renovar-teste');
    }
  }, [isActive, isLoading, navigate]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isActive) {
    return null;
  }

  return <>{children}</>;
}
```

### Passo 8: Criar Página de Renovação ⏳

Criar: `src/pages/RenewalPage.tsx`

```typescript
import { useFreeTrial } from '@/hooks/useFreeTrial';
import { Button } from '@/components/ui/button';

export function RenewalPage() {
  const { canRenew, renewTrial } = useFreeTrial();

  const handleRenew = async () => {
    const success = await renewTrial();
    if (success) {
      alert('Teste renovado com sucesso!');
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Seu teste grátis expirou</h1>
        
        {canRenew ? (
          <>
            <p className="mb-6">
              Você pode renovar seu teste grátis por mais 7 dias!
            </p>
            <Button onClick={handleRenew} className="w-full">
              Renovar Teste Grátis
            </Button>
          </>
        ) : (
          <>
            <p className="mb-6">
              Seu teste já foi renovado. Para continuar usando, assine um plano.
            </p>
            <Button 
              onClick={() => window.location.href = '/planos'}
              className="w-full"
            >
              Ver Planos
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## 🔄 Fluxo Completo

```
1. Usuário clica em "Login com Google"
   ↓
2. Redireciona para Google OAuth
   ↓
3. Google retorna com dados do usuário
   ↓
4. Trigger SQL cria perfil automaticamente com:
   - test_start_date: NOW()
   - test_end_date: NOW() + 7 dias
   - is_test_active: true
   - google_id, avatar_url, etc
   ↓
5. Usuário é redirecionado para /dashboard
   ↓
6. Banner mostra "7 dias restantes"
   ↓
7. Após 7 dias:
   - Função SQL atualiza is_test_active = false
   - TrialGuard redireciona para /renovar-teste
   ↓
8. Usuário pode renovar (se não renovado antes)
   ou assinar um plano
```

---

## 💡 Melhorias Recomendadas

### 1. **Notificações por Email**
- Enviar email 24h antes do teste expirar
- Usar Supabase Edge Functions + Resend/SendGrid
- Criar função agendada (cron) para verificar

### 2. **Analytics**
- Rastrear taxa de conversão (trial → pago)
- Tempo médio de uso durante trial
- Features mais usadas

### 3. **Limitações Durante Trial**
- Limitar número de empréstimos/clientes
- Remover limitações após pagamento
- Mostrar "upgrade" em features premium

### 4. **Onboarding**
- Tour guiado no primeiro acesso
- Checklist de tarefas para completar
- Dicas contextuais

### 5. **Social Proof**
- Mostrar quantos usuários estão testando
- Depoimentos de quem converteu
- Badge "Teste grátis - sem cartão"

### 6. **Gamificação**
- Pontos por completar ações
- Desbloquear badges
- Ranking de usuários

### 7. **Segurança**
- Rate limiting no login
- Detectar múltiplas contas do mesmo IP
- Bloquear emails temporários

### 8. **UX Melhorada**
- Loading states em todos os botões
- Feedback visual ao renovar
- Animações suaves

---

## 🐛 Troubleshooting

### Google Login não funciona

**Solução:**
1. Verificar se OAuth está configurado no Supabase
2. Verificar redirect URI no Google Cloud Console
3. Verificar se domínio está autorizado

### Teste não é criado automaticamente

**Solução:**
1. Verificar se migração foi aplicada
2. Verificar se trigger existe:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_start_free_trial';
```

### Dias restantes sempre 0

**Solução:**
1. Verificar se `test_end_date` está no futuro
2. Executar manualmente:
```sql
SELECT get_trial_days_remaining('user-uuid-aqui');
```

---

## 📝 Checklist de Implementação

- [ ] Aplicar migração no Supabase
- [ ] Configurar Google OAuth
- [ ] Criar hook useFreeTrial
- [ ] Criar GoogleLoginButton
- [ ] Atualizar SubscriptionBanner
- [ ] Criar TrialGuard
- [ ] Criar RenewalPage
- [ ] Adicionar rotas
- [ ] Testar fluxo completo
- [ ] Configurar notificações (opcional)
- [ ] Deploy em produção

---

## 🎉 Vantagens Deste Sistema

✅ **Sem webhook externo** - Tudo no Supabase  
✅ **Login social** - Conversão mais alta  
✅ **Automático** - Triggers fazem tudo  
✅ **Escalável** - Suporta milhares de usuários  
✅ **Seguro** - RLS do Supabase  
✅ **Simples** - Menos código para manter  

---

**Próximo passo:** Aplicar a migração no Supabase Dashboard!
