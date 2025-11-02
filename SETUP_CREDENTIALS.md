# 🔐 Guia de Configuração de Credenciais

## ⚠️ AÇÃO IMEDIATA NECESSÁRIA

As chaves de API foram removidas do código por segurança. Você precisa criar um arquivo `.env` na raiz do projeto.

## 📝 Passo a Passo

### 1. Criar arquivo `.env`

```bash
# Na raiz do projeto (mhrsystem-main)
cp .env.example .env
```

### 2. Preencher com suas credenciais REAIS

Abra o arquivo `.env` e substitua os valores:

```env
# Supabase (suas credenciais atuais)
VITE_SUPABASE_URL=https://wgycuyrkkqwwegazgvcb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneWN1eXJra3F3d2VnYXpndmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTM1MTMsImV4cCI6MjA3NjM4OTUxM30.tl7O8mzSO0FlepRJO5c7IBMapnGP-z-jn74wLf643co

# Google Gemini AI (sua chave atual)
VITE_GOOGLE_GEMINI_API_KEY=AIzaSyB6YRbA1Nq3ekH7ugtTYiI6Khh1pYDNY-Y

# Groq AI (opcional)
VITE_GROQ_API_KEY=sua_chave_groq_se_tiver
VITE_GROQ_MODEL=qwen/qwen3-32b
VITE_GROQ_BASE_URL=https://api.groq.com/openai/v1

# Ambiente
VITE_APP_ENV=development
```

### 3. ⚠️ IMPORTANTE - REVOGAR API KEYS EXPOSTAS

**As chaves acima foram expostas publicamente no código!** Você DEVE:

#### Google Gemini API:
1. Acesse: https://makersuite.google.com/app/apikey
2. Encontre a chave: `AIzaSyB6YRbA1Nq3ekH7ugtTYiI6Khh1pYDNY-Y`
3. **REVOGUE** essa chave imediatamente
4. Crie uma **NOVA chave**
5. Atualize no `.env`: `VITE_GOOGLE_GEMINI_API_KEY=sua_nova_chave`

#### Supabase:
As chaves do Supabase (ANON_KEY) são públicas por design, então não precisam ser revogadas. Mas considere:
- Verificar políticas RLS estão ativas
- Revisar permissões de acesso
- Considerar rate limiting

### 4. Verificar se `.env` está no .gitignore

```bash
# Verificar que .env NÃO será commitado
git status

# O arquivo .env NÃO deve aparecer na lista
# Se aparecer, adicione ao .gitignore:
echo ".env" >> .gitignore
```

### 5. Reiniciar servidor de desenvolvimento

```bash
npm run dev
```

## 🔒 Segurança

- ✅ `.env` está no `.gitignore` (não será commitado)
- ✅ Chaves agora estão fora do código fonte
- ⚠️ **REVOGUE as chaves antigas que estavam expostas**
- ✅ Use chaves novas geradas

## 📚 Mais Informações

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Google AI Studio](https://makersuite.google.com/)
- [Groq Console](https://console.groq.com/)

## ❓ Problemas?

Se o sistema não iniciar, verifique:

1. Arquivo `.env` existe na raiz?
2. Todas as variáveis estão preenchidas?
3. Não há espaços extras ou aspas?
4. Servidor foi reiniciado após criar `.env`?
