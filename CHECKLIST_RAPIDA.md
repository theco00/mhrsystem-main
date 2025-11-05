# ✅ CHECKLIST RÁPIDA - Correção Supabase

## 🎯 OBJETIVO
Corrigir bug que impede cadastro/login de usuários

---

## 📝 PASSO A PASSO (5 minutos)

### ☐ 1. ACESSAR SUPABASE
- [ ] Abrir https://supabase.com/dashboard
- [ ] Fazer login
- [ ] Selecionar projeto TitanJuros

### ☐ 2. EXECUTAR SCRIPT SQL
- [ ] Ir em: **SQL Editor** (menu lateral)
- [ ] Clicar em: **+ New query**
- [ ] Abrir arquivo: `EXECUTAR_NO_SUPABASE.sql`
- [ ] Copiar TODO o conteúdo
- [ ] Colar no SQL Editor
- [ ] Clicar em: **RUN** (ou Ctrl+Enter)
- [ ] Aguardar: "✅ Success. No rows returned"

### ☐ 3. CONFIGURAR AUTH
- [ ] Ir em: **Authentication** → **Settings**
- [ ] Encontrar: "Enable email confirmations"
- [ ] **DESMARCAR** esta opção
- [ ] Clicar em: **Save**
- [ ] Confirmar: "Enable sign ups" está MARCADO

### ☐ 4. VERIFICAR SE FUNCIONOU
- [ ] Voltar ao **SQL Editor**
- [ ] Abrir arquivo: `VERIFICAR_SUPABASE.sql`
- [ ] Copiar e colar
- [ ] Executar
- [ ] Confirmar que tudo tem ✅

### ☐ 5. TESTAR NO SISTEMA
- [ ] Abrir: http://localhost:8081/cadastro
- [ ] Criar usuário teste:
  - Nome: `Teste Final Corrigido`
  - Email: `teste.final@exemplo.com`
  - Senha: `Senha123!@#`
- [ ] Clicar em: **Criar conta grátis**
- [ ] Verificar se:
  - [ ] Aparece toast verde ✅
  - [ ] Redireciona para Welcome ✅
  - [ ] Não há erros no console ✅

---

## 🔥 SE DER ERRO

### Erro de Permissão?
Execute no SQL Editor:
```sql
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated;
```

### RLS Bloqueando?
Execute no SQL Editor (TEMPORÁRIO):
```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
```

---

## 📞 DEPOIS DE EXECUTAR

Me avise:
- ✅ "Funcionou! Cadastro está criando usuários"
- ❌ "Deu erro: [copie o erro aqui]"
- ❓ "Não sei se funcionou"

---

**Tempo total:** ~5 minutos  
**Dificuldade:** ⭐ Fácil
