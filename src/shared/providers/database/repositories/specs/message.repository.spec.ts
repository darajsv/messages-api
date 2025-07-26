import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { faker } from '@faker-js/faker';
import { MessageRepository } from '../message.repository';
import { Message, MessageStatus } from '../../entities';

jest.mock('@shared/utils', () => ({
  encodeCursor: jest.fn().mockImplementation((v) => JSON.stringify(v)),
  decodeCursor: jest.fn().mockImplementation((v) => JSON.parse(v)),
  monthBuckets: jest.fn().mockReturnValue(['2025-07']),
  toEpoch: jest.fn().mockReturnValue(1234567890),
}));

const { encodeCursor, decodeCursor } = jest.requireMock('@shared/utils');

const ddbMock = mockClient(DynamoDBDocumentClient);

const newRepo = () => new MessageRepository(new DynamoDBClient({ region: 'local' }));

const fakeMessage = (over: Partial<Message> = {}): Partial<Message> => ({
  id: faker.string.uuid(),
  content: faker.lorem.sentence(),
  sender: faker.internet.email(),
  sentAt: Date.now(),
  status: MessageStatus.SENT,
  ...over,
});

beforeEach(() => {
  ddbMock.reset();
  jest.clearAllMocks();
});

describe('MessageRepository', () => {
  describe('create', () => {
    it('puts the item and returns it', async () => {
      const repo = newRepo();
      const message = fakeMessage();

      ddbMock.on(PutCommand).resolves({});

      const result = await repo.create(message as Message);

      expect(ddbMock.commandCalls(PutCommand).length).toBe(1);
      expect(result).toEqual(message);
    });
  });

  describe('findById', () => {
    it('returns first item or null', async () => {
      const repo = newRepo();
      const message = fakeMessage();

      ddbMock.on(QueryCommand).resolves({ Items: [message] });

      const found = await repo.findById(message.id as string);
      expect(found).toEqual(message);

      ddbMock.reset();
      ddbMock.on(QueryCommand).resolves({ Items: [] });

      const none = await repo.findById('missing');
      expect(none).toBeNull();
    });
  });

  describe('listBySender', () => {
    const sender = faker.internet.email();
    const message = fakeMessage({ sender });
    it('builds cursor & maps items', async () => {
      const repo = newRepo();

      const lastKey = { sender, sentAt: message.sentAt };
      ddbMock.on(QueryCommand).resolves({
        Items: [message],
        LastEvaluatedKey: lastKey,
      });

      const res = await repo.listBySender(sender, undefined, undefined, {
        limit: 10,
        cursor: undefined,
      });

      expect(ddbMock.commandCalls(QueryCommand).length).toBe(1);
      expect(encodeCursor).toHaveBeenCalledWith(lastKey);
      expect(res).toEqual({
        items: [message],
        nextCursor: JSON.stringify(lastKey),
      });
    });

    it('list with startDate & endDate adds BETWEEN clause', async () => {
      const repo = newRepo();
      const startDate = '2025-07-01';
      const endDate = '2025-07-31';
      const message = fakeMessage({ sender });

      ddbMock.on(QueryCommand).resolves({ Items: [message] });

      const res = await repo.listBySender(sender, startDate, endDate, {
        limit: 5,
        cursor: undefined,
      });

      const { toEpoch } = jest.requireMock('@shared/utils');
      expect(toEpoch).toHaveBeenCalledWith(startDate);
      expect(toEpoch).toHaveBeenCalledWith(endDate);

      const callInput = ddbMock.commandCalls(QueryCommand)[0].args[0].input as any;

      expect(callInput.KeyConditionExpression).toContain('AND #t BETWEEN :from AND :to');
      expect(callInput.ExpressionAttributeNames['#t']).toBe('sentAt');

      expect(res).toEqual({ items: [message], nextCursor: undefined });
    });

    it('returns list when options is omitted', async () => {
      ddbMock.on(QueryCommand).resolves({ Items: [message] });

      const res = await newRepo().listBySender(sender);

      expect(ddbMock.commandCalls(QueryCommand)[0].args[0].input.Limit).toBeUndefined();
      expect(res).toEqual({ items: [message], nextCursor: undefined });
    });

    it('decodes cursor and sends ExclusiveStartKey', async () => {
      const startKey = { sender, sentAt: message.sentAt };
      const encoded = JSON.stringify(startKey);

      const { decodeCursor } = jest.requireMock('@shared/utils');
      decodeCursor.mockReturnValue(startKey);

      ddbMock.on(QueryCommand).resolves({ Items: [message], LastEvaluatedKey: undefined });

      await newRepo().listBySender(sender, undefined, undefined, {
        cursor: encoded,
        limit: 10,
      });

      const callInput = ddbMock.commandCalls(QueryCommand)[0].args[0].input;
      expect(callInput.ExclusiveStartKey).toEqual(startKey);
      expect(decodeCursor).toHaveBeenCalledWith(encoded);
    });

    it('maps empty response to items: [] and nextCursor: undefined', async () => {
      ddbMock.on(QueryCommand).resolves({ Items: [] });

      const res = await newRepo().listBySender(sender);

      expect(res).toEqual({ items: [], nextCursor: undefined });
    });
  });

  describe('listByPeriod', () => {
    const startDate = '2025-06-01';
    const endDate = '2025-08-31';
    const msgJune = fakeMessage({ sentAt: 3 });
    const msgJuly = fakeMessage({ sentAt: 10 });
    const repo = newRepo();
    const utilsMock = jest.requireMock('@shared/utils');
    afterEach(() => {
      ddbMock.resetHistory();
      jest.clearAllMocks();
    });
    it('merges pages, sorts desc, builds nextCursor', async () => {
      utilsMock.monthBuckets.mockReturnValue(['2025-06', '2025-07']);
      const lastKey = { sentMonth: '2025-07', sentAt: msgJuly.sentAt };

      ddbMock
        .on(QueryCommand, {
          ExpressionAttributeValues: { ':m': '2025-06', ':from': 1234567890, ':to': 1234567890 },
        })
        .resolves({ Items: [msgJune] });

      ddbMock
        .on(QueryCommand, {
          ExpressionAttributeValues: { ':m': '2025-07', ':from': 1234567890, ':to': 1234567890 },
        })
        .resolves({ Items: [msgJuly], LastEvaluatedKey: lastKey });

      const result = await repo.listByPeriod(startDate, endDate, {
        limit: 5,
        cursor: undefined,
      });

      expect(ddbMock.commandCalls(QueryCommand).length).toBe(2);

      expect(result.items.map((m) => m.sentAt)).toEqual([msgJuly.sentAt, msgJune.sentAt]);

      expect(utilsMock.encodeCursor).toHaveBeenCalledWith({ '2025-07': lastKey });

      expect(result).toEqual({
        items: [msgJuly, msgJune],
        nextCursor: JSON.stringify({ '2025-07': lastKey }),
      });
    });

    it('works when options object is omitted', async () => {
      utilsMock.monthBuckets.mockReturnValue(['2025-06']);
      const msg = fakeMessage({ sentAt: 111 });

      ddbMock.on(QueryCommand).resolves({ Items: [msg] });

      const res = await repo.listByPeriod(startDate, endDate);

      const callInput = ddbMock.commandCalls(QueryCommand)[0].args[0].input;
      expect(callInput.Limit).toBeUndefined();

      expect(res).toEqual({
        items: [msg],
        nextCursor: undefined,
      });
    });

    it('decodes cursor and passes bucket-specific ExclusiveStartKey', async () => {
      utilsMock.monthBuckets.mockReturnValue(['2025-06', '2025-07']);

      const decodedCursor = { '2025-06': { sentMonth: '2025-06', sentAt: 1 } };
      utilsMock.decodeCursor.mockReturnValue(decodedCursor);

      const encoded = 'ENCODED';
      const junMsg = fakeMessage({ sentAt: 1 });
      const julMsg = fakeMessage({ sentAt: 999 });

      ddbMock
        .on(QueryCommand, {
          ExpressionAttributeValues: { ':m': '2025-06', ':from': 1234567890, ':to': 1234567890 },
        })
        .resolves({ Items: [junMsg] });

      const lastKey = { sentMonth: '2025-07', sentAt: julMsg.sentAt };
      ddbMock
        .on(QueryCommand, {
          ExpressionAttributeValues: { ':m': '2025-07', ':from': 1234567890, ':to': 1234567890 },
        })
        .resolves({ Items: [julMsg], LastEvaluatedKey: lastKey });

      const res = await repo.listByPeriod(startDate, endDate, { limit: 10, cursor: encoded });

      expect(utilsMock.decodeCursor).toHaveBeenCalledWith(encoded);

      const juneInput = ddbMock.commandCalls(QueryCommand)[0].args[0].input;
      expect(juneInput.ExclusiveStartKey).toEqual(decodedCursor['2025-06']);

      expect(utilsMock.encodeCursor).toHaveBeenCalledWith({ '2025-07': lastKey });

      expect(res.items.map((m) => m.sentAt)).toEqual([julMsg.sentAt, junMsg.sentAt]);
      expect(res.nextCursor).toEqual(JSON.stringify({ '2025-07': lastKey }));
    });

    it('maps empty DynamoDB responses to items: []', async () => {
      utilsMock.monthBuckets.mockReturnValue(['2025-06', '2025-07']);
      ddbMock.on(QueryCommand).resolves({ Items: [] });
      const res = await repo.listByPeriod(startDate, endDate, { limit: 50 });

      expect(res).toEqual({ items: [], nextCursor: undefined });
    });
  });

  describe('updateStatus', () => {
    it('sends UpdateCommand and returns Attributes', async () => {
      const repo = newRepo();
      const original = fakeMessage();
      const updated = { ...original, status: MessageStatus.READ };

      ddbMock.on(UpdateCommand).resolves({ Attributes: updated });

      const res = await repo.updateStatus(
        original.sender as string,
        original.sentAt as number,
        MessageStatus.READ,
      );

      expect(ddbMock.commandCalls(UpdateCommand).length).toBe(1);
      expect(res).toEqual(updated);
    });
  });
});
