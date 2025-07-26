# 📩 Messages API

![Node.js](https://img.shields.io/badge/node-%3E%3D22.11.0-brightgreen)
![npm](https://img.shields.io/badge/npm-%3E%3D10.9-blue)
![DynamoDB](https://img.shields.io/badge/DynamoDB-local%20ready-orange)
![Datadog](https://img.shields.io/badge/-DataDog-000?logo=datadog)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

Uma API em **NestJS** para gerenciamento de mensagens, com persistência em **Amazon DynamoDB** (ou DynamoDB Local via Docker) e documentação interativa gerada pelo **Swagger**.

---

## ✨ Funcionalidades

- CRUD de mensagens
- Paginação cursor-based
- Health check e métricas
- Documentação automática (**Swagger UI**)
- Suporte a **CORS** restrito aos front-ends autorizados

---

## 🖥️ Pré-requisitos

| Ferramenta              | Versão mínima                                         |
| ----------------------- | ----------------------------------------------------- |
| Node.js                 | **22.11.0**                                           |
| npm                     | **10.9**                                              |
| Docker / Docker Compose | _Opcional_ — para executar o DynamoDB + Datadog Local |

---

## 🚀 Primeiros passos

### 1. Instalar dependências

```bash
npm install
```

### 2. (Opcional) Subir ambiente completo local (API + DynamoDB + Datadog Agent)

```bash
docker compose -f docker-compose.yml up -d --build
```

### 3. Criar tabela e popular com dados de exemplo

```bash
npm run create:dynamodb-table
npm run seed:messages
```

---

## 🏗️ Scripts NPM úteis

| Script       | Descrição                        |
| ------------ | -------------------------------- |
| `start`      | Inicia em **modo produção**      |
| `start:dev`  | _Hot-reload_ com **ts-node-dev** |
| `start:prod` | Build + execução em produção     |
| `test`       | Testes unitários (`jest`)        |
| `test:e2e`   | Testes end-to-end (`supertest`)  |
| `test:cov`   | Relatório de cobertura           |

---

## 🔌 Variáveis de ambiente (exemplo)

```env
PORT=3000
NODE_ENV=development
API_BASE_PATH=/api
CORS_ORIGINS=https://meu-frontend.com,https://outro-frontend.com

DB_REGION=sa-east-1
DB_ENDPOINT=http://localhost:8000
DB_ACCESS_KEY_ID=
DB_SECRET_ACCESS_KEY=

DD_API_KEY=
DD_SITE="datadoghq.com"

DD_APM_ENABLED=true
DD_APM_NON_LOCAL_TRAFFIC=true
DD_LOGS_ENABLED=true
DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL=true
DD_SERVICE=messages-api
DD_ENV=dev
DD_VERSION=1.0.0
DD_TRACE_AGENT_HOSTNAME=dd-agent
DD_LOGS_INJECTION=true
```

---

## 🛣️ Endpoints principais

| Método  | Rota                            | Descrição                |
| ------- | ------------------------------- | ------------------------ |
| `POST`  | `/messages`                     | Criar nova mensagem      |
| `GET`   | `/messages/:id`                 | Buscar por **ID**        |
| `GET`   | `/messages?sender=`             | Listar por **remetente** |
| `PATCH` | `/messages/:id/status`          | Atualizar **status**     |
| `GET`   | `/messages?startDate=&endDate=` | Listar por **período**   |

A documentação completa fica disponível em `/api/docs`.

---

## 🗄️ Modelagem de dados (DynamoDB)

### Esquema da tabela `Messages`

```text
PK  = sender (HASH)
SK  = sentAt (RANGE)

GSI #1: IdIndex
  - Partition key: id (HASH)

GSI #2: SentDateIndex
  - Partition key: sentMonth (HASH)
  - Sort key: sentAt (RANGE)
```

| Campo       | Tipo | Observações                                           |
| ----------- | ---- | ----------------------------------------------------- |
| `sender`    | S    | Remetente; principal critério de consulta             |
| `sentAt`    | N    | Epoch ms; permite ordenação cronológica               |
| `id`        | S    | UUID da mensagem; indexado em **IdIndex**             |
| `sentMonth` | S    | Ano-mês (`YYYY-MM`); particiona consultas por período |

#### Decisões de design

- **PK = `sender` + `sentAt`**  
  O caso de uso mais frequente é listar mensagens de um remetente em ordem temporal.  
  Ao combinar `sender` (HASH) e `sentAt` (RANGE) garantimos ordenação e ótima performance.

- **GSI 1 — `IdIndex`**  
  Busca direta por `id` (HASH only) para retornar rapidamente detalhes de uma mensagem específica, sem depender do remetente.

- **GSI 2 — `SentDateIndex`**  
  Para filtros por período, derivamos `sentMonth` (ex.: `2025-07`) e o usamos como HASH, mantendo `sentAt` como RANGE.  
  Dessa forma:
  1. As consultas de intervalo (`BETWEEN :from AND :to`) continuam eficientes.
  2. Evitamos hot partitions distribuindo itens por mês.

---

## 🔄 Fluxo da API

![Diagrama de fluxo da Messages API](docs/api-flow-diagram.png)

---

## 📜 Licença

Distribuído sob a licença **MIT** — veja o arquivo [LICENSE](https://github.com/nestjs/nest/blob/master/LICENSE) para mais detalhes.
