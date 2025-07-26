import { WinstonModule } from 'nest-winston';
import tracer from 'dd-trace';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ClassSerializerInterceptor, ValidationPipe, VersioningType } from '@nestjs/common';
import env from '@config/env';
import { SwaggerConfig } from '@config/swagger/swagger.config';
import fastifyHelmet from '@fastify/helmet';
import { CorsConfig } from '@config/cors/cors.config';
import { HttpLoggerInterceptor } from '@shared/interceptors/logger.interceptor';
import { logger } from '@config/logger/logger.config';

tracer.init({ logInjection: true });

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: WinstonModule.createLogger({ instance: logger }),
  });

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

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
    }),
    new HttpLoggerInterceptor(logger),
  );

  app.enableCors(CorsConfig);

  await app.register(fastifyHelmet);
  await app.listen(env().application.PORT, '0.0.0.0');
}
bootstrap();
