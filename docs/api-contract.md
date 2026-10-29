# Mobile API contract

This API is shared by the Android app and the upcoming Apple app. Paths, header handling and successful payloads are independent of the client platform. All paths below are relative to the Firebase function URL and include Nest's `/aurora` prefix.

## Requests

Send a non-empty `aurora` header, for example `aurora: true`. Existing header values continue to work; no Android/iOS identification is required. This header is an application marker, not proof of client identity. Missing or empty headers return HTTP 400, preserving the existing contract. CORS preflight is handled before this check.

Use `application/json` for POST requests. Form-encoded requests remain accepted. Coordinates accept JSON numbers or decimal numeric strings, including zero. Latitude must be between -90 and 90; longitude between -180 and 180. Empty strings, booleans, arrays and objects are rejected as coordinates. Unknown extra fields remain accepted for compatibility; known fields are validated before upstream requests.

| Method | Path                               | Parameters                                                              | Successful response                                                                                             |
| ------ | ---------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| GET    | `/aurora`                          | None                                                                    | Plain text `Hello Aurora Chasers!`                                                                              |
| POST   | `/aurora/swpc`                     | Optional `lat`, `lng` or legacy `long`; currently unused in aggregation | Object with `forecastSolarCycle`, `forecastSolarWind`, `forecastKp`, `forecastTwentySevenDays`, `instantKp`     |
| GET    | `/aurora/map/ovation`              | Optional `lat` and `lng` or legacy `long`                               | Coordinate tuples `[longitude, latitude, probability][]`; with a complete coordinate pair, a scalar probability |
| POST   | `/aurora/instant/nowcast`          | Required `lat`, `lng`                                                   | `{ "nowcast": number \| null }`                                                                                 |
| GET    | `/aurora/forecast/solarcycle`      | None                                                                    | `{ timeTag, predictedSsn, predictedSolarFlux }[]`                                                               |
| GET    | `/aurora/forecast/solarwind1h`     | None                                                                    | Array of NOAA samples, preserving provider field names such as `time_tag`                                       |
| GET    | `/aurora/forecast/solarwind7d`     | Required `firstDate`                                                    | `{ time_tag, speed }[]`, preserving the historical sampling behavior                                            |
| GET    | `/aurora/forecast/kp`              | None                                                                    | `{ kpIndex, timeTag }[]`                                                                                        |
| GET    | `/aurora/forecast/twentysevendays` | None                                                                    | Raw NOAA outlook text                                                                                           |
| GET    | `/aurora/instant/kp`               | None                                                                    | Latest NOAA KP object                                                                                           |
| GET    | `/aurora/map/polenorth`            | None                                                                    | NOAA animation JSON                                                                                             |
| GET    | `/aurora/map/polesouth`            | None                                                                    | NOAA animation JSON                                                                                             |
| GET    | `/aurora/weather`                  | Required `lat`, `lon`; optional `appid`, `units`, `lang`, `exclude`     | OpenWeather response body without an Axios wrapper                                                              |
| GET    | `/aurora/geocode`                  | Required `lat`, `lon`; optional `appid`, positive integer `limit`       | OpenWeather reverse-geocoding array                                                                             |
| GET    | `/aurora/cities`                   | Optional string `search`, trimmed                                       | Cities with `id`, `name`, `countryCode`, `lat`, `long`; `[]` for missing/short searches                          |
| GET    | `/aurora/city`                     | Legacy optional string `search`, trimmed                                | Legacy city JSON records; empty HTTP body for missing/short searches                                            |

`units` accepts `standard`, `metric` or `imperial`. Existing extra OpenWeather parameters are forwarded. The `appid` parameter remains optional at the proxy boundary; the upstream provider can still require a valid key.

## Compatibility details

- Map queries accept both `long` and `lng`. If both are provided they must agree. A single optional coordinate keeps the legacy whole-map response: the current Android helper can omit zero values. New clients should send both coordinates explicitly.
- ISO 8601 dates with an explicit timezone are recommended for `firstDate`. Legacy NOAA UTC timestamps and RFC 1123 UTC strings are accepted and normalized to UTC. Invalid calendar dates and repeated date parameters return HTTP 400.
- Valid empty NOAA tables return empty arrays. In the aggregated `/swpc` response, an absent latest KP is explicitly `null`.
- Nowcast absence is always represented by `{ "nowcast": null }`. A missing match in the legacy scalar map response or an empty standalone KP response retains an empty HTTP body. Native clients should handle these legacy empty responses separately from JSON objects.
- City coordinates retain their historical string representation. The bundled catalog supplies numeric IDs from its file order, so IDs may differ from former PostgreSQL values. NOAA's existing field names, thinning and response order are preserved.

## Errors

Validation and request errors return HTTP 400. Upstream HTTP/network failures return 502; upstream timeouts return 504. Unexpected application errors return 500. Responses have a common JSON envelope:

```json
{
  "statusCode": 400,
  "message": ["lat must not be greater than 90"],
  "error": "Bad Request"
}
```

`message` can be a string or a string array. Android and Apple clients should branch on the HTTP status and decode either form. Raw provider errors, credentials and stack traces are not included. Server errors are logged once with safe request metadata, excluding query strings, request bodies and headers.

A Firebase initialization failure returns HTTP 503 with the same JSON envelope and the message `Service temporarily unavailable`, before Nest is available.

## OpenAPI

The generated [OpenAPI document](openapi.json) describes the same routes and DTOs for both mobile platforms. Run `npm run docs:generate` after changing request/response contracts. Generation creates a Nest application without an HTTP listener or external connections.

## Cache behavior

The raw Ovation dataset and its mapped coordinates are cached for 30 minutes in each function instance. Cache hits are served before any NOAA request. A cold nowcast downloads the Ovation dataset directly. Concurrent map/nowcast misses within one instance share one fetch; a failed fetch is cleared so later requests can retry. Different coordinates are computed from the shared dataset without globally caching a user-specific scalar. Separate Firebase instances maintain separate caches.

