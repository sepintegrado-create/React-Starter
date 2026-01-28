# SEPI Backend - Quick Start Guide

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 14+ instalado e rodando
- Conta AWS (para produção)
- Conta Tegra/nfe.io (para emissão de notas fiscais)

### 1. Instalação

```bash
cd backend
npm install
```

### 2. Configuração do Banco de Dados

#### Opção A: PostgreSQL Local

```bash
# Criar banco de dados
createdb sepi

# Configurar .env
cp .env.example .env
```

Edite o `.env` e configure:
```env
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/sepi"
```

#### Opção B: AWS RDS (Produção)

```env
DATABASE_URL="postgresql://usuario:senha@seu-rds.amazonaws.com:5432/sepi"
```

### 3. Executar Migrações

```bash
npm run prisma:migrate
npm run prisma:generate
```

### 4. Iniciar Servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

O servidor estará disponível em `http://localhost:3001`

---

## 📋 Rotas Disponíveis

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Empresas
- `POST /api/companies` - Criar empresa
- `GET /api/companies` - Listar empresas do usuário
- `GET /api/companies/:id` - Detalhes da empresa
- `PUT /api/companies/:id` - Atualizar empresa
- `GET /api/companies/:id/dashboard` - Estatísticas

### Produtos
- `POST /api/products` - Criar produto
- `GET /api/products` - Listar produtos (com filtros)
- `GET /api/products/:id` - Detalhes do produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto
- `GET /api/products/company/:companyId/categories` - Categorias
- `POST /api/products/categories` - Criar categoria

### Fiscal
- `POST /api/fiscal/invoices/nfe` - Emitir NF-e
- `GET /api/fiscal/companies/:companyId/invoices` - Listar notas
- `GET /api/fiscal/invoices/:id` - Detalhes da nota
- `POST /api/fiscal/invoices/:id/cancel` - Cancelar nota
- `GET /api/fiscal/invoices/:id/xml` - Download XML
- `GET /api/fiscal/invoices/:id/danfe` - Download DANFE

---

## 🧪 Testando a API

### 1. Registrar Usuário

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678900",
    "name": "João Silva",
    "email": "joao@test.com",
    "phone": "11999999999",
    "password": "senha123",
    "acceptedTerms": true
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@test.com",
    "password": "senha123"
  }'
```

Salve o `token` retornado.

### 3. Criar Empresa

```bash
curl -X POST http://localhost:3001/api/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "cnpj": "12345678000190",
    "name": "Minha Empresa LTDA",
    "tradeName": "Minha Empresa",
    "email": "contato@empresa.com",
    "phone": "1133334444",
    "addressStreet": "Rua Exemplo",
    "addressNumber": "123",
    "addressCity": "São Paulo",
    "addressState": "SP",
    "addressZipCode": "01234567",
    "planId": "plan-002",
    "businessType": "Comércio",
    "fiscalRegime": "SIMPLES"
  }'
```

---

## 🔧 Configuração AWS (Produção)

### 1. Criar Recursos

```bash
# RDS PostgreSQL
aws rds create-db-instance \
  --db-instance-identifier sepi-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password SuaSenhaSegura123

# S3 Bucket
aws s3 mb s3://sepi-storage

# KMS Key
aws kms create-key --description "SEPI Certificate Encryption"

# SQS Queue
aws sqs create-queue --queue-name sepi-fiscal-queue
```

### 2. Configurar .env

```env
DATABASE_URL="postgresql://admin:senha@sepi-db.xxx.rds.amazonaws.com:5432/sepi"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="sua_chave"
AWS_SECRET_ACCESS_KEY="sua_chave_secreta"
S3_BUCKET_NAME="sepi-storage"
SQS_FISCAL_QUEUE_URL="https://sqs.us-east-1.amazonaws.com/xxx/sepi-fiscal-queue"
```

---

## 📊 Monitoramento

### Logs

```bash
# Ver logs em tempo real
npm run dev

# Logs de produção (CloudWatch)
aws logs tail /aws/lambda/sepi-api --follow
```

### Health Check

```bash
curl http://localhost:3001/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2026-01-23T22:00:00.000Z",
  "environment": "development"
}
```

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais no `.env`
3. Teste a conexão: `psql -U usuario -d sepi`

### Erro: "JWT secret not configured"

Configure `JWT_SECRET` no `.env`:
```env
JWT_SECRET="sua_chave_secreta_muito_segura_aqui"
```

### Erro: "AWS credentials not found"

Configure as credenciais AWS:
```bash
aws configure
```

Ou adicione ao `.env`:
```env
AWS_ACCESS_KEY_ID="sua_chave"
AWS_SECRET_ACCESS_KEY="sua_chave_secreta"
```

---

## 📚 Próximos Passos

1. Configure o ambiente de produção na AWS
2. Obtenha credenciais da Tegra (nfe.io)
3. Configure certificados digitais de teste
4. Execute testes de integração
5. Configure CI/CD com GitHub Actions

Para mais detalhes, consulte o [README.md](./README.md) completo.
