import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { HealthCheckController } from '../check.controller';
import { DynamoDBHealthIndicator } from '../../database/dynamodb.health';

describe('HealthCheckController', () => {
  let controller: HealthCheckController;
  let health: jest.Mocked<HealthCheckService>;
  let dynamo: jest.Mocked<DynamoDBHealthIndicator>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: { check: jest.fn() },
        },
        {
          provide: DynamoDBHealthIndicator,
          useValue: { isHealthy: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(HealthCheckController);
    health = module.get(HealthCheckService);
    dynamo = module.get(DynamoDBHealthIndicator);
  });

  it('delegates to HealthCheckService and calls the DynamoDB indicator', async () => {
    const mockCheckResult: HealthCheckResult = {
      status: 'ok',
      info: { dynamodb: { status: 'up' } },
      error: {},
      details: { dynamodb: { status: 'up' } },
    };
    health.check.mockResolvedValue(mockCheckResult);
    dynamo.isHealthy.mockResolvedValue({ dynamodb: { status: 'up' } });

    const result = await controller.check();

    expect(result).toBe(mockCheckResult);

    expect(health.check).toHaveBeenCalledTimes(1);
    const [indicatorFns] = health.check.mock.calls[0];
    expect(indicatorFns).toHaveLength(1);

    await indicatorFns[0]();
    expect(dynamo.isHealthy).toHaveBeenCalledWith('dynamodb');
  });
});
