import { Logger, Module, Provider } from '@nestjs/common';
import * as path from 'path';
import { DataSource } from 'typeorm';

import * as constants from '@shared/constants';
import { IDatabaseProviders } from './interfaces';
import { defaultConnectionOptions } from '@config/typeorm/typeorm.config';
import { TestRepository } from './repositories';

const databaseProviders: Provider[] = [
  {
    provide: constants.DATABASE_PROVIDER,
    useFactory: async (): Promise<IDatabaseProviders> => {
      const logger = new Logger(constants.DATABASE_PROVIDER);
      try {
        const dataSource = new DataSource({
          ...defaultConnectionOptions,
          entities: [path.join(__dirname, 'entities', '*.entity.{ts,js}')],
        });

        await dataSource.initialize();

        return {
          repositories: { testRepository: new TestRepository(dataSource) },
        };
      } catch (error) {
        logger.error(error);
        throw error;
      }
    },
  },
];

@Module({
  providers: databaseProviders,
  exports: databaseProviders,
})
export class DatabaseModule {}
