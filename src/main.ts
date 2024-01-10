import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { json, urlencoded } from 'express';
import { CoreModule } from './core.module';
import { HttpsFunction, onRequest } from 'firebase-functions/v2/https';
import * as winston from 'winston';
import * as process from 'process';
import { WinstonModule } from 'nest-winston';
import { error, info } from 'firebase-functions/logger';

const server: express.Express = express();

async function createNestServer(expressInstance: express.Express) {
  const defaultWinstonLoggerOptions: winston.LoggerOptions = {
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format.splat(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      winston.format.printf((meta: any) => {
        const message = typeof meta.message === 'undefined' ? JSON.stringify(meta) : meta.message;
        const context: string = meta.context || meta.stack?.join?.('|') || 'Undefined';
        return `${process.env.mode === 'DEV' ? meta.timestamp + ' ' : ''}[${context}] ${meta.level}> ${message.trim()}`;
      }),
    ),
    transports: [new winston.transports.Console({ handleExceptions: true })],
    exitOnError: false,
  };

  const app = await NestFactory.create<NestExpressApplication>(CoreModule, new ExpressAdapter(expressInstance), {
    logger: WinstonModule.createLogger(defaultWinstonLoggerOptions),
  });

  app.enableCors();
  app.disable('x-powered-by');
  app.disable('X-Powered-By');

  const prefix = 'aurora';
  app.setGlobalPrefix(prefix);

  app.use(json({ limit: '75mb' }));
  app.use(urlencoded({ extended: true, limit: '75mb' }));

  return app.init();
}

createNestServer(server)
  .then(() => info('Les Aurores sont prêtes 🚀'))
  .catch(err => error('Erreur depuis main.ts', err));

export const aurora: HttpsFunction = onRequest(server);
