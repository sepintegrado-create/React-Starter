# Modo de Simulação Fiscal

O sistema SEPI possui um **modo de simulação fiscal** que permite desenvolvimento e testes sem necessidade de configurar a API da Tegra (nfe.io).

## 🎭 Como Funciona

Quando a variável `FISCAL_SIMULATION_MODE=true` está ativada ou quando `TEGRA_API_KEY` não está configurada, o sistema automaticamente usa o serviço de simulação fiscal.

### O que é simulado:

- ✅ Emissão de NF-e (Nota Fiscal Eletrônica)
- ✅ Emissão de NFC-e (Nota Fiscal ao Consumidor)
- ✅ Cancelamento de notas fiscais
- ✅ Consulta de status
- ✅ Geração de chave de acesso (44 dígitos)
- ✅ Geração de protocolo de autorização
- ✅ XML simulado
- ✅ DANFE simulado (texto)

### Características da Simulação:

1. **Chaves de Acesso Válidas**: Gera chaves de 44 dígitos com dígito verificador correto
2. **Taxa de Sucesso**: 90% de sucesso nas emissões (10% falha para testar tratamento de erros)
3. **Delay Realista**: Simula o tempo de resposta da API real (1-3 segundos)
4. **Protocolos**: Gera números de protocolo realistas
5. **URLs**: Gera URLs simuladas para XML e DANFE

## 🔧 Configuração

### Desenvolvimento (com simulação)

```bash
# backend/.env
FISCAL_SIMULATION_MODE=true
TEGRA_API_KEY=
```

### Produção (com Tegra real)

```bash
# backend/.env.production
FISCAL_SIMULATION_MODE=false
TEGRA_API_KEY=sua-chave-real-aqui
TEGRA_ENVIRONMENT=production
```

## ⚠️ Avisos Importantes

### Logs de Simulação

Quando o modo de simulação está ativo, você verá avisos no console:

```
⚠️  Tegra API not configured - using SIMULATION MODE
⚠️  Set TEGRA_API_KEY in .env to enable real fiscal operations
⚠️  FISCAL SIMULATION MODE ENABLED
⚠️  Documents generated are NOT valid for fiscal purposes
⚠️  Configure Tegra API for production use
```

### Documentos Simulados

Todos os documentos gerados em modo de simulação contêm avisos claros:

```xml
<!-- SIMULATED XML - NOT VALID FOR FISCAL PURPOSES -->
```

```
DANFE - DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA

SIMULAÇÃO - NÃO VÁLIDO PARA FINS FISCAIS
```

## 📝 Exemplo de Uso

```typescript
import tegraService from './services/tegra.service';

// O serviço detecta automaticamente se deve usar simulação
const result = await tegraService.issueNFe({
  companyId: 'company-123',
  certificateId: 'cert-123',
  recipient: {
    name: 'Cliente Teste',
    cpfCnpj: '12345678900',
    // ...
  },
  items: [
    {
      productName: 'Produto Teste',
      quantity: 1,
      unitPrice: 100,
      // ...
    }
  ],
  totalValue: 100,
  taxValue: 10,
  environment: 'homologacao',
});

// Resultado (simulado ou real, dependendo da configuração):
console.log(result.accessKey); // 35261212345678000100550010000000011234567890
console.log(result.status); // 'authorized'
console.log(result.protocol); // '135261234567890123'
```

## 🚀 Migração para Produção

Quando estiver pronto para usar a API real da Tegra:

1. **Obter Credenciais Tegra**
   - Cadastre-se em https://nfe.io
   - Obtenha sua API key
   - Configure sua empresa no painel Tegra

2. **Atualizar Variáveis de Ambiente**
   ```bash
   FISCAL_SIMULATION_MODE=false
   TEGRA_API_KEY=sua-chave-real
   TEGRA_COMPANY_ID=seu-company-id
   TEGRA_ENVIRONMENT=production
   ```

3. **Testar em Homologação Primeiro**
   ```bash
   TEGRA_ENVIRONMENT=sandbox
   ```

4. **Validar Certificado Digital**
   - Upload do certificado A1 (.pfx)
   - Verificar validade
   - Testar emissão em homologação

5. **Deploy em Produção**
   ```bash
   TEGRA_ENVIRONMENT=production
   ```

## 🧪 Testes

O modo de simulação é perfeito para:

- ✅ Desenvolvimento local
- ✅ Testes automatizados
- ✅ CI/CD pipelines
- ✅ Demonstrações
- ✅ Treinamento de usuários

## ❌ NÃO use simulação para:

- ❌ Produção
- ❌ Emissão de notas fiscais reais
- ❌ Compliance fiscal
- ❌ Auditorias

## 📊 Diferenças entre Simulação e Real

| Característica | Simulação | Real (Tegra) |
|----------------|-----------|--------------|
| Validade Fiscal | ❌ Não | ✅ Sim |
| Chave de Acesso | ✅ Formato válido | ✅ SEFAZ real |
| Protocolo | ✅ Simulado | ✅ SEFAZ real |
| XML | ✅ Estrutura básica | ✅ Completo |
| DANFE | ⚠️ Texto simples | ✅ PDF oficial |
| Tempo de Resposta | ~2s | ~3-10s |
| Custo | 💰 Grátis | 💰 Pago |
| Certificado Digital | ❌ Não necessário | ✅ Obrigatório |

## 🔍 Verificação do Modo Ativo

Para verificar qual modo está ativo:

```bash
# Ver logs do servidor
npm run dev

# Procure por:
# ⚠️  Tegra API not configured - using SIMULATION MODE
# ou
# ✅  Tegra API configured - using REAL MODE
```

---

**Desenvolvido para facilitar o desenvolvimento sem dependências externas**
