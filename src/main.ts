import express from 'express';
import { HttpsFunction, onRequest } from 'firebase-functions/v2/https';
import { error, info } from 'firebase-functions/logger';
import { createNestServer } from './bootstrap';
import type { ApiErrorResponse } from './common/api-exception.filter';

async function initializeServer(): Promise<ReturnType<typeof express>> {
  const server = express();
  await createNestServer(server);
  info('Les Aurores sont prêtes 🚀');
  return server;
}

let initialization: ReturnType<typeof initializeServer> | undefined;

export const aurora: HttpsFunction = onRequest(async (request, response) => {
  const attempt = (initialization ??= initializeServer());
  let server: Awaited<typeof attempt>;

  try {
    server = await attempt;
  } catch (err) {
    // Un autre appel peut déjà avoir entrepris une nouvelle initialisation.
    if (initialization === attempt) {
      initialization = undefined;
    }
    error('Firebase initialization failed', {
      errorType: err instanceof Error ? err.name : typeof err,
    });
    response.status(503).json({
      statusCode: 503,
      message: 'Service temporarily unavailable',
      error: 'Service Unavailable',
    } satisfies ApiErrorResponse);
    return;
  }

  server(request, response);
});
