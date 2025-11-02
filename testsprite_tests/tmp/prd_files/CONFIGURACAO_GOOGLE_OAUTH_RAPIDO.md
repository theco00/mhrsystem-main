# ⚡ CONFIGURAÇÃO GOOGLE OAUTH - GUIA RÁPIDO

## 🌐 PASSO 1: GOOGLE CLOUD CONSOLE (5 min)

1. **Acessar**: https://console.cloud.google.com/apis/credentials
2. **Criar OAuth 2.0**:
   - "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "TitanJuros Web App"
3. **Adicionar URIs EXATAS**:
   ```
   https://wgycuyrkkqwwegazgvcb.supabase.co/auth/v1/callback
   http://localhost:8087/auth/v1/callback
   ```
4. **Copiar** Client ID e Client Secret

## 🔧 PASSO 2: SUPABASE DASHBOARD (3 min)

1. **Acessar**: https://supabase.com/dashboard/project/wgycuyrkkqwwegazgvcb/auth/providers
2. **Google Provider**:
   - Expandir "Google"
   - Toggle "Enable" ✅
   - Client ID: [colar do passo 1]
   - Client Secret: [colar do passo 1]
3. **Save**

## 🚀 PASSO 3: TESTAR (2 min)

1. **Limpar cache**: Ctrl + Shift + Delete
2. **Reiniciar**: `npm run dev`
3. **Acessar**: http://localhost:8087
4. **Console**: F12 (ver logs)
5. **Testar**: "Continuar com Google"

## 📊 LOGS ESPERADOS

```
🚀 Iniciando login com Google...
✅ Login com Google iniciado, aguardando callback...
Auth state changed: SIGNED_IN seuemail@gmail.com
✅ Login bem-sucedido, redirecionando para /welcome
```

## ❌ SE DER ERRO

### Erro: "OAuth provider not enabled"
**Solução**: PASSO 2 - Ativar Google no Supabase

### Erro: "redirect_uri_mismatch"
**Solução**: Verificar URIs no PASSO 1 (exatamente iguais)

### Erro: "invalid_client"
**Solução**: Verificar Client ID/Secret no PASSO 2

### Erro: Volta para login
**Solução**: Verificar console do navegador para logs específicos

---

## 🎯 URLS IMPORTANTES

- **Google Console**: https://console.cloud.google.com/apis/credentials
- **Supabase Auth**: https://supabase.com/dashboard/project/wgycuyrkkqwwegazgvcb/auth/providers
- **Callback URL**: `https://wgycuyrkkqwwegazgvcb.supabase.co/auth/v1/callback`

## ⚡ COMANDOS ÚTEIS

```javascript
// Verificar sessão atual
supabase.auth.getSession().then(console.log);

// Limpar auth local
await supabase.auth.signOut();
localStorage.clear();
location.reload();
```

---

**Tempo total**: 10 minutos  
**Dificuldade**: Fácil  
**Resultados**: Login Google funcional ✅
