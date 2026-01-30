# Configuração do Banco de Dados Local e Aplicação

Este guia descreve o passo a passo para configurar o banco de dados local e rodar a aplicação backend do SEPI (Sistema Empresarial Profissional Integrado).

## Pré-requisitos

Certifique-se de ter instalado em sua máquina:

1.  **Node.js** (versão 20 ou superior recomendada)
2.  **PostgreSQL** (versão 14 ou superior) - O serviço deve estar rodando.
3.  **Git** (para clonar/gerenciar o repositório)

## Passo 1: Configuração do Backend

Todas as configurações de banco de dados e execução do servidor são feitas na pasta `backend`.

1.  Abra o terminal na raiz do projeto.
2.  Navegue para a pasta do backend:
    ```bash
    cd backend
    ```

3.  Instale as dependências do projeto:
    ```bash
    npm install
    ```

## Passo 2: Configuração das Variáveis de Ambiente

1.  Crie o arquivo `.env` baseando-se no exemplo fornecido:
    ```bash
    cp .env.example .env
    # No Windows (PowerShell/CMD), use: copy .env.example .env
    ```

2.  Abra o arquivo `.env` criado e configure a variável `DATABASE_URL` com as credenciais do seu banco de dados PostgreSQL local.

    O formato deve ser:
    ```
    DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/NOME_DO_BANCO?schema=public"
    ```

    *Exemplo:*
    ```
    DATABASE_URL="postgresql://postgres:admin123@localhost:5432/sepi_local?schema=public"
    ```
    *(Certifique-se de substituir `USUARIO`, `SENHA` e `NOME_DO_BANCO` pelos valores corretos do seu ambiente. Se o banco não existir, o Prisma irá criá-lo no próximo passo, desde que o usuário tenha permissão.)*

## Passo 3: Criação e Migração do Banco de Dados

Com as dependências instaladas e o `.env` configurado, execute as migrações do Prisma para criar as tabelas no banco de dados.

1.  Execute o comando de migração:
    ```bash
    npm run prisma:migrate
    # Ou diretamente: npx prisma migrate dev
    ```

    Este comando irá:
    *   Conectar ao PostgreSQL.
    *   Criar o banco de dados (se não existir).
    *   Criar todas as tabelas definidas no `schema.prisma`.
    *   Gerar o cliente Prisma atualizado.

## Passo 4: Populando o Banco de Dados (Seed)

Para iniciar a aplicação com dados essenciais (Planos de Assinatura, Usuário Admin) e dados de exemplo (Empresa Demo, Produtos), execute o script de inicialização.

1.  Execute o comando:
    ```bash
    npm run db:init
    ```

    Após a execução, você verá no terminal as credenciais criadas, por exemplo:
    *   **Admin da Plataforma**: `admin@sepi.pro` / `Admin@123456`
    *   **Usuário Demo**: `demo@sepi.pro` / `Demo@123`

## Passo 5: Executando a Aplicação Backend

Agora que o banco está pronto, inicie o servidor backend em modo de desenvolvimento.

1.  Execute o comando:
    ```bash
    npm run dev
    ```

    O servidor deve iniciar (geralmente na porta 3001, conforme definido no `.env`). Você verá logs indicando que a aplicação está rodando.

## Passo 6 (Opcional): Visualizando o Banco de Dados

Para inspecionar os dados diretamente, você pode usar o Prisma Studio.

1.  Em um novo terminal (dentro da pasta `backend`), execute:
    ```bash
    npx prisma studio
    ```
    Isso abrirá uma interface web (geralmente em `http://localhost:5555`) para visualizar e editar os dados.

---

## Verificação e Testes

Para garantir que tudo está funcionando, você pode rodar os testes automatizados (se configurados):

```bash
npm test
```

Ou simplesmente tentar fazer login na aplicação frontend utilizando as credenciais geradas no Passo 4.
