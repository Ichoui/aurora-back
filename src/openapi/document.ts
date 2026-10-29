import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject, SchemaObject } from '@nestjs/swagger';

const errorSchema: SchemaObject = {
  type: 'object',
  required: ['statusCode', 'message', 'error'],
  properties: {
    statusCode: { type: 'integer' },
    message: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
    error: { type: 'string' },
  },
};

export function createApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Aurorapp mobile API')
    .setDescription(
      'Shared Android and Apple API. Relative paths start at the Firebase function URL. See api-contract.md for legacy empty-body responses.',
    )
    .setVersion('1.0.0')
    .addApiKey(
      { type: 'apiKey', in: 'header', name: 'aurora', description: 'Non-empty shared application marker, e.g. true; not client authentication.' },
      'aurora',
    )
    .addSecurityRequirements('aurora')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  document.components ??= {};
  document.components.schemas ??= {};
  document.components.schemas.ApiError = errorSchema;

  const errors = {
    '400': 'Invalid input or missing application marker',
    '500': 'Unexpected server error',
    '502': 'Upstream service unavailable or malformed response',
    '503': 'Firebase initialization unavailable',
    '504': 'Upstream service timed out',
  };
  for (const path of Object.values(document.paths)) {
    for (const method of ['get', 'post'] as const) {
      const operation = path?.[method];
      if (!operation) continue;
      for (const [status, description] of Object.entries(errors)) {
        operation.responses[status] = { description, content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } };
      }
    }
  }
  return document;
}
