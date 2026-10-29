const fs = require('node:fs/promises');
const path = require('node:path');
const { NestFactory } = require('@nestjs/core');
const { CoreModule } = require('../dist/src/core.module');
const { configureNestApp } = require('../dist/src/bootstrap');
const { createApiDocument } = require('../dist/src/openapi/document');

// Build metadata without external connections, HTTP calls or listeners.
async function buildDocument() {
  const app = await NestFactory.create(CoreModule, { logger: false });
  try {
    configureNestApp(app);
    await app.init();
    return createApiDocument(app);
  } finally {
    await app.close();
  }
}

async function main() {
  const document = await buildDocument();
  const destination = path.join(__dirname, '../docs/openapi.json');
  const contents = JSON.stringify(document, null, 2) + '\n';
  await fs.mkdir(path.dirname(destination), { recursive: true });
  if (process.argv.includes('--check')) {
    if ((await fs.readFile(destination, 'utf8')) !== contents) {
      throw new Error('OpenAPI document is stale. Run npm run docs:generate.');
    }
    return;
  }
  await fs.writeFile(destination, contents);
  console.info('Generated docs/openapi.json');
}

module.exports = { buildDocument };
if (require.main === module) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
