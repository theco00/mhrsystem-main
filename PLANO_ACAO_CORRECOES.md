# 🚀 PLANO DE AÇÃO - CORREÇÕES DO SISTEMA TITANJUROS

## ✅ PASSO 1: APLICAR MIGRAÇÃO SQL (5 min)

1. Acesse o Supabase:
   ```
   https://supabase.com/dashboard/project/wgycuyrkkqwwegazgvcb/sql/new
   ```

2. Copie e cole TODO o conteúdo do arquivo:
   ```
   supabase/migrations/20251031230000_fix_all_subscription_fields.sql
   ```

3. Clique em "RUN" para executar

4. Verifique se aparece "Success" sem erros

## ✅ PASSO 2: CONFIGURAR GOOGLE OAUTH (10 min)

1. Acesse as configurações de Auth:
   ```
   https://supabase.com/dashboard/project/wgycuyrkkqwwegazgvcb/auth/providers
   ```

2. Encontre "Google" e clique em "Enable"

3. Você precisará:
   - Client ID do Google
   - Client Secret do Google

4. Se não tiver, crie em:
   ```
   https://console.cloud.google.com/apis/credentials
   ```
   
5. Configure as URLs de redirect:
   - Authorized redirect URI: `https://wgycuyrkkqwwegazgvcb.supabase.co/auth/v1/callback`

## ✅ PASSO 3: REINICIAR O SERVIDOR DE DESENVOLVIMENTO

1. Pare o servidor atual (Ctrl+C no terminal)

2. Execute novamente:
   ```bash
   npm run dev
   ```

3. Acesse: http://localhost:8087

## ✅ PASSO 4: TESTAR O FLUXO COMPLETO

### Teste 1: Login com Google
1. Acesse a landing page
2. Clique em "Começar Teste Grátis"
3. Faça login com Google
4. Verifique se redireciona para /welcome

### Teste 2: Ativação de Trial
1. Na página Welcome, escolha "Teste Grátis"
2. Verifique se redireciona para /dashboard
3. Confirme que o banner mostra "7 dias restantes"

### Teste 3: Limitações
1. Vá para "Empréstimos"
2. Adicione 5 empréstimos
3. Tente adicionar o 6º
4. Verifique se aparece o modal de bloqueio

### Teste 4: Admin Access
1. Faça login com seu email (admin)
2. Verifique se tem acesso ilimitado
3. Confirme que não há limitações

## ⚠️ SE ALGO DER ERRADO

### Erro: "subscription_status does not exist"
**Solução:** A migração SQL não foi aplicada. Volte ao PASSO 1.

### Erro: "Google OAuth not configured"
**Solução:** Google OAuth não está ativo. Volte ao PASSO 2.

### Erro: "Cannot read properties of null"
**Solução:** Verifique o console do navegador (F12) e envie o erro específico.

### Erro: Trial não ativa
**Solução:** Execute este SQL manualmente:
```sql
UPDATE profiles 
SET 
  subscription_status = 'trial',
  trial_start_date = NOW(),
  trial_end_date = NOW() + INTERVAL '7 days'
WHERE user_id = 'SEU_USER_ID';
```

## 📊 CHECKLIST DE VALIDAÇÃO

- [ ] Arquivo .env existe e está configurado
- [ ] Migração SQL aplicada sem erros
- [ ] Google OAuth configurado e funcionando
- [ ] Login com Google funciona
- [ ] Página /welcome aparece após primeiro login
- [ ] Trial é ativado ao escolher "Teste Grátis"
- [ ] Dashboard mostra banner com dias restantes
- [ ] Limitações de 5 empréstimos funcionam
- [ ] Limitações de 5 clientes funcionam
- [ ] Modal de bloqueio aparece corretamente
- [ ] Links do Cakto funcionam (Mensal e Trimestral)
- [ ] Admin (você) tem acesso ilimitado
- [ ] Não há erros no console do navegador

## 🎯 RESULTADO ESPERADO

Após completar todos os passos, o sistema deve:

1. ✅ Permitir login com Google
2. ✅ Redirecionar novos usuários para /welcome
3. ✅ Ativar trial de 7 dias automaticamente
4. ✅ Bloquear após 5 empréstimos/clientes
5. ✅ Mostrar modal de upgrade quando bloqueado
6. ✅ Redirecionar para Cakto para pagamento
7. ✅ Dar acesso infinito para admin (você)
8. ✅ Funcionar 100% sem erros

## 💬 PRECISA DE AJUDA?

Se encontrar algum problema:

1. Tire um print do erro
2. Copie a mensagem de erro do console (F12)
3. Me envie os detalhes que eu corrijo imediatamente

---

**Tempo total estimado:** 30 minutos
**Dificuldade:** Fácil (apenas seguir os passos)
**Resultado:** Sistema 100% funcional! 🚀
