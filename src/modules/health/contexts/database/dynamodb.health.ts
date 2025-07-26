// dynamodb.health.ts
import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { IDatabaseProviders } from '@shared/providers/database/interfaces';
import { DATABASE_PROVIDER } from '@shared/constants';

@Injectable()
export class DynamoDBHealthIndicator {
  constructor(
    @Inject(DATABASE_PROVIDER) private client: IDatabaseProviders,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);
    try {
      await this.client.connection.send(new ListTablesCommand({}));
      return indicator.up();
    } catch (err) {
      return indicator.down({ error: err?.message });
    }
  }
}
