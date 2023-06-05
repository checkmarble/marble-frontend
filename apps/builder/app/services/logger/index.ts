import { LoggingWinston } from '@google-cloud/logging-winston';
import winston from 'winston';

const loggingWinston = new LoggingWinston({ redirectToStdout: true });

export const logger = winston.createLogger({
  level: 'info',
  transports: [loggingWinston],
});
