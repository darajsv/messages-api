import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import configuration from '@config/env';
import { HealthModule } from '@modules/health/health.module';
import { RouterModule } from '@nestjs/core';
import { MessageModule } from '@modules/message/message.module';
import { DatabaseModule } from '@shared/providers/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
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
  providers: [],
})
export class AppModule {}
