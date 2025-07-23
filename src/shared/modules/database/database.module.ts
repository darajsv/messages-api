import { Global, Module, Provider } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import env from '@config/env';
import { IDatabaseProviders } from './interfaces';
import { MessageRepository } from './repositories';

const databaseProviders: Provider[] = [
  {
    provide: 'DATABASE_PROVIDER',
    useFactory: (): IDatabaseProviders => {
      const connection = new DynamoDBClient({
        region: env().database.region,
        endpoint: env().database.endpoint,
        credentials: {
          accessKeyId: env().database.credentials.accessKeyId,
          secretAccessKey: env().database.credentials.secretAccessKey,
        },
      });

      return {
        repositories: {
          messageRepository: new MessageRepository(connection),
        },
      };
    },
  },
];

@Global()
@Module({
  providers: databaseProviders,
  exports: databaseProviders,
})
export class DatabaseModule {}
