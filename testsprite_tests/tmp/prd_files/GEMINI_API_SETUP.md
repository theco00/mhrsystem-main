# 🔧 Configuração da API Google Gemini

## ⚠️ Problema: Chatbot não responde

Se o chatbot está retornando erro ao enviar mensagens, siga estes passos:

---

## 📋 Passo 1: Verificar API Key

Sua API Key atual:
```
AIzaSyB6YRbA1Nq3ekH7ugtTYiI6Khh1pYDNY-Y
```

---

## 🔑 Passo 2: Habilitar a API Gemini no Google Cloud

### **1. Acesse o Google AI Studio:**
👉 https://aistudio.google.com/app/apikey

### **2. Verifique se a API Key está ativa:**
- Clique em "Get API Key"
- Verifique se sua chave está listada
- Se não estiver, crie uma nova

### **3. Habilitar a API Generative Language:**
👉 https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com

- Clique em **"ENABLE"** (Ativar)
- Aguarde alguns segundos para ativação

### **4. Verificar Quotas:**
👉 https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

- Verifique se você tem quotas disponíveis
- Plano gratuito: 60 requisições por minuto

---

## 🧪 Passo 3: Testar a API

### **Teste via cURL:**
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyB6YRbA1Nq3ekH7ugtTYiI6Khh1pYDNY-Y" \
-H 'Content-Type: application/json' \
-d '{
  "contents": [{
    "parts":[{"text": "Olá, você está funcionando?"}]
  }]
}'
```

### **Resposta esperada:**
```json
{
  "candidates": [{
    "content": {
      "parts": [{"text": "Sim, estou funcionando!"}]
    }
  }]
}
```

---

## 🔍 Passo 4: Verificar Erros Comuns

### **Erro 400 - Bad Request:**
- ✅ Verifique se a API key está correta
- ✅ Verifique se o modelo está correto: `gemini-1.5-flash`

### **Erro 403 - Forbidden:**
- ✅ API não habilitada no projeto
- ✅ API key sem permissões
- ✅ Restrições de API key (IP, domínio)

### **Erro 429 - Too Many Requests:**
- ✅ Limite de requisições atingido
- ✅ Aguarde 1 minuto e tente novamente

### **Erro 500 - Internal Server Error:**
- ✅ Problema temporário do Google
- ✅ Tente novamente em alguns minutos

---

## 🛠️ Passo 5: Configurar Restrições (Opcional)

### **Para maior segurança:**

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Clique na sua API Key
3. Em "Application restrictions":
   - Selecione "HTTP referrers"
   - Adicione: `http://localhost:8080/*`
   - Adicione: `https://seu-dominio.com/*`

---

## 📊 Modelos Disponíveis

### **Gratuitos:**
- ✅ `gemini-1.5-flash` - **RECOMENDADO** (rápido)
- ✅ `gemini-1.5-pro` - Mais poderoso
- ✅ `gemini-pro` - Versão anterior

### **Limites do Plano Gratuito:**
- 60 requisições por minuto
- 1,500 requisições por dia
- Sem custo

---

## 🔄 Passo 6: Atualizar a API Key no Código

Se precisar trocar a API key:

1. Abra: `src/components/ai/GeminiChatbot.tsx`
2. Encontre a linha:
```typescript
const GOOGLE_API_KEY = 'SUA_NOVA_KEY_AQUI';
```
3. Substitua pela nova chave
4. Salve o arquivo

---

## ✅ Checklist de Verificação

- [ ] API Generative Language habilitada
- [ ] API Key válida e ativa
- [ ] Quotas disponíveis
- [ ] Teste via cURL funcionando
- [ ] Navegador com console aberto (F12)
- [ ] Verificar erros no console do navegador

---

## 🆘 Ainda não funciona?

### **Verifique o Console do Navegador:**
1. Pressione **F12**
2. Vá na aba **Console**
3. Envie uma mensagem no chatbot
4. Copie o erro completo
5. Me envie o erro para análise

### **Erros comuns no console:**
- `Failed to fetch` - Problema de CORS ou rede
- `API key not valid` - API key inválida
- `Model not found` - Modelo incorreto
- `Quota exceeded` - Limite atingido

---

## 📞 Suporte

Se ainda tiver problemas, me envie:
1. Screenshot do erro no chatbot
2. Console do navegador (F12)
3. Resposta do teste cURL

---

**Última atualização:** 23/10/2025
