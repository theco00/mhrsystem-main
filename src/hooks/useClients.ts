import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextClean';
import { useToast } from '@/hooks/use-toast';

// Interface de Cliente do sistema
export interface Client {
  id: string;
  user_id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  address: string;
  income: number;
  credit_score: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

/**
 * Hook customizado para gerenciamento de clientes:
 * - Busca, cadastro, exclusão (soft)
 * - Feedbacks e loading state
 * - Pronto para evoluir para React Query/Suspense
 */
export function useClients() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Busca lista de clientes do usuário logado
  const fetchClients = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setClients((data as Client[]) || []);
    } catch (error: any) {
      toast({ title: 'Erro ao carregar clientes', description: error.message, variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (user) {
      fetchClients().finally(() => setIsLoading(false));
      
      // Setup realtime subscription for clients
      const channel = supabase
        .channel('clients_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'clients',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Client change detected:', payload);
            fetchClients();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setClients([]);
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Adiciona novo cliente
   */
  const addClient = async (clientData: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({ ...clientData, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      await fetchClients();
      toast({ title: 'Cliente adicionado!', description: `${clientData.name} foi cadastrado com sucesso` });
      return data;
    } catch (error: any) {
      toast({ title: 'Erro ao adicionar cliente', description: error.message, variant: 'destructive' });
      return null;
    }
  };

  /**
   * Soft delete de clientes sem empréstimos ativos
   */
  const deleteClient = async (clientId: string, loans: any[]) => {
    if (!user) return false;
    try {
      // Não exclui se há empréstimos ativos
      const activeLoans = loans.filter(loan => loan.client_id === clientId && loan.status === 'active' && !loan.deleted_at);
      if (activeLoans.length > 0) {
        toast({
          title: 'Não é possível excluir',
          description: 'Cliente possui empréstimos ativos. Quite os empréstimos antes de excluir o cliente.',
          variant: 'destructive',
        });
        return false;
      }
      // Soft delete
      const { error } = await supabase
        .from('clients')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', clientId)
        .eq('user_id', user.id);
      if (error) throw error;
      await fetchClients();
      toast({ title: 'Cliente excluído!', description: 'Cliente foi removido com sucesso' });
      return true;
    } catch (error: any) {
      toast({ title: 'Erro ao excluir cliente', description: error.message, variant: 'destructive' });
      return false;
    }
  };

  return {
    clients,
    isLoading,
    addClient,
    deleteClient,
    refetchClients: fetchClients,
  };
}
