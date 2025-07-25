import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { API_TAGS } from '@shared/constants';
import { DynamoDBHealthIndicator } from '../database/dynamodb.health';

@ApiTags(API_TAGS.HEALTH)
@Controller()
export class HealthCheckController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly dynamo: DynamoDBHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.dynamo.isHealthy('dynamodb')]);
  }
}
