import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { Message } from '../entities';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { decodeCursor, encodeCursor, monthBuckets, toEpoch } from '@shared/utils';

type ListOptions = { limit?: number; cursor?: string };
@Injectable()
export class MessageRepository {
  private readonly tableName = 'Messages';
  private readonly client: DynamoDBClient;
  private readonly idIndex = 'IdIndex';

  constructor(private connection: DynamoDBClient) {
    this.client = DynamoDBDocumentClient.from(connection);
  }

  async create(message: Message): Promise<Message> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: message,
      }),
    );

    return message;
  }

  async findById(id: string): Promise<Message | null> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: this.idIndex,
        KeyConditionExpression: '#id = :id',
        ExpressionAttributeNames: { '#id': 'id' },
        ExpressionAttributeValues: { ':id': id },
      }),
    );

    return (result.Items as Message[])[0] || null;
  }

  async listBySender(
    sender: string,
    startDate?: string,
    endDate?: string,
    options: ListOptions = {},
  ): Promise<{
    items: Message[];
    nextCursor?: string;
  }> {
    const query: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: '#s = :s',
      ExpressionAttributeNames: { '#s': 'sender' },
      ExpressionAttributeValues: { ':s': sender },
      ScanIndexForward: false,
      Limit: options.limit,
      ExclusiveStartKey: options.cursor ? decodeCursor(options.cursor) : undefined,
    };

    if (startDate && endDate) {
      query.KeyConditionExpression += ' AND #t BETWEEN :from AND :to';
      query.ExpressionAttributeNames!['#t'] = 'sentAt';
      query.ExpressionAttributeValues![':from'] = toEpoch(startDate);
      query.ExpressionAttributeValues![':to'] = toEpoch(endDate);
    }

    const result = await this.client.send(new QueryCommand(query));
    const nextCursor = result.LastEvaluatedKey ? encodeCursor(result.LastEvaluatedKey) : undefined;

    return {
      items: result.Items as Message[],
      nextCursor,
    };
  }

  async listByPeriod(
    startDate: string,
    endDate: string,
    options: ListOptions = {},
  ): Promise<{
    items: Message[];
    nextCursor?: string;
  }> {
    const limit = options.limit;
    const buckets = monthBuckets(startDate, endDate);
    const decoded = options.cursor ? decodeCursor(options.cursor) : {};

    const pages = await Promise.all(
      buckets.map(async (bucket) => {
        const startKey = decoded[bucket];
        const query: QueryCommandInput = {
          TableName: this.tableName,
          IndexName: 'SentDateIndex',
          KeyConditionExpression: '#m = :m AND #t BETWEEN :from AND :to',
          ExpressionAttributeNames: { '#m': 'sentMonth', '#t': 'sentAt' },
          ExpressionAttributeValues: {
            ':m': bucket,
            ':from': toEpoch(startDate),
            ':to': toEpoch(endDate),
          },
          ScanIndexForward: false,
          Limit: limit,
          ...(startKey && { ExclusiveStartKey: startKey }),
        };

        return this.client.send(new QueryCommand(query));
      }),
    );

    const items = pages
      .flatMap((p) => p.Items as Message[])
      .sort((a, b) => (b.sentAt as number) - (a.sentAt as number))
      .slice(0, limit);

    const cursorObj = pages.reduce<Record<string, any>>((acc, p, i) => {
      if (p.LastEvaluatedKey) acc[buckets[i]] = p.LastEvaluatedKey;
      return acc;
    }, {});

    const nextCursor = Object.keys(cursorObj).length > 0 ? encodeCursor(cursorObj) : undefined;

    return { items: items as Message[], nextCursor };
  }

  async updateStatus(sender: string, sentAt: number, status: string): Promise<Message> {
    const result = await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { sender, sentAt },
        UpdateExpression: 'SET #st = :s',
        ExpressionAttributeNames: { '#st': 'status' },
        ExpressionAttributeValues: { ':s': status },
        ConditionExpression: 'attribute_exists(id)',
        ReturnValues: 'ALL_NEW',
      }),
    );

    return result.Attributes as Message;
  }
}
