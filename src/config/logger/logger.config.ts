import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

export const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  level: 'verbose',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        nestWinstonModuleUtilities.format.nestLike('MessagesAPI'),
      ),
    }),
    new winston.transports.File({
      level: 'error',
      filename: 'errors.log',
      dirname: 'logs',
    }),
    new winston.transports.File({
      level: 'verbose',
      filename: 'combined.log',
      dirname: 'logs',
    }),
  ],
});
