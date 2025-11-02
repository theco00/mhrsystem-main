# 🚀 Landing Page Separada - Titan Juros

## 📁 Estrutura do Projeto

O projeto agora possui **dois sistemas independentes** rodando no mesmo código:

```
mhrsystem/
├── src/                    # Sistema Principal (Dashboard)
│   ├── components/
│   ├── contexts/
│   └── ...
├── landing/                # Landing Page (Vendas)
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       └── components/
│           └── LandingPage.tsx
├── index.html             # Sistema Principal
└── vite.config.ts         # Configurado para múltiplas entradas
```

---

## 🌐 URLs de Acesso

### Desenvolvimento (Local)
- **Landing Page**: `http://localhost:8080/landing/`
- **Sistema Principal**: `http://localhost:8080/`

### Produção (Após Build)
- **Landing Page**: `https://seudominio.com/landing/`
- **Sistema Principal**: `https://seudominio.com/`

---

## 🔗 Navegação Entre Sistemas

### Da Landing para o Sistema
A landing page possui botões "Login" que direcionam para `/` (sistema principal):

```typescript
// Em landing/src/components/LandingPage.tsx (linha 28)
const SYSTEM_URL = "/"; // ⬅️ URL para acessar o sistema
```

### Do Sistema para a Landing
No sistema principal, você pode adicionar links para `/landing/`:

```tsx
<a href="/landing/">Ver Página de Vendas</a>
```

---

## ⚙️ Configuração

### 1. Link de Compra (Kivano)
**Arquivo**: `landing/src/components/LandingPage.tsx`  
**Linha 27**:
```typescript
const KIVANO_PURCHASE_URL = "https://kivano.com/titan-juros"; // ⬅️ SEU LINK
```

### 2. Preço Mensal
**Linha 28**:
```typescript
const MONTHLY_PRICE = "29,99"; // ⬅️ SEU PREÇO
```

### 3. URL do Sistema Principal
**Linha 31**:
```typescript
const SYSTEM_URL = "/"; // ⬅️ URL do sistema (pode ser /login ou /dashboard)
```

---

## 🛠️ Comandos

### Desenvolvimento
```bash
npm run dev
```
Acesse:
- Landing: http://localhost:8080/landing/
- Sistema: http://localhost:8080/

### Build para Produção
```bash
npm run build
```

Isso gerará:
- `dist/index.html` - Sistema principal
- `dist/landing/index.html` - Landing page

### Preview da Build
```bash
npm run preview
```

---

## 📦 Deploy

### Opção 1: Deploy Completo
Faça upload de toda a pasta `dist/` para seu servidor.

**Estrutura no servidor:**
```
public_html/
├── index.html          # Sistema principal
├── landing/
│   └── index.html      # Landing page
└── assets/             # CSS, JS, etc.
```

### Opção 2: Deploy Separado

#### Landing Page (Netlify/Vercel)
1. Configure o build:
   - Build command: `npm run build`
   - Publish directory: `dist/landing`

#### Sistema Principal (Servidor próprio)
1. Faça upload apenas dos arquivos do sistema principal
2. Configure redirecionamento para a landing externa

---

## 🎨 Personalização da Landing

### Cores e Estilos
A landing usa o mesmo CSS do sistema principal (`src/index.css`), garantindo consistência visual.

### Componentes Independentes
A landing **não depende** de:
- ❌ React Router
- ❌ Contextos de autenticação
- ❌ Componentes UI do shadcn

Ela possui seus próprios componentes inline.

---

## 🔄 Sincronização

### Atualizar Estilos
Se você modificar `src/index.css`, as mudanças afetarão **ambos os sistemas** automaticamente.

### Atualizar Landing
Edite apenas: `landing/src/components/LandingPage.tsx`

### Atualizar Sistema Principal
Edite arquivos em: `src/`

---

## 🚀 Vantagens desta Estrutura

✅ **Separação Total**: Landing e sistema são independentes  
✅ **Mesmo Repositório**: Fácil manutenção e versionamento  
✅ **Estilos Compartilhados**: Design consistente  
✅ **Deploy Flexível**: Pode deployar junto ou separado  
✅ **Performance**: Cada sistema carrega apenas o necessário  
✅ **SEO Friendly**: Landing pode ter meta tags específicas  

---

## 📊 Fluxo do Usuário

```
1. Usuário acessa: seusite.com/landing/
   ↓
2. Vê a página de vendas
   ↓
3. Clica em "Adquirir o Sistema"
   ↓
4. É direcionado para Kivano
   ↓
5. Após comprar, clica em "Login"
   ↓
6. É direcionado para: seusite.com/
   ↓
7. Faz login no sistema
```

---

## 🐛 Troubleshooting

### Landing não carrega
- Verifique se está acessando `/landing/` (com barra final)
- Confirme que o servidor está rodando: `npm run dev`

### Estilos não aparecem
- Verifique se `src/index.css` existe
- Confirme o caminho em `landing/src/main.tsx`

### Erro 404 em produção
- Configure o servidor para servir `landing/index.html` na rota `/landing/`
- Em Netlify/Vercel, adicione regra de rewrite

---

## 📝 Exemplo de Configuração Netlify

**netlify.toml**:
```toml
[[redirects]]
  from = "/landing/*"
  to = "/landing/index.html"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## ✨ Próximos Passos

1. ✅ Configure seu link da Kivano
2. ✅ Teste a navegação entre sistemas
3. ✅ Personalize textos se necessário
4. ✅ Faça o build e deploy
5. ✅ Monitore conversões

---

**Dúvidas?** Consulte a documentação ou entre em contato com o suporte.
