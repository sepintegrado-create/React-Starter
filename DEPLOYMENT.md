# Guia de Deploy - SEPI na AWS

Este guia detalha o processo completo de deploy da aplicação SEPI na AWS usando o domínio `sepi.pro`.

## 📋 Pré-requisitos

- [ ] Conta AWS ativa
- [ ] AWS CLI instalado e configurado
- [ ] Node.js 18+ instalado
- [ ] Domínio `sepi.pro` configurado
- [ ] Certificado SSL/TLS (AWS Certificate Manager)
- [ ] Credenciais Tegra API (nfe.io)

---

## 🗄️ Parte 1: Configuração do Banco de Dados (AWS RDS)

### 1.1 Criar Instância RDS PostgreSQL

```bash
# Via AWS Console ou CLI
aws rds create-db-instance \
  --db-instance-identifier sepi-prod-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username sepi_admin \
  --master-user-password 'YOUR_STRONG_PASSWORD' \
  --allocated-storage 20 \
  --storage-type gp3 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name default \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --multi-az \
  --publicly-accessible false \
  --storage-encrypted \
  --enable-cloudwatch-logs-exports '["postgresql"]' \
  --tags Key=Environment,Value=production Key=Project,Value=SEPI
```

### 1.2 Configurar Security Group

```bash
# Permitir acesso do Lambda ao RDS
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 5432 \
  --source-group sg-lambda-xxxxx
```

### 1.3 Criar Banco de Dados

```bash
# Conectar ao RDS
psql -h sepi-prod-db.xxxxx.us-east-1.rds.amazonaws.com \
     -U sepi_admin \
     -d postgres

# Criar banco e usuário
CREATE DATABASE sepi_prod;
CREATE USER sepi_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE sepi_prod TO sepi_user;
```

### 1.4 Executar Migrações Prisma

```bash
cd backend

# Configurar DATABASE_URL no .env
echo "DATABASE_URL=postgresql://sepi_user:PASSWORD@sepi-prod-db.xxxxx.us-east-1.rds.amazonaws.com:5432/sepi_prod?schema=public" > .env

# Executar migrações
npm run prisma:migrate deploy

# Gerar cliente Prisma
npm run prisma:generate

# (Opcional) Seed de dados iniciais
npm run prisma:seed
```

---

## 🔐 Parte 2: Configuração de Segurança (KMS, IAM)

### 2.1 Criar KMS Key para Certificados

```bash
# Criar chave KMS
aws kms create-key \
  --description "SEPI Certificate Encryption Key" \
  --key-usage ENCRYPT_DECRYPT \
  --origin AWS_KMS \
  --tags TagKey=Environment,TagValue=production TagKey=Project,TagValue=SEPI

# Criar alias
aws kms create-alias \
  --alias-name alias/sepi-cert-encryption \
  --target-key-id <KEY_ID_FROM_ABOVE>

# Anotar o ARN da chave
```

### 2.2 Criar IAM Role para Lambda

```bash
# Criar política customizada (salvar como sepi-lambda-policy.json)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::sepi-prod-storage/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:GenerateDataKey"
      ],
      "Resource": "arn:aws:kms:us-east-1:ACCOUNT_ID:key/KEY_ID"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sqs:SendMessage",
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage"
      ],
      "Resource": "arn:aws:sqs:us-east-1:ACCOUNT_ID:sepi-prod-fiscal-queue"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}

# Criar política
aws iam create-policy \
  --policy-name SEPILambdaPolicy \
  --policy-document file://sepi-lambda-policy.json
```

---

## 📦 Parte 3: Deploy do Backend (Serverless Framework)

### 3.1 Instalar Dependências

```bash
cd backend

# Instalar dependências
npm install

# Instalar Serverless Framework globalmente
npm install -g serverless

# Instalar plugins
npm install --save-dev serverless-webpack serverless-offline serverless-prune-plugin
```

### 3.2 Configurar Variáveis de Ambiente

```bash
# Copiar template de produção
cp .env.production.example .env.production

# Editar .env.production com valores reais
nano .env.production
```

### 3.3 Deploy para Produção

```bash
# Deploy completo
serverless deploy --stage prod --verbose

# Ou deploy de função específica (mais rápido)
serverless deploy function --function authLogin --stage prod

# Ver logs
serverless logs --function authLogin --stage prod --tail
```

### 3.4 Verificar Deploy

```bash
# Listar funções deployadas
serverless info --stage prod

# Testar endpoint
curl -X POST https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## 🌐 Parte 4: Configuração de Domínio (sepi.pro)

### 4.1 Criar Certificado SSL (ACM)

```bash
# Solicitar certificado
aws acm request-certificate \
  --domain-name sepi.pro \
  --subject-alternative-names "*.sepi.pro" \
  --validation-method DNS \
  --region us-east-1

# Anotar o ARN do certificado
# Adicionar registros DNS de validação no seu provedor de domínio
```

### 4.2 Configurar Custom Domain no API Gateway

```bash
# Via AWS Console:
# 1. API Gateway > Custom Domain Names > Create
# 2. Domain Name: api.sepi.pro
# 3. Certificate: Selecionar o certificado ACM criado
# 4. Endpoint Type: Regional
# 5. API Mappings: Adicionar mapeamento para a API

# Ou via Serverless Framework (adicionar ao serverless.yml):
# custom:
#   customDomain:
#     domainName: api.sepi.pro
#     certificateArn: arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID
#     basePath: ''
#     stage: ${self:provider.stage}
#     createRoute53Record: true
```

### 4.3 Configurar DNS (Route 53 ou seu provedor)

```bash
# Criar registros DNS
# A/ALIAS: api.sepi.pro -> API Gateway endpoint
# A/ALIAS: sepi.pro -> CloudFront distribution (frontend)
# A/ALIAS: www.sepi.pro -> CloudFront distribution (frontend)

# Exemplo Route 53
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://dns-records.json
```

---

## 🎨 Parte 5: Deploy do Frontend

### 5.1 Build de Produção

```bash
cd ..  # Voltar para raiz do projeto

# Configurar variáveis de ambiente
echo "VITE_API_URL=https://api.sepi.pro" > .env.production
echo "VITE_ENABLE_API=true" >> .env.production

# Build
npm run build

# Testar build localmente
npm run preview
```

### 5.2 Deploy no S3 + CloudFront

```bash
# Criar bucket S3
aws s3 mb s3://sepi-frontend-prod

# Configurar bucket para hosting
aws s3 website s3://sepi-frontend-prod \
  --index-document index.html \
  --error-document index.html

# Upload dos arquivos
aws s3 sync dist/ s3://sepi-frontend-prod --delete

# Criar CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name sepi-frontend-prod.s3.amazonaws.com \
  --default-root-object index.html \
  --comment "SEPI Frontend Production" \
  --enabled

# Configurar certificado SSL no CloudFront
# Adicionar CNAME: sepi.pro, www.sepi.pro
```

### 5.3 Invalidar Cache do CloudFront

```bash
# Após cada deploy
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

---

## 🔧 Parte 6: Configurações Adicionais

### 6.1 Configurar SES para Emails

```bash
# Verificar domínio
aws ses verify-domain-identity --domain sepi.pro

# Adicionar registros DNS (MX, TXT, DKIM)

# Sair do sandbox (produção)
# Abrir ticket no AWS Support
```

### 6.2 Configurar CloudWatch Alarms

```bash
# Alarme de erros Lambda
aws cloudwatch put-metric-alarm \
  --alarm-name sepi-lambda-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1

# Alarme de RDS CPU
aws cloudwatch put-metric-alarm \
  --alarm-name sepi-rds-cpu \
  --alarm-description "Alert on high RDS CPU" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### 6.3 Configurar Backup Automático

```bash
# RDS já tem backup automático configurado (7 dias)

# Backup do S3 para Glacier
aws s3api put-bucket-lifecycle-configuration \
  --bucket sepi-prod-storage \
  --lifecycle-configuration file://s3-lifecycle.json
```

---

## 🧪 Parte 7: Testes Pós-Deploy

### 7.1 Testes de API

```bash
# Teste de registro
curl -X POST https://api.sepi.pro/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste User",
    "email": "teste@sepi.pro",
    "cpf": "12345678900",
    "phone": "11999999999",
    "password": "Test@123"
  }'

# Teste de login
curl -X POST https://api.sepi.pro/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@sepi.pro",
    "password": "Test@123"
  }'
```

### 7.2 Testes de Frontend

```bash
# Acessar https://sepi.pro
# Verificar:
# - [ ] Página carrega corretamente
# - [ ] Login funciona
# - [ ] Registro funciona
# - [ ] API está respondendo
# - [ ] Certificado SSL válido
```

### 7.3 Testes de Integração Fiscal

```bash
# Testar upload de certificado
# Testar emissão de NF-e em homologação
# Verificar armazenamento no S3
# Verificar processamento da fila SQS
```

---

## 📊 Parte 8: Monitoramento e Logs

### 8.1 CloudWatch Logs

```bash
# Ver logs em tempo real
aws logs tail /aws/lambda/sepi-prod --follow

# Buscar erros
aws logs filter-log-events \
  --log-group-name /aws/lambda/sepi-prod \
  --filter-pattern "ERROR"
```

### 8.2 X-Ray (Tracing)

```bash
# Habilitar X-Ray no serverless.yml
# provider:
#   tracing:
#     lambda: true
#     apiGateway: true
```

---

## 🔄 Parte 9: CI/CD (GitHub Actions)

### 9.1 Criar Workflow

Criar arquivo `.github/workflows/deploy-prod.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      
      - name: Run tests
        run: |
          cd backend
          npm test
      
      - name: Deploy to AWS
        run: |
          cd backend
          npx serverless deploy --stage prod
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  
  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: https://api.sepi.pro
      
      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://sepi-frontend-prod --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

---

## 📝 Checklist Final

### Backend
- [ ] RDS PostgreSQL criado e acessível
- [ ] Migrações Prisma executadas
- [ ] KMS Key criada
- [ ] S3 Bucket criado
- [ ] SQS Queue criada
- [ ] Lambda functions deployadas
- [ ] API Gateway configurado
- [ ] Custom domain configurado (api.sepi.pro)
- [ ] Certificado SSL válido
- [ ] Variáveis de ambiente configuradas

### Frontend
- [ ] Build de produção gerado
- [ ] S3 Bucket criado
- [ ] CloudFront distribution criada
- [ ] Custom domain configurado (sepi.pro)
- [ ] Certificado SSL válido
- [ ] DNS configurado corretamente

### Segurança
- [ ] IAM roles configuradas
- [ ] Security groups configurados
- [ ] Certificados digitais criptografados com KMS
- [ ] HTTPS obrigatório
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativo

### Monitoramento
- [ ] CloudWatch Logs configurado
- [ ] Alarmes criados
- [ ] Backup automático configurado
- [ ] X-Ray habilitado (opcional)

### Testes
- [ ] API respondendo corretamente
- [ ] Frontend acessível
- [ ] Login/Registro funcionando
- [ ] Integração fiscal testada
- [ ] Emails sendo enviados (SES)

---

## 🆘 Troubleshooting

### Erro: Lambda timeout
```bash
# Aumentar timeout no serverless.yml
functions:
  myFunction:
    timeout: 30  # segundos
```

### Erro: RDS connection refused
```bash
# Verificar security group
# Verificar se Lambda está na mesma VPC
# Verificar DATABASE_URL
```

### Erro: CORS
```bash
# Verificar CORS_ORIGIN no .env
# Verificar configuração do API Gateway
```

### Erro: Certificate expired
```bash
# Renovar certificado no ACM
# Atualizar CloudFront/API Gateway
```

---

## 📞 Suporte

- **Documentação AWS**: https://docs.aws.amazon.com
- **Serverless Framework**: https://www.serverless.com/framework/docs
- **Tegra API**: https://docs.nfe.io
- **Prisma**: https://www.prisma.io/docs

---

**Status**: ✅ Pronto para Deploy
**Última Atualização**: 2026-01-23
