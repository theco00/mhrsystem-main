# ℹ️ Avisos CSS - Tailwind CSS

## 🟡 Avisos "Unknown at rule" - PODE IGNORAR

Os avisos que você está vendo no `index.css` são **normais e esperados** quando se usa Tailwind CSS:

```
Unknown at rule @tailwind
Unknown at rule @apply
```

### Por que isso acontece?

1. **@tailwind** e **@apply** são diretivas específicas do Tailwind CSS
2. O linter CSS padrão não reconhece essas diretivas customizadas
3. Durante o build, o PostCSS processa essas diretivas corretamente
4. O código funciona perfeitamente - são apenas avisos do editor

### ✅ Solução Implementada

Criamos um arquivo `.stylelintrc.json` que configura o linter para ignorar essas diretivas do Tailwind:

```json
{
  "rules": {
    "at-rule-no-unknown": [
      true,
      {
        "ignoreAtRules": [
          "tailwind",
          "apply",
          "layer",
          "variants",
          "responsive",
          "screen"
        ]
      }
    ]
  }
}
```

### 📦 Extensões Recomendadas

Para melhor suporte ao Tailwind CSS no VS Code, instale:

1. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
   - Autocomplete para classes Tailwind
   - Syntax highlighting
   - Linting

2. **Stylelint** (`stylelint.vscode-stylelint`)
   - Linting CSS com suporte a Tailwind
   - Usa o arquivo `.stylelintrc.json`

### 🔧 Configuração Manual (Opcional)

Se os avisos ainda aparecerem, você pode configurar manualmente no VS Code:

1. Abra as configurações (Ctrl + ,)
2. Procure por "css.lint.unknownAtRules"
3. Defina como "ignore"

Ou adicione no seu `settings.json` pessoal:

```json
{
  "css.lint.unknownAtRules": "ignore",
  "scss.lint.unknownAtRules": "ignore"
}
```

### ✨ Resumo

- ✅ Os avisos são **normais** e **não afetam o funcionamento**
- ✅ O código compila e funciona perfeitamente
- ✅ Configuração do Stylelint criada
- ✅ Extensões recomendadas listadas
- ✅ Pode ignorar os avisos com segurança

---

**Nota**: Esses avisos aparecem apenas no editor. O build de produção funciona perfeitamente sem problemas.
