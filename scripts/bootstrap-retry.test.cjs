const assert = require('node:assert/strict');
const { test } = require('node:test');
const bootstrap = require('../dist/src/bootstrap');

test('shared cold start recovers on a new Express instance after a failure', async t => {
  let failedServer;
  let attempts = 0;
  let releaseFirstAttempt;
  const firstAttempt = new Promise(resolve => {
    releaseFirstAttempt = resolve;
  });
  t.mock.method(bootstrap, 'createNestServer', async server => {
    attempts++;
    if (attempts === 1) {
      failedServer = server;
      await firstAttempt;
      throw new Error('simulated bootstrap failure');
    }
    assert.notEqual(server, failedServer);
    server.handle = (_request, response) => response.status(200).json({ ready: true });
  });

  const { aurora } = require('../dist/src/main');
  async function request() {
    const result = {};
    const response = {
      status(code) {
        result.status = code;
        return this;
      },
      json(body) {
        result.body = body;
        return this;
      },
    };
    await aurora({}, response);
    return result;
  }

  const batch = Promise.all([request(), request()]);
  releaseFirstAttempt();
  for (const response of await batch) {
    assert.equal(response.status, 503);
    assert.equal(response.body.statusCode, 503);
  }
  assert.equal(attempts, 1);

  assert.deepEqual(await request(), { status: 200, body: { ready: true } });
  assert.equal(attempts, 2);
});
