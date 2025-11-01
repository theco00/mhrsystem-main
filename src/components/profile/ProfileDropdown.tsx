import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Settings, 
  LogOut, 
  Building2,
  Mail,
  Phone,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextClean';
import { useRoles } from '@/contexts/RolesContext';
import { AdminBadge } from '@/components/admin/AdminBadge';

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useRoles();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="hover-scale btn-hover">
          <User className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">
                  {user?.user_metadata?.full_name || 'Usuário'}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-muted-foreground truncate">
                    {user?.email}
                  </p>
                  <AdminBadge />
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {/* User Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{user?.email}</span>
              </div>
              
              {user?.user_metadata?.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{user.user_metadata.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span>TitanJuros</span>
              </div>
              
              {isAdmin() && (
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-primary" />
                  <Badge variant="default" className="text-xs">
                    Administrador
                  </Badge>
                </div>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 hover-scale"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Configurações
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 hover-scale"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                Sair da Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
