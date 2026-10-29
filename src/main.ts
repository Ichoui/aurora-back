import express from 'express';
import { HttpsFunction, onRequest } from 'firebase-functions/v2/https';
import { error, info } from 'firebase-functions/logger';
import { createNestServer } from './bootstrap';
import type { ApiErrorResponse } from './common/api-exception.filter';

const server = express();
let initialization: ReturnType<typeof createNestServer> | undefined;

export const aurora: HttpsFunction = onRequest(async (request, response) => {
  // Une seule initialisation partagée entre les requêtes concurrentes à froid.
  initialization ??= createNestServer(server).then(app => {
    info('Les Aurores sont prêtes 🚀');
    return app;
  });

  try {
    await initialization;
  } catch (err) {
    error('Firebase initialization failed', { errorType: err instanceof Error ? err.name : typeof err });
    response.status(503).json({
      statusCode: 503,
      message: 'Service temporarily unavailable',
      error: 'Service Unavailable',
    } satisfies ApiErrorResponse);
    return;
  }

  server(request, response);
});
