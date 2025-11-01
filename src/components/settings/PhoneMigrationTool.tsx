import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { migratePhoneNumbers, getPhoneStatistics } from '@/lib/phone-migration';
import { useToast } from '@/hooks/use-toast';

/**
 * Ferramenta para migração e formatação de números de telefone
 * Permite formatar todos os telefones existentes no banco de dados
 */
export function PhoneMigrationTool() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{
    total: number;
    withPhone: number;
    valid: number;
    invalid: number;
    details: {
      tooShort: number;
      tooLong: number;
      needsCleaning: number;
    };
  } | null>(null);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    updated: number;
    errors: number;
    message: string;
  } | null>(null);

  const handleCheckStatistics = async () => {
    setIsLoading(true);
    try {
      const statistics = await getPhoneStatistics();
      setStats(statistics);
      
      toast({
        title: "Estatísticas carregadas",
        description: `${statistics.withPhone} clientes com telefone encontrados`,
      });
    } catch (error) {
      toast({
        title: "Erro ao carregar estatísticas",
        description: "Não foi possível obter as estatísticas dos telefones",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigrate = async () => {
    if (!confirm('Deseja formatar todos os números de telefone? Esta ação irá remover caracteres especiais de todos os telefones cadastrados.')) {
      return;
    }

    setIsLoading(true);
    setMigrationResult(null);

    try {
      const result = await migratePhoneNumbers();
      setMigrationResult(result);

      if (result.success) {
        toast({
          title: "Migração concluída!",
          description: result.message,
        });
        
        // Atualizar estatísticas
        await handleCheckStatistics();
      } else {
        toast({
          title: "Migração com erros",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na migração",
        description: "Não foi possível completar a migração",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card-premium border border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10">
            <Phone className="w-5 h-5 text-blue-600" />
          </div>
          Formatação de Telefones
        </CardTitle>
        <CardDescription>
          Ferramenta para formatar números de telefone existentes no banco de dados.
          Remove caracteres especiais como parênteses, traços e espaços.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button
            onClick={handleCheckStatistics}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              'Verificar Estatísticas'
            )}
          </Button>

          <Button
            onClick={handleMigrate}
            disabled={isLoading || !stats}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Formatando...
              </>
            ) : (
              'Formatar Telefones'
            )}
          </Button>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Estatísticas Atuais:</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Total de Clientes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Com Telefone</p>
                <p className="text-2xl font-bold">{stats.withPhone}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <p className="text-xs text-green-600">Telefones Válidos</p>
                <p className="text-2xl font-bold text-green-600">{stats.valid}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <p className="text-xs text-red-600">Telefones Inválidos</p>
                <p className="text-2xl font-bold text-red-600">{stats.invalid}</p>
              </div>
            </div>

            {stats.details.needsCleaning > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{stats.details.needsCleaning}</strong> telefones precisam de formatação
                  (contêm caracteres especiais)
                </AlertDescription>
              </Alert>
            )}

            {stats.details.tooShort > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{stats.details.tooShort}</strong> telefones muito curtos (menos de 10 dígitos)
                </AlertDescription>
              </Alert>
            )}

            {stats.details.tooLong > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{stats.details.tooLong}</strong> telefones muito longos (mais de 11 dígitos)
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Resultado da Migração */}
        {migrationResult && (
          <Alert variant={migrationResult.success ? "default" : "destructive"}>
            {migrationResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>
              <strong>Resultado:</strong> {migrationResult.message}
              <br />
              <span className="text-sm">
                {migrationResult.updated} telefones formatados
                {migrationResult.errors > 0 && `, ${migrationResult.errors} erros`}
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Informações */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>O que esta ferramenta faz:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Remove parênteses, traços e espaços dos telefones</li>
            <li>Mantém apenas números (0-9)</li>
            <li>Não altera telefones já formatados</li>
            <li>Telefones válidos: 10-11 dígitos</li>
          </ul>
          <p className="mt-2"><strong>Exemplos:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>(11) 98765-4321 → 11987654321</li>
            <li>11 98765-4321 → 11987654321</li>
            <li>(11)98765-4321 → 11987654321</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
