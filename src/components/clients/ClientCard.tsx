import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, Mail, Phone, MapPin, DollarSign } from 'lucide-react';
import { Client } from '@/hooks/useSupabaseData';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { isValidPhone } from '@/lib/whatsapp-utils';

interface ClientCardProps {
  client: Client;
  onViewDetails: () => void;
  onDelete: () => void;
  onWhatsApp: () => void;
  formatCurrency: (value: number) => string;
  formatDate: (date: string) => string;
}

/**
 * Card de cliente otimizado para mobile
 * Exibe todas as informações sem precisar scroll horizontal
 */
export function ClientCard({
  client,
  onViewDetails,
  onDelete,
  onWhatsApp,
  formatCurrency,
  formatDate,
}: ClientCardProps) {
  return (
    <div className="bg-card border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
      {/* Header com Nome e Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{client.name}</h3>
          <p className="text-sm text-muted-foreground">{client.cpf}</p>
        </div>
        <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="flex-shrink-0">
          {client.status === 'active' ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>

      {/* Informações de Contato */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{client.email}</span>
        </div>
        
        {client.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>{client.phone}</span>
            {isValidPhone(client.phone) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-green-50 rounded-full ml-auto"
                onClick={onWhatsApp}
              >
                <WhatsAppIcon size={20} />
              </Button>
            )}
          </div>
        )}

        {client.address && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{client.address}</span>
          </div>
        )}
      </div>

      {/* Renda e Data */}
      <div className="flex items-center justify-between text-sm pt-2 border-t">
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-success" />
          <span className="font-medium text-success">{formatCurrency(client.income)}</span>
        </div>
        <span className="text-muted-foreground text-xs">
          {formatDate(client.created_at)}
        </span>
      </div>

      {/* Ações */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver Detalhes
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
