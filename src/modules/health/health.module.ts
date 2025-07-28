import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthCheckController } from './contexts/check/check.controller';
import { DynamoDBHealthIndicator } from './contexts/database/dynamodb.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthCheckController],
  providers: [DynamoDBHealthIndicator],
})
export class HealthModule {}
