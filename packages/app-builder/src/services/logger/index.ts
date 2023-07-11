import { LoggingWinston } from '@google-cloud/logging-winston';
import winston from 'winston';

const loggingWinston = new LoggingWinston({
  redirectToStdout: true,
});

export const logger = winston.createLogger({
  level: 'info',
  transports: [
    // eslint-disable-next-line no-restricted-properties
    process.env.NODE_ENV === 'development'
      ? new winston.transports.Console({
          format: winston.format.prettyPrint({ colorize: true }),
        })
      : loggingWinston,
  ],
});
