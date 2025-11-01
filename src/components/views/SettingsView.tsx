import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * SettingsView - Configurações do sistema
 * 
 * Funcionalidades:
 * - Configurações gerais da empresa
 * - Interface responsiva e acessível
 * 
 * @component
 * @returns {JSX.Element} Componente de configurações
 */
export default function SettingsView() {
  const { settings, isLoading, saveSettings } = useCompanySettings();
  const [formData, setFormData] = useState({
    company_name: '',
    company_email: '',
    company_phone: '',
    initial_balance: 0,
    current_balance: 0,
  });

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        company_name: settings.company_name || '',
        company_email: settings.company_email || '',
        company_phone: settings.company_phone || '',
        initial_balance: settings.initial_balance || 0,
        // Mantém o current_balance do formulário se já foi editado, caso contrário usa o do banco
        current_balance: prev.current_balance !== 0 ? prev.current_balance : (settings.current_balance || 0),
      }));
    }
  }, [settings]);

  const handleSaveGeneralSettings = async () => {
    await saveSettings({
      company_name: formData.company_name,
      company_email: formData.company_email,
      company_phone: formData.company_phone,
      initial_balance: formData.initial_balance,
      current_balance: formData.current_balance,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações gerais do sistema</p>
        </div>
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl glass-card-premium border border-white/10">
            <CardContent className="p-6">
              <Skeleton className="h-96 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-4 md:mb-6 text-center">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1 md:mb-2">Configurações</h1>
        <p className="text-muted-foreground text-sm md:text-base">Gerencie as configurações gerais do sistema</p>
      </div>

      {/* Card Centralizado */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
        <Card className="glass-card-premium border border-white/10 hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Nome da Empresa</Label>
              <Input 
                id="company" 
                placeholder="Sua Financeira Ltda." 
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email da Empresa</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="contato@suafinanceira.com" 
                value={formData.company_email}
                onChange={(e) => setFormData({...formData, company_email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                placeholder="(11) 3000-0000" 
                value={formData.company_phone}
                onChange={(e) => setFormData({...formData, company_phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initial_balance">Saldo Inicial (R$)</Label>
              <Input 
                id="initial_balance" 
                type="number"
                step="0.01"
                placeholder="0.00" 
                value={formData.initial_balance}
                onChange={(e) => setFormData({...formData, initial_balance: parseFloat(e.target.value) || 0})}
              />
              <p className="text-xs text-muted-foreground">
                Defina o capital inicial disponível para empréstimos
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_balance">Saldo Atual (R$)</Label>
              <div className="flex gap-2">
                <Input 
                  id="current_balance" 
                  type="number"
                  step="0.01"
                  placeholder="0.00" 
                  value={formData.current_balance}
                  onChange={(e) => setFormData({...formData, current_balance: parseFloat(e.target.value) || 0})}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({...formData, current_balance: settings?.current_balance || 0})}
                  title="Sincronizar com valor do banco de dados"
                >
                  🔄
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Este valor NÃO é atualizado automaticamente ao fazer login. Clique em 🔄 para sincronizar com o banco.
              </p>
            </div>
            <Button onClick={handleSaveGeneralSettings} className="w-full min-h-[44px]">
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}