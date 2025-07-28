import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { RouterModule } from '@nestjs/core';
import { MessageModule } from '../src/modules/message/message.module';
import { faker } from '@faker-js/faker/.';
import { DatabaseModule } from '@shared/providers/database/database.module';

function buildDbStub() {
  const inMemoryDB: any[] = [];

  return {
    repositories: {
      messageRepository: {
        create: async (msg: any) => {
          inMemoryDB.push(msg);
          return msg;
        },

        findById: async (id: string) => inMemoryDB.find((m) => m.id === id) ?? null,

        listBySender: async (
          sender: string,
          _start?: string,
          _end?: string,
          { limit = 100 } = {},
        ) => {
          const items = inMemoryDB.filter((m) => m.sender === sender).slice(0, limit);
          return { items };
        },

        listByPeriod: async (startIso: string, endIso: string, { limit = 100 } = {}) => {
          const start = new Date(startIso).getTime();
          const end = new Date(endIso).getTime();
          const items = inMemoryDB
            .filter((m) => m.sentAt >= start && m.sentAt <= end)
            .slice(0, limit);
          return { items };
        },

        updateStatus: async (sender: string, sentAt: number, status: string) => {
          const idx = inMemoryDB.findIndex((m) => m.sender === sender && m.sentAt === sentAt);
          if (idx === -1) return null;
          inMemoryDB[idx] = { ...inMemoryDB[idx], status };
          return inMemoryDB[idx];
        },
      },
    },
  };
}

async function bootApp(): Promise<INestApplication> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      MessageModule,
      DatabaseModule,
      RouterModule.register([{ path: 'messages', module: MessageModule }]),
    ],
  })
    .overrideProvider('DATABASE_PROVIDER')
    .useValue(buildDbStub())
    .compile();

  const app = module.createNestApplication(new FastifyAdapter());
  await app.init();
  return app;
}

describe('MessagesModule (e2e)', () => {
  let app: INestApplication;
  const payload = { content: faker.lorem.sentence(), sender: faker.internet.email() };
  let created: any;

  beforeAll(async () => {
    app = await bootApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /messages -> 204 when inMemoryDB is empty', async () => {
    const res = await (
      app.getHttpAdapter().getInstance() as import('fastify').FastifyInstance
    ).inject({ method: 'GET', url: '/messages' });

    expect(res.statusCode).toBe(204);
  });

  it('POST /messages -> 201 & returns id', async () => {
    const res = await (
      app.getHttpAdapter().getInstance() as import('fastify').FastifyInstance
    ).inject({
      method: 'POST',
      url: '/messages',
      payload,
    });

    expect(res.statusCode).toBe(201);

    created = JSON.parse(res.payload);
    expect(created).toMatchObject(payload);
    expect(created).toHaveProperty('id');
  });

  it('GET /messages/:id -> 200 & body', async () => {
    const res = await (
      app.getHttpAdapter().getInstance() as import('fastify').FastifyInstance
    ).inject({
      method: 'GET',
      url: `/messages/${created.id}`,
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual(created);
  });

  it('GET /messages?sender= -> 200 with the item', async () => {
    const res = await (
      app.getHttpAdapter().getInstance() as import('fastify').FastifyInstance
    ).inject({
      method: 'GET',
      url: `/messages?sender=${payload.sender}`,
    });

    expect(res.statusCode).toBe(200);
    const { items } = JSON.parse(res.payload);
    expect(items).toHaveLength(1);

    delete created.sentMonth;
    expect(items[0]).toEqual(created);
  });

  it('PATCH /messages/:id/status updates status', async () => {
    const res = await (
      app.getHttpAdapter().getInstance() as import('fastify').FastifyInstance
    ).inject({
      method: 'PATCH',
      url: `/messages/${created.id}`,
      payload: { status: 'read' },
    });

    expect(res.statusCode).toBe(200);
    const updated = JSON.parse(res.payload);
    expect(updated.status).toBe('read');

    const check = await (
      app.getHttpAdapter().getInstance() as import('fastify').FastifyInstance
    ).inject({
      method: 'GET',
      url: `/messages/${created.id}`,
    });
    expect(JSON.parse(check.payload).status).toBe('read');
  });
});
