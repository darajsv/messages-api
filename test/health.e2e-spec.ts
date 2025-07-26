import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { HealthModule } from '../src/modules/health/health.module';
import { DynamoDBHealthIndicator } from '@modules/health/contexts/database/dynamodb.health';

async function bootApp(
  indicatorMock: Partial<Record<keyof DynamoDBHealthIndicator, any>>,
): Promise<INestApplication> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [HealthModule],
  })
    .overrideProvider(DynamoDBHealthIndicator)
    .useValue(indicatorMock)
    .compile();

  const app = module.createNestApplication(new FastifyAdapter());
  await app.init();
  return app;
}

describe('HealthModule (e2e)', () => {
  it('GET / -> 200 & status=ok when DynamoDB is up', async () => {
    const app = await bootApp({
      isHealthy: () => Promise.resolve({ dynamodb: { status: 'up' } }),
    });

    const res = await (
      app.getHttpAdapter().getInstance() as import('fastify').FastifyInstance
    ).inject({ method: 'GET', url: '/' });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toHaveProperty('status', 'ok');

    await app.close();
  });

  it('GET / -> 503 & status=error when DynamoDB throws', async () => {
    const app = await bootApp({
      isHealthy: () => Promise.resolve({ dynamodb: { status: 'down', error: 'boom' } }),
    });

    const res = await (
      app.getHttpAdapter().getInstance() as import('fastify').FastifyInstance
    ).inject({ method: 'GET', url: '/' });

    expect(res.statusCode).toBe(503);
    expect(JSON.parse(res.payload)).toHaveProperty('status', 'error');

    await app.close();
  });
});
