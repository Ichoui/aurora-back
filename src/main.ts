import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import * as express from 'express';
import * as functions from 'firebase-functions';
import { AppModule } from './app.module';
import { json, urlencoded } from "express";

const server: express.Express = express();
export const createNestServer = async (expressInstance: express.Express) => {
  const adapter = new ExpressAdapter(expressInstance);
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    adapter,
    {},
  );
  app.enableCors();
  app.disable('x-powered-by');
  app.disable('X-Powered-By');
  // app.use(json({ limit: '50mb' }));
  // app.use(urlencoded({ extended: true, limit: '50mb' }));
  return app.init();
};

// A faire : max requete par second (par ip ?)
createNestServer(server)
  .then((v) => console.log('Nest Ready'))
  .catch((err) => console.error('Nest broken', err));

// const name is first segment of api
export const aurora: functions.HttpsFunction = functions.https.onRequest(server);
