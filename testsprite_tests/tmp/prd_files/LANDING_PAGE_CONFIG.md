# 🚀 Configuração da Landing Page - Titan Juros

## 📍 Como Acessar a Landing Page

A landing page está disponível em:
```
http://localhost:8080/landing
```

## 🔗 Configurar Link de Compra da Kivano

Para configurar o link de compra que direciona para a Kivano:

1. Abra o arquivo: `src/components/landing/LandingPage.tsx`

2. Na **linha 27**, você encontrará esta constante:
```typescript
const KIVANO_PURCHASE_URL = "https://kivano.com/titan-juros"; // ⬅️ COLOQUE SEU LINK AQUI
```

3. **Substitua** `"https://kivano.com/titan-juros"` pelo seu link real da Kivano

4. Salve o arquivo e a página será atualizada automaticamente

## 💰 Configurar Preço

Na **linha 28** do mesmo arquivo:
```typescript
const MONTHLY_PRICE = "29,99";
```

Altere o valor conforme necessário. O formato é apenas o número (sem R$).

## 🎨 Características da Landing Page

### Design Moderno e Minimalista
- ✅ Design system integrado ao Titan Juros
- ✅ Cores: Azul Steel (#2D5F87) e Accent (#5B8CB8)
- ✅ Animações suaves e profissionais
- ✅ Totalmente responsivo (mobile, tablet, desktop)
- ✅ Modo claro/escuro automático

### Seções Incluídas
1. **Header** - Com navegação e botão de login
2. **Hero Section** - Título impactante com CTAs
3. **Recursos** - 6 cards com recursos principais
4. **CTA Intermediário** - Reforço de benefícios
5. **Preço** - Card destacado com valor e benefícios
6. **FAQ** - Perguntas frequentes (accordion)
7. **CTA Final** - Última chamada para ação
8. **Footer** - Informações da marca

### Botões de Compra
Todos os botões direcionam para o link da Kivano:
- Botão principal no Hero: "Adquirir o Sistema"
- Botão na seção de preço: "Assinar Agora"
- Botão no CTA final: "Começar Agora - R$ 29,99/mês"

## 🔄 Sistema Dual

A landing page funciona **independentemente** do sistema principal:

- **Landing Page**: `/landing` - Pública (sem login necessário)
- **Sistema**: `/dashboard` - Protegido (requer autenticação)
- **Login**: `/login` - Página de acesso

Ambos rodam no **mesmo código** e compartilham o design system.

## 📱 Testar em Diferentes Dispositivos

1. **Desktop**: http://localhost:8080/landing
2. **Mobile**: Abra as DevTools (F12) e teste no modo responsivo
3. **Modo Escuro**: O tema será detectado automaticamente

## 🎯 Próximos Passos

1. Configure seu link da Kivano no arquivo
2. Acesse `/landing` para visualizar
3. Teste todos os botões de compra
4. Compartilhe o link com seus clientes

## 💡 Dicas

- Mantenha o link da Kivano sempre atualizado
- Teste regularmente se o link está funcionando
- Monitore conversões através da Kivano
- Personalize textos se desejar (são apenas exemplos)

---

**Suporte**: Se precisar de ajuda, consulte a documentação ou entre em contato.
