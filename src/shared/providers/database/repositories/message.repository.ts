import { marshallOptions } from './../../../../../node_modules/@aws-sdk/util-dynamodb/dist-types/marshall.d';
import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { Message, MessageStatus } from '../entities';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class MessageRepository {
  private readonly tableName = 'Messages';
  private readonly client: DynamoDBClient;

  constructor(private connection: DynamoDBClient) {
    this.client = DynamoDBDocumentClient.from(connection);
  }

  async create(message: Message): Promise<Message> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: message,
    });

    await this.client.send(command);

    return message;
  }

  async findById(id: string): Promise<Message | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        id,
      },
      ConsistentRead: true,
    });

    return (await this.client.send(command)).Item as Message | null;
  }
}
