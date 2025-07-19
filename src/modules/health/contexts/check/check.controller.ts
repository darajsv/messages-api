import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { API_TAGS } from '@shared/constants';

@ApiTags(API_TAGS.HEALTH)
@Controller()
export class HealthCheckController {
  constructor(private health: HealthCheckService) {}
  @Get()
  @HealthCheck()
  check(): Promise<any> {
    return this.health.check([]);
  }
}
