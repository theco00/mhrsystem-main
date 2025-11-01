import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, RotateCcw } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { Client } from '@/hooks/useSupabaseData';
import { formatPhone, generateDefaultMessage, openWhatsApp } from '@/lib/whatsapp-utils';
import { useCompanySettings } from '@/hooks/useCompanySettings';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
}

/**
 * Modal para enviar mensagem via WhatsApp
 * Permite editar mensagem antes de enviar
 */
export function WhatsAppModal({ isOpen, onClose, client }: WhatsAppModalProps) {
  const { settings } = useCompanySettings();
  const companyName = settings?.company_name || 'nossa empresa';
  
  const defaultMessage = generateDefaultMessage(client.name, companyName);
  const [message, setMessage] = useState(defaultMessage);
  const [isSending, setIsSending] = useState(false);

  // Resetar mensagem quando abrir o modal
  useEffect(() => {
    if (isOpen) {
      setMessage(defaultMessage);
    }
  }, [isOpen, defaultMessage]);

  const handleSend = () => {
    setIsSending(true);
    
    // Abrir WhatsApp com mensagem
    openWhatsApp(client.phone, message);
    
    // Pequeno delay para feedback visual
    setTimeout(() => {
      setIsSending(false);
      onClose();
    }, 500);
  };

  const handleResetMessage = () => {
    setMessage(defaultMessage);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-4 sm:p-6">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/10">
              <WhatsAppIcon size={20} />
            </div>
            <span className="truncate">Enviar - {client.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 flex-1 min-h-0 py-3">
          {/* Informações do Cliente */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <WhatsAppIcon size={16} />
            <span className="font-medium">{formatPhone(client.phone)}</span>
          </div>

          {/* Campo de Mensagem */}
          <div className="space-y-2 flex-1 flex flex-col min-h-0">
            <Label htmlFor="message" className="text-sm">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 min-h-[120px] max-h-[200px] resize-none text-sm"
              disabled={isSending}
            />
            <p className="text-xs text-muted-foreground">
              {message.length} caracteres
            </p>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 flex-col sm:flex-row gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetMessage}
            disabled={isSending}
            className="w-full sm:w-auto text-xs sm:text-sm h-9"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Usar Mensagem Padrão</span>
            <span className="sm:hidden">Padrão</span>
          </Button>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSending}
              className="flex-1 sm:flex-none text-xs sm:text-sm h-9"
            >
              Cancelar
            </Button>
            
            <Button
              type="button"
              onClick={handleSend}
              disabled={isSending || !message.trim()}
              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm h-9"
            >
              <WhatsAppIcon size={16} className="mr-1 sm:mr-2" />
              {isSending ? 'Abrindo...' : 'Enviar'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
