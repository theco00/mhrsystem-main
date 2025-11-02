# 🎨 NOVA PALETA DE CORES - LANDING PAGE

## 📊 Cores Implementadas

### Cores de Fundo (Gradientes)
```css
--bg-dark: #0a1628        /* Azul escuro/quase preto (topo) */
--bg-medium: #1a3a52      /* Azul médio escuro (meio) */
--bg-petrol: #0d2235      /* Azul petróleo escuro (geral) */
--bg-card: #1E3A52        /* Azul escuro (fundo dos cards) */
```

### Cores de Texto
```css
--text-white: #FFFFFF     /* Branco (logo, textos principais) */
--text-secondary: #8B9DAF /* Cinza azulado (textos secundários/subtítulos) */
```

### Cores de Destaque (Accent)
```css
--accent-blue: #4A90E2         /* Azul claro principal */
--accent-blue-light: #5B9FE3   /* Azul claro (palavra "Empréstimos") */
--accent-blue-dark: #2C5282    /* Azul escuro (letra "T" no logo) */
--accent-google: #4285F4       /* Azul Google (ícone do Google) */
```

## 🔄 Arquivos Modificados

### 1. `landing/src/styles/landing.css`
- ✅ Adicionadas variáveis CSS no `:root`
- ✅ Cores disponíveis via `var(--bg-dark)`, etc.

### 2. `tailwind.config.ts`
- ✅ Cores adicionadas ao tema do Tailwind
- ✅ Disponíveis como classes: `bg-brand-dark`, `text-brand-blue`, etc.

### 3. `landing/index.html`
- ✅ Meta theme-color atualizado para `#0a1628`

### 4. `landing/src/components/LandingPage.tsx`
- ✅ Gradiente de fundo: `from-[#0a1628] via-[#0d2235] to-[#1a3a52]`
- ✅ Logo: gradiente `from-[#4A90E2] to-[#5B9FE3]`
- ✅ Botões: `from-[#2C5282] to-[#1a3a52]`

### 5. `landing/src/components/HeroSection.tsx`
- ✅ Badge: `text-[#4A90E2]` e `text-[#5B9FE3]`
- ✅ Título destacado: gradiente `from-[#4A90E2] via-[#5B9FE3] to-[#4285F4]`
- ✅ Underline: gradiente `from-[#4A90E2] to-[#5B9FE3]`
- ✅ Botão CTA: `from-[#2C5282] to-[#1a3a52]`

### 6. `landing/src/components/PricingSection.tsx`
- ✅ Background animado: `from-[#2C5282]/20` e `to-[#1a3a52]/20`
- ✅ Círculos flutuantes: `bg-[#2C5282]/10` e `bg-[#1a3a52]/10`
- ✅ Badge: `text-[#4A90E2]`
- ✅ Título: gradiente `from-[#4A90E2] via-[#5B9FE3] to-[#4285F4]`
- ✅ Partículas: `bg-[#4A90E2]/30`
- ✅ Botões: `from-[#2C5282] to-[#1a3a52]`
- ✅ Ícones: `text-[#4A90E2]`

## 🎯 Como Usar as Novas Cores

### Via CSS Variables
```css
.meu-elemento {
  background-color: var(--bg-dark);
  color: var(--text-white);
  border-color: var(--accent-blue);
}
```

### Via Tailwind Classes
```jsx
<div className="bg-brand-dark text-white border-brand-blue">
  <span className="text-brand-blue-light">Texto</span>
</div>
```

### Via Inline Styles (Componentes React)
```jsx
<div className="bg-gradient-to-r from-[#4A90E2] to-[#5B9FE3]">
  Gradiente
</div>
```

## 🌈 Exemplos de Gradientes

### Gradiente de Fundo Principal
```jsx
className="bg-gradient-to-br from-[#0a1628] via-[#0d2235] to-[#1a3a52]"
```

### Gradiente de Texto (Títulos)
```jsx
className="bg-gradient-to-r from-[#4A90E2] via-[#5B9FE3] to-[#4285F4] bg-clip-text text-transparent"
```

### Gradiente de Botões
```jsx
className="bg-gradient-to-r from-[#2C5282] to-[#1a3a52]"
```

## ✨ Antes vs Depois

### Antes (Cores Antigas)
- Fundo: `#0D2F4B`, `#0A2741`, `#06182A`
- Accent: `#74A9D8`, `#6CA0D2`, `#76B5E2`
- Botões: `#154C78`, `#0F4C81`

### Depois (Cores Novas)
- Fundo: `#0a1628`, `#0d2235`, `#1a3a52`
- Accent: `#4A90E2`, `#5B9FE3`, `#4285F4`
- Botões: `#2C5282`, `#1a3a52`

---

**Status**: ✅ TODAS AS CORES ATUALIZADAS
**Data**: 27/10/2025
**Servidor**: http://localhost:8080
