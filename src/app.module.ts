import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import configuration from '@config/env';
import { HealthModule } from '@modules/health/health.module';
import { RouterModule } from '@nestjs/core';
import { defaultConnectionOptions } from '@config/typeorm/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...defaultConnectionOptions,
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
