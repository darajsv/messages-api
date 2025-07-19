import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import env from '@config/env';
import { SwaggerConfig } from '@config/swagger/swagger.config';
import fastifyHelmet from '@fastify/helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.setGlobalPrefix(env().application.API_BASE_PATH);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  if (env().application.NODE_ENV !== 'production') {
    const swaggerConfig = new SwaggerConfig();
    swaggerConfig.setupSwagger(`${env().application.API_BASE_PATH}/docs`, app);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.register(fastifyHelmet);
  await app.listen(env().application.PORT);
}
bootstrap();
