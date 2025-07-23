import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { Message } from '../entities';

@Injectable()
export class MessageRepository {
  private readonly tableName = 'Messages';
  private readonly client: DynamoDBClient;

  constructor(private connection: DynamoDBClient) {
    this.client = this.connection;
  }

  async findAll(): Promise<Message[]> {
    const command = new ScanCommand({ TableName: this.tableName });

    const response = await this.client.send(command);

    if (response.Items) {
      return response.Items.map((item) => ({
        ...Message.newInstanceFromDB(item),
      }));
    }

    return [];
  }

  async create(message: Message): Promise<Message> {
    const itemObject: Record<string, AttributeValue> = {
      id: {
        S: message.id,
      },
      content: {
        S: message.content,
      },
      sender: {
        S: message.sender,
      },
      sentAt: {
        N: String(message.sentAt.getTime()),
      },
      status: {
        S: message.status,
      },
    };

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: itemObject,
    });

    await this.client.send(command);

    return message;
  }
}
