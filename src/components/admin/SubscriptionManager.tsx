import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, Calendar, CreditCard, User, Shield } from 'lucide-react';

export function SubscriptionManager() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchUserId, setSearchUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  // Formulário de assinatura
  const [formData, setFormData] = useState({
    status: 'active' as 'active' | 'inactive' | 'cancelled' | 'expired',
    plan_type: 'monthly' as 'monthly' | 'yearly',
    payment_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 dias
  });

  // Buscar usuário por ID
  const handleSearchUser = async () => {
    if (!searchUserId.trim()) {
      toast({
        title: "⚠️ Campo vazio",
        description: "Digite um User ID para buscar",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Buscar assinatura existente (usando query direta sem tipagem)
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions' as any)
        .select('*')
        .eq('user_id', searchUserId)
        .maybeSingle();

      if (subError) {
        console.error('Erro ao buscar assinatura:', subError);
      }

      // Buscar email do usuário
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      
      const user = users?.find((u: any) => u.id === searchUserId);
      
      if (!user) {
        toast({
          title: "❌ Usuário não encontrado",
          description: "Verifique se o ID está correto",
          variant: "destructive"
        });
        setUserEmail('');
        setCurrentSubscription(null);
        setIsLoading(false);
        return;
      }

      setUserEmail(user.email || 'Sem email');
      setCurrentSubscription(subscription as any);

      // Se já tem assinatura, preencher formulário
      if (subscription) {
        const sub = subscription as any;
        setFormData({
          status: sub.status,
          plan_type: sub.plan_type,
          payment_id: sub.payment_id || '',
          payment_date: sub.payment_date?.split('T')[0] || new Date().toISOString().split('T')[0],
          expiry_date: sub.expiry_date?.split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
      } else {
        // Reset form se não tem assinatura
        setFormData({
          status: 'inactive',
          plan_type: 'monthly',
          payment_id: '',
          payment_date: new Date().toISOString().split('T')[0],
          expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
      }

      toast({
        title: "✅ Usuário encontrado",
        description: `Email: ${user.email}`,
      });
    } catch (error: any) {
      console.error('Erro:', error);
      toast({
        title: "❌ Erro ao buscar usuário",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Ações rápidas
  const handleActivate = async () => {
    if (!searchUserId.trim()) {
      toast({
        title: "⚠️ Nenhum usuário selecionado",
        description: "Busque um usuário primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      const subscriptionData = {
        user_id: searchUserId,
        status: 'active',
        plan_type: 'monthly',
        payment_id: `MANUAL-${Date.now()}`,
        payment_date: new Date().toISOString(),
        expiry_date: expiryDate.toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_subscriptions' as any)
        .upsert(subscriptionData, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSubscription(data);
      await handleSearchUser(); // Recarregar dados

      toast({
        title: "✅ Assinatura ativada!",
        description: "Válida por 30 dias",
      });
    } catch (error: any) {
      console.error('Erro:', error);
      toast({
        title: "❌ Erro ao ativar assinatura",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!searchUserId.trim() || !currentSubscription) {
      toast({
        title: "⚠️ Nenhuma assinatura encontrada",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_subscriptions' as any)
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', searchUserId)
        .select()
        .single();

      if (error) throw error;

      setCurrentSubscription(data);
      await handleSearchUser();

      toast({
        title: "✅ Assinatura desativada!",
      });
    } catch (error: any) {
      console.error('Erro:', error);
      toast({
        title: "❌ Erro ao desativar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtend = async () => {
    if (!searchUserId.trim() || !currentSubscription) {
      toast({
        title: "⚠️ Nenhuma assinatura encontrada",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const currentExpiry = currentSubscription.expiry_date 
        ? new Date(currentSubscription.expiry_date)
        : new Date();
      
      currentExpiry.setMonth(currentExpiry.getMonth() + 1);

      const { data, error } = await supabase
        .from('user_subscriptions' as any)
        .update({ 
          expiry_date: currentExpiry.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', searchUserId)
        .select()
        .single();

      if (error) throw error;

      setCurrentSubscription(data);
      await handleSearchUser();

      toast({
        title: "✅ Assinatura prorrogada!",
        description: "+30 dias adicionados",
      });
    } catch (error: any) {
      console.error('Erro:', error);
      toast({
        title: "❌ Erro ao prorrogar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!searchUserId.trim() || !currentSubscription) {
      toast({
        title: "⚠️ Nenhuma assinatura encontrada",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_subscriptions' as any)
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', searchUserId)
        .select()
        .single();

      if (error) throw error;

      setCurrentSubscription(data);
      await handleSearchUser();

      toast({
        title: "✅ Assinatura cancelada!",
      });
    } catch (error: any) {
      console.error('Erro:', error);
      toast({
        title: "❌ Erro ao cancelar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Gerenciador de Assinaturas
          </CardTitle>
          <CardDescription>
            Ative, desative ou modifique assinaturas de usuários manualmente
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Buscar Usuário */}
          <div className="space-y-2">
            <Label htmlFor="userId" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              User ID
            </Label>
            <div className="flex gap-2">
              <Input
                id="userId"
                placeholder="Digite o User ID (UUID)"
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                className="font-mono"
              />
              <Button onClick={handleSearchUser} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
              </Button>
            </div>
            {userEmail && (
              <p className="text-sm text-muted-foreground">
                📧 Email: <span className="font-semibold">{userEmail}</span>
              </p>
            )}
          </div>

          {/* Status Atual */}
          {currentSubscription && (() => {
            const sub = currentSubscription as any;
            return (
              <Card className="bg-slate-50 dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="text-lg">Status Atual da Assinatura</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        {sub.status === 'active' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-semibold capitalize">{sub.status}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Plano</p>
                      <p className="font-semibold capitalize mt-1">{sub.plan_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Pagamento</p>
                      <p className="font-semibold mt-1">
                        {sub.payment_date 
                          ? new Date(sub.payment_date).toLocaleDateString('pt-BR')
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Expiração</p>
                      <p className="font-semibold mt-1">
                        {sub.expiry_date 
                          ? new Date(sub.expiry_date).toLocaleDateString('pt-BR')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Ações de Gerenciamento */}
          {searchUserId && userEmail && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-4">
                Ações de Gerenciamento
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {/* Ativar Assinatura */}
                <Button
                  onClick={handleActivate}
                  disabled={isLoading}
                  className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <CheckCircle className="h-6 w-6" />
                  <span>Ativar Assinatura</span>
                  <span className="text-xs opacity-80">(+30 dias)</span>
                </Button>

                {/* Desativar Assinatura */}
                <Button
                  onClick={handleDeactivate}
                  disabled={isLoading || !currentSubscription}
                  variant="destructive"
                  className="h-20 flex-col gap-2"
                  size="lg"
                >
                  <XCircle className="h-6 w-6" />
                  <span>Desativar</span>
                  <span className="text-xs opacity-80">(Bloquear acesso)</span>
                </Button>

                {/* Prorrogar Assinatura */}
                <Button
                  onClick={handleExtend}
                  disabled={isLoading || !currentSubscription}
                  className="h-20 flex-col gap-2 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Calendar className="h-6 w-6" />
                  <span>Prorrogar</span>
                  <span className="text-xs opacity-80">(+30 dias)</span>
                </Button>

                {/* Cancelar Assinatura */}
                <Button
                  onClick={handleCancel}
                  disabled={isLoading || !currentSubscription}
                  variant="outline"
                  className="h-20 flex-col gap-2 border-red-600 text-red-600 hover:bg-red-50"
                  size="lg"
                >
                  <XCircle className="h-6 w-6" />
                  <span>Cancelar</span>
                  <span className="text-xs opacity-80">(Status: cancelled)</span>
                </Button>
              </div>
            </div>
          )}

          {/* Instruções */}
          {!searchUserId && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">💡 Como usar:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Digite o User ID do usuário</li>
                <li>Clique em "Buscar" para carregar dados</li>
                <li>Veja o status atual da assinatura</li>
                <li>Use os botões para gerenciar a assinatura</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
