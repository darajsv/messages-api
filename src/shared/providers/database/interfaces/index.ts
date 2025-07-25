import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { MessageRepository } from '../repositories';

export interface IDatabaseProviders {
  repositories: {
    messageRepository: MessageRepository;
  };
  connection: DynamoDBClient;
}
