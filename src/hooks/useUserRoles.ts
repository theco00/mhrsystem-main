import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextClean';

// Definição dos tipos de roles existentes no sistema
export type AppRole = 'admin' | 'user';

/**
 * Hook customizado para buscar e checar roles do usuário logado.
 * - Busca roles na tabela 'user_roles' do Supabase
 * - Retorna utilitários para validação de permissão
 * - Pronto para extensão com Suspense ou ErrorBoundary futuramente
 */
export function useUserRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setIsLoading(false);
      return;
    }

    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        if (error) throw error;
        setRoles(data?.map(item => item.role as AppRole) || []);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoles();
  }, [user]);

  /**
   * Verifica se o usuário possui determinado role.
   */
  const hasRole = (role: AppRole): boolean => roles.includes(role);
  /**
   * Verifica se usuário é admin.
   */
  const isAdmin = (): boolean => hasRole('admin');

  return {
    roles,
    isLoading,
    hasRole,
    isAdmin,
  };
}