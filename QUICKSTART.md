# SEPI - Quick Start Guide

Guia rápido para começar a usar o sistema SEPI localmente ou fazer o deploy em produção.

## 🚀 Início Rápido - Desenvolvimento Local

### 1. Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL instalado (ou Docker)
- Git instalado

### 2. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/sepi.git
cd sepi
```

### 3. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com suas configurações locais
# Mínimo necessário:
# DATABASE_URL=postgresql://user:password@localhost:5432/sepi_dev

# Gerar secrets seguros
npm run secrets:generate

# Executar migrações
npm run prisma:migrate

# Inicializar banco de dados (criar planos e admin)
npm run db:init

# Iniciar servidor de desenvolvimento
npm run dev
```

O backend estará rodando em `http://localhost:3001`

### 4. Configurar Frontend

```bash
# Voltar para raiz do projeto
cd ..

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env
# VITE_API_URL=http://localhost:3001
# VITE_ENABLE_API=true

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

### 5. Acessar a Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Prisma Studio**: `npm run prisma:studio` (http://localhost:5555)

**Credenciais padrão:**
- Email: `admin@sepi.pro`
- Senha: (gerada pelo script `db:init`, verifique o console)

---

## 🏭 Deploy em Produção (AWS)

### 1. Pré-requisitos AWS

- Conta AWS ativa
- AWS CLI configurado (`aws configure`)
- Domínio registrado (sepi.pro)
- Credenciais Tegra API

### 2. Configurar Infraestrutura AWS

Siga o guia completo em [DEPLOYMENT.md](./DEPLOYMENT.md) para:

1. Criar RDS PostgreSQL
2. Configurar KMS, S3, SQS
3. Configurar IAM roles
4. Obter certificado SSL (ACM)

### 3. Configurar Variáveis de Ambiente

```bash
cd backend

# Copiar template de produção
cp .env.production.example .env.production

# Gerar secrets
npm run secrets:generate

# Editar .env.production com valores reais
nano .env.production
```

### 4. Validar Configuração

```bash
# Verificar se tudo está configurado corretamente
npm run deploy:check
```

Este script valida:
- ✅ Variáveis de ambiente
- ✅ Conexão com banco de dados
- ✅ Acesso aos serviços AWS (S3, KMS, SQS)
- ✅ Tegra API

### 5. Deploy do Backend

```bash
# Instalar dependências
npm install

# Executar migrações no RDS
npm run prisma:migrate:deploy

# Inicializar banco de dados
NODE_ENV=production npm run db:init

# Deploy para AWS Lambda
npm run deploy:prod
```

### 6. Deploy do Frontend

```bash
cd ..

# Build de produção
npm run build

# Upload para S3
aws s3 sync dist/ s3://sepi-frontend-prod --delete

# Invalidar cache do CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### 7. Verificar Deploy

```bash
# Health check automático
cd backend
npm run health:check
```

Ou manualmente:
- **API**: https://api.sepi.pro/health
- **Frontend**: https://sepi.pro

---

## 📋 Comandos Úteis

### Backend

```bash
# Desenvolvimento
npm run dev                    # Iniciar servidor dev
npm run prisma:studio          # Abrir Prisma Studio

# Database
npm run db:init                # Inicializar banco
npm run db:seed                # Popular com dados demo
npm run db:backup              # Backup do banco
npm run prisma:migrate         # Criar migração

# Deploy
npm run deploy:check           # Validar antes de deploy
npm run deploy:prod            # Deploy produção
npm run deploy:dev             # Deploy desenvolvimento
npm run logs                   # Ver logs Lambda

# Utilitários
npm run secrets:generate       # Gerar secrets
npm run health:check           # Verificar saúde da API
```

### Frontend

```bash
npm run dev                    # Servidor desenvolvimento
npm run build                  # Build produção
npm run preview                # Preview do build
npm run lint                   # Lint do código
```

---

## 🔧 Troubleshooting

### Erro: "Cannot connect to database"

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar DATABASE_URL no .env
cat backend/.env | grep DATABASE_URL
```

### Erro: "AWS credentials not found"

```bash
# Configurar AWS CLI
aws configure

# Ou exportar variáveis
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
```

### Erro: "Prisma Client not generated"

```bash
cd backend
npm run prisma:generate
```

### Frontend não conecta ao backend

```bash
# Verificar VITE_API_URL no .env
cat .env | grep VITE_API_URL

# Deve ser:
# Dev: http://localhost:3001
# Prod: https://api.sepi.pro
```

---

## 📚 Documentação Adicional

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guia completo de deploy
- [backend/README.md](./backend/README.md) - Documentação do backend
- [deployment_checklist.md](./deployment_checklist.md) - Checklist de deploy

---

## 🆘 Suporte

- **Documentação**: https://docs.sepi.pro (em breve)
- **Issues**: https://github.com/seu-usuario/sepi/issues
- **Email**: suporte@sepi.pro

---

**Última atualização**: 2026-01-23
