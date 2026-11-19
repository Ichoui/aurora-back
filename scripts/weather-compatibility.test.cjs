const assert = require('node:assert/strict');
const { test } = require('node:test');
const { of } = require('rxjs');
const { WeatherService } = require('../dist/src/weather/weather.service');

test('OpenWeather keeps the historical key and uses the server key when omitted', async t => {
  const name = 'OPENWEATHER_API_KEY';
  const before = process.env[name];
  t.after(() => {
    if (before === undefined) delete process.env[name];
    else process.env[name] = before;
  });
  process.env[name] = 'server-fixture';
  const forwarded = [];
  const service = new WeatherService({
    get: (_url, options) => {
      forwarded.push(options.params);
      return of({ data: {} });
    },
  });
  const coords = { lat: 0, lon: 0 };
  await service.getWeather({ ...coords, appid: 'historical-fixture' });
  await service.reverseGeoCode(coords);
  delete process.env[name];
  await service.getWeather(coords);

  assert.deepEqual(forwarded, [{ ...coords, appid: 'historical-fixture' }, { ...coords, appid: 'server-fixture' }, coords]);
});
