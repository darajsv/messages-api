import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBHealthIndicator } from '../dynamodb.health';

describe('DynamoDBHealthIndicator', () => {
  const key = 'dynamodb';

  let client: { connection: { send: jest.Mock } };
  let healthIndicatorService: { check: jest.Mock };
  let indicator: DynamoDBHealthIndicator;

  let upMock: jest.Mock;
  let downMock: jest.Mock;

  beforeEach(() => {
    upMock = jest.fn().mockReturnValue({ [key]: { status: 'up' } });
    downMock = jest.fn().mockImplementation(({ error }) => ({
      [key]: { status: 'down', error },
    }));

    client = { connection: { send: jest.fn() } };

    healthIndicatorService = {
      check: jest.fn().mockReturnValue({ up: upMock, down: downMock }),
    };

    indicator = new DynamoDBHealthIndicator(client as any, healthIndicatorService as any);
  });

  it('returns “up” when DynamoDB responds', async () => {
    client.connection.send.mockResolvedValue({});

    const res = await indicator.isHealthy(key);

    expect(healthIndicatorService.check).toHaveBeenCalledWith(key);
    expect(client.connection.send).toHaveBeenCalledWith(expect.any(ListTablesCommand));
    expect(upMock).toHaveBeenCalled();
    expect(res).toEqual({ [key]: { status: 'up' } });
  });

  it('returns “down” when DynamoDB throws', async () => {
    client.connection.send.mockRejectedValue(new Error('boom'));

    const res = await indicator.isHealthy(key);

    expect(healthIndicatorService.check).toHaveBeenCalledWith(key);
    expect(downMock).toHaveBeenCalledWith({ error: 'boom' });
    expect(res).toEqual({ [key]: { status: 'down', error: 'boom' } });
  });
});
