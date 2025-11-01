/**
 * Utilitários para integração com WhatsApp
 * Funções para formatação, validação e geração de links
 */

/**
 * Remove caracteres especiais do telefone, mantendo apenas números
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Valida se o telefone tem formato válido (10-11 dígitos)
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = cleanPhone(phone);
  return cleaned.length >= 10 && cleaned.length <= 11;
}

/**
 * Formata telefone para exibição: (11) 98765-4321
 */
export function formatPhone(phone: string): string {
  const cleaned = cleanPhone(phone);
  
  if (cleaned.length === 11) {
    // Celular: (11) 98765-4321
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    // Fixo: (11) 3456-7890
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone; // Retorna original se não conseguir formatar
}

/**
 * Gera link do WhatsApp com código do país (Brasil = 55)
 */
export function generateWhatsAppLink(phone: string): string {
  const cleaned = cleanPhone(phone);
  
  if (!isValidPhone(phone)) {
    return '';
  }
  
  // Adiciona código do país se não tiver
  const phoneWithCountry = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
  
  return `https://wa.me/${phoneWithCountry}`;
}

/**
 * Gera link do WhatsApp com mensagem pré-preenchida
 */
export function generateWhatsAppLinkWithMessage(phone: string, message: string): string {
  const baseLink = generateWhatsAppLink(phone);
  
  if (!baseLink) {
    return '';
  }
  
  // Encode da mensagem para URL
  const encodedMessage = encodeURIComponent(message);
  
  return `${baseLink}?text=${encodedMessage}`;
}

/**
 * Gera mensagem padrão personalizada com nome do cliente
 */
export function generateDefaultMessage(clientName: string, companyName: string = 'nossa empresa'): string {
  return `Olá ${clientName}, tudo bem?

Estou entrando em contato da ${companyName}.

Como posso ajudar você hoje?`;
}

/**
 * Abre WhatsApp em nova aba
 */
export function openWhatsApp(phone: string, message?: string): void {
  let link: string;
  
  if (message) {
    link = generateWhatsAppLinkWithMessage(phone, message);
  } else {
    link = generateWhatsAppLink(phone);
  }
  
  if (link) {
    window.open(link, '_blank', 'noopener,noreferrer');
  }
}
