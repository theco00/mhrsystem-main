# 🔄 Guia de Backup Automático - Supabase

## ⚠️ CRÍTICO: Backup não configurado

Atualmente **NÃO HÁ backup automático** do banco de dados. Isso é um risco crítico para um sistema SaaS.

## 🎯 Estratégias de Backup

### Opção 1: Supabase Point-in-Time Recovery (RECOMENDADO)

**Para projetos Pro ou superiores**

1. **Ativar PITR** no Dashboard do Supabase:
   - Acesse: https://supabase.com/dashboard/project/wgycuyrkkqwwegazgvcb/settings/addons
   - Procure por "Point in Time Recovery"
   - Ative o addon (custo adicional)
   - Permite restaurar para qualquer ponto nas últimas 7-30 dias

2. **Configurar Retenção**:
   ```sql
   -- No SQL Editor do Supabase
   -- Verificar configuração de WAL (Write-Ahead Logging)
   SHOW wal_level; -- Deve ser 'replica' ou 'logical'
   ```

### Opção 2: Backups Automáticos com GitHub Actions (GRATUITO)

**Criar arquivo**: `.github/workflows/backup-database.yml`

```yaml
name: Backup Database

on:
  schedule:
    # Executar diariamente às 3h UTC (0h BRT)
    - cron: '0 3 * * *'
  workflow_dispatch: # Permitir execução manual

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Login Supabase
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        run: |
          supabase login

      - name: Dump Database
        env:
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
          SUPABASE_PROJECT_ID: wgycuyrkkqwwegazgvcb
        run: |
          # Dump completo do banco
          supabase db dump --db-url postgresql://postgres:$SUPABASE_DB_PASSWORD@db.$SUPABASE_PROJECT_ID.supabase.co:5432/postgres > backup-$(date +%Y%m%d).sql
          
          # Comprimir
          gzip backup-$(date +%Y%m%d).sql

      - name: Upload to AWS S3
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Sync to S3
        run: |
          aws s3 cp backup-$(date +%Y%m%d).sql.gz s3://seu-bucket-backup/supabase/$(date +%Y%m%d)/
          
      - name: Clean old backups (manter últimos 30 dias)
        run: |
          find . -name "backup-*.sql.gz" -mtime +30 -delete
```

### Opção 3: Script Manual de Backup (SIMPLES)

**Criar arquivo**: `scripts/backup-database.sh`

```bash
#!/bin/bash

# Configurações
PROJECT_ID="wgycuyrkkqwwegazgvcb"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Executar backup via Supabase CLI
echo "🔄 Iniciando backup do banco de dados..."

supabase db dump \
  --db-url "postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${PROJECT_ID}.supabase.co:5432/postgres" \
  > "${BACKUP_DIR}/backup_${DATE}.sql"

# Comprimir
echo "📦 Comprimindo backup..."
gzip "${BACKUP_DIR}/backup_${DATE}.sql"

echo "✅ Backup concluído: ${BACKUP_DIR}/backup_${DATE}.sql.gz"

# Limpar backups antigos (manter últimos 7 dias)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "🧹 Backups antigos removidos"
```

**Executar manualmente**:
```bash
chmod +x scripts/backup-database.sh
SUPABASE_DB_PASSWORD=sua_senha ./scripts/backup-database.sh
```

## 📊 Backup de Migrations

**Já está implementado!** Suas migrations em `supabase/migrations/` são versionadas no Git.

```bash
# Backup adicional das migrations
tar -czf migrations-backup-$(date +%Y%m%d).tar.gz supabase/migrations/
```

## 🔐 Configurar Secrets no GitHub

Para usar o backup automático, configure no GitHub:

1. Acesse: `Settings` > `Secrets and variables` > `Actions`
2. Adicione:
   - `SUPABASE_ACCESS_TOKEN`: Token do Supabase CLI
   - `SUPABASE_DB_PASSWORD`: Senha do banco
   - `AWS_ACCESS_KEY_ID`: (se usar S3)
   - `AWS_SECRET_ACCESS_KEY`: (se usar S3)

## 🏃 Obter credenciais necessárias

### Supabase Access Token:
```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Token será salvo em ~/.supabase/access-token
```

### Database Password:
1. Dashboard: https://supabase.com/dashboard/project/wgycuyrkkqwwegazgvcb/settings/database
2. Copie a senha do banco (Database Password)

## 📅 Estratégia de Retenção Recomendada

| Tipo | Frequência | Retenção |
|------|-----------|----------|
| **Completo** | Diário | 7 dias |
| **Semanal** | Domingo | 4 semanas |
| **Mensal** | Dia 1 | 12 meses |
| **PITR** | Contínuo | 7-30 dias |

## 🔄 Restaurar Backup

### Via Supabase CLI:
```bash
# Restaurar de arquivo local
supabase db reset

# Aplicar backup
psql "postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres" < backup.sql
```

### Via Dashboard:
1. SQL Editor: https://supabase.com/dashboard/project/wgycuyrkkqwwegazgvcb/sql
2. Cole o conteúdo do backup
3. Execute

## ✅ Checklist de Implementação

- [ ] Escolher estratégia de backup (PITR, GitHub Actions, ou Manual)
- [ ] Configurar secrets necessários
- [ ] Testar backup inicial
- [ ] Testar restauração de backup
- [ ] Documentar processo para equipe
- [ ] Agendar revisão mensal dos backups
- [ ] Configurar alertas em caso de falha no backup

## 🚨 Plano de Disaster Recovery

1. **Perda total do banco**:
   - Restaurar último backup completo
   - Aplicar migrations faltantes
   - Validar integridade dos dados

2. **Corrupção de dados**:
   - Identificar ponto de corrupção
   - Usar PITR para restaurar (se disponível)
   - Ou restaurar backup anterior à corrupção

3. **Exclusão acidental**:
   - Verificar audit_logs (já implementado)
   - Restaurar registros específicos de backup

## 📖 Documentação Adicional

- [Supabase Backup Docs](https://supabase.com/docs/guides/platform/backups)
- [PITR Guide](https://supabase.com/docs/guides/platform/point-in-time-recovery)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
