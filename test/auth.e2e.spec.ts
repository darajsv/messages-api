import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { RouterModule } from '@nestjs/core';

import { AuthModule } from '../src/modules/auth/auth.module';
import { LoginService } from '../src/modules/auth/contexts/login/login.service';
import { faker } from '@faker-js/faker/.';

const loginResponse = { accessToken: faker.internet.jwt(), expiresIn: 1, tokenType: ' Bearer' };

class LoginServiceStub {
  async execute(body: any) {
    return loginResponse;
  }
}

async function bootApp(): Promise<INestApplication> {
  const mod: TestingModule = await Test.createTestingModule({
    imports: [AuthModule, RouterModule.register([{ path: 'auth', module: AuthModule }])],
  })
    .overrideProvider(LoginService)
    .useClass(LoginServiceStub)
    .compile();

  const app = mod.createNestApplication(new FastifyAdapter());
  await app.init();
  return app;
}

describe('AuthModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await bootApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth returns 201 and an accessToken', async () => {
    const res = await (app as any).inject({
      method: 'POST',
      url: '/auth',
      payload: { clientId: faker.internet.username, clientSecret: faker.internet.password },
    });

    expect(res.statusCode).toBe(201);
    expect(JSON.parse(res.payload)).toEqual(loginResponse);
  });
});
