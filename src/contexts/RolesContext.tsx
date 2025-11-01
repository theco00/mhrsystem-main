import React, { createContext, useContext, ReactNode } from 'react';
import { useUserRoles, AppRole } from '@/hooks/useUserRoles';

// Interface do contexto de roles/permissão
interface RolesContextType {
  roles: AppRole[];
  isLoading: boolean;
  hasRole: (role: AppRole) => boolean;
  isAdmin: () => boolean;
}

const RolesContext = createContext<RolesContextType | undefined>(undefined);

/**
 * Provider para roles/permissions.
 * Veja App.tsx/root para escopo global recomendado.
 */
export function RolesProvider({ children }: { children: ReactNode }) {
  const rolesData = useUserRoles();
  return (
    <RolesContext.Provider value={rolesData}>
      {children}
    </RolesContext.Provider>
  );
}

// Hook customizado para consumir contexto de roles
export function useRoles() {
  const context = useContext(RolesContext);
  if (context === undefined) {
    throw new Error('useRoles must be used within a RolesProvider');
  }
  return context;
}