import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import configuration from '@config/env';
import { HealthModule } from '@modules/health/health.module';
import { APP_INTERCEPTOR, RouterModule } from '@nestjs/core';
import { MessageModule } from '@modules/message/message.module';
import { DatabaseModule } from '@shared/providers/database/database.module';
import { HttpLoggerInterceptor } from '@shared/interceptors/logger.interceptor';
import { logger } from '@config/logger/logger.config';
import { WinstonModule } from 'nest-winston';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    WinstonModule.forRoot(logger),
    DatabaseModule,
    HealthModule,
    MessageModule,
    RouterModule.register([
      {
        path: 'health',
        module: HealthModule,
      },
      {
        path: 'messages',
        module: MessageModule,
      },
    ]),
  ],
  controllers: [],
  providers: [
    {
      provide: 'WINSTON',
      useValue: logger,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggerInterceptor,
    },
  ],
})
export class AppModule {}
