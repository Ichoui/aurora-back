const assert = require('node:assert/strict');

const [, , apiUrl, ...options] = process.argv;
if (!apiUrl || options.some(option => option !== '--upstream' && option !== '--weather')) {
  console.error('Usage : node scripts/check-http.cjs URL_API [--upstream] [--weather]');
  process.exit(2);
}

const base = new URL(apiUrl);
if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
  console.error('Indiquer une URL HTTP(S) d’API sans identifiants ni paramètres.');
  process.exit(2);
}
base.pathname = base.pathname.replace(/\/$/, '');

const isObject = value => value && typeof value === 'object' && !Array.isArray(value);
const isNumberOrNull = value => value === null || typeof value === 'number';
const isString = value => typeof value === 'string';

const checks = [
  {
    name: 'Accueil',
    status: 200,
    validate: body => body === 'Hello Aurora Chasers!',
  },
  {
    name: 'Header absent',
    aurora: false,
    status: 400,
    validate: body => body.statusCode === 400,
  },
  {
    name: 'Recherche accentuée',
    path: '/cities',
    query: { search: 'qué' },
    status: 200,
    validate: body => Array.isArray(body) && body.length > 0,
  },
  {
    name: 'Recherche historique',
    path: '/city',
    query: { search: 'queb' },
    status: 200,
    validate: Array.isArray,
  },
  {
    name: 'Recherche trop courte',
    path: '/cities',
    query: { search: 'qu' },
    status: 200,
    validate: body => Array.isArray(body) && !body.length,
  },
  {
    name: 'Latitude invalide',
    path: '/map/ovation',
    query: { lat: 91, long: 0 },
    status: 400,
    validate: body => body.statusCode === 400,
  },
  {
    name: 'Validation météo',
    path: '/weather',
    query: { lat: 1000, lon: 0 },
    status: 400,
    validate: isObject,
  },
  {
    name: 'Validation géocodage',
    path: '/geocode',
    query: { lat: 0, lon: -181 },
    status: 400,
    validate: isObject,
  },
  {
    name: 'CORS',
    method: 'OPTIONS',
    headers: {
      Origin: 'https://localhost',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'aurora',
    },
    aurora: false,
    status: 204,
    validate: (_, headers) => Boolean(headers.get('access-control-allow-origin')),
  },
];

if (options.includes('--upstream')) {
  checks.push(
    {
      name: 'SWPC',
      path: '/swpc',
      body: {},
      status: 200,
      validate: body => ['forecastSolarCycle', 'forecastSolarWind', 'forecastKp', 'forecastTwentySevenDays', 'instantKp'].every(key => key in body),
    },
    {
      name: 'OVATION',
      path: '/map/ovation',
      status: 200,
      validate: body => Array.isArray(body) && body.length > 0 && body[0].length === 3,
    },
    {
      name: 'OVATION zéro / long',
      path: '/map/ovation',
      query: { lat: 0, long: 0 },
      status: 200,
      validate: isNumberOrNull,
    },
    {
      name: 'OVATION zéro / lng',
      path: '/map/ovation',
      query: { lat: 0, lng: 0 },
      status: 200,
      validate: isNumberOrNull,
    },
    {
      name: 'Nowcast zéro',
      path: '/instant/nowcast',
      body: { lat: 0, lng: 0 },
      status: 200,
      validate: body => isNumberOrNull(body.nowcast),
    },
    { name: 'Kp', path: '/forecast/kp', status: 200, validate: Array.isArray },
    {
      name: 'Kp courant',
      path: '/instant/kp',
      status: 200,
      validate: isObject,
    },
    {
      name: 'Prévision 27 jours',
      path: '/forecast/twentysevendays',
      status: 200,
      validate: isString,
    },
    {
      name: 'Cycle solaire',
      path: '/forecast/solarcycle',
      status: 200,
      validate: Array.isArray,
    },
    {
      name: 'Vent solaire 1 h',
      path: '/forecast/solarwind1h',
      status: 200,
      validate: Array.isArray,
    },
    {
      name: 'Vent solaire 7 j',
      path: '/forecast/solarwind7d',
      query: { firstDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      status: 200,
      validate: Array.isArray,
    },
    {
      name: 'Pôle Nord',
      path: '/map/polenorth',
      status: 200,
      validate: Array.isArray,
    },
    {
      name: 'Pôle Sud',
      path: '/map/polesouth',
      status: 200,
      validate: Array.isArray,
    },
  );
}

if (options.includes('--weather')) {
  const appid = process.env.AURORA_SMOKE_WEATHER_KEY;
  const query = { lat: 69.65, lon: 18.95, ...(appid ? { appid } : {}) };
  checks.push(
    {
      name: 'Météo',
      path: '/weather',
      query,
      status: 200,
      validate: body => isObject(body.current),
    },
    {
      name: 'Géocodage',
      path: '/geocode',
      query,
      status: 200,
      validate: Array.isArray,
    },
  );
}

async function check(test) {
  const url = new URL(base);
  url.pathname += test.path ?? '';
  for (const [key, value] of Object.entries(test.query ?? {})) url.searchParams.set(key, value);
  const headers = { ...test.headers };
  if (test.aurora !== false) headers.aurora = 'true';
  if (test.body !== undefined) headers['Content-Type'] = 'application/json';
  const started = performance.now();
  let status = 'indisponible';
  try {
    const response = await fetch(url, {
      method: test.method ?? (test.body === undefined ? 'GET' : 'POST'),
      headers,
      body: test.body === undefined ? undefined : JSON.stringify(test.body),
      signal: AbortSignal.timeout(35_000),
      redirect: 'manual',
    });
    status = response.status;
    const data = await response.text();
    let body;
    try {
      body = JSON.parse(data);
    } catch {
      body = data;
    }
    assert.equal(response.status, test.status);
    assert.ok(test.validate(body, response.headers));
    console.log(`OK · ${test.name} · ${status} · ${Math.round(performance.now() - started)} ms`);
    return true;
  } catch (error) {
    console.error(`ÉCHEC · ${test.name} · ${status} · ${error.name} · ${Math.round(performance.now() - started)} ms`);
    return false;
  }
}

async function main() {
  let passed = 0;
  for (const test of checks) {
    if (await check(test)) passed++;
  }
  console.log(`${passed}/${checks.length} contrôles réussis`);
  process.exitCode = passed === checks.length ? 0 : 1;
}

void main();
