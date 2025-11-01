# 🚀 Guia de Deploy - Titan Juros na Vercel

## ✅ **Correções Aplicadas**

1. **Movido `supabase` para `dependencies`** - Evita warnings de binários
2. **Criado `vercel.json`** - Configuração otimizada para Vite
3. **Configurado rewrites** - SPA routing funcionando corretamente

## 📋 **Pré-requisitos**

- Conta na Vercel
- Repositório GitHub conectado
- Variáveis de ambiente configuradas (se necessário)

## 🔧 **Passos para Deploy**

### **1. Commit e Push das Mudanças**

```bash
git add .
git commit -m "fix: Move supabase to dependencies and add Vercel config"
git push origin main
```

### **2. Configurar Variáveis de Ambiente na Vercel**

Se você usa Supabase ou Groq, configure na Vercel:

**Painel Vercel → Seu Projeto → Settings → Environment Variables**

Adicione (se necessário):
```
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_supabase
VITE_GROQ_API_KEY=sua_chave_groq (opcional)
```

### **3. Deploy Automático**

A Vercel vai detectar automaticamente:
- ✅ Framework: Vite
- ✅ Build Command: `pnpm run build`
- ✅ Output Directory: `dist`
- ✅ Install Command: `pnpm install`

### **4. Verificar Build**

O warning do Supabase pode aparecer, mas **não impede o build**:
```
WARN Failed to create bin at /vercel/path0/node_modules/.bin/supabase
```

**Isso é normal e pode ser ignorado!**

## 🎯 **Estrutura de Deploy**

```
Build Process:
1. Install dependencies (pnpm install)
2. Build project (pnpm run build)
3. Output to dist/
4. Deploy to Vercel CDN
```

## 🔍 **Troubleshooting**

### **Erro: "Cannot find module"**

**Solução**: Limpar cache e rebuildar
```bash
# Na Vercel
Settings → General → Clear Build Cache
```

### **Erro: "Build failed"**

**Solução**: Verificar logs completos
1. Vá para Deployments
2. Clique no deployment falhado
3. Veja o log completo
4. Procure por erros reais (não warnings)

### **Erro: "404 on refresh"**

**Solução**: Já configurado no `vercel.json`
```json
"rewrites": [
  { "source": "/(.*)", "destination": "/index.html" }
]
```

### **Erro: Variáveis de ambiente não funcionam**

**Solução**: 
1. Certifique-se que começam com `VITE_`
2. Redeploy após adicionar variáveis
3. Variáveis são aplicadas apenas em novos builds

## 📊 **Checklist de Deploy**

- [ ] Código commitado e pushed
- [ ] Variáveis de ambiente configuradas
- [ ] Build local funcionando (`pnpm run build`)
- [ ] Preview local funcionando (`pnpm run preview`)
- [ ] Vercel conectada ao repositório
- [ ] Deploy automático ativado

## 🎉 **Após Deploy Bem-Sucedido**

Sua landing page estará disponível em:
```
https://seu-projeto.vercel.app
```

**Funcionalidades Ativas:**
- ✅ Landing page ultra-moderna
- ✅ Animações 3D
- ✅ Integração com autenticação
- ✅ Roteamento inteligente
- ✅ Página Thank You
- ✅ Responsividade completa

## 🔗 **Links Úteis**

- [Documentação Vercel](https://vercel.com/docs)
- [Vite Deploy Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase + Vercel](https://supabase.com/docs/guides/getting-started/quickstarts/vercel)

## 💡 **Dicas**

1. **Preview Deployments**: Cada PR cria um preview automático
2. **Production**: Branch `main` vai para produção
3. **Analytics**: Ative Vercel Analytics para métricas
4. **Custom Domain**: Configure em Settings → Domains

## 🆘 **Precisa de Ajuda?**

Se o build continuar falhando:
1. Copie o **log completo** do erro
2. Procure por erros reais (não warnings)
3. Verifique se todas as dependências estão instaladas
4. Teste o build local primeiro

---

**Última atualização**: Deploy configurado com sucesso! 🚀
