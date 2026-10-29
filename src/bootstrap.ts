import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import type { Express } from 'express';
import { CoreModule } from './core.module';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import { ValidationPipe } from '@nestjs/common';

export function configureNestApp(app: NestExpressApplication): void {
  // Conserver les paramètres imbriqués acceptés par Express 4.
  app.set('query parser', 'extended');
  app.useBodyParser('json', { limit: '75mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '75mb' });
  app.enableCors();
  app.disable('x-powered-by');
  app.setGlobalPrefix('aurora');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: false,
      forbidUnknownValues: true,
      validationError: { target: false, value: false },
    }),
  );
}

export async function createNestServer(expressInstance: Express): Promise<NestExpressApplication> {
  const logger = WinstonModule.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format.splat(),
      winston.format.printf(meta => {
        const message = typeof meta.message === 'undefined' ? JSON.stringify(meta) : String(meta.message);
        const context = meta.context || (Array.isArray(meta.stack) ? meta.stack.join('|') : meta.stack) || 'Undefined';
        const mode = (process.env.MODE || process.env.mode || '').toUpperCase();
        return `${mode === 'DEV' ? String(meta.timestamp) + ' ' : ''}[${context}] ${meta.level}> ${message.trim()}`;
      }),
    ),
    transports: [new winston.transports.Console({ handleExceptions: true })],
    exitOnError: false,
  });

  const app = await NestFactory.create<NestExpressApplication>(CoreModule, new ExpressAdapter(expressInstance), {
    logger,
    abortOnError: false,
  });

  configureNestApp(app);
  return app.init();
}
