import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import configuration from '@config/env';
import { HealthModule } from '@modules/health/health.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    HealthModule,
    RouterModule.register([
      {
        path: 'health',
        module: HealthModule,
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
