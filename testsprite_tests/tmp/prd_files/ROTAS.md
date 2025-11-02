# 🗺️ Guia de Rotas - Titan Juros

## 📍 Estrutura de Rotas

### Rotas Públicas

#### **Landing Page Ultra-Moderna**
```
URL: http://localhost:8080/landing
Arquivo: landing/index.html → landing/src/components/LandingPage.tsx
```
- Landing page premium com animações 3D
- Responsiva e otimizada para todos os dispositivos
- Lazy loading e code splitting
- Acessível via `/landing`

#### **Sistema Principal (Rota Raiz)**
```
URL: http://localhost:8080/
Arquivo: src/App.tsx
```
- Rota raiz do sistema
- Pode mostrar a landing page antiga ou redirecionar

#### **Login**
```
URL: http://localhost:8080/login
Arquivo: src/components/auth/LoginPageSimple.tsx
```
- Página de autenticação
- Redireciona para dashboard se já autenticado

#### **Thank You (Pós-compra)**
```
URL: http://localhost:8080/thank-you
Arquivo: src/components/landing/thank-you/ThankYouPage.tsx
```
- Página de agradecimento após compra
- Instruções de acesso ao sistema

### Rotas Protegidas (Requerem Login)

#### **Dashboard**
```
URL: http://localhost:8080/dashboard
Arquivo: src/components/views/DashboardView.tsx
```
- Visão geral do sistema
- Métricas e estatísticas

#### **Clientes**
```
URL: http://localhost:8080/clients
Arquivo: src/components/views/ClientsView.tsx
```
- Gestão de clientes
- CRUD completo

#### **Empréstimos**
```
URL: http://localhost:8080/loans
Arquivo: src/components/views/LoansView.tsx
```
- Gestão de empréstimos
- Controle de parcelas

#### **Pagamentos**
```
URL: http://localhost:8080/payments
Arquivo: src/components/views/PaymentsView.tsx
```
- Gestão de pagamentos
- Histórico e cobranças

#### **Pagamentos Próximos**
```
URL: http://localhost:8080/upcoming-payments
Arquivo: src/components/views/UpcomingPaymentsView.tsx
```
- Pagamentos a vencer
- Alertas e lembretes

#### **Calculadora**
```
URL: http://localhost:8080/calculator
Arquivo: src/components/views/CalculatorView.tsx
```
- Simulador de empréstimos
- Cálculo de juros

#### **Relatórios**
```
URL: http://localhost:8080/reports
Arquivo: src/components/views/ReportsView.tsx
```
- Relatórios financeiros
- Exportação de dados

#### **Análises**
```
URL: http://localhost:8080/analytics
Arquivo: src/components/views/AnalyticsView.tsx
```
- Análises avançadas
- Gráficos e insights

#### **Configurações**
```
URL: http://localhost:8080/settings
Arquivo: src/components/views/SettingsView.tsx
```
- Configurações do sistema
- Perfil do usuário

#### **Admin Panel**
```
URL: http://localhost:8080/admin
Arquivo: src/components/admin/AdminPanel.tsx
```
- Painel administrativo
- Requer permissões especiais

#### **Entrega do Produto**
```
URL: http://localhost:8080/produto
Arquivo: src/pages/ProductDeliveryNew.tsx
```
- Página de entrega do produto
- Instruções pós-compra

### Rotas Especiais

#### **Assinatura Necessária**
```
URL: http://localhost:8080/subscription-required
Arquivo: src/components/subscription/SubscriptionRequired.tsx
```
- Aviso de assinatura inativa
- Link para renovação

#### **404 - Não Encontrado**
```
URL: Qualquer rota não mapeada
Arquivo: src/pages/NotFound.tsx
```
- Página de erro 404
- Link para voltar ao início

## 🔄 Fluxo de Navegação

### Usuário Não Autenticado
```
1. Acessa landing page (/landing)
2. Clica em "Adquirir Sistema"
3. Vai para página de compra (externa)
4. Retorna para /thank-you
5. Faz login em /login
6. Redirecionado para /dashboard
```

### Usuário Autenticado
```
1. Acessa /login
2. Redirecionado automaticamente para /dashboard
3. Navega livremente entre rotas protegidas
```

### Usuário Sem Assinatura Ativa
```
1. Tenta acessar rota protegida
2. Redirecionado para /subscription-required
3. Renova assinatura
4. Retorna ao sistema
```

## 🛠️ Configuração de Rotas

### Vite Config
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    input: {
      main: path.resolve(__dirname, 'index.html'),
      landing: path.resolve(__dirname, 'landing/index.html'),
    },
  },
}
```

### App.tsx
```typescript
// src/App.tsx
import LandingPage from "../landing/src/components/LandingPage";

<Routes>
  <Route path="/" element={<LandingPage />} />
  {/* ... outras rotas */}
</Routes>
```

## 🚀 Como Usar

### Desenvolvimento
```bash
npm run dev
```
- Sistema principal: http://localhost:8080/
- Landing page nova: http://localhost:8080/landing

### Produção
```bash
npm run build
npm run preview
```

### Deploy
```bash
npm run build
# Deploy da pasta dist/
```

## 📝 Notas Importantes

1. **Landing Page Standalone**: A landing page em `/landing` é independente e não requer autenticação
2. **Rota Raiz**: A rota `/` pode ser configurada para mostrar a landing page ou redirecionar
3. **Proteção de Rotas**: Todas as rotas do sistema principal requerem autenticação
4. **Assinatura**: Algumas rotas também verificam se a assinatura está ativa
5. **404**: Rotas não mapeadas mostram página de erro

## 🔐 Segurança

- ✅ Rotas protegidas por autenticação
- ✅ Verificação de assinatura ativa
- ✅ Redirecionamentos automáticos
- ✅ Proteção contra acesso não autorizado
- ✅ Tokens JWT para autenticação

## 📱 Responsividade

Todas as rotas são responsivas e funcionam em:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Ultra-wide (1920px+)

## 🎨 Customização

Para adicionar novas rotas:

1. Crie o componente da página
2. Adicione a rota em `src/App.tsx`
3. Configure proteção se necessário
4. Adicione ao menu de navegação

## 📞 Suporte

Para dúvidas sobre rotas ou navegação, consulte a documentação ou entre em contato com a equipe de desenvolvimento.
