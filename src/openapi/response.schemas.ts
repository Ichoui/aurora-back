import type { SchemaObject } from '@nestjs/swagger';

export const jsonObjectSchema: SchemaObject = { type: 'object', additionalProperties: true };
export const jsonArraySchema: SchemaObject = { type: 'array', items: jsonObjectSchema };
export const ovationSchema: SchemaObject = {
  oneOf: [
    { type: 'array', items: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3 } },
    { type: 'number', description: 'Probability for the requested coordinate' },
  ],
};
export const nowcastSchema: SchemaObject = {
  type: 'object',
  required: ['nowcast'],
  properties: { nowcast: { type: 'number', nullable: true } },
};
export const solarCycleSchema: SchemaObject = {
  type: 'array',
  items: {
    type: 'object',
    required: ['timeTag', 'predictedSsn', 'predictedSolarFlux'],
    properties: {
      timeTag: { type: 'string' },
      predictedSsn: { oneOf: [{ type: 'number' }, { type: 'string', nullable: true }] },
      predictedSolarFlux: { oneOf: [{ type: 'number' }, { type: 'string', nullable: true }] },
    },
  },
};
export const kpForecastSchema: SchemaObject = {
  type: 'array',
  items: {
    type: 'object',
    required: ['kpIndex', 'timeTag'],
    properties: { kpIndex: { type: 'number', nullable: true }, timeTag: { type: 'string' } },
  },
};
export const swpcSchema: SchemaObject = {
  type: 'object',
  required: ['forecastSolarCycle', 'forecastSolarWind', 'forecastKp', 'forecastTwentySevenDays', 'instantKp'],
  properties: {
    forecastSolarCycle: solarCycleSchema,
    forecastSolarWind: jsonArraySchema,
    forecastKp: kpForecastSchema,
    forecastTwentySevenDays: { type: 'string' },
    instantKp: { ...jsonObjectSchema, nullable: true },
  },
};
export const citySchema: SchemaObject = {
  type: 'object',
  required: ['id', 'name', 'countryCode', 'lat', 'long'],
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    countryCode: { type: 'string' },
    lat: { type: 'string' },
    long: { type: 'string' },
  },
};
export const legacyCitySchema: SchemaObject = {
  type: 'object',
  required: ['name', 'lat', 'lng', 'country', 'admin1', 'admin2'],
  properties: Object.fromEntries(['name', 'lat', 'lng', 'country', 'admin1', 'admin2'].map(name => [name, { type: 'string' }])),
};
