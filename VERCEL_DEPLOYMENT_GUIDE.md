# 🚀 Guia de Deploy no Vercel - TitanJuros SaaS

## 📋 Pré-requisitos

- [x] Conta no Vercel (https://vercel.com)
- [x] Repositório Git (GitHub/GitLab/Bitbucket)
- [x] Credenciais do Supabase
- [x] API Keys (Google Gemini, etc.)

## 🔧 Configuração do Projeto

### 1. Importar Projeto no Vercel

```bash
# Via CLI (opcional)
npm i -g vercel
vercel login
vercel
```

Ou via Dashboard:
1. Acesse: https://vercel.com/new
2. Selecione repositório `mhrsystem-main`
3. Configure conforme abaixo

### 2. Variáveis de Ambiente

**Importante**: Configure TODAS as variáveis antes do primeiro deploy!

```env
# === SUPABASE ===
VITE_SUPABASE_URL=https://wgycuyrkkqwwegazgvcb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# === GOOGLE GEMINI AI ===
# ⚠️ GERE UMA NOVA API KEY (a antiga foi exposta)
VITE_GOOGLE_GEMINI_API_KEY=sua_nova_api_key_do_gemini

# === GROQ AI (Opcional) ===
VITE_GROQ_API_KEY=sua_chave_groq
VITE_GROQ_MODEL=qwen/qwen3-32b
VITE_GROQ_BASE_URL=https://api.groq.com/openai/v1

# === AMBIENTE ===
VITE_APP_ENV=production

# === NODE VERSION ===
NODE_VERSION=20
```

### 3. Build Settings

No Vercel Dashboard, configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Node Version** | 20.x |

### 4. Otimizações de Performance

#### a) Headers Customizados

Edite `vercel.json` (já existe na raiz):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

#### b) Vite Config - Otimizações

Atualizar `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Otimizações de produção
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs em produção
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Code splitting estratégico
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'supabase': ['@supabase/supabase-js'],
          'charts': ['recharts'],
          'forms': ['react-hook-form', 'zod'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
  },
});
```

### 5. Domínio Customizado

1. **Adicionar domínio**:
   - Settings > Domains
   - Adicione: `app.titanjuros.com.br` (exemplo)

2. **Configurar DNS**:
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   ```

3. **SSL**: Automático (Let's Encrypt)

## 🔒 Segurança em Produção

### Headers de Segurança (já configurados acima)

✅ `X-Content-Type-Options: nosniff`
✅ `X-Frame-Options: DENY`
✅ `X-XSS-Protection: 1; mode=block`
✅ `Referrer-Policy: strict-origin-when-cross-origin`

### CSP (Content Security Policy)

Adicionar ao `vercel.json`:

```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://wgycuyrkkqwwegazgvcb.supabase.co https://accounts.google.com; frame-src https://accounts.google.com;"
}
```

## 📊 Monitoramento

### Analytics Vercel

1. Ativar Vercel Analytics:
   ```bash
   npm i @vercel/analytics
   ```

2. Adicionar ao `main.tsx`:
   ```typescript
   import { Analytics } from '@vercel/analytics/react';
   
   // ...
   <Analytics />
   ```

### Web Vitals

```typescript
import { onCLS, onFID, onLCP } from 'web-vitals';

function sendToAnalytics(metric) {
  console.log(metric);
  // Enviar para seu serviço de analytics
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
```

## 🚀 Deploy Automático

### Branches

| Branch | Deploy | URL |
|--------|--------|-----|
| `main` | Produção | https://titanjuros.vercel.app |
| `develop` | Preview | https://titanjuros-dev.vercel.app |
| `feature/*` | Preview | https://titanjuros-git-feature-*.vercel.app |

### Deploy Manual

```bash
# Produção
vercel --prod

# Preview
vercel
```

## ✅ Checklist Pré-Deploy

- [ ] Todas as env vars configuradas
- [ ] `.env` NÃO está no repositório (confirmar .gitignore)
- [ ] Build local funciona: `npm run build`
- [ ] Testes passam: `npm run test:run`
- [ ] Console.logs removidos de código crítico
- [ ] Vercel.json configurado
- [ ] DNS configurado (se usar domínio customizado)
- [ ] Backup do banco configurado
- [ ] RLS policies ativas no Supabase

## 🔄 CI/CD com GitHub Actions

Criar `.github/workflows/vercel-deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test:run
        
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_GOOGLE_GEMINI_API_KEY: ${{ secrets.VITE_GOOGLE_GEMINI_API_KEY }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 🐛 Troubleshooting

### Erro: "Module not found"
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Build timeout
- Aumentar limite no Vercel (Settings > General > Build & Development Settings)
- Ou otimizar imports: `import { Button } from '@/components/ui/button'`

### Environment variables não funcionam
- Verificar prefixo `VITE_`
- Rebuild do projeto após adicionar vars

## 📱 Progressive Web App (PWA)

Para transformar em PWA:

```bash
npm i vite-plugin-pwa -D
```

Configurar `vite.config.ts`:
```typescript
import { VitePWA } from 'vite-plugin-pwa';

plugins: [
  VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: 'TitanJuros',
      short_name: 'TitanJuros',
      description: 'Sistema de Gestão de Empréstimos',
      theme_color: '#1e40af',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  })
]
```

## 📞 Suporte

- [Vercel Docs](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Status Page](https://www.vercel-status.com/)
