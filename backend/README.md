# SEPI Backend

Backend do Sistema Empresarial Profissional Integrado (SEPI).

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Express** - Framework web
- **Prisma** - ORM para PostgreSQL
- **AWS SDK** - Integração com serviços AWS (S3, KMS, SQS)
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
- **Zod** - Validação de dados

## 📦 Serviços AWS Utilizados

- **RDS PostgreSQL** - Banco de dados
- **S3** - Armazenamento de arquivos (imagens, XMLs, DANFEs, certificados)
- **KMS** - Criptografia de certificados digitais
- **SQS** - Fila de processamento de notas fiscais
- **CloudWatch** - Logs e monitoramento

## 🔧 Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e preencha as variáveis:

```bash
cp .env.example .env
```

Variáveis obrigatórias:
- `DATABASE_URL` - URL de conexão com PostgreSQL
- `AWS_REGION` - Região AWS
- `AWS_ACCESS_KEY_ID` - Chave de acesso AWS
- `AWS_SECRET_ACCESS_KEY` - Chave secreta AWS
- `TEGRA_API_KEY` - Chave da API Tegra (nfe.io)
- `JWT_SECRET` - Segredo para JWT

### 3. Executar Migrações do Banco

```bash
npm run prisma:migrate
```

### 4. Gerar Cliente Prisma

```bash
npm run prisma:generate
```

## 🏃 Executar

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm run build
npm start
```

## 📚 Estrutura de Pastas

```
backend/
├── src/
│   ├── functions/          # Rotas da API
│   │   ├── auth/          # Autenticação
│   │   ├── companies/     # Empresas
│   │   ├── products/      # Produtos
│   │   ├── fiscal/        # Notas fiscais
│   │   ├── payments/      # Pagamentos
│   │   └── webhooks/      # Webhooks
│   ├── services/          # Serviços
│   │   ├── tegra.service.ts        # Integração Tegra
│   │   ├── certificate.service.ts  # Certificados digitais
│   │   ├── tax.service.ts          # Cálculo de impostos
│   │   ├── s3.service.ts           # Upload S3
│   │   └── fiscal-queue.service.ts # Fila fiscal
│   ├── models/            # Modelos de dados
│   ├── utils/             # Utilitários
│   │   └── auth.middleware.ts      # Middleware de autenticação
│   ├── config/            # Configurações
│   └── index.ts           # Servidor Express
├── prisma/
│   └── schema.prisma      # Schema do banco
├── package.json
└── tsconfig.json
```

## 🔐 Autenticação

### Endpoints

#### Registro
```http
POST /api/auth/register
Content-Type: application/json

{
  "cpf": "12345678900",
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "11999999999",
  "password": "senha123",
  "acceptedTerms": true
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "password": "senha123"
}
```

Resposta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "USER"
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Autenticação em Requisições

Todas as rotas protegidas requerem o header:

```http
Authorization: Bearer <token>
```

## 🧾 Integração Fiscal

### Emitir NF-e

```http
POST /api/fiscal/invoices/nfe
Authorization: Bearer <token>
Content-Type: application/json

{
  "transactionId": "uuid",
  "recipientData": {
    "name": "Cliente Exemplo",
    "cpfCnpj": "12345678900",
    "email": "cliente@email.com",
    "phone": "11999999999",
    "address": {
      "street": "Rua Exemplo",
      "number": "123",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567"
    }
  }
}
```

### Listar Notas Fiscais

```http
GET /api/fiscal/companies/:companyId/invoices?status=AUTHORIZED&page=1&limit=50
Authorization: Bearer <token>
```

### Cancelar Nota Fiscal

```http
POST /api/fiscal/invoices/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Motivo do cancelamento com no mínimo 15 caracteres"
}
```

### Download XML

```http
GET /api/fiscal/invoices/:id/xml
Authorization: Bearer <token>
```

### Download DANFE

```http
GET /api/fiscal/invoices/:id/danfe
Authorization: Bearer <token>
```

## 🔄 Processamento Assíncrono

As notas fiscais são processadas de forma assíncrona usando AWS SQS:

1. Requisição de emissão enfileira a nota
2. Worker processa a fila
3. Integra com Tegra API
4. Atualiza status no banco
5. Armazena XML e DANFE no S3

### Retry Logic

- Máximo de 3 tentativas
- Backoff exponencial
- Dead Letter Queue para falhas permanentes

## 📊 Cálculo de Impostos

O serviço `tax.service.ts` calcula automaticamente:

- **ICMS** - Baseado no estado e regime fiscal
- **PIS** - Conforme regime tributário
- **COFINS** - Conforme regime tributário
- **ISS** - Para serviços, baseado no município

Suporta os regimes:
- Simples Nacional
- Lucro Presumido
- Lucro Real

## 🔒 Certificados Digitais

Certificados A1 (.pfx) são:
1. Validados antes do upload
2. Criptografados com AWS KMS
3. Armazenados no S3
4. Descriptografados apenas no momento do uso

### Upload de Certificado

```http
POST /api/fiscal/certificates/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <certificado.pfx>
password: <senha>
alias: <nome_amigavel>
companyId: <uuid>
```

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes com cobertura
npm run test:coverage
```

## 📝 Prisma Studio

Visualizar e editar dados do banco:

```bash
npm run prisma:studio
```

## 🚀 Deploy

### AWS Lambda (Serverless)

```bash
npm run deploy
```

### Docker

```bash
docker build -t sepi-backend .
docker run -p 3001:3001 sepi-backend
```

## 📖 Documentação da API

Acesse `/api-docs` quando o servidor estiver rodando para ver a documentação Swagger.

## ⚠️ Importante

- **Nunca** commite o arquivo `.env`
- **Sempre** use HTTPS em produção
- **Mantenha** as chaves AWS seguras
- **Teste** em homologação antes de produção
- **Monitore** os logs no CloudWatch

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
