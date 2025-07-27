import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import configuration from '@config/env';
import { HealthModule } from '@modules/health/health.module';
import { APP_GUARD, APP_INTERCEPTOR, RouterModule } from '@nestjs/core';
import { MessageModule } from '@modules/message/message.module';
import { DatabaseModule } from '@shared/providers/database/database.module';
import { HttpLoggerInterceptor } from '@shared/interceptors/logger.interceptor';
import { logger } from '@config/logger/logger.config';
import { WinstonModule } from 'nest-winston';
import { AuthModule } from '@modules/auth/auth.module';
import { JwtAuthGuard } from '@modules/auth/guards/auth.guard';
import { WINSTON } from '@shared/constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    WinstonModule.forRoot(logger),
    DatabaseModule,
    HealthModule,
    AuthModule,
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
      {
        path: 'auth',
        module: AuthModule,
      },
    ]),
  ],
  controllers: [],
  providers: [
    {
      provide: WINSTON,
      useValue: logger,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
