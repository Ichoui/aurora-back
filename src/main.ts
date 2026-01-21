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

// Installer les parsers Express AVANT l'initialisation Nest.
// Cela évite que Nest tente de (ré)enregistrer le body-parser, ce qui touche `app.router`.
server.use(json({ limit: '75mb' }));
server.use(urlencoded({ extended: true, limit: '75mb' }));

// Workaround Nest/Express:
// Nest (ExpressAdapter.isMiddlewareApplied) lit `app.router`, mais Express 4 définit `router` avec un getter qui lève.
// On initialise le router interne, puis on expose une propriété `router` non-throwing qui renvoie `app._router`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(server as any).lazyrouter?.();
try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s: any = server as any;
  if (s && !Object.prototype.hasOwnProperty.call(s, 'router')) {
    Object.defineProperty(s, 'router', {
      configurable: true,
      enumerable: false,
      get() {
        return this._router;
      },
    });
  }
} catch {
  // Si jamais l'environnement interdit defineProperty, on laisse échouer (mais ce n'est pas attendu en Node).
}

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
        const mode = (process.env.MODE || process.env.mode || '').toUpperCase();
        return `${mode === 'DEV' ? meta.timestamp + ' ' : ''}[${context}] ${meta.level}> ${message.trim()}`;
      }),
    ),
    transports: [new winston.transports.Console({ handleExceptions: true })],
    exitOnError: false,
  };

  const app = await NestFactory.create<NestExpressApplication>(CoreModule, new ExpressAdapter(expressInstance), {
    logger: WinstonModule.createLogger(defaultWinstonLoggerOptions),
    // On laisse Express gérer le body parsing (déjà configuré au-dessus).
    // Important: Nest tente sinon d'enregistrer automatiquement des parsers.
    bodyParser: false,
  });

  app.enableCors();
  app.disable('x-powered-by');
  app.disable('X-Powered-By');

  const prefix = 'aurora';
  app.setGlobalPrefix(prefix);

  return app.init();
}

createNestServer(server)
  .then(() => info('Les Aurores sont prêtes 🚀'))
  .catch(err => error('Erreur depuis main.ts', err));

export const aurora: HttpsFunction = onRequest(server);
