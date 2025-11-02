# 🧪 Como Testar a Landing Page Separada

## ⚠️ IMPORTANTE: Reinicie o Servidor

Após criar a estrutura da landing page separada, você **DEVE** reiniciar o servidor de desenvolvimento:

### 1. Pare o servidor atual
Pressione `Ctrl + C` no terminal onde o servidor está rodando

### 2. Inicie novamente
```bash
npm run dev
```

### 3. Acesse as URLs

**Landing Page Separada:**
```
http://localhost:8080/landing/
```

**Sistema Principal:**
```
http://localhost:8080/
```

---

## 🔍 Verificação Rápida

### Teste 1: Landing Page Carrega
1. Acesse: `http://localhost:8080/landing/`
2. Deve aparecer a página de vendas com fundo escuro
3. Verifique se o mockup do dashboard aparece (desktop)

### Teste 2: Navegação para o Sistema
1. Na landing, clique no botão "Login" (canto superior direito)
2. Deve redirecionar para `http://localhost:8080/`
3. Deve aparecer a tela de login do sistema

### Teste 3: Botões de Compra
1. Clique em "Adquirir o Sistema"
2. Deve abrir uma nova aba com o link da Kivano
3. Verifique se o link está correto

---

## 🐛 Problemas Comuns

### Página em Branco
**Causa**: Servidor não foi reiniciado  
**Solução**: Pare (`Ctrl + C`) e inicie novamente (`npm run dev`)

### Erro 404
**Causa**: Falta a barra final na URL  
**Solução**: Use `http://localhost:8080/landing/` (com `/` no final)

### Estilos não carregam
**Causa**: Caminho do CSS incorreto  
**Solução**: Verifique se `src/index.css` existe

### Console mostra erros
**Causa**: Dependências faltando  
**Solução**: Execute `npm install`

---

## 📁 Estrutura Criada

```
mhrsystem/
├── landing/                          # ← NOVA PASTA
│   ├── index.html                    # ← Entrada da landing
│   └── src/
│       ├── main.tsx                  # ← Bootstrap React
│       └── components/
│           └── LandingPage.tsx       # ← Componente standalone
├── src/                              # Sistema principal (inalterado)
├── vite.config.ts                    # ← Atualizado (múltiplas entradas)
└── index.html                        # Sistema principal (inalterado)
```

---

## ✅ Checklist de Verificação

- [ ] Servidor reiniciado após criar arquivos
- [ ] Landing carrega em `/landing/`
- [ ] Sistema carrega em `/`
- [ ] Botão "Login" redireciona corretamente
- [ ] Botões de compra abrem link da Kivano
- [ ] Responsivo funciona (teste mobile)
- [ ] FAQ abre/fecha corretamente
- [ ] Todas as seções aparecem

---

## 🚀 Próximo Passo: Build

Quando tudo estiver funcionando localmente:

```bash
npm run build
```

Isso gerará:
- `dist/index.html` - Sistema principal
- `dist/landing/index.html` - Landing page

---

## 📞 Suporte

Se após reiniciar o servidor a landing ainda não carregar, verifique:

1. Console do navegador (F12) para erros
2. Terminal do servidor para mensagens de erro
3. Se todos os arquivos foram criados corretamente

**Comando para verificar arquivos:**
```bash
dir landing\src\components
```

Deve mostrar: `LandingPage.tsx`
