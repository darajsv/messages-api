import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { Message } from '../entities';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { decodeCursor, encodeCursor } from '@shared/utils';

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

  async queryBySenderPaginated(
    sender: string,
    options?: {
      limit?: number;
      cursor?: string;
    },
  ): Promise<{
    items: Message[];
    nextCursor?: string;
  }> {
    const query = {
      TableName: 'Messages',
      KeyConditionExpression: '#s = :sender',
      ExpressionAttributeNames: { '#s': 'sender' },
      ExpressionAttributeValues: { ':sender': sender },
      ScanIndexForward: false,
      Limit: options?.limit,
      ExclusiveStartKey: options?.cursor ? decodeCursor(options.cursor) : undefined,
    };

    const result = await this.client.send(new QueryCommand(query));

    const nextCursor = result.LastEvaluatedKey ? encodeCursor(result.LastEvaluatedKey) : undefined;

    return {
      items: (result.Items as Message[]) ?? [],
      nextCursor,
    };
  }
}
