import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User } from 'lucide-react';
import { Client } from '@/hooks/useSupabaseData';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { WhatsAppModal } from '@/components/clients/WhatsAppModal';
import { isValidPhone, formatPhone } from '@/lib/whatsapp-utils';

interface ClientListWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
}

/**
 * Modal que lista todos os clientes com botão WhatsApp
 * Permite buscar e enviar mensagem para qualquer cliente
 */
export function ClientListWhatsAppModal({ isOpen, onClose, clients }: ClientListWhatsAppModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Filtrar clientes por nome ou telefone
  const filteredClients = clients.filter((client) => {
    const search = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(search) ||
      client.phone?.includes(search) ||
      client.email?.toLowerCase().includes(search)
    );
  });

  // Apenas clientes com telefone válido
  const clientsWithPhone = filteredClients.filter(
    (client) => client.phone && isValidPhone(client.phone)
  );

  const handleOpenWhatsApp = (client: Client) => {
    setSelectedClient(client);
  };

  const handleCloseWhatsApp = () => {
    setSelectedClient(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/10">
                <WhatsAppIcon size={20} className="text-green-600" />
              </div>
              <span className="truncate">Enviar WhatsApp</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 flex-1 min-h-0 py-3">
            {/* Campo de Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, telefone ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Estatísticas */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>
                <strong>{clientsWithPhone.length}</strong> clientes com WhatsApp
              </span>
              {searchTerm && (
                <span>
                  <strong>{filteredClients.length}</strong> resultados
                </span>
              )}
            </div>

            {/* Lista de Clientes */}
            <ScrollArea className="flex-1 min-h-0 pr-2 sm:pr-4">
              {clientsWithPhone.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <User className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-foreground mb-2">
                    {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente com WhatsApp'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm
                      ? 'Tente ajustar os termos de busca'
                      : 'Cadastre clientes com telefone válido'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {clientsWithPhone.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors gap-2 sm:gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate text-sm sm:text-base">
                          {client.name}
                        </h4>
                        <div className="flex flex-col gap-0.5 sm:gap-1 mt-1">
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            📞 {formatPhone(client.phone)}
                          </p>
                          {client.email && (
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              📧 {client.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleOpenWhatsApp(client)}
                        className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0 h-8 sm:h-9"
                        size="sm"
                      >
                        <WhatsAppIcon size={18} className="sm:mr-2" />
                        <span className="hidden sm:inline">Enviar</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de WhatsApp */}
      {selectedClient && (
        <WhatsAppModal
          isOpen={!!selectedClient}
          onClose={handleCloseWhatsApp}
          client={selectedClient}
        />
      )}
    </>
  );
}
