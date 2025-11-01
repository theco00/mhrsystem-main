import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseData, Client } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { ClientDetailsDialog } from '@/components/clients/ClientDetailsDialog';
import { WhatsAppModal } from '@/components/clients/WhatsAppModal';
import { ClientCard } from '@/components/clients/ClientCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { isValidPhone } from '@/lib/whatsapp-utils';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { useTrialLimits } from '@/hooks/useTrialLimits';
import { TrialLimitAlert } from '@/components/trial/TrialLimitAlert';
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Phone, 
  Mail, 
  MapPin,
  TrendingUp,
  Users,
  Trash2,
  MessageCircle
} from 'lucide-react';

/**
 * ClientsView - Gestão de clientes
 * 
 * Funcionalidades:
 * - Lista todos os clientes cadastrados
 * - Busca e filtros avançados
 * - Adicionar novos clientes
 * - Visualizar detalhes do cliente
 * - Excluir clientes (com confirmação)
 * - Estatísticas de clientes
 * - Interface responsiva e acessível
 * 
 * @component
 * @returns {JSX.Element} Componente de gestão de clientes
 */
export default function ClientsView() {
  // Hooks e estados
  const { clients, addClient, deleteClient, loans, isLoading } = useSupabaseData();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { limits, isLoading: limitsLoading } = useTrialLimits();
  
  // Estados locais
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [whatsappClient, setWhatsappClient] = useState<Client | null>(null);
  const [showLimitAlert, setShowLimitAlert] = useState(false);
  
  const [newClient, setNewClient] = useState({
    name: '',
    cpf: '',
    email: '',
    phone: '',
    address: '',
    income: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [phoneValidation, setPhoneValidation] = useState<{
    isValid: boolean;
    message: string;
  }>({ isValid: true, message: '' });

  // Validar telefone em tempo real
  const handlePhoneChange = (value: string) => {
    setNewClient({...newClient, phone: value});
    
    if (!value.trim()) {
      setPhoneValidation({ isValid: true, message: '' });
      return;
    }

    const isValid = isValidPhone(value);
    setPhoneValidation({
      isValid,
      message: isValid 
        ? '✓ Número válido para WhatsApp' 
        : '✗ Formato inválido. Use: (11) 98765-4321 ou 11987654321'
    });
  };

  /**
   * Filtra clientes baseado no termo de busca
   * Otimizado com useMemo para evitar recálculos desnecessários
   */
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    
    const term = searchTerm.toLowerCase();
    return clients.filter(client => 
      client.name.toLowerCase().includes(term) ||
      client.cpf.includes(searchTerm) ||
      client.email.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  /**
   * Handler para excluir cliente
   * @param {Client} client - Cliente a ser excluído
   */
  const handleDeleteClient = async (client: Client) => {
    const result = await deleteClient(client.id);
    // Function already shows appropriate toasts
  };

  /**
   * Handler para adicionar novo cliente
   * Valida campos obrigatórios antes de enviar
   */
  const handleAddClient = async () => {
    // Verificar limite do trial PRIMEIRO
    if (!limits.canAddClient && !limits.isUnlimited) {
      setShowLimitAlert(true);
      setIsAddDialogOpen(false);
      return;
    }

    if (!newClient.name || !newClient.cpf || !newClient.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Validar telefone se preenchido
    if (newClient.phone && !phoneValidation.isValid) {
      toast({
        title: "Telefone inválido",
        description: "O número de telefone está em formato inválido. Use: (11) 98765-4321",
        variant: "destructive",
      });
      return;
    }

    const clientData = {
      ...newClient,
      income: parseFloat(newClient.income) || 0,
      credit_score: 0, // Default value
    };

    const result = await addClient(clientData);
    
    if (result) {
      setIsAddDialogOpen(false);
      setNewClient({
        name: '',
        cpf: '',
        email: '',
        phone: '',
        address: '',
        income: '',
        status: 'active',
      });
      setPhoneValidation({ isValid: true, message: '' });
      
      toast({
        title: "Cliente adicionado!",
        description: "Cliente cadastrado com sucesso",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Clientes</h1>
          <p className="text-muted-foreground text-sm md:text-base">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Clientes</h1>
          <p className="text-muted-foreground text-sm md:text-base">Gerencie a base de clientes</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="hover-scale btn-hover min-h-[44px]"
              disabled={!limits.canAddClient && !limits.isUnlimited}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
              {!limits.isUnlimited && (
                <span className="ml-2 text-xs opacity-75 bg-white/20 px-2 py-0.5 rounded-full">
                  {limits.currentClients}/{limits.maxClients}
                </span>
              )}
              {!limits.canAddClient && !limits.isUnlimited && (
                <span className="ml-1">🔒</span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    placeholder="João Silva"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={newClient.cpf}
                    onChange={(e) => setNewClient({...newClient, cpf: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao@email.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      placeholder="(11) 98765-4321 ou 11987654321"
                      value={newClient.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={`pr-10 ${
                        !newClient.phone ? '' :
                        phoneValidation.isValid 
                          ? 'border-green-500 focus-visible:ring-green-500' 
                          : 'border-red-500 focus-visible:ring-red-500'
                      }`}
                    />
                    {newClient.phone && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {phoneValidation.isValid ? (
                          <span className="text-green-600 text-xl">✓</span>
                        ) : (
                          <span className="text-red-600 text-xl">✗</span>
                        )}
                      </div>
                    )}
                  </div>
                  {newClient.phone && (
                    <p className={`text-xs ${
                      phoneValidation.isValid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {phoneValidation.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  placeholder="Rua das Flores, 123 - São Paulo, SP"
                  value={newClient.address}
                  onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="income">Renda Mensal</Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="5000.00"
                    value={newClient.income}
                    onChange={(e) => setNewClient({...newClient, income: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={newClient.status} 
                    onValueChange={(value: 'active' | 'inactive') => 
                      setNewClient({...newClient, status: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="min-h-[44px]"
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddClient} className="min-h-[44px]">
                  Salvar Cliente
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Card className="px-3 py-2 flex-1 min-w-[120px]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full flex-shrink-0"></div>
              <span className="text-xs md:text-sm font-medium">
                {clients.filter(c => c.status === 'active').length} Ativos
              </span>
            </div>
          </Card>
          <Card className="px-3 py-2 flex-1 min-w-[120px]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted-foreground rounded-full flex-shrink-0"></div>
              <span className="text-xs md:text-sm font-medium">
                {clients.filter(c => c.status === 'inactive').length} Inativos
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Mobile Cards or Desktop Table */}
      {isMobile ? (
        <div className="space-y-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="shadow-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground text-base truncate">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">{client.cpf}</p>
                  </div>
                  <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="ml-2 flex-shrink-0">
                    {client.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{formatCurrency(client.income)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 min-h-[44px]"
                    onClick={() => {
                      setSelectedClient(client);
                      setIsDetailsDialogOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o cliente <strong>{client.name}</strong>? 
                          Esta ação não pode ser desfeita.
                          {loans.some(loan => loan.client_id === client.id && loan.status === 'active') && (
                            <span className="block mt-2 text-destructive font-medium">
                              ⚠️ Cliente possui empréstimos ativos e não pode ser excluído.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteClient(client)}
                          disabled={loans.some(loan => loan.client_id === client.id && loan.status === 'active')}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile: Cards */}
            <div className="md:hidden space-y-3">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onViewDetails={() => {
                    setSelectedClient(client);
                    setIsDetailsDialogOpen(true);
                  }}
                  onDelete={() => handleDeleteClient(client)}
                  onWhatsApp={() => setWhatsappClient(client)}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              ))}
            </div>

            {/* Desktop: Table */}
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Renda</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.cpf}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="truncate max-w-[150px]">{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span>{client.phone}</span>
                            {isValidPhone(client.phone) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-1.5 hover:bg-green-50 rounded-full"
                                onClick={() => setWhatsappClient(client)}
                                title="Enviar mensagem no WhatsApp"
                              >
                                <WhatsAppIcon size={24} />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-success">{formatCurrency(client.income)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(client.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                        {client.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-[44px] min-w-[44px]"
                          onClick={() => {
                            setSelectedClient(client);
                            setIsDetailsDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o cliente <strong>{client.name}</strong>? 
                                Esta ação não pode ser desfeita.
                                {loans.some(loan => loan.client_id === client.id && loan.status === 'active') && (
                                  <span className="block mt-2 text-destructive font-medium">
                                    ⚠️ Cliente possui empréstimos ativos e não pode ser excluído.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteClient(client)}
                                disabled={loans.some(loan => loan.client_id === client.id && loan.status === 'active')}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {filteredClients.length === 0 && (
        <Card className="shadow-sm border-border/50">
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum cliente encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Tente ajustar os termos de busca" : "Comece adicionando seu primeiro cliente"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="min-h-[44px]">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Cliente
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <ClientDetailsDialog
        client={selectedClient}
        isOpen={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false);
          setSelectedClient(null);
        }}
      />

      {/* Modal WhatsApp */}
      {whatsappClient && (
        <WhatsAppModal
          isOpen={!!whatsappClient}
          onClose={() => setWhatsappClient(null)}
          client={whatsappClient}
        />
      )}

      {/* Modal de Limite do Trial */}
      {showLimitAlert && (
        <TrialLimitAlert
          type="client"
          currentCount={limits.currentClients}
          maxCount={limits.maxClients}
          onClose={() => setShowLimitAlert(false)}
        />
      )}
    </div>
  );
}