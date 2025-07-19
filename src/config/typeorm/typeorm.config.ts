import { join } from 'path';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import env from '@config/env';

export const defaultConnectionOptions: PostgresConnectionOptions = {
  type: 'postgres',
  host: env().database.host,
  port: env().database.port ? parseInt(`${env().database.port}`, 10) : 5432,
  username: env().database.username,
  password: env().database.password,
  database: env().database.name,
  synchronize: false,
  logging: env().application.NODE_ENV !== 'development',
  entities: [
    join(__dirname, '..', '..', 'shared', 'entities', '*.entity.{ts,js}'),
  ],
  migrations: [
    join(
      __dirname,
      '..',
      '..',
      'config',
      'typeorm',
      'migrations',
      '*{.js,.ts}',
    ),
  ],
};

export const dataSource = new DataSource({ ...defaultConnectionOptions });
