# Aurora Back

NestJS API for Aurorapp, hosted as a Firebase Cloud Function (2nd generation), with bundled city search and NOAA/OpenWeather proxies.

## Installation initiale

Use Node.js 22.22.3 or later on the 22.x line. The Firebase runtime is explicitly set to `nodejs22`.

```sh
nvm install
nvm use
npm ci
```

City search uses the bundled `src/city/cities.json` catalog and needs no database or local credentials. The frontend needs its own dependencies and local OpenWeather key; see the [frontend README](../aurora-front/README.md).

The catalog is loaded on the first city request and kept in memory for the lifetime of each function instance. `/cities` uses accent-insensitive prefix search; the legacy `/city` route keeps substring search. Updating the catalog requires redeploying the function. Its numeric `id` is derived from the file order and may differ from former PostgreSQL IDs.

## Développement local

Depuis `aurora-front`, lancez ces trois commandes dans trois terminaux distincts, dans cet ordre. La première commande effectue la compilation initiale puis surveille les sources et les fichiers copiés ; attendez qu'elle se termine une première fois avant de lancer la deuxième. L'émulateur recharge la fonction quand le code compilé change.

```sh
npm run dev:back:watch   # Terminal 1 : API, compilation continue
npm run dev:back         # Terminal 2 : émulateur Firebase Functions
npm run dev:front        # Terminal 3 : application Angular
```

Ouvrez l'adresse locale affichée par Angular. Le client pointe déjà vers l'URL locale de l'émulateur (`127.0.0.1:5001`). Arrêtez chaque processus avec `Ctrl+C`. Pour travailler uniquement dans ce dépôt, les deux commandes backend équivalentes sont `npm run dev:watch` et `npm run dev:emulator`.

`npm start` conserve le démarrage ponctuel avec compilation ; `npm run deploy` compile puis déploie les Functions.

The Firebase CLI is installed locally. Emulation and deployment use its locked version. Authenticate with `npx firebase login` only when access to your Firebase project is needed.

The function is exported as `aurora`; HTTP routes use the `/aurora` prefix and require the `aurora` request header. Nest initializes on the first request, and concurrent cold requests wait for the same initialization. A failed initialization returns HTTP 503 for that instance.

## Shared mobile API

The backend serves the existing Android app and the upcoming Apple app through the same HTTP contract. See the [mobile API contract](docs/api-contract.md) for routes, parameters, response shapes, error handling and preserved legacy behavior.

A generated [OpenAPI specification](docs/openapi.json) is available for client tooling. Refresh it with `npm run docs:generate` after an API contract change. The generator does not connect to external services.

Controllers and services use typed Promises. TypeScript strict checking and ESLint's explicit-any rule are enabled. A global Nest [validation pipe](https://docs.nestjs.com/techniques/validation) validates DTOs and converts numeric strings explicitly. A global guard handles the existing header check, and one exception filter produces consistent errors and sanitized logs. Upstream timeouts map to HTTP 504 and other upstream Axios failures to 502.

NOAA transformations are independent of HTTP and cache access. Ovation map and nowcast requests share a 30-minute cache per instance, consult it before the network, and share concurrent cold fetches. Nowcast can initialize its dataset directly without first opening the map.

## Dependency migration

The project uses NestJS 12, Express 5, Firebase Admin 14 and ESLint 10. Nest's CommonJS output consumes the ESM Nest packages through Node 22's `require(esm)` support, as described in the [Nest migration guide](https://docs.nestjs.com/migration-guide).

Express 4 router patches have been removed. The extended query parser is set explicitly to preserve nested parameters under Express 5. JSON and form body limits remain 75 MB. Nest CLI copies the city JSON alongside the compiled service without starting asset watchers during a normal build.

Compatibility constraints are intentional:

- TypeScript is kept on the latest 6.0 patch: Nest CLI 12 uses its compiler API, and [typescript-eslint supports versions below 6.1](https://typescript-eslint.io/users/dependency-versions/). TypeScript 7 requires those tools to add support first.
- Keyv stays on 5.x because [cache-manager 7 relies on the Keyv 5 contract](https://keyv.org/docs/storage-adapters/redis/).
- Node type definitions stay on 22.x to match the Firebase runtime.

The latest Firebase CLI currently brings development-only audit alerts through `uuid` and OpenTelemetry. Avoid `npm audit fix --force`, which proposes downgrading the CLI. Review these when Firebase updates its dependencies.
