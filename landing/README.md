# 🚀 Landing Page Ultra-Moderna - Titan Juros

Landing page premium com animações 3D, responsividade avançada e micro-interações.

## 📍 Como Acessar

### Desenvolvimento
```bash
npm run dev
```

Depois acesse:
- **Landing Page Nova (Ultra-Moderna)**: http://localhost:8080/landing
- **Sistema Principal**: http://localhost:8080/

### Produção
```bash
npm run build
npm run preview
```

## 🎨 Estrutura de Componentes

```
landing/
├── src/
│   ├── components/
│   │   ├── LandingPage.tsx          # Componente principal (orquestrador)
│   │   ├── AnimatedBackground.tsx   # Background com partículas 3D
│   │   ├── HeroSection.tsx          # Hero com Three.js e animações
│   │   ├── FeaturesSection.tsx      # Cards neumórficos interativos
│   │   ├── CTASection.tsx           # Call-to-action com stats
│   │   ├── PricingSection.tsx       # Seção de preços animada
│   │   ├── FAQSection.tsx           # FAQ com categorias
│   │   └── FinalCTA.tsx             # CTA final com urgência
│   ├── styles/
│   │   └── landing.css              # Estilos customizados premium
│   └── main.tsx                     # Entry point
└── index.html                       # HTML base

```

## ✨ Recursos Implementados

### Design System Responsivo
- ✅ Breakpoints: Mobile (320px) → Ultra-wide (1920px+)
- ✅ Touch optimization (44x44px mínimo)
- ✅ Safe areas para notch/punch-holes
- ✅ Tipografia fluida com clamp()

### Animações 3D
- ✅ Partículas interativas com Canvas API
- ✅ Three.js para elementos 3D (desktop)
- ✅ Fallback 2D para mobile/sem WebGL
- ✅ Parallax em múltiplas camadas

### Componentes Premium
- ✅ Cards glassmorphism (backdrop-blur)
- ✅ Cards neumórficos (sombras 3D)
- ✅ Hover effects com perspectiva 3D
- ✅ Magnetic cursor (desktop)
- ✅ Counter animations com easing

### Performance
- ✅ Lazy loading de componentes
- ✅ Code splitting dinâmico
- ✅ Suspense boundaries
- ✅ WebGL detection automática
- ✅ Device detection para otimizações

### Acessibilidade
- ✅ Reduced motion support
- ✅ ARIA labels completos
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader friendly

## 🎯 Configuração

### URLs Importantes
Edite em `LandingPage.tsx`:

```typescript
const KIVANO_PURCHASE_URL = "https://kivano.com/titan-juros"; // URL de compra
const MONTHLY_PRICE = "29,99"; // Preço mensal
const SYSTEM_URL = "/"; // URL do sistema
```

### Cores do Projeto
As cores atuais do projeto são mantidas:
- **Primária**: Azul (#2196f3)
- **Secundária**: Cyan (#06B6D4)
- **Acentos**: Verde, tons de cinza

## 📱 Responsividade

### Desktop (1024px+)
- Animações 3D completas
- Partículas: 150+
- Parallax: 5 camadas
- Magnetic cursor

### Tablet (768px - 1024px)
- Partículas: 100
- Grid 2x1
- Touch gestures
- Parallax moderado

### Mobile (< 768px)
- Partículas: 50 (2D)
- Cards empilhados
- Menu hambúrguer
- Otimizações de performance

## 🔧 Tecnologias

- **React 18** + TypeScript
- **Framer Motion** - Animações
- **Three.js** + React Three Fiber - 3D
- **TailwindCSS** - Styling
- **React CountUp** - Counter animations
- **React Intersection Observer** - Scroll animations

## 🚀 Deploy

Para fazer deploy da landing page:

```bash
# Build
npm run build

# Preview
npm run preview
```

Os arquivos compilados estarão em `dist/landing/`.

## 📝 Notas

- A landing page é **standalone** e não depende do sistema principal
- Todos os componentes são **lazy loaded** para melhor performance
- Suporte completo para **reduced motion** (acessibilidade)
- **WebGL fallback** automático para dispositivos sem suporte
- **Mobile-first** approach em todo o design

## 🎨 Customização

Para customizar cores, edite:
1. `tailwind.config.ts` - Cores do Tailwind
2. `landing/src/styles/landing.css` - Estilos customizados
3. Componentes individuais - Props e configurações

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação dos componentes ou entre em contato com a equipe de desenvolvimento.
